/* Who We Are (/who-we-are/) — images 5, 6, 7. Markup: scripts/pages/who.py, CSS: 30-who.css.
   - Hero: entrance (light sweep, monitor rise, letters rise, full stop pops) once the monitor image is
     decoded; idle light loops pause off-screen; fine-pointer tilt on the monitor (±2.5deg, ±6px) with the
     light counter-moving (±10px); scroll parallax (transform only, <= 40px).
   - Boards ([data-who-in]): .is-in when they enter (grid draw, leader lines, nodes); .is-off when they
     leave (pauses the rock float / sphere spin).
   - Rock: scroll parallax (<= 30px) + the glass tile follows the pointer (±6px, lerped).
   - Dial: rotation linked to scroll through band C (-20deg -> +20deg), lerped.
   - Steps: each number box fills as its step crosses 55 % of the viewport (one-way progress).
   - Clock: the visitor's local time, minute precision, only while the intro is on screen.
   - How we think: spread counters roll in, the panel mark turns with scroll (±4deg), the light field
     drifts with the pointer.
   One rAF loop serves every scroll/pointer-linked item and only runs while one of them is on screen.
   Reduced motion (or no html.motion): nothing moves; everything is visible from the start. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    if (!document.body.classList.contains('page-who')) return;
    const motion = TS.motion ? TS.motion() : false;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const desktop = matchMedia('(min-width: 1024px)');

    /* ---------- in-view boards */
    const boards = [...document.querySelectorAll('[data-who-in]')];
    if (!motion || !('IntersectionObserver' in window)) boards.forEach(b => b.classList.add('is-in'));
    else {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0) e.target.classList.add('is-in');
        e.target.classList.toggle('is-off', !e.isIntersecting);
      }), { rootMargin: '0px 0px -12% 0px', threshold: [0, 0.08] });
      boards.forEach(b => io.observe(b));
    }

    /* ---------- clock (visitor's local time, hh:mm AM/PM) */
    const clockLine = document.querySelector('[data-who-time]');
    const clock = document.querySelector('[data-who-clock]');
    if (clockLine && clock) {
      let fmt = null, iso = null;
      try {
        fmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        iso = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
      } catch (e) { fmt = null; }
      if (fmt) {
        const tick = () => {
          const now = new Date();
          const text = fmt.format(now).replace(/\s/g, ' ');
          if (clock.textContent !== text) clock.textContent = text;
          clock.setAttribute('datetime', iso.format(now));
        };
        tick();
        clockLine.hidden = false;
        let timer = 0;
        const run = () => { tick(); timer = setTimeout(run, 60000 - (Date.now() % 60000) + 50); };
        const start = () => { if (!timer) { tick(); timer = setTimeout(run, 60000 - (Date.now() % 60000) + 50); } };
        const stop = () => { clearTimeout(timer); timer = 0; };
        const host = clockLine.closest('section') || clockLine;
        if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(host);
        else start();
      }
    }

    /* ---------- steps: one-way progress through 01-04 */
    const steps = [...document.querySelectorAll('[data-who-step]')];
    if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-done'); sio.unobserve(e.target); }
      }), { rootMargin: '0px 0px -45% 0px', threshold: 0 });
      steps.forEach(s => sio.observe(s));
    }

    /* ---------- how-we-think spreads: active state (counter roll + panel reveal) */
    const spreads = [...document.querySelectorAll('[data-who-sp]')];
    if (!motion || !('IntersectionObserver' in window)) spreads.forEach(s => s.classList.add('is-in'));
    else {
      const pio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); }),
        { rootMargin: '0px 0px -30% 0px', threshold: 0 });
      spreads.forEach(s => pio.observe(s));
    }

    /* ---------- hero entrance */
    const hero = document.querySelector('[data-who-hero]');
    if (hero) {
      if (!motion) hero.classList.add('is-on');
      else {
        const im = hero.querySelector('.who-hero__img');
        let done = false;
        // the entrance waits for the intro stage to lift (01-intro.js; immediate without an intro)
        const go = () => { if (done) return; done = true; TS.afterIntro(() => requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-on')))); };
        if (im && !im.complete && im.decode) { im.decode().then(go, go); setTimeout(go, 900); } else go();
        new IntersectionObserver(([e]) => hero.classList.toggle('is-off', !e.isIntersecting)).observe(hero);
      }
    }
    if (!motion) return;

    /* ---------- scroll / pointer linked items (one rAF loop) */
    const items = [];
    const visible = new Set();
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const it = items.find(x => x.el === e.target);
      if (!it) return;
      if (e.isIntersecting) visible.add(it); else visible.delete(it);
      kick();
    }), { rootMargin: '10% 0px 10% 0px' });
    const add = (el, update) => { if (!el) return; const it = { el, update, s: {} }; items.push(it); vio.observe(el); };

    const pointer = { x: 0, y: 0, active: false };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = (e.clientY / innerHeight) * 2 - 1;
      pointer.active = true;
      kick();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; kick(); });

    // hero: parallax (<= 40px) + pointer tilt
    if (hero) {
      const mon = hero.querySelector('[data-who-monitor]');
      const tilt = hero.querySelector('[data-who-tilt]');
      const light = hero.querySelector('[data-who-light]');
      const disp = hero.querySelector('[data-who-display]');
      add(hero, it => {
        const s = it.s;
        const r = hero.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, r.height), 0, 1);
        const usePtr = finePointer.matches && desktop.matches;
        const tx = usePtr ? pointer.x : 0, ty = usePtr ? pointer.y : 0;
        s.px = lerp(s.px || 0, tx, 0.08); s.py = lerp(s.py || 0, ty, 0.08);
        mon.style.transform = `translate3d(0,${(-40 * p).toFixed(2)}px,0) scale(${(1 - 0.06 * p).toFixed(4)})`;
        tilt.style.transform = `perspective(1400px) rotateX(${(-s.py * 2.5).toFixed(3)}deg) rotateY(${(s.px * 2.5).toFixed(3)}deg) translate3d(${(s.px * 6).toFixed(2)}px,${(s.py * 6).toFixed(2)}px,0)`;
        light.style.transform = `translate3d(${(-s.px * 10).toFixed(2)}px,${(30 * p - s.py * 10).toFixed(2)}px,0)`;
        disp.style.transform = `translate3d(0,${(-36 * p).toFixed(2)}px,0)`;
        return Math.abs(s.px - tx) > 0.001 || Math.abs(s.py - ty) > 0.001;
      });
    }

    // rock: scroll parallax + glass tile follows the pointer
    document.querySelectorAll('[data-who-par]').forEach(par => {
      const amt = parseFloat(par.dataset.whoPar) || -30;
      const glass = par.querySelector('[data-who-glass]');
      add(par.closest('.who-board') || par, it => {
        const s = it.s;
        const r = par.getBoundingClientRect();
        const c = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);  // -1 .. 1 across the screen
        par.style.transform = `translate3d(0,${(clamp(c, -1, 1) * -amt / 2).toFixed(2)}px,0)`;
        if (!glass) return false;
        const tx = finePointer.matches ? pointer.x * 6 : 0, ty = finePointer.matches ? pointer.y * 6 : 0;
        s.gx = lerp(s.gx || 0, tx, 0.08); s.gy = lerp(s.gy || 0, ty, 0.08);
        glass.style.transform = `translate3d(${s.gx.toFixed(2)}px,${s.gy.toFixed(2)}px,0)`;
        return Math.abs(s.gx - tx) > 0.01 || Math.abs(s.gy - ty) > 0.01;
      });
    });

    // dial: rotation linked to scroll through its band, eased
    document.querySelectorAll('[data-who-dial]').forEach(dial => {
      const svg = dial.querySelector('svg');
      const band = dial.closest('.who-board') || dial;
      add(band, it => {
        const s = it.s;
        const r = band.getBoundingClientRect();
        const p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
        const target = -20 + 40 * p;
        s.a = s.a == null ? target : lerp(s.a, target, 0.1);
        svg.style.setProperty('--dial', `${s.a.toFixed(3)}deg`);
        return Math.abs(s.a - target) > 0.01;
      });
    });

    // think panels: mark turns with scroll (±4deg), light drifts with the pointer (±6 %)
    spreads.forEach(sp => {
      const vis = sp.querySelector('[data-who-rot]');
      const pnl = sp.querySelector('[data-who-pnl]');
      const lightEl = pnl && pnl.querySelector('.who-pnl__light');
      if (!vis) return;
      add(sp, it => {
        const s = it.s;
        const r = pnl.getBoundingClientRect();
        const p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
        vis.style.setProperty('--rot', `${(-4 + 8 * p).toFixed(3)}deg`);
        if (lightEl && finePointer.matches) {
          const tx = pointer.x * 6, ty = pointer.y * 6;
          s.lx = lerp(s.lx || 0, tx, 0.06); s.ly = lerp(s.ly || 0, ty, 0.06);
          lightEl.style.setProperty('--lx', `${s.lx.toFixed(2)}%`);
          lightEl.style.setProperty('--ly', `${s.ly.toFixed(2)}%`);
          return Math.abs(s.lx - tx) > 0.02 || Math.abs(s.ly - ty) > 0.02;
        }
        return false;
      });
    });

    let raf = 0;
    function frame() {
      raf = 0;
      let again = false;
      visible.forEach(it => { if (it.update(it)) again = true; });
      if (again) kick();
    }
    function kick() { if (!raf && visible.size) raf = requestAnimationFrame(frame); }
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick, { passive: true });
  });
})();
