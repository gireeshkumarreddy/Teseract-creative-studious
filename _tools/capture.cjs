#!/usr/bin/env node
/* =============================================================================
   capture.cjs - TESERACT portfolio capture tool (HD stills + smooth scroll MP4s)
   =============================================================================
   Observe-only: it navigates, scrolls, clicks what you tell it to and takes
   pictures. It never types personal data, blocks every form submission by
   default and aborts non-GET network requests unless you pass --allow-post.

   USAGE
     node capture.cjs inspect <url> [--preset desktop|phone] [--json out.json] [--scan]
         Title, h1, section tops (for scroll targets), smooth-scroll library,
         fixed elements, links, buttons, dialogs, forms, console/network errors,
         banners. --scan also scrolls the whole page and reports broken/unloaded
         images, placeholder text (lorem ipsum, TODO, undefined...) and
         horizontal overflow. (Links are de-duplicated by href: many "#" links
         show as one entry.)

     node capture.cjs frames <url> --out <file.png> [--preset desktop|phone]
                             [--steps "step ; step ; ..."] [--step <step>]...
     node capture.cjs frames --plan <plan.json> [--summary out.json]
         Viewport screenshot(s). desktop = 1440x900 @2 -> 2880x1800 PNG,
         phone = 390x844 @3 (isMobile, hasTouch) -> 1170x2532 PNG.
         Before every shot: cookie banner dismissed (reject/close, never accept),
         fonts ready, network quiet, every visible in-view <img> loaded+decoded
         (images clipped by carousels are ignored, lazy ones forced to load),
         >= --settle ms (default 2500) after the last action, mouse parked
         (unless the shot has a hover: step). Warnings name the shot file.
         Shot/plan option "cookies": false skips the banner heuristics (keeps a
         privacy/cookie-policy modal open that you opened on purpose).

     node capture.cjs record <url> --out <file.mp4> [--preset desktop|phone]
                             [--from <y|css>] [--to <y|css>] [--to-offset <px>]
                             [--duration 14] [--hold-start 1.5] [--hold-end 1]
                             [--ramp 1.2] [--fps 30] [--steps "..."]
                             [--trace <file|none>] [--samples <dir>] [--sample-every 30]
         Smooth eased scroll recording, deterministic (virtual time, see below).
         desktop = 1440x900 CSS px @1.3333 -> 1920x1200, phone = 390x844 @2
         -> 780x1688. Encoded as master: libx264 -crf 16 -preset slow
         -pix_fmt yuv420p -movflags +faststart, BT.709 tagged, no audio.
         Frames are piped straight into ffmpeg (no frame files on disk; only
         --samples writes every Nth frame as PNG - delete them afterwards).
         Trace (planned vs actual scroll per frame) goes to --trace, default
         %TEMP%/capture-traces/<name>.trace.json - never into the media folder.
         A screenshot that stalls (> 8 s and > 8x typical) is taken again.

     node capture.cjs verify <file.mp4> [--sheet <sheet.jpg>] [--trace <trace.json>]
                             [--diffs <diffs.json>]
         ffprobe facts + per-frame motion analysis + optional contact sheet.
         "verdict": "OK" or "CHECK: ..." covering frame count (vs trace),
         constant frame rate, suspected jumps (dropped frame), duplicated frames
         during motion, glitch frames (torn screenshot / flash: differs from both
         neighbours) and scroll-trace smoothness. "notable_onsets" is
         informational (reveal animations, sticky sections pinning): extract and
         look at those frames, do not treat them as defects automatically.

   EXIT CODES  0 ok, 1 error, 2 usage, 3 LOW DISK (< 4 GB free on the drive of
   the output folder or %TEMP%; checked before frames/record and every 5 shots)

   STEPS (frames and record; run in order after the page has loaded)
     wait:<ms>                 plain wait
     scroll:<y>                smooth scroll (real time, eased) to document y
     scroll:<css>[@<offset>]   ... to an element's document top (+ offset px)
     jump:<y|css>[@<offset>]   instant scroll (no intermediate positions)
     preload                   scroll the whole page slowly and back (lazy images,
                               scroll reveals) - record does this automatically
     click:<css>               real mouse click (Playwright actionability checks)
     tap:<css>                 touch tap (phone preset)
     jsclick:<css>             element.click() without moving the mouse
     hover:<css>               move the mouse over an element (menus that open on hover)
     key:<Key>                 keyboard key, e.g. key:Escape
     fill:<css>=<text>         ONLY for search fields with generic sample values;
                               refused for fields that look personal
                               (name/email/phone/address/card/password/...)
     select:<css>=<value>      choose a <select> option (e.g. a date/guests filter)
     hide:<css>                display:none !important (closable chat widgets only)
     gone:<css>                wait until the element is gone or hidden (<= 20 s)
     visible:<css>             wait until the element is visible (<= 20 s)
     goto:<url>                navigate (same tab)
     cookies                   run the cookie-banner heuristics again
     park                      park the mouse at --park x,y (default 2,<mid height>)
     eval:<js expression>      escape hatch (inspection / closing overlays only)
   A plan file (JSON) is the comfortable way to batch many shots in one browser:
     { "url": "https://site/", "settle": 2500,
       "shots": [
         { "out": "C:/Teseract-media/x/gallery-01.png", "preset": "desktop",
           "steps": ["gone:#intro", "wait:500"] },
         { "out": ".../gallery-02.png", "steps": ["scroll:#about@-80"] },
         { "out": ".../gallery-09.png", "preset": "phone", "url": "https://site/",
           "reload": true, "steps": [] } ] }
     Per preset one page is kept open across shots (state such as a cart
     persists). A shot navigates when it has "url" that differs from the current
     page, or "reload": true.

   COMMON OPTIONS
     --preset desktop|phone     (default desktop)
     --dpr <n> --viewport WxH    override the preset
     --settle <ms>              settle time before a still (default 2500)
     --scroller auto|native|lenis|element:<css>|js:<fn body using y>
                                how scrolling is driven (default auto: a Lenis
                                instance on window if found, else window.scrollTo)
     --allow-post               allow non-GET requests (needed for add-to-cart or
                                POST search APIs). Requests to checkout/payment/
                                order/contact/newsletter/login/... endpoints and
                                every <form> with personal fields stay blocked.
     --allow-search-submit      let GET search forms without personal fields submit
     --headed                   show the browser (debugging)
     --timeout <s>              hard limit for the whole run (default 900; record
                                default 2400)
     --preload-speed <px/s>     speed of the pre-load scroll pass (default 2500)
     --supersample              record only: render at 2x (desktop) / 3x (phone) and
                                downscale with lanczos (sharper, ~2.3x slower)
     --format png|jpeg          record only: frame transport (png = lossless,
                                default; jpeg = quality 100, ~2x faster)

   HOW THE RECORDING STAYS SMOOTH (also under heavy load)
     The page runs on a virtual clock that only advances when a frame is taken:
     an init script wraps setTimeout/setInterval/requestAnimationFrame/
     performance.now/Date.now (pass-through until recording starts); at start the
     pending timers and rAF callbacks move onto the virtual clock. Per output
     frame: clock += 1000/fps, running animations/transitions are seeked to the
     new time FIRST (so a transition the page interrupts on every scroll event -
     e.g. transform driven by a CSS variable with `transition: transform .18s` -
     keeps chasing its target instead of freezing), scroll to the planned eased
     y, wait for the native scroll event, run due timers, run one rAF generation
     with the virtual timestamp, let the browser lay out, then every CSS
     animation/transition/WAAPI animation is paused and seeked to its virtual
     time and every <video> is seeked; then Page.captureScreenshot. Wall-clock
     speed therefore does not change the result, only the time it takes. House
     rule all the same: ONE browser at a time on this machine (RAM is the limit;
     under paging a screenshot once stalled 17 min and came back torn).
     (CDP Emulation.setVirtualTimePolicy was tested on Edge 155: it virtualises
     JS clocks but CSS animations and rAF keep running on the real compositor
     clock; HeadlessExperimental.beginFrame does not exist in new headless.)

   ENV  CAPTURE_BROWSER = path to msedge.exe/chrome.exe (default: Edge x86 path)
        Run from another folder with NODE_PATH=<this folder>/node_modules
   ============================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  fail('Cannot load "playwright". Run from C:/Users/giris/OneDrive/Desktop/Teseract/_tools or set NODE_PATH=C:/Users/giris/OneDrive/Desktop/Teseract/_tools/node_modules');
}

const MIN_FREE_MB = 4096;                                 // house rule: never work with < 4 GB free on C:
const BROWSER = process.env.CAPTURE_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const PRESETS = {
  still: {
    desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false, out: [2880, 1800] },
    phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, out: [1170, 2532] },
  },
  record: {
    desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1920 / 1440, isMobile: false, hasTouch: false, out: [1920, 1200] },
    phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, out: [780, 1688] },
  },
};

/* --------------------------------------------------------------- utilities */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LIVE = new Set();                                   // browsers to close on any exit path
function fail(msg, code = 1) {
  console.error('capture: ERROR: ' + msg);
  if (!LIVE.size) process.exit(code);
  const all = [...LIVE].map((b) => b.close().catch(() => {}));
  Promise.race([Promise.all(all), sleep(8000)]).then(() => process.exit(code));
}
function log(...a) { console.log('[' + new Date().toISOString().slice(11, 19) + ']', ...a); }

