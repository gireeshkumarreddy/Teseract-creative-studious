/* PROJECT PAGES — full-screen still viewer (owner default, 15 Oct: "a still that is tapped opens full screen").
   Markup: scripts/pages/project.py _zoom (every still is a[data-zoom] linking to its largest file, so without JS it
   opens the image itself) + viewer() (an inert <template id="pj-viewer-tpl"> holding the <dialog>); CSS: 36-project.css
   "Still viewer". Dormant until the first tap / click: nothing is built and nothing loads before it. Then the dialog
   is cloned once, with one slide per still visible on the page right now, in page order, the tapped one in front.
   Each slide shows the page's own (already loaded) image at once and swaps to the largest file once that has decoded;
   the neighbours load theirs next (not on Save-Data), the others when they come to the front.
   Gestures (touch-action:none, pointer events): swipe left / right between stills (the track follows the finger; a
   18 % drag or a flick changes slide, a rubber band at both ends); pinch to zoom around the fingers (1x up to MAX,
   rubber band past both limits); pan when zoomed (a pan that starts against the image's edge swipes on to the next
   still); double-tap zooms in at that point / back out; at 1x a vertical swipe closes (the still follows the finger,
   the black fades). Mouse: a click on the still toggles the zoom at the pointer, drag pans, the wheel zooms around the
   pointer (a horizontal wheel pans, or changes slide at 1x). Keys: Left / Right, Home / End, + / - / 0, Esc.
   Controls (pages/project.viewer): previous · close · next at the bottom (the thumb zone), the "3 / 10" count on top.
   Closing - X, Esc, Back (opening adds a history entry, so the phone's back gesture closes the viewer instead of
   leaving the page), a vertical swipe, a tap on the black around the still - morphs the still back into its frame on
   the page (scrolled into view first when the visitor swiped to another one) and returns focus to that frame's link.
   Opening morphs out of the tapped frame (FLIP). Under reduced motion every change is instant. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = () => (TS.motion ? TS.motion() : !reducedMQ.matches);
  const saveData = () => !!(navigator.connection && navigator.connection.saveData);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const EASE = 'cubic-bezier(.22,1,.36,1)';   // --ease
  const DUR = 380;                             // morph / settle
  const GAP = 16;                              // between slides (36-project.css .pj-viewer__track gap)
  const SWIPE = 0.18, FLICK = 0.35;            // share of the width / px per ms that changes slide
  const DISMISS = 110, DISMISS_V = 0.5;        // vertical drag (px) / speed that closes
  const LOCK = 8, TAP_MS = 280, TAP_PX = 30;   // gesture direction lock, double-tap window

  ready(() => {
    const tpl = document.getElementById('pj-viewer-tpl');
    if (!tpl || !document.querySelector('a[data-zoom]') || typeof HTMLDialogElement !== 'function') return;
    document.querySelectorAll('a[data-zoom]').forEach(a => a.setAttribute('aria-haspopup', 'dialog'));
    let viewer = null;
    // capture phase: ahead of the page transitions (02-core.js), which would otherwise leave for the image file
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[data-zoom]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      (viewer || (viewer = build(tpl))).open(a);
    }, true);
  });

  function build(tpl) {
    const dlg = tpl.content.firstElementChild.cloneNode(true);
    document.body.appendChild(dlg);
    const $ = s => dlg.querySelector(s);
    const stage = $('[data-viewer-stage]'), track = $('[data-viewer-track]'), count = $('[data-viewer-count]');
    const shade = $('.pj-viewer__shade'), chrome = [count, $('.pj-viewer__bar')];
    const prevBtn = $('[data-viewer-prev]'), nextBtn = $('[data-viewer-next]'), closeBtn = $('[data-viewer-close]');
    let items = [], index = 0, W = 0, H = 0, padX = 12, padY = 78;
    let z = { s: 1, x: 0, y: 0 };              // zoom of the front still: scale + translation (px) from its fitted centre
    let open = false, closing = false, pushed = false, pending = null, fallback = 0, reopen = null;
    let g = null, lastTap = null, tapTimer = 0, wheelLock = 0;
    const pts = new Map();

    const cur = () => items[index];
    const shown = el => !!el && el.getClientRects().length > 0;
    const pageImg = a => [...a.querySelectorAll('img')].find(shown) || a.querySelector('img');
    const transformOf = (s, x, y) => `translate3d(${x}px,${y}px,0) scale(${s})`;

    /* ---------- layout: every still fitted between the count and the controls, centred on the screen */
    function measure() {
      W = stage.clientWidth; H = stage.clientHeight;
      padX = W < 800 ? 12 : 48;
      const bar = chrome[1].getBoundingClientRect(), top = count.getBoundingClientRect();
      padY = Math.max(48, Math.round(Math.max(top.bottom, H - bar.top) + 10));
      dlg.style.setProperty('--slide-w', W + 'px');
      items.forEach(fit);
    }
    function fit(it) {
      const ar = it.w / it.h;
      const bw = Math.max(40, Math.min(W - 2 * padX, (H - 2 * padY) * ar));
      it.bw = bw; it.bh = bw / ar;
      it.el.style.width = bw + 'px'; it.el.style.height = it.bh + 'px';
      // readable zoom: the captures are 2x (desktop) / 3x (phone) files of their CSS layout width
      const native = it.w / (it.phone ? 3 : 2);
      it.dbl = clamp(native / bw * 1.1, 2, 3.5);
      it.max = Math.min(6, Math.max(4, it.dbl * 1.6));
    }
    // the translation range that keeps a zoomed still covering the screen (centred on an axis where it is smaller)
    function bounds(it, s) {
      const ex = Math.max(0, (s * it.bw - W) / 2), ey = Math.max(0, (s * it.bh - H) / 2);
      return { minX: -ex, maxX: ex, minY: -ey, maxY: ey };
    }
    const rubber = (v, a, b) => (v < a ? a - (a - v) * 0.35 : v > b ? b + (v - b) * 0.35 : v);

    /* ---------- drawing (transitions only when motion is on and asked for) */
    function animTo(el, transform, on) {
      el.style.transition = on && motion() ? `transform ${DUR}ms ${EASE}` : 'none';
      el.style.transform = transform;
    }
    function freeze(el) {            // stop a running settle where it is
      if (!el || !el.style.transition || el.style.transition === 'none') return;
      const t = getComputedStyle(el).transform;
      el.style.transition = 'none';
      el.style.transform = t === 'none' ? '' : t;
    }
    function place(on, off = 0) { animTo(track, `translate3d(${-index * (W + GAP) + off}px,0,0)`, on); }
    function apply(on) { const it = cur(); if (it) animTo(it.el, transformOf(z.s, z.x, z.y), on); dlg.classList.toggle('is-zoomed', z.s > 1.01); }
    function readZoom() {           // the front still's zoom as drawn now (after freeze())
      const m = new DOMMatrixReadOnly(getComputedStyle(cur().el).transform);
      z = { s: Math.hypot(m.a, m.b) || 1, x: m.e, y: m.f };
    }
    function zoomAt(s, px, py, on) {
      const it = cur();
      s = clamp(s, 1, it.max);
      // keep the image point under (px, py) in place
      let x = px - W / 2 - (s / z.s) * (px - W / 2 - z.x), y = py - H / 2 - (s / z.s) * (py - H / 2 - z.y);
      const b = bounds(it, s);
      z = { s, x: s <= 1.001 ? 0 : clamp(x, b.minX, b.maxX), y: s <= 1.001 ? 0 : clamp(y, b.minY, b.maxY) };
      apply(on);
    }
    function settleZoom() {
      const it = cur(), s = z.s < 1.01 ? 1 : Math.min(z.s, it.max), b = bounds(it, s);
      z = s === 1 ? { s: 1, x: 0, y: 0 } : { s, x: clamp(z.x, b.minX, b.maxX), y: clamp(z.y, b.minY, b.maxY) };
      apply(true);
    }
    function toggleZoom(px, py) {
      if (z.s > 1.01) { z = { s: 1, x: 0, y: 0 }; apply(true); } else zoomAt(cur().dbl, px, py, true);
    }

    /* ---------- loading: the page's own image first, the largest file once decoded */
    function prime(i) {
      const it = items[i];
      if (!it || it.el.getAttribute('src')) return;
      const p = it.page;
      if (p && p.complete && p.naturalWidth && p.currentSrc) it.el.src = p.currentSrc;
    }
    function upgrade(i) {
      const it = items[i];
      if (!it || it.big) return Promise.resolve();
      const big = it.big = new Image();
      big.decoding = 'async';
      big.src = it.src;
      const swap = () => { if (it.big === big) it.el.src = it.src; };
      return (big.decode ? big.decode() : Promise.reject()).then(swap, () => new Promise(res => {
        if (big.complete && big.naturalWidth) { swap(); res(); return; }
        big.onload = () => { swap(); res(); }; big.onerror = res;
      }));
    }
    function loadAround() {
      [index, index - 1, index + 1].forEach(prime);
      if (!cur().el.getAttribute('src')) cur().el.src = cur().src;   // nothing cached: the file itself
      upgrade(index).then(() => { if (open && !saveData()) { upgrade(index + 1); upgrade(index - 1); } });
    }

    function update() {
      // the count, and for screen readers the still's own description after it
      const sr = document.createElement('span');
      sr.className = 'sr-only'; sr.textContent = cur().el.alt ? `: ${cur().el.alt}` : '';
      count.replaceChildren(`${index + 1} / ${items.length}`, sr);
      prevBtn.setAttribute('aria-disabled', String(index === 0));
      nextBtn.setAttribute('aria-disabled', String(index === items.length - 1));
    }
    function go(i, on = true) {
      i = clamp(i, 0, items.length - 1);
      if (i !== index) {
        const old = cur();
        animTo(old.el, transformOf(1, 0, 0), false);
        index = i; z = { s: 1, x: 0, y: 0 }; apply(false);
        update(); loadAround();
      }
      place(on);
    }

    /* ---------- open / close */
    function morph(opening, from) {
      const it = cur();
      const fade = (el, a, b, ms) => el.animate([{ opacity: a }, { opacity: b }], { duration: ms, easing: 'ease', fill: 'both' });
      if (!motion()) return Promise.resolve();
      const anims = [fade(shade, opening ? 0 : +getComputedStyle(shade).opacity, opening ? 1 : 0, opening ? 260 : 320)];
      chrome.forEach(el => anims.push(fade(el, opening ? 0 : 1, opening ? 1 : 0, 220)));
      if (from && from.width > 0) {
        it.el.style.transition = 'none';
        const now = it.el.style.transform || transformOf(1, 0, 0);
        it.el.style.transform = transformOf(1, 0, 0);
        const b = it.el.getBoundingClientRect();
        it.el.style.transform = now;
        const tx = from.left + from.width / 2 - (b.left + b.width / 2), ty = from.top + from.height / 2 - (b.top + b.height / 2);
        const flip = `translate3d(${tx}px,${ty}px,0) scale(${from.width / b.width},${from.height / b.height})`;
        anims.push(it.el.animate(opening ? [{ transform: flip }, { transform: now }] : [{ transform: now }, { transform: flip }],
          { duration: DUR, easing: EASE, fill: 'both' }));
      } else if (!opening) anims.push(it.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease', fill: 'both' }));
      return Promise.all(anims.map(a => a.finished.catch(() => {}))).then(() => anims);
    }

    function show(link) {
      if (closing) { reopen = link; return; }   // a tap while the last still flies home: open once it has landed
      if (open) return;
      const links = [...document.querySelectorAll('a[data-zoom]')].filter(a => shown(a) && pageImg(a));
      if (!links.includes(link)) links.push(link);
      items = links.map(a => {
        const p = pageImg(a);
        const el = document.createElement('img');
        el.className = 'pj-viewer__img'; el.alt = p.alt; el.decoding = 'async'; el.draggable = false;
        const slide = document.createElement('div');
        const w = +p.getAttribute('width') || p.naturalWidth || 16, h = +p.getAttribute('height') || p.naturalHeight || 10;
        const phone = h > w;
        slide.className = 'pj-viewer__slide' + (phone ? ' pj-viewer__slide--phone' : '');
        slide.appendChild(el);
        return { link: a, page: p, src: a.href, w, h, phone, el, slide, big: null };
      });
      index = Math.max(0, links.indexOf(link));
      track.replaceChildren(...items.map(it => it.slide));
      dlg.classList.toggle('is-single', items.length < 2);
      dlg.classList.remove('is-dismissing', 'is-zoomed', 'is-grabbing');
      const from = cur().page.getBoundingClientRect();   // before the scroll lock can move the page
      if (TS.lockScroll) TS.lockScroll(true);
      dlg.showModal();
      open = true; z = { s: 1, x: 0, y: 0 };
      shade.style.opacity = '';
      measure(); place(false); apply(false); update(); loadAround();
      try { history.pushState({ pjViewer: true }, ''); pushed = true; } catch (e) { pushed = false; }
      addEventListener('popstate', onPop);
      addEventListener('resize', onResize);
      morph(true, from).then(anims => (anims || []).forEach(a => a.cancel()));
    }

    // a visitor's close (X, Esc, swipe, a tap on the black): through Back when the viewer added a history entry
    function close() {
      if (!open || closing) return;
      if (pushed) {
        pushed = false; pending = true;
        history.back();
        fallback = setTimeout(() => { if (pending) { pending = null; finish(); } }, 450);   // no popstate came
        return;
      }
      finish();
    }
    function onPop() { if (!open || closing) return; pushed = false; pending = null; clearTimeout(fallback); finish(); }
    function onResize() { if (!open || closing) return; measure(); z = { s: 1, x: 0, y: 0 }; apply(false); place(false); }

    function finish() {
      if (!open || closing) return;
      closing = true;
      removeEventListener('popstate', onPop);
      removeEventListener('resize', onResize);
      clearTimeout(tapTimer); lastTap = null; g = null; pts.clear();
      const it = cur();
      if (TS.lockScroll) TS.lockScroll(false);
      // the still shown last, on the page and in view (it may sit further down, or off in a phone strip)
      try { it.link.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); } catch (e) { it.link.scrollIntoView(false); }
      const r = it.page.getBoundingClientRect();
      const from = r.width && r.bottom > 0 && r.top < innerHeight ? r : null;
      morph(false, from).then(anims => {
        dlg.close();
        (anims || []).forEach(a => a.cancel());
        const next = reopen;
        cleanup();
        it.link.focus({ preventScroll: true });
        if (next) show(next);
      });
    }
    function cleanup() {
      items.forEach(i => { if (i.big) { i.big.onload = i.big.onerror = null; i.big.src = ''; } });
      track.replaceChildren(); items = []; reopen = null;
      dlg.classList.remove('is-dismissing', 'is-zoomed', 'is-grabbing');
      open = false; closing = false;
    }
    // the browser closed the dialog itself (e.g. a second Esc it does not let the page cancel): tidy up at once
    dlg.addEventListener('close', () => {
      if (!open || closing) return;
      const link = cur() && cur().link;
      removeEventListener('popstate', onPop); removeEventListener('resize', onResize);
      if (TS.lockScroll) TS.lockScroll(false);
      cleanup();
      if (pushed) { pushed = false; history.back(); }
      if (link) link.focus({ preventScroll: true });
    });
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });

    /* ---------- controls and keys */
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => go(index - 1));
    nextBtn.addEventListener('click', () => go(index + 1));
    dlg.addEventListener('keydown', e => {
      if (!open || closing || e.altKey || e.ctrlKey || e.metaKey) return;
      const k = e.key, onBtn = e.target.closest && e.target.closest('button');
      if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); go(index + (k === 'ArrowRight' ? 1 : -1)); }
      else if (k === 'Home' || k === 'End') { e.preventDefault(); go(k === 'Home' ? 0 : items.length - 1); }
      else if (k === '+' || k === '=') { e.preventDefault(); zoomAt(z.s * 1.5, W / 2, H / 2, true); }
      else if (k === '-' || k === '_') { e.preventDefault(); zoomAt(z.s / 1.5, W / 2, H / 2, true); }
      else if (k === '0') { e.preventDefault(); z = { s: 1, x: 0, y: 0 }; apply(true); }
      else if (k === 'PageUp' || k === 'PageDown' || k === 'ArrowUp' || k === 'ArrowDown' || (k === ' ' && !onBtn)) e.preventDefault();   // the page behind stays put
    });

    /* ---------- gestures */
    const velocity = h => {
      if (h.length < 2) return { x: 0, y: 0 };
      const a = h[0], b = h[h.length - 1], dt = Math.max(1, b[0] - a[0]);
      return { x: (b[1] - a[1]) / dt, y: (b[2] - a[2]) / dt };
    };
    function stopAll() {
      freeze(track);
      const it = cur();
      if (it && it.el.style.transition && it.el.style.transition !== 'none') { freeze(it.el); readZoom(); }
      // a settle of the track was cut short: continue from where it is
      const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      return m.e + index * (W + GAP);
    }
    function startPinch() {
      const [a, b] = [...pts.values()];
      if (g && (g.mode === 'swipe')) place(false);
      if (g && g.mode === 'dismiss') { dlg.classList.remove('is-dismissing'); shade.style.opacity = ''; apply(false); }
      g = { mode: 'pinch', d0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), m0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, z0: { ...z } };
    }
    function pinchMove() {
      const [a, b] = [...pts.values()], it = cur();
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      let s = g.z0.s * Math.hypot(a.x - b.x, a.y - b.y) / g.d0;
      s = s > it.max ? it.max + (s - it.max) * 0.3 : s < 1 ? 1 - (1 - s) * 0.45 : s;
      z = { s, x: m.x - W / 2 - (s / g.z0.s) * (g.m0.x - W / 2 - g.z0.x), y: m.y - H / 2 - (s / g.z0.s) * (g.m0.y - H / 2 - g.z0.y) };
      apply(false);
    }
    stage.addEventListener('pointerdown', e => {
      if (!open || closing || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (e.pointerType === 'mouse') e.preventDefault();
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* already released */ }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        const off = stopAll();
        g = { mode: 'pending', x0: e.clientX, y0: e.clientY, off: Math.abs(off) > 1 ? off : 0, z0: { ...z }, onImg: e.target === cur().el,
          type: e.pointerType, hist: [[e.timeStamp, e.clientX, e.clientY]] };
        if (g.off) { g.mode = 'swipe'; place(false, g.off); }
      } else if (pts.size === 2) startPinch();
    });
    stage.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId) || !g) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (g.mode === 'pinch') { if (pts.size >= 2) pinchMove(); return; }
      const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
      g.hist.push([e.timeStamp, e.clientX, e.clientY]);
      while (g.hist.length > 2 && e.timeStamp - g.hist[0][0] > 100) g.hist.shift();
      if (g.mode === 'pending') {
        if (Math.hypot(dx, dy) < LOCK) return;
        const horiz = Math.abs(dx) >= Math.abs(dy);
        if (z.s > 1.01) {
          const b = bounds(cur(), z.s);
          const edge = horiz && items.length > 1 && ((dx > 0 && z.x >= b.maxX - 1) || (dx < 0 && z.x <= b.minX + 1));
          g.mode = edge ? 'swipe' : 'pan';
        } else g.mode = horiz ? (items.length > 1 ? 'swipe' : 'none') : 'dismiss';
        if (g.mode === 'pan') dlg.classList.add('is-grabbing');
        if (g.mode === 'dismiss') dlg.classList.add('is-dismissing');
      }
      const mx = e.clientX - g.x0, my = e.clientY - g.y0;
      if (g.mode === 'swipe') {
        let off = g.off + mx;
        if ((index === 0 && off > 0) || (index === items.length - 1 && off < 0)) off *= 0.35;
        place(false, off);
      } else if (g.mode === 'pan') {
        const b = bounds(cur(), z.s);
        z = { s: z.s, x: rubber(g.z0.x + mx, b.minX, b.maxX), y: rubber(g.z0.y + my, b.minY, b.maxY) };
        apply(false);
      } else if (g.mode === 'dismiss') {
        const k = Math.min(1, Math.abs(my) / (H * 0.6));
        animTo(cur().el, `translate3d(0,${my}px,0) scale(${1 - k * 0.14})`, false);
        shade.style.opacity = String(1 - k * 0.9);
      }
    });
    function up(e) {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (!g) return;
      if (g.mode === 'pinch') {
        if (pts.size === 1) {               // one finger stays: it pans on from here
          const [p] = [...pts.values()];
          g = { mode: 'pan', x0: p.x, y0: p.y, off: 0, z0: { ...z }, hist: [] };
          dlg.classList.add('is-grabbing');
        } else if (!pts.size) { g = null; settleZoom(); }
        return;
      }
      if (pts.size) return;
      const st = g; g = null;
      dlg.classList.remove('is-grabbing');
      const mx = e.clientX - st.x0, my = e.clientY - st.y0, v = velocity(st.hist);
      if (st.mode === 'pending') { if (e.type === 'pointerup') tap(e, st); else place(true); }
      else if (st.mode === 'swipe') {
        const off = st.off + mx;
        let to = index;
        if (off < -W * SWIPE || (v.x < -FLICK && mx < 0)) to += 1;
        else if (off > W * SWIPE || (v.x > FLICK && mx > 0)) to -= 1;
        go(to);
      } else if (st.mode === 'pan') settleZoom();
      else if (st.mode === 'dismiss') {
        if (Math.abs(my) > DISMISS || (Math.abs(v.y) > DISMISS_V && Math.sign(v.y) === Math.sign(my))) close();
        else {
          dlg.classList.remove('is-dismissing');
          shade.style.transition = motion() ? `opacity ${DUR}ms ease` : 'none';
          shade.style.opacity = '';
          apply(true);
        }
      }
    }
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    function tap(e, st) {
      if (st.type === 'mouse') { if (st.onImg) toggleZoom(e.clientX, e.clientY); else if (z.s <= 1.01) close(); return; }
      if (lastTap && e.timeStamp - lastTap.t < TAP_MS && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < TAP_PX) {
        clearTimeout(tapTimer); lastTap = null;
        toggleZoom(e.clientX, e.clientY);
        return;
      }
      lastTap = { t: e.timeStamp, x: e.clientX, y: e.clientY };
      const onImg = st.onImg;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { lastTap = null; if (!onImg && z.s <= 1.01) close(); }, TAP_MS);
    }
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      if (!open || closing || g) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? H : 1;
      const dx = e.deltaX * unit, dy = e.deltaY * unit;
      if (!e.ctrlKey && Math.abs(dx) > Math.abs(dy)) {
        if (z.s > 1.01) { const b = bounds(cur(), z.s); z = { s: z.s, x: clamp(z.x - dx, b.minX, b.maxX), y: z.y }; apply(false); }
        else if (Math.abs(dx) > 12 && e.timeStamp > wheelLock) { wheelLock = e.timeStamp + 450; go(index + (dx > 0 ? 1 : -1)); }
        return;
      }
      if (!dy) return;
      freeze(cur().el); readZoom();
      zoomAt(z.s * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0025)), e.clientX, e.clientY, false);
    }, { passive: false });
    dlg.addEventListener('gesturestart', e => e.preventDefault());   // older iOS Safari: never zoom the page behind
    dlg.addEventListener('contextmenu', e => { if (g) e.preventDefault(); });

    return { open: show };
  }
})();
