/* Tone: the whole page alternates BLACK and WHITE on scroll (owner, 22 Oct, reference elokeglobal.com: start
   'top center', .6s power1.out, on time not on scroll; 25 Oct: "I want you to follow that color thing in every page"
   and "in every page, the first should be black color and then white"). Every page opens BLACK (after the logo
   intro), then white, black, white ... per its chapter map (MAPS below). Look + tokens: 96-tone.css. Build spec:
   scratchpad tone/final/SPEC.md (this file is its final prototype, tone.js, made site code: the FAST PATH of 25 Oct,
   with the base flipped to black; the full build moves the maps into data-chapter marks from the page builders).
   - Fade: ONE fixed black veil under all content (.tone-veil, made here as body's first child); only its opacity
     animates (Web Animations, compositor): smooth even while the main thread restyles. The canvas (html background)
     turns black when a fade to black ends, white as a fade to white starts (overscroll never shows the other colour).
   - Ink: every colour token swaps in ONE step when the veil holds at .541 (page grey 117: outgoing #0b0b0b and
     incoming #f4f4f2 ink both >= 4.2:1). A crossfade would pass through 1:1 (the reference's flaw).
   - Cost: the swap is per TONE UNIT (the header, each child of <main>, the page shade, the skip link). Units on or
     near the screen swap in the balance frame, the rest in idle time (nearest first; at once if one scrolls near).
     The fade runs in two compositor segments that meet at the balance grey: the veil HOLDS there until the main thread
     has swapped the ink, so a slow phone or a long task can pause the fade at mid-grey but never show the wrong ink.
   - Switch: the chapter owning the screen's centre line (or the chapter's own line, data-chapter-at), with a +-6vh
     (>= 40px) band around each switch point: a resting finger never makes the page flap; a reversal continues from
     the current shade. Every page opens black; it ends on a black chapter that the footer joins, except the two
     shortest pages (Terms, 404), which end white above the always-black footer panel.
   - Instant (no fade): first evaluation (load, restored scroll, bfcache), a jump of more than 1.5 screens, reduced
     motion or motion off (TS.motion()), forced colours, a hidden tab. Frozen while the menu, the chat or a scroll lock
     holds the page (both overlays are black islands).
   - Statement scrub (home, first black chapter): the Idea copy's words brighten one by one with scroll (motion only;
     the crawler HTML is unchanged).
   - No JS: no veil, no units: the page is the black base (96-tone.css :root = today's black theme). Readable.
   Read-only state for other scripts and QA: TS.tone (= window.TSTone).{tone, target, index, chapters, pending,
   opacity()} and the window event 'ts:tone' {detail: {tone}} after each swap. */
