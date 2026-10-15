// Page weight + LCP/CLS for a URL at desktop and phone (cold cache).
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) {} });   // no intro logo animation in captures (CAPTURE-NOTES.md)
    const sizes = []; const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable');
    const reqs = new Map();
    cdp.on('Network.responseReceived', e => reqs.set(e.requestId, e.response.url));
    cdp.on('Network.loadingFinished', e => sizes.push([reqs.get(e.requestId) || '?', e.encodedDataLength]));
    await p.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0;
      new PerformanceObserver(l => l.getEntries().forEach(e => { window.__lcp = e.startTime; window.__lcpEl = e.element && (e.element.className || e.element.tagName); })).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    });
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    const initial = sizes.reduce((s, [, n]) => s + n, 0);
    const v = await p.evaluate(() => ({ lcp: Math.round(window.__lcp), el: String(window.__lcpEl).slice(0, 40), cls: +window.__cls.toFixed(4) }));
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 600) { await p.evaluate(yy => (window.TS && TS.lenis) ? TS.lenis.scrollTo(yy, { immediate: true, force: true }) : scrollTo(0, yy), y); await p.waitForTimeout(120); }
    await p.waitForTimeout(1500);
    const total = sizes.reduce((s, [, n]) => s + n, 0);
    const top = [...sizes].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([u, n]) => `${Math.round(n / 1024)}KB ${u.split('/').slice(-1)[0].split('?')[0]}`);
    console.log(`[${w}] initial ${Math.round(initial / 1024)}KB (${sizes.length} req at load) | after full scroll ${Math.round(total / 1024)}KB | LCP ${v.lcp}ms (${v.el}) | CLS ${v.cls}\n   largest: ${top.join(', ')}`);
    await ctx.close();
  }
  await b.close();
})();
