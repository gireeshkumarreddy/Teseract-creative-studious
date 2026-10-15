// Scroll to a selector (step through it) and take a plain viewport screenshot: node vp-at.cjs URL SEL OUT W H [offset]
const { chromium } = require('playwright');
(async () => {
  const [url, sel, out, w, h, off] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) {} });   // no intro logo animation in captures (CAPTURE-NOTES.md)
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(600);
  const top = await p.$eval(sel, e => e.getBoundingClientRect().top + scrollY);
  for (let y = 0; y <= top + (+off || 0); y += 300) { await p.evaluate(yy => (window.TS && TS.lenis) ? TS.lenis.scrollTo(yy, { immediate: true, force: true }) : scrollTo(0, yy), y); await p.waitForTimeout(120); }
  await p.evaluate(yy => (window.TS && TS.lenis) ? TS.lenis.scrollTo(yy, { immediate: true, force: true }) : scrollTo(0, yy), top + (+off || 0));
  await p.waitForTimeout(1800);
  await p.screenshot({ path: out, timeout: 60000 }).catch(async () => { const c = await p.context().newCDPSession(p); const r = await c.send('Page.captureScreenshot', { format: 'png' }); require('fs').writeFileSync(out, Buffer.from(r.data, 'base64')); });
  console.log(out, JSON.stringify(await p.evaluate(s => { const els = [...document.querySelector(s).querySelectorAll('[data-reveal],[data-split],.reveal-image')]; return { total: els.length, shown: els.filter(e => e.classList.contains('is-in')).length }; }, sel)));
  await b.close();
})();