function parseArgs(argv) {
  const o = { _: [], step: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      let k = a.slice(2), v;
      const eq = k.indexOf('=');
      if (eq >= 0) { v = k.slice(eq + 1); k = k.slice(0, eq); }
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) v = argv[++i];
      else v = true;
      if (k === 'step') o.step.push(v); else o[k] = v;
    } else o._.push(a);
  }
  return o;
}

function splitSteps(o) {
  const steps = [];
  if (typeof o.steps === 'string') steps.push(...o.steps.split(/\s+;\s+|\s*;;\s*/).map((s) => s.trim()).filter(Boolean));
  if (Array.isArray(o.steps)) steps.push(...o.steps);
  steps.push(...(o.step || []));
  return steps;
}

function checkDisk(dir, needMB) {
  let freeMB = null;
  try { const st = fs.statfsSync(dir); freeMB = (st.bavail * st.bsize) / 1048576; } catch (e) { return null; }
  // throws (not fail): the caller's catch closes the browser, the top level exits with code 3
  if (freeMB < needMB) throw new Error(`LOW DISK: only ${(freeMB / 1024).toFixed(2)} GB free on the drive of ${dir}; need >= ${(needMB / 1024).toFixed(1)} GB. Stop, clean scratch files, report "stopped: low disk".`);
  return freeMB;
}

function ensureDirFor(file) {
  const d = path.dirname(path.resolve(file));
  try { fs.mkdirSync(d, { recursive: true }); } catch (e) { fail(`cannot create output folder ${d}: ${e.message}`); }
  return d;
}

