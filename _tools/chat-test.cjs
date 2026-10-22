// Ask TESERACT: the matcher, the flows and the price rules in node (no browser, no dependencies).
//   node chat-test.cjs [dist folder]   (default ../teseract-website/dist; reads assets/chat/chat.js + assets/chat-kb.json)
// Asserts: top-1 accuracy >= 95% overall and 100% for pricing, project price, no-data and adversarial lines
// (_tools/chat-corpus.json); slot filling; every amount the chat can show is one of the config-derived prices (or the
// visitor's own); no '!' and no surname in any reply; the region table; money formatting; full W / E / S / N flows.
const fs = require('fs'), path = require('path'), vm = require('vm');
const dist = path.resolve(process.argv[2] || path.join(__dirname, '../teseract-website/dist'));
const code = fs.readFileSync(path.join(dist, 'assets/chat/chat.js'), 'utf8');
const kb = JSON.parse(fs.readFileSync(path.join(dist, 'assets/chat-kb.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'chat-corpus.json'), 'utf8')).items;
const box = {}; box.window = box; box.globalThis = box;
vm.createContext(box);
vm.runInContext(code, box);
const EN = box.TSChatEngine, C = box.__CC.copy;
let fails = 0;
const fail = m => { fails++; console.log('FAIL ' + m); };

// ---- 1. corpus
const byCat = {};
const STRICT = new Set(['pricing', 'website', 'ecommerce', 'product', 'project_price', 'nodata', 'adversarial']);
corpus.forEach(it => {
  const m = EN.match(kb, it.q, null, 'INR');
  const got = m.kind === 'answer' ? m.id : m.kind;
  const ok = it.any ? it.any.some(a => got === a || got.startsWith(a + '.')) : got === it.intent;
  const c = byCat[it.cat] = byCat[it.cat] || { n: 0, ok: 0, bad: [] };
  c.n++;
  if (ok) c.ok++; else c.bad.push(`"${it.q}" -> ${got}${m.kind === 'maybe' ? ' [' + m.ids.join(', ') + ']' : ''} (want ${it.intent || it.any.join('|')})`);
  if (it.slots) {
    const sl = m.a.sl;
    Object.keys(it.slots).forEach(k => { if (sl[k] !== it.slots[k]) fail(`slot ${k} of "${it.q}": ${sl[k]} (want ${it.slots[k]})`); });
  }
});
let n = 0, ok = 0;
Object.keys(byCat).forEach(k => {
  const c = byCat[k];
  n += c.n; ok += c.ok;
  const pct = Math.round(c.ok / c.n * 1000) / 10;
  console.log(`${k.padEnd(14)} ${c.ok}/${c.n} ${pct}%`);
  c.bad.forEach(b => console.log('    miss ' + b));
  if (STRICT.has(k) && c.ok !== c.n) fail(`${k}: ${c.n - c.ok} wrong (must be 100%)`);
});
console.log(`overall ${ok}/${n} ${Math.round(ok / n * 1000) / 10}%  (${corpus.length} utterances)`);
if (ok / n < .95) fail('overall accuracy below 95%');
if (corpus.length < 160) fail('corpus has fewer than 160 utterances');

// ---- 2. the region table and money formatting
const REG = [['Asia/Kolkata', ['en-IN'], 'INR', 0], ['Asia/Calcutta', ['en-US'], 'INR', 0], ['Europe/Paris', ['fr-FR'], 'EUR', 0],
  ['Europe/Berlin', ['de-DE'], 'EUR', 0], ['Europe/London', ['en-GB'], 'GBP', 0], ['America/New_York', ['en-US'], 'USD', 0],
  ['Asia/Dubai', ['en-AE'], 'AED', 0], ['Australia/Sydney', ['en-AU'], 'AUD', 0], ['America/Toronto', ['en-CA'], 'CAD', 0],
  ['Asia/Singapore', ['en-SG'], 'SGD', 0], ['Europe/Zurich', ['de-CH'], 'EUR', 'near'], ['UTC', ['en-ZA'], 'INR', 'unknown'],
  ['UTC', ['en-US'], 'INR', 'unknown'], ['UTC', ['de-AT', 'en'], 'EUR', 0], ['Europe/Moscow', ['ru-RU'], 'INR', 'unknown'],
  ['America/Mexico_City', ['es-MX'], 'INR', 'unknown'], ['Europe/Sofia', ['bg-BG'], 'EUR', 0], ['UTC', ['en-GB'], 'GBP', 0]];
REG.forEach(([tz, langs, want, flag]) => {
  const d = EN.detectCurrency(tz, langs, kb);
  if (d.code !== want || (flag === 'unknown') !== !!d.unknown || (flag === 'near') !== !!d.near) fail(`region ${tz} ${langs}: ${JSON.stringify(d)} (want ${want} ${flag || ''})`);
});
[[150000, 'INR', '₹1,50,000'], [35000, 'INR', '₹35,000'], [1460, 'AED', 'AED 1,460'], [400, 'USD', 'US$400'], [350, 'EUR', '€350'], [300, 'GBP', '£300']]
  .forEach(([a, c, w]) => { const g = EN.money(a, c, kb); if (g !== w) fail(`money ${a} ${c}: ${g} (want ${w})`); });
const A = kb.pricing.amounts, WANT = { INR: [35000, 50000], EUR: [350, 500], GBP: [300, 430], USD: [400, 570], AED: [1460, 2080], CAD: [560, 790], AUD: [610, 880], SGD: [520, 750] };
Object.keys(WANT).forEach(c => { if (A[c].w !== WANT[c][0] || A[c].e !== WANT[c][1]) fail(`amounts ${c}: ${JSON.stringify(A[c])}`); });

// ---- 3. flows: every reply text, rendered in every currency; amounts only from the config set
const allowed = new Set();
Object.keys(A).forEach(c => ['w', 'e'].forEach(k => allowed.add(EN.money(A[c][k], c, kb))));
const fill = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));
const texts = (turns, cur, flow) => {
  const P = { W: cur === 'INR' ? EN.money(A.INR.w, 'INR', kb) : 'about ' + EN.money(A[cur].w, cur, kb), E: cur === 'INR' ? EN.money(A.INR.e, 'INR', kb) : 'about ' + EN.money(A[cur].e, cur, kb),
    W_inr: EN.money(A.INR.w, 'INR', kb), E_inr: EN.money(A.INR.e, 'INR', kb), B: flow.st.brief.budget && flow.st.brief.budget.amount ? flow.budgetText(flow.st.brief.budget) : '', email: kb.contact.email, rates_month: kb.pricing.month };
  const out = [];
  turns.forEach(t => t.b.forEach(b => {
    if (b.text) out.push(fill(b.text, P));
    if (b.t === 'echo') out.push(fill(fill(C.echo, { parts: b.parts.join(', ') }), P));
    if (b.items) b.items.forEach(x => out.push(x));
    if (b.t === 'price') out.push(b.k === 'w' ? P.W : P.E);
    if (b.t === 'faq') out.push(kb.faq[b.i].a);
  }));
  turns.forEach(t => (t.c || []).forEach(c => out.push(c.l)));
  return out;
};
const MONEY = /(₹|€|£|US\$|CA\$|A\$|S\$|AED )\d[\d,]*\d/g;
const check = (label, list, own) => list.forEach(t => {
  if (/!/.test(t)) fail(`${label}: "!" in "${t}"`);
  if (/kolli|kumar reddy/i.test(t)) fail(`${label}: surname in "${t}"`);
  (t.match(MONEY) || []).forEach(m => { if (!allowed.has(m) && !(own || []).includes(m)) fail(`${label}: amount ${m} not from the config ("${t}")`); });
});
const mk = (cur, project) => {
  let chosen = null;
  return box.TSChatFlow(C, { kb: () => kb, cur: () => (chosen ? { code: chosen, chosen: 1 } : { code: cur }), setCur: c => { chosen = c; }, page: 'home', project });
};
const say = (f, text, cur, label, own) => { const r = f.input({ text }); check(label + ' "' + text + '"', texts(r.turns, cur, f), own); return r.turns; };
const tap = (f, turns, label, cur, lab) => {
  const all = [].concat(...turns.map(t => t.c || []));
  const c = all.find(x => x.l === label);
  if (!c) { fail(`${lab}: no chip "${label}" (have ${all.map(x => x.l).join(' | ')})`); return []; }
  const r = f.input({ chip: c });
  check(lab + ' [' + label + ']', texts(r.turns, cur, f));
  return r.turns;
};
const blocks = turns => [].concat(...turns.map(t => t.b));
['INR', 'EUR', 'GBP', 'USD', 'AED'].forEach(cur => {
  // W by chips
  let f = mk(cur), t = say(f, 'how much does it cost', cur, 'W ' + cur);
  if (!blocks(t).some(b => /depends on the scope/.test(b.text || ''))) fail('P0 does not say "depends on the scope" first');
  t = tap(f, t, 'A website', cur, 'W ' + cur);
  if (!blocks(t).some(b => b.t === 'price' && b.k === 'w')) fail('W: no website price card');
  t = tap(f, t, '6 to 10', cur, 'W');
  const needs = [].concat(...t.map(x => x.c)).find(c => c.l === 'Motion and interactions');
  if (!needs) fail('W: no needs chips'); else t = f.input({ chip: { l: 'Done', a: { d: 'needs', vals: ['Motion and interactions', '3D'] } } }).turns;
  t = tap(f, t, '1 to 3 months', cur, 'W');
  t = tap(f, t, 'Not sure yet', cur, 'W');
  if (!blocks(t).some(b => b.t === 'brief')) fail(`W ${cur}: no summary with the brief`);
  const pre = f.prefill();
  if (pre.build !== 'Website Development' || !pre.help.includes('Interactive & 3D') || pre.budget !== 'Not sure yet' || !/Pages: 6 to 10/.test(pre.idea)) fail('W prefill: ' + JSON.stringify(pre));
  // E typed
  f = mk(cur);
  t = say(f, 'ecommerce website price', cur, 'E ' + cur);
  const bl = blocks(t);
  if (!bl.some(b => b.t === 'included') || !bl.some(b => b.t === 'price' && b.k === 'e')) fail('E: no included card or price card');
  if (bl.findIndex(b => b.t === 'faq' && b.i === 3) > bl.findIndex(b => b.t === 'price')) fail('E: the price comes before "no fixed packages"');
  t = say(f, 'about 200 products and 6 categories', cur, 'E');
  if (f.st.brief.products !== '100 to 500' || f.st.brief.categories !== '4 to 10') fail('E: typed products / categories not taken: ' + JSON.stringify(f.st.brief));
});
// typed slot fill during W, budget compare, echo
let f = mk('INR'), t = say(f, 'website price', 'INR', 'slot');
t = say(f, '8 pages by December, budget 50k', 'INR', 'slot');
const echo = blocks(t).find(b => b.t === 'echo');
if (!echo || !/about 8 pages/.test(echo.parts.join()) || !/by december/.test(echo.parts.join())) fail('slot echo: ' + JSON.stringify(echo));
if (f.st.brief.pages !== '6 to 10' || f.st.brief.timeline !== 'By December' || !f.st.brief.budget || f.st.brief.budget.inr !== 50000) fail('slot fill: ' + JSON.stringify(f.st.brief));
if (!blocks(t).some(b => b.text === C.budget_ok)) fail('budget 50k for a website should get budget_ok');
f = mk('EUR'); say(f, 'online store price', 'EUR', 'low'); t = say(f, 'my budget is 300 euros', 'EUR', 'low', ['€300']);
if (!blocks(t).some(b => /below where we usually begin/.test(b.text || ''))) fail('budget 300 euros for a store should get budget_low');
// project prices: never a figure for the project
['derlin-haus', 'vesper', 'sagewell', 'gireesh-portfolio', 'vyrn'].forEach(s => {
  const p = kb.projects.find(x => x.s === s), g = mk('INR');
  const turns = say(g, `how much did ${s === 'gireesh-portfolio' ? 'the gireesh portfolio' : p.t} cost`, 'INR', 'pp ' + s);
  const txt = texts(turns, 'INR', g).join(' ');
  if (!/start from|starts from/.test(txt)) fail(`project price ${s}: no starting price`);
  if (p.k === 'client' && !/can't share what a client paid/.test(txt)) fail(`project price ${s}: no client line`);
});
// S and N paths
f = mk('INR'); t = say(f, 'how much for an app', 'INR', 'S');
if (!blocks(t).some(b => b.t === 'service' || /priced on scope alone/.test(b.text || ''))) fail('S: no product reply');
f = mk('INR'); t = say(f, 'pricing', 'INR', 'N'); t = tap(f, t, 'Not sure yet', 'INR', 'N');
if (!blocks(t).some(b => /sense of scale/.test(b.text || ''))) fail('N: no sense-of-scale line');
// misses: first the rephrase, then the hand-off to Gireesh
f = mk('INR'); t = say(f, 'qwerty zxcv blorp', 'INR', 'miss'); t = say(f, 'flibber jabber wock', 'INR', 'miss');
if (!blocks(t).some(b => b.text === C.miss2)) fail('second miss should hand off to Gireesh');
// copy: no '!' and no emoji anywhere in the chat's own words
const walk = v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [].concat(...v.map(walk)) : v && typeof v === 'object' ? [].concat(...Object.values(v).map(walk)) : []);
walk(C).forEach(s => { if (/!|[☀-➿️]|[\u{1F000}-\u{1FAFF}]/u.test(s)) fail('copy: ' + s); });
console.log(fails ? `${fails} failure(s)` : 'chat-test: all passed');
process.exit(fails ? 1 : 0);
