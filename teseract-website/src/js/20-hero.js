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
    // Ticker rebuilds (resize / late image load) re-clone the items; open new clones once revealed.
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(() => { syncLeads(); if (revealed) openAll(); });
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
      if (t && t.anim && !TS.reduced() && !still(col) && inView(col)) t.anim.play();
    });
  }

  TS.ready(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    appear(hero);
    pill(hero);
    gallery(hero);
  });
})();
