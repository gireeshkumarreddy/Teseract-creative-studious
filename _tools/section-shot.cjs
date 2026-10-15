// Screenshot one section (by selector) at given widths: node section-shot.cjs URL SELECTOR OUTPREFIX 834,390
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [url, sel, out, ws] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  for (const w of (ws || '834,390').split(',').map(Number)) {
    const h = w >= 1440 ? 900 : w >= 800 ? 1112 : 844;
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) {} });   // no intro logo animation in captures (CAPTURE-NOTES.md)
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(500);
    const el = await p.$(sel); if (!el) { console.log('missing', sel); continue; }
    const top = await el.evaluate(e => e.getBoundingClientRect().top + scrollY);
    const ht = await el.evaluate(e => e.getBoundingClientRect().height);
    for (let y = Math.max(0, top - h); y < top + ht; y += Math.round(h * 0.4)) { await p.evaluate(yy => (window.TS && TS.lenis) ? TS.lenis.scrollTo(yy, { immediate: true, force: true }) : scrollTo(0, yy), y); await p.waitForTimeout(260); }
    await p.waitForTimeout(1500);
    const cdp = await p.context().newCDPSession(p);
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: top, width: w, height: Math.min(ht, 6000), scale: 1 }, captureBeyondViewport: true });
    fs.mkdirSync(require('path').dirname(out), { recursive: true }); fs.writeFileSync(`${out}-${w}.png`, Buffer.from(r.data, 'base64'));
    console.log(`${out}-${w}.png`, Math.round(ht)); await p.close();
  }
  await b.close();
})();
