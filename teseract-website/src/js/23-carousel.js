/* Coverflow carousel — reference Framer Slideshow (ref-services-testimonials §3.3 / §5).
   [data-carousel] > [data-carousel-viewport] > [data-carousel-track] > [data-carousel-slide]…
   + role=tab dots + [data-carousel-toggle].

   Geometry: slide = viewport width (560 desktop/tablet, container-24 on phone), gap 24, step 584.
   Per-slide effect from its offset p (left edge relative to the content box), piecewise-linear over
   [-W, 0, gap, W] and clamped: opacity .1/1/1/.1, scale .8/1/1/.8, rotateY -20/0/0/20,
   transform-origin-x 100/100/0/0 % (phone: opacity 0/1/1/0, no scale/rotation).
   Motion: 700 ms tween cubic-bezier(.44,0,.56,1) for autoplay (4 s), dots, keys and drag release.
   Direction "right" (reference): the next card waits on the left and travels to the centre.
   Autoplay pauses on hover, focus, drag, off-screen, hidden tab and the rotation button;
   prefers-reduced-motion: no autoplay, no 3D, instant moves. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const phoneMQ = matchMedia('(max-width: 799.98px)');
  const DURATION = 700;

  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t;
    const sy = t => ((ay * t + by) * t + cy) * t;
    return x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 24; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-5) break;
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }
  const EASE = bezier(0.44, 0, 0.56, 1);
  const lerp = (x, xs, ys) => {
    if (x <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) {
      if (x <= xs[i]) { const t = (x - xs[i - 1]) / ((xs[i] - xs[i - 1]) || 1); return ys[i - 1] + t * (ys[i] - ys[i - 1]); }
    }
    return ys[ys.length - 1];
  };
  const mod = (a, n) => ((a % n) + n) % n;
  const expoOut = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function init(root) {
    const viewport = root.querySelector('[data-carousel-viewport]');
    const track = root.querySelector('[data-carousel-track]');
    if (!viewport || !track) return;
    const real = [...track.children].filter(el => el.hasAttribute('data-carousel-slide'));
    const n = real.length;
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const toggle = root.querySelector('[data-carousel-toggle]');
    const counters = [];
    if (n < 2) { root.classList.add('is-ready', 'is-single'); return; }

    /* One cloned set so both sides always have neighbours; the wrap point sits n steps away. */
    real.forEach(s => {
      const c = s.cloneNode(true);
      ['id', 'role', 'aria-roledescription', 'aria-label'].forEach(a => c.removeAttribute(a));
      c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('data-clone', '');
      c.inert = true;
      track.appendChild(c);
    });
    const all = [...track.children];
    const total = all.length;
    const sgn = (root.dataset.carouselDirection || 'right') === 'right' ? -1 : 1;
    const interval = parseFloat(root.dataset.interval) || 4000;

    let item = 560, gap = 24, step = 584, fx = null;
    let pos = 0, target = 0, active = -1, raf = 0, timer = 0;
    let hover = false, focusIn = false, inView = false, userPaused = false, dragging = false, drag = null, suppressClick = false;
    const reduced = () => reducedMQ.matches;

    function measure() {
      item = viewport.clientWidth || item;
      gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      step = item + gap;
      const phone = phoneMQ.matches;
      /* reference effectsOptions: desktop/tablet opacity .1 · scale .8 · rotate 20 (no blur);
         phone instance: opacity 0, no scale/3D. Reduced motion keeps only the fade. */
      fx = reduced()
        ? { o: phone ? [0, 1, 1, 0] : [0.1, 1, 1, 0.1], s: [1, 1, 1, 1], r: [0, 0, 0, 0] }
        : phone
          ? { o: [0, 1, 1, 0], s: [1, 1, 1, 1], r: [0, 0, 0, 0] }
          : { o: [0.1, 1, 1, 0.1], s: [0.8, 1, 1, 0.8], r: [-20, 0, 0, 20] };
    }

    function apply() {
      const xs = [-item, 0, gap, item];
      for (let k = 0; k < total; k++) {
        const el = all[k];
        const d = mod(k - pos + n, total) - n;
        const x = sgn * d * step;
        if (Math.abs(d) > 2.5) { el.style.visibility = 'hidden'; el.style.transform = `translate3d(${x}px,0,0)`; continue; }
        const o = lerp(x, xs, fx.o), s = lerp(x, xs, fx.s), r = lerp(x, xs, fx.r), ox = lerp(x, xs, [1, 1, 0, 0]);
        el.style.visibility = '';
        el.style.transformOrigin = `${ox * 100}% 50%`;
        el.style.transform = `translate3d(${x}px,0,0) scale(${s}) rotateY(${r}deg)`;
        el.style.opacity = o.toFixed(3);
        el.style.pointerEvents = Math.abs(d) < 0.5 ? '' : 'none';
      }
    }

    function setActive(i) {
      if (i === active) return;
      active = i;
      real.forEach((s, k) => s.setAttribute('aria-hidden', k === i ? 'false' : 'true'));
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      if (inView) countUp(real[i]);
    }

    function settle(animated) {
      raf = 0;
      pos = target = mod(Math.round(target), n);
      apply();
      setActive(pos);
      /* reference timer restarts when the slide changes, i.e. at the START of the 700 ms move:
         moves begin `interval` apart (≈4 s), not interval + duration */
      schedule(animated === true ? Math.max(0, interval - DURATION) : interval);
    }

    function goTo(t, { instant = false } = {}) {
      cancelAnimationFrame(raf);
      target = t;
      setActive(mod(Math.round(t), n));
      const from = pos, dist = t - from;
      if (instant || reduced() || Math.abs(dist) < 1e-3) { pos = t; settle(); return; }
      const t0 = performance.now();
      clearTimeout(timer);
      const tick = now => {
        const p = Math.min(1, (now - t0) / DURATION);
        pos = from + dist * EASE(p);
        apply();
        if (p < 1) raf = requestAnimationFrame(tick); else settle(true);
      };
      raf = requestAnimationFrame(tick);
    }
    const next = () => goTo(Math.round(target) + 1);
    const prev = () => goTo(Math.round(target) - 1);
    const goIndex = i => { let delta = i - mod(Math.round(target), n); if (delta > n / 2) delta -= n; if (delta < -n / 2) delta += n; goTo(Math.round(target) + delta); };

    /* ---------- autoplay */
    const canPlay = () => !reduced() && !userPaused && !hover && !focusIn && inView && !dragging && !document.hidden;
    function schedule(delay) {
      clearTimeout(timer);
      track.setAttribute('aria-live', canPlay() ? 'off' : 'polite');
      if (canPlay() && !raf) timer = setTimeout(next, typeof delay === 'number' ? delay : interval);
    }

    /* ---------- count-up for numeric stats (20K+, 400K+), once per element, when its slide is shown */
    all.forEach(s => s.querySelectorAll('[data-count]').forEach(el => {
      const c = { el, to: parseFloat(el.dataset.count) || 0, suffix: el.dataset.suffix || '', done: false, clone: s.hasAttribute('data-clone') };
      counters.push(c);
      /* the first slide is visible as soon as the section scrolls in: start it at zero */
      if (!reduced() && document.documentElement.classList.contains('motion') && s === real[0]) el.textContent = '0' + c.suffix;
    }));
    function countUp(slide) {
      counters.filter(c => !c.done && !c.clone && slide.contains(c.el)).forEach(c => {
        c.done = true;
        if (reduced() || !document.documentElement.classList.contains('motion')) { c.el.textContent = c.to + c.suffix; return; }
        c.el.textContent = '0' + c.suffix;
        const t0 = performance.now(), dur = 1400;
        const tick = now => {
          const p = Math.max(0, Math.min(1, (now - t0) / dur));
          c.el.textContent = Math.round(c.to * expoOut(p)) + c.suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }

    /* ---------- controls */
    tabs.forEach((t, i) => t.addEventListener('click', () => goIndex(i)));
    root.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const k = e.key;
      let handled = true;
      if (k === 'ArrowRight') next();
      else if (k === 'ArrowLeft') prev();
      else if (k === 'Home' && e.target.getAttribute('role') === 'tab') goIndex(0);
      else if (k === 'End' && e.target.getAttribute('role') === 'tab') goIndex(n - 1);
      else handled = false;
      if (!handled) return;
      e.preventDefault();
      if (e.target.getAttribute('role') === 'tab') tabs[mod(Math.round(target), n)].focus();
    });
    if (toggle) {
      toggle.addEventListener('click', () => {
        userPaused = !userPaused;
        root.classList.toggle('is-paused', userPaused);
        toggle.setAttribute('aria-label', userPaused ? 'Start automatic slide show' : 'Stop automatic slide show');
        schedule();
      });
    }
    root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; schedule(); } });
    root.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; schedule(); } });
    root.addEventListener('focusin', () => { focusIn = true; schedule(); });
    root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { focusIn = false; schedule(); } });
    document.addEventListener('visibilitychange', () => schedule());
    new IntersectionObserver(entries => {
      inView = entries[entries.length - 1].isIntersecting;
      if (inView && active >= 0) countUp(real[active]);
      schedule();
    }, { threshold: 0.25 }).observe(root);

    /* ---------- drag (x axis, direction lock, no momentum; reference release rules) */
    viewport.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos0: pos, lock: null, samples: [[e.clientX, e.timeStamp]] };
    });
    viewport.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.lock) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        drag.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (drag.lock === 'y') { drag = null; return; }
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        cancelAnimationFrame(raf); raf = 0;
        dragging = true;
        root.classList.add('is-dragging');
        drag.pos0 = pos; drag.x0 = e.clientX;
        schedule();
      }
      e.preventDefault();
      pos = drag.pos0 - (e.clientX - drag.x0) / (sgn * step);
      apply();
      drag.samples.push([e.clientX, e.timeStamp]);
      while (drag.samples.length > 2 && e.timeStamp - drag.samples[0][1] > 100) drag.samples.shift();
    });
    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!dragging) return;
      dragging = false;
      root.classList.remove('is-dragging');
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
      const dx = e.clientX - d.x0;
      const [sx, st] = d.samples[0];
      const dt = Math.max(1, e.timeStamp - st);
      const v = (e.clientX - sx) / dt * 1000;
      let moved = 0;
      if (e.type !== 'pointercancel' && Math.abs(v) > 200) moved = Math.sign(v) * Math.max(1, Math.round(Math.abs(dx) / item));
      else if (Math.abs(dx) > item / 2) moved = Math.sign(dx) * Math.round(Math.abs(dx) / item);
      goTo(Math.round(d.pos0) - moved / sgn);
    };
    viewport.addEventListener('pointerup', release);
    viewport.addEventListener('pointercancel', release);
    viewport.addEventListener('click', e => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); } }, true);
    viewport.addEventListener('dragstart', e => e.preventDefault());

    /* ---------- layout */
    let rt = 0;
    const relayout = () => { measure(); apply(); };
    new ResizeObserver(() => { cancelAnimationFrame(rt); rt = requestAnimationFrame(relayout); }).observe(viewport);
    const onMQ = () => { relayout(); schedule(); };
    (reducedMQ.addEventListener ? reducedMQ.addEventListener('change', onMQ) : reducedMQ.addListener(onMQ));
    (phoneMQ.addEventListener ? phoneMQ.addEventListener('change', onMQ) : phoneMQ.addListener(onMQ));

    root.classList.add('is-ready');
    root.classList.toggle('is-reduced', reduced());
    track.scrollLeft = 0;
    measure();
    goTo(0, { instant: true });
  }

  ready(() => document.querySelectorAll('[data-carousel]').forEach(init));
})();
