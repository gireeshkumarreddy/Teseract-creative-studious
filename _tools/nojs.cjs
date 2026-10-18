// No-JS check: with scripts off, nothing a visitor should read stays hidden (opacity < .2 up the tree: reveal states
// that wait for JS), plus the H1 count. Usage: node nojs.cjs [baseUrl ending with /] [widths=1440] [--routes=a/,b/]
// (default http://localhost:4273/ - the preview of dist; 'home' = the home page).
const { chromium } = require('playwright');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const ROUTES = ['', 'who-we-are/', 'what-we-create/', 'our-approach/', 'work/', 'client-stories/', 'contact/', 'projects/derlin-haus/'];

(async () => {
  const args = process.argv.slice(2);
  const base = args[0] && !args[0].startsWith('--') && !/^\d/.test(args[0]) ? args[0] : 'http://localhost:4273/';
  const w = args.find(a => /^\d+(,\d+)*$/.test(a));
  const widths = (w || '1440').split(',').map(Number);
  const rf = args.find(a => a.startsWith('--routes='));
  const routes = rf ? rf.slice(9).split(',').map(r => r === 'home' ? '' : r) : ROUTES;
  const b = await chromium.launch({ executablePath: EDGE });
  try {
    for (const width of widths) {
      const height = width >= 1440 ? 900 : width >= 800 ? 1112 : 844;
      const ctx = await b.newContext({ viewport: { width, height }, javaScriptEnabled: false });
      for (const r of routes) {
        const p = await ctx.newPage();
        await p.goto(base + r + 'index.html', { waitUntil: 'load' });
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
        console.log(`[${width}] /${r}`, JSON.stringify(res));
        await p.close();
      }
      await ctx.close();
    }
  } finally { await b.close(); }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
