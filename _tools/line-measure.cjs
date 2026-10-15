// node line-measure.cjs URL SELECTOR [widths] -> rendered line widths of a text element vs its container
const { chromium } = require('playwright');
(async () => {
  const [url, sel, ws] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  for (const w of (ws || '1440').split(',').map(Number)) {
    const p = await b.newPage({ viewport: { width: w, height: w >= 1440 ? 900 : w >= 800 ? 1112 : 844 }, reducedMotion: 'reduce' });
    await p.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) {} });   // no intro logo animation in captures (CAPTURE-NOTES.md)
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(800);
    console.log(w, JSON.stringify(await p.evaluate(s => [...document.querySelectorAll(s)].slice(0, 3).map(t => {
      const range = document.createRange(); range.selectNodeContents(t);
      const byTop = {}; [...range.getClientRects()].forEach(rc => { if (rc.width < 2) return; const k = Math.round(rc.top / 4); (byTop[k] = byTop[k] || []).push(rc); });
      const lines = Object.values(byTop).map(a => Math.round(Math.max(...a.map(x => x.right)) - Math.min(...a.map(x => x.left))));
      return { fs: getComputedStyle(t).fontSize, lsp: getComputedStyle(t).letterSpacing, lines, box: Math.round(t.getBoundingClientRect().width), section: Math.round(t.closest('section').getBoundingClientRect().width) };
    }), sel)));
    await p.close();
  }
  await b.close();
})();
