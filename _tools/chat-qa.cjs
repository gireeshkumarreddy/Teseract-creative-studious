// Ask TESERACT in the browser (Playwright + Edge, one context at a time). Usage:
//   node chat-qa.cjs <baseUrl ending with /> [shotsDir] [--only=a,b]
// Phones are isMobile + hasTouch + a mobile UA; each context emulates a time zone + locale for the currency.
// Asserts: no assets/chat* request before interaction and only same-origin chat files after; no console errors; the
// launcher lifted over the home Pause control at 390, hidden during the intro, tucked over the contact submit and the
// footer bar; the greeting once per tab at about 8 s; the W and E flows by chips; typed slot-fill; the switcher
// re-renders earlier cards; project prices; keyboard (Tab, Esc, focus return); Back on a phone; a simulated keyboard
// (visualViewport) keeps the composer above it; reduced motion; the hand-off fills the contact form; storage blocked
// -> mailto. JPEG screenshots into shotsDir.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
const BASE = process.argv[2] || 'http://localhost:4273/';
const SHOTS = path.resolve(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : path.join(os.tmpdir(), 'chat-qa-shots'));
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
fs.mkdirSync(SHOTS, { recursive: true });
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
const phone = (w, h, tz, locale, extra) => Object.assign({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA, timezoneId: tz, locale }, extra || {});
const desk = (tz, locale, extra) => Object.assign({ viewport: { width: 1440, height: 900 }, timezoneId: tz, locale }, extra || {});
const profs = () => new Set(fs.readdirSync(os.tmpdir()).filter(n => n.startsWith('playwright_chromiumdev_profile-')));
const problems = [], notes = [];
const bad = m => { problems.push(m); console.log('PROBLEM ' + m); };
const note = m => { notes.push(m); console.log(m); };

