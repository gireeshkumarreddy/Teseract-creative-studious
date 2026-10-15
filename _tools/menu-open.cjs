const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) {} });   // no intro logo animation in captures (CAPTURE-NOTES.md)
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.click('[data-menu-open]'); await p.waitForTimeout(1800);
  await p.mouse.move(5, 5);
  const c = await p.context().newCDPSession(p); const r = await c.send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync(out, Buffer.from(r.data, 'base64')); console.log(out);
  await b.close();
})();
