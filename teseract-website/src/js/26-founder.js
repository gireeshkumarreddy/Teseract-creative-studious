/* FOUNDER ("Portrait in light"): Who We Are #founder + #why and the home teaser #founder-teaser.
   Markup: scripts/sections/founder.py (+ pages/who.py, sections/home_founder.py) · CSS: src/css/26-founder.css.
   - Fit: both nameplate lines are scaled (--k1/--k2, transform only) to the name's width: on init, when the fonts
     are ready and on resize (never per frame).
   - Entrances ([data-fdr-in]): .is-in once at 30 % visible, after the intro.
   - Light: the plate's warm light follows a finger (passive touch listeners, never preventDefault: the page always
     scrolls) or the mouse, and returns to rest; one sweep on entrance. It never moves on scroll alone, and its job
     stops as soon as it has settled (a resting pointer costs nothing). --lx/--ly are written on the two layers that
     use them, only on change.
   - Journey: a split-flap board (forward-only riffle through his four disciplines) + route strip. Phones (< 800px):
     driven by scroll through the real headline (by the board itself when the journey is taller than the screen,
     e.g. landscape). >= 800px (board beside the plate, all in view at once): the story plays by itself once the
     board is in view (leg 1 ~1.2 s, leg 2 ~1.4 s, then leg 3 stays). Everywhere: a tap on a line flies that leg, a
     tap on the board the next one.
   - Quotes: scroll-linked ink (--p on the figure); quote 2's full stop lights up orange when the swap completes.
   - Restore (#why): tap / click / Enter (keydown) / Space (keyup) toggles a struck line, never on key repeat; each
     line's description tells its state; when "Gireesh wanted to build something different." reaches the reading
     line, the lines still struck restore themselves (once).
   - Teaser: the route strip plays once at 40 % visible, replays on tap (and on mouse enter, throttled).
   One rAF loop serves every job, only while one of them is on screen; all jobs read layout first, then write.
   Reduced motion (no html.motion): instant state changes (the fit, the board drivers and restore still work); no
   sweep, lerp or draws. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    if (!document.querySelector('[data-fdr-fit],[data-fdr-q],[data-fdr-rs]')) return;
    const motion = TS.motion ? TS.motion() : false;
    const after = TS.afterIntro || (f => f());
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const wide = matchMedia('(min-width: 800px)');
    const IO = 'IntersectionObserver' in window;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const EASE = 'cubic-bezier(.22,1,.36,1)';
    const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    let nav = navH();
    addEventListener('resize', () => { nav = navH(); });

    /* ---------- shared rAF scheduler. A job is { read?() -> data, run(data, dt) -> keepGoing }. Every job's layout
       read happens first, then every write, so one frame never forces a style recalc between two jobs (a write
       followed by another job's getBoundingClientRect). dt is capped at 64 ms. */
    const jobs = new Set();
    let raf = 0, last = 0;
    const loop = t => {
      raf = 0;
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      const list = [...jobs], data = list.map(j => (j.read ? j.read() : null));
      list.forEach((j, i) => { if (!j.run(data[i], dt)) jobs.delete(j); });
      if (jobs.size) raf = requestAnimationFrame(loop); else last = 0;
    };
    const kick = job => { if (job) jobs.add(job); if (!raf && jobs.size) raf = requestAnimationFrame(loop); };
    // scroll-linked jobs run (once per frame) only while their element is near the viewport
    const near = new Set();
    const onScroll = () => near.forEach(j => kick(j));
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    const scrollJob = (el, job, rootMargin) => {
      if (!IO) return;
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { near.add(job); kick(job); } else near.delete(job);
      }, { rootMargin }).observe(el);
    };

    /* rolling counter (01 -> 02, 0/3 -> 1/3): the new value rises into a 1em window */
    function rollTo(roll, text) {
      if (!roll) return;
      const cur = roll.lastElementChild;
      if (cur && cur.textContent === text) return;
      const nu = document.createElement('span');
      nu.textContent = text;
      if (!motion || !cur || !roll.animate) { roll.replaceChildren(nu); return; }
      [...roll.children].forEach(s => { if (s !== cur) s.remove(); });
      roll.appendChild(nu);
      nu.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 450, easing: EASE });
      cur.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 450, easing: EASE, fill: 'forwards' })
        .finished.then(() => cur.remove(), () => cur.remove());
    }

    /* ---------- 1. nameplate fit */
    function fit() {
      const names = [...document.querySelectorAll('[data-fdr-fit]')];
      if (!names.length) return;
      const run = () => names.forEach(n => {
        const target = n.clientWidth;
        if (!target) return;
        n.querySelectorAll('[data-fit]').forEach((l, i) => {
          const w = l.offsetWidth;
          if (!w) return;
          const k = clamp(target / w, .88, 1.12).toFixed(4), prop = `--k${i + 1}`;
          if (n.style.getPropertyValue(prop) !== k) n.style.setProperty(prop, k);
        });
      });
      run();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(run);
        names.forEach(n => ro.observe(n.parentElement));
      } else addEventListener('resize', run);
    }

    /* ---------- 2. entrances */
    function entrances() {
      const els = [...document.querySelectorAll('[data-fdr-in]')];
      const enter = el => { el.classList.add('is-in'); el.dispatchEvent(new CustomEvent('fdr:in')); };
      if (!motion || !IO) { els.forEach(enter); return; }
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        enter(e.target);
      }), { threshold: .3 });
      after(() => els.forEach(el => io.observe(el)));
    }

    /* ---------- 3. the light on the plate */
    function light(fr) {
      const REST = { x: 68, y: 30 }, cur = { x: REST.x, y: REST.y }, tgt = { x: REST.x, y: REST.y };
      // --lx/--ly live on the two layers that use them (registered non-inherited in 26-founder.css): a custom property
      // written on the frame would restyle its whole subtree (the nameplate letters, the 12 texture rows) each time
      const layers = [...fr.querySelectorAll('.fdr-frame__light,.fdr-frame__tex')];
      let input = false, sweep = null, visible = !IO, wx = -1e3, wy = -1e3;
      const write = () => {
        const dx = Math.abs(cur.x - wx) > .05, dy = Math.abs(cur.y - wy) > .05;
        if (!dx && !dy) return;
        if (dx) wx = cur.x;
        if (dy) wy = cur.y;
        layers.forEach(l => {
          if (dx) l.style.setProperty('--lx', `${wx.toFixed(2)}%`);
          if (dy) l.style.setProperty('--ly', `${wy.toFixed(2)}%`);
        });
      };
      const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const job = {
        run(_, dt) {
          if (!visible) return false;
          if (sweep) {                                       // one sweep from the top-left to rest (2.4 s, never looped)
            const t = (performance.now() - sweep.t0) / 2400;
            const e = ease(clamp(t, 0, 1));
            cur.x = 10 + (REST.x - 10) * e;
            cur.y = 6 + (REST.y - 6) * e;
            if (t >= 1) sweep = null;
            write();
            return true;
          }
          const to = input ? tgt : REST;
          const a = 1 - Math.exp(-dt / (input ? 90 : 220));   // follow 90 ms, return 220 ms (frame-rate independent)
          cur.x += (to.x - cur.x) * a;
          cur.y += (to.y - cur.y) * a;
          const moving = Math.abs(to.x - cur.x) > .05 || Math.abs(to.y - cur.y) > .05;
          if (!moving) { cur.x = to.x; cur.y = to.y; }
          write();
          return moving;                                     // settled: stop (the next move kicks the job again)
        },
      };
      const point = (cx, cy) => {
        const r = fr.getBoundingClientRect();
        if (!r.width || !r.height) return;
        tgt.x = clamp((cx - r.left) / r.width * 100, 4, 96);
        tgt.y = clamp((cy - r.top) / r.height * 100, 4, 96);
        input = true;
        sweep = null;
        if (!motion) { cur.x = tgt.x; cur.y = tgt.y; write(); } else kick(job);
      };
      const release = () => {
        if (!input) return;
        input = false;
        if (!motion) { cur.x = REST.x; cur.y = REST.y; write(); } else kick(job);
      };
      // touch: passive listeners only (never preventDefault, touch-action untouched): the light follows the finger even
      // while it scrolls the page
      const touch = e => { const t = e.touches[0]; if (t) point(t.clientX, t.clientY); };
      fr.addEventListener('touchstart', touch, { passive: true });
      fr.addEventListener('touchmove', touch, { passive: true });
      fr.addEventListener('touchend', e => { if (!e.touches.length) release(); }, { passive: true });
      fr.addEventListener('touchcancel', release, { passive: true });
      fr.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && fine.matches) point(e.clientX, e.clientY); });
      fr.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') release(); });
      if (!motion) return;
      fr.addEventListener('fdr:in', () => {
        if (input) return;
        cur.x = 10; cur.y = 6;
        write();
        sweep = { t0: performance.now() + 300 };
        kick(job);
      }, { once: true });
      if (IO) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(job); }, { rootMargin: '10%' }).observe(fr);
    }

    /* ---------- 4. journey: split-flap board + route strip + departure list */
    function flapModule(el, deck) {
      const top = el.querySelector('.fdr-flap__h--t .fdr-flap__w'), bot = el.querySelector('.fdr-flap__h--b .fdr-flap__w');
      let cur = el.dataset.word, target = cur, busy = false;
      const leaf = (half, word) => {
        const s = document.createElement('span'), w = document.createElement('span');
        s.className = `fdr-flap__leaf fdr-flap__leaf--${half}`;
        w.className = 'fdr-flap__w';
        w.textContent = word;
        s.appendChild(w);
        el.appendChild(s);
        return s;
      };
      const settle = word => { cur = word; top.textContent = word; bot.textContent = word; el.dataset.word = word; };
      const step = () => {
        if (cur === target) { busy = false; return; }
        busy = true;
        const i = deck.indexOf(cur);
        const steps = (deck.indexOf(target) - i + deck.length) % deck.length;
        const next = deck[(i + 1) % deck.length];
        if (!motion || !el.animate || i < 0) { settle(target); busy = false; return; }
        const last1 = steps === 1;
        const fallD = last1 ? 120 : 45, landD = last1 ? 150 : 60;
        // a real Solari step: the static top shows the next word at once, the old top half falls over it, then the
        // next word's bottom half lands; the static bottom half changes when it has landed
        const fall = leaf('t', cur);
        top.textContent = next;
        const land = leaf('b', next);
        land.style.transform = 'rotateX(90deg)';
        fall.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }],
          { duration: fallD, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' }).finished
          .then(() => {
            fall.remove();
            return land.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }],
              { duration: landD, easing: 'cubic-bezier(.3,1.25,.55,1)', fill: 'forwards' }).finished;
          })
          .catch(() => {})
          .then(() => {
            land.remove();
            settle(next);
            if (cur !== target) step(); else busy = false;   // riffle on (the target may have changed meanwhile)
          });
      };
      return { to(word) { if (deck.indexOf(word) < 0) return; target = word; if (!busy) step(); } };
    }

    function journey() {
      const j = document.querySelector('[data-fdr-journey]');
      if (!j) return;
      const board = j.querySelector('[data-fdr-board]');
      const rows = [...j.querySelectorAll('.fdr-dep__row')];
      if (!board || rows.length !== 3) return;
      const deck = (board.dataset.deck || '').split('|');
      const [from, to] = [...board.querySelectorAll('[data-flap]')].map(el => flapModule(el, deck));
      const roll = board.querySelector('.fdr-board__n .fdr-roll');
      const sec = j.closest('section');
      const frame = sec && sec.querySelector('[data-fdr-frame]');
      let leg = 1, hold = false, story = true, inView = false, arrive = 0, tTo = 0, storyT = 0;
      j.classList.add('is-live');
      const setLeg = k => {
        if (k === leg) return;
        leg = k;
        from.to(deck[k - 1]);
        clearTimeout(tTo);
        if (motion) tTo = setTimeout(() => to.to(deck[k]), 90); else to.to(deck[k]);
        rows.forEach((r, i) => r.classList.toggle('is-on', i === k - 1));
        rollTo(roll, String(k).padStart(2, '0'));
        board.dataset.leg = String(k);
        clearTimeout(arrive);
        board.classList.remove('is-arrived');
        if (k === 3) { if (motion) arrive = setTimeout(() => board.classList.add('is-arrived'), 600); else board.classList.add('is-arrived'); }
      };

      // (a) phones (< 800px): the board sits above the list, so scroll drives it. The journey's centre travels from
      // 82 % to 35 % of the viewport (thresholds .34 / .67, .02 hysteresis so a leg never flickers at a boundary).
      // When the journey is taller than ~80 % of the visible height (landscape), the board's own centre drives it, so
      // both flaps flip while they are in view rather than under the nav.
      const measure = {
        read() {
          if (hold || wide.matches) return null;
          const vh = innerHeight;
          return { r: (j.offsetHeight > .8 * (vh - nav) ? board : j).getBoundingClientRect(), vh };
        },
        run(d) {
          if (!d) return false;
          const p = clamp((.82 * d.vh - (d.r.top + d.r.height / 2)) / (.47 * d.vh), 0, 1);
          const up = p >= .69 ? 3 : p >= .36 ? 2 : 1;
          const down = p < .32 ? 1 : p < .65 ? 2 : 3;
          if (up > leg) setLeg(up); else if (down < leg) setLeg(down);
          return false;
        },
      };
      after(() => scrollJob(j, measure, '0px'));
      if (IO) new IntersectionObserver(([e]) => { if (!e.isIntersecting) hold = false; }).observe(j);

      // (a') >= 800px: the board is beside the plate and the whole journey is in view at once, so a scroll mapping
      // would finish the story before the visitor settles. Instead it plays by itself, once: when the board is (nearly)
      // fully in view below the nav, after the intro and the plate's entrance, leg 1 holds ~1.2 s, leg 2 ~1.4 s, then
      // leg 3 stays. It pauses while the board is out of view, never runs backwards and stops at the first tap.
      // A #founder landing therefore starts on 01 — 03.
      const play = () => {
        clearTimeout(storyT);
        if (!story || hold || !inView || !wide.matches || leg >= 3) return;
        if (frame && !frame.classList.contains('is-in')) return;     // fdr:in calls play again
        storyT = setTimeout(() => {
          if (story && !hold && inView && wide.matches && leg < 3) { setLeg(leg + 1); play(); }
        }, leg === 1 ? 1200 : 1400);
      };
      if (frame) frame.addEventListener('fdr:in', play);
      if (IO) after(() => {
        const need = () => Math.min(.9, (innerHeight - nav) * .95 / Math.max(1, board.offsetHeight));
        new IntersectionObserver(([e]) => {
          const was = inView;
          inView = e.isIntersecting && e.intersectionRatio >= need() - .005;
          if (inView && !was) play(); else if (!inView && was) clearTimeout(storyT);
        }, { rootMargin: `-${Math.round(nav)}px 0px 0px 0px`, threshold: Array.from({ length: 21 }, (_, i) => i / 20) }).observe(board);
      });

      // (b) a line flies its leg; (c) the board flies the next one (3 wraps to 1). Manual input ends the story and
      // pauses the scroll driver until the journey leaves the viewport. Click only (no touch handlers).
      const manual = k => { hold = true; story = false; clearTimeout(storyT); setLeg(k); };
      rows.forEach((r, i) => r.addEventListener('click', () => manual(i + 1)));
      board.addEventListener('click', () => manual(leg % 3 + 1));
    }

    /* ---------- 5. pull quotes: emphasis moves from sentence 1 to sentence 2 (founder.py times each word's --a) */
    function quotes() {
      if (!motion || !IO) return;                           // CSS default = the end state
      document.querySelectorAll('[data-fdr-q]').forEach(q => {
        q.classList.add('is-ink');
        const dot = q.querySelector('.fdr-dot');
        let lastP = -1;
        const job = {
          read: () => q.getBoundingClientRect(),
          run(r) {
            const vh = innerHeight;
            const p = clamp((.85 * vh - (r.top + r.height / 2)) / (.40 * vh), 0, 1);
            if (Math.abs(p - lastP) > .002 || ((p === 0 || p === 1) && p !== lastP)) { lastP = p; q.style.setProperty('--p', p.toFixed(3)); }
            if (dot && p >= .85) q.classList.add('is-dot');  // the swap is complete: the full stop lights up (one-way)
            return false;
          },
        };
        job.run(job.read());
        scrollJob(q, job, '20%');
      });
    }

    /* ---------- 6. restore (Why TESERACT exists) */
    function restore() {
      const box = document.querySelector('[data-fdr-rs]');
      if (!box) return;
      const head = box.querySelector('.fdr-rs__head'), hint = box.querySelector('.fdr-rs__hint');
      const roll = box.querySelector('.fdr-rs__count .fdr-roll');
      const lines = [...box.querySelectorAll('[data-swap]')];
      const touched = new Set();
      let struckAt = 0, auto = false;
      if (head) head.hidden = false;
      box.classList.add('is-armed');
      if (hint && hint.dataset.fine && fine.matches) hint.textContent = hint.dataset.fine;
      // the strike is visual only, so each line's description says its state (owner micro-labels, pages/who.py)
      const desc = ['Struck through. Press to restore.', 'Restored. Press to strike through again.'].map((t, i) => {
        const s = document.createElement('span');
        s.id = `fdr-rs-d${i}`;
        s.hidden = true;
        s.textContent = t;
        box.appendChild(s);
        return s.id;
      });
      const isOn = l => l.classList.contains('is-restored');
      const set = (l, on) => {
        l.classList.toggle('is-restored', on);
        l.setAttribute('aria-pressed', on ? 'true' : 'false');
        l.setAttribute('aria-describedby', desc[on ? 1 : 0]);
        const n = lines.filter(isOn).length;
        rollTo(roll, String(n));
        box.classList.toggle('is-whole', n === lines.length);
      };
      lines.forEach(l => {
        l.setAttribute('role', 'button');
        l.tabIndex = 0;
        l.setAttribute('aria-pressed', 'false');
        l.setAttribute('aria-describedby', desc[0]);
        l.addEventListener('click', () => { touched.add(l); l.classList.add('is-touched'); set(l, !isOn(l)); });
        // native-button keys: Enter acts on keydown, Space on keyup (its keydown only stops the page scrolling);
        // a held key never repeats the toggle
        let space = false;
        l.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) l.click(); }
          else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (!e.repeat) space = true; }
        });
        l.addEventListener('keyup', e => {
          if ((e.key === ' ' || e.key === 'Spacebar') && space) { space = false; e.preventDefault(); l.click(); }
        });
        l.addEventListener('blur', () => { space = false; });
      });
      const breathe = () => {                                // the invitation: once, on the first line still struck
        const l = lines.find(x => !isOn(x));
        const v = l && l.querySelector('.fdr-rs__v');
        if (!v) return;
        v.classList.add('is-breathe');
        v.addEventListener('animationend', () => v.classList.remove('is-breathe'), { once: true });
      };
      const strike = () => {
        if (struckAt) return;
        struckAt = performance.now();
        box.classList.add('is-struck');
        if (motion) setTimeout(breathe, 450 + (lines.length - 1) * 300 + 1400);
      };
      if (!motion || !IO) strike();
      else after(() => {
        const io = new IntersectionObserver(([e]) => { if (e.intersectionRatio >= .3) { io.disconnect(); strike(); } }, { threshold: .3 });
        io.observe(box);
      });
      // auto-restore: the answer paragraph reaching the reading line restores what the visitor has not touched
      const trigger = document.querySelector('[data-fdr-rs-trigger]');
      if (!trigger || !IO) return;
      const run = () => {
        if (auto) return;
        auto = true;
        strike();
        const wait = motion ? Math.max(0, 1600 - (performance.now() - struckAt)) : 0;
        const todo = lines.filter(l => !isOn(l) && !touched.has(l));
        setTimeout(() => todo.forEach((l, i) => {
          const go = () => { if (!isOn(l) && !touched.has(l)) set(l, true); };
          if (motion) setTimeout(go, i * 260); else go();
        }), wait);
      };
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } },
        { rootMargin: matchMedia('(min-width: 1200px)').matches ? '0px 0px -55% 0px' : '0px 0px -40% 0px' });
      after(() => io.observe(trigger));
    }

    /* ---------- 7. home teaser: the route strip plays once, replays on tap */
    function teaser() {
      const s = document.querySelector('[data-fdr-strip][data-play]');
      if (!s || !motion) return;
      const play = () => { s.classList.remove('is-played'); void s.getBoundingClientRect(); s.classList.add('is-played'); };
      if (IO) after(() => {
        const io = new IntersectionObserver(([e]) => { if (e.intersectionRatio >= .4) { io.disconnect(); play(); } }, { threshold: .4 });
        io.observe(s);
      });
      s.addEventListener('click', play);
      const sec = s.closest('.fdt');
      let lastHover = 0;
      if (sec) sec.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse' || !fine.matches || !s.classList.contains('is-played')) return;
        const now = performance.now();
        if (now - lastHover < 2500) return;
        lastHover = now;
        play();
      });
    }

    fit();
    entrances();
    document.querySelectorAll('[data-fdr-frame]').forEach(light);
    journey();
    quotes();
    restore();
    teaser();
  });
})();
