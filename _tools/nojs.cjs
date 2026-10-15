const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  for (const r of ['', 'what-we-create/', 'our-approach/', 'work/', 'contact/', 'projects/tafuta/']) {
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:4174/teseract-website/dist/' + r + 'index.html', { waitUntil: 'load' });
    const res = await p.evaluate(() => {
      const hidden = [];
      document.querySelectorAll('h1,h2,h3,p,li,img,a').forEach(el => {
        if (el.closest('#site-menu,[hidden],[aria-hidden="true"],noscript')) return;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
        let op = 1, n = el; while (n && n !== document.body) { op *= +getComputedStyle(n).opacity; n = n.parentElement; }
        if (op < 0.2) hidden.push((el.tagName + '.' + (el.className || '')).slice(0, 50));
      });
      return { hidden: hidden.slice(0, 6), count: hidden.length, h1: document.querySelectorAll('h1').length };
    });
    console.log('/' + r, JSON.stringify(res));
    await p.close();
  }
  await b.close();
})();