function pngSize(buf) {
  if (buf[0] === 0x89) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  for (let i = 2; i < buf.length - 9;) {                 // JPEG: find the SOF marker
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return [0, 0];
}

/* ------------------------------------------------------- in-page: guards */
// Runs in every frame before any site script. Blocks form submission (unless a
// GET search form is explicitly allowed) and installs the virtual-time
// controller in pass-through mode (only switched on by `record`).
function pageInit(cfg) {
  // our own site (local preview): skip the intro logo animation, else early frames show its black stage (CAPTURE-NOTES.md)
  try { if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) sessionStorage.setItem('ts-intro', '1'); } catch (e) { /* ignore */ }
  try {
    if (window.__tsrCap) return;
    const PERSONAL = /(^|[^a-z])(name|first|last|full.?name|e-?mail|mail|phone|mobile|tel|whatsapp|address|street|city|zip|postal|post.?code|pin.?code|card|cc-|cvv|cvc|iban|account|password|passwd|otp|dob|birth|passport|aadhaar|pan|ssn|message|comment|company)([^a-z]|$)/i;
    const fieldLooksPersonal = (el) => {
      const t = (el.type || '').toLowerCase();
      if (['email', 'tel', 'password'].includes(t)) return true;
      const s = [el.name, el.id, el.autocomplete, el.placeholder, el.getAttribute && el.getAttribute('aria-label')].filter(Boolean).join(' ');
      return PERSONAL.test(s);
    };
    const formIsSearchOnly = (f) => {
      if (!f || (f.method || 'get').toLowerCase() !== 'get') return false;
      const fields = [...f.querySelectorAll('input,textarea,select')].filter((e) => !['hidden', 'submit', 'button', 'checkbox', 'radio'].includes((e.type || '').toLowerCase()));
      return fields.every((e) => !fieldLooksPersonal(e));
    };
    const allow = (f) => !!cfg.allowSearchSubmit && formIsSearchOnly(f);
    const block = (f, how) => { console.warn('[capture] blocked form submission (' + how + ') ' + (f && (f.action || f.id || f.className) || '')); };
    document.addEventListener('submit', (e) => { if (!allow(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); block(e.target, 'submit event'); } }, true);
    const P = HTMLFormElement.prototype;
    const nSubmit = P.submit, nReq = P.requestSubmit;
    P.submit = function () { if (allow(this)) return nSubmit.call(this); block(this, 'form.submit()'); };
    if (nReq) P.requestSubmit = function (s) { if (allow(this)) return nReq.call(this, s); block(this, 'requestSubmit()'); };
    window.__tsrFieldLooksPersonal = fieldLooksPersonal;
  } catch (e) { /* never break the page */ }

  /* ----------------------------------------------- virtual time controller */
  try {
    const W = window;
    const N = {
      setTimeout: W.setTimeout.bind(W), clearTimeout: W.clearTimeout.bind(W),
      setInterval: W.setInterval.bind(W), clearInterval: W.clearInterval.bind(W),
      raf: W.requestAnimationFrame.bind(W), caf: W.cancelAnimationFrame.bind(W),
      perfNow: performance.now.bind(performance), dateNow: Date.now.bind(Date),
    };
    const cap = {
      N, virtual: false, vNow: 0, dateOffset: 0, nextId: 1000000,
      timers: new Map(), rafs: new Map(), anims: new WeakMap(), media: new WeakMap(),
      scroller: { mode: 'native' }, stats: { timers: 0, rafs: 0, anims: 0, errors: 0 },
    };
    W.__tsrCap = cap;
    const report = (e) => { cap.stats.errors++; try { console.error(e); } catch (_) {} };

    W.setTimeout = function (fn, delay, ...args) {
      if (typeof fn !== 'function') return N.setTimeout(fn, delay, ...args);
      const id = ++cap.nextId;
      const d = Math.max(0, +delay || 0);
      const rec = { id, fn, args, interval: 0, due: (cap.virtual ? cap.vNow : N.perfNow()) + d, nativeId: null };
      cap.timers.set(id, rec);
      if (!cap.virtual) rec.nativeId = N.setTimeout(() => { cap.timers.delete(id); fn.apply(W, args); }, d);
      return id;
    };
    W.setInterval = function (fn, delay, ...args) {
      if (typeof fn !== 'function') return N.setInterval(fn, delay, ...args);
      const id = ++cap.nextId;
      const d = Math.max(4, +delay || 0);
      const rec = { id, fn, args, interval: d, due: (cap.virtual ? cap.vNow : N.perfNow()) + d, nativeId: null };
      cap.timers.set(id, rec);
      if (!cap.virtual) rec.nativeId = N.setInterval(() => { rec.due = N.perfNow() + d; fn.apply(W, args); }, d);
      return id;
    };
    const clear = (id) => {
      const rec = cap.timers.get(id);
      if (!rec) { N.clearTimeout(id); return; }
      if (rec.nativeId != null) { if (rec.interval) N.clearInterval(rec.nativeId); else N.clearTimeout(rec.nativeId); }
      cap.timers.delete(id);
    };
    W.clearTimeout = clear; W.clearInterval = clear;
    W.requestAnimationFrame = function (cb) {
      const id = ++cap.nextId;
      const rec = { cb, nativeId: null };
      cap.rafs.set(id, rec);
      if (!cap.virtual) rec.nativeId = N.raf((ts) => { cap.rafs.delete(id); cb(ts); });
      return id;
    };
    W.cancelAnimationFrame = function (id) {
      const rec = cap.rafs.get(id);
      if (!rec) { N.caf(id); return; }
      if (rec.nativeId != null) N.caf(rec.nativeId);
      cap.rafs.delete(id);
    };
    performance.now = function () { return cap.virtual ? cap.vNow : N.perfNow(); };
    Date.now = function () { return cap.virtual ? cap.dateOffset + cap.vNow : N.dateNow(); };

    /* -- scrolling ------------------------------------------------------ */
    const findLenis = () => {
      const cands = [W.lenis, W.__lenis, W.Lenis && W.Lenis.instance];
      for (const k of Object.keys(W)) { try { const v = W[k]; if (v && typeof v === 'object' && !(v instanceof Node)) cands.push(v); } catch (_) {} }
      return cands.find((v) => v && typeof v.scrollTo === 'function' && typeof v.raf === 'function' && ('animatedScroll' in v || 'targetScroll' in v)) || null;
    };
    cap.setScroller = (mode) => {
      mode = mode || 'auto';
      if (mode === 'auto' || mode === 'lenis') {
        const l = findLenis();
        if (l) { cap.scroller = { mode: 'lenis', lenis: l }; return 'lenis'; }
        if (mode === 'lenis') throw new Error('no Lenis instance found on window');
        cap.scroller = { mode: 'native' };
        const html = document.documentElement;
        if (html.classList.contains('has-scroll-smooth') || document.querySelector('[data-scroll-container]')) return 'native (WARNING: Locomotive smooth mode detected - pass --scroller js:...)';
        if (html.classList.contains('lenis')) return 'native (Lenis present but no instance on window - native scrolling is followed by Lenis)';
        return 'native';
      }
      if (mode === 'native') { cap.scroller = { mode: 'native' }; return 'native'; }
      if (mode.startsWith('element:')) {
        const el = document.querySelector(mode.slice(8));
        if (!el) throw new Error('scroller element not found: ' + mode.slice(8));
        el.style.scrollBehavior = 'auto';
        cap.scroller = { mode: 'element', el }; return mode;
      }
      if (mode.startsWith('js:')) { cap.scroller = { mode: 'js', fn: new Function('y', mode.slice(3)) }; return mode; }
      throw new Error('unknown scroller mode ' + mode);
    };
    cap.scrollTo = (y) => {
      const s = cap.scroller;
      if (s.mode === 'lenis') s.lenis.scrollTo(y, { immediate: true, force: true, lock: false });
      else if (s.mode === 'element') s.el.scrollTop = y;
      else if (s.mode === 'js') s.fn(y);
      else W.scrollTo({ top: y, left: 0, behavior: 'instant' });
    };
    cap.scrollPos = () => {
      const s = cap.scroller;
      if (s.mode === 'element') return s.el.scrollTop;
      if (s.mode === 'lenis') return typeof s.lenis.scroll === 'number' ? s.lenis.scroll : W.scrollY;
      return W.scrollY;
    };
    cap.maxScroll = () => {
      const s = cap.scroller;
      if (s.mode === 'element') return s.el.scrollHeight - s.el.clientHeight;
      if (s.mode === 'lenis' && typeof s.lenis.limit === 'number') return s.lenis.limit;
      return Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0) - W.innerHeight;
    };
    cap.nativeFrame = () => new Promise((r) => N.raf(() => r()));
    cap.nativeIdle = (ms) => new Promise((r) => N.setTimeout(r, ms));
    // real-time eased scroll (stills, preload)
    cap.smoothScrollTo = async (y, ms) => {
      const y0 = cap.scrollPos();
      const t0 = N.perfNow();
      for (;;) {
        await cap.nativeFrame();
        const k = Math.min(1, (N.perfNow() - t0) / ms);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        cap.scrollTo(y0 + (y - y0) * e);
        if (k >= 1) break;
      }
      return cap.scrollPos();
    };

    /* -- virtual time ----------------------------------------------------- */
    cap.virtualize = () => {
      if (cap.virtual) return;
      cap.vNow = N.perfNow();
      cap.dateOffset = N.dateNow() - cap.vNow;
      for (const rec of cap.timers.values()) {
        if (rec.nativeId != null) { if (rec.interval) N.clearInterval(rec.nativeId); else N.clearTimeout(rec.nativeId); rec.nativeId = null; }
      }
      for (const rec of cap.rafs.values()) { if (rec.nativeId != null) { N.caf(rec.nativeId); rec.nativeId = null; } }
      cap.virtual = true;
      cap.syncAnimations(true);
    };
    cap.runTimers = () => {
      let guard = 0;
      for (;;) {
        let next = null;
        for (const rec of cap.timers.values()) if (rec.due <= cap.vNow && (!next || rec.due < next.due || (rec.due === next.due && rec.id < next.id))) next = rec;
        if (!next || ++guard > 5000) break;
        if (next.interval) next.due += next.interval; else cap.timers.delete(next.id);
        cap.stats.timers++;
        try { next.fn.apply(W, next.args); } catch (e) { report(e); }
      }
    };
    cap.flushRaf = () => {
      const batch = [...cap.rafs.entries()];
      cap.rafs.clear();
      for (const [, rec] of batch) { cap.stats.rafs++; try { rec.cb(cap.vNow); } catch (e) { report(e); } }
      return batch.length;
    };
    cap.syncAnimations = (adoptAll) => {
      let n = 0;
      let list = [];
      try { list = document.getAnimations(); } catch (_) { return 0; }
      for (const a of list) {
        try {
          if (a.timeline && a.timeline !== document.timeline) continue; // scroll/view timelines follow scroll
          let rec = cap.anims.get(a);
          if (!rec) {
            if (a.playState !== 'running') continue;                     // paused by the page, finished, idle
            const rate = a.playbackRate || 1;
            const ct = a.currentTime == null ? 0 : +a.currentTime;
            // existing at virtualize(): keep its progress; created since: starts now
            rec = { start: adoptAll ? cap.vNow - ct / rate : cap.vNow, rate, done: false };
            cap.anims.set(a, rec);
            a.pause();
          }
          if (rec.done) continue;
          if (a.playState !== 'paused') { rec.done = true; continue; }   // page took control back
          const t = (cap.vNow - rec.start) * rec.rate;
          const end = a.effect ? a.effect.getComputedTiming().endTime : Infinity;
          if (Number.isFinite(end) && t >= end) { a.currentTime = end; a.finish(); rec.done = true; }
          else a.currentTime = Math.max(0, t);
          n++;
        } catch (e) { /* animation vanished mid-way */ }
      }
      cap.stats.anims = n;
      return n;
    };
    cap.syncMedia = async () => {
      const vids = [...document.querySelectorAll('video')];
      const waits = [];
      for (const v of vids) {
        let rec = cap.media.get(v);
        if (!rec) {
          if (v.paused || v.readyState < 2) continue;
          rec = { start: cap.vNow - v.currentTime * 1000 };
          cap.media.set(v, rec);
          v.pause();
        }
        let t = (cap.vNow - rec.start) / 1000;
        if (v.loop && v.duration > 0) t = t % v.duration;
        else if (v.duration > 0) t = Math.min(t, v.duration);
        if (Math.abs(v.currentTime - t) > 0.001) {
          waits.push(new Promise((r) => { const to = N.setTimeout(r, 400); v.addEventListener('seeked', () => { N.clearTimeout(to); r(); }, { once: true }); }));
          v.currentTime = t;
        }
      }
      if (waits.length) await Promise.all(waits);
      return vids.length;
    };
    // one output frame: advance the clock, scroll, run the page, freeze animations
    cap.step = async (y, dt) => {
      cap.vNow += dt;
      // Advance running animations/transitions to the new time BEFORE the page reacts
      // to the scroll. Sites that set a CSS variable per scroll event on an element with
      // `transition: transform .18s` interrupt the running transition every frame; the
      // new one starts from the current value, so the old one must have progressed
      // first - otherwise it stays frozen at its start value until scrolling stops and
      // then jumps (seen on geetha-seven.vercel.app, necklace section).
      cap.syncAnimations(false);
      const before = cap.scrollPos();
      if (y != null) cap.scrollTo(y);
      const moved = Math.abs(cap.scrollPos() - before) > 0.01;
      if (moved) {
        // native scroll event + IntersectionObserver delivery happen on the next real frame
        await new Promise((r) => {
          const to = N.setTimeout(r, 150);
          W.addEventListener('scroll', () => { N.clearTimeout(to); r(); }, { once: true, capture: true });
          if (cap.scroller.mode === 'element') cap.scroller.el.addEventListener('scroll', () => { N.clearTimeout(to); r(); }, { once: true });
        });
      }
      cap.runTimers();
      cap.flushRaf();
      await cap.nativeFrame();             // style/layout/IO for what the rAF callbacks changed
      await cap.nativeIdle(0);
      cap.runTimers();                     // 0 ms timers queued by rAF/IO callbacks
      cap.syncAnimations(false);
      await cap.syncMedia();
      return { y: cap.scrollPos(), timers: cap.timers.size, anims: cap.stats.anims };
    };
  } catch (e) { /* never break the page */ }
}

