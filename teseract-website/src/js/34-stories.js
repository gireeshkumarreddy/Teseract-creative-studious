/* CLIENT STORIES — client reviews, the "Client Deck" (markup: scripts/pages/stories.py _reviews, CSS: 34-stories.css).
   [data-voices] (.sto-deck, role=group carousel) > [data-deck-vp] > track > [data-deck-slot]… (article tabpanel each)
   + one control row: [data-deck-prev] · [role=tablist] > [role=tab]… (dots) · [data-deck-next] · [data-deck-status].

   Every visual is a function of one float, pos (0 = the first client in front). Slot k sits at
   d = mod(k - pos + n/2, n) - n/2 (a loop from five cards; fewer: d = k - pos, ends with a 0.35 rubber band) and gets
   translate X(|d|) · scale S(|d|) · rotateY R(|d|) + lean, piecewise-linear over |d| = 0, 1, 2, 3 with nodes from the
   --deck-* tokens on .sto-deck (the single source of truth, also behind the CSS data-pos rest state), plus z-index,
   visibility, --ad = |d| and --rd = clamp(d, 0, 1) + .is-right (d > .5), from which the CSS derives the dim, the
   quote fade / rise and the mirrored caption row of a right-hand card (>= 800 px; on a deck too narrow for the peeks'
   captions, .is-tight fades them with the quote, fit()). One rAF loop runs only while
   dragging, springing, wheeling or nudging; every move is the house spring 400/30/1 (instant under reduced motion).
   Input: drag / swipe / flick (6 px direction lock, momentum; the primary pointer only, and a second finger anywhere
   drops the drag: a pinch zooms the page, touch-action pan-y pinch-zoom, and never flips a card), horizontal trackpad and
   Shift+wheel, a click on a peeking card (>= 800 px; phone slivers sit in the edge-gesture zone), previous / next, the
   dots (APG tabs, automatic activation, Left / Right / Home / End). Nothing auto-advances: the only self-started
   motion is one sub-second nudge the first time the deck is in view (cancelled by any pointer, key or focus in the
   deck, a horizontal wheel, or any wheel while it plays; a vertical page scroll over the deck before it starts only
   postpones it until the scroll stops, so it still plays where it can be seen).
   Settle: data-pos / .is-front; aria-hidden + link tabindex -1 on the cards behind (not inert, so a peek stays
   clickable); roving tabs; focus rescued from a card that left the front; a status line for arrow, drag, wheel and
   peek moves; neighbour stills decoded ahead (not under Save-Data). Stills: only the front card and its neighbours
   load with the page (the others wait as data-src / data-srcset, pages/stories.py); at rest the phone loads |d| <= 1,
   >= 800 px every visible peek (|d| <= 2; their <picture> source loads those there even without this script), and
   once the visitor moves the deck, two cards ahead.
   Also: a one-time star-fill wipe on the front card when its rating first comes into view (.is-seen / .is-wipe), and
   parallax + glare on the front still only (a mouse over it on fine pointers; on touch / pen it follows the finger
   that drags the deck; motion only), so the quote never moves while it is read.
   Without JS the CSS shows all six cards in a grid. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const phoneMQ = matchMedia('(max-width: 799.98px)');
  const fineMQ = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = () => reducedMQ.matches;
  const motion = () => (TS.motion ? TS.motion() : !reduced());
  const saveData = () => !!(navigator.connection && navigator.connection.saveData);
  const onChange = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));
  const mod = (a, n) => ((a % n) + n) % n;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  /* bezier() and lerp() as in 23-carousel.js */
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
  const EASE_IO = bezier(0.44, 0, 0.56, 1);     // --ease-io
  const lerp = (x, xs, ys) => {
    if (x <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) {
      if (x <= xs[i]) { const t = (x - xs[i - 1]) / ((xs[i] - xs[i - 1]) || 1); return ys[i - 1] + t * (ys[i] - ys[i - 1]); }
    }
    return ys[ys.length - 1];
  };
  const AX = [0, 1, 2, 3];
  const K = 400, C = 30, M = 1;                 // the house spring (--spring / --spring-d 400ms, peak 1.027)
  const BAND = 0.35;                            // rubber band beyond the ends (fewer than five cards)

  function init(root) {
    const vp = root.querySelector('[data-deck-vp]');
    const slots = [...root.querySelectorAll('[data-deck-slot]')];
    const n = slots.length;
    if (!vp || n < 2) { root.classList.add('is-ready', 'is-single'); return; }
    const pick = sel => slots.map(s => s.querySelector(sel));
    const links = pick('.sto-voice__link'), media = pick('.sto-voice__media'), imgs = pick('.sto-voice__img'), heads = pick('.sto-voice__head');
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const list = root.querySelector('[role="tablist"]');
    const status = root.querySelector('[data-deck-status]');
    const loop = n >= 5;

    let W = 1, X1 = 1, geo = null, phone = false;
    let pos = 0, target = 0, vel = 0, mode = '', tw = null, raf = 0, last = 0;
    let lean = 0, leanTo = 0, cur = 0, active = -1, say = false;
    let used = false, seen = false, drag = null, suppress = false, wheelT = 0, nudgeT = 0, inView = false, moved = false;
    const warmed = new WeakSet();
    const pending = imgs.map(im => !!(im && (im.dataset.src || im.dataset.srcset)));   // stills not loaded yet

    const dOf = k => (loop ? mod(k - pos + n / 2, n) - n / 2 : k - pos);
    const band = x => BAND * (1 - Math.exp(-x / BAND));
    const bound = p => (loop ? p : p < 0 ? -band(-p) : p > n - 1 ? n - 1 + band(p - n + 1) : p);
    const near = p => (loop ? mod(Math.round(p), n) : clamp(Math.round(p), 0, n - 1));

    /* ---------- geometry: read on init, resize and media-query change only (never during motion) */
    function measure() {
      const cs = getComputedStyle(root);
      const num = (name, d) => { const v = parseFloat(cs.getPropertyValue(name)); return Number.isFinite(v) ? v : d; };
      W = slots[0].offsetWidth || W;
      const k1 = num('--deck-k1', 0.66), k2 = num('--deck-k2', 1.07), g = num('--deck-gap', 0);
      const s2 = num('--deck-s2', 0.7), r2 = num('--deck-r2', 0);
      geo = { x: [0, k1 * W + g, k2 * W + 2 * g, (2 * k2 - k1) * W + 3 * g], s: [1, num('--deck-s1', 0.84), s2, s2], r: [0, num('--deck-r1', 0), r2, r2] };
      X1 = geo.x[1] || 1;
      phone = phoneMQ.matches;
      if (!(geo.r[1] > 0)) lean = leanTo = 0;     // the drag lean is desktop / tablet with motion only
    }

    function apply() {
      const reach = moved || !phone ? 2.5 : 1.5;  // which stills must be there: see load()
      for (let k = 0; k < n; k++) {
        const d = dOf(k), a = Math.abs(d), sg = d < 0 ? -1 : 1, st = slots[k].style;
        if (pending[k] && a < reach) load(k);
        st.transform = `translate3d(${(sg * lerp(a, AX, geo.x)).toFixed(2)}px,0,0) scale(${lerp(a, AX, geo.s).toFixed(4)}) rotateY(${(sg * lerp(a, AX, geo.r) + lean).toFixed(3)}deg)`;
        st.setProperty('--ad', a.toFixed(3));
        st.setProperty('--rd', clamp(d, 0, 1).toFixed(3));
        if (slots[k].classList.contains('is-right') !== d > 0.5) slots[k].classList.toggle('is-right', d > 0.5);
        st.zIndex = String(10 - Math.round(2 * a));
        st.visibility = a > 2.5 ? 'hidden' : 'visible';
        st.pointerEvents = a > 1.5 || (phone && a >= 0.5) ? 'none' : 'auto';
      }
      const c = near(pos);                       // the dot of the nearest card follows the deck live
      if (c !== cur) { tabs.forEach((t, k) => t.classList.toggle('is-current', k === c)); cur = c; }
    }
    /* >= 800 px: where a peek's outer edge (the side its caption row starts from) lies beyond the viewport's clipped
       edge (viewports below about 1190 px), the caption rows fade with the quote instead (.is-tight, CSS), so a peek
       never shows a cut word ("erabad"); wider, the row starts inside the edge's mask fade and reads whole. Read at
       rest only: on settle and on resize */
    function fit() {
      let tight = false;
      if (!phone) {
        const vr = vp.getBoundingClientRect();
        slots.forEach((s, k) => {
          const d = Math.round(dOf(k));
          if (Math.abs(d) !== 1 || !heads[k]) return;
          const r = heads[k].getBoundingClientRect();
          if (d < 0 ? r.left < vr.left : r.right > vr.right) tight = true;
        });
      }
      root.classList.toggle('is-tight', tight);
    }

    /* ---------- the one rAF loop: drag / wheel (pos set by input), tween (the nudge), spring */
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(step); } }
    function step(now) {
      raf = 0;
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
      last = now;
      let done = false;
      if (mode === 'tween') {
        const p = clamp((now - tw.t0) / tw.dur, 0, 1);
        pos = tw.from + (tw.to - tw.from) * EASE_IO(p);
        if (p >= 1) { mode = 'spring'; vel = 0; tw = null; }        // ...then springs back to target
      } else if (mode === 'spring') {
        const h = dt / 4;                         // semi-implicit Euler, four substeps
        for (let i = 0; i < 4; i++) { vel += (-K * (pos - target) - C * vel) / M * h; pos += vel * h; }
        if (Math.abs(pos - target) < 5e-4 && Math.abs(vel) < 5e-3) { pos = target; done = true; }
      } else if (mode === 'drag' && drag && now - drag.t > 90) leanTo = 0;   // pointer held still: the lean relaxes
      lean += (leanTo - lean) * 0.15;
      if (!leanTo && Math.abs(lean) < 0.01) lean = 0;
      apply();
      if (done) settle();
      if (mode || lean) { raf = requestAnimationFrame(step); }
    }

    function goTo(t, { v = 0, announce = false } = {}) {
      if (!loop) t = clamp(Math.round(t), 0, n - 1);
      stopNudge();
      untilt();
      moved = true;
      target = t; say = announce; tw = null;
      starsSeen(false);
      root.classList.add('is-moving');
      if (reduced()) { pos = t; vel = 0; mode = ''; settle(); return; }
      vel = v; mode = 'spring'; kick();
    }
    function goIndex(i, opts) {                  // shortest way round the loop
      const r = Math.round(target);
      goTo(r + (loop ? mod(i - r + n / 2, n) - n / 2 : i - r), opts);
    }
    function select(i) {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    }
    function describe(k) {
      const text = sel => ((slots[k].querySelector(sel) || {}).textContent || '').trim();
      const rate = slots[k].querySelector('.sto-rate');
      return `${k + 1} of ${n}: ${text('.sto-voice__co')}, ${text('.sto-voice__ind')}.${rate ? ` ${rate.getAttribute('aria-label')}.` : ''}`;
    }
    /* a still that waited as data-src / data-srcset (PERF-11) gets its real sources: from apply() for every card within
       reach (at rest |d| <= 1 on phones, where the far ones sit off screen; |d| <= 2 >= 800 px, where they peek; two
       cards ahead once the visitor has moved the deck, never for the first-view nudge) and for print */
    function load(k) {
      const im = imgs[k];
      pending[k] = false;
      if (!im) return;
      if (im.dataset.srcset) { im.srcset = im.dataset.srcset; im.removeAttribute('data-srcset'); }
      if (im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src'); }
    }
    addEventListener('beforeprint', () => pending.forEach((p, k) => { if (p) load(k); }));
    /* loaded neighbour stills (d = ±1, ±2) decode ahead, so a fast flick never shows an empty frame */
    function warm() {
      if (!seen || saveData()) return;
      for (let k = 0; k < n; k++) {
        const a = Math.abs(Math.round(dOf(k))), im = imgs[k];
        if (a < 1 || a > 2 || !im || pending[k] || warmed.has(im)) continue;
        warmed.add(im);
        im.loading = 'eager';
        if (im.decode) im.decode().catch(() => {});
      }
    }

    function settle() {
      mode = ''; vel = 0; tw = null;
      target = near(target); pos = target;
      apply();
      active = target;
      slots.forEach((s, k) => {
        const front = k === active;
        s.dataset.pos = String(Math.round(dOf(k)));
        s.classList.toggle('is-front', front);
        if (front) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
        if (links[k]) { if (front) links[k].removeAttribute('tabindex'); else links[k].setAttribute('tabindex', '-1'); }
      });
      select(active);
      const f = document.activeElement;
      if (f && tabs[active] && slots.some((s, k) => k !== active && s.contains(f))) tabs[active].focus({ preventScroll: true });
      if (say && status) status.textContent = describe(active);
      say = false;
      warm();
      fit();
      root.classList.remove('is-moving');
    }

    /* ---------- drag / swipe / flick (patterns from 23-carousel.js, plus momentum and the spring) */
    vp.addEventListener('pointerdown', e => {
      if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;   // a second finger never takes over
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, pos0: pos, lock: null, t: e.timeStamp, samples: [] };
    }, { passive: true });
    /* ...and a second finger anywhere (capture, before any handler) makes it a pinch: the browser zooms the page
       (touch-action pan-y pinch-zoom), the drag is dropped and a card already under way springs back to where it was */
    addEventListener('pointerdown', e => {
      if (e.isPrimary || !drag) return;
      const d = drag; drag = null;
      try { vp.releasePointerCapture(d.id); } catch (err) { /* ignore */ }
      if (d.lock !== 'x') return;
      root.classList.remove('is-dragging');
      leanTo = 0;
      goTo(Math.round(d.pos0));
    }, { passive: true, capture: true });
    vp.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.lock) {
        if (e.pointerType === 'mouse' && !(e.buttons & 1)) { drag = null; return; }   // released outside the deck
        const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        drag.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (drag.lock === 'y') { drag = null; return; }   // vertical: the page scrolls (touch-action: pan-y)
        try { vp.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        stopNudge(); untilt(); starsSeen(false);
        used = true; seen = true; moved = true; mode = 'drag'; vel = 0; tw = null;
        root.classList.add('is-dragging', 'is-moving');
        drag.pos0 = pos; drag.x0 = e.clientX; drag.samples = [];
        // touch / pen: the front still's glare follows the finger, mapped onto the still where it rested
        const m = e.pointerType !== 'mouse' && motion() && media[active];
        drag.glare = m ? { k: active, r: m.getBoundingClientRect() } : null;
      }
      e.preventDefault();
      if (drag.glare) tiltTo(drag.glare.k, drag.glare.r, e.clientX, e.clientY);
      pos = bound(drag.pos0 - (e.clientX - drag.x0) / X1);
      drag.t = e.timeStamp; drag.x = e.clientX;
      drag.samples.push([e.clientX, e.timeStamp]);
      while (drag.samples.length > 2 && e.timeStamp - drag.samples[0][1] > 100) drag.samples.shift();
      if (geo.r[1] > 0 && drag.samples.length > 1) {
        const [x0, t0] = drag.samples[0];
        leanTo = clamp((e.clientX - x0) / Math.max(1, e.timeStamp - t0) * 1000 * 0.006, -6, 6);
      }
      kick();
    });
    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (d.lock !== 'x') {                      // never dragged: nothing to settle, unless a lost drag left a card mid-way
        if (mode === 'drag') { root.classList.remove('is-dragging'); leanTo = 0; goTo(Math.round(pos), { announce: true }); }
        return;
      }
      root.classList.remove('is-dragging');
      suppress = true;
      setTimeout(() => { suppress = false; }, 0);
      leanTo = 0;
      const cancel = e.type !== 'pointerup';
      const x = cancel ? d.x : e.clientX;                              // a cancelled touch may report 0, 0
      const recent = d.samples.filter(s => e.timeStamp - s[1] <= 100);
      const v = cancel || !recent.length ? 0 : (x - recent[0][0]) / Math.max(16, e.timeStamp - recent[0][1]) * 1000;
      const dx = x - d.x0;
      const base = Math.round(d.pos0), vCards = -v / X1;
      let t = clamp(Math.round(pos + vCards * 0.2), base - 3, base + 3);
      if (t === base && (Math.abs(dx) > 0.2 * X1 || Math.abs(v) > 200)) t = base + ((Math.abs(v) > 200 ? v : dx) < 0 ? 1 : -1);
      goTo(t, { v: vCards, announce: true });
    };
    vp.addEventListener('pointerup', release);
    vp.addEventListener('pointercancel', release);
    // the deck losing its own capture ends the drag (after pointerup a no-op; a card's implicit touch capture moving
    // to the deck on the lock fires on that card, not here)
    vp.addEventListener('lostpointercapture', e => { if (e.target === vp) release(e); });
    vp.addEventListener('click', e => { if (suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
    vp.addEventListener('dragstart', e => e.preventDefault());

    /* ---------- horizontal trackpad / Shift+wheel (vertical wheel is never touched) */
    vp.addEventListener('wheel', e => {
      let dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      const dy = e.deltaX ? e.deltaY : e.shiftKey ? 0 : e.deltaY;
      if (!dx || Math.abs(dx) <= Math.abs(dy)) return;
      if (e.deltaMode === 1) dx *= 16;
      e.preventDefault();
      e.stopPropagation();                      // keep it from the smooth scroller (Lenis)
      if (mode !== 'wheel') { stopNudge(); untilt(); starsSeen(false); used = true; seen = true; moved = true; mode = 'wheel'; vel = 0; tw = null; root.classList.add('is-moving'); }
      pos = bound(pos + dx / X1);
      kick();
      clearTimeout(wheelT);
      wheelT = setTimeout(() => { if (mode === 'wheel') goTo(Math.round(pos), { announce: true }); }, 140);
    }, { passive: false });

    /* ---------- a peeking card brings itself forward (>= 800 px; capture: a hidden link never navigates) */
    slots.forEach((s, k) => s.addEventListener('click', e => {
      const a = Math.abs(dOf(k));
      if (phone || a < 0.5 || a > 1.5) return;
      e.preventDefault();
      e.stopPropagation();
      goIndex(k, { announce: true });
    }, true));

    /* ---------- previous / next and the dots */
    const by = s => (loop ? goTo(Math.round(target) + s, { announce: true }) : goIndex(mod(Math.round(target) + s, n), { announce: true }));
    const prev = root.querySelector('[data-deck-prev]'), next = root.querySelector('[data-deck-next]');
    if (prev) prev.addEventListener('click', () => by(-1));
    if (next) next.addEventListener('click', () => by(1));
    tabs.forEach((t, i) => t.addEventListener('click', () => { select(i); goIndex(i); }));
    if (list) list.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.getAttribute('role') !== 'tab') return;
      const r = Math.round(target);
      let i;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const s = e.key === 'ArrowRight' ? 1 : -1;
        i = mod(r + s, n);
        select(i);
        if (loop) goTo(r + s); else goIndex(i);
      } else if (e.key === 'Home' || e.key === 'End') {
        i = e.key === 'Home' ? 0 : n - 1;
        select(i);
        goIndex(i);
      } else return;
      e.preventDefault();
      tabs[i].focus();
    });

    /* ---------- first view: one nudge (once per page load) and the stars' fill wipe */
    function stopNudge() {
      clearTimeout(nudgeT); nudgeT = 0;
      if (mode === 'tween') { mode = 'spring'; vel = 0; tw = null; kick(); }   // back to target from wherever it is
    }
    function nudge() {
      nudgeT = 0;
      if (used || !inView || mode || !motion() || root.contains(document.activeElement)) return;
      used = true;
      root.classList.add('is-moving');
      say = false;
      tw = { from: target, to: target + 0.12, t0: performance.now(), dur: 380 };
      mode = 'tween';
      kick();
    }
    root.addEventListener('pointerdown', () => { used = true; stopNudge(); }, { passive: true });
    root.addEventListener('keydown', () => { used = true; stopNudge(); });
    root.addEventListener('focusin', () => { used = true; stopNudge(); });
    root.addEventListener('wheel', () => {          // a page scroll over the deck only postpones a pending nudge
      if (mode === 'tween') { used = true; stopNudge(); } else if (nudgeT) { clearTimeout(nudgeT); nudgeT = setTimeout(nudge, 600); }
    }, { passive: true });
    /* the stars: the wipe plays once, on the front card, when its rating is first fully on screen (CSS: .is-seen +
       .is-wipe); a move that starts before that just shows them filled */
    let wipeIO = null;
    function starsSeen(wipe) {
      if (root.classList.contains('is-seen')) return;
      if (wipeIO) wipeIO.disconnect();
      if (wipe && slots[active]) slots[active].classList.add('is-wipe');
      root.classList.add('is-seen');
    }
    if ('IntersectionObserver' in window) {
      const seeIO = new IntersectionObserver(entries => {
        const e = entries[entries.length - 1];
        if (e.intersectionRatio >= 0.34 && !seen) { seen = true; warm(); }
        inView = e.intersectionRatio >= 0.59;
        clearTimeout(nudgeT);
        nudgeT = inView && !used ? setTimeout(nudge, 600) : 0;
        if (seen && used) seeIO.disconnect();
      }, { threshold: [0, 0.35, 0.6] });
      const rate = slots[0].querySelector('.sto-stars');
      wipeIO = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) starsSeen(true); },
        { threshold: 1, rootMargin: '0px 0px -6% 0px' });
      // the nudge and the star wipe are seen only once the intro stage has lifted (01-intro.js; immediate without one)
      (TS.afterIntro || (fn => fn()))(() => {
        seeIO.observe(root);
        if (rate) wipeIO.observe(rate); else starsSeen(false);
      });
    } else { seen = true; starsSeen(false); }

    /* ---------- parallax + glare on the front still only (motion): a mouse over it (fine pointer, never while the deck
       moves), or the finger that drags the deck (touch / pen; the glare runs across the card in the swipe's direction) */
    const px = { k: -1, tx: 0, ty: 0, th: 0, x: 0, y: 0, h: 0, raf: 0 };
    function tiltStep() {
      px.raf = 0;
      if (px.k < 0) return;
      px.x += (px.tx - px.x) * 0.12; px.y += (px.ty - px.y) * 0.12; px.h += (px.th - px.h) * 0.12;
      const m = media[px.k], im = imgs[px.k];
      if (!px.th && px.h < 0.002) {               // back at rest: clear the inline styles, stop
        if (im) im.style.transform = '';
        m.style.removeProperty('--gx'); m.style.removeProperty('--gy');
        px.k = -1; px.x = px.y = px.h = 0;
        return;
      }
      if (im) im.style.transform = `translate3d(${(px.x * 6 * px.h).toFixed(2)}px,${(px.y * 6 * px.h).toFixed(2)}px,0) scale(${(1 + 0.04 * px.h).toFixed(4)})`;
      m.style.setProperty('--gx', `${((px.x + 1) * 50).toFixed(1)}%`);
      m.style.setProperty('--gy', `${((px.y + 1) * 50).toFixed(1)}%`);
      if (Math.abs(px.tx - px.x) + Math.abs(px.ty - px.y) + Math.abs(px.th - px.h) > 0.002) px.raf = requestAnimationFrame(tiltStep);
    }
    function untilt() {
      if (px.k < 0) return;
      px.th = 0;
      media[px.k].classList.remove('is-hover');
      if (!px.raf) px.raf = requestAnimationFrame(tiltStep);
    }
    function tiltTo(k, r, x, y) {               // aim card k's light at (x, y) within the still's rect r
      if (px.k >= 0 && px.k !== k) { media[px.k].classList.remove('is-hover'); if (imgs[px.k]) imgs[px.k].style.transform = ''; px.x = px.y = px.h = 0; }
      px.k = k; px.th = 1;
      px.tx = clamp(((x - r.left) / r.width) * 2 - 1, -1, 1);
      px.ty = clamp(((y - r.top) / r.height) * 2 - 1, -1, 1);
      media[k].classList.add('is-hover');
      if (!px.raf) px.raf = requestAnimationFrame(tiltStep);
    }
    media.forEach((m, k) => {
      if (!m) return;
      m.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse' || k !== active || mode || drag || !fineMQ.matches || !motion()) return;
        tiltTo(k, m.getBoundingClientRect(), e.clientX, e.clientY);
      }, { passive: true });
      m.addEventListener('pointerleave', () => { if (px.k === k) untilt(); }, { passive: true });
    });

    /* ---------- layout / preferences */
    let rt = 0;
    new ResizeObserver(() => { cancelAnimationFrame(rt); rt = requestAnimationFrame(() => { measure(); apply(); if (!mode) fit(); }); }).observe(vp);
    const onMQ = () => {
      measure();
      if (reduced()) { untilt(); if (mode === 'spring' || mode === 'tween') { settle(); return; } }
      apply();
    };
    onChange(reducedMQ, onMQ);
    onChange(phoneMQ, onMQ);

    measure();
    root.classList.add('is-ready');
    settle();                                    // rest state + aria-hidden / tabindex on the cards behind, no announcement
  }

  ready(() => document.querySelectorAll('[data-voices]').forEach(init));
})();
