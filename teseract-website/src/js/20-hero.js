/* Home hero: load-time appear, rotating statement pill, gallery reveal, keyboard support and a
   pause control for the hero's moving content (WCAG 2.2.2).
   Tickers (marquee + gallery columns) and [data-reveal] come from 02-core.js. */
(() => {
  'use strict';
  const TS = window.TS || {};
  if (!TS.ready) return;

  /* Shared state: "still" = the visitor paused the hero motion with the gallery control. */
  const state = { still: false, listeners: [] };
  const onStill = fn => state.listeners.push(fn);
  const heroTickers = hero => (TS.tickers || []).filter(t => hero.contains(t.el));
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
      if (visible && !document.hidden && !state.still) timer = setInterval(step, 2000);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(slot);
    } else run();
    document.addEventListener('visibilitychange', run);
    onStill(run);
  }

  /* Pause control: one button (sticky inside the gallery frame) pauses every moving part of the
     hero — marquee, gallery columns, statement pill and the badge pulse. The shared ticker
     runtime resumes animations when they re-enter the viewport or are rebuilt on resize, so
     the paused state is re-applied after those events. Hidden under reduced motion (nothing moves). */
  function motionControl(hero) {
    const btn = hero.querySelector('[data-hero-motion]');
    if (!btn || !TS.motion()) return;
    const label = btn.querySelector('[data-hero-motion-label]');
    btn.hidden = false;
    const hold = () => {
      if (!state.still) return;
      heroTickers(hero).forEach(t => { if (t.anim && t.anim.playState !== 'paused') t.anim.pause(); });
    };
    const set = still => {
      state.still = still;
      hero.classList.toggle('is-still', still);
      if (label) label.textContent = still ? 'Play motion' : 'Pause motion';
      if (hero.querySelector('[data-video]')) {   // client video tiles pause with the rest of the hero motion
        hero.toggleAttribute('data-video-hold', still);
        if (TS.syncVideos) TS.syncVideos(hero);
      }
      if (still) hold();
      else heroTickers(hero).forEach(t => {
        const focused = t.el.contains(document.activeElement);
        if (t.anim && !focused && inView(t.el)) t.anim.play();
      });
      state.listeners.forEach(fn => fn());
    };
    btn.addEventListener('click', () => set(!state.still));
    // Re-apply after the ticker runtime resumes an animation on viewport re-entry (its observer
    // callback may run after this one, so wait a frame) or rebuilds it (clone mutations).
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(() => { hold(); requestAnimationFrame(hold); });
      heroTickers(hero).forEach(t => io.observe(t.el));
    }
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(hold);
      hero.querySelectorAll('[data-ticker-list]').forEach(list => mo.observe(list, { childList: true }));
    }
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
    // Ticker rebuilds (resize / late image load) re-clone the items; open new clones once revealed.
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(() => { if (revealed) openAll(); });
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
      const offset = item.offsetTop - list.firstElementChild.offsetTop;   // item top inside the list at translate 0
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
      if (t && t.anim && !TS.reduced() && !state.still && inView(col)) t.anim.play();
    });
  }

  TS.ready(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    appear(hero);
    pill(hero);
    gallery(hero);
    motionControl(hero);
  });
})();
