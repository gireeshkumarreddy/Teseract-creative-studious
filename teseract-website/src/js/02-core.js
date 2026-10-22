/* Core runtime: smooth scroll, reveals, split headings, letter rolls, tickers, page transitions.
   Exposes window.TS for section scripts. No framework; Lenis is the only vendored library. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const phoneMQ = matchMedia('(max-width: 799.98px)');
  const TS = window.TS = window.TS || {};
  TS.reduced = () => reducedMQ.matches;
  TS.motion = () => root.classList.contains('motion') && !reducedMQ.matches;
  TS.phone = () => phoneMQ.matches;
  TS.ready = fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn());
  // Intro logo animation (01-intro.js): entrances wait for the stage to lift; without an intro they run at once.
  TS.afterIntro = TS.afterIntro || (fn => fn());
  TS.intro = TS.intro || { active: () => false, held: () => false, skip() {} };

  /* ---------- Smooth scroll (reference: Lenis, duration 1s, desktop + tablet only) */
  function smoothScroll() {
    if (!window.Lenis || TS.reduced() || phoneMQ.matches || matchMedia('(pointer: coarse)').matches) return;
    const lenis = new window.Lenis({ duration: 1.0, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    TS.lenis = lenis;
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  TS.scrollTo = (target, opts = {}) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el && typeof target !== 'number') return;
    if (el && el.matches && el.matches('[data-reveal]:not(.is-in)')) {
      // an unrevealed target is still offset by its --y translate: reveal it instantly before measuring
      el.style.transition = 'none'; el.classList.add('is-in'); void el.offsetHeight; el.style.transition = '';
    }
    const offset = opts.offset != null ? opts.offset : -(parseFloat(getComputedStyle(root).scrollPaddingTop) || 96);
    if (TS.lenis) TS.lenis.scrollTo(el || target, { offset, duration: opts.duration || 1.2 });
    else {
      const y = typeof target === 'number' ? target : el.getBoundingClientRect().top + scrollY + offset;
      scrollTo({ top: y, behavior: TS.reduced() ? 'auto' : 'smooth' });
    }
  };

  TS.lockScroll = on => {
    root.classList.toggle('is-locked', on);
    if (TS.lenis) on ? TS.lenis.stop() : TS.lenis.start();
  };

  /* In-page anchors use the smooth scroller and keep focus management sane. */
  function anchors() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href*="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      TS.scrollTo(el);
      history.pushState(null, '', url.hash);
      if (el.id === 'main') el.focus({ preventScroll: true });
    });
  }

  /* ---------- Split headings into words (keeps inline markup such as <em>, <s>, <br>). */
  function split(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.className = 'w__i'; inner.style.setProperty('--i', i++);
            inner.textContent = part; w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.matches('svg,img')) walk(child);
      });
    };
    walk(el);
  }

  /* ---------- Reveal on scroll ([data-reveal], [data-split], .reveal-image, [data-clip]) */
  function reveals() {
    document.querySelectorAll('[data-stagger]').forEach(group => {
      const step = parseFloat(group.dataset.stagger) || 80;
      const base = parseFloat(group.dataset.staggerBase) || 0;
      group.querySelectorAll('[data-reveal]').forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${base + i * step}ms`); });
    });
    const els = [...document.querySelectorAll('[data-reveal], [data-split], .reveal-image, [data-clip]')];
    if (TS.motion()) document.querySelectorAll('[data-split]').forEach(split);
    if (!TS.motion() || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const img = el.matches('.reveal-image') && el.querySelector('img');
      let done = false;
      const go = () => { if (!done) { done = true; el.classList.add('is-in'); } };
      if (img && !img.complete && img.decode) { img.decode().then(go, go); setTimeout(go, 1200); } else go();  // never wait forever on a slow image
      io.unobserve(el);
      pending.delete(el);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    const pending = new Set(els);
    // Images reveal under the intro stage (they paint at first paint: LCP unchanged); copy, headings and frames wait
    // for the stage to lift so their entrances are seen (01-intro.js; immediate without an intro).
    const isImage = el => el.matches('.reveal-image');
    els.filter(isImage).forEach(el => io.observe(el));
    const held = els.filter(el => !isImage(el));
    TS.afterIntro(() => held.forEach(el => { if (pending.has(el)) io.observe(el); }));
    // (TS.observeReveal, for elements made later - ticker clones: below, with the end-of-page check it re-arms.)
    // Keyboard users can tab into a section before it has scrolled into reveal range: reveal the
    // focused element's [data-reveal]/[data-split]/.reveal-image ancestors at once so focus rings never sit on faded controls.
    document.addEventListener('focusin', e => {
      let n = e.target;
      while (n && n !== document.body) {
        if (n.matches && n.matches('[data-reveal]:not(.is-in), [data-split]:not(.is-in), .reveal-image:not(.is-in)')) {
          n.style.setProperty('--d', '0ms'); n.classList.add('is-in'); io.unobserve(n); pending.delete(n);
        }
        n = n.parentElement;
      }
    });
    // Elements in the last few % of the page can never cross the shrunken root margin: once the page
    // is scrolled to (or cannot scroll past) its end, reveal whatever is on screen. Checked in a frame, reading before
    // anything is written (at load time it ran inside app.js's first task and laid the whole page out there: ~1.3 s at
    // 4x CPU on a phone), against the page height a ResizeObserver keeps (scrollHeight in every scroll frame), never
    // at the top of a page taller than two screens, only while the footer (the page's end) is on screen (so not before
    // its observer first reports: at load the check read the layout in the first frame of every page), and the scroll
    // listener goes once nothing waits.
    let ticking = false, listening = false, pageH = 0, nearEnd = false;
    const atEnd = () => {
      ticking = false;
      if (TS.intro.held()) return;
      pending.forEach(el => { if (el.classList.contains('is-in')) { io.unobserve(el); pending.delete(el); } });   // opened meanwhile (the hero gallery opens its own)
      if (!pending.size) { listen(false); return; }
      const y = scrollY, vh = innerHeight, h = pageH || root.scrollHeight;
      if ((!y && h > 2 * vh) || y + vh < h - 4) return;
      const shown = [...pending].filter(el => { const r = el.getBoundingClientRect(); return r.top < vh && r.bottom > 0; });
      shown.forEach(el => { el.classList.add('is-in'); io.unobserve(el); pending.delete(el); });
      if (!pending.size) listen(false);
    };
    const request = () => { if (!ticking && nearEnd) { ticking = true; requestAnimationFrame(atEnd); } };
    const end = document.getElementById('footer') || document.body.lastElementChild;
    if (end) new IntersectionObserver(([e]) => { nearEnd = e.isIntersecting; request(); }).observe(end);
    else nearEnd = true;
    const listen = on => {
      if (on === listening) return;
      listening = on;
      if (on) addEventListener('scroll', request, { passive: true }); else removeEventListener('scroll', request);
    };
    TS.observeReveal = el => { pending.add(el); listen(true); if (isImage(el)) io.observe(el); else TS.afterIntro(() => io.observe(el)); };
    if ('ResizeObserver' in window) new ResizeObserver(() => { pageH = root.scrollHeight; }).observe(root);   // read after layout: free
    listen(true);
    addEventListener('load', request);
    setTimeout(request, 300);
    TS.afterIntro(request);
  }

  /* ---------- Letter rolls on nav links and buttons (ZIP: 520ms per char, 12ms stagger). After the first paint (the home
     page's ~1,500 letters were made and laid out in app.js's first task); until then a hover or focus rolls the whole
     line (02-components.css: .roll without .has-chars). */
  function letterRolls() {
    if (!TS.motion()) return;
    document.querySelectorAll('.btn .roll, .nav-link .roll, [data-letter-roll] .roll').forEach(roll => {
      if (roll.classList.contains('has-chars')) return;
      roll.classList.add('has-chars');
      [...roll.children].forEach(line => {
        const text = line.textContent;
        line.replaceChildren(...[...text].map((ch, i) => {
          const s = document.createElement('span'); s.className = 'char'; s.style.setProperty('--i', i);
          s.textContent = ch === ' ' ? ' ' : ch; return s;
        }));
      });
    });
  }

  /* ---------- Tickers (reference Framer Ticker: WAAPI translate loop, pause off-screen, hover slow-down)
     <div data-ticker data-direction="left|right|up|down" data-speed="25" data-hover="0.8">
       <ul data-ticker-list> <li>…</li> … </ul></div>
     The first build comes after the first paint (a frame, then a task): TS.beforeTickers(fn) runs fn first (the hero's
     stand-ins come in there, 20-hero.js), then every ticker is measured (one layout). A ticker on screen gets its loop
     at once, in that task, with the clones the loop shows first (steps(), below); the rest of its copies and the
     tickers off screen follow a few clones at a time, in short tasks, and TS.afterTickers(fn) runs fn once every ticker
     is built. (Built inside app.js's first task, each ticker's measure laid out what the one before
     had just cloned: the home page on a phone, 4x CPU, ~1 s in one task. 21 Oct: all of it in short tasks, a frame
     after the stand-ins, kept a tablet's gallery on screen at load still for 1.2-2 s after the first paint at 4x CPU.)
     A resize, the images of a ticker once they have all loaded, or a late web font rebuild it only if its measure
     changed (it used to rebuild every ticker once just after the start). */
  const prep = [], built = [];
  let tickersBuilt = false;
  const runAll = fns => fns.splice(0).forEach(fn => { try { fn(); } catch (e) { setTimeout(() => { throw e; }); } });
  TS.beforeTickers = fn => { if (tickersBuilt) fn(); else prep.push(fn); };
  TS.afterTickers = fn => { if (tickersBuilt) fn(); else built.push(fn); };
  TS.afterPaint = fn => requestAnimationFrame(() => setTimeout(fn, 0));
  function tickers() {
    const all = [];
    document.querySelectorAll('[data-ticker]').forEach(t => {
      const list = t.querySelector('[data-ticker-list]');
      if (!list) return;
      const dir = t.dataset.direction || 'left';
      const vertical = dir === 'up' || dir === 'down';
      const forward = dir === 'down' || dir === 'right';
      const speed = parseFloat(t.dataset.speed) || 25;
      const hover = parseFloat(t.dataset.hover) || 1;
      const items = [...list.children];
      let anim = null, visible = false, hovering = false, made = false, missed = false, last = null;
      // read: null while hidden (e.g. a column off at this breakpoint); starts: where each item begins in the strip
      const measure = () => {
        const size = vertical ? t.clientHeight : t.clientWidth;
        if (!t.offsetParent || !size) return null;
        const gap = parseFloat(getComputedStyle(list)[vertical ? 'rowGap' : 'columnGap']) || 0;
        const first = items[0], end = items[items.length - 1];
        const a = vertical ? first.offsetTop : first.offsetLeft;
        const b = vertical ? end.offsetTop + end.offsetHeight : end.offsetLeft + end.offsetWidth;
        let at = 0;                                  // (an item this screen hides takes no room)
        const starts = items.map(it => (it.offsetParent ? (at = (vertical ? it.offsetTop : it.offsetLeft) - a) : at));
        return { gap, size, setLen: b - a + gap, side: vertical ? list.scrollWidth : list.scrollHeight, starts };
      };
      const moved = (m, o) => ['size', 'setLen', 'side'].some(k => Math.abs(m[k] - o[k]) >= 2);
      const copy = part => part.forEach(it => {
        const cl = it.cloneNode(true);
        cl.setAttribute('aria-hidden', 'true'); cl.setAttribute('data-clone', '');
        cl.querySelectorAll('a,button,[tabindex]').forEach(x => x.setAttribute('tabindex', '-1'));
        cl.querySelectorAll('img').forEach(im => im.setAttribute('loading', 'eager'));
        list.appendChild(cl);
        if (TS.observeVideos && cl.querySelector('[data-video]')) TS.observeVideos(cl);   // client video tiles (06-video.js)
        // clones are created after reveals() ran: hand their reveal targets to the observer
        [cl, ...cl.querySelectorAll('.reveal-image, [data-reveal]')].forEach(el => {
          if (!el.matches || !el.matches('.reveal-image, [data-reveal]') || el.classList.contains('is-in')) return;
          if (TS.observeReveal) TS.observeReveal(el); else el.classList.add('is-in');
        });
      });
      // write, as steps: the clones and the loop, for a measure. The loop only ever shows the strip and one ticker length
      // past it (it runs over [0, setLen + size]). Moving forward (down / right) it starts at that far end: the clones
      // that reach into it come first, with the loop (lead). Moving back it starts on the strip and reaches them only
      // after (setLen - size) / speed: the loop comes first. The rest of the copies follow, three tiles a step.
      const steps = m => {
        last = m;
        const lead = [() => list.querySelectorAll('[data-clone]').forEach(c => c.remove())], rest = [];
        if (!m) { lead.push(() => { if (anim) { anim.cancel(); anim = null; } }); return { lead, rest }; }   // hidden: no clones, no downloads
        const { gap, size, setLen, starts } = m;
        if (setLen <= gap) return { lead, rest };
        const need = Math.ceil(size / setLen), cut = size - (need - 1) * setLen;   // cut: px of the last needed copy shown
        const seq = [];
        for (let c = 0; c <= need; c++) seq.push(...items);
        const early = forward || (setLen - size) / speed < 3 ? (need - 1) * items.length + starts.filter(s => s < cut + 2).length : 0;
        if (early) lead.push(() => copy(seq.slice(0, early)));
        for (let i = early; i < seq.length; i += 3) { const part = seq.slice(i, i + 3); rest.push(() => copy(part)); }
        lead.push(() => {
          if (anim) anim.cancel();
          if (TS.reduced()) return;
          const prop = vertical ? 'translateY' : 'translateX';
          const from = forward ? -setLen : 0, to = forward ? 0 : -setLen;
          anim = list.animate([{ transform: `${prop}(${from}px)` }, { transform: `${prop}(${to}px)` }],
            { duration: setLen / speed * 1000, iterations: Infinity, easing: 'linear' });
          anim.playbackRate = hovering ? hover : 1;
          if (!visible) anim.pause();
        });
        return { lead, rest };
      };
      const rebuild = () => {
        if (!made) { missed = true; return; }        // the first build is under way: checked again once it is done
        const m = measure();
        if (m && last ? !moved(m, last) : !m === !last) return;
        const s = steps(m);
        s.lead.concat(s.rest).forEach(f => f());
      };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (anim) visible ? anim.play() : anim.pause(); }).observe(t);
      if (hover !== 1) {
        t.addEventListener('pointerenter', () => { hovering = true; if (anim) anim.updatePlaybackRate ? anim.updatePlaybackRate(hover) : (anim.playbackRate = hover); });
        t.addEventListener('pointerleave', () => { hovering = false; if (anim) anim.updatePlaybackRate ? anim.updatePlaybackRate(1) : (anim.playbackRate = 1); });
      }
      let rt;
      const later = () => { clearTimeout(rt); rt = setTimeout(rebuild, 120); };
      new ResizeObserver(later).observe(t);
      const loading = items.flatMap(it => [...it.querySelectorAll('img')]).filter(im => !im.complete);
      if (loading.length) Promise.all(loading.map(im => new Promise(done => { im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); }))).then(later);
      all.push({ el: t, measure, steps, later, done: () => { made = true; if (missed) later(); } });
      // adopt(): the loop was re-timed from outside (a stand-in let in, 20-hero.js): the list as it is now counts as built
      TS.tickers = (TS.tickers || []).concat({ el: t, get anim() { return anim; }, adopt() { if (made && last) last = measure() || last; } });
    });
    TS.afterPaint(() => {
      runAll(prep);
      const vh = innerHeight;                        // the reads (one layout), then the writes
      const plan = all.map(k => { const m = k.measure(), r = k.el.getBoundingClientRect(); return { k, s: k.steps(m), on: !!m && r.bottom > 0 && r.top < vh }; });
      plan.forEach(p => { if (p.on) runAll(p.s.lead); });   // the loops on screen start now
      const queue = plan.flatMap(p => (p.on ? [] : p.s.lead).concat(p.s.rest, p.k.done));
      const run = () => {                            // short tasks: steps until ~20 ms are used
        const t0 = performance.now();
        while (queue.length && performance.now() - t0 < 20) runAll([queue.shift()]);
        if (queue.length) { setTimeout(run, 0); return; }
        tickersBuilt = true;
        runAll(prep);                                // (any added meanwhile)
        runAll(built);
        // a late web font resizes a text strip (read here: document.fonts laid the page out in app.js's first task)
        if (all.length && document.fonts && document.fonts.ready) document.fonts.ready.then(() => all.forEach(k => k.later()));
      };
      setTimeout(run, 0);
    });
  }

  /* ---------- Motion control (WCAG 2.2.2): one shared pause / play toggle per [data-motion-scope]
     <section data-motion-scope> … <button class="motion-toggle" data-motion-toggle hidden>…</button> …
     (markup: chrome.motion_toggle(), look: .motion-toggle in 02-components.css). Shown only while motion is on.
     "Still" pauses the scope's tickers and other script animations (re-applied when the ticker runtime resumes one
     on viewport re-entry or rebuilds it), every CSS animation inside it (.is-still, 02-components.css) and its
     client videos ([data-video-hold], 06-video.js); a 'ts:motion' event (detail.still) lets section scripts stop
     their own timers, and TS.motionStill(el) tells whether el sits in a paused scope. Play resumes only what is on
     screen (the ticker runtime starts the rest as it comes into view).
     Autoplay refused (iOS Low Power Mode, a browser's no-autoplay setting: 06-video.js fires 'ts:videoblocked') while
     the scope moves: until the visitor's first tap on the control it offers its Play state ("Play motion") without
     pausing anything, and that tap plays the scope's clips that are on screen or were refused, inside the tap (a
     gesture may; TS.playVideo). After a tap the control only follows the motion ("Pause motion" while the tickers move,
     so its next tap always pauses: 21 Oct, a clip refused as a column brought it in turned it back to Play, and a
     visitor trying to stop the gallery needed two or three taps); a clip refused then plays at the visitor's next tap,
     key press or click anywhere in the scope, and Play after a pause plays it too. Not under Save-Data: there the clips
     keep their posters (owner, 17 Oct). */
  TS.motionStill = el => !!(el && el.closest && el.closest('[data-motion-scope].is-still'));
  TS.motionToggle = btn => {
    const scope = btn && btn.closest('[data-motion-scope]');
    if (!scope || btn.dataset.motionReady) return;
    btn.dataset.motionReady = '1';
    if (!TS.motion()) return;                       // reduced motion / no motion: nothing moves, the control stays hidden
    const label = btn.querySelector('[data-motion-label]');
    const words = { pause: label ? label.textContent : 'Pause motion', play: btn.dataset.playLabel || 'Play motion' };
    const held = new Set();                        // script animations this control paused (resumed on Play)
    const refused = new Set();                     // clips whose autoplay was refused (until they play)
    const scopeTickers = () => (TS.tickers || []).filter(t => scope.contains(t.el));
    const scripted = () => (scope.getAnimations ? scope.getAnimations({ subtree: true }) : [])
      .filter(a => a.constructor === Animation);  // WAAPI only: CSS animations follow animation-play-state (.is-still)
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
    let still = false, offer = false, tapped = false;   // offer: Play shown for refused clips, nothing paused (until a tap)
    const paint = () => {
      const play = still || offer;
      btn.classList.toggle('is-still', play);
      if (label) label.textContent = play ? words.play : words.pause;
    };
    const hold = () => {
      if (!still) return;
      scripted().forEach(a => { if (a.playState === 'running') { a.pause(); held.add(a); } });
    };
    const set = on => {
      still = on;
      offer = false;
      scope.classList.toggle('is-still', on);
      paint();
      if (scope.querySelector('[data-video]')) {    // client video tiles pause with the rest of the scope
        scope.toggleAttribute('data-video-hold', on);
        if (TS.syncVideos) TS.syncVideos(scope);
      }
      if (on) hold();
      else {
        const tickers = scopeTickers();
        tickers.forEach(t => { if (t.anim && !t.el.contains(document.activeElement) && onScreen(t.el)) t.anim.play(); });
        held.forEach(a => { if (!tickers.some(t => t.anim === a) && a.playState === 'paused') a.play(); });
        held.clear();
      }
      scope.dispatchEvent(new CustomEvent('ts:motion', { detail: { still: on } }));
    };
    // a clip shown in its (clipping) ticker column, or on screen
    const showing = v => {
      const r = v.getBoundingClientRect(), c = (v.closest('[data-ticker]') || v).getBoundingClientRect();
      return r.width > 0 && r.bottom > Math.max(0, c.top) && r.top < Math.min(innerHeight, c.bottom);
    };
    const playClips = shown => {                   // the refused clips (and with shown, every clip showing)
      const clips = [...scope.querySelectorAll('[data-video]')].filter(v => refused.has(v) || (shown && showing(v)));
      refused.clear();
      clips.forEach(v => TS.playVideo(v).then(ok => { if (ok && TS.syncVideos) TS.syncVideos(v); }));   // (one off screen pauses again)
    };
    btn.hidden = false;
    btn.addEventListener('click', () => {
      tapped = true;
      const play = offer || (still && refused.size);
      set(play ? false : !still);
      if (play && TS.playVideo) playClips(true);
    });
    if (scope.querySelector('[data-video]')) {
      const saveData = () => !!(navigator.connection && navigator.connection.saveData);
      scope.addEventListener('ts:videoblocked', e => {
        if (saveData()) return;
        refused.add(e.target);
        if (!still && !offer && !tapped) { offer = true; paint(); }
      });
      scope.addEventListener('playing', e => {
        refused.delete(e.target);
        if (offer && !refused.size) { offer = false; paint(); }   // all played (a gesture elsewhere in the scope)
      }, true);
      // any other gesture in the scope (the control's own taps decide for themselves) plays the refused clips while it moves
      const retry = e => { if (refused.size && !still && TS.playVideo && !btn.contains(e.target)) playClips(false); };
      ['touchend', 'click', 'keydown'].forEach(type => scope.addEventListener(type, retry, { capture: true, passive: true }));
    }
    // the ticker runtime resumes an animation when it re-enters the viewport (its observer may run after this one,
    // so wait a frame) and replaces it when it rebuilds the clones: pause it again while still
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(() => { hold(); requestAnimationFrame(hold); });
      scopeTickers().forEach(t => io.observe(t.el));
    }
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(() => requestAnimationFrame(hold));
      scope.querySelectorAll('[data-ticker-list]').forEach(list => mo.observe(list, { childList: true }));
    }
  };

  /* ---------- Page transitions (ZIP leave-shade 220ms + enter fade) */
  function pageTransitions() {
    try {
      if (sessionStorage.getItem('ts-nav') === '1' && TS.motion()) {
        root.classList.add('is-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-entering')));
      }
      sessionStorage.removeItem('ts-nav');
    } catch (e) { /* storage blocked */ }
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target || link.hasAttribute('download') || link.getAttribute('aria-disabled') === 'true') return;
      const next = new URL(link.href, location.href);
      if (!['http:', 'https:', 'file:'].includes(next.protocol) || next.origin !== location.origin || (next.pathname === location.pathname && next.hash) || next.pathname === location.pathname || !TS.motion()) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      try { sessionStorage.setItem('ts-nav', '1'); } catch (err) { /* ignore */ }
      setTimeout(() => location.assign(next.href), 240);
    });
    window.addEventListener('pageshow', ev => { if (ev.persisted) document.body.classList.remove('is-leaving'); });
  }

  /* ---------- Disabled placeholder links (unconfigured socials) */
  function disabledLinks() {
    document.addEventListener('click', e => { const a = e.target.closest('a[aria-disabled="true"]'); if (a) e.preventDefault(); });
  }

  /* ---------- Header: dark variant while a [data-nav-dark] section sits under it (reference footer behaviour) */
  function headerTone() {
    const header = document.querySelector('[data-header]');
    if (header) {
      // frosted bar behind the logo/menu button once the page has scrolled (first set in a frame: read at load time,
      // scrollY laid the page out inside app.js's first task)
      let raf = 0;
      const sync = () => { raf = 0; header.classList.toggle('is-scrolled', scrollY > 8); };
      const request = () => { if (!raf) raf = requestAnimationFrame(sync); };
      addEventListener('scroll', request, { passive: true });
      request();
    }
    const darks = document.querySelectorAll('[data-nav-dark]');
    if (!header || !darks.length) return;
    const state = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => state.set(en.target, en.isIntersecting));
      header.classList.toggle('is-dark', [...state.values()].some(Boolean));
    }, { rootMargin: '0px 0px -92% 0px', threshold: 0 });
    darks.forEach(d => io.observe(d));
  }

  TS.ready(() => {
    // (letter rolls after the tickers' first task: their ~1,500 letters would make its reads lay them out)
    smoothScroll(); anchors(); reveals(); tickers(); TS.afterPaint(letterRolls); pageTransitions(); disabledLinks(); headerTone();
    document.querySelectorAll('[data-motion-toggle]').forEach(TS.motionToggle);   // after tickers(): TS.tickers is filled
    root.classList.add('is-ready');
  });
})();
