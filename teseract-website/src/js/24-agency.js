/* Home 5 — A DIFFERENT KIND OF AGENCY (images 9 + 8). Markup: scripts/sections/home_agency.py,
   CSS 24-agency.css.

   1. Choreography: marks the section [data-agc-ready] (the only state in which CSS hides anything) and
      adds .is-in to each part as it scrolls in: headline lines, rules, the figure (glow → splash →
      body → ground → pins), each point together with its SVG leader group, the meeting scene and the
      note. The figure and the photo wait (≤ 1.2 s) for their images to decode so a reveal never plays
      on an empty box. A point never appears before its hot-spot: its start (--agc-at) waits for the
      figure to land, and points that arrive together are staggered; the note is written once the
      photo has started to open.
   2. Drift: while the figure is on screen its layers follow scroll very slightly — the body ±12 px,
      the splash and its glow −6 px the other way (parallax depth), the floor shadow breathes ±4 %.
      One custom property (--dr, −1…1, eased towards its target) is written per frame; CSS maps it to
      `translate` / `scale`, which compose with the entrance transforms.
   3. Keyboard: focusing the closing CTA shows its reveal wrapper at once (no focus ring on a faded control).
   Off without JS and under reduced motion: everything is static and visible. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const root = document.documentElement;
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const motion = () => (TS.motion ? TS.motion() : root.classList.contains('motion') && !matchMedia('(prefers-reduced-motion: reduce)').matches);

  const LAND = 650;      // ms after the figure starts landing before the first leader grows
  const STAGGER = 150;   // ms between points that arrive together
  const WRITE = 1000;    // ms after the meeting photo starts opening before the note is written

  /* Run fn once the element's images can paint (lazy images may still be loading after a jump), but
     never wait longer than 1.2 s — the same rule as 02-core's .reveal-image. */
  function whenDecoded(el, fn) {
    const imgs = [...el.querySelectorAll('img')].filter(img => !img.complete);
    if (!imgs.length) { fn(); return; }
    let done = false;
    const go = () => { if (!done) { done = true; fn(); } };
    Promise.all(imgs.map(img => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))).then(go);
    setTimeout(go, 1200);
  }

  /* The hidden states (opacity 0, and above all the photo's clip-path: circle(0%)) stop the browser's
     native lazy loading from ever seeing those images: the meeting photo only started to download once
     its own reveal had finished, so the scene opened on an empty box and the photo popped in ~2 s
     later. Fetch the section's lazy images ourselves a good scroll distance ahead (the browsers' own
     lazy-load margin is 1250–2500 px), so every reveal plays on a decoded image. */
  function prime(sec) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
    }), { rootMargin: '1500px 0px 1500px 0px' });
    sec.querySelectorAll('[data-agc-fig], [data-agc-scene]').forEach(el => io.observe(el));
  }

  function choreograph(sec) {
    const fig = sec.querySelector('[data-agc-fig]');
    const scene = sec.querySelector('[data-agc-scene]');
    const note = scene && scene.querySelector('.agc-note');
    const groups = new Map([...sec.querySelectorAll('[data-agc-ln]')].map(g => [g.dataset.agcLn, g]));
    let figAt = 0, sceneAt = 0, queue = 0, landing = false, opening = false;
    const waitingPoints = [], waitingNote = [];
    const delay = (el, ms) => el.style.setProperty('--agc-at', `${Math.round(ms)}ms`);

    const landFigure = () => {
      if (!fig || landing) return;
      landing = true;
      whenDecoded(fig, () => {
        figAt = performance.now();
        fig.classList.add('is-in');
        waitingPoints.splice(0).forEach(showPoint);
      });
    };
    const showPoint = pt => {
      if (fig && !figAt) { waitingPoints.push(pt); landFigure(); return; }   // a point never precedes its hot-spot
      const now = performance.now();
      const start = Math.max(now + Math.max(0, LAND - (now - figAt)), queue + STAGGER);
      queue = start;
      [pt, groups.get(pt.dataset.agcPt)].forEach(el => { if (el) { delay(el, start - now); el.classList.add('is-in'); } });
    };
    const openScene = () => {
      if (!scene || opening) return;
      opening = true;
      whenDecoded(scene, () => {
        sceneAt = performance.now();
        scene.classList.add('is-in');
        waitingNote.splice(0).forEach(writeNote);
      });
    };
    const writeNote = el => {
      if (scene && !sceneAt) { waitingNote.push(el); openScene(); return; }
      delay(el, Math.max(0, WRITE - (performance.now() - sceneAt)));
      el.classList.add('is-in');
    };

    const io = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach(e => {
          const el = e.target;
          io.unobserve(el);
          if (el === fig) landFigure();
          else if (el === scene) openScene();
          else if (el === note) writeNote(el);
          else if (el.dataset.agcPt) showPoint(el);
          else el.classList.add('is-in');
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    sec.querySelectorAll('[data-agc-in], [data-agc-fig], [data-agc-pt], [data-agc-scene]').forEach(el => io.observe(el));
  }

  function drift(fig) {
    if (!fig) return;
    let target = 0, cur = null, raf = 0;
    const measure = () => {
      const r = fig.getBoundingClientRect();
      const vh = innerHeight || root.clientHeight;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);   // +1 entering below … −1 leaving above
      target = Math.max(-1, Math.min(1, p));
    };
    const tick = () => {
      raf = 0;
      measure();
      cur = cur == null ? target : cur + (target - cur) * 0.12;            // eased: the figure floats, never jerks
      if (Math.abs(target - cur) < 0.0005) cur = target;
      fig.style.setProperty('--dr', cur.toFixed(4));
      if (cur !== target) raf = requestAnimationFrame(tick);
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(tick); };
    let listening = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !listening) addEventListener('scroll', request, { passive: true });
      if (!e.isIntersecting && listening) removeEventListener('scroll', request);
      listening = e.isIntersecting;
      fig.classList.toggle('is-drifting', listening);
      request();
    }, { rootMargin: '10% 0px 10% 0px' }).observe(fig);
    addEventListener('resize', request, { passive: true });
  }

  /* Keyboard: Tab can land on the closing CTA before its fade-up has played (the browser scrolls it into view,
     then the reveal still waits its 480 ms delay), leaving the focus ring on a near-invisible control. Show the
     focused control's reveal wrapper at once. */
  function focusReveal(sec) {
    sec.addEventListener('focusin', e => {
      const r = e.target.closest && e.target.closest('[data-reveal]');
      if (r && !r.classList.contains('is-in')) { r.style.setProperty('--d', '0ms'); r.classList.add('is-in'); }
    });
  }

  ready(() => {
    document.querySelectorAll('[data-agc]').forEach(sec => {
      if (!motion() || !('IntersectionObserver' in window)) return;   // static composition
      sec.setAttribute('data-agc-ready', '');
      prime(sec);
      choreograph(sec);
      drift(sec.querySelector('[data-agc-fig]'));
      focusReveal(sec);
    });
  });
})();