(() => {
  'use strict';
  const root = document.documentElement;
  const TS = window.TS = window.TS || {};
  if (TS.tone) return;

  // a head pre-paint (SPEC 3.6, not shipped yet) may mark a reload inside a chapter of the other tone: keep it until
  // the browser has restored the scroll
  const prepainted = root.hasAttribute('data-tone');

  const DUR = 600;                                   // a full white <-> black fade (reference .6s)
  const EASE = [.25, .46, .45, .94];                 // power1.out (reference)
  const SWAP = 1 - 117 / 255;                        // veil opacity at the balance grey (117): swap the ink here
  const PAGE = { light: '#ffffff', dark: '#000000' };
  const RM = matchMedia('(prefers-reduced-motion: reduce)'), FC = matchMedia('(forced-colors: active)');
  const FINE = matchMedia('(hover: hover) and (pointer: fine)');
  const W = 'light', B = 'dark';
  const END = .6;                                    // the closing black chapter owns at least .6 of a screen

  /* ---------- Chapter maps per page (body class). [first element, tone, {at, mq}]: a chapter runs until the next
     entry; `at` = its switch line (fraction of the screen from the top, default .5 = the centre line; a negative value
     puts the line above the screen, i.e. the chapter starts once its root has scrolled that far past the top); `mq` =
     only where the media query matches. The first chapter is always BLACK (25 Oct). The maps alternate and keep black
     where the art is black (the hero, the Idea and FAQ sheets, client work, the footer) and give the white chapters
     to content made for paper (service cards, concepts, forms, legal text). Spans in screens of scroll (phone 390x844
     / desktop 1440x900); no middle chapter under ~.75 of a screen where the page allows it.
     data-chapter="light|dark" marks in the markup take precedence (SPEC section 4). */
  const PHONE = '(max-width:799.98px)', WIDE = '(min-width:800px)', STEPS = '(max-width:1199.98px)';
  const MAPS = {
    // B hero + Idea 2.95/3.37 . W services 5.17/3.02 . B beliefs 3.24/2.06 . W founder + agency 3.60/3.25 . B FAQ + footer
    'page-home': [['#hero', B], ['#services', W], ['#believe', B], ['#founder-teaser', W], ['#faq', B]],
    // B hero . W intro .76/.77 . B client work . W concepts (the tone says "not a client project") . B case study + CTA + footer
    'page-work': [['.wk-hero', B], ['.wk-intro', W], ['.wk-projects--client', B], ['.wk-projects--concept', W], ['.wk-story', B]],
    // B the hero (black art, full-bleed) . W founder . B studio + why . W philosophy + how we think . B promise + footer
    'page-who': [['.who-hero', B], ['#founder', W], ['#intro', B], ['#philosophy', W], ['#promise', B]],
    // two service rows per beat: B hero + rows 1-2 . W rows 3-4 . B rows 5-6 . W rows 7-8 + CTA . B footer
    'page-create': [['.create-hero', B], ['.create-list__inner > .svc-row:nth-child(3)', W],
      ['.create-list__inner > .svc-row:nth-child(5)', B], ['.create-list__inner > .svc-row:nth-child(7)', W], ['.site-footer', B]],
    // B head + hero scene . W gallery (the work on paper) . B next project + footer
    'page-project': [['.pj-head', B], ['.pj-gallery-wrap', W], ['.pj-next', B]],
    // phones/tablets (the step timeline): B hero + steps 1-2 . W steps 3-5 . B steps 6-8 . W step 9 + signature . B footer;
    // desktop (one artboard, never split inside it): B . W from .9 screen past the poster's top . B footer
    'page-approach': [['.ap', B], ['.ap-step:nth-of-type(3)', W, { mq: STEPS }], ['.ap-step:nth-of-type(6)', B, { mq: STEPS }],
      ['.ap-step:nth-of-type(9)', W, { mq: STEPS }], ['.ap', W, { at: -.9, mq: '(min-width:1200px)' }], ['.site-footer', B]],
    // B hero + Client Deck . W how it works . B leave a review + footer
    'page-stories': [['.sto-hero', B], ['#experience', W], ['#review', B]],
    // B hero (+ the first fields) . W the form . B footer (wide screens: the form tops the first screen, so its line
    // sits higher, at .2, for a real black opening)
    'page-contact': [['.ct-hero', B], ['#project-form', W, { at: -.15, mq: PHONE }], ['#project-form', W, { at: .2, mq: WIDE }], ['.site-footer', B]],
    // B hero . W the text (from .3 screen past its top) . B footer (privacy); terms is too short for three: B . W above the black footer
    'page-legal': [['.lg-hero', B], ['.lg-body', W, { at: -.3 }], ['.site-footer', B]],
    // B . W as the black footer panel rises (too short for three)
    'page-notfound': [['.nf', B], ['.site-footer', W]]
  };

  let chapters = [], units = [], pending = [], idleId = 0, veil = null, meta = null, scrubEl = null;
  let index = -1, shown = null, target = null, frozen = false, lastY = -1, raf = 0, vh = innerHeight;
  let anim = null, to = 0, dur = DUR, watchRaf = 0;

  const motion = () => (TS.motion ? TS.motion() : root.classList.contains('motion') && !RM.matches) && !FC.matches;

  /* ---------- Measure: chapters (switch scroll positions) and units (document tops, heights, element counts) */
  function spec() {
    const marked = [...document.querySelectorAll('[data-chapter]')].filter(el => !el.hasAttribute('data-tone-map'));
    if (marked.length) return marked.map(el => [el, el.getAttribute('data-chapter'), { at: +(el.getAttribute('data-chapter-at') || .5) }]);
    const key = [...document.body.classList].find(c => MAPS[c]);
    return (MAPS[key] || [['main', B]]).map(([sel, tone, o = {}]) => {
      if (o.mq && !matchMedia(o.mq).matches) return null;
      const el = document.querySelector(sel);
      if (!el) return null;
      el.setAttribute('data-chapter', tone); el.setAttribute('data-tone-map', '');
      return [el, tone, { at: o.at === undefined ? .5 : o.at }];
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
      return { el, top: r.top + (fixed === 'fixed' ? 0 : y), h: r.height, fixed: fixed === 'fixed' || fixed === 'sticky' };
    });
  }
  const isNear = (u, y, m) => u.fixed || (u.top + u.h > y - vh * m && u.top < y + vh * (1 + m));

  /* ---------- The ink swap (per unit) */
  const COLOR_T = /^(color|background-color|background|border(-\w+)?-color|border|fill|stroke|box-shadow|outline-color|text-decoration-color|-webkit-text-fill-color)$/;
  // a STYLE-ONLY flush of the whole document: document.getAnimations() brings the style up to date (not layout) and
  // lists the CSS transitions the swap just started. getComputedStyle(body) is not enough (Blink then restyles only
  // the body's ancestors) and a layout read (offsetWidth) is too much (measured: the x4 swap frame grew 3x).
  const restyle = () => (document.getAnimations ? document.getAnimations() : []);
  const setUnit = (u, t) => { if (u.el.getAttribute('data-tone') !== t) u.el.setAttribute('data-tone', t); };
  const ric = window.requestIdleCallback ? (f => requestIdleCallback(f, { timeout: 600 })) : (f => setTimeout(() => f({ timeRemaining: () => 6 }), 80));
  function swap(t, all) {
    shown = t;
    root.setAttribute('data-tone-state', t);
    if (meta) meta.setAttribute('content', PAGE[t]);
    const y = scrollY;
    pending = [];
    for (const u of units) {
      if (all || isNear(u, y, .5)) setUnit(u, t);
      else pending.push(Object.assign(u, { d: Math.min(Math.abs(u.top - y), Math.abs(u.top + u.h - y - vh)) }));
    }
    if (root.hasAttribute('data-tone')) root.removeAttribute('data-tone');            // the pre-paint hands over
    // the restyle, now; components with their own colour transitions (buttons .35s, chips, FAQ rows) would crossfade
    // fill and label through 1:1 after the swap: finish them in this frame (no extra restyle)
    finishColourTransitions(restyle());
    pending.sort((a, b) => a.d - b.d);
    if (pending.length) { if (!idleId) idleId = ric(drain) || 1; } else scheme();
    window.dispatchEvent(new CustomEvent('ts:tone', { detail: { tone: t } }));
  }
  function drain(dl) {
    idleId = 0;
    while (pending.length) {
      setUnit(pending.shift(), shown);
      restyle();                                     // restyle THIS unit inside the idle slice (off screen)
      if (dl.timeRemaining() < 4) break;
    }
    if (pending.length) idleId = ric(drain) || 1; else scheme();
  }
  function finishColourTransitions(list) {
    for (const a of list) {
      const p = a.transitionProperty;
      if (p && COLOR_T.test(p)) try { a.finish(); } catch (e) { /* idle */ }
    }
  }
  function catchUp(y) {                                                              // a pending unit scrolls near
    if (!pending.length) return;
    let hit = false;
    pending = pending.filter(u => { if (isNear(u, y, .6)) { setUnit(u, shown); hit = true; return false; } return true; });
    if (hit) finishColourTransitions(restyle());
  }
  function scheme() { if (FINE.matches && root.getAttribute('data-scheme') !== shown) ric(() => root.setAttribute('data-scheme', shown)); }
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
  function update() {
    raf = 0;
    if (frozen || !veil) return;
    const y = scrollY;
    const jump = lastY >= 0 && Math.abs(y - lastY) > vh * 1.5;
    lastY = y;
    catchUp(y);
    const i = pick(y);
    if (chapters[i] && (i !== index || target !== chapters[i].tone)) {
      const first = index < 0;
      index = i;
      if (target !== chapters[i].tone || shown !== chapters[i].tone) fade(chapters[i].tone, first || jump || !motion() || document.hidden);
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
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', () => { recompute(); request(); });
    addEventListener('load', () => { recompute(); request(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { recompute(); request(); });
    if ('ResizeObserver' in window) { let q = 0; new ResizeObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; recompute(); request(); }); }).observe(document.body); }
    addEventListener('pageshow', e => { if (e.persisted) { index = -1; lastY = -1; recompute(); update(); } });
    const remember = () => { try { sessionStorage.setItem('ts-tone', JSON.stringify({ p: location.pathname, t: shown })); } catch (e) { /* blocked */ } };
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
