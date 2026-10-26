/* Tone: the whole page alternates BLACK and WHITE on scroll (owner, 22 Oct, reference elokeglobal.com: start
   'top center', .6s power1.out, on time not on scroll; 25 Oct: "I want you to follow that color thing in every page"
   and "in every page, the first should be black color and then white"). Every page opens BLACK (after the logo
   intro), then white, black, white ... per its CHAPTER MARKS: data-chapter="dark|light" on the first element of each
   chapter, emitted by the page builders (scripts/tone.py chapter(); scripts/pages/*.py, scripts/sections/*.py,
   chrome_footer.py), guarded by check.py (the tone block). Look + tokens: 96-tone.css. Build spec: scratchpad
   tone/final/SPEC.md (base flipped to black, 25 Oct).
   - Marks: a chapter runs from its mark to the next one. data-chapter-at = its switch line as a fraction of the
     screen from the top (default .5 = the centre line; negative: the chapter starts once its mark has scrolled that
     far past the top); a list like the sizes attribute picks a value per media query ("(max-width:799.98px) -.15, .2").
     data-chapter-mq = the mark only counts where the media query matches (Our Approach: the step timeline on phones
     and tablets, the artboard from 1200 px). Marks that are not rendered (display:none) are skipped.
   - Fade: ONE fixed black veil under all content (.tone-veil, emitted by chrome.py after the skip link); only its
     opacity animates (Web Animations, compositor): smooth even while the main thread restyles. The canvas (html
     background) turns black when a fade to black ends, white as a fade to white starts (overscroll never shows the
     other colour).
   - Ink: every colour token swaps in ONE step when the veil holds at .541 (page grey 117: outgoing #0b0b0b and
     incoming #f4f4f2 ink both >= 4.2:1). A crossfade would pass through 1:1 (the reference's flaw).
   - Cost: the swap is per TONE UNIT (the header, each child of <main>, the page shade, the skip link); one unit's
     restyle is its whole subtree (~20-30 us an element on a desktop, x4 on a mid phone). Only the units ON the screen
     swap in the balance frame; the rest wait for a quiet moment (no scroll for 220 ms: idle time, nearest first, one
     unit per idle slice unless it fits) or swap just before they scroll into view. Never a forced restyle of an
     off-screen unit while the visitor scrolls (review 26 Oct: long tasks of 0.5-1 s on a phone at x4).
     The fade runs in two compositor segments that meet at the balance grey: the veil HOLDS there until the main thread
     has swapped the ink, so a slow phone or a long task can pause the fade at mid-grey but never show the wrong ink.
   - Switch: the chapter owning the screen's centre line (or the chapter's own line), with a +-6vh (>= 40px) band
     around each switch point: a resting finger never makes the page flap; a reversal continues from the current
     shade. A FLICK through a short chapter does not start its fade: a new tone starts only when the scroll, at its
     current speed, would stay in that chapter for at least .5 s (or it has slowed down there), and the target is
     checked again before the ink swaps (a chapter already left is never completed: no grey flash, no double swap).
     Same-tone neighbours collapse (the footer's dark mark joins the last black chapter); the closing chapter
     owns at least .6 of a screen; a chapter the page cannot scroll into, or one squeezed into a flash, is dropped
     (Terms and the 404 are too short for three chapters: they end white above the always-black footer panel).
   - Instant (no fade): first evaluation (load, restored scroll, bfcache), a jump of more than 1.5 screens, reduced
     motion or motion off (TS.motion()), forced colours, a hidden tab. Frozen while the menu, the chat or a scroll lock
     holds the page (both overlays are black islands).
   - Reload / back-forward PRE-PAINT (chrome.py head script): the tone shown when the visitor left a page is kept per
     path in sessionStorage 'ts-tone' (pagehide); a reload or back navigation of a page left inside a WHITE chapter
     paints white from the first frame (html data-tone / data-tone-state / data-canvas = light, theme-color #ffffff).
     This controller holds that pre-paint until the browser has restored the scroll, then evaluates instantly.
   - Statement scrub (home, first black chapter): the Idea copy's words brighten one by one with scroll (motion only;
     the crawler HTML is unchanged).
   - No JS: the veil stays transparent, no units: the page is the black base (96-tone.css :root = today's black
     theme). Readable.
   Read-only state for other scripts and QA: TS.tone (= window.TSTone).{tone, target, index, chapters, pending,
   opacity()} and the window event 'ts:tone' {detail: {tone}} after each swap. */
