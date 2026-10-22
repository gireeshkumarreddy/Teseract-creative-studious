// The living launcher (owner, 21 Oct 23:20) in the browser: Playwright + Edge, one context at a time. Usage:
//   node chat-live.cjs <baseUrl ending with /> <outDir> [--only=a,b]
// Records frame sequences (JPEG, CSS pixels) + a contact sheet per scenario, and asserts: it wanders when the visitor
// is idle (phones 390/360/430 touch, 844x390, desktop 1440); at rest away from home it is never on or within 10 px of a
// link / button / field / the header, and its line never covers one; it goes home on scroll, on the menu, when the tab
// is hidden; it never moves while hovered or focused; it calms after the chat is opened (one short wander on the next
// page); reduced motion = never moves, no pulse, no lines, "Ask" visible; no console errors; elementsFromPoint cost.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
const BASE = process.argv[2] || 'http://localhost:4273/';
const OUT = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'chat-live'));
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
const phone = (w, h, tz, locale, extra) => Object.assign({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA, timezoneId: tz, locale }, extra || {});
const desk = (tz, locale, extra) => Object.assign({ viewport: { width: 1440, height: 900 }, timezoneId: tz, locale }, extra || {});
const profs = () => new Set(fs.readdirSync(os.tmpdir()).filter(n => n.startsWith('playwright_chromiumdev_profile-')));
const problems = [];
let tag = '';
const bad = m => { problems.push(`${tag}: ${m}`); console.log(`PROBLEM ${tag}: ${m}`); };
const want = (c, m) => { if (!c) bad(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

// one sample of the launcher in the page: where it is, its classes, what it is near (only while at rest away from home)
const SAMPLE = () => {
  const d = document.querySelector('[data-cc]'), a = d.querySelector('.cc-launch').getBoundingClientRect(), h = d.querySelector('.cc-hello');
  const hv = !!h && !h.hidden && !h.classList.contains('is-off'), hr = hv ? h.getBoundingClientRect() : null;
  const SEL = 'a[href],button,input,select,textarea,summary,[role=button],.motion-toggle,header';
  const near = (r, m) => [...document.querySelectorAll(SEL)].filter(e => !d.contains(e) && (!e.checkVisibility || e.checkVisibility({ visibilityProperty: true })))
    .map(e => [e, e.getBoundingClientRect()]).filter(([, b]) => b.width && b.height && b.left < r.right + m && b.right > r.left - m && b.top < r.bottom + m && b.bottom > r.top - m)
    // really there: hit-testable somewhere in the overlap (a dense 5 x 5 sample; what an overflow clips away is not)
    .filter(([e, b]) => { const x0 = Math.max(b.left, r.left - m), x1 = Math.min(b.right, r.right + m), y0 = Math.max(b.top, r.top - m), y1 = Math.min(b.bottom, r.bottom + m);
      for (let i = 0; i < 25; i++) { const st = document.elementsFromPoint(x0 + (x1 - x0) * ((i % 5) + .5) / 5, y0 + (y1 - y0) * (Math.floor(i / 5) + .5) / 5); if (st.some(x => e.contains(x))) return true; }
      return false; })
    .map(([e]) => (e.getAttribute('class') || e.tagName).split(' ')[0]);
  const heads = r => [...document.querySelectorAll('h1,h2')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top && (!e.checkVisibility || e.checkVisibility({ visibilityProperty: true })); }).map(e => e.tagName);
  const away = d.classList.contains('is-away'), move = d.classList.contains('is-move');
  return { t: Math.round(performance.now()), cls: d.className.replace(/^cc /, ''), x: Math.round(a.left), y: Math.round(a.top), w: Math.round(a.width), away, move,
    say: hv && h.classList.contains('is-say'), hello: hv && !h.classList.contains('is-say'), line: hv ? h.querySelector('p').textContent : '',
    hitL: away && !move ? near(a, 10).concat(heads(a)) : [], hitB: hv && h.classList.contains('is-say') && !move ? near(hr, 0).concat(heads(hr)) : [],
    op: getComputedStyle(d).opacity, ask: getComputedStyle(d.querySelector('.cc-ask')).display };
};

(async () => {
  const before = profs();
  const b = await chromium.launch({ executablePath: EDGE });
  const mine = [...profs()].filter(n => !before.has(n));
  const stats = { ef: 0, efms: 0, hops: 0 };
  const mk = async (opts, reduced) => {
    const ctx = await b.newContext(Object.assign({}, opts, { reducedMotion: reduced ? 'reduce' : 'no-preference' }));
    const p = await ctx.newPage();
    p.errs = [];
    p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
    p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(() => {
      try { sessionStorage.setItem('ts-intro', '1'); } catch (e) { /* ignore */ }
      const ef = Document.prototype.elementsFromPoint; window.__ef = { n: 0, ms: 0, max: 0 };
      Document.prototype.elementsFromPoint = function (x, y) { const t = performance.now(); try { return ef.call(this, x, y); } finally { const d = performance.now() - t; __ef.n++; __ef.ms += d; __ef.max = Math.max(__ef.max, d); } };
      window.__lt = [];
      try { new PerformanceObserver(l => l.getEntries().forEach(e => __lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch (e) { /* ignore */ }
    });
    return { ctx, p };
  };
  const done = async c => {
    const r = await c.p.evaluate(() => ({ ef: window.__ef, lt: window.__lt })).catch(() => null);
    if (r) { stats.ef += r.ef.n; stats.efms += r.ef.ms; console.log(`  elementsFromPoint ${r.ef.n} calls, ${r.ef.ms.toFixed(1)} ms total, max ${r.ef.max.toFixed(2)} ms`); }
    want(!c.p.errs.length, 'console errors: ' + c.p.errs.slice(0, 3).join(' | '));
    await c.ctx.close();
  };
  // record: sample + frame every ~step ms for ms; returns the samples; frames go to OUT/<name>/NN.jpg + a contact sheet
  const record = async (p, name, ms, step = 900, frames = true) => {
    const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
    const S = [], F = [], t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const s = await p.evaluate(SAMPLE); s.at = Date.now() - t0; S.push(s);
      if (s.hitL.length) bad(`at rest on/next to ${s.hitL.join(',')} at ${s.x},${s.y} (${name} ${(s.at / 1000).toFixed(1)} s)`);
      if (s.hitB.length) bad(`its line covers ${s.hitB.join(',')} (${name} ${(s.at / 1000).toFixed(1)} s)`);
      if (frames) { const buf = await p.screenshot({ type: 'jpeg', quality: 55, scale: 'css' }); F.push([s, buf]); fs.writeFileSync(path.join(dir, String(F.length).padStart(2, '0') + '.jpg'), buf); }
      await sleep(Math.max(0, step - (Date.now() - t0 - s.at)));
    }
    if (frames && F.length) await sheet(p, name, F);
    const hops = S.filter((s, i) => i && (s.x !== S[i - 1].x || s.y !== S[i - 1].y) && s.away).length;
    stats.hops += hops;
    const ev = S.map((s, i) => { const q = S[i - 1] || {}; return [s.away !== q.away ? (s.away ? 'out' : 'home') : '', s.say && !q.say ? 'SAY' : '', s.hello && !q.hello ? 'HELLO' : '', /is-(breath|shim)/.test(s.cls) && !/is-(breath|shim)/.test(q.cls || '') ? 'breath' : '', /is-bob/.test(s.cls) && !/is-bob/.test(q.cls || '') ? 'bob' : ''].filter(Boolean).map(e => `${(s.at / 1000).toFixed(0)}s ${e}`).join(' '); }).filter(Boolean);
    console.log(`  ${name} timeline: ${ev.join(' | ')}`);
    console.log(`  ${name}: ${S.length} samples, away in ${S.filter(s => s.away).length}, lines ${[...new Set(S.filter(s => s.say).map(s => s.line))].length}, spots ${[...new Set(S.filter(s => s.away && !s.move).map(s => s.x + ',' + s.y))].join(' ')}`);
    return S;
  };
  const sheet = async (p, name, F) => {
    const vw = p.viewportSize().width, vh = p.viewportSize().height, cols = vw > vh ? 4 : 8, tw = vw > vh ? 330 : 165;
    const sp = await p.context().newPage();
    await sp.setViewportSize({ width: cols * (tw + 8) + 8, height: 600 });
    const cells = F.map(([s, buf]) => `<figure><img src="data:image/jpeg;base64,${buf.toString('base64')}"><figcaption>${(s.at / 1000).toFixed(1)}s ${s.away ? 'away' : 'home'}${s.move ? ' move' : ''}${s.say ? ' SAY' : ''}${s.hello ? ' HELLO' : ''}${/is-tuck/.test(s.cls) ? ' tuck' : ''}${/is-lift/.test(s.cls) ? ' lift' : ''}</figcaption></figure>`).join('');
    await sp.setContent(`<style>body{margin:0;padding:8px;background:#222;font:11px/1.2 sans-serif;color:#ddd;display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:8px}figure{margin:0}img{width:${tw}px;display:block;border:1px solid #444}</style>${cells}`);
    await sp.waitForTimeout(300);
    fs.writeFileSync(path.join(OUT, name + '-sheet.jpg'), await sp.screenshot({ type: 'jpeg', quality: 70, fullPage: true }));
    await sp.close();
  };
  const run = async (name, fn) => { if (ONLY.length && !ONLY.includes(name)) return; tag = name; console.log(`== ${name}`); try { await fn(); } catch (e) { bad(e.message.split('\n')[0]); } };
  const st = p => p.evaluate(SAMPLE);

  // 1. 390 touch, India: it wanders on the home page, says a line, goes home on scroll, calms once the chat was used
  await run('p390', async () => {
    const c = await mk(phone(390, 844, 'Asia/Kolkata', 'en-IN')), p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    const S = await record(p, 'p390-home', 34000);
    want(S.some(s => s.away), 'never wandered in 34 s on the home first screen');
    want(S.some(s => s.say), 'no line in 34 s');
    // scrolling sends it home
    let s = await st(p);
    for (let i = 0; i < 20 && !s.away; i++) { await sleep(500); s = await st(p); }
    await p.evaluate(() => scrollBy(0, 500));
    await sleep(700);
    s = await st(p);
    want(!s.away, 'not home 700 ms after a scroll');
    await record(p, 'p390-scrolled', 22000);
    // open the chat (tap), close it: calm, no more wandering or lines on this page
    await p.tap('[data-cc-launch]');
    await p.waitForSelector('#cc-dialog[open]', { timeout: 8000 });
    await sleep(1500);
    await p.keyboard.press('Escape');
    await sleep(1200);
    const C = await record(p, 'p390-calm', 26000, 1000);
    want(!C.some(x => x.away), 'wandered after the chat was opened');
    want(!C.some(x => x.say), 'a line after the chat was opened');
    // the next page: one short wander, then calm
    await p.goto(BASE + 'work/index.html', { waitUntil: 'load' });
    const N = await record(p, 'p390-next', 30000, 1000);
    const trips = N.filter((x, i) => i && x.away && !N[i - 1].away).length;
    want(trips <= 1, `more than one wander on a later page (${trips})`);
    want(!N.some(x => x.say), 'a line on a later page after the chat was opened');
    await done(c);
  });

  // 2. landscape phone 844x390, London
  await run('p844', async () => {
    const c = await mk(phone(844, 390, 'Europe/London', 'en-GB')), p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    const S = await record(p, 'p844-home', 30000);
    want(S.some(s => s.away), 'never wandered in 30 s (844x390)');
    // a screen of display type with no free spot (Who We Are, the founder's journey): a small hop where it is
    await p.goto(BASE + 'who-we-are/index.html', { waitUntil: 'load' });
    await p.evaluate(() => scrollTo(0, innerHeight * 1.2));
    await record(p, 'p844-who', 16000, 1000, false);
    await done(c);
  });

  // 3. 360 and 430 touch: wander + safety
  for (const [w, h, n, u] of [[360, 780, 'p360', 'what-we-create/index.html'], [430, 932, 'p430', 'our-approach/index.html'], [430, 932, 'p430-who', 'who-we-are/index.html']]) {
    await run(n, async () => {
      const c = await mk(phone(w, h, 'Asia/Dubai', 'en-AE')), p = c.p;
      await p.goto(BASE + u, { waitUntil: 'load' });
      const S = await record(p, n, 26000);
      // alive: a wander, or (a screen with no free spot, such as a big headline on the edge) a small hop where it is
      want(S.some(s => s.away || /is-bob/.test(s.cls)), `no sign of life in 26 s (${n})`);
      await done(c);
    });
  }

  // 4. desktop 1440: wander (both edges), never while hovered or focused, home on the menu and on a hidden tab
  await run('d1440', async () => {
    const c = await mk(desk('Europe/London', 'en-GB')), p = c.p;
    await p.goto(BASE + 'projects/derlin-haus/index.html', { waitUntil: 'load' });
    await p.mouse.move(700, 450);
    const S = await record(p, 'd1440-derlin', 34000);
    want(S.some(s => s.away), 'never wandered in 34 s (1440)');
    // hover: it stays put
    let s = await st(p);
    for (let i = 0; i < 30 && (!s.away || s.move); i++) { await sleep(500); s = await st(p); }
    await p.mouse.move(s.x + s.w / 2, s.y + s.w / 2);
    await sleep(400);
    const h0 = await st(p);
    await sleep(12000);
    const h1 = await st(p);
    want(h0.x === h1.x && h0.y === h1.y, `moved while hovered (${h0.x},${h0.y} -> ${h1.x},${h1.y})`);
    await p.screenshot({ type: 'jpeg', quality: 70, path: path.join(OUT, 'd1440-hover-pill.jpg') });
    await p.mouse.move(700, 300);
    // keyboard focus: it stays put
    await p.focus('[data-cc-launch]');
    const f0 = await st(p);
    await sleep(12000);
    const f1 = await st(p);
    want(f0.x === f1.x && f0.y === f1.y, `moved while focused (${f0.x},${f0.y} -> ${f1.x},${f1.y})`);
    await p.evaluate(() => document.activeElement.blur());
    // hidden tab: home
    for (let i = 0; i < 30 && !s.away; i++) { await sleep(500); s = await st(p); }
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await sleep(300);
    s = await st(p);
    want(!s.away, 'not home when the tab is hidden');
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    // the menu: home
    s = await st(p);
    for (let i = 0; i < 40 && !s.away; i++) { await sleep(500); s = await st(p); }
    if (s.away) {
      await p.click('[data-menu-open]');
      await sleep(2000);
      s = await st(p);
      want(!s.away, 'not home while the menu is open');
      await p.keyboard.press('Escape');
    } else bad('no wander to test the menu with');
    await done(c);
  });

  // 5. reduced motion: still, "Ask" under the mark, no lines, no pulse
  await run('reduced', async () => {
    const c = await mk(phone(390, 844, 'Asia/Kolkata', 'en-IN'), true), p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    const S = await record(p, 'p390-reduced', 24000, 1200);
    want(!S.some(s => s.away), 'moved under reduced motion');
    want(!S.some(s => s.say), 'a line under reduced motion');
    want(!S.some(s => /is-ring|is-land|is-bob/.test(s.cls)), 'a pulse / landing under reduced motion');
    want(S.every(s => s.ask === 'block'), '"Ask" not shown under reduced motion');
    await p.screenshot({ type: 'jpeg', quality: 75, path: path.join(OUT, 'p390-reduced-launcher.jpg'), clip: { x: 240, y: 680, width: 150, height: 164 } });
    await done(c);
  });

  await b.close();
  for (const n of mine) fs.rmSync(path.join(os.tmpdir(), n), { recursive: true, force: true });
  console.log(`\nelementsFromPoint: ${stats.ef} calls, ${stats.efms.toFixed(1)} ms in all; ${stats.hops} spot changes seen`);
  console.log(problems.length ? `${problems.length} PROBLEM(S)` : 'OK: 0 problems');
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
