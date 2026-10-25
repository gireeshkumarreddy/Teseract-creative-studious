/* Who We Are (/who-we-are/) — images 5, 6, 7. Markup: scripts/pages/who.py, CSS: 30-who.css.
   - Hero: entrance (light sweep, monitor rise, letters rise, full stop pops) once the monitor image is
     decoded, then the light settles (bounded CSS, no endless loop); fine-pointer tilt on the monitor (±2.5deg,
     ±6px) with the light counter-moving (±10px); touch screens get the same tilt and light from the scroll
     through the hero (P-08); scroll parallax (transform only, <= 40px).
   - Boards ([data-who-in], also the rock): .is-in when they enter (grid draw, leader lines, nodes, the rock's
     rise + one bob); .is-off when they leave (pauses a bob in progress).
   - Circuit (< 1200px, [data-who-rail]): the trace, nodes and leaders are built from the layout boxes and
     grow one way with scroll (static and complete without html.motion).
   - Rock: scroll parallax (<= 30px) + a slight sway; the glass tile follows the pointer (±6px, lerped), or the
     scroll on touch screens.
   - Dial: rotation linked to scroll through band C (-20deg -> +20deg), lerped; the sphere turns with it.
   - Steps: each number box fills as its step crosses 55 % of the viewport (one-way progress).
   - Clock: the visitor's local time, minute precision, only while the intro is on screen.
   - How we think: spread counters roll in, the panel mark turns with scroll (±4deg), the light field
     drifts with the pointer (with the scroll on touch screens).
   One rAF loop serves every scroll/pointer-linked item and only runs while one of them is on screen; nothing
   moves on its own for more than a few seconds (WCAG 2.2.2).
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

    /* ---------- clock (visitor's local time, hh:mm AM/PM). Its two formatters (locale data: a few ms of app.js's first
       task at 4x CPU, PERF2-07) are made when the intro first comes near the screen; the line shows from then and stays
       hidden if they fail. Nothing moves when it shows: its row is held by the "+" mark on phones and by a min-height in
       the two-column flow (30-who.css); on desktop it is placed absolutely. */
    const clockLine = document.querySelector('[data-who-time]');
    const clock = document.querySelector('[data-who-clock]');
    if (clockLine && clock) {
      let fmt, iso, timer = 0;
      const ok = () => {
        if (fmt === undefined) {
          try {
            fmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            iso = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
          } catch (e) { fmt = null; }
        }
        return !!fmt;
      };
      const tick = () => {
        const now = new Date();
        const text = fmt.format(now).replace(/\s/g, ' ');
        if (clock.textContent !== text) clock.textContent = text;
        clock.setAttribute('datetime', iso.format(now));
      };
      const run = () => { tick(); timer = setTimeout(run, 60000 - (Date.now() % 60000) + 50); };
      const start = () => { if (!timer && ok()) { run(); clockLine.hidden = false; } };
      const stop = () => { clearTimeout(timer); timer = 0; };
      const host = clockLine.closest('section') || clockLine;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '50% 0px' }).observe(host);
      } else start();
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

    /* ---------- circuit rails (30-who.css .who-rail; phones, and since PAR2-03 the 800-1199 flow too): one trace per
       board in the left gutter, a node beside each [data-who-pin] box (h = its head / first child, l = its first text
       line, c = its centre; ! = red, - = no node: the leader runs from the trace into the box's own marker) and a leader
       into it. Only boxes that start at the left content edge are pinned: in the two-column flow a leader to the right
       column would cross the left one. Positions come from the layout boxes (offset chain), so reveal transforms never
       move a node; rebuilt whenever a board changes size. The trace centre and node edges sit on half pixels (crisp at
       1x-3x). */
    const flow = matchMedia('(max-width: 1199.98px)');
    const rails = [...document.querySelectorAll('[data-who-rail]')].map(svg => ({ svg, board: svg.parentElement, line: null, pins: [], y0: 0, y1: 0, reach: -Infinity }));
    const boxAt = (el, root) => {
      let x = 0, y = 0, n = el;
      while (n && n !== root) {
        x += n.offsetLeft; y += n.offsetTop;
        const p = n.offsetParent;
        if (p && p !== root) { x += p.clientLeft; y += p.clientTop; }
        n = p;
      }
      return n === root ? { x, y } : null;
    };
    // one-way: the trace reaches the 55 % line of the screen (as the steps do). top = the board's (= the svg's) top edge
    // on screen and vh = innerHeight, both read before any write of the frame
    const paintRail = (r, top, vh) => {
      if (!r.line || !motion) return;
      r.reach = Math.max(r.reach, vh * 0.55 - top);
      const f = clamp((r.reach - r.y0) / Math.max(1, r.y1 - r.y0), 0, 1);
      r.line.style.strokeDashoffset = (1 - f).toFixed(4);
      r.pins.forEach(pn => { if (!pn.on && r.reach >= pn.y) { pn.on = true; pn.g.classList.add('is-on'); } });
    };
    const buildRail = r => {
      const { svg, board } = r;
      if (!flow.matches || !board) { if (r.line) { svg.textContent = ''; r.line = null; r.pins = []; } return; }
      const pad = parseFloat(getComputedStyle(board).paddingLeft);
      const x = Math.floor(pad / 2) + 0.5;
      const pins = [];
      board.querySelectorAll('[data-who-pin]').forEach(el => {
        const b = boxAt(el, board);
        if (!b || !el.offsetHeight || b.x > pad + 48) return;   // right column (800-1199 flow): no leader across the left one
        const m = el.dataset.whoPin;
        let dy = el.offsetHeight / 2;
        if (m[0] === 'h' && el.firstElementChild) {
          const c = el.firstElementChild, cb = boxAt(c, board);
          if (cb) dy = cb.y - b.y + c.offsetHeight / 2;
        } else if (m[0] === 'l') {
          const cs = getComputedStyle(el);
          const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
          dy = el.clientTop + parseFloat(cs.paddingTop) + lh / 2;
        }
        // text pins keep a hair's gap before the words; boxes are met at their border
        const bare = m.includes('-');
        pins.push({ y: Math.floor(b.y + dy) + 0.5, xb: Math.round(m[0] === 'l' && !bare ? b.x - 3 : b.x), red: m.includes('!'), bare });
      });
      if (!pins.length) return;
      pins.sort((a, z) => a.y - z.y);
      const W = board.clientWidth, H = board.clientHeight;
      r.y0 = svg.dataset.from === 'edge' ? 0 : pins[0].y;
      r.y1 = svg.dataset.to === 'edge' ? H : pins[pins.length - 1].y;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = `<line class="who-wire who-wire--rail" x1="${x}" y1="${r.y0}" x2="${x}" y2="${r.y1}" pathLength="1"/>`
        + pins.map(pn => {
          const x1 = pn.bare ? x : x + 4.5;
          return '<g class="who-pin">'
            + (pn.xb > x1 ? `<line class="who-rail__lead" x1="${x1}" y1="${pn.y}" x2="${pn.xb}" y2="${pn.y}" pathLength="1"/>` : '')
            + (pn.bare ? '' : `<g class="who-node${pn.red ? ' who-node--red' : ''}"><rect class="who-node__o" x="${x - 4}" y="${pn.y - 4}" width="8" height="8"/>`
              + `<rect class="who-node__i" x="${x - 1.5}" y="${pn.y - 1.5}" width="3" height="3"/></g>`)
            + '</g>';
        }).join('');
      r.line = svg.querySelector('.who-wire--rail');
      r.pins = [...svg.querySelectorAll('.who-pin')].map((g, i) => ({ g, y: pins[i].y, on: false }));
      paintRail(r, board.getBoundingClientRect().top, innerHeight);
    };
    if (rails.length) {
      const all = () => rails.forEach(buildRail);
      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(es => es.forEach(e => { const r = rails.find(x => x.board === e.target); if (r) buildRail(r); }));
        rails.forEach(r => r.board && ro.observe(r.board));
      } else { all(); addEventListener('resize', all, { passive: true }); }
      if (flow.addEventListener) flow.addEventListener('change', all);
    }

    /* ---------- hero entrance: without the intro the inline starter after the hero (pages/who.py, .who-hero--cued)
       normally runs it before app.js; this path is the fallback and the intro session's */
    const hero = document.querySelector('[data-who-hero]');
    if (hero) {
      if (!motion) hero.classList.add('is-on');
      else {
        const im = hero.querySelector('.who-hero__img');
        const show = () => hero.classList.add('is-on');
        let done = false;
        // the entrance waits for the intro stage to lift (01-intro.js; immediate without an intro)
        const go = () => { if (done) return; done = true; TS.afterIntro(() => requestAnimationFrame(() => requestAnimationFrame(show))); };
        // late script, no starter: the CSS fail-safe fade (30-who.css, from 1 s) may already show the hero; show it in
        // the same style change that ends it (html.is-ready, this task), so nothing drops back and replays
        const now = document.timeline && document.timeline.currentTime;
        if (now != null && now > 900 && !hero.classList.contains('who-hero--cued') && !TS.intro.held()) { done = true; show(); }
        else if (im && !im.complete && im.decode) { im.decode().then(go, go); setTimeout(go, 900); } else go();
        new IntersectionObserver(([e]) => hero.classList.toggle('is-off', !e.isIntersecting)).observe(hero);
      }
    }
    if (!motion) return;

    /* ---------- scroll / pointer linked items (one rAF loop). Each item has a read (layout: rects, innerHeight) and a
       write (transforms, dash offsets): a frame runs every read first, then every write, so no read follows a write and
       the frame lays out at most once (PERF2-03); items on the same board share one rect. */
    const items = [];
    const visible = new Set();
    const vio = new IntersectionObserver(es => es.forEach(e => {
      // a board can carry several items (rock + rail, dial + rail)
      items.forEach(it => { if (it.el === e.target) { if (e.isIntersecting) visible.add(it); else visible.delete(it); } });
      kick();
    }), { rootMargin: '10% 0px 10% 0px' });
    const add = (el, read, write) => { if (!el) return; const it = { el, read, write, s: {} }; items.push(it); vio.observe(el); };
    const rects = new Map();
    const rectOf = el => { let r = rects.get(el); if (!r) { r = el.getBoundingClientRect(); rects.set(el, r); } return r; };
    let vh = innerHeight;

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
        const r = rectOf(hero);
        it.s.p = clamp(-r.top / Math.max(1, r.height), 0, 1);
      }, it => {
        const s = it.s, p = s.p;
        const usePtr = finePointer.matches && desktop.matches;
        // touch screens (no hover pointer): the same tilt and counter-moving light, fed by the scroll through the
        // hero - the monitor turns a little and its top leans back as it rises (P-08)
        const useScroll = !finePointer.matches;
        const tx = usePtr ? pointer.x : useScroll ? p * 0.7 : 0, ty = usePtr ? pointer.y : useScroll ? -p : 0;
        s.px = lerp(s.px || 0, tx, 0.08); s.py = lerp(s.py || 0, ty, 0.08);
        mon.style.transform = `translate3d(0,${(-40 * p).toFixed(2)}px,0) scale(${(1 - 0.06 * p).toFixed(4)})`;
        tilt.style.transform = `perspective(1400px) rotateX(${(-s.py * 2.5).toFixed(3)}deg) rotateY(${(s.px * 2.5).toFixed(3)}deg) translate3d(${(s.px * 6).toFixed(2)}px,${(s.py * 6).toFixed(2)}px,0)`;
        light.style.transform = `translate3d(${(-s.px * 10).toFixed(2)}px,${(30 * p - s.py * 10).toFixed(2)}px,0)`;
        disp.style.transform = `translate3d(0,${(-36 * p).toFixed(2)}px,0)`;
        return Math.abs(s.px - tx) > 0.003 || Math.abs(s.py - ty) > 0.003;   // < 0.03 px / 0.01deg from rest: stop
      });
    }

    // rock: scroll parallax + glass tile follows the pointer
    document.querySelectorAll('[data-who-par]').forEach(par => {
      const amt = parseFloat(par.dataset.whoPar) || -30;
      const glass = par.querySelector('[data-who-glass]');
      add(par.closest('.who-board') || par, it => {
        const r = rectOf(par);
        it.s.c = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);  // -1 .. 1 across the screen
      }, it => {
        const s = it.s, c = s.c;
        // parallax + a slight sway (the rock's float lives in the scroll; its CSS bob plays once, A11Y-06)
        par.style.transform = `translate3d(0,${(c * -amt / 2).toFixed(2)}px,0) rotate(${(c * -0.8).toFixed(3)}deg)`;
        if (!glass) return false;
        // the glass tile drifts against the rock: with the pointer, or with the scroll on touch screens (P-08), so it
        // reads as a pane floating in front rather than a grey patch
        const fine = finePointer.matches;
        const tx = fine ? pointer.x * 6 : c * -5, ty = fine ? pointer.y * 6 : c * 9;
        s.gx = lerp(s.gx || 0, tx, 0.08); s.gy = lerp(s.gy || 0, ty, 0.08);
        glass.style.transform = `translate3d(${s.gx.toFixed(2)}px,${s.gy.toFixed(2)}px,0)`;
        return Math.abs(s.gx - tx) > 0.04 || Math.abs(s.gy - ty) > 0.04;
      });
    });

    // dial: rotation linked to scroll through its band, eased; written as the svg's own transform (an inherited custom
    // property would restyle the whole drawing every frame)
    document.querySelectorAll('[data-who-dial]').forEach(dial => {
      const svg = dial.querySelector('svg');
      const band = dial.closest('.who-board') || dial;
      const sphere = band.querySelector('.who-sphere svg');   // turns with the dial (half a turn each way), no spin of its own
      add(band, it => {
        const r = rectOf(band);
        it.s.p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      }, it => {
        const s = it.s;
        const target = -20 + 40 * s.p;
        s.a = s.a == null ? target : lerp(s.a, target, 0.1);
        svg.style.transform = `rotate(${s.a.toFixed(3)}deg)`;
        if (sphere) sphere.style.transform = `rotate(${(s.a * 9).toFixed(2)}deg)`;
        return Math.abs(s.a - target) > 0.02;
      });
    });

    // think panels: mark turns with scroll (±4deg), light drifts with the pointer (±6 %); both written as transforms
    spreads.forEach(sp => {
      const vis = sp.querySelector('[data-who-rot]');
      const pnl = sp.querySelector('[data-who-pnl]');
      const lightEl = pnl && pnl.querySelector('.who-pnl__light');
      if (!vis) return;
      add(sp, it => {
        const r = rectOf(pnl);
        it.s.p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      }, it => {
        const s = it.s, p = s.p;
        vis.style.transform = `translate(-50%,-50%) rotate(${(-4 + 8 * p).toFixed(3)}deg)`;
        if (lightEl) {
          // with the pointer, or with the panel's scroll on touch screens (P-08)
          const fine = finePointer.matches;
          const tx = fine ? pointer.x * 6 : (p - 0.5) * 12, ty = fine ? pointer.y * 6 : (0.5 - p) * 8;
          s.lx = lerp(s.lx || 0, tx, 0.06); s.ly = lerp(s.ly || 0, ty, 0.06);
          lightEl.style.transform = `translate3d(${s.lx.toFixed(2)}%,${s.ly.toFixed(2)}%,0)`;
          return Math.abs(s.lx - tx) > 0.05 || Math.abs(s.ly - ty) > 0.05;   // 0.05 % of the light = a fifth of a pixel
        }
        return false;
      });
    });

    // circuit rails: grow with the scroll while their board is on screen
    rails.forEach(r => r.board && add(r.board, it => { it.s.top = rectOf(r.board).top; }, it => { paintRail(r, it.s.top, vh); return false; }));

    let raf = 0;
    function frame() {
      raf = 0;
      const live = [...visible];
      vh = innerHeight;
      live.forEach(it => it.read(it));
      rects.clear();
      let again = false;
      live.forEach(it => { if (it.write(it)) again = true; });
      if (again) kick();
    }
    function kick() { if (!raf && visible.size) raf = requestAnimationFrame(frame); }
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick, { passive: true });
  });
})();