(() => {
  'use strict';
  const root = document.documentElement;
  const TS = window.TS = window.TS || {};
  if (TS.tone) return;

  // the head pre-paint (chrome.py) marks a reload / back navigation inside a WHITE chapter: keep it until the browser
  // has restored the scroll
  const prepainted = root.hasAttribute('data-tone');

  const DUR = 600;                                   // a full white <-> black fade (reference .6s)
  const EASE = [.25, .46, .45, .94];                 // power1.out (reference)
  const SWAP = 1 - 117 / 255;                        // veil opacity at the balance grey (117): swap the ink here
  const PAGE = { light: '#ffffff', dark: '#000000' };
  const RM = matchMedia('(prefers-reduced-motion: reduce)'), FC = matchMedia('(forced-colors: active)');
  const W = 'light', B = 'dark';
  const END = .6;                                    // the closing black chapter owns at least .6 of a screen
  const ON = .12;                                    // "on the screen": within .12 of a screen of the viewport
  const AHEAD = .8;                                  // a waiting unit swaps once it is .8 of a screen from view
  const QUIET = 220;                                 // ms without a scroll event = a quiet moment (idle swaps)
  const STAY = 500;                                  // a new tone starts only if the scroll would stay this long

  let chapters = [], units = [], pending = [], idleId = 0, veil = null, meta = null, scrubEl = null;
  let index = -1, shown = null, target = null, frozen = false, lastY = -1, raf = 0, vh = innerHeight;
  let anim = null, to = 0, dur = DUR, watchRaf = 0;
  let lastT = 0, speed = 0, scrollT = -1e9, waitT = 0;   // scroll speed (px/ms, smoothed), last scroll event
  let perEl = .03;                                   // measured restyle cost, ms per element (adaptive)

  const motion = () => (TS.motion ? TS.motion() : root.classList.contains('motion') && !RM.matches) && !FC.matches;

  /* ---------- Measure: chapters (switch scroll positions) and units (document tops, heights, element counts) */
  // data-chapter-at: a number, or a list like the sizes attribute ("(max-width:799.98px) -.15, .2": the value of the
  // first condition that matches, else the plain value); default .5, the centre line
  function lineAt(v) {
    if (v === null || v.trim() === '') return .5;
    for (const part of v.split(',')) {
      const p = part.trim(), m = /^(\(.*\))\s+(-?\d*\.?\d+)$/.exec(p);
      if (m) { if (matchMedia(m[1]).matches) return +m[2]; } else if (p !== '' && isFinite(+p)) return +p;
    }
    return .5;
  }
  function spec() {
    return [...document.querySelectorAll('[data-chapter]')].map(el => {
      const tone = el.getAttribute('data-chapter'), mq = el.getAttribute('data-chapter-mq');
      if ((tone !== B && tone !== W) || (mq && !matchMedia(mq).matches) || !el.getClientRects().length) return null;
      return [el, tone, { at: lineAt(el.getAttribute('data-chapter-at')) }];
    }).filter(Boolean);
  }
  const H = () => Math.max(40, vh * .06);            // the switch band, each side
  function recompute() {
    vh = innerHeight;
    const y = scrollY, max = Math.max(0, root.scrollHeight - vh);
    let list = spec().map(([el, tone, o]) => ({ el, tone, s: el.getBoundingClientRect().top + y - vh * o.at }));
    list.sort((a, b) => a.s - b.s);
    list = list.filter((c, i) => i === 0 || c.tone !== list[i - 1].tone);           // never a B-B "beat"
    if (!list.length || list[0].tone !== B) list.unshift({ el: document.body, tone: B, s: 0 });   // every page opens black
    list[0].s = -Infinity;
    list.forEach(c => { c.s0 = c.s; });
    const place = () => {
      for (let i = 1; i < list.length; i++) {
        list[i].s = list[i].s0;
        // the closing chapter owns at least END of a screen (short pages: Contact, legal, 404) and is reachable
        if (i === list.length - 1) list[i].s = Math.min(list[i].s, max - Math.max(2 * H(), vh * END));
        // ... but every page still OPENS black: the first switch lies beyond the band (a very short page, e.g. a 404
        // on a tall desktop screen, would otherwise put the end rule's chapter at scroll 0)
        if (i === 1) list[i].s = Math.max(list[i].s, H() + 1);
        list[i].s = Math.max(list[i].s, list[i - 1].s + 1);
      }
    };
    place();
    // a chapter the page cannot scroll into (a page that scrolls less than its band) is dropped
    while (list.length > 1 && list[list.length - 1].s + H() > max) list.pop();
    // no chapter may be a flash (shorter than the two bands, or .3 of a screen): when the closing chapter squeezes the
    // one before it (Terms on a phone), the page ends on that one; a squeezed middle chapter (an odd viewport size) is
    // dropped together with the next one (the same tone as the one before), so the rhythm stays strict, nothing strobes
    const flash = Math.max(2 * H() + 1, vh * .3);
    while (list.length > 2 && list[list.length - 1].s - list[list.length - 2].s < flash) { list.pop(); place(); }
    for (let i = 1; i < list.length - 1; i++) if (list[i + 1].s - list[i].s < flash) { list.splice(i--, 2); place(); }
    chapters = list;
    const els = [document.querySelector('.site-header'), ...(document.querySelector('main') || document.body).children,
      document.querySelector('.page-shade'), document.querySelector('.skip-link')]
      .filter(el => el && !/^(SCRIPT|TEMPLATE|STYLE)$/.test(el.tagName));
    units = els.map(el => {
      const r = el.getBoundingClientRect(), fixed = getComputedStyle(el).position;
      return { el, top: r.top + (fixed === 'fixed' ? 0 : y), h: r.height, fixed: fixed === 'fixed' || fixed === 'sticky',
        n: el.getElementsByTagName('*').length + 1 };
    });
    // a waiting unit keeps its place in the queue with its new measurements
    if (pending.length) pending = units.filter(u => u.el.getAttribute('data-tone') !== shown);
  }
  const isNear = (u, y, m) => u.fixed || (u.top + u.h > y - vh * m && u.top < y + vh * (1 + m));

  /* ---------- The ink swap (per unit) */
  const COLOR_T = /^(color|background-color|background|border(-\w+)?-color|border|fill|stroke|box-shadow|outline-color|text-decoration-color|-webkit-text-fill-color)$/;
  // a STYLE-ONLY flush of the whole document: document.getAnimations() brings the style up to date (not layout) and
  // lists the CSS transitions the swap just started. getComputedStyle(body) is not enough (Blink then restyles only
  // the body's ancestors) and a layout read (offsetWidth) is too much (measured: the x4 swap frame grew 3x).
  const restyle = () => (document.getAnimations ? document.getAnimations() : []);
  // set a unit's tone; -> its element count when it changed (0 when it already had it)
  const setUnit = (u, t) => { if (u.el.getAttribute('data-tone') === t) return 0; u.el.setAttribute('data-tone', t); return u.n; };
  const ric = window.requestIdleCallback ? (f => requestIdleCallback(f, { timeout: 1000 })) : (f => setTimeout(() => f({ timeRemaining: () => 8 }), 60));
  // the restyle, now; components with their own colour transitions (buttons .35s, chips, FAQ rows) would crossfade
  // fill and label through 1:1 after the swap: finish them in this frame. Timed: the cost per element on this device
  // tells the idle queue how many units fit in a slice.
  function flush(n) {
    const t0 = performance.now();
    finishColourTransitions(restyle());
    if (n > 150) perEl = perEl * .6 + .4 * Math.min(.5, (performance.now() - t0) / n);
  }
  const away = (u, y) => (u.fixed ? 0 : Math.max(0, u.top - y - vh, y - u.top - u.h));
  function swap(t, all) {
    shown = t;
    root.setAttribute('data-tone-state', t);
    if (meta) meta.setAttribute('content', PAGE[t]);
    const y = scrollY;
    let n = 0;
    pending = [];
    for (const u of units) {
      if (all || isNear(u, y, ON)) n += setUnit(u, t);                  // on the screen: in the balance frame
      else if (u.el.getAttribute('data-tone') !== t) pending.push(u);   // the rest: a quiet moment, or just in time
    }
    if (root.hasAttribute('data-tone')) root.removeAttribute('data-tone');            // the pre-paint hands over
    flush(n);
    queue();
    window.dispatchEvent(new CustomEvent('ts:tone', { detail: { tone: t } }));
  }
  function queue() { if (pending.length && !idleId) idleId = ric(drain) || 1; }
  function drain(dl) {
    idleId = 0;
    if (!pending.length) return;
    // the visitor is scrolling (or an overlay holds the page): wait for a quiet moment; units about to come into view
    // swap just in time (catchUp)
    if (frozen || performance.now() - scrollT < QUIET) { idleId = setTimeout(() => { idleId = 0; queue(); }, QUIET) || 1; return; }
    const y = scrollY;
    pending.sort((a, b) => away(a, y) - away(b, y));
    let done = 0;
    while (pending.length) {
      const u = pending[0];
      if (done && u.n * perEl > dl.timeRemaining()) break;            // one unit per slice unless it fits
      pending.shift();
      const n = setUnit(u, shown);
      if (n) { flush(n); done++; }
      if (dl.timeRemaining() < 3) break;
    }
    queue();
  }
  function finishColourTransitions(list) {
    for (const a of list) {
      const p = a.transitionProperty;
      if (p && COLOR_T.test(p)) try { a.finish(); } catch (e) { /* idle */ }
    }
  }
  function catchUp(y) {                                                              // a waiting unit comes near
    if (!pending.length) return;
    let n = 0;
    pending = pending.filter(u => { if (isNear(u, y, AHEAD)) { n += setUnit(u, shown); return false; } return true; });
    if (n) flush(n);
  }
  const canvas = t => { if (root.getAttribute('data-canvas') !== t) root.setAttribute('data-canvas', t); };

  /* ---------- The fade: veil opacity only, on the compositor, in TWO segments that meet at the balance grey.
     Segment 1 runs from the current shade to the balance (opacity SWAP) and HOLDS there (fill forwards); the main
     thread swaps the ink in the first frame after the veil holds there and then starts segment 2 from wherever the
     veil is: a slow restyle holds the page at mid-grey for its duration, where outgoing and incoming ink are both
     >= 4.2:1, so the ink can never lag or lead the page. The two segments sample one power1.out curve (piecewise-linear
     keyframes), so together they are the reference fade. */
  const bez = (() => {
    const [p1x, p1y, p2x, p2y] = EASE, cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx, cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const e = ((ax * t + bx) * t + cx) * t - x, d = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; } t = Math.min(1, Math.max(0, t)); return ((ay * t + by) * t + cy) * t; };
  })();
  const SEG = 10;                                    // keyframes per segment
  let phase = 0, curve = null, seg1 = 0;             // phase 1 = to the balance (hold), 2 = to the goal
  const veilNow = () => (veil ? +getComputedStyle(veil).opacity || 0 : 0);
  const xAt = (c, o) => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if ((c.from + (c.to - c.from) * bez(m) - o) * Math.sign(c.to - c.from) < 0) lo = m; else hi = m; } return (lo + hi) / 2; };
  function runSeg(c, x0, x1, hold) {                 // animate the curve c between x0 and x1
    const kf = [];
    for (let i = 0; i <= SEG; i++) { const x = x0 + (x1 - x0) * i / SEG; kf.push({ offset: i / SEG, opacity: c.from + (c.to - c.from) * bez(x) }); }
    return veil.animate(kf, { duration: Math.max(16, (x1 - x0) * c.dur), easing: 'linear', fill: hold ? 'forwards' : 'none' });
  }
  function settle() {
    anim = null; phase = 0;
    veil.style.opacity = String(to);
    if (to === 1) canvas(B);
  }
  function phase2() {                               // after the swap: from wherever the veil is, the rest of the curve
    const o = veilNow(), x = xAt(curve, o);
    if (anim) anim.cancel();
    veil.style.opacity = String(to);
    phase = 2;
    const kf = [];
    for (let i = 0; i <= SEG; i++) { const xi = x + (1 - x) * i / SEG; kf.push({ offset: i / SEG, opacity: i ? curve.from + (curve.to - curve.from) * bez(xi) : o }); }
    anim = veil.animate(kf, { duration: Math.max(16, (1 - x) * curve.dur), easing: 'linear' });
    anim.onfinish = settle;
  }
  function watch() {
    watchRaf = 0;
    if (!anim) return;
    if (phase === 1 && anim.playState !== 'paused') {
      if ((anim.currentTime || 0) >= seg1 || anim.playState === 'finished') {
        // the target again, before the ink swaps: a chapter the scroll has left meanwhile is not completed (the fade
        // turns back from the balance grey, no swap)
        const i = pick(scrollY);
        if (chapters[i] && chapters[i].tone !== target) { index = i; fade(chapters[i].tone); return; }
        if (shown !== target) swap(target);
        phase2();
      }
    }
    if (anim) watchRaf = requestAnimationFrame(watch);
  }
  function fade(t, instant) {
    target = t;
    const goal = t === B ? 1 : 0;
    const now = veilNow();
    if (anim) { anim.cancel(); anim = null; phase = 0; }
    to = goal;
    // no Web Animations (very old browsers): the tone simply changes at once
    if (instant || !veil.animate) { veil.style.opacity = String(goal); swap(t, shown === null); canvas(t); return; }
    if (t === W) canvas(W);                          // the canvas under the veil goes white first (overscroll)
    const span = Math.abs(goal - now);
    if (span < .002) { veil.style.opacity = String(goal); if (shown !== t) swap(t); canvas(t); return; }
    dur = Math.max(240, DUR * span);
    curve = { from: now, to: goal, dur };
    if (shown === t) {                               // the ink is already right (a reversal before the swap): one segment
      veil.style.opacity = String(goal);
      seg1 = 0; phase = 2; anim = runSeg(curve, 0, 1, false); anim.onfinish = settle;
    } else if ((goal - now) * (SWAP - now) <= 0) {   // already at or past the balance: swap now, then the rest
      swap(t); veil.style.opacity = String(goal); seg1 = 0; phase = 2; anim = runSeg(curve, 0, 1, false); anim.onfinish = settle;
    } else {                                         // to the balance and hold; the ink swap releases segment 2
      const xb = xAt(curve, SWAP);
      seg1 = Math.max(16, xb * dur);
      phase = 1; anim = runSeg(curve, 0, xb, true);
    }
    if (!watchRaf) watchRaf = requestAnimationFrame(watch);
  }

  /* ---------- Which chapter owns the line (Schmitt band +-H around each switch point) */
  function pick(y) {
    const n = chapters.length;
    if (!n) return 0;
    let i = Math.max(0, Math.min(index, n - 1)), h = H();
    while (i + 1 < n && y >= chapters[i + 1].s + h) i++;
    while (i > 0 && y < chapters[i].s - h) i--;
    if (index < 0) { i = 0; while (i + 1 < n && y >= chapters[i + 1].s) i++; }   // first evaluation: no band
    return i;
  }
  // a flick: would the scroll, at its current speed, leave chapter i within STAY ms? (then its fade does not start)
  let dir = 1;
  function passing(i, y) {
    const v = performance.now() - scrollT > 100 ? 0 : speed;                      // px per ms; 0 once it has stopped
    if (v * 1000 < vh * .6) return false;                                         // slower than .6 of a screen a second
    const h = H(), nx = chapters[i + 1];
    const left = dir > 0 ? (nx ? nx.s + h - y : Infinity) : y - (chapters[i].s - h);
    return left / v < STAY;
  }
  function update() {
    raf = 0;
    if (frozen || !veil) return;
    const y = scrollY, now = performance.now();
    const jump = lastY >= 0 && Math.abs(y - lastY) > vh * 1.5;
    if (lastY >= 0 && y !== lastY) { speed = speed * .4 + .6 * Math.abs(y - lastY) / Math.max(8, now - lastT); dir = y > lastY ? 1 : -1; }
    lastY = y; lastT = now;
    catchUp(y);
    const i = pick(y);
    if (chapters[i] && (i !== index || target !== chapters[i].tone)) {
      const first = index < 0, t = chapters[i].tone, instant = first || jump || !motion() || document.hidden;
      if (!instant && t !== shown && t !== target && passing(i, y)) {
        // flicking through: look again when the scroll has slowed down or stopped
        if (!waitT) waitT = setTimeout(() => { waitT = 0; request(); }, 120);
      } else {
        index = i;
        if (target !== t || shown !== t) fade(t, instant);
      }
    }
    scrub();
  }
  const request = () => { if (!raf) raf = requestAnimationFrame(update); };

  /* ---------- Scroll-scrubbed statement on the first black chapter (home: the Idea copy). Words brighten one by one
     from a .24 ghost as the block travels from 88% to 50% of the screen, lerped (reference scrub: 1). The crawler
     HTML is unchanged (split at runtime). Reduced motion / motion off: not split. */
  let scrubP = 0, scrubT = 0, scrubRaf = 0;
  function setupScrub() {
    const el = document.querySelector('.idea__copy');
    if (!el || !motion()) return;
    let i = 0;
    const walk = node => [...node.childNodes].forEach(nd => {
      if (nd.nodeType === 3) {
        if (!nd.nodeValue.trim()) return;
        const frag = document.createDocumentFragment();
        nd.nodeValue.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          const s = document.createElement('span'); s.className = 'tw'; s.style.setProperty('--i', i++); s.textContent = p; frag.appendChild(s);
        });
        nd.replaceWith(frag);
      } else if (nd.nodeType === 1) walk(nd);
    });
    walk(el);
    el.style.setProperty('--n', i); el.style.setProperty('--p', 0);
    scrubEl = el;
  }
  function scrub() {
    if (!scrubEl) return;
    const r = scrubEl.getBoundingClientRect(), a = vh * .88, b = vh * .5;
    scrubT = Math.min(1, Math.max(0, (a - r.top) / ((a - b) + r.height)));
    if (!scrubRaf) scrubRaf = requestAnimationFrame(lerp);
  }
  function lerp() {
    scrubRaf = 0;
    scrubP += (scrubT - scrubP) * .16;
    if (Math.abs(scrubT - scrubP) < .001) scrubP = scrubT; else scrubRaf = requestAnimationFrame(lerp);
    scrubEl.style.setProperty('--p', scrubP.toFixed(4));
  }

  function init() {
    meta = document.querySelector('meta[name="theme-color"]');
    veil = document.querySelector('.tone-veil');
    // chrome.py emits the veil after the skip link; a page without it still fades
    if (!veil) { veil = document.createElement('div'); veil.className = 'tone-veil'; veil.setAttribute('aria-hidden', 'true'); document.body.prepend(veil); }
    recompute();
    setupScrub();
    const start = () => { lastY = scrollY; update(); };
    // a pre-painted reload keeps its black until the browser has restored the scroll (first scroll event or load)
    if (prepainted && scrollY < 2) {
      let done = false;
      const go = () => { if (done) return; done = true; recompute(); start(); };
      addEventListener('scroll', go, { once: true, passive: true });
      addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(go)), { once: true });
    } else start();
    addEventListener('scroll', () => { scrollT = performance.now(); request(); }, { passive: true });
    addEventListener('resize', () => { recompute(); request(); });
    addEventListener('load', () => { recompute(); request(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { recompute(); request(); });
    if ('ResizeObserver' in window) { let q = 0; new ResizeObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; recompute(); request(); }); }).observe(document.body); }
    addEventListener('pageshow', e => { if (e.persisted) { index = -1; lastY = -1; recompute(); update(); } });
    // the tone shown when the visitor leaves, per path (the head pre-paint reads it on a reload / back navigation)
    const remember = () => {
      try {
        let m = JSON.parse(sessionStorage.getItem('ts-tone') || '{}');
        if (!m || typeof m !== 'object' || Array.isArray(m)) m = {};
        delete m[location.pathname];
        m[location.pathname] = shown;
        const keys = Object.keys(m);
        keys.slice(0, Math.max(0, keys.length - 40)).forEach(k => delete m[k]);   // the 40 most recent pages
        sessionStorage.setItem('ts-tone', JSON.stringify(m));
      } catch (e) { /* storage blocked: no pre-paint; the page opens black and switches at once */ }
    };
    addEventListener('pagehide', remember);
    document.addEventListener('visibilitychange', () => { if (document.hidden) remember(); });
    // the menu, the chat window or a scroll lock holds the page: freeze the tone (both overlays are black islands);
    // on release, catch up instantly
    new MutationObserver(() => {
      const f = root.matches('.menu-is-open,.cc-open,.is-locked');
      if (f === frozen) return;
      frozen = f;
      if (!f) { lastY = -1; const i = pick(scrollY); if (chapters[i] && chapters[i].tone !== target) { index = i; fade(chapters[i].tone, true); } request(); }
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
    if (RM.addEventListener) RM.addEventListener('change', () => { if (target) fade(target, true); });

    window.TSTone = TS.tone = {                      // read-only state (diagnostics, QA, section scripts)
      get tone() { return shown; }, get target() { return target; }, get index() { return index; },
      get pending() { return pending.length; }, opacity: veilNow,
      get chapters() { return chapters.map(c => ({ tone: c.tone, s: Math.round(c.s), el: (c.el.id ? '#' + c.el.id : String(c.el.className).split(' ')[0]) || c.el.tagName })); }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