(async () => {
  const before = profs();
  const b = await chromium.launch({ executablePath: EDGE });
  const mine = [...profs()].filter(n => !before.has(n));
  let tag = '';
  const mk = async (opts, { intro = false, storage = true } = {}) => {
    const ctx = await b.newContext(opts);
    const p = await ctx.newPage();
    p.errors = []; p.reqs = [];
    p.on('console', m => { if (m.type() === 'error') p.errors.push(m.text().slice(0, 200)); });
    p.on('pageerror', e => p.errors.push('pageerror ' + e.message.slice(0, 200)));
    p.on('request', r => p.reqs.push(r.url()));
    if (!intro) await p.addInitScript(() => { try { sessionStorage.setItem('ts-intro', '1'); } catch (e) { /* blocked */ } });
    if (!storage) await p.addInitScript(() => { Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } }); });
    return { ctx, p };
  };
  const done = async ({ ctx, p }) => {
    if (p.errors.length) bad(`${tag}: console errors ${JSON.stringify(p.errors.slice(0, 3))}`);
    const foreign = p.reqs.filter(u => !u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:'));
    if (foreign.length) bad(`${tag}: requests outside the site ${foreign.slice(0, 3)}`);
    await ctx.close();
  };
  const shot = (p, name) => p.screenshot({ path: path.join(SHOTS, name + '.jpg'), type: 'jpeg', quality: 82 });
  const settle = async p => { await p.waitForTimeout(250); await p.waitForFunction(() => !document.querySelector('.cc-log[aria-busy]') && !document.querySelector('.cc-typing'), null, { timeout: 15000 }); await p.waitForTimeout(450); };
  const lastBot = p => p.evaluate(() => { const l = [...document.querySelectorAll('.cc-log .cc-turn--b:not(.cc-typing)')].pop(); return l ? l.innerText.replace(/\s+/g, ' ').trim() : ''; });
  const chipLabels = p => p.evaluate(() => [...document.querySelectorAll('.cc-log .cc-turn--chips .cc-chip')].map(c => c.textContent.trim()));
  const ask = async (p, q) => { await p.fill('#cc-in', q); await p.press('#cc-in', 'Enter'); await settle(p); const t = await lastBot(p); note(`  Q ${q}\n    A ${t.slice(0, 260)}\n    chips: ${(await chipLabels(p)).join(' | ')}`); return t; };
  const chip = async (p, label) => { await p.locator('.cc-log .cc-turn--chips .cc-chip', { hasText: label }).first().click(); await settle(p); return lastBot(p); };
  const open = async p => { await p.click('[data-cc-launch]'); await p.waitForSelector('dialog.cc-dlg[open]', { timeout: 8000 }); await settle(p); };
  const chatReqs = p => p.reqs.filter(u => /assets\/chat/.test(u));
  const logText = p => p.evaluate(() => document.querySelector('.cc-log').innerText.replace(/\s+/g, ' '));
  const want = (cond, msg) => { if (!cond) bad(`${tag}: ${msg}`); };
  const run = async (name, fn) => { if (ONLY.length && !ONLY.includes(name)) return; tag = name; note(`== ${name}`); try { await fn(); } catch (e) { bad(`${name}: ${e.message.split('\n')[0]}`); } };

  // 1. 390 India: launcher, greeting, W flow by chips, hand-off to the form
  await run('p390-in', async () => {
    const c = await mk(phone(390, 844, 'Asia/Kolkata', 'en-IN')), p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    await p.waitForTimeout(3000);
    want(!chatReqs(p).length, 'chat files requested before any interaction');
    const dock = await p.evaluate(() => { const d = document.querySelector('[data-cc]'); return { lift: d.classList.contains('is-lift'), tuck: d.classList.contains('is-tuck'), role: d.querySelector('a').getAttribute('role') }; });
    want(dock.lift && !dock.tuck, `launcher should be lifted above Pause motion on the first screen (${JSON.stringify(dock)})`);
    want(dock.role === 'button', 'launcher not upgraded to a button');
    await shot(p, 'p390-home-first');
    // the greeting never covers a button: on the first screen the hero's CTAs sit where it would be, so it waits
    await p.waitForTimeout(6000);
    // (the living launcher's short lines, .is-say, are not the greeting: they never cover a control either)
    want(!(await p.evaluate(() => { const h = document.querySelector('.cc-hello'); return !h.hidden && !h.classList.contains('is-say'); })), 'the greeting covers the hero buttons');
    // it waits for a quiet corner (no link, button or headline where it would sit): a visitor reading down the page
    let greeted = false;
    for (let i = 0; i < 12 && !greeted; i++) {
      await p.evaluate(() => scrollBy(0, innerHeight * 0.45));
      greeted = await p.waitForSelector('.cc-hello.is-on:not(.is-say)', { timeout: 4000 }).then(() => true, () => false);
    }
    want(greeted, 'no greeting while reading down the home page');
    await p.waitForTimeout(500);
    want(await p.evaluate(() => document.querySelector('[data-cc]').classList.contains('has-dot')), 'no unread dot with the greeting');
    await shot(p, 'p390-bubble');
    await open(p);
    want(await p.evaluate(() => document.activeElement && document.activeElement.id === 'cc-title'), 'initial focus on a phone should be the title (no keyboard pop)');
    await shot(p, 'p390-welcome');
    await chip(p, 'Prices');
    await chip(p, 'A website');
    const txt = await logText(p);
    want(/depends on the scope/.test(txt) && txt.indexOf('depends on the scope') < txt.indexOf('₹35,000'), 'website price without "depends on the scope" first');
    want(/₹35,000/.test(txt), 'no ₹35,000 in India');
    await shot(p, 'p390-price-inr');
    await chip(p, '6 to 10');
    await p.locator('.cc-chip', { hasText: 'Motion and interactions' }).first().click();
    await p.locator('.cc-chip', { hasText: '3D' }).first().click();
    await chip(p, 'Done');
    await chip(p, '1 to 3 months');
    await ask(p, 'around 60k');
    await shot(p, 'p390-summary');
    await chip(p, 'Book a call');
    await shot(p, 'p390-handoff');
    const n0 = p.reqs.length;
    await Promise.all([p.waitForURL(/contact\/index\.html\?service=website-development#project-form/, { timeout: 8000 }), p.click('.cc-cta')]);
    await p.waitForLoadState('load');
    await p.waitForTimeout(1200);
    const f = await p.evaluate(() => ({ build: document.querySelector('#ct-build').value, help: [...document.querySelectorAll('input[name="help"]:checked')].map(x => x.value),
      budget: document.querySelector('#ct-budget').value, idea: document.querySelector('#ct-idea').value, note: !document.querySelector('[data-cc-prefill]').hidden,
      focus: document.activeElement && document.activeElement.id, left: sessionStorage.getItem('ts-cc-prefill') }));
    note('  contact form ' + JSON.stringify(f).slice(0, 400));
    want(f.build === 'Website Development' && f.help.includes('Website Design') && f.help.includes('Interactive & 3D'), 'form select / help not filled');
    want(/₹60,000/.test(f.budget) && /Pages: 6 to 10/.test(f.idea) && f.note && f.focus === 'ct-name' && f.left === null, 'form budget / idea / note / focus / read-once wrong');
    want(!p.reqs.slice(n0).some(u => !u.startsWith(BASE)), 'the hand-off sent something off the site');
    await p.evaluate(() => scrollTo(0, 0));
    await shot(p, 'p390-contact-prefilled');
    // the launcher tucks over the submit button
    await p.evaluate(() => { const s = document.querySelector('.ct-submit'), r = s.getBoundingClientRect(); scrollBy(0, r.bottom - innerHeight + 40); document.activeElement.blur(); });
    await p.waitForTimeout(900);
    const tuck = await p.evaluate(() => { const d = document.querySelector('[data-cc]'); return d.classList.contains('is-tuck'); });
    want(tuck, 'launcher not tucked over the contact submit');
    await shot(p, 'p390-contact-tuck');
    // the greeting is once per tab: not again on the next page
    await p.goto(BASE + 'work/index.html', { waitUntil: 'load' });
    await p.waitForTimeout(10000);
    want(!(await p.evaluate(() => { const h = document.querySelector('.cc-hello'); return h && !h.hidden && !h.classList.contains('is-say'); })), 'greeting shown twice in one tab');
    want(await p.evaluate(() => document.querySelector('[data-cc-launch]').getAttribute('aria-label')) === 'Ask TESERACT, continue the chat', 'launcher does not say "continue the chat"');
    await done(c);
  });

  // 2. 390 Paris: euros, e-commerce, the switcher re-renders earlier cards
  await run('p390-eu', async () => {
    const c = await mk(phone(390, 844, 'Europe/Paris', 'fr-FR')), p = c.p;
    await p.goto(BASE + 'what-we-create/index.html', { waitUntil: 'load' });
    await open(p);
    await ask(p, 'how much is a website');
    let t = await logText(p);
    want(/about €350/.test(t) && /Converted from ₹35,000/.test(t), 'no "about €350" converted from ₹35,000 in Paris');
    want(/based on this device's region settings/.test(t), 'no device-region note for euros');
    await shot(p, 'p390-price-eur');
    await ask(p, 'and for an online store?');
    t = await logText(p);
    want(/about €500/.test(t) && /Cart & Checkout/.test(t), 'no e-commerce €500 + included card');
    await p.evaluate(() => { const l = [...document.querySelectorAll('.cc-inc')].pop(); if (l) l.scrollIntoView({ block: 'start' }); });
    await shot(p, 'p390-ecom-included');
    await p.evaluate(() => { const l = document.querySelector('.cc-log'); l.scrollTop = l.scrollHeight; });
    await shot(p, 'p390-ecom-products');
    await p.locator('.cc-linkbtn', { hasText: 'Change currency' }).last().click();
    await settle(p);
    await shot(p, 'p390-switcher');
    await chip(p, '£ GBP');
    await p.waitForTimeout(500);
    t = await logText(p);
    want(/about £300/.test(t) && /about £430/.test(t) && !/€350/.test(t), 'earlier price cards did not re-render in pounds');
    await done(c);
  });

  // 3. 390 unknown region (UTC + en-ZA): rupees with US dollars alongside, then "Where are you based?"
  await run('p390-unknown', async () => {
    const c = await mk(phone(390, 844, 'UTC', 'en-ZA')), p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    await open(p);
    await ask(p, 'website price');
    const t = await logText(p);
    want(/₹35,000/.test(t) && /about US\$400/.test(t) && /couldn't tell your region/.test(t), 'unknown region: no ₹ + US$ alongside');
    await shot(p, 'p390-price-unknown');
    await chip(p, 'One page'); await chip(p, 'None of these'); await chip(p, 'Done'); await chip(p, 'Flexible');
    const q = await chip(p, 'Skip');
    want(/Where are you based/.test(q), 'unknown region: the flow does not ask where the visitor is based');
    await done(c);
  });

  // 4. 430 New York: US dollars; derlin-haus project price
  await run('p430-us', async () => {
    const c = await mk(phone(430, 932, 'America/New_York', 'en-US')), p = c.p;
    await p.goto(BASE + 'projects/derlin-haus/index.html', { waitUntil: 'load' });
    await open(p);
    const w = await logText(p);
    want(/You're looking at Derlin Haus/.test(w), 'project page welcome without the project line');
    await ask(p, 'how much did this site cost?');
    const t = await lastBot(p);
    want(/can't share what a client paid/.test(t) && /about US\$570/.test(t), 'derlin-haus: client price reply in US$570 missing');
    await shot(p, 'p430-derlin-price');
    await ask(p, 'website price');
    want(/about US\$400/.test(await logText(p)), 'no US$400');
    await shot(p, 'p430-price-usd');
    await done(c);
  });

  // 5. 360 Dubai: dirhams; fallback and no-data
  await run('p360-ae', async () => {
    const c = await mk(phone(360, 780, 'Asia/Dubai', 'en-AE')), p = c.p;
    await p.goto(BASE + 'work/index.html', { waitUntil: 'load' });
    await open(p);
    await shot(p, 'p360-welcome');
    await ask(p, 'ecommerce website cost');
    const t = await logText(p);
    want(/about AED 2,080/.test(t), 'no AED 2,080');
    await ask(p, 'website price');
    want(/about AED 1,460/.test(await logText(p)), 'no AED 1,460');
    await shot(p, 'p360-price-aed');
    const n = await ask(p, 'do you provide hosting');
    want(/isn't covered on this website/.test(n), 'hosting: no no-data reply');
    const m = await ask(p, 'blorp zingle frob');
    want(/not sure I've understood/.test(m), 'gibberish: no first fallback');
    await shot(p, 'p360-fallback');
    await done(c);
  });

  // 6. 844 x 390 London, landscape: side sheet, pounds, keyboard simulation
  await run('p844-uk', async () => {
    const c = await mk(phone(844, 390, 'Europe/London', 'en-GB')), p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    await open(p);
    const box = await p.evaluate(() => { const r = document.querySelector('.cc-panel').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
    want(box[0] > 300 && box[2] <= 490, `landscape: not a right side sheet (${box})`);
    await shot(p, 'p844-welcome');
    await ask(p, 'how much for a website');
    await ask(p, 'and an ecommerce site?');
    const t = await logText(p);
    want(/about £300/.test(t) && /about £430/.test(t), 'landscape London: no £300 / £430');
    await shot(p, 'p844-price-gbp');
    await kb(p, 'p844-keyboard', 220);
    await done(c);
  });

  // simulated on-screen keyboard: the visual viewport shrinks; the composer must stay inside it
  async function kb(p, name, h) {
    await p.focus('#cc-in');
    await p.evaluate(hh => { const v = window.visualViewport; Object.defineProperty(v, 'height', { configurable: true, get: () => hh }); v.dispatchEvent(new Event('resize')); }, h);
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => { const c = document.querySelector('.cc-compose').getBoundingClientRect(); return { bottom: Math.round(c.bottom), kb: document.querySelector('.cc-dlg').classList.contains('is-kb') }; });
    want(r.bottom <= h + 1 && r.kb, `${name}: composer bottom ${r.bottom} not above the simulated keyboard at ${h} (is-kb ${r.kb})`);
    await p.fill('#cc-in', 'Do you do e-commerce?');
    await shot(p, name);
    await p.evaluate(() => { delete window.visualViewport.height; window.visualViewport.dispatchEvent(new Event('resize')); });
  }

  // 7. 390: keyboard up, Back closes, reduced motion, storage blocked, the intro hides the launcher
  await run('p390-misc', async () => {
    let c = await mk(phone(390, 844, 'Asia/Kolkata', 'en-IN')), p = c.p;
    await p.goto(BASE + 'who-we-are/index.html', { waitUntil: 'load' });
    await open(p);
    await ask(p, 'who is gireesh');
    await kb(p, 'p390-keyboard', 470);
    const url = p.url();
    await p.goBack();
    await p.waitForTimeout(600);
    want(!(await p.evaluate(() => document.querySelector('dialog.cc-dlg').open)) && p.url() === url, 'Back did not close the sheet (or left the page)');
    await done(c);
    c = await mk(phone(390, 844, 'Asia/Kolkata', 'en-IN', { reducedMotion: 'reduce' })); p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    await open(p);
    await ask(p, 'pricing');
    await shot(p, 'p390-reduced');
    await done(c);
    c = await mk(phone(390, 844, 'Asia/Kolkata', 'en-IN'), { storage: false }); p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    await p.waitForTimeout(800);
    await open(p);
    await ask(p, 'book a call');
    const mail = await p.evaluate(() => [...document.querySelectorAll('.cc-hand a[href^="mailto:"]')].map(a => a.textContent));
    want(mail.includes('Email it instead'), 'storage blocked: no "Email it instead" mailto');
    await done(c);
    c = await mk(phone(390, 844, 'Asia/Kolkata', 'en-IN'), { intro: true }); p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'commit' });
    await p.waitForTimeout(900);
    const vis = await p.evaluate(() => ({ intro: document.documentElement.classList.contains('ts-intro'), v: getComputedStyle(document.querySelector('[data-cc]')).visibility }));
    want(!vis.intro || vis.v === 'hidden', `launcher visible during the intro (${JSON.stringify(vis)})`);
    await done(c);
  });

  // 8. 1440 London: greeting + pill on derlin-haus, keyboard only, Esc, focus return, hand-off, footer tuck
  await run('d1440-uk', async () => {
    const c = await mk(desk('Europe/London', 'en-GB')), p = c.p;
    await p.goto(BASE + 'projects/derlin-haus/index.html', { waitUntil: 'load' });
    await p.waitForSelector('.cc-hello.is-on:not(.is-say)', { timeout: 30000 }).catch(() => bad(`${tag}: no greeting`));
    await p.hover('[data-cc-launch]');
    await p.waitForTimeout(800);
    await shot(p, 'd1440-derlin-bubble-pill');
    await p.mouse.move(10, 10);
    // keyboard only: focus the launcher, Enter opens, Esc closes, focus returns
    await p.focus('[data-cc-launch]');
    await p.keyboard.press('Enter');
    await p.waitForSelector('dialog.cc-dlg[open]');
    await settle(p);
    want(await p.evaluate(() => document.activeElement && document.activeElement.id === 'cc-in'), 'desktop: initial focus should be the composer');
    await p.keyboard.type('what does a website cost in pounds');
    await p.keyboard.press('Enter');
    await settle(p);
    want(/about £300/.test(await logText(p)), 'desktop London: no £300');
    await shot(p, 'd1440-price-gbp');
    for (let i = 0; i < 4; i++) await p.keyboard.press('Tab');
    const inDlg = await p.evaluate(() => !!document.activeElement.closest('dialog'));
    want(inDlg, 'Tab left the dialog');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    want(await p.evaluate(() => !document.querySelector('dialog.cc-dlg').open && document.activeElement.matches('[data-cc-launch]')), 'Esc did not close / return focus to the launcher');
    await p.click('[data-cc-launch]');
    await p.waitForSelector('dialog.cc-dlg[open]');
    await settle(p);
    await chip(p, '2 to 5'); await chip(p, 'None of these'); await chip(p, 'Done'); await chip(p, 'Within a month'); await chip(p, "Let's discuss");
    await shot(p, 'd1440-summary');
    await chip(p, 'Send my brief');
    await Promise.all([p.waitForURL(/contact/, { timeout: 8000 }), p.click('.cc-cta')]);
    await p.waitForLoadState('load'); await p.waitForTimeout(1200);
    const f = await p.evaluate(() => ({ build: document.querySelector('#ct-build').value, budget: document.querySelector('#ct-budget').value, idea: document.querySelector('#ct-idea').value }));
    want(f.build === 'Website Development' && f.budget === "Let's discuss" && /Similar to: Derlin Haus|Looking for: A website/.test(f.idea), 'desktop hand-off: form not filled ' + JSON.stringify(f));
    await p.evaluate(() => document.querySelector('#project-form').scrollIntoView());
    await shot(p, 'd1440-contact-prefilled');
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(1500);
    want(await p.evaluate(() => document.querySelector('[data-cc]').classList.contains('is-tuck')), 'launcher not tucked over the footer bar');
    await shot(p, 'd1440-footer-tuck');
    await done(c);
  });

  // 9. real phrasings, typed (the answers go to the log for review; a miss on any of them is a problem)
  await run('phrasings', async () => {
    const qs = ['how much does a website cost?', 'Whats the price for an ecommerce store with around 150 products', 'how much was the VYRN site',
      'what is included in e-commerce', 'what services do you offer', 'how does your process work', 'how long will my website take',
      'who is gireesh', 'where are you based', 'how can i contact you', 'can i see your portfolio', 'whats the weather in mumbai',
      'how much for a webiste with 5 pages', 'do u do shopify stores', 'website kitna ka padega', 'do you make apps', 'do you do seo',
      'is the price fixed', 'can i pay in installments', 'do you have jewellery websites', 'tell me about sagewell',
      'what happens after the website is live', 'will my site be unique or a template', 'i want to book a call', 'are you a real person',
      'what does the name mean', 'my budget is 25k for a landing page', 'cost in dollars', 'do you work with startups', 'thanks'];
    for (let i = 0; i < qs.length; i += 10) {
      const c = await mk(phone(390, 844, 'Asia/Kolkata', 'en-IN')), p = c.p;
      await p.goto(BASE + 'index.html', { waitUntil: 'load' });
      await open(p);
      for (const q of qs.slice(i, i + 10)) {
        const a = await ask(p, q);
        if (/not sure I've understood/.test(a) && !/weather/.test(q)) bad(`${tag}: "${q}" fell through to the fallback`);
      }
      await done(c);
    }
  });

  // 10. first screens (launcher above the Pause control) and the welcome at the other sizes
  await run('shots', async () => {
    for (const [w, h, name] of [[430, 932, 'p430'], [360, 780, 'p360']]) {
      const c = await mk(phone(w, h, 'Asia/Kolkata', 'en-IN')), p = c.p;
      await p.goto(BASE + 'index.html', { waitUntil: 'load' });
      await p.waitForTimeout(2500);
      // visible, and clear of the Pause control (lifted when the control sits in its corner)
      const r = await p.evaluate(() => { const d = document.querySelector('[data-cc]'), a = d.querySelector('.cc-launch').getBoundingClientRect();
        const t = [...document.querySelectorAll('.motion-toggle:not([hidden])')].map(x => x.getBoundingClientRect()).filter(b => b.bottom > 0 && b.top < innerHeight);
        return { cls: d.className, hit: t.some(b => b.left < a.right && b.right > a.left && b.top < a.bottom && b.bottom > a.top) }; });
      want(!r.hit && !/is-tuck/.test(r.cls), `${name}: launcher hidden or over the Pause control (${JSON.stringify(r)})`);
      await shot(p, name + '-home-first');
      await open(p);
      await shot(p, name + '-welcome');
      await done(c);
    }
    const c = await mk(desk('Asia/Kolkata', 'en-IN')), p = c.p;
    await p.goto(BASE + 'index.html', { waitUntil: 'load' });
    await p.waitForTimeout(1500);
    await open(p);
    await shot(p, 'd1440-welcome');
    await done(c);
  });

  // 11. quick currency checks
  for (const [tz, loc, re] of [['Australia/Sydney', 'en-AU', /about A\$610/], ['America/Toronto', 'en-CA', /about CA\$560/], ['Asia/Singapore', 'en-SG', /about S\$520/], ['Europe/Berlin', 'de-DE', /about €350/]]) {
    await run('q-' + tz, async () => {
      const c = await mk(phone(390, 844, tz, loc)), p = c.p;
      await p.goto(BASE + 'index.html', { waitUntil: 'load' });
      await open(p);
      await ask(p, 'website cost');
      want(re.test(await logText(p)), `${tz}: ${re}`);
      await done(c);
    });
  }

  await b.close();
  for (const n of mine) fs.rmSync(path.join(os.tmpdir(), n), { recursive: true, force: true });
  console.log(`chat-qa: ${problems.length} problem(s)`);
  problems.forEach(x => console.log(' - ' + x));
  process.exit(problems.length ? 1 : 0);
})().catch(async e => { console.error(e); process.exit(2); });
