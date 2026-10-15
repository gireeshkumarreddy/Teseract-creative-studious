// Usage: node shoot.cjs <url> <outPrefix> [widths=1440,834,390] [--viewport-only] [--clip=y0:y1] [--wait=ms]
// Scrolls the page top-to-bottom first so scroll-triggered reveals fire, then captures.
const { chromium } = require('playwright');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const fs = require('fs');
async function cdpShot(page, file, clip) {
  const cdp = await page.context().newCDPSession(page);
  const r = await cdp.send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip, captureBeyondViewport: true } : {}));
  fs.mkdirSync(require('path').dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
  await cdp.detach();
}
(async () => {
  const [url, out, widthsArg] = process.argv.slice(2);
  const flags = process.argv.slice(2).filter(a => a.startsWith('--'));
  const viewportOnly = flags.includes('--viewport-only');
  const waitMs = +(flags.find(f => f.startsWith('--wait=')) || '--wait=1200').split('=')[1];
  const widths = (widthsArg && !widthsArg.startsWith('--') ? widthsArg : '1440,834,390').split(',').map(Number);
  const browser = await chromium.launch({ executablePath: EDGE });
  const errors = [];
  for (const w of widths) {
    const h = w >= 1200 ? 900 : w >= 810 ? 1112 : 844;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) {} });   // no intro logo animation in captures (CAPTURE-NOTES.md)
    page.on('console', m => { if (m.type() === 'error') errors.push(`[${w}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[${w}] pageerror: ${e.message}`));
    page.on('response', r => { if (r.status() >= 400) errors.push(`[${w}] HTTP ${r.status()}: ${r.url()}`); });
    page.on('requestfailed', r => errors.push(`[${w}] requestfailed: ${r.url()} ${r.failure() && r.failure().errorText}`));
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => errors.push(`[${w}] goto: ${e.message}`));
    await page.waitForTimeout(waitMs);
    if (!viewportOnly) {
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += Math.round(h * 0.6)) {
        await page.evaluate(yy => (window.TS && TS.lenis) ? TS.lenis.scrollTo(yy, { immediate: true, force: true }) : window.scrollTo(0, yy), y);
        await page.waitForTimeout(220);
      }
      await page.evaluate(() => (window.TS && TS.lenis) ? TS.lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0));
      await page.waitForTimeout(900);
    }
    const file = `${out}-${w}.png`;
    if (flags.includes('--slices')) {
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      let i = 0;
      for (let y = 0; y < total; y += h) {
        await page.evaluate(yy => (window.TS && TS.lenis) ? TS.lenis.scrollTo(yy, { immediate: true, force: true }) : window.scrollTo(0, yy), y);
        await page.waitForTimeout(700);
        const f = `${out}-${w}-${String(i++).padStart(2, '0')}.png`;
        await cdpShot(page, f);
      }
      console.log(`${out}-${w}-*.png slices=${i} total=${total}`);
      await page.close();
      continue;
    }
    fs.mkdirSync(require('path').dirname(file), { recursive: true });
    await page.screenshot({ path: file, fullPage: !viewportOnly, timeout: 90000 });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`${file} ${w}x${viewportOnly ? h : H}`);
    await page.close();
  }
  await browser.close();
  if (errors.length) console.log('ERRORS:\n' + errors.slice(0, 40).join('\n'));
})().catch(e => { console.error('ERR', e); process.exit(1); });
