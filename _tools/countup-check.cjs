const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) {} });   // no intro logo animation in captures (CAPTURE-NOTES.md)
  await p.goto(process.argv[2], { waitUntil: 'load' });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 600) { await p.evaluate(yy => scrollTo(0, yy), y); await p.waitForTimeout(150); }
  await p.waitForTimeout(3000);
  const vals = await p.evaluate(() => [...document.querySelectorAll('[data-count], .bel__stat dd, [class*=stat] [class*=num], [class*=stat] dd')].map(e => e.textContent.replace(/\s+/g,' ').trim()).slice(0, 20));
  console.log(JSON.stringify(vals));
  await b.close();
})();