/* ------------------------------------------------------ browser / context */
async function launch(opts) {
  if (!fs.existsSync(BROWSER)) fail(`browser not found at ${BROWSER} (set CAPTURE_BROWSER)`);
  try {
    const b = await chromium.launch({ executablePath: BROWSER, headless: !opts.headed, args: ['--hide-scrollbars', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'] });
    LIVE.add(b);
    b.on('disconnected', () => LIVE.delete(b));
    return b;
  } catch (e) { fail('could not start the browser: ' + e.message.split('\n')[0]); }
}

// embedded maps need their own POST RPCs to render; harmless, no personal data
const SAFE_POST = /^https:\/\/(maps\.googleapis\.com|www\.google\.com\/maps|maps\.google\.com)\//;
const SENSITIVE_URL = /checkout|payment|\bpay\b|\/pay|order|purchase|subscribe|newsletter|contact|enquir|inquir|lead|login|log-in|signin|sign-in|signup|sign-up|register|account|auth|password|apply|application|booking\/(confirm|create|submit)|reserve|form/i;

async function makeContext(browser, kind, presetName, opts) {
  const p = PRESETS[kind][presetName];
  if (!p) fail(`unknown preset "${presetName}" (desktop|phone)`);
  const viewport = { ...p.viewport };
  if (opts.viewport) { const [w, h] = String(opts.viewport).split('x').map(Number); if (!(w > 0 && h > 0)) fail('--viewport must be WxH'); viewport.width = w; viewport.height = h; }
  let dpr = opts.dpr ? +opts.dpr : p.deviceScaleFactor;
  if (kind === 'record' && opts.supersample) dpr = presetName === 'desktop' ? 2 : 3;   // downscaled by ffmpeg
  const ver = browser.version().split('.')[0];
  const ctx = await browser.newContext({
    viewport, deviceScaleFactor: dpr, isMobile: p.isMobile, hasTouch: p.hasTouch,
    userAgent: p.isMobile ? `Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ver}.0.0.0 Mobile Safari/537.36` : undefined,
    locale: opts.locale || 'en-US', reducedMotion: 'no-preference', colorScheme: opts.colorScheme || 'light',
    acceptDownloads: false, serviceWorkers: 'block', bypassCSP: false,
  });
  await ctx.addInitScript(pageInit, { allowSearchSubmit: !!opts['allow-search-submit'] });
  // network guard: non-GET requests are aborted unless --allow-post; sensitive endpoints always
  const blocked = [];
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const m = req.method();
    if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return route.fallback();
    if (SAFE_POST.test(req.url()) && !SENSITIVE_URL.test(req.url().replace(/^https?:\/\/[^/]+/, ''))) return route.fallback();
    if (!opts['allow-post'] || SENSITIVE_URL.test(req.url())) {
      blocked.push(`${m} ${req.url().slice(0, 140)}`);
      return route.abort('blockedbyclient');
    }
    return route.fallback();
  });
  ctx.on('page', (pg) => { pg.on('dialog', (d) => d.dismiss().catch(() => {})); });
  return { ctx, preset: p, dpr, viewport, blocked };
}

function attachMonitors(page, store) {
  const inflight = new Set();
  page.on('request', (r) => inflight.add(r));
  page.on('requestfinished', (r) => inflight.delete(r));
  page.on('requestfailed', (r) => { inflight.delete(r); const f = r.failure(); if (!(f && /BLOCKED_BY_CLIENT|ERR_ABORTED/i.test(f.errorText))) store.errors.push(`requestfailed: ${r.url().slice(0, 160)} ${f && f.errorText}`); });
  page.on('response', (r) => { if (r.status() >= 400) store.errors.push(`HTTP ${r.status()}: ${r.url().slice(0, 160)}`); });
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_BLOCKED_BY_CLIENT/.test(m.text())) store.errors.push(`console.error: ${m.text().slice(0, 200)}`); if (/\[capture\]/.test(m.text())) store.notes.push(m.text()); });
  page.on('pageerror', (e) => store.errors.push(`pageerror: ${String(e.message).slice(0, 200)}`));
  page.on('popup', (pp) => { store.notes.push('popup closed: ' + pp.url()); pp.close().catch(() => {}); });
  page.__inflight = inflight;
}

async function networkQuiet(page, quietMs = 700, timeout = 15000) {
  const t0 = Date.now();
  let quietSince = Date.now();
  while (Date.now() - t0 < timeout) {
    const busy = [...page.__inflight].filter((r) => !['websocket', 'eventsource'].includes(r.resourceType()));
    if (busy.length) quietSince = Date.now();
    else if (Date.now() - quietSince >= quietMs) return true;
    await sleep(100);
  }
  return false;
}

async function gotoUrl(page, url, store) {
  let resp;
  try { resp = await page.goto(url, { waitUntil: 'load', timeout: 60000 }); }
  catch (e) { throw new Error(`could not open ${url}: ${e.message.split('\n')[0]}`); }
  if (resp && resp.status() >= 400) store.errors.push(`page HTTP ${resp.status()} for ${url}`);
  await networkQuiet(page, 800, 20000);
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  store.visited.add(page.url());
}

/* -------------------------------------------------- cookie banner handling */
async function dismissCookies(page, store) {
  const res = await page.evaluate(() => {
    const out = [];
    const vis = (el) => { if (!el || !el.getBoundingClientRect) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
    const all = (root, sel) => { const acc = [...root.querySelectorAll(sel)]; root.querySelectorAll('*').forEach((e) => { if (e.shadowRoot) acc.push(...all(e.shadowRoot, sel)); }); return acc; };
    const KNOWN_REJECT = ['#onetrust-reject-all-handler', '#CybotCookiebotDialogBodyButtonDecline', '.cky-btn-reject', '#cookiescript_reject', '.cmplz-deny', '[data-cookiefirst-action="reject"]', '#didomi-notice-disagree-button', '.fc-cta-do-not-consent', '[data-testid="uc-deny-all-button"]', '.iubenda-cs-reject-btn', '#hs-eu-decline-button', '.cookie-notice-reject', '#wt-cli-reject-btn', '.moove-gdpr-infobar-reject-btn', '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll'];
    for (const s of KNOWN_REJECT) { for (const b of all(document, s)) if (vis(b)) { b.click(); out.push('clicked ' + s); } }
    const REJECT = /^(reject|decline|deny|refuse)( all)?( cookies)?$|necessary only|only necessary|essential only|only essential|strictly necessary only|reject non-essential|use necessary cookies only|continue without accepting|do not consent|don't allow|disagree/i;
    const CLOSE = /^(close|dismiss|×|✕|✖|x|no thanks|not now)$/i;
    const ACCEPT = /accept|agree|allow all|got it|^ok$|okay|i understand|consent$/i;
    const banners = all(document, 'body *').filter((el) => {
      const cs = getComputedStyle(el);
      if (!(cs.position === 'fixed' || cs.position === 'sticky' || el.getAttribute('role') === 'dialog' || el.getAttribute('aria-modal') === 'true')) return false;
      if (!vis(el)) return false;
      const t = (el.innerText || '').slice(0, 2000);
      return /cookie|consent|gdpr|tracking technolog|your privacy/i.test(t) && t.length < 3000;
    });
    for (const b of banners) {
      const btns = all(b, 'button, a, [role=button], input[type=button]').filter(vis);
      const label = (e) => ((e.innerText || e.value || '') + ' ' + (e.getAttribute('aria-label') || '')).trim().replace(/\s+/g, ' ');
      let target = btns.find((e) => REJECT.test(label(e)) && !/^accept/i.test(label(e)));
      if (!target) target = btns.find((e) => CLOSE.test(label(e)) || /close|dismiss/i.test(e.getAttribute('aria-label') || ''));
      if (target && !ACCEPT.test(label(target).replace(/do not consent|don't allow/i, ''))) { target.click(); out.push('banner: clicked "' + label(target).slice(0, 40) + '"'); }
      else { b.setAttribute('data-tsr-hidden', '1'); b.style.setProperty('display', 'none', 'important'); out.push('banner: hidden (no reject/close option) "' + (b.innerText || '').trim().slice(0, 60).replace(/\s+/g, ' ') + '"'); }
    }
    return out;
  }).catch((e) => ['cookie check failed: ' + e.message]);
  if (res.length) { store.notes.push(...res); log('cookies:', res.join(' | ')); await sleep(600); }
  return res;
}

/* ------------------------------------------------------------------ steps */
function parseTarget(arg) {
  const m = /^(.*?)(?:@(-?\d+(?:\.\d+)?))?$/.exec(arg.trim());
  const base = m[1].trim(), off = m[2] ? +m[2] : 0;
  if (/^-?\d+(\.\d+)?$/.test(base)) return { y: +base + off };
  return { sel: base, off };
}

async function resolveY(page, arg) {
  const t = typeof arg === 'number' ? { y: arg } : parseTarget(String(arg));
  if (t.y != null) return t.y;
  const y = await page.evaluate(({ sel, off }) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return el.getBoundingClientRect().top + window.__tsrCap.scrollPos() + off;
  }, t);
  if (y == null) throw new Error(`selector not found: ${t.sel}`);
  return y;
}

async function parkMouse(page, opts) {
  const vp = page.viewportSize();
  const [x, y] = opts.park ? String(opts.park).split(',').map(Number) : [2, Math.round(vp.height / 2)];
  await page.mouse.move(x, y).catch(() => {});
}

async function preload(page, store, opts = {}) {
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; })).catch(() => {});
  const vh = page.viewportSize().height;
  const stepPx = Math.round(vh * 0.75);
  const stepMs = Math.max(80, Math.round((stepPx / +(opts['preload-speed'] || 2500)) * 1000));
  let y = 0, guard = 0;
  for (;;) {
    const max = await page.evaluate(() => window.__tsrCap.maxScroll());
    if (y >= max || ++guard > 600) break;
    y = Math.min(max, y + stepPx);
    await page.evaluate(([yy, ms]) => window.__tsrCap.smoothScrollTo(yy, ms), [y, stepMs]);
    await sleep(60);
  }
  await networkQuiet(page, 800, 30000);
  await sleep(600);
  store.notes.push(`preload: scrolled to ${Math.round(y)}`);
}

