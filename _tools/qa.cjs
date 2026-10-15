// Site-wide browser QA. Usage: node qa.cjs <baseUrl ending with /> [widths=1440,834,390] [--routes=a/,b/]
// For every route x width: console errors, failed/4xx requests, broken images, horizontal overflow,
// h1 count, reveal elements still hidden after a full scroll, build-error blocks, the intro overlay gone with the header
// logo shown (its first programmatic scroll skips the intro); menu open/Escape/focus.
const { chromium } = require('playwright');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const ROUTES = ['', 'who-we-are/', 'what-we-create/', 'our-approach/', 'work/', 'client-stories/', 'contact/', 'privacy/', 'terms/', '404/',
  'projects/derlin-haus/', 'projects/aaradhya/', 'projects/geetha-jewellers/', 'projects/the-paradise/'];

(async () => {
  const base = process.argv[2];
  const widths = (process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '1440,834,390').split(',').map(Number);
  const rf = process.argv.find(a => a.startsWith('--routes='));
  const routes = rf ? rf.slice(9).split(',').map(r => r === 'home' ? '' : r) : ROUTES;
  const reduced = process.argv.includes('--reduced');
  const browser = await chromium.launch({ executablePath: EDGE });
  const problems = [];
  let checks = 0;
  for (const w of widths) {
    const h = w >= 1440 ? 900 : w >= 800 ? 1112 : 844;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    for (const route of routes) {
      const page = await ctx.newPage();
      const tag = `[${w}] /${route}`;
      page.on('console', m => { if (m.type() === 'error') problems.push(`${tag} console: ${m.text().slice(0, 200)}`); });
      page.on('pageerror', e => problems.push(`${tag} pageerror: ${e.message.slice(0, 200)}`));
      page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) problems.push(`${tag} HTTP ${r.status()} ${r.url()}`); });
      page.on('requestfailed', r => { const t = r.failure() && r.failure().errorText; if (t && !/ERR_ABORTED/.test(t)) problems.push(`${tag} requestfailed ${r.url()} ${t}`); });
      await page.goto(base + route + 'index.html', { waitUntil: 'load', timeout: 60000 }).catch(e => problems.push(`${tag} goto ${e.message}`));
      await page.waitForTimeout(600);
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += Math.round(h * 0.45)) { await page.evaluate(yy => (window.TS && TS.lenis) ? TS.lenis.scrollTo(yy, { immediate: true, force: true }) : window.scrollTo(0, yy), y); await page.waitForTimeout(240); }
      await page.waitForTimeout(1600);
      const r = await page.evaluate(() => {
        const out = {};
        out.overflow = document.documentElement.scrollWidth - innerWidth;
        out.h1 = document.querySelectorAll('h1').length;
        out.buildErrors = document.querySelectorAll('.build-error').length;
        // intro logo animation (01-intro.js): gone after the scroll skipped it, html classes cleared, header logo shown
        out.intro = { node: !!document.querySelector('[data-intro]'), cls: document.documentElement.className.split(/\s+/).filter(c => c === 'ts-intro' || c.startsWith('tsi-')),
          brand: document.querySelector('.hdr-brand') ? getComputedStyle(document.querySelector('.hdr-brand')).opacity : '1' };
        out.hidden = [...document.querySelectorAll('[data-reveal]:not(.is-in), .reveal-image:not(.is-in), [data-split]:not(.is-in)')]
          .filter(el => el.offsetParent && !el.closest('[data-clone],[hidden],.menu,[aria-hidden="true"]')).map(el => (el.className || el.tagName).toString().slice(0, 60)).slice(0, 5);
        out.brokenImgs = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.offsetParent && i.getAttribute('loading') !== 'lazy').map(i => i.currentSrc || i.src).slice(0, 5);
        out.wide = [...document.querySelectorAll('body *')].filter(el => { const b = el.getBoundingClientRect(); return b.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('[data-ticker],.menu,[aria-hidden="true"]') && b.width > 0; })
          .slice(0, 4).map(el => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} right=${Math.round(el.getBoundingClientRect().right)}`);
        return out;
      });
      checks++;
      if (r.overflow > 0) problems.push(`${tag} horizontal overflow ${r.overflow}px; wide: ${r.wide.join(', ')}`);
      if (r.h1 !== 1) problems.push(`${tag} h1 count ${r.h1}`);
      if (r.buildErrors) problems.push(`${tag} build-error blocks ${r.buildErrors}`);
      if (r.intro.node || r.intro.cls.length || r.intro.brand !== '1') problems.push(`${tag} intro not finished: overlay ${r.intro.node}, classes [${r.intro.cls.join(' ')}], header logo opacity ${r.intro.brand}`);
      if (r.hidden.length) {
        // Second chance (machine load can stall frames): scroll each still-hidden element into view,
        // wait, and only report elements that STILL never reveal.
        const still = await page.evaluate(async () => {
          const sel = '[data-reveal]:not(.is-in), .reveal-image:not(.is-in), [data-split]:not(.is-in)';
          const els = [...document.querySelectorAll(sel)].filter(el => el.offsetParent && !el.closest('[data-clone],[hidden],.menu,[aria-hidden="true"]'));
          for (const el of els.slice(0, 12)) {
            const y = el.getBoundingClientRect().top + scrollY - innerHeight / 2;
            (window.TS && TS.lenis) ? TS.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
            await new Promise(res => setTimeout(res, 700));
          }
          await new Promise(res => setTimeout(res, 800));
          return els.filter(el => !el.classList.contains('is-in')).map(el => (el.className || el.tagName).toString().slice(0, 60)).slice(0, 5);
        });
        if (still.length) problems.push(`${tag} reveal never fired: ${still.join(' | ')}`);
      }
      if (r.brokenImgs.length) problems.push(`${tag} broken images: ${r.brokenImgs.join(', ')}`);
      // Menu: open, focus inside, Escape closes, focus back on toggle
      if (route === '' || route === 'work/') {
        await page.evaluate(() => (window.TS && TS.lenis) ? TS.lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0));
        const toggle = await page.$('[data-menu-open]');
        if (toggle) {
          await toggle.click();
          await page.waitForTimeout(1300);
          const m = await page.evaluate(() => {
            const menu = document.getElementById('site-menu');
            return { visible: !!menu && !menu.hidden && getComputedStyle(menu).display !== 'none' && menu.getBoundingClientRect().height > 0,
              focusInside: !!menu && menu.contains(document.activeElement), expanded: document.querySelector('[data-menu-open]').getAttribute('aria-expanded'),
              items: menu ? menu.querySelectorAll('a').length : 0, overflow: document.documentElement.scrollWidth - innerWidth };
          });
          if (!m.visible) problems.push(`${tag} menu did not open`);
          if (!m.focusInside) problems.push(`${tag} menu focus not inside`);
          if (m.expanded !== 'true') problems.push(`${tag} toggle aria-expanded=${m.expanded}`);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
          const c = await page.evaluate(() => { const menu = document.getElementById('site-menu'); return { hidden: !menu || menu.hidden || getComputedStyle(menu).display === 'none' || getComputedStyle(menu).visibility === 'hidden', focusToggle: document.activeElement === document.querySelector('[data-menu-open]') }; });
          if (!c.hidden) problems.push(`${tag} menu did not close on Escape`);
          if (!c.focusToggle) problems.push(`${tag} focus not restored to menu toggle`);
        } else problems.push(`${tag} no menu toggle`);
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`QA: ${checks} page checks, ${problems.length} problem(s)`);
  problems.forEach(p => console.log(' - ' + p));
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error('ERR', e); process.exit(2); });
