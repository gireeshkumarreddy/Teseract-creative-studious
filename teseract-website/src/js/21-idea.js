/* Home — THE IDEA (image 2). Markup: scripts/sections/home_idea.py · styles: src/css/21-idea.css
   1. Reveal choreography: headline masks rise when the title enters; the hand slides in and the
      strings draw out from the pinch point once the hand is on screen (CSS does the timing).
   2. Perspective screen: the project slides are one plane mapped onto the laptop display's
      measured quad with a matrix3d (recomputed on resize). Without JS a clipped flat box is used.
   3. Slideshow: cross-fades our project screens only while visible; pauses on hover, focus,
      hidden tab or the pause button; never autoplays under reduced motion. When the client's own
      website recordings are supplied (media manifest) the slides hold <video>s instead: only the
      active slide's clip plays (06-video.js holds clips in inert slides), the pause button pauses it.
   The laptop also gets a very small scroll-linked rise (desktop/tablet fine pointers here; phones and touch screens
   get the same rise as a CSS scroll-driven animation, 21-idea.css); string E is kept docked under the lid's top edge
   whatever the laptop's offset. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  /* CSS matrix3d mapping a w x h element (transform-origin 0 0) onto quad TL, TR, BR, BL (px). */
  function quadMatrix3d(w, h, [x0, y0], [x1, y1], [x2, y2], [x3, y3]) {
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
    const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, x0, y0, 0, 1];
    return `matrix3d(${m.map(v => +v.toFixed(9)).join(',')})`;
  }

  ready(() => {
    const root = document.querySelector('[data-idea]');
    if (!root) return;
    const motion = TS.motion ? TS.motion() : false;
    const reduced = TS.reduced ? TS.reduced() : matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. Reveal */
    const title = root.querySelector('[data-idea-title]');
    const diagram = root.querySelector('[data-idea-diagram]');
    const copy = root.querySelector('[data-idea-copy]');
    const hand = diagram && diagram.querySelector('.idea__hand');
    if (!motion || !('IntersectionObserver' in window)) {
      [title, diagram, copy].forEach(el => el && el.classList.add('is-in'));
    } else {
      // trigger -> element that gets .is-in (the copy column reveals its lines as one group)
      const pairs = new Map([[title, title], [hand || diagram, diagram], [copy, copy]]);
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        const target = pairs.get(en.target);
        if (target) target.classList.add('is-in');
        io.unobserve(en.target);
      }), { rootMargin: '0px 0px -10% 0px', threshold: 0.25 });
      pairs.forEach((_, trigger) => trigger && io.observe(trigger));
    }

    /* ---------- 2. Perspective-correct screen */
    const device = root.querySelector('[data-idea-device]');
    const screen = root.querySelector('[data-idea-screen]');
    if (!device || !screen) return;
    const quad = (device.dataset.quad || '').split(';').map(p => p.split(',').map(Number));
    screen.style.setProperty('--ar', device.dataset.ar || '1.547');
    let lastW = 0, lastH = 0;
    const warp = () => {
      const W = device.clientWidth, H = device.clientHeight;
      if (!W || !H || quad.length !== 4 || (W === lastW && H === lastH)) return;
      lastW = W; lastH = H;
      screen.classList.add('is-warped');
      const w = screen.offsetWidth, h = screen.offsetHeight;
      if (!w || !h) return;
      screen.style.setProperty('--warp', quadMatrix3d(w, h, ...quad.map(([x, y]) => [x * W, y * H])));
    };
    warp();
    if ('ResizeObserver' in window) new ResizeObserver(warp).observe(device);
    else window.addEventListener('resize', warp);

    /* ---------- 2b. String E docks on the lid. It ends 3px under the lid's top edge (poster
       geometry); when the laptop moves - the scroll-linked rise below, or the extra horizontal
       bleed on screens wider than the 1760px artboard (diagram shifts left, laptop right) - the
       string is re-aimed / lengthened so it always disappears exactly behind the lid. */
    const board = root.querySelector('.idea__board');
    const laptop = root.querySelector('.idea__laptop');
    const eLine = root.querySelector('[data-idea-e]');
    // 2c moves the laptop here on fine pointers >= 800px; every other screen with motion rises in CSS (21-idea.css) where
    // scroll timelines exist, which no script follows: there string E is drawn down to the lid's lowest point (the laptop
    // 40px low), and the rest of it stays hidden behind the lid as the laptop settles.
    const lift = matchMedia('(min-width: 800px) and (pointer: fine)');
    const cssRise = motion && !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
    let liftPx = !lift.matches && cssRise ? 40 : 0, shift = 0;
    const dockE = () => {
      if (!eLine || !board) return;
      const k = board.clientWidth / 1600;
      if (!k) return;
      const [ax, ay, lidL] = eLine.dataset.ideaE.split(',').map(Number);
      const px = +eLine.getAttribute('x1'), py = +eLine.getAttribute('y1');
      const tx = Math.max(ax, lidL + 160 + shift);   // rest point, or 160px in from the shifted lid corner
      const y = ay + 3 + liftPx / k;
      const x = px + (tx - px) * (y - py) / (ay - py);
      eLine.setAttribute('x2', x.toFixed(2));
      eLine.setAttribute('y2', y.toFixed(2));
    };
    const measureShift = () => {
      if (!board || !laptop || !diagram) return;
      const k = board.clientWidth / 1600;
      const b = board.getBoundingClientRect();
      const px = (laptop.getBoundingClientRect().right - b.right) + (b.left - diagram.getBoundingClientRect().left);
      shift = k ? Math.max(0, px) / k : 0;
      dockE();
    };
    measureShift();
    if ('ResizeObserver' in window) new ResizeObserver(measureShift).observe(root);
    window.addEventListener('resize', measureShift);

    /* ---------- 2c. Subtle scroll-linked rise of the laptop: 40px low while it enters, settling
       exactly when the panel's bottom edge (where the stones are cropped) reaches the viewport, so
       no gap ever opens under the stones. Fine pointers >= 800px only (Lenis-smoothed scroll; every other screen runs
       it in CSS, animation-timeline: view(), with string E docked as above), never under reduced motion. */
    if (motion && 'IntersectionObserver' in window) {
      let on = false, raf = 0, moved = 0;
      const update = () => {
        raf = 0;
        let px = 0;
        if (lift.matches) {
          const d = root.getBoundingClientRect().bottom - innerHeight;   // untransformed bottom of the laptop
          px = 40 * Math.min(1, Math.max(0, d / (device.offsetHeight || 1)));
        }
        if (px !== moved) {
          moved = px;
          device.style.transform = px ? `translate3d(0,${px.toFixed(2)}px,0)` : '';
        }
        const dock = lift.matches ? px : cssRise ? 40 : 0;
        if (dock !== liftPx) { liftPx = dock; dockE(); }
      };
      const onScroll = () => { if (on && !raf) raf = requestAnimationFrame(update); };
      new IntersectionObserver(entries => { on = entries[entries.length - 1].isIntersecting; onScroll(); }, { rootMargin: '10% 0px' }).observe(device);
      if (TS.lenis && TS.lenis.on) TS.lenis.on('scroll', onScroll);
      window.addEventListener('scroll', onScroll, { passive: true });
      lift.addEventListener ? lift.addEventListener('change', onScroll) : lift.addListener(onScroll);
    }

    /* ---------- 3. Project slideshow */
    const slides = [...screen.querySelectorAll('[data-idea-slide]')];
    const toggle = root.querySelector('[data-idea-toggle]');
    const count = root.querySelector('[data-idea-count]');
    const hasVideo = !!screen.querySelector('[data-video]');   // a single clip still gets the pause button
    if ((slides.length < 2 && !hasVideo) || reduced || !motion || !toggle) return;
    const DWELL = 3600;
    const PRELOAD = 1500;                 // the next slide's clip gets its src this long before the swap
    let idx = 0, timer = 0, early = 0, visible = false, hovering = false, focused = false, paused = false;
    const show = n => {
      const prev = slides[idx];
      idx = (n + slides.length) % slides.length;
      const next = slides[idx];
      if (prev === next) return;
      next.inert = false;
      next.classList.add('is-active');
      prev.classList.remove('is-active');
      prev.inert = true;
      if (count) count.textContent = String(idx + 1).padStart(2, '0');
      if (hasVideo && TS.syncVideos) TS.syncVideos(screen);   // play the incoming clip, pause the outgoing one
    };
    const running = () => visible && !hovering && !focused && !paused && !document.hidden;
    let decoding = false;
    // Decode the incoming screen before the swap: the first cross-fade to each (lazy, 3D-warped)
    // slide otherwise paid its decode + raster in one long frame at the start of the fade.
    const advance = () => {
      timer = 0;
      if (!running()) return;
      const n = (idx + 1) % slides.length;
      const img = slides[n].querySelector('img');
      const go = () => { decoding = false; if (running()) show(n); schedule(); };
      decoding = true;
      if (img && img.decode) img.decode().then(go, go); else go();
    };
    // Load the incoming clip ahead of the swap, so it starts at once instead of after a poster-only gap.
    const preload = () => {
      early = 0;
      const v = hasVideo && TS.preloadVideo && slides[(idx + 1) % slides.length].querySelector('[data-video]');
      if (v) TS.preloadVideo(v);
    };
    const schedule = () => {               // idempotent: a pending advance survives repeated calls
      if (!running() || slides.length < 2) { clearTimeout(timer); clearTimeout(early); timer = early = 0; return; }
      if (!timer && !decoding) {
        timer = setTimeout(advance, DWELL);
        if (hasVideo) early = setTimeout(preload, DWELL - PRELOAD);
      }
    };
    toggle.hidden = false;
    // a batch can hold several records for the device (e.g. after a jump): the last one is current
    new IntersectionObserver(entries => { visible = entries[entries.length - 1].isIntersecting; schedule(); }, { threshold: 0.3 }).observe(device);
    // hold while a mouse is over the screen (its link / View Project cursor). Not over the control:
    // pressing "play" there must visibly resume the slideshow, and pressing "pause" stops it anyway.
    device.addEventListener('pointerover', e => {
      if (e.pointerType !== 'mouse') return;
      const over = !!e.target.closest('[data-idea-screen]');
      if (over !== hovering) { hovering = over; schedule(); }
    });
    device.addEventListener('pointerleave', () => { if (hovering) { hovering = false; schedule(); } });
    // hold while a keyboard user is on the visible slide's link (so the link they are about to
    // open cannot change under them). Focus on the toggle itself does not count: a mouse click on
    // "play" leaves the button focused, and that must not keep the slideshow stalled.
    const onSlide = el => {
      if (!el || !el.closest || !el.closest('[data-idea-slide]')) return false;
      try { return el.matches(':focus-visible'); } catch (err) { return true; }
    };
    device.addEventListener('focusin', e => { const f = onSlide(e.target); if (f !== focused) { focused = f; schedule(); } });
    device.addEventListener('focusout', e => { const f = onSlide(e.relatedTarget); if (f !== focused) { focused = f; schedule(); } });
    document.addEventListener('visibilitychange', schedule);
    /* The toggle shows what the clip does, not only what was asked: "pause" while it plays (or is about to), "play"
       while the visitor holds it and whenever it stopped by itself on screen - the phone refused autoplay (iOS Low
       Power Mode, a no-autoplay setting, Save-Data: 06-video.js marks its frame .is-blocked and fires
       'ts:videoblocked') or the browser paused it. A tap on "play" starts the clip inside the tap (TS.playVideo),
       which a phone allows even then. */
    let stopped = false;                   // the active clip is not playing although nothing holds it
    const active = el => !!(el && el.closest && el.closest('[data-idea-slide]') === slides[idx]);
    const shown = () => { const r = device.getBoundingClientRect(); return Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) > r.height / 2; };
    const paint = () => {
      const off = paused || stopped;
      toggle.classList.toggle('is-paused', off);
      toggle.setAttribute('aria-pressed', String(off));
    };
    if (hasVideo) {
      const v0 = slides[idx] && slides[idx].querySelector('[data-video]');
      const frame = v0 && (v0.closest('figure') || v0.parentElement);
      stopped = !!(frame && frame.classList.contains('is-blocked'));   // refused before this script listened (Save-Data)
      screen.addEventListener('ts:videoblocked', e => { if (active(e.target)) { stopped = true; paint(); } });
      // media events do not bubble: listen in the capture phase
      screen.addEventListener('playing', e => { if (active(e.target) && stopped) { stopped = false; paint(); } }, true);
      screen.addEventListener('pause', e => {   // off-screen, a hidden tab, a slide change or a hold: not "stopped"
        if (active(e.target) && !paused && !document.hidden && !e.target.closest('[inert]') && shown()) { stopped = true; paint(); }
      }, true);
      paint();
    }
    toggle.addEventListener('click', () => {
      const play = paused || stopped;
      paused = !play;
      stopped = false;
      if (hasVideo) {
        screen.toggleAttribute('data-video-hold', paused);
        const v = play && slides[idx].querySelector('[data-video]');
        if (v && TS.playVideo) TS.playVideo(v);   // synchronously, inside the tap
        if (TS.syncVideos) TS.syncVideos(screen);
      }
      paint();
      schedule();
    });
  });
})();