async function runSteps(page, steps, store, opts) {
  for (const raw of steps) {
    const s = String(raw);
    const i = s.indexOf(':');
    const cmd = (i < 0 ? s : s.slice(0, i)).trim();
    const arg = i < 0 ? '' : s.slice(i + 1).trim();
    log('step', s.length > 100 ? s.slice(0, 100) + '...' : s);
    try {
      switch (cmd) {
        case 'wait': await sleep(+arg || 0); break;
        case 'scroll': {
          const y = await resolveY(page, arg);
          const cur = await page.evaluate(() => window.__tsrCap.scrollPos());
          const ms = Math.min(4000, Math.max(400, Math.abs(y - cur) / 2.5));
          await page.evaluate(([yy, m]) => window.__tsrCap.smoothScrollTo(yy, m), [y, ms]);
          break;
        }
        case 'jump': { const y = await resolveY(page, arg); await page.evaluate((yy) => window.__tsrCap.scrollTo(yy), y); break; }
        case 'preload': await preload(page, store, opts); await page.evaluate(() => window.__tsrCap.scrollTo(0)); await sleep(800); break;
        case 'click': await page.click(arg, { timeout: 15000 }); await parkMouse(page, opts); break;
        case 'tap': await page.tap(arg, { timeout: 15000 }); break;
        case 'jsclick': { const ok = await page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return false; el.click(); return true; }, arg); if (!ok) throw new Error('selector not found: ' + arg); break; }
        case 'hover': await page.hover(arg, { timeout: 15000 }); break;
        case 'key': await page.keyboard.press(arg); break;
        case 'fill': {
          const eq = arg.indexOf('=');
          if (eq < 0) throw new Error('fill needs <css>=<text>');
          const sel = arg.slice(0, eq), val = arg.slice(eq + 1);
          const personal = await page.evaluate((s2) => { const el = document.querySelector(s2); if (!el) return 'missing'; return window.__tsrFieldLooksPersonal(el) ? 'personal' : 'ok'; }, sel);
          if (personal === 'missing') throw new Error('selector not found: ' + sel);
          if (personal === 'personal') throw new Error(`refused: field ${sel} looks like a personal-data field (only generic search values are allowed)`);
          if (/@|\d{7,}/.test(val)) throw new Error('refused: value looks like an email/phone number');
          await page.fill(sel, val, { timeout: 15000 });
          break;
        }
        case 'select': { const eq = arg.indexOf('='); await page.selectOption(arg.slice(0, eq), arg.slice(eq + 1), { timeout: 15000 }); break; }
        case 'hide': await page.addStyleTag({ content: `${arg}{display:none!important}` }); store.notes.push('hidden: ' + arg); break;
        case 'gone': await page.waitForSelector(arg, { state: 'hidden', timeout: 20000 }); break;
        case 'visible': await page.waitForSelector(arg, { state: 'visible', timeout: 20000 }); break;
        case 'goto': await gotoUrl(page, arg, store); await dismissCookies(page, store); break;
        case 'cookies': await dismissCookies(page, store); break;
        case 'park': await parkMouse(page, opts); break;
        case 'eval': store.notes.push('eval -> ' + JSON.stringify(await page.evaluate(arg)).slice(0, 200)); break;
        default: throw new Error(`unknown step "${cmd}"`);
      }
    } catch (e) {
      throw new Error(`step "${s}" failed: ${e.message.split('\n')[0]}`);
    }
  }
}

/* ------------------------------------------------------- readiness checks */
async function inViewImagesPending(page) {
  return page.evaluate(async () => {
    const vh = innerHeight, vw = innerWidth, bad = [];
    // visible part of an element after clipping by overflow:hidden/auto ancestors (carousels, rails)
    const clipped = (el) => {
      let r = el.getBoundingClientRect();
      let L = Math.max(0, r.left), T = Math.max(0, r.top), R = Math.min(vw, r.right), B = Math.min(vh, r.bottom);
      for (let p = el.parentElement; p && p !== document.body && R - L > 1 && B - T > 1; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const q = p.getBoundingClientRect();
          L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom);
        }
      }
      return R - L <= 1 || B - T <= 1;
    };
    const imgs = [...document.images].filter((img) => {
      const r = img.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return false;
      const cs = getComputedStyle(img);
      if (cs.visibility === 'hidden' || cs.display === 'none') return false;
      return !clipped(img);
    });
    for (const img of imgs) {
      if (!img.complete || img.naturalWidth === 0) {
        if (img.loading === 'lazy') img.loading = 'eager';   // visible but the lazy loader has not fired
        bad.push((img.currentSrc || img.src || '').slice(0, 140));
      } else { try { await img.decode(); } catch (_) {} }
    }
    return bad;
  });
}

async function settleForStill(page, store, opts, settleMs, cookies = true, label = '') {
  const tag = label ? label + ': ' : '';
  if (cookies) await dismissCookies(page, store);
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  const t0 = Date.now();
  await networkQuiet(page, 700, 15000);
  let pending = [];
  for (let k = 0; k < 40; k++) { pending = await inViewImagesPending(page); if (!pending.length) break; await sleep(500); }
  if (pending.length) store.warnings.push(`${tag}in-view images not loaded after 20 s: ${pending.join(', ')}`);
  const left = settleMs - (Date.now() - t0);
  if (left > 0) await sleep(left);
  const fontsOk = await page.evaluate(() => document.fonts ? document.fonts.status : 'n/a').catch(() => '?');
  if (fontsOk !== 'loaded' && fontsOk !== 'n/a') store.warnings.push(tag + 'document.fonts.status = ' + fontsOk);
  if (cookies) await dismissCookies(page, store);
}

/* ---------------------------------------------------------------- inspect */
async function cmdInspect(url, opts) {
  if (!url) fail('inspect needs <url>', 2);
  const browser = await launch(opts);
  try {
  const store = { errors: [], notes: [], warnings: [], visited: new Set() };
  const { ctx } = await makeContext(browser, 'still', opts.preset || 'desktop', { ...opts });
  const page = await ctx.newPage();
  attachMonitors(page, store);
  await gotoUrl(page, url, store);
  await sleep(2500);
  const scroller = await page.evaluate((m) => window.__tsrCap.setScroller(m), opts.scroller || 'auto');
  const cookies = await dismissCookies(page, store);
  const info = await page.evaluate(() => {
    const docTop = (el) => Math.round(el.getBoundingClientRect().top + scrollY);
    const txt = (el, n) => (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, n);
    const links = {};
    document.querySelectorAll('a[href]').forEach((a) => { if (!links[a.href]) links[a.href] = txt(a, 50) || a.getAttribute('aria-label') || ''; });
    return {
      title: document.title, url: location.href,
      h1: [...document.querySelectorAll('h1')].map((h) => txt(h, 120)),
      scrollHeight: document.documentElement.scrollHeight, viewport: [innerWidth, innerHeight],
      libs: { lenisClass: document.documentElement.classList.contains('lenis'), locomotive: !!document.querySelector('[data-scroll-container]'), gsap: !!window.gsap, scrollTrigger: !!window.ScrollTrigger, swiper: !!window.Swiper, next: !!window.__NEXT_DATA__ || !!document.querySelector('#__next'), nuxt: !!window.__NUXT__ },
      sections: [...document.querySelectorAll('section, main > *, footer, [id]')].filter((e) => e.getBoundingClientRect().height > 200).slice(0, 80).map((e) => ({ sel: e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.classList[0] ? '.' + e.classList[0] : ''), top: docTop(e), h: Math.round(e.getBoundingClientRect().height), text: txt(e, 80) })),
      fixed: [...document.querySelectorAll('body *')].filter((e) => { const p = getComputedStyle(e).position; return (p === 'fixed' || p === 'sticky') && e.offsetWidth > 0; }).slice(0, 30).map((e) => ({ tag: e.tagName.toLowerCase(), id: e.id, cls: String(e.className).slice(0, 50), pos: getComputedStyle(e).position, text: txt(e, 50) })),
      forms: [...document.forms].map((f) => ({ action: f.action, method: f.method, fields: [...f.elements].map((x) => x.name || x.type).slice(0, 12) })),
      images: document.images.length, lazyImages: document.querySelectorAll('img[loading=lazy]').length, videos: document.querySelectorAll('video').length, iframes: [...document.querySelectorAll('iframe')].map((f) => f.src.slice(0, 100)),
      links,
      buttons: [...new Set([...document.querySelectorAll('button, [role=button], [onclick]')].filter((b) => b.offsetWidth > 0 || b.getClientRects().length).map((b) => (txt(b, 40) || b.getAttribute('aria-label') || b.className && String(b.className).slice(0, 40) || b.tagName).trim()).filter(Boolean))].slice(0, 60),
      dialogs: [...document.querySelectorAll('dialog, [role=dialog], [aria-modal=true]')].map((d) => (d.id ? '#' + d.id : d.tagName.toLowerCase() + (d.classList[0] ? '.' + d.classList[0] : '')) + ' ' + txt(d, 60)).slice(0, 20),
    };
  });
  if (opts.scan) {
    // whole-page pass: lazy images, broken images, placeholder text, late console errors
    await preload(page, store, opts);
    info.scan = await page.evaluate(() => {
      const body = document.body ? document.body.innerText : '';
      const flags = [];
      for (const re of [/lorem ipsum/i, /dolor sit amet/i, /\bplaceholder\b/i, /\bTODO\b/, /example\.com/i, /your (company|brand|name) here/i, /coming soon/i, /\[object Object\]/, /\bundefined\b/, /\bNaN\b/]) {
        const m = re.exec(body); if (m) flags.push(body.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\s+/g, ' '));
      }
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src)).map((i) => (i.currentSrc || i.src).slice(0, 160));
      const notLoaded = [...document.images].filter((i) => !i.complete).map((i) => (i.currentSrc || i.src).slice(0, 160));
      const wide = document.documentElement.scrollWidth > innerWidth + 1 ? `horizontal overflow: scrollWidth ${document.documentElement.scrollWidth} > ${innerWidth}` : null;
      return { scrollHeight: document.documentElement.scrollHeight, textFlags: flags, brokenImages: broken, imagesNotLoaded: notLoaded.slice(0, 30), horizontalOverflow: wide };
    });
  }
  info.scroller = scroller; info.cookieActions = cookies; info.errors = [...new Set(store.errors)]; info.notes = store.notes;
  const json = JSON.stringify(info, null, 1);
  if (opts.json) { ensureDirFor(opts.json); fs.writeFileSync(opts.json, json); log('wrote', opts.json); } else console.log(json);
  } finally { await browser.close().catch(() => {}); }
}

