/* Our Approach (image 4 flowchart). Markup: scripts/pages/approach.py, CSS: 32-approach.css.
   - Poster (>= 1200px): the spine is drawn with scroll progress. Its tip follows a line 74 % down
     the viewport (design y = (0.74 * vh + scrollY - posterTop) / u), smoothed with a lerp, revealed
     by a clip rect; a small blue playhead rides the tip. Every step / decision / burst / sign-off
     group ([data-k] with a data-y trigger) switches on once the tip passes it; a step's extras
     (.ap-x lists, boxes) switch on with it.
   - Flow (< 1200px): each step's rail segment scales with scroll (--p); the step, then its decision
     row and extras, each switch on as they enter the lower part of the viewport (a phone step is
     taller than the screen). Reaching the sign-off switches on anything still pending.
   - Idle loops (marching feedback dots, burst shimmer) only run while on screen.
   Reduced motion: nothing is hidden and nothing moves (masks removed, spine fully drawn). */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    const ap = document.querySelector('.ap');
    if (!ap) return;
    const poster = ap.querySelector('.ap-poster');
    const svg = ap.querySelector('.ap-wires');
    const unmask = root => root.querySelectorAll('[mask]').forEach(p => p.removeAttribute('mask'));
    const motion = TS.motion ? TS.motion() : false;
    if (!motion || !svg) { if (svg) unmask(svg); return; }

    const posterMQ = matchMedia('(min-width: 1200px)');
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const clip = svg.querySelector('.w-clip');
    const play = svg.querySelector('.w-play');
    const trav = svg.querySelector('.w-trav');

    /* ---------- keys: every element carrying data-k switches on together */
    const byKey = new Map();
    ap.querySelectorAll('[data-k]').forEach(el => {
      const k = el.dataset.k;
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push(el);
    });
    const fired = new Set();
    // step extras (.ap-x: bracket lists, boxes, burst) follow their step on the poster
    const extrasOn = step => step.querySelectorAll('.ap-x').forEach(x => x.classList.add('is-on'));
    const fire = k => {
      if (fired.has(k) || !byKey.has(k)) return;
      fired.add(k);
      byKey.get(k).forEach(el => {
        el.classList.add('is-on');
        if (isPoster && el.matches('.ap-step')) extrasOn(el);
        // drop the reveal masks once the draws are over (keeps later repaints cheap)
        if (el.matches('.w-grp')) setTimeout(() => unmask(el), (+el.dataset.end || 1200) + 120);
      });
      if (k === 'd1' && trav && trav.animate) {
        trav.animate([
          { transform: 'translate(888px,392.5px)' },
          { transform: 'translate(986px,392.5px)', offset: 0.38 },
          { transform: 'translate(986px,549.5px)' },
        ], { duration: 1200, delay: 600, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      }
    };

    /* ---------- poster triggers (design y), sorted */
    const posterTriggers = [...svg.querySelectorAll('.w-grp[data-y]')]
      .map(g => [parseFloat(g.dataset.y), g.dataset.k]).sort((a, b) => a[0] - b[0]);

    /* ---------- flow items: rail segments per step; triggers for steps, their decisions and extras
       (on a phone a step is taller than the viewport, so its decision row / lists reveal on their own) */
    const steps = [...ap.querySelectorAll('.ap-step')].map(el => ({ el, top: 0, h: 1, p: -1 }));
    const parts = [...ap.querySelectorAll('.ap-step .ap-dec[data-k], .ap-step .ap-x')].map(el => ({ el, k: el.dataset.k, top: 0 }));
    const sign = ap.querySelector('.ap-sign');
    let signTop = 0;

    /* ---------- measurements (no layout reads inside the frame loop) */
    let isPoster = posterMQ.matches, u = 1, posterTop = 0, vh = innerHeight;
    const measure = () => {
      isPoster = posterMQ.matches;
      vh = innerHeight;
      const sy = scrollY;
      const r = poster.getBoundingClientRect();
      posterTop = r.top + sy;
      u = r.width / 1333 || 1;
      if (isPoster) {
        // switched from flow: extras of steps that are already on must not stay hidden
        steps.forEach(s => { if (s.el.classList.contains('is-on')) extrasOn(s.el); });
      } else {
        steps.forEach(s => { const b = s.el.getBoundingClientRect(); s.top = b.top + sy; s.h = Math.max(1, b.height); });
        parts.forEach(p => { p.top = p.el.getBoundingClientRect().top + sy; });
        if (sign) signTop = sign.getBoundingClientRect().top + sy;
      }
    };

    /* ---------- frame loop */
    const START = 108, END = 1820, TIP = 0.74;
    let cur = START, raf = 0, started = false, last = 0;
    const frame = now => {
      raf = 0;
      if (!started) return;
      const sy = scrollY;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (isPoster) {
        const target = clamp((vh * TIP + sy - posterTop) / u, START, END);
        cur += (target - cur) * (1 - Math.exp(-dt / 90));   // ~0.17 per 60 fps frame, fps independent
        if (Math.abs(target - cur) < 0.25) cur = target;
        clip.setAttribute('height', cur.toFixed(2));
        const x = cur < 410 ? 685 : 748.5;
        play.setAttribute('cx', x);
        play.setAttribute('cy', cur.toFixed(2));
        play.classList.toggle('is-shown', cur > START + 10 && cur < END - 4);
        for (const [y, k] of posterTriggers) { if (cur >= y) fire(k); else break; }
        if (cur !== target) raf = requestAnimationFrame(frame); else last = 0;
      } else {
        const line = vh * 0.6 + sy, trig = vh * 0.92 + sy;   // 0.92: the first step pops in under the hero on load
        steps.forEach(s => {
          const p = clamp((line - s.top - 16) / s.h, 0, 1);
          if (Math.abs(p - s.p) > 0.001) { s.el.style.setProperty('--p', p.toFixed(4)); s.p = p; }
          if (trig >= s.top + 8) fire(s.el.dataset.k);
        });
        const all = sign && trig >= signTop + 40;   // reaching the sign-off: nothing above may stay hidden
        parts.forEach(p => {
          if (!all && trig < p.top + 24) return;
          fire(p.el.closest('.ap-step').dataset.k);
          if (p.k) fire(p.k); else p.el.classList.add('is-on');
        });
        if (all) { steps.forEach(s => fire(s.el.dataset.k)); fire('end'); }
      }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    // spine + rail start undrawn
    clip.setAttribute('height', String(START));
    steps.forEach(s => s.el.style.setProperty('--p', '0'));
    ap.classList.add('is-armed');
    measure();

    addEventListener('scroll', kick, { passive: true });
    let rt = 0;
    const remeasure = () => { clearTimeout(rt); rt = setTimeout(() => { measure(); kick(); }, 80); };
    addEventListener('resize', remeasure);
    posterMQ.addEventListener ? posterMQ.addEventListener('change', remeasure) : posterMQ.addListener(remeasure);
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(ap);

    /* ---------- load: hero first (after fonts settle), then the spine starts drawing */
    const go = () => {
      if (ap.classList.contains('is-loaded')) return;
      measure();
      ap.classList.add('is-loaded');
      setTimeout(() => { started = true; measure(); kick(); }, 650);
    };
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    // ... and after the intro stage has lifted (01-intro.js; immediate without an intro)
    Promise.race([fontsReady, new Promise(r => setTimeout(r, 700))]).then(() => TS.afterIntro(() => requestAnimationFrame(go)));

    /* ---------- idle loops only while their area is visible */
    if ('IntersectionObserver' in window) {
      const live = new Map();
      ap.querySelectorAll('.ap-dec').forEach(dec => {
        const g = svg.querySelector(`.w-grp[data-k="${dec.dataset.k}"]`);
        const cap = dec.querySelector('.ap-dec__no');
        if (g && cap) live.set(cap, g);
      });
      const burst = svg.querySelector('.w-burst');
      const head8 = ap.querySelector('.ap-step[data-k="s8"] .ap-head');
      if (burst && head8) live.set(head8, burst);
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        const g = live.get(en.target);
        if (g) g.classList.toggle('is-live', en.isIntersecting && isPoster);
      }), { rootMargin: '25% 0px' });
      live.forEach((g, el) => io.observe(el));
    }
  });
})();
