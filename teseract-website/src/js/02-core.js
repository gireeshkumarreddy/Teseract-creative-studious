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
    TS.observeReveal = el => { pending.add(el); if (isImage(el)) io.observe(el); else TS.afterIntro(() => io.observe(el)); };
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
    // is scrolled to (or cannot scroll past) its end, reveal whatever is on screen.
    let ticking = false;
    const atEnd = () => {
      ticking = false;
      if (TS.intro.held()) return;
      if (scrollY + innerHeight < document.documentElement.scrollHeight - 4) return;
      pending.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) { el.classList.add('is-in'); io.unobserve(el); pending.delete(el); }
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(atEnd); } }, { passive: true });
    addEventListener('load', atEnd);
    setTimeout(atEnd, 300);
    TS.afterIntro(atEnd);
  }

  /* ---------- Letter rolls on nav links and buttons (ZIP: 520ms per char, 12ms stagger) */
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
       <ul data-ticker-list> <li>…</li> … </ul></div> */
  function tickers() {
    document.querySelectorAll('[data-ticker]').forEach(t => {
      const list = t.querySelector('[data-ticker-list]');
      if (!list) return;
      const dir = t.dataset.direction || 'left';
      const vertical = dir === 'up' || dir === 'down';
      const forward = dir === 'down' || dir === 'right';
      const speed = parseFloat(t.dataset.speed) || 25;
      const hover = parseFloat(t.dataset.hover) || 1;
      const items = [...list.children];
      let anim = null, visible = false, hovering = false, lastSize = 0;
      const build = () => {
        list.querySelectorAll('[data-clone]').forEach(c => c.remove());
        if (!t.offsetParent || !(vertical ? t.clientHeight : t.clientWidth)) { if (anim) { anim.cancel(); anim = null; } return; } // hidden (e.g. a column off at this breakpoint): no clones, no downloads
        const gap = parseFloat(getComputedStyle(list)[vertical ? 'rowGap' : 'columnGap']) || 0;
        const first = items[0], last = items[items.length - 1];
        const start = vertical ? first.offsetTop : first.offsetLeft;
        const end = vertical ? last.offsetTop + last.offsetHeight : last.offsetLeft + last.offsetWidth;
        const setLen = end - start + gap;
        const size = vertical ? t.clientHeight : t.clientWidth;
        if (setLen <= gap) return;
        const copies = Math.max(1, Math.ceil(size / setLen) + 1);
        for (let c = 0; c < copies; c++) items.forEach(it => {
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
        if (anim) anim.cancel();
        if (TS.reduced()) return;
        const prop = vertical ? 'translateY' : 'translateX';
        const from = forward ? -setLen : 0, to = forward ? 0 : -setLen;
        anim = list.animate([{ transform: `${prop}(${from}px)` }, { transform: `${prop}(${to}px)` }],
          { duration: setLen / speed * 1000, iterations: Infinity, easing: 'linear' });
        anim.playbackRate = hovering ? hover : 1;
        if (!visible) anim.pause();
      };
      const rebuild = () => {
        const s = vertical ? t.clientHeight + list.scrollWidth : t.clientWidth + list.scrollHeight;
        if (Math.abs(s - lastSize) < 2 && anim) return;
        lastSize = s; build();
      };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (anim) visible ? anim.play() : anim.pause(); }).observe(t);
      if (hover !== 1) {
        t.addEventListener('pointerenter', () => { hovering = true; if (anim) anim.updatePlaybackRate ? anim.updatePlaybackRate(hover) : (anim.playbackRate = hover); });
        t.addEventListener('pointerleave', () => { hovering = false; if (anim) anim.updatePlaybackRate ? anim.updatePlaybackRate(1) : (anim.playbackRate = 1); });
      }
      let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(rebuild, 120); }).observe(t);
      items.forEach(it => it.querySelectorAll('img').forEach(im => { if (!im.complete) im.addEventListener('load', () => { clearTimeout(rt); rt = setTimeout(rebuild, 120); }, { once: true }); }));
      build();
      TS.tickers = (TS.tickers || []).concat({ el: t, get anim() { return anim; } });
    });
  }

  /* ---------- Motion control (WCAG 2.2.2): one shared pause / play toggle per [data-motion-scope]
     <section data-motion-scope> … <button class="motion-toggle" data-motion-toggle hidden>…</button> …
     (markup: chrome.motion_toggle(), look: .motion-toggle in 02-components.css). Shown only while motion is on.
     "Still" pauses the scope's tickers and other script animations (re-applied when the ticker runtime resumes one
     on viewport re-entry or rebuilds it), every CSS animation inside it (.is-still, 02-components.css) and its
     client videos ([data-video-hold], 06-video.js); a 'ts:motion' event (detail.still) lets section scripts stop
     their own timers, and TS.motionStill(el) tells whether el sits in a paused scope. Play resumes only what is on
     screen (the ticker runtime starts the rest as it comes into view). */
  TS.motionStill = el => !!(el && el.closest && el.closest('[data-motion-scope].is-still'));
  TS.motionToggle = btn => {
    const scope = btn && btn.closest('[data-motion-scope]');
    if (!scope || btn.dataset.motionReady) return;
    btn.dataset.motionReady = '1';
    if (!TS.motion()) return;                       // reduced motion / no motion: nothing moves, the control stays hidden
    const label = btn.querySelector('[data-motion-label]');
    const words = { pause: label ? label.textContent : 'Pause motion', play: btn.dataset.playLabel || 'Play motion' };
    const held = new Set();                        // script animations this control paused (resumed on Play)
    const scopeTickers = () => (TS.tickers || []).filter(t => scope.contains(t.el));
    const scripted = () => (scope.getAnimations ? scope.getAnimations({ subtree: true }) : [])
      .filter(a => a.constructor === Animation);  // WAAPI only: CSS animations follow animation-play-state (.is-still)
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
    let still = false;
    const hold = () => {
      if (!still) return;
      scripted().forEach(a => { if (a.playState === 'running') { a.pause(); held.add(a); } });
    };
    const set = on => {
      still = on;
      scope.classList.toggle('is-still', on);
      btn.classList.toggle('is-still', on);
      if (label) label.textContent = on ? words.play : words.pause;
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
    btn.hidden = false;
    btn.addEventListener('click', () => set(!still));
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
      // frosted bar behind the logo/menu button once the page has scrolled
      let raf = 0;
      const sync = () => { raf = 0; header.classList.toggle('is-scrolled', scrollY > 8); };
      addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
      sync();
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
    smoothScroll(); anchors(); reveals(); letterRolls(); tickers(); pageTransitions(); disabledLinks(); headerTone();
    document.querySelectorAll('[data-motion-toggle]').forEach(TS.motionToggle);   // after tickers(): TS.tickers is filled
    root.classList.add('is-ready');
  });
})();
