// Report the font families actually used to render text on a page (via CDP Platform fonts).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const sels = (process.argv[3] || 'h1,.hero__lead,.btn,.pill-label,.menu__link,.hero__badge,.ft__clock,p').split(',');
  const used = {};
  for (const sel of sels) {
    const ids = (await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: sel })).nodeIds.slice(0, 3);
    for (const nodeId of ids) {
      try { const r = await cdp.send('CSS.getPlatformFontsForNode', { nodeId }); r.fonts.forEach(f => { used[f.familyName] = (used[f.familyName] || 0) + f.glyphCount; }); } catch (e) {}
    }
  }
  console.log(JSON.stringify(used), 'font-hn:', await p.evaluate(() => document.documentElement.classList.contains('font-hn')));
  await b.close();
})();
