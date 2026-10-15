const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage({ viewport: { width: 1600, height: 857 } });
  await p.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) {} });   // no intro logo animation in captures (CAPTURE-NOTES.md)
  await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.click('[data-menu-open]'); await p.waitForTimeout(1800); await p.mouse.move(5, 5);
  console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.menu__txt')].map(e => [e.textContent.trim(), Math.round(e.getBoundingClientRect().width)]))));
  const c = await p.context().newCDPSession(p); const r = await c.send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync(process.argv[3], Buffer.from(r.data, 'base64'));
  await b.close();
})();
