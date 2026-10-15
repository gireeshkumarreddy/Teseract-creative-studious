/* Intro logo animation: beat 4 (the lockup's FLIP flight into the live header logo, the stage lift, the handover),
   the pointer light and the skip (owner, 14 Oct). Beats 1-3 are pure CSS (04-intro.css); markup: scripts/chrome_intro.py.
   Runs only when the inline <head> script (chrome.py) added html.ts-intro: once per tab session, never on internal
   navigations, never under reduced motion / Save-Data / forced colours. ?intro=1 replays it, ?intro=0 suppresses it.
   - Skip: click/tap, any key, wheel, touch-move or a scroll fast-forwards to the header landing in <= 350 ms.
   - Scroll is held only while it plays, by intercepting wheel / touch / scroll keys (never overflow:hidden,
     TS.lockScroll or lenis.stop(): those drop the Windows scrollbar and shift the header the lockup flies into).
   - Hand-off: TS.afterIntro(fn) runs fn as the stage lifts (immediately when there is no intro); 'ts:intro-done'
     fires then, 'ts:intro-end' once the overlay is gone. Section scripts hold their entrances with it.
   Loaded before 02-core.js, so its input listeners run before Lenis and the section scripts see the events. */
(() => {
  'use strict';
  const root = document.documentElement, body = document.body;
  const TS = window.TS = window.TS || {};
  const ov = document.querySelector('[data-intro]');
  const CUE = 2260;                 // end of the CSS beats (the .tsi__cue animation): beat 4 starts here
  /* Owner-tunable feel. CSS: echo trail .26, lock glint .5, light pool alpha .10 (04-intro.css). */
  const TILT_Y = 10, TILT_X = 7, TORCH_TILT = 0.8, SHADE = 0.32, LERP_LIGHT = 0.12, LERP_TORCH = 0.3, LERP_TILT = 0.1;

  let state = 'off', flushed = false, skipped = false, raf = 0, armed = false, locked = true;
  const queue = [], timers = [], offs = [], anims = [];
  const fire = n => document.dispatchEvent(new CustomEvent(n, { detail: { skipped } }));
  function flush(lift) {
    if (flushed) return;
    flushed = true;
    if (lift) root.classList.add('tsi-lift');
    body.removeAttribute('data-video-hold');
    queue.splice(0).forEach(fn => { try { fn(); } catch (e) { setTimeout(() => { throw e; }); } });
    if (TS.syncVideos) TS.syncVideos(body);
    fire('ts:intro-done');
  }
  TS.afterIntro = fn => { if (state === 'off' || flushed) fn(); else queue.push(fn); };
  let skipFn = () => {};
  TS.intro = { active: () => state !== 'off' && state !== 'done', held: () => state !== 'off' && !flushed, skip: () => skipFn() };
  // the <head> script's pre-JS skip listener (and the one that drops it once the CSS failsafe exit begins, so input
  // after that exit never re-arms .tsi-skip and blinks the header logo / restarts the H1 rise when app.js is missing)
  const headK = window.__tsiK, headF = window.__tsiF;
  const dropHead = () => {
    if (headK) ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach(t => removeEventListener(t, headK, true));
    if (headF) removeEventListener('animationstart', headF, true);
  };
  const CLASSES = ['ts-intro', 'tsi-go', 'tsi-js', 'tsi-wait', 'tsi-skip', 'tsi-lift', 'tsi-landed'];
  if (!ov || !root.classList.contains('ts-intro')) { if (ov) ov.remove(); root.classList.remove(...CLASSES); dropHead(); return; }
  // app.js is one file: an exception here must never stop the partials after it, nor leave the stage up
  try { boot(); } catch (err) {
    state = 'done';
    try { flush(true); } finally {
      timers.forEach(clearTimeout); cancelAnimationFrame(raf); offs.forEach(f => f()); dropHead();
      root.classList.remove(...CLASSES); ov.remove();
    }
    setTimeout(() => { throw err; });
  }

  function boot() {
    const $ = s => ov.querySelector(s);
    const cue = $('.tsi__cue');
    const cueAnim = cue && cue.getAnimations && cue.getAnimations().find(a => a.animationName === 'tsi-cue');
    state = 'play';
    body.setAttribute('data-video-hold', '');           // 06-video.js: no clip loads or plays under the stage
    if (!cueAnim) { end(false); return; }
    const clock = () => (cueAnim.currentTime == null ? 0 : +cueAnim.currentTime);
    const t0 = clock(), pre = root.classList.contains('tsi-skip'), since = pre ? performance.now() - (window.__tsiT || 0) : 0;
    if (t0 >= 4300 || since >= 550) {                   // very late script: the CSS exit already owns the overlay
      state = 'css'; dropHead();
      const at = since >= 550 ? Math.max(0, 600 - since) : Math.max(0, 4400 - t0);
      timers.push(setTimeout(() => flush(false), at));
      timers.push(setTimeout(() => { state = 'done'; ov.remove(); fire('ts:intro-end'); }, at + 560));
      return;                                           // html classes stay, so the hero H1 animation never restarts
    }
    root.classList.add('tsi-js');
    dropHead();

    const veil = $('.tsi__veil'), tail = $('.tsi__tail'), light = $('.tsi__light'), lock = $('.tsi__lock'), tilt = $('.tsi__tilt');
    const fxM = $('.tsi__fx--mark'), fxW = $('.tsi__fx--word');
    const fyM = fxM && fxM.querySelector('.tsi__fy'), fyW = fxW && fxW.querySelector('.tsi__fy');
    const brand = document.querySelector('.hdr-brand');
    const hMark = brand && brand.querySelector('.hdr-brand__mark'), hWord = brand && brand.querySelector('.hdr-brand__word');
    if (!veil || !tail || !light || !lock || !tilt || !fyM || !fyW) { end(false); return; }
    const cs = getComputedStyle(root);
    const tok = (name, fallback) => (cs.getPropertyValue(name) || '').trim() || fallback;
    const EASE = tok('--ease', 'cubic-bezier(.22,1,.36,1)'), EX = tok('--ease-fly-x', 'cubic-bezier(.62,0,.18,1)'),
      EY = tok('--ease-fly-y', 'cubic-bezier(.4,0,.1,1)'), ELIFT = tok('--ease-lift', 'cubic-bezier(.7,0,.2,1)');
    const fineMQ = matchMedia('(hover: hover) and (pointer: fine)'), phoneMQ = matchMedia('(max-width: 799.98px)'),
      reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
    const facets = [...ov.querySelectorAll('.tsi__ring .tsi__sh')].map(sh => ({ el: sh.querySelector('.tsi__shade'), n: (sh.dataset.n || '0,0').split(',').map(Number), v: 0 }))
      .filter(f => f.el);
    // The one layout read of the loop: the lockup is centred, and so is the solo mark (its dock offset puts it there).
    const L0 = lock.getBoundingClientRect(), OX = ov.clientWidth / 2, OY = ov.clientHeight / 2;
    const ka = parseFloat(getComputedStyle(ov).getPropertyValue('--ka')) || 1.5;
    const CX = L0.left + L0.width / 2, CY = L0.top + L0.height / 2, R = 0.75 * fxM.offsetWidth * ka;
    const w0 = innerWidth, y0 = scrollY;
    let px = CX, py = CY, lx = CX, ly = CY, rx = 0, ry = 0, hasPointer = false, torch = null, last = 0;
    let L1 = null, from = null, to = null;            // flight: lock rect, source rects, header rects at take-off

    /* ---------- curves: smoothstep envelope, frame-rate independent lerp, a JS mirror of the tsi-spin keyframes */
    const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const envAt = t => smooth(250, 600, t) * (1 - smooth(1850, 2200, t));
    const lerpK = (x, dt) => 1 - Math.pow(1 - x, dt / 16.7);
    const clamp1 = v => Math.max(-1, Math.min(1, v));
    const bezier = (x1, y1, x2, y2) => x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, u = x;
      for (let i = 0; i < 24; i++) {
        u = (lo + hi) / 2;
        if (3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u < x) lo = u; else hi = u;
      }
      return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    };
    const spinA = bezier(0.65, 0, 0.35, 1), spinB = bezier(0.22, 1, 0.36, 1);
    const spinAt = t => {                               // tsi-spin: 920 ms + 700 ms, 120deg -> -3deg (84%) -> 0
      const p = (t - 920) / 700;
      if (p <= 0) return 120;
      if (p >= 1) return 0;
      return p < 0.84 ? 120 - 123 * spinA(p / 0.84) : -3 + 3 * spinB((p - 0.84) / 0.16);
    };
    // Beat 3 complete (the 3D is flat again, every letter is in): swap in the plain single-SVG copies, which fly.
    const flatten = () => ov.classList.add('is-flat');
    const setRate = (a, r) => { try { if (a.updatePlaybackRate) a.updatePlaybackRate(r); else a.playbackRate = r; } catch (e) { /* ignore */ } };

    /* ---------- input: listeners on window, capture phase (before Lenis and the section scripts) */
    const on = (type, fn, opts, target = window) => { target.addEventListener(type, fn, opts); offs.push(() => target.removeEventListener(type, fn, opts)); };
    const CAP = { capture: true, passive: true }, CAPX = { capture: true, passive: false };
    on('pointermove', e => {
      if (e.pointerType === 'touch') {                  // a held finger is a torch; dragging it launches the intro
        if (!torch || e.pointerId !== torch.id) return;
        px = e.clientX; py = e.clientY;
        if (Math.hypot(px - torch.x, py - torch.y) > 8) skip();
        return;
      }
      px = e.clientX; py = e.clientY;
      if (e.pointerType === 'pen' || fineMQ.matches) hasPointer = true;
      kick();
    }, CAP);
    on('pointerdown', e => {
      if (e.pointerType === 'touch' && state === 'play' && armed) {
        torch = { id: e.pointerId, x: e.clientX, y: e.clientY };
        px = e.clientX; py = e.clientY;
        kick();
        return;
      }
      skip();
    }, CAP);
    const release = e => { if (e.pointerType === 'touch') { torch = null; skip(); } };
    on('pointerup', release, CAP);
    on('pointercancel', release, CAP);
    on('touchmove', e => { if (locked && e.cancelable) e.preventDefault(); }, CAPX);
    on('wheel', e => {
      if (locked && !e.ctrlKey) { e.preventDefault(); e.stopImmediatePropagation(); }   // never blocks ctrl-zoom
      skip();
    }, CAPX);
    on('keydown', e => {
      if (/^(Shift|Control|Alt|Meta|CapsLock|Fn|OS)$/.test(e.key)) return;
      // Tab is never prevented: it skips and focus lands on "Skip to content"
      if (locked && /^( |Spacebar|PageUp|PageDown|Home|End|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.test(e.key)) e.preventDefault();
      skip();
    }, true);
    on('scroll', () => { if (Math.abs(scrollY - y0) > 2) skip(); }, { passive: true });   // scrollbar drag, programmatic scroll
    on('resize', () => { if (innerWidth !== w0) end(true); });
    on('pageshow', e => { if (e.persisted) end(false); });
    on('visibilitychange', () => {
      if (document.visibilityState === 'visible') arm();
      else if (armed) end(false);
    }, false, document);
    const onReduce = () => { if (reducedMQ.matches) end(true); };
    if (reducedMQ.addEventListener) on('change', onReduce, false, reducedMQ);

    /* ---------- timeline */
    function arm() {
      if (armed || state !== 'play' || document.visibilityState !== 'visible') return;
      armed = true;
      timers.push(setTimeout(() => end(true), 5500));                                     // watchdog
      cueAnim.finished.then(() => { flatten(); fly(false); }, () => {});
      const backup = () => { if (state !== 'play') return; if (clock() >= CUE) fly(false); else timers.push(setTimeout(backup, 120)); };
      timers.push(setTimeout(backup, Math.max(0, CUE - clock()) + 150));
    }

    // Fast-forward: the CSS beats finish within 160 ms (shards snap in, a quick twist, the letters flick in) while the
    // lockup already flies; the dock (the one big move inside the lockup) starts at once and glides for >= 140 ms
    // instead of being squeezed into a few frames. During the flight, whatever is left lands within 180 ms.
    function skip() {
      if (state === 'play') {
        if (!armed) return;
        skipped = true; locked = false; torch = null;
        const rate = Math.min(30, Math.max(1, (CUE - clock()) / 160));
        ov.getAnimations({ subtree: true }).forEach(a => {
          const name = a.animationName || '';
          if (name === 'tsi-failsafe') return;
          if (name.startsWith('tsi-dock')) {
            const tm = a.effect.getComputedTiming(), start = tm.delay || 0, end = tm.endTime;
            if (a.currentTime != null && a.currentTime < end) {
              if (a.currentTime < start) a.currentTime = start;        // still in its delay: the from-state, no visual jump
              setRate(a, Math.min(rate, Math.max(1, (end - a.currentTime) / 140)));
            }
            return;
          }
          setRate(a, rate);
        });
        fly(true);
      } else if (state === 'fly') {
        anims.forEach(a => {
          const end = a.effect && a.effect.getComputedTiming().endTime, cur = a.currentTime;
          if (a.playState === 'finished' || end == null || cur == null) return;
          setRate(a, Math.max(a.playbackRate, (end - cur) / 180));
        });
      }
    }

    // FLIP targets of the two pieces (.tsi__fx: X on the X curve; .tsi__fy, origin top-left: Y + scale on the Y curve).
    // The name keeps its place in the lockup while both shrink: the part of its X move that comes from the shrinking,
    // (s - 1) x its offset from the mark, rides on the scale curve, so mid-flight the lockup never comes apart.
    // d = how far the lockup itself moved since take-off (landing correction).
    const fit = (S, H, d) => ({ s: H.width / S.width, dx: H.left - (S.left + d.x), dy: H.top - (S.top + d.y) });
    const plan = (sm, sw, hm, hw, d = { x: 0, y: 0 }) => {
      const m = fit(sm, hm, d), w = fit(sw, hw, d), ax = (w.s - 1) * (sw.left - sm.left);
      return { m: { x: m.dx, ax: 0, y: m.dy, s: m.s }, w: { x: w.dx - ax, ax, y: w.dy, s: w.s } };
    };
    const fxKf = g => ({ transform: `translate3d(${g.x}px,0,0)` });
    const fyKf = g => ({ transform: `translate3d(${g.ax}px,${g.y}px,0) scale(${g.s})` });
    const ZERO = { x: 0, ax: 0, y: 0, s: 1 };
    const move = (fx, fy, a, b, duration, delay, ex, ey) => [
      fx.animate([fxKf(a), fxKf(b)], { duration, delay, easing: ex, fill: 'both' }),
      fy.animate([fyKf(a), fyKf(b)], { duration, delay, easing: ey, fill: 'both' })
    ];

    // Beat 4. FLIP from the live header logo: Y and the scale lead, X lags, so the path arcs (rises first, then glides
    // left) and lands at zero velocity; the name trails the mark by 40 ms. All reads first, then the writes.
    function fly(fast) {
      if (state !== 'play') return;
      state = 'fly'; locked = false; torch = null;
      if (!fast) flatten();
      else timers.push(setTimeout(flatten, 220));          // normally the fast-forwarded cue flattens it at ~160 ms
      const hm = hMark && hMark.getBoundingClientRect(), hw = hWord && hWord.getBoundingClientRect();
      const sm = fxM.getBoundingClientRect(), sw = fxW.getBoundingClientRect();
      L1 = lock.getBoundingClientRect();
      const vh = veil.offsetHeight, th = tail.offsetHeight;
      const header = document.querySelector('.site-header');
      const okFly = !!(hm && hw) && [hm, hw].every(r => r.width > 0 && r.bottom > 0 && r.top < innerHeight) &&
        !(header && getComputedStyle(header).visibility === 'hidden');
      if (okFly) {
        from = { m: sm, w: sw }; to = { m: hm, w: hw };
        const g = plan(sm, sw, hm, hw);
        const dur = fast ? 280 : Math.round(Math.min(580, Math.max(480, 320 + 0.5 * Math.hypot(g.m.x, g.m.y))));
        anims.push(...move(fxM, fyM, ZERO, g.m, dur, 0, EX, EY), ...move(fxW, fyW, ZERO, g.w, dur, fast ? 20 : 40, EX, EY));
      } else {                                          // no header logo on screen (e.g. a future hide-on-scroll header)
        anims.push(lock.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.92)', opacity: 0 }],
          { duration: fast ? 180 : 300, easing: EASE, fill: 'forwards' }));
      }
      anims.push(light.animate({ opacity: 0 }, { duration: fast ? 160 : 300, easing: EASE, fill: 'forwards' }));
      // the stage lifts upward; its feathered tail clears the header just before the logo lands in it
      anims.push(veil.animate([{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(0,${-(vh + th)}px,0)` }],
        { duration: fast ? 260 : (phoneMQ.matches ? 480 : 520), delay: 20, easing: ELIFT, fill: 'forwards' }));
      const marker = cue.animate({ opacity: [0, 0] }, { duration: fast ? 30 : 20, fill: 'forwards' });
      anims.push(marker);
      marker.finished.then(() => flush(true), () => {});                // the page's own entrances start as it lifts
      Promise.all(anims.map(a => a.finished)).then(() => land(okFly), () => {});
      kick();
    }

    // Landing: re-measure; if the header or the stage moved under the flight (a scrollbar appeared, a resize), one
    // 120 ms correction. Then the real header logo shows at once under the identical copy and the overlay dissolves.
    function land(okFly) {
      if (state !== 'fly') return;
      state = 'land';
      const handover = () => {
        root.classList.add('tsi-landed');
        ov.animate({ opacity: [1, 0] }, { duration: 120, easing: 'linear', fill: 'forwards' }).finished.then(() => end(false), () => end(false));
        timers.push(setTimeout(() => end(false), 400));
      };
      if (!okFly || !from) { handover(); return; }
      const hm = hMark.getBoundingClientRect(), hw = hWord.getBoundingClientRect(), L2 = lock.getBoundingClientRect();
      const moved = (a, b) => Math.abs(a.left - b.left) > 0.5 || Math.abs(a.top - b.top) > 0.5 || Math.abs(a.width - b.width) > 0.5;
      if (!moved(hm, to.m) && !moved(hw, to.w) && !moved(L2, L1)) { handover(); return; }
      const a = plan(from.m, from.w, to.m, to.w), b = plan(from.m, from.w, hm, hw, { x: L2.left - L1.left, y: L2.top - L1.top });
      const fix = [...move(fxM, fyM, a.m, b.m, 120, 0, EASE, EASE), ...move(fxW, fyW, a.w, b.w, 120, 0, EASE, EASE)];
      Promise.all(fix.map(x => x.finished)).then(handover, handover);
    }

    function end(fade) {
      if (state === 'done' || state === 'off' || state === 'css') return;
      const fin = () => {
        if (state === 'done') return;
        state = 'done';
        try { flush(true); } finally {
          timers.forEach(clearTimeout); cancelAnimationFrame(raf); raf = 0; offs.forEach(f => f());
          // one call: the hero H1's animation name must change only once (it restarted at the lift)
          root.classList.remove(...CLASSES);
          ov.remove();
          fire('ts:intro-end');
        }
      };
      if (fade && state !== 'land' && document.visibilityState === 'visible') {
        state = 'land'; locked = false;
        flush(true); root.classList.add('tsi-landed');
        ov.animate({ opacity: 0 }, { duration: 180, fill: 'forwards' }).finished.then(fin, fin);
        timers.push(setTimeout(fin, 400));
      } else fin();
    }

    /* ---------- the visitor holds the light: the pool follows the pointer (or a held finger, or an ambient sweep over
       the top of the mark), the mark tilts toward it, and each sliver darkens as a facet turned away from it.
       Style writes only; it stops once everything has settled after the take-off. */
    function frame(now) {
      raf = 0;
      if (state === 'done' || state === 'off') return;
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      const t = clock(), playing = state === 'play' && !skipped, env = playing ? envAt(t) : 0;
      const lit = playing && (torch || hasPointer);
      let tx = px, ty = py;
      if (!lit) { const a = (-30 - 120 * smooth(400, 2000, t)) * Math.PI / 180; tx = CX + R * Math.cos(a); ty = CY + R * Math.sin(a); }
      if (state === 'play') {
        const k = lerpK(torch ? LERP_TORCH : LERP_LIGHT, dt);
        lx += (tx - lx) * k; ly += (ty - ly) * k;
        light.style.transform = `translate3d(${(lx - OX).toFixed(1)}px,${(ly - OY).toFixed(1)}px,0) scale(2)`;
      }
      let tY = 0, tX = 0;
      if (playing) {
        if (lit) {
          const m = torch ? TORCH_TILT : 1;
          tY = clamp1((px - CX) / CX) * TILT_Y * m; tX = -clamp1((py - CY) / CY) * TILT_X * m;
        } else { tY = 3 * Math.sin(t / 650); tX = 2 * Math.sin(t / 830 + 1); }
        tY *= env; tX *= env;
      }
      // fast once the envelope falls (1850-2200 ms), so the tilt and facet shading are flat by take-off, where the
      // plain copies swap in (an unsettled shade would brighten two slivers in one frame)
      const kt = lerpK(skipped || t > 1850 ? 0.35 : LERP_TILT, dt);
      ry += (tY - ry) * kt; rx += (tX - rx) * kt;
      tilt.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      const th = spinAt(t) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
      const Lx = lx - CX, Ly = ly - CY, Ll = Math.hypot(Lx, Ly) || 1, reach = Math.min(1, Ll / R);
      let sum = 0;
      facets.forEach(f => {
        const d = ((c * f.n[0] - s * f.n[1]) * Lx + (s * f.n[0] + c * f.n[1]) * Ly) / Ll;
        f.v += ((playing ? SHADE * env * (1 - d * reach) / 2 : 0) - f.v) * kt;
        f.el.style.opacity = f.v.toFixed(3);
        sum += f.v;
      });
      if (state === 'play' || Math.abs(rx) + Math.abs(ry) + sum > 0.01) raf = requestAnimationFrame(frame);
      else { tilt.style.transform = ''; facets.forEach(f => { f.v = 0; f.el.style.opacity = ''; }); }
    }
    function kick() { if (!raf && state !== 'done' && state !== 'off' && state !== 'css') raf = requestAnimationFrame(frame); }

    skipFn = skip;
    arm();
    raf = requestAnimationFrame(frame);
    if (pre || scrollY > 2) skip();                    // input before the script ran, or the page was already scrolled
  }
})();