/* ----------------------------------------------------------------- frames */
async function cmdFrames(url, opts) {
  let plan;
  if (opts.plan) {
    try { plan = JSON.parse(fs.readFileSync(opts.plan, 'utf8')); } catch (e) { fail(`cannot read plan ${opts.plan}: ${e.message}`); }
    if (!Array.isArray(plan.shots) || !plan.shots.length) fail('plan needs a non-empty "shots" array');
  } else {
    if (!url || !opts.out) fail('frames needs <url> and --out <file.png> (or --plan plan.json)', 2);
    plan = { url, shots: [{ out: opts.out, preset: opts.preset || 'desktop', steps: splitSteps(opts) }] };
  }
  const settleDefault = +(opts.settle || plan.settle || 2500);
  for (const s of plan.shots) { if (!s.out) fail('every shot needs "out"'); ensureDirFor(s.out); }
  checkDisk(path.dirname(path.resolve(plan.shots[0].out)), MIN_FREE_MB);
  const browser = await launch(opts);
  const store = { errors: [], notes: [], warnings: [], visited: new Set() };
  const pages = {};
  const results = [];
  const tAll = Date.now();
  try {
    for (const [idx, shot] of plan.shots.entries()) {
      if (idx && idx % 5 === 0) checkDisk(path.dirname(path.resolve(shot.out)), MIN_FREE_MB);
      const presetName = shot.preset || opts.preset || 'desktop';
      const t0 = Date.now();
      if (!pages[presetName]) {
        const c = await makeContext(browser, 'still', presetName, { ...opts, ...(plan.options || {}) });
        const page = await c.ctx.newPage();
        attachMonitors(page, store);
        pages[presetName] = { ...c, page, loaded: false };
        store.blockedRef = c.blocked;
      }
      const P = pages[presetName];
      const page = P.page;
      const target = shot.url || plan.url || url;
      if (!P.loaded || shot.reload || (shot.url && page.url() !== shot.url)) {
        log(`[${idx + 1}/${plan.shots.length}] open ${target} (${presetName})`);
        await gotoUrl(page, target, store);
        if (shot.cookies !== false && plan.cookies !== false) await dismissCookies(page, store);
        await page.evaluate((m) => window.__tsrCap.setScroller(m), shot.scroller || plan.scroller || opts.scroller || 'auto');
        P.loaded = true;
      }
      await runSteps(page, shot.steps || [], store, opts);
      // no hover artefacts: park the mouse unless this shot deliberately hovers something
      if (!(shot.steps || []).some((x) => /^\s*hover:/.test(String(x)))) await parkMouse(page, opts);
      // "cookies": false keeps dialogs open that mention cookies (privacy-policy modals)
      const cookieCheck = shot.cookies !== false && plan.cookies !== false;
      await settleForStill(page, store, opts, +(shot.settle || settleDefault), cookieCheck, path.basename(shot.out));
      const buf = await page.screenshot({ type: 'png', animations: 'allow', caret: 'hide', scale: 'device', timeout: 60000 });
      const [w, h] = pngSize(buf);
      fs.writeFileSync(shot.out, buf);
      const exp = P.preset.out;
      const okSize = !opts.dpr && !opts.viewport ? (w === exp[0] && h === exp[1]) : true;
      if (!okSize) store.warnings.push(`${shot.out}: size ${w}x${h}, expected ${exp[0]}x${exp[1]}`);
      const sy = await page.evaluate(() => Math.round(window.__tsrCap.scrollPos()));
      results.push({ file: shot.out, width: w, height: h, url: page.url(), scrollY: sy, ms: Date.now() - t0 });
      log(`saved ${shot.out} ${w}x${h} at y=${sy} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    }
  } catch (e) {
    await browser.close().catch(() => {});
    throw new Error(e.message);
  }
  await browser.close();
  const blocked = Object.values(pages).flatMap((p) => p.blocked);
  const summary = { shots: results, seconds: +((Date.now() - tAll) / 1000).toFixed(1), visited: [...store.visited], warnings: store.warnings, notes: store.notes, errors: [...new Set(store.errors)].slice(0, 60), blockedRequests: blocked.slice(0, 30) };
  if (opts.summary) fs.writeFileSync(opts.summary, JSON.stringify(summary, null, 1));
  console.log(JSON.stringify({ ...summary, notes: summary.notes.slice(0, 20) }, null, 1));
}

/* ----------------------------------------------------------------- record */
function scrollPlan(o) {
  // trapezoid velocity profile with sinusoidal ramps: hold, ease-in, constant, ease-out, hold
  const { y0, y1, total, holdStart, holdEnd, fps } = o;
  const S = total - holdStart - holdEnd;
  if (S <= 0.2) throw new Error('duration must be longer than hold-start + hold-end');
  const r = Math.min(o.ramp, S / 2);
  const D = y1 - y0;
  const v = D / (S - r);
  const disp = (tau) => v * (tau / 2 - (r / (2 * Math.PI)) * Math.sin((Math.PI * tau) / r));
  const pos = (t) => {
    const tau = t - holdStart;
    if (tau <= 0) return y0;
    if (tau >= S) return y1;
    if (tau < r) return y0 + disp(tau);
    if (tau <= S - r) return y0 + (v * r) / 2 + v * (tau - r);
    return y1 - disp(S - tau);
  };
  const n = Math.round(total * fps);
  const ys = [];
  for (let i = 0; i < n; i++) ys.push(pos(i / fps));
  return { ys, peakSpeed: Math.abs(v), n };
}

async function cmdRecord(url, opts) {
  if (!url || !opts.out) fail('record needs <url> and --out <file.mp4>', 2);
  const presetName = opts.preset || 'desktop';
  const fps = +(opts.fps || 30);
  const total = +(opts.duration || (presetName === 'phone' ? 8 : 14));
  const holdStart = +(opts['hold-start'] ?? 1.5);
  const holdEnd = +(opts['hold-end'] ?? 1);
  const ramp = +(opts.ramp ?? 1.2);
  const outDir = ensureDirFor(opts.out);
  checkDisk(outDir, MIN_FREE_MB);
  checkDisk(os.tmpdir(), MIN_FREE_MB);
  const ff = spawnSync('ffmpeg', ['-hide_banner', '-version'], { encoding: 'utf8' });
  if (ff.error) fail('ffmpeg not found on PATH');

  const browser = await launch(opts);
  const store = { errors: [], notes: [], warnings: [], visited: new Set() };
  let ffmpeg;
  const killAll = async () => { try { if (ffmpeg) ffmpeg.kill('SIGKILL'); } catch (_) {} await browser.close().catch(() => {}); };
  try {
    const { ctx, preset, dpr, viewport, blocked } = await makeContext(browser, 'record', presetName, opts);
    const page = await ctx.newPage();
    attachMonitors(page, store);
    const cdp = await ctx.newCDPSession(page);
    // CDP sessions keep their own emulation: without this, Page.captureScreenshot
    // on this session returns 1x pixels (1440x900) although the page renders at DPR.
    const metrics = { width: viewport.width, height: viewport.height, deviceScaleFactor: dpr, mobile: !!preset.isMobile };
    if (preset.isMobile) metrics.screenOrientation = { angle: 0, type: 'portraitPrimary' };
    log(`open ${url} (${presetName} ${viewport.width}x${viewport.height} @${dpr.toFixed(4)})`);
    await gotoUrl(page, url, store);
    await dismissCookies(page, store);
    await runSteps(page, splitSteps(opts), store, opts);
    const scrollerMode = await page.evaluate((m) => window.__tsrCap.setScroller(m), opts.scroller || 'auto');
    log('scroller:', scrollerMode);
    const envBefore = await page.evaluate(() => [devicePixelRatio, innerWidth, innerHeight].join());
    await cdp.send('Emulation.setDeviceMetricsOverride', metrics);
    await sleep(300);
    const envAfter = await page.evaluate(() => [devicePixelRatio, innerWidth, innerHeight].join());
    if (envBefore !== envAfter) store.warnings.push(`viewport changed by capture session: ${envBefore} -> ${envAfter}`);

    // 1) pre-load: whole page slowly, network idle, back to the start, settle
    const tPre = Date.now();
    await preload(page, store, opts);
    const y0 = opts.from != null ? await resolveY(page, opts.from) : 0;
    await page.evaluate((y) => window.__tsrCap.scrollTo(y), Math.max(0, y0 - 1200));
    await sleep(300);
    await page.evaluate((y) => window.__tsrCap.smoothScrollTo(y, 600), y0);
    await networkQuiet(page, 800, 20000);
    await sleep(+(opts.settle || 3000));
    await dismissCookies(page, store);
    log(`preloaded in ${((Date.now() - tPre) / 1000).toFixed(1)} s`);

    let y1;
    if (opts.to != null) y1 = await resolveY(page, opts.to) + +(opts['to-offset'] || 0);
    else y1 = await page.evaluate(() => window.__tsrCap.maxScroll());
    const maxS = await page.evaluate(() => window.__tsrCap.maxScroll());
    if (y1 > maxS) { store.warnings.push(`end y ${Math.round(y1)} clamped to max scroll ${Math.round(maxS)}`); y1 = maxS; }
    const jpeg = opts.format === 'jpeg';
    const plan = scrollPlan({ y0, y1, total, holdStart, holdEnd, ramp, fps });
    log(`plan: ${plan.n} frames, y ${Math.round(y0)} -> ${Math.round(y1)}, peak ${Math.round(plan.peakSpeed)} px/s (${(plan.peakSpeed / fps).toFixed(1)} px/frame)`);

    // 2) ffmpeg
    const [ow, oh] = preset.out;
    const sampleDir = opts.samples ? path.resolve(opts.samples) : null;
    if (sampleDir) fs.mkdirSync(sampleDir, { recursive: true });
    const sampleEvery = +(opts['sample-every'] || 30);

    // 3) virtual time on
    await page.evaluate(() => window.__tsrCap.virtualize());
    const trace = [];
    const tRec = Date.now();
    let firstSize = null;
    const ffErr = [];
    for (let i = 0; i < plan.n; i++) {
      const yPlan = Math.round(plan.ys[i]);                           // Chrome keeps integer CSS px scroll offsets
      const r = await page.evaluate(([y, dt]) => window.__tsrCap.step(y, dt), [yPlan, i === 0 ? 0 : 1000 / fps]);
      const t1 = Date.now();
      const grab = () => cdp.send('Page.captureScreenshot', jpeg ? { format: 'jpeg', quality: 100, optimizeForSpeed: true } : { format: 'png', optimizeForSpeed: true, fromSurface: true, captureBeyondViewport: false });
      let shot = await grab();
      // A screenshot that stalls (Windows paging under memory pressure) can come back
      // as a garbled composite (seen: 17 min stall -> torn frame). The virtual clock is
      // frozen, so simply take the same frame again.
      const tookMs = Date.now() - t1;
      const recent = trace.slice(-30).map((f) => f.shotMs).sort((a, b) => a - b);
      const typical = recent.length ? recent[Math.floor(recent.length / 2)] : 1000;
      if (tookMs > Math.max(8000, 8 * typical)) {
        store.warnings.push(`frame ${i}: screenshot took ${tookMs} ms (typical ${typical}) - retaken`);
        log(`frame ${i}: slow screenshot (${tookMs} ms) - retaking`);
        await page.evaluate(() => window.__tsrCap.nativeFrame());
        shot = await grab();
      }
      const buf = Buffer.from(shot.data, 'base64');
      if (!firstSize) {
        firstSize = pngSize(buf);
        const vf = [];
        if (firstSize[0] !== ow || firstSize[1] !== oh) {
          if (!opts.supersample) store.warnings.push(`captured ${firstSize.join('x')}, scaled to ${ow}x${oh}`);
          vf.push(`scale=${ow}:${oh}:flags=lanczos`);
        }
        // setparams: ffmpeg 8 takes the colour tags from the frames, so -color_* alone leaves primaries/trc "unknown"
        vf.push('scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int', 'format=yuv420p', 'setparams=range=tv:color_primaries=bt709:color_trc=bt709:colorspace=bt709');
        const args = ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', jpeg ? 'mjpeg' : 'png', '-i', '-',
          '-vf', vf.join(','), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
          '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
          '-r', String(fps), '-movflags', '+faststart', '-an', path.resolve(opts.out)];
        ffmpeg = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
        ffmpeg.stderr.on('data', (d) => ffErr.push(String(d)));
        ffmpeg.on('error', (e) => ffErr.push(e.message));
      }
      if (ffmpeg.exitCode != null) throw new Error('ffmpeg exited early: ' + ffErr.join('').slice(0, 800));
      if (!ffmpeg.stdin.write(buf)) {
        await new Promise((res) => {
          const done = () => { ffmpeg.stdin.off('drain', done); ffmpeg.off('close', done); res(); };
          ffmpeg.stdin.on('drain', done); ffmpeg.on('close', done);
        });
      }
      if (sampleDir && (i % sampleEvery === 0 || i === plan.n - 1)) fs.writeFileSync(path.join(sampleDir, `f${String(i).padStart(4, '0')}.${jpeg ? 'jpg' : 'png'}`), buf);
      trace.push({ i, t: +(i / fps).toFixed(4), plan: +yPlan.toFixed(2), y: +r.y.toFixed(2), anims: r.anims, shotMs: Date.now() - t1 });
      if (i % 60 === 0 || i === plan.n - 1) log(`frame ${i + 1}/${plan.n} y=${r.y.toFixed(1)} (${((i + 1) / ((Date.now() - tRec) / 1000)).toFixed(2)} fps capture)`);
    }
    const capSec = (Date.now() - tRec) / 1000;
    ffmpeg.stdin.end();
    const code = await new Promise((res) => ffmpeg.on('close', res));
    if (code !== 0) throw new Error('ffmpeg failed: ' + ffErr.join('').slice(0, 800));
    const stats = await page.evaluate(() => window.__tsrCap.stats);
    await browser.close();

    // 4) self-check of the trace
    let maxDev = 0, nonMono = 0;
    for (let i = 0; i < trace.length; i++) {
      maxDev = Math.max(maxDev, Math.abs(trace[i].y - trace[i].plan));
      if (i && Math.sign(y1 - y0) * (trace[i].y - trace[i - 1].y) < -0.01) nonMono++;
    }
    // never next to the deliverable: default to the temp folder
    const tracePath = opts.trace === 'none' ? null : (opts.trace && opts.trace !== true ? path.resolve(opts.trace) : path.join(os.tmpdir(), 'capture-traces', path.basename(opts.out).replace(/\.mp4$/i, '') + '.trace.json'));
    if (maxDev > 2) store.warnings.push(`actual scroll deviated from the plan by up to ${maxDev.toFixed(1)} px - check for scroll snapping / scroll-jacking (try --scroller)`);
    if (nonMono) store.warnings.push(`${nonMono} frame(s) scrolled backwards`);
    const summary = {
      trace: tracePath,
      out: path.resolve(opts.out), size: `${ow}x${oh}`, captured: firstSize && firstSize.join('x'), fps, frames: plan.n, duration_s: +(plan.n / fps).toFixed(3),
      y0: Math.round(y0), y1: Math.round(y1), peak_px_per_s: Math.round(plan.peakSpeed), scroller: scrollerMode,
      capture_seconds: +capSec.toFixed(1), capture_fps: +(plan.n / capSec).toFixed(2),
      scroll_max_deviation_px: +maxDev.toFixed(2), scroll_backwards_frames: nonMono, page_stats: stats,
      bytes: fs.statSync(opts.out).size, warnings: store.warnings, errors: [...new Set(store.errors)].slice(0, 40), blockedRequests: blocked.slice(0, 20), notes: store.notes.slice(0, 20),
    };
    if (tracePath) { ensureDirFor(tracePath); fs.writeFileSync(tracePath, JSON.stringify({ summary, trace }, null, 0)); }
    console.log(JSON.stringify(summary, null, 1));
  } catch (e) {
    await killAll();
    throw new Error(e.message);
  }
}

/* ----------------------------------------------------------------- verify */
async function cmdVerify(file, opts) {
  if (!file || !fs.existsSync(file)) fail('verify needs an existing <file.mp4>', 2);
  const pr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=codec_name,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_read_frames,color_space,color_primaries,color_transfer:format=duration,size,bit_rate', '-of', 'json', file], { encoding: 'utf8' });
  if (pr.error) fail('ffprobe not found');
  const info = JSON.parse(pr.stdout);
  const st = info.streams[0];
  const W = 160, H = Math.round((160 * st.height) / st.width / 2) * 2;
  const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `scale=${W}:${H}:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 });
  const buf = raw.stdout;
  const fsz = W * H;
  const n = Math.floor(buf.length / fsz);
  const diffs = [];
  for (let i = 1; i < n; i++) {
    let s = 0;
    for (let k = 0; k < fsz; k++) s += Math.abs(buf[(i) * fsz + k] - buf[(i - 1) * fsz + k]);
    diffs.push(+(s / fsz).toFixed(3));
  }
  // Mean absolute grey difference saturates for large displacements, so a dropped
  // frame (double step) only raises the diff ~1.3x above its neighbours and a
  // duplicated frame shows as a near-zero diff (encoder noise keeps it ~0.1, not 0).
  // Calibrated on synthetic defects: smooth scroll <= 1.10x, one dropped frame 1.24x.
  //   jump  = diff > 1.18 x the larger of the medians of the 4 frames before / after (both > 1)
  //   dup   = diff < 0.15 x the smaller of those medians (both > 0.8)
  let tr = null;
  if (opts.trace && fs.existsSync(opts.trace)) tr = JSON.parse(fs.readFileSync(opts.trace, 'utf8')).trace;
  const planStep = (i) => (tr && tr[i] && tr[i - 1] ? Math.abs(tr[i].y - tr[i - 1].y) : null);  // diffs[i-1] is frame i vs i-1
  const jumps = [], dups = [], notable = [], glitches = [];
  // Outlier ("glitch") frames - torn/garbled screenshot, a flash, one wrong frame:
  // frame f differs from BOTH neighbours much more than the neighbours differ from
  // each other. In real motion f-1 -> f+1 is never much smaller than f-1 -> f.
  const pair = (a, b) => { let s = 0; for (let k = 0; k < fsz; k++) s += Math.abs(buf[a * fsz + k] - buf[b * fsz + k]); return s / fsz; };
  for (let f = 1; f < n - 1; f++) {
    const dIn = diffs[f - 1], dOut = diffs[f];
    if (Math.min(dIn, dOut) < 1.0) continue;
    const skip = pair(f - 1, f + 1);
    if (skip < 0.5 * Math.min(dIn, dOut)) glitches.push({ frame: f, diff_in: dIn, diff_out: dOut, prev_to_next: +skip.toFixed(3) });
  }
  // Both sides must agree: a pinned (sticky) section starting, or a reveal animation
  // starting, changes the motion level on ONE side only and is not a defect.
  const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  for (let i = 0; i < diffs.length; i++) {
    const before = median(diffs.slice(Math.max(0, i - 4), i));
    const after = median(diffs.slice(i + 1, i + 5));
    const med = median(diffs.slice(Math.max(0, i - 4), i).concat(diffs.slice(i + 1, i + 5)));
    const lo = Math.min(before, after), hi = Math.max(before, after);
    if (lo > 1 && diffs[i] > 1.18 * hi && diffs[i] - hi > 0.6) jumps.push({ frame: i + 1, diff: diffs[i], neighbourMedian: med, ratio: +(diffs[i] / med).toFixed(2) });
    // informational: sudden onsets (reveal animations, section pins, or something that
    // was frozen and catches up) - look at these frames in the sheet / extract them
    if (diffs[i] > 1.5 && diffs[i] > 2.5 * Math.max(0.3, before) && notable.length < 20) notable.push({ frame: i + 1, diff: diffs[i], before_median: before });
    if (lo > 0.8 && diffs[i] < 0.15 * lo) {
      const ps = planStep(i + 1);
      if (ps == null || ps >= 1.5) dups.push({ frame: i + 1, diff: diffs[i], neighbourMedian: med, planned_step_px: ps });
    }
  }
  const frames = +st.nb_read_frames;
  const durationS = +(+info.format.duration).toFixed(3);
  const [fn, fd] = String(st.r_frame_rate).split('/').map(Number);
  const fpsNum = fd ? fn / fd : fn;
  const expectFrames = tr ? tr.length : Math.round(durationS * fpsNum);
  const out = { file: path.resolve(file), codec: st.codec_name, width: st.width, height: st.height, pix_fmt: st.pix_fmt, fps: st.r_frame_rate, avg_fps: st.avg_frame_rate, frames, expected_frames: expectFrames, duration_s: durationS, size_mb: +(info.format.size / 1048576).toFixed(2), bitrate_kbps: Math.round(info.format.bit_rate / 1000), color: [st.color_space, st.color_primaries, st.color_transfer].join('/'), motion: { mean: +(diffs.reduce((a, b) => a + b, 0) / Math.max(1, diffs.length)).toFixed(3), max: Math.max(...diffs) }, suspected_jumps: jumps.slice(0, 20), suspected_duplicate_frames: dups.slice(0, 20), glitch_frames: glitches.slice(0, 20), notable_onsets: notable };
  if (opts.diffs) fs.writeFileSync(opts.diffs, JSON.stringify(diffs));
  let traceOk = true;
  if (tr) {
    const d = tr.slice(1).map((f, i) => f.y - tr[i].y);
    const moving = d.map((v, i) => ({ v, i: i + 1 })).filter((x) => Math.abs(x.v) > 0.01);
    let worst = 0;
    for (let i = 1; i < d.length; i++) worst = Math.max(worst, Math.abs(d[i] - d[i - 1]));
    const dev = Math.max(...tr.map((f) => Math.abs(f.y - f.plan)));
    out.trace = { frames: tr.length, scrolling_frames: moving.length, max_step_px: +Math.max(...d.map(Math.abs)).toFixed(2), max_step_change_px: +worst.toFixed(2), max_deviation_from_plan_px: +dev.toFixed(2) };
    traceOk = worst <= 3 && dev <= 2;
  }
  const problems = [];
  if (Math.abs(frames - expectFrames) > 0) problems.push(`frame count ${frames} != expected ${expectFrames}`);
  if (fpsNum && String(st.avg_frame_rate) !== String(st.r_frame_rate)) problems.push(`variable frame rate (${st.avg_frame_rate} vs ${st.r_frame_rate})`);
  if (jumps.length) problems.push(`${jumps.length} suspected jump(s) - look at those frames`);
  if (dups.length) problems.push(`${dups.length} suspected duplicate frame(s) during motion`);
  if (glitches.length) problems.push(`${glitches.length} glitch frame(s) (differ from both neighbours) - re-record`);
  if (!traceOk) problems.push('scroll trace not smooth (step change > 3 px or deviation > 2 px)');
  if (st.pix_fmt !== 'yuv420p') problems.push('pix_fmt ' + st.pix_fmt);
  if (out.color !== 'bt709/bt709/bt709') out.color_note = 'colour tags incomplete (older encode without setparams) - harmless, players assume BT.709 for HD';
  out.verdict = problems.length ? 'CHECK: ' + problems.join('; ') : 'OK';
  if (opts.sheet) {
    ensureDirFor(opts.sheet);
    const every = Math.max(1, Math.floor(out.frames / 16));
    const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', file, '-vf', `select='not(mod(n\\,${every}))',scale=480:-2,tile=4x4:padding=4:color=white`, '-frames:v', '1', '-q:v', '3', opts.sheet], { encoding: 'utf8' });
    if (r.status !== 0) out.sheet_error = r.stderr; else out.sheet = path.resolve(opts.sheet);
  }
  console.log(JSON.stringify(out, null, 1));
}

/* ------------------------------------------------------------------- main */
(async () => {
  const o = parseArgs(process.argv.slice(2));
  const [cmd, url] = o._;
  const limit = +(o.timeout || (cmd === 'record' ? 2400 : 900));
  const hard = setTimeout(() => fail(`hard timeout after ${limit} s (use --timeout)`), limit * 1000);
  hard.unref();
  if (cmd === 'inspect') await cmdInspect(url, o);
  else if (cmd === 'frames') await cmdFrames(url, o);
  else if (cmd === 'record') await cmdRecord(url, o);
  else if (cmd === 'verify') await cmdVerify(url, o);
  else {
    const src = fs.readFileSync(__filename, 'utf8');
    console.log(src.slice(src.indexOf('USAGE') - 3, src.indexOf('ENV ')));
    process.exit(cmd ? 2 : 0);
  }
  process.exit(0);
})().catch((e) => {
  const msg = e && e.message ? e.message : String(e);
  if (/LOW DISK/.test(msg)) fail(msg, 3);
  else fail(e && e.stack && !/^(step |could not open|selector not found)/.test(msg) ? e.stack.split('\n').slice(0, 3).join(' | ') : msg);
});
