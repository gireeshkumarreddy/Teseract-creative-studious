/* Home hero: load-time appear, rotating statement pill, gallery reveal and keyboard support.
   Tickers (marquee + gallery columns), [data-reveal] and the hero's pause control (WCAG 2.2.2: the section is a
   [data-motion-scope] with the shared toggle, TS.motionToggle) come from 02-core.js. */
(() => {
  'use strict';
  const TS = window.TS || {};
  if (!TS.ready) return;

  /* "Still" = the visitor paused the hero motion with the gallery control (02-core.js; 'ts:motion' on the hero). */
  const still = el => !!(TS.motionStill && TS.motionStill(el));
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
  const headerBottom = () => {
    const h = document.querySelector('[data-header]');
    return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
  };

  /* Above-the-fold appear (reference §9): fire on load rather than waiting for the scroll
     observer, so short viewports still get the full nav → H1 → copy → CTAs → badge → marquee
     cascade. Two frames guarantee a styled "before" state so the transitions run. */
  function appear(hero) {
    if (!TS.motion()) return;
    const els = hero.querySelectorAll('[data-appear]');
    const reveal = () => els.forEach(el => el.classList.add('is-in'));
    // Late script (slow network): the CSS fail-safe fade (20-hero.css, 2.5s) may already show the
    // copy. Reveal in the same style change that ends it, so nothing drops back and replays.
    const now = document.timeline && document.timeline.currentTime;
    if (now != null && now > 2400 && !TS.intro.held()) { reveal(); return; }
    // behind the intro stage the cascade waits for it to lift (01-intro.js; immediate without an intro)
    TS.afterIntro(() => requestAnimationFrame(() => requestAnimationFrame(reveal)));
  }

  /* Statement pill: 2000ms per slide; the active row rolls up/out (rotateX 50°) while the next
     rolls in from below (rotateX −50°) with a 500ms cubic-bezier(.44,0,.56,1) tween (CSS).
     Runs only while visible, the tab is shown and the hero motion is not paused; static first
     slide under reduced motion. */
  function pill(hero) {
    const slot = hero.querySelector('[data-hero-pill]');
    if (!slot || !TS.motion()) return;
    const rows = [...slot.querySelectorAll('.hero-pill__row')];
    if (rows.length < 2) return;
    let i = 0, timer = 0, visible = true;
    const step = () => {
      const cur = rows[i], next = rows[(i + 1) % rows.length];
      rows.forEach(r => {
        if (r !== cur && r.classList.contains('is-prev')) { r.classList.add('is-snap'); r.classList.remove('is-prev'); }
      });
      void slot.offsetWidth;                         // commit the snapped (parked) rows without a transition
      rows.forEach(r => r.classList.remove('is-snap'));
      cur.classList.remove('is-active'); cur.classList.add('is-prev');
      next.classList.add('is-active');
      i = (i + 1) % rows.length;
    };
    const run = () => {
      clearInterval(timer); timer = 0;
      if (visible && !document.hidden && !still(slot)) timer = setInterval(step, 2000);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(slot);
    } else run();
    document.addEventListener('visibilitychange', run);
    hero.addEventListener('ts:motion', run);
  }

  /* Gallery: open every tile (originals and the ticker's aria-hidden clones) together the first
     time the frame enters the viewport — ZIP scale 1.1→1 + fade, columns staggered in CSS. */
  function gallery(hero) {
    const frame = hero.querySelector('[data-hero-gallery]');
    if (!frame) return;
    const openAll = () => frame.querySelectorAll('.reveal-image:not(.is-in)').forEach(el => el.classList.add('is-in'));
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      frame.classList.add('is-revealing');
      openAll();
      setTimeout(() => frame.classList.remove('is-revealing'), 1800);   // drop the stagger so hover zoom is immediate
    };
    if (TS.motion() && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); reveal(); } }, { threshold: 0.01 });
      io.observe(frame);
    } else reveal();
    /* Lead tiles (row 0, 20-hero.css) enter in CSS from the first paint. A ticker clone is a new element and would
       start that entrance over (a 'down' column shows a clone in its lead's place as soon as it runs), so each clone
       joins its original's timeline, or skips to the end once the original has finished. */
    const syncLeads = () => frame.querySelectorAll('[data-ticker-list]').forEach(list => {
      const lead = list.querySelector(':scope > :not([data-clone]) .hero-tile__media--lead img');
      const own = lead && lead.getAnimations ? lead.getAnimations() : [];
      list.querySelectorAll(':scope > [data-clone] .hero-tile__media--lead img').forEach(img => {
        if (img.dataset.leadSync || !img.getAnimations) return;
        img.dataset.leadSync = '1';
        img.getAnimations().forEach(a => {
          const o = own.find(x => x.animationName === a.animationName);
          if (o && o.currentTime != null) a.currentTime = o.currentTime; else a.finish();
        });
      });
    });
    syncLeads();                                   // tickers() (02-core.js) has made the first clones already
    // Ticker rebuilds (resize / late image load) re-clone the items; open new clones once revealed. A clone of the first
    // tile drops the margin standIns() may have given that tile (the loop's start only).
    const unshift = () => frame.querySelectorAll('[data-ticker-list] > [data-clone][style]').forEach(c => { c.style.marginTop = ''; });
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(() => { unshift(); syncLeads(); if (revealed) openAll(); });
      frame.querySelectorAll('[data-ticker-list]').forEach(list => mo.observe(list, { childList: true }));
    }

    /* Hover caption: tiles keep moving (slowed) and are often cut by the frame or viewport edge,
       so while hovered the caption is lifted to stay inside the tile's visible part. */
    let capTile = null, capRaf = 0;
    const capTick = () => {
      if (!capTile) { capRaf = 0; return; }
      const cap = capTile.querySelector('.hero-tile__cap');
      const col = capTile.closest('.hero-col');
      if (cap && col) {
        const t = capTile.getBoundingClientRect(), c = col.getBoundingClientRect();
        const visTop = Math.max(t.top, c.top, 0), visBottom = Math.min(t.bottom, c.bottom, innerHeight);
        const room = visBottom - visTop - cap.offsetHeight - 20;
        const lift = room > 0 ? Math.min(Math.max(0, t.bottom - visBottom), t.bottom - visTop - cap.offsetHeight - 20) : 0;
        cap.style.setProperty('--cap-lift', `${Math.max(0, Math.round(lift))}px`);
      }
      capRaf = requestAnimationFrame(capTick);
    };
    frame.addEventListener('pointerover', e => {
      const tile = e.target.closest('.hero-tile');
      if (tile === capTile || e.pointerType === 'touch') return;
      capTile = tile;
      if (capTile && !capRaf) capRaf = requestAnimationFrame(capTick);
    });
    frame.addEventListener('pointerleave', () => { capTile = null; });

    /* Keyboard: a focused tile pauses its column and is moved to the middle of the column's
       visible part (columns clip with overflow:clip, so focus can never scroll them); if the
       column is mostly off-screen the page is scrolled to the tile. The column resumes when
       focus leaves it. Under reduced motion (static columns) the list is shifted instead. */
    const tickerOf = col => (TS.tickers || []).find(t => t.el === col);
    const parse = kf => parseFloat(String(kf.transform).replace(/[^-\d.]+/g, ' ').trim().split(' ').pop()) || 0;
    const keyboardFocus = el => { try { return el.matches(':focus-visible'); } catch (err) { return true; } };
    frame.addEventListener('focusin', e => {
      // Keyboard focus only: a mouse press also focuses the link, and moving the tile between
      // mousedown and mouseup would turn the click into a miss.
      if (!keyboardFocus(e.target)) return;
      const tile = e.target.closest('.hero-tile');
      const col = tile && tile.closest('[data-ticker]');
      const list = col && col.querySelector('[data-ticker-list]');
      if (!list) return;
      const item = tile.parentElement;
      const t = tickerOf(col);
      const anim = t && t.anim;
      if (anim) anim.pause();
      const c = col.getBoundingClientRect();
      const visTop = Math.max(c.top, headerBottom()), visBottom = Math.min(c.bottom, innerHeight);
      const ih = item.offsetHeight;
      const centre = visBottom - visTop >= ih + 32 ? (visTop + visBottom) / 2 - c.top : col.clientHeight / 2;
      const offset = item.offsetTop - list.offsetTop;                      // item top inside the list at translate 0
      let target = centre - ih / 2 - offset;                               // list translate that puts it there
      if (anim && anim.effect) {
        const kfs = anim.effect.getKeyframes();
        const dur = anim.effect.getTiming().duration;
        if (kfs.length >= 2 && typeof dur === 'number') {
          const from = parse(kfs[0]), to = parse(kfs[kfs.length - 1]);
          target = Math.min(Math.max(target, Math.min(from, to)), Math.max(from, to));
          // an infinite animation wraps at currentTime === duration, so stay just inside it
          if (to !== from) anim.currentTime = Math.min(Math.max(((target - from) / (to - from)) * dur, 0), dur - 1);
        }
      } else {
        target = Math.min(0, Math.max(target, col.clientHeight - list.scrollHeight));
        list.style.transform = `translateY(${target}px)`;
      }
      // After the browser's own focus scroll: bring the tile fully into view below the header.
      requestAnimationFrame(() => {
        if (document.activeElement !== e.target) return;
        const r = tile.getBoundingClientRect(), top = headerBottom() + 12, bottom = innerHeight - 12;
        if (r.top >= top && r.bottom <= bottom) return;
        const delta = r.top < top || r.height > bottom - top ? r.top - top : r.bottom - bottom;
        const y = scrollY + delta;
        if (TS.lenis) TS.lenis.scrollTo(y, { duration: 0.6, immediate: TS.reduced() });
        else scrollTo({ top: y, behavior: TS.reduced() ? 'auto' : 'smooth' });
      });
    });
    frame.addEventListener('focusout', e => {
      const col = e.target.closest('[data-ticker]');
      if (!col || col.contains(e.relatedTarget)) return;
      const t = tickerOf(col);
      if (t && t.anim && !TS.reduced() && !still(col) && inView(col)) t.anim.play();
    });
  }

  /* Stand-ins (home_hero._columns): where a screen hides a column, its projects' tiles are repeated in the columns
     still shown, so every project is on every screen. With motion they sit out the first layout (20-hero.css), and
     a pass at the page's start, then idle moments, let them in (the clips first: owner, 17 Oct, the landing pages and
     the tiger move on phones too), each only while none of its places in the column (the tile and the ticker's copies
     of it, which share its .is-on) is on screen, and the column's ticker takes the longer loop from where it is. For a
     visitor at the top of the page (the gallery below the fold, or the top of its first tiles on screen) that is all of
     them at the start (18 Oct: they waited for load and the ticker's first rebuild, and a visitor who had scrolled to
     the gallery by then found it on screen, where each one waited for its place to leave it, up to ~40 s on a phone;
     that is still so with the gallery on screen at the start - a restored scroll). Stand-ins this screen does not
     show (another width, a hidden column) are let in at once: the ticker's own rebuild on resize picks them up. */
  /* A stand-in's image waits in <noscript> (home_hero._item) until its tile is let in, so neither it nor the ticker's
     copies of it download anything before; one let in before load waits for load (or for the gallery to come on
     screen first), so it never competes with the page's first images. Then they load at once (eager, as the ticker's
     own copies: a lazy image beyond the column's clip would only start as it scrolls into view). A clip's stand-in
     plays the clip: its <video> comes from the inert <template data-clip> after the <noscript> poster frame instead,
     and 06-video.js loads and plays it only while it is on screen (its poster, under reduced motion / Save-Data). */
  const unwrap = (li, eager) => {
    li.querySelectorAll('noscript').forEach(ns => {
      const clip = ns.nextElementSibling;
      if (clip && clip.matches('template[data-clip]')) { ns.replaceWith(clip.content.cloneNode(true)); clip.remove(); return; }
      const tpl = document.createElement('template');
      tpl.innerHTML = ns.textContent;
      if (eager) tpl.content.querySelectorAll('img').forEach(im => im.setAttribute('loading', 'eager'));
      ns.replaceWith(tpl.content);
    });
    if (TS.observeVideos && li.querySelector('[data-video]')) TS.observeVideos(li);
  };
  function standIns(frame) {
    const clip = li => !!li.querySelector('template[data-clip]');
    const left = [...frame.querySelectorAll('[data-ticker-list] > :not([data-clone]):is(.hero-col__item--lt1440,.hero-col__item--lt800)')]
      .sort((a, b) => clip(b) - clip(a));             // the clips first (a stable sort: DOM order within each)
    if (!left.length) return;
    const narrow = { lt1440: matchMedia('(max-width: 1439.98px)'), lt800: matchMedia('(max-width: 799.98px)') };
    const parse = kf => parseFloat(String(kf.transform).replace(/[^-\d.]+/g, ' ').trim().split(' ').pop());
    // px kept clear around the visible part: a frame of the ticker's drift (under 1px; mid-scroll nothing comes in). 18 Oct:
    // was 24, which on a 412-430px phone at the top of the page held back column 1's second tile, a few px below the fold.
    const MARGIN = 4;
    // Images of stand-ins let in before load: put in at load, or as soon as the gallery comes on screen before it.
    let early = document.readyState !== 'complete';
    const fill = () => {
      if (!early) return;
      early = false;
      frame.querySelectorAll('[data-ticker-list] > .is-on').forEach(li => { if (li.querySelector('noscript')) unwrap(li, !!li.offsetParent); });
    };
    if (early) {
      addEventListener('load', fill, { once: true });
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fill(); } });
        io.observe(frame);
      }
    }
    const letIn = (li, shown = true) => {         // not shown at this width: no downloads (lazy) until a resize shows it
      const kids = [...li.parentElement.children];
      const n = kids.filter(k => !k.hasAttribute('data-clone')).length;
      for (let j = kids.indexOf(li); j >= 0 && j < kids.length; j += n) {
        kids[j].classList.add('is-on');
        if (!shown || !early) unwrap(kids[j], shown);  // early: fill() puts the image in (and in any copy made since)
      }
    };
    let scrolled = 0;
    const onScroll = () => { scrolled = performance.now(); };
    addEventListener('scroll', onScroll, { passive: true });
    // The ticker rebuilds each column once just after it starts (02-core.js, its ResizeObserver's first call), which
    // restarts the loop from its start (and copies the list as it is then). On screen, what comes in before that keeps
    // the view where it is in the loop, so the restart lands on it: only below the visible part (a down column: the
    // copy it draws above the loop's start takes it too, and the ticker's offset, not a margin, makes up for it).
    const t0 = performance.now(), rebuilt = new Set();
    const mo = 'MutationObserver' in window ? new MutationObserver(recs => recs.forEach(r => rebuilt.add(r.target))) : null;
    if (mo) frame.querySelectorAll('[data-ticker-list]').forEach(list => mo.observe(list, { childList: true }));
    // an idle moment, or 600ms on (18 Oct: was 2s - while the page loads a phone has few idle moments, and the visitor may
    // reach the gallery meanwhile); a call on the timeout lets one stand-in in
    const idle = fn => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 600 }) : setTimeout(fn, 120));
    // Lets li in if none of its places is on screen (true), re-timing its column's loop; false: try again later. What
    // comes in above the visible part is offset by a negative margin on the list's first tile (above it too; before the
    // first rebuild by the ticker's offset), so no tile on screen moves, in the layout either (no layout shift).
    const tryIn = li => {
      const list = li.parentElement, col = list.closest('[data-ticker]');
      const t = (TS.tickers || []).find(x => x.el === col), anim = t && t.anim, fx = anim && anim.effect;
      const kfs = fx ? fx.getKeyframes() : [], dur = fx ? fx.getTiming().duration : 0;
      const from = kfs.length > 1 ? parse(kfs[0]) : NaN, to = kfs.length > 1 ? parse(kfs[kfs.length - 1]) : NaN;
      if (!(isFinite(from) && isFinite(to) && to !== from && dur > 0)) { letIn(li); return true; }   // no loop to keep
      const kids = [...list.children], n = kids.filter(k => !k.hasAttribute('data-clone')).length, first = kids[0];
      const r = col.getBoundingClientRect(), off = first.getBoundingClientRect().top - r.top;   // the list as drawn
      const top = Math.max(0, -r.top), bottom = Math.min(r.height, innerHeight - r.top);
      const seen = bottom > top, a = top - off - MARGIN, b = bottom - off + MARGIN;   // the visible part, in list space
      const pending = seen && !rebuilt.has(list) && performance.now() - t0 < 4000;   // the first rebuild still to come
      let next = li.nextElementSibling;              // the stand-in comes in where its next shown tile is now
      while (next && !next.offsetParent) next = next.nextElementSibling;
      if (!next || next.hasAttribute('data-clone')) return false;
      const len = Math.abs(to - from), at = next.offsetTop - first.offsetTop, places = [];
      for (let k = 0; k * n < kids.length; k++) places.push(k * len + at);   // the tile, then each copy of it
      if (seen && places.some(p => p > a && p < b)) return false;
      const above = seen ? places.filter(p => p <= a).length : 0;
      if (pending && above !== (to > from ? 1 : 0)) return false;
      letIn(li);
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0, last = kids[n - 1];
      const loop = last.offsetTop + last.offsetHeight - first.offsetTop + gap;   // as the ticker measures it
      if (above && !pending) first.style.marginTop = `${(parseFloat(first.style.marginTop) || 0) - above * (li.offsetHeight + gap)}px`;
      const T = from + (to - from) * (((anim.currentTime || 0) % dur) / dur)   // the ticker's offset: kept
        - (pending ? above * (li.offsetHeight + gap) : 0);
      const f2 = to > from ? -loop : 0, t2 = to > from ? 0 : -loop;
      const d2 = loop / (parseFloat(col.dataset.speed) || 25) * 1000;
      fx.setKeyframes([{ transform: `translateY(${f2}px)` }, { transform: `translateY(${t2}px)` }]);
      fx.updateTiming({ duration: d2 });
      anim.currentTime = Math.min(d2 - 1, Math.max(0, (T - f2) / (t2 - f2) * d2));
      return true;
    };
    // As many stand-ins per idle moment as it holds (each: its tile and the ticker's copies of it, well under a long
    // task on a slow phone), at least one.
    const step = deadline => {
      for (let i = left.length - 1; i >= 0; i--) {
        const li = left[i];
        const shown = narrow[li.classList.contains('hero-col__item--lt800') ? 'lt800' : 'lt1440'].matches && li.closest('[data-ticker]').offsetParent;
        if (li.classList.contains('is-on') || !shown) { letIn(li, !!shown); left.splice(i, 1); }
      }
      let moved = false;
      while (left.length && performance.now() - scrolled > 250) {   // mid-scroll the visible part is a moving target
        const i = left.findIndex(tryIn);
        if (i < 0) break;
        left.splice(i, 1);
        moved = true;
        if (!deadline || deadline.timeRemaining() < 8) break;
      }
      if (!left.length) { removeEventListener('scroll', onScroll); if (mo) mo.disconnect(); }
      else if (moved) idle(step);
      else setTimeout(() => idle(step), 400);        // all on screen for now: the columns move on
    };
    // The first pass at once, at the page's start (18 Oct: an idle moment can come only after load, when the visitor may
    // be at the gallery): at the top of the page - the gallery below the fold, or only the top of its first tiles on
    // screen - that lets all of them in; idle moments do the rest (a restored scroll, a scroll before the start).
    step({ timeRemaining: () => Infinity });
  }

  TS.ready(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    appear(hero);
    pill(hero);
    gallery(hero);
    const frame = hero.querySelector('[data-hero-gallery]');
    if (!frame) return;
    if (TS.motion()) standIns(frame);
    else frame.querySelectorAll('[data-ticker-list] > :is(.hero-col__item--lt1440,.hero-col__item--lt800)').forEach(li => unwrap(li, li.hasAttribute('data-clone')));   // shown from the start
  });
})();
