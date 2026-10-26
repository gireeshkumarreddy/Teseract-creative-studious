/* Ask TESERACT, part 1: the matcher. Pure functions, no DOM, no network: the knowledge base (scripts/chat_kb.py) is
   the only source of answers, and every price comes from its config-derived amounts. Build spec, sections 5-6. */
(() => {
'use strict';
const G = globalThis;
// ---- language: stopwords, synonyms (Hindi, Telugu and Tamil price words included), concept groups for the gates
const STOP = new Set(('a an the is are am was were be been being i me my mine we us you your yours it its this that these those of to in on for with at by from and or so if can could would will shall should may might please pls plz there here what which how any some about just also like want wanted need get got have has had tell let know kindly ok okay yeah yes really very much bit sir madam bro then than our ours their them they he she his her as into up every look im ive id dont lets').split(' '));
const SYN = {cost:'price',charge:'price',charg:'price',fee:'price',rate:'price',pricing:'price',quote:'price',quotation:'price',estimate:'price',estimat:'price',how_much:'price',costing:'price',kitna:'price',kitne:'price',kitni:'price',keemat:'price',kimat:'price',daam:'price',dam:'price',kharcha:'price',entha:'price',enta:'price',enti:'price',evlo:'price',evvalavu:'price',evvalo:'price',lagega:'price',lagta:'price',paisa:'price',tariff:'price',prise:'price',pirce:'price',
  site:'website',webpage:'website',web:'website',websit:'website',webiste:'website',wesite:'website',websiet:'website',homepage:'website',amazon:'ecommerce',flipkart:'ecommerce',myntra:'ecommerce',etsy:'ecommerce',meesho:'ecommerce',store:'ecommerce',shop:'ecommerce',shopping:'ecommerce',dukaan:'ecommerce',dukan:'ecommerce',eshop:'ecommerce',estore:'ecommerce',commerce:'ecommerce',ecomerce:'ecommerce',
  application:'app',webapp:'app',software:'saas',platform:'saas',owner:'founder',ceo:'founder',boss:'founder',cofounder:'founder',does:'do',did:'do',doing:'do',example:'work',sample:'work',showcase:'work',staff:'team',employee:'team',chatbot:'ai',artificial:'ai',automate:'automation',automated:'automation',mail:'email',gmail:'email',telephone:'phone',mobile:'phone',whatsapp:'phone',animation:'motion',animated:'motion',animate:'motion',branding:'brand',stage:'step',phase:'step',meeting:'call',meet:'call',appointment:'call',schedule:'call',zoom:'call',
  thank:'thanks',thx:'thanks',ty:'thanks',hello:'hi',hey:'hi',namaste:'hi',hii:'hi',helo:'hi',goodbye:'bye',located:'based',location:'based',situated:'based',jewelry:'jewellery',jeweller:'jewellery',jewellers:'jewellery',jewelers:'jewellery',sari:'saree',perfume:'fragrance',drink:'beverage',cv:'resume',job:'jobs',hiring:'jobs',vacancy:'jobs',internship:'jobs',career:'careers',
  timeline:'time',duration:'time',turnaround:'time',deadline:'time',week:'time',month:'time',day:'time',how_long:'time',cheaper:'discount',cheapest:'discount',lowest:'discount',negotiate:'discount',bargain:'discount',deal:'discount',reduce:'discount',lower:'discount',concession:'discount',invoice:'gst',tax:'gst',billing:'gst',wordpress:'stack',react:'stack',webflow:'stack',framer:'stack',nextjs:'stack',technology:'stack',tech:'stack',framework:'stack',wix:'template',squarespace:'template',theme:'template',templat:'template',host:'hosting',server:'hosting',emi:'installment',instalment:'installment',advance:'installment',upfront:'installment',deposit:'installment',maintain:'maintenance',maintenanc:'maintenance',amc:'maintenance',upkeep:'maintenance',office:'address',visit:'address',tesseract:'teseract',teserract:'teseract',includ:'include',contain:'include',cover:'include',seo:'seo'};
// (24 Oct: 'business' / 'corporate' no longer make a website and a bare 'product' no longer makes SaaS - "a chatbot for
// my business", "50 products" - see analyze(): a digital / SaaS product still does)
const CONCEPTS = {PRICE:'price pay paid expensive afford affordable invest investment cheap spend',BUDGET:'budget spend afford',ECOM:'ecommerce sell cart checkout shopify woocommerce catalogue catalog inventory sku',SITE:'website landing portfolio page blog cms one_pager',SAAS:'saas app dashboard mvp tool crm portal',AI:'ai automation gpt llm agent',THREE_D:'3d motion interactive webgl',BRAND:'brand logo identity typography guideline',STRAT:'strategy seo research positioning',TIME:'time fast quick quickly asap urgent urgently finish deliver delivery',CALL:'call book talk discuss speak consult consultation',CONTACT:'contact email reach phone number social instagram linkedin github',WORK:'work portfolio case client built made',DISCOUNT:'discount less',INCLUDE:'include'};
const NUMW = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,fifteen:15,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
const NUM = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,fifteen:15,twenty:20,single:1};
const MONTHS = 'january february march april may june july august september october november december'.split(' ');

const norm = s => {
  s = ' ' + String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2018\u2019\u0060]/g, "'") + ' ';
  s = s.replace(/(\d),(?=\d)/g, '$1')
    .replace(/us\$|\busd\b/g, ' _usd ').replace(/ca\$|\bcad\b/g, ' _cad ').replace(/a\$|\baud\b/g, ' _aud ').replace(/s\$|\bsgd\b/g, ' _sgd ')
    .replace(/₹|\brs\.?(?=[\s\d])|\binr\b|\brupees?\b|\brupaye\b/g, ' _inr ').replace(/€|\beur\b|\beuros?\b/g, ' _eur ')
    .replace(/£|\bgbp\b|\bpounds?\b|\bquid\b/g, ' _gbp ').replace(/\baed\b|\baed(?=\d)|\bdirhams?\b/g, ' _aed ').replace(/\$|\bdollars?\b|\bbucks\b/g, ' _dol ')
    .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(?=(?:thousand|lakhs?|lacs?|crores?)\b)/g, (m, w) => NUMW[w] + ' ')
    // (_k: said as money; a lakh or a crore is rupees, 25 Oct)
    .replace(/(\d+(?:\.\d+)?)\s*(k|thousand|lakhs?|lacs?|l|cr|crores?)\b/g, (m, n, u) => ' ' + Math.round(+n * (u[0] === 'k' || u[0] === 't' ? 1e3 : u[0] === 'c' ? 1e7 : 1e5)) + (/^[kt]/.test(u) ? ' _k ' : ' _k _inr '))
    .replace(/n't\b/g, ' not').replace(/'re\b/g, ' are').replace(/'m\b/g, ' am').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will').replace(/'d\b/g, ' would').replace(/'s\b/g, '')
    .replace(/\be[\s-]?commerce\b|\becom\b|\bonline (?:store|shop|business)s?\b|\bweb ?shops?\b|\be-?shops?\b/g, ' ecommerce ')
    .replace(/\bone[\s-]pager\b|\bsingle[\s-]page\b/g, ' one_pager ').replace(/\b3[\s-]?d\b|\bthree[\s-]?d\b/g, ' 3d ')
    .replace(/\bhow (much|long|many)\b/g, 'how_$1').replace(/\babu dhabi\b/g, 'abu_dhabi').replace(/\bsouth africa\b/g, 'south_africa')
    .replace(/\bnew york\b/g, 'new_york').replace(/\bunited (states|kingdom|arab emirates)\b/g, 'united_$1')
    .replace(/(\d+)\s*%/g, '$1 percent ').replace(/[^a-z0-9_\s]/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
};
const stem = w => w.length > 5 && w.endsWith('ing') ? w.slice(0, -3) : w.length > 4 && w.endsWith('ed') ? w.slice(0, -2)
  : w.length > 4 && w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w;
const canon = w => SYN[w] || (w = stem(w), SYN[w] || w);
const words = s => norm(s).split(' ').filter(Boolean);
const tokens = s => words(s).filter(w => !STOP.has(w) && w !== '_k').map(canon);
const CON = {};
Object.keys(CONCEPTS).forEach(k => CONCEPTS[k].split(' ').forEach(w => (CON[canon(w)] = CON[canon(w)] || []).push(k)));
const concepts = toks => { const c = new Set(); toks.forEach(t => (CON[t] || []).forEach(k => c.add(k))); return c; };

// Damerau-Levenshtein (optimal string alignment), capped
const dl = (a, b) => {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i ? 0 : j; }
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
};
const credit = (a, b) => {
  if (a === b) return 1;
  if (a.length < 5 || b.length < 5 || a[0] !== b[0]) return 0;
  if (a.slice(0, 5) === b.slice(0, 5)) return .8;
  const n = dl(a, b);
  return n <= 1 || (n <= 2 && a.length >= 8 && b.length >= 8) ? .7 : 0;
};

// ---- the knowledge base, prepared once: phrase tokens, idf, project names, region tables
const prep = kb => {
  if (kb._p) return kb._p;
  const P = { ints: [], idf: {}, byId: {} };
  const add = (it, extra) => {
    const ph = (it.ph || []).concat(extra || []).map(tokens).filter(t => t.length);
    const x = { it, id: it.id, fam: it.fam || it.id.split('.')[0], ph, keys: (it.k || []).map(canon), need: it.need || [], not: it.not || [] };
    P.ints.push(x); P.byId[it.id] = x;
  };
  kb.intents.forEach(it => {
    let extra = [];
    const m = /^(faq)\.(\d+)$|^svc\.(.+)$|^process\.step\.(\d+)$/.exec(it.id);
    if (m && m[1]) { const f = kb.faq[+m[2]]; it.q = it.q || f.q; extra = [f.q]; }
    else if (m && m[3]) { const s = kb.services.find(v => v.id === m[3]); if (s) { it.q = it.q || s.name; extra = [s.name].concat(s.tags); } }
    else if (m && m[4]) { const s = kb.process.steps[m[4] - 1], n = s.name.toLowerCase(); it.q = it.q || `${s.name}: ${s.sub}`; extra = [`what happens in the ${n} stage`, `${n} step`, s.sub]; }
    add(it, extra);
  });
  const df = {};
  P.ints.forEach(x => new Set([].concat(...x.ph, x.keys)).forEach(t => (df[t] = (df[t] || 0) + 1)));
  const N = P.ints.length;
  Object.keys(df).forEach(t => (P.idf[t] = Math.log(1 + N / df[t])));
  P.vocab = new Set(Object.keys(df));
  // project names: title words, slug, aliases (exact token runs; one-word names of 6+ letters also with one typo)
  P.names = [];
  const alias = (kb.lex && kb.lex.alias) || {};
  kb.projects.forEach(p => {
    const keys = new Set(p.keys);
    Object.keys(alias).forEach(a => { if (alias[a] === p.s) keys.add(a); });
    keys.forEach(k => P.names.push({ s: p.s, w: words(k) }));
  });
  P.names.sort((a, b) => b.w.length - a.w.length);
  const R = kb.regions;
  P.tz = {}; Object.keys(R.tz).forEach(c => R.tz[c].split(' ').forEach(z => (P.tz[z] = c)));
  P.lang = {}; Object.keys(R.lang).forEach(c => R.lang[c].split(' ').forEach(r => (P.lang[r] = c)));
  P.place = {}; Object.keys(R.places).forEach(k => { const [c, n] = k.split('|'); R.places[k].split(' ').forEach(w => (P.place[w] = [c, n])); });
  P.other = new Set(R.other_places.split(' '));
  return (kb._p = P);
};

// ---- currency: on the device only (time zone, then the language region); never an IP lookup
const detectCurrency = (tz, langs, kb) => {
  const P = prep(kb), R = kb.regions, near = R.tz_near.split(' ');
  tz = tz || '';
  if (R.tz_unknown.split(' ').includes(tz)) return { code: 'INR', unknown: true };
  const c = P.tz[tz] || R.prefix[Object.keys(R.prefix).find(p => tz.startsWith(p))];
  if (c) return { code: c, near: near.includes(tz) };
  // UTC / Etc / an unmapped zone: the region of the first language that names one
  for (const l of langs || []) {
    const m = /^[a-z]{2,3}(?:-[A-Za-z]{4})?-([A-Z]{2}|\d{3})\b/i.exec(l);
    if (!m) continue;
    const r = m[1].toUpperCase();
    // en-US: many devices' default
    if (r === 'US' && l.toLowerCase().startsWith('en')) return { code: 'INR', unknown: true };
    if (P.lang[r]) return { code: P.lang[r], near: R.lang_near.split(' ').includes(r) };
    return { code: 'INR', unknown: true };
  }
  return { code: 'INR', unknown: true };
};
const group = (n, code) => {
  const s = String(Math.round(n));
  if (code === 'INR' && s.length > 3) return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3);
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const money = (n, code, kb) => kb.pricing.cur[code].sym + group(n, code);
const moneySr = (n, code, kb) => `${group(n, code)} ${kb.pricing.cur[code].long}`;

// ---- slots: what the visitor tells us in passing (pages, products, timeline, budget, region, contact details)
const bucket = (n, cuts, labels) => labels[cuts.findIndex(c => n <= c) < 0 ? labels.length - 1 : cuts.findIndex(c => n <= c)];
const PAGES = ['One page', '2 to 5', '6 to 10', 'More than 10'];
const PRODUCTS = ['Under 20', '20 to 100', '100 to 500', 'More than 500'];
const CATS = ['1 to 3', '4 to 10', 'More than 10'];
// ("fifty" products)
const num = w => /^\d+$/.test(w) ? +w : NUM[w] || NUMW[w];
const CU = '_(?:inr|eur|gbp|usd|aed|cad|aud|sgd|dol)', CURW = new RegExp('^' + CU + '$');
// (25 Oct) "what does 50k get me", "what do I get for 35k": a question about the starting price, never a budget
const GETQ = new RegExp('\\bwhat (?:do|does|would|will|can|could) (?:(?:i|we|one|it) |(?:' + CU + ' )?\\d+ (?:_k )?(?:' + CU + ' )?)(?:get|include|cover|buy)\\b');
// a price said back after the amount ("35k is the starting price", "is 35k the price for 10 pages", "is ₹35,000 the minimum";
// 26 Oct: "is 50k the lowest for a store", "50k is what an online store starts at")
const QUOTED = /^(?:(?:is|was|as) )?(?:(?:the|your|ur|a) (?:(?:starting|start|minimum|min|base|lowest|usual|standard) )?(?:price|cost|rate|fee|charge|minimum|starting)|(?:the|your|ur) (?:lowest|least|cheapest|base|minimum|min|entry))\b|^(?:is|was) (?:what|where|how|when)\b.*\b(?:start|starts|starting|begin|begins|minimum|lowest)\b/;
// (26 Oct) a rate, not a sum: "3 lakh a month in sales", "we make 3 lakh"; and "I can pay 25000" is a budget, "do I pay
// 35k upfront" a question about paying
const RATE = /^(?:(?:a|per|every|each|in|of) (?:month|year|day|week|quarter|annum|sales|revenue|turnover|profit|income)|monthly|yearly|annually|annual|daily|weekly)\b/;
const PAYQ = /^(?:so )?(?:do|does|did|should|shall|must|will|would|is|are|how|what|when|why)\b|\b(?:installments?|instalments?|emi|upfront|advance|deposit|milestones?|parts)\b/;
// what a number counts when it is not money ("200 employees", "150 stores", "999 rupees each")
const NOUN = /^(percent|off|each|per|pages?|products?|items?|skus?|categories|category|collections?|weeks?|months?|days?|hours?|years?|yrs?|screens?|employees?|staff|people|persons?|users?|members?|stores?|shops?|outlets?|branches?|locations?|cities|countries|customers?|clients?|followers?|visitors?|orders?|students?|rooms?|beds?|units?|pieces?|times|sq|sqft|km|kg)$/;
const slots = (raw, s, kb, active, want) => {
  const o = {};
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(raw) || (raw.replace(/\D/g, '').length >= 10 && /\+?\d[\d\s().-]{8,}\d/.test(raw))) { o.personal = 1; return o; }
  let m = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|single)\s*(?:to|or)?\s*(\d+)?\s*(?:pages?|screens?)\b/.exec(s);
  if (m && num(m[1])) { const n = Math.max(num(m[1]), +(m[2] || 0)); o.pages = bucket(n, [1, 5, 10], PAGES); o.pagesN = n; }
  else if (/\blanding\b|\bone_pager\b/.test(s)) { o.pages = 'One page'; o.pagesN = 1; }
  m = /\b(\d+)\s*(?:_k\s*(?:_inr\s*)?)?(?:to\s*\d+\s*(?:_k\s*(?:_inr\s*)?)?)?(?:products?|items?|skus?)\b/.exec(s);
  if (m) { o.productsN = +m[1]; o.products = bucket(o.productsN, [19, 100, 500], PRODUCTS); }
  else if (/\b(?:a few|few|some|a handful of) (?:products|items)\b/.test(s)) o.products = PRODUCTS[0];
  else if (/\bhundreds? of (?:products|items)\b/.test(s)) o.products = PRODUCTS[2];
  else if (/\bthousands? of (?:products|items)\b/.test(s)) o.products = PRODUCTS[3];
  m = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:categories|category|collections?)\b/.exec(s);
  if (m && num(m[1])) o.categories = bucket(num(m[1]), [3, 10], CATS);
  // timeline (a display string, the visitor's own terms)
  if (/\b(asap|urgent|urgently|immediately|this week|next week|right away)\b/.test(s)) o.timeline = 'Within a month';
  else if ((m = /\b(?:in|within)\s+(\d+|a|one|two|three|four|five|six|eight|twelve)\s+(weeks?|months?)\b/.exec(s))) {
    const n = m[1] === 'a' ? 1 : num(m[1]), wk = m[2][0] === 'w';
    o.timeline = wk ? (n <= 4 ? 'Within a month' : n <= 12 ? '1 to 3 months' : '3 to 6 months') : (n <= 1 ? 'Within a month' : n <= 3 ? '1 to 3 months' : n <= 6 ? '3 to 6 months' : 'Flexible');
    o.timeText = `in ${m[1]} ${m[2]}`;
  } else if ((m = new RegExp(`\\bby (?:the end of )?(${MONTHS.join('|')})\\b`).exec(s))) { o.timeline = 'By ' + m[1][0].toUpperCase() + m[1].slice(1); o.timeText = o.timeline.toLowerCase(); }
  else if (/\bnext month\b/.test(s)) o.timeline = 'Next month';
  else if (/\bthis year\b/.test(s)) o.timeline = 'This year';
  else if (/\b(flexible|no rush|no hurry|whenever)\b/.test(s)) o.timeline = 'Flexible';
  // budget (24 Oct): an amount with a currency or said as money (50k, 2 lakh), or right after a budget word ("budget is
  // around 60000", "up to 40000", "not more than 45000"), or any amount in a message about the budget. Never a count
  // ("200 employees", "150 stores"), a year ("my 2027 launch"), a product's price ("sell for 999 rupees"), a price the
  // visitor quotes back ("the price is 35k") or a conversion ("35000 rupees in dollars"). At the budget question (want)
  // any amount of 50 or more is the answer, the largest one ("30-40k").
  const ws = s.split(' '), money = /\b(budget|budgets|spend|spending|afford)\b/.test(s);
  let best = null;
  // ("what do I get for 35k", "is 35k fixed": questions about the starting price)
  if ((GETQ.test(s) || /\b(fixed|final|exact|confirm|correct|true)\b|\b(right|is not it|isnt it)$/.test(s)) && !money) return o;
  for (let i = 0; i < ws.length; i++) {
    if (!/^\d+$/.test(ws[i])) continue;
    const n = +ws[i], k = ws[i + 1] === '_k', j = i + (k ? 2 : 1);
    let cur = [ws[i - 1], ws[j]].find(w => CURW.test(w || '')), at = cur && cur === ws[j] ? j + 1 : j;
    const before = ws.slice(Math.max(0, i - 3), i).join(' ');
    // "35000 rupees in dollars", "what is 50k in dollars": a conversion; "I can pay 40k in rupees": its currency (25 Oct)
    if (/^(in|to|into)$/.test(ws[at] || '') && CURW.test(ws[at + 1] || '')) {
      if (cur || /\b(what|whats|how_much|convert|converted|conversion)\b/.test(before)) continue;
      cur = ws[at + 1]; at += 2;
    }
    const after = ws[at] || '';
    if (NOUN.test(after) || (QUOTED.test(ws.slice(at, at + 6).join(' ')) && !/\b(budget|spend|afford)\b/.test(before))) continue;
    if (/\b(sell|sells|selling|sold|priced|mrp|worth|price|prices|cost|costs|charge|charges|quote|quoted|told|said|says|mentions|mentioned|shows|showed|lists|listed|states|stated|rate|rates|revenue|turnover|sales|profit|income|salary|valuation|funding|raised|loan)\b/.test(before) && !/\b(budget|spend|afford)\b/.test(before)) continue;
    const pay = /\bpay(ing)?(?: you| u)?$/.test(before);
    if ((pay && PAYQ.test(s)) || RATE.test(ws.slice(at, at + 2).join(' ')) || /\b(make|makes|made|earn|earns|earned|generate|generates|generated|clock|clocks)(?: (around|about|roughly|over|nearly|almost|approx))?$/.test(before)) continue;
    // (a year: "my 2027 launch"; not at the budget question, where "2000" from a dollar or dirham visitor is the answer)
    if (!cur && !k && n >= 1900 && n <= 2100 && want !== 'budget' && !/\b(budget|spend|afford|upto|up to|max|maximum)\b/.test(before)) continue;
    const near = /\b(budget|budgets|spend|spending|afford|upto|up to|max|maximum|within|under|below|than)\b/.test(before) || pay;
    const weak = /\b(around|about|approx|approximately|roughly|only|just)\b/.test(before) && n >= 1000;
    // ("can you do a website for 30000": the sum it is wanted for; not "an app for 100 schools")
    const fr = ws[i - 1] === 'for' && /\b(do|make|build|design|create|develop|get)\b/.test(ws.slice(Math.max(0, i - 7), i).join(' ')) && /^(|only|please|total|max|maximum|budget|possible|right|ok|okay|or|and|is|can|could|would|will|then|all|flat|inclusive|including|with)$/.test(after);
    if (n < 50 || !(cur || k || near || weak || money || fr || want === 'budget')) continue;
    let code = cur ? cur.slice(1).toUpperCase() : active;
    if (code === 'DOL') code = ['USD', 'CAD', 'AUD', 'SGD'].includes(active) ? active : 'USD';
    const rate = code === 'INR' ? 1 : kb.pricing.rates[code];
    if (rate && (!best || (want === 'budget' && n > best.amount))) best = { amount: n, cur: code, inr: Math.round(n * rate / 1000) * 1000 || n * rate };
    if (best && want !== 'budget') break;
  }
  if (best) o.budget = best;
  return o;
};
// the answer to the question the chat is waiting on (a step of the intake), read before anything else (24 Oct): a bare
// number for pages / products / categories ("8", "five", "1000"), a timeline ("2 months"), any amount for the budget
const stepSlot = (step, raw, kb, active) => {
  const s = norm(raw), sl = slots(raw, s, kb, active, step), ws = s.split(' ').filter(Boolean);
  if (sl.personal) return null;
  // (a count: no currency or "k" next to it, and not a message about money)
  const cash = /\b(budget|spend|afford|price|cost)\b/.test(s), ns = ws.map((w, i) => (cash || CURW.test(ws[i - 1] || '') || CURW.test(ws[i + 1] || '') || ws[i + 1] === '_k' ? null : num(w)));
  const short = ws.length <= 6, cn = ns.filter(x => x != null && x > 0), n = cn.length ? Math.max(...cn) : 0;
  const few = /\b(a few|few|some|handful|couple)\b/.test(s);
  if (step === 'pages' && (sl.pages || (short && (n || few)))) return sl.pages ? { pages: sl.pages, pagesN: sl.pagesN } : n ? { pages: bucket(n, [1, 5, 10], PAGES), pagesN: n } : { pages: PAGES[1] };
  if (step === 'products') {
    if (sl.products) return { products: sl.products, productsN: sl.productsN };
    if (short && /\bhundreds\b/.test(s)) return { products: PRODUCTS[2] };
    if (short && /\bthousands\b/.test(s)) return { products: PRODUCTS[3] };
    if (short && (n || few)) return n ? { products: bucket(n, [19, 100, 500], PRODUCTS), productsN: n } : { products: PRODUCTS[0] };
  }
  if (step === 'categories' && (sl.categories || (short && (n || few)))) return { categories: sl.categories || (n ? bucket(n, [3, 10], CATS) : CATS[0]) };
  if (step === 'time') {
    if (sl.timeline) return { timeline: sl.timeline, timeText: sl.timeText };
    const t = short && /^(?:about |around |maybe )?(\d+|a|one|two|three|four|five|six|eight|twelve) (weeks?|months?)$/.exec(s);
    if (t) { const x = slots('', `in ${t[1]} ${t[2]}`, kb, active); return { timeline: x.timeline, timeText: x.timeText }; }
  }
  if (step === 'budget' && sl.budget) return { budget: sl.budget };
  return null;
};

// ---- analysis of one message
// a conversion: "35000 rupees in dollars", "what is 50k in euros" (25 Oct: not "40k in rupees", the amount's currency)
const CONV = new RegExp('\\b\\d+ (?:_k )?' + CU + ' (?:in|to|into) ' + CU + '|\\b' + CU + ' \\d+ (?:_k )?(?:in|to|into) ' + CU
  + '|\\b(?:what|whats|how_much|convert)(?: is| are| would be)? \\d+ (?:_k )?(?:in|to|into) ' + CU);
const analyze = (kb, raw) => {
  const P = prep(kb), s = norm(raw), ws = s.split(' ').filter(Boolean);
  // "150 stores across India", "our shops": places to visit, not an online store
  const cs = s.replace(/\b(\d+|many|several|our|physical|retail) (stores|shops)\b/g, '$1 outlets');
  const toks = ws.filter(w => !STOP.has(w) && w !== '_k').map(canon);
  const c = concepts(cs === s ? toks : cs.split(' ').filter(w => w && !STOP.has(w) && w !== '_k').map(canon)), ent = {};
  if (/\b(digital|saas|software|tech) products?\b|\bproducts? (design|designs|app|apps|platform|team)\b/.test(s)) c.add('SAAS');
  // project: the longest name that appears as a token run, or a one-word name of 6+ letters with one typo
  for (const n of P.names) {
    const k = n.w.length;
    for (let i = 0; i + k <= ws.length; i++) {
      if (n.w.every((w, j) => w === ws[i + j] || (k === 1 && w.length >= 6 && !P.vocab.has(ws[i]) && ws[i][0] === w[0] && dl(w, ws[i]) <= 1))) { ent.project = n.s; break; }
    }
    if (ent.project) break;
  }
  if (ent.project === 'one-piece' && !/\bpiece\b|\bluffy\b/.test(s)) delete ent.project;
  for (const w of ws) {
    if (P.place[w]) { ent.place = P.place[w]; break; }
    if (P.other.has(w)) { ent.place = ['?', w]; break; }
  }
  // the currency: the one asked for ("in euros", "35000 rupees in dollars"), else the first named. ask: the visitor asks
  // to see prices in it (the display switches, as with the switcher); conv: a conversion question
  const cm = /\b(?:in|into|to) _(inr|eur|gbp|usd|aed|cad|aud|sgd|dol)\b/.exec(s) || /\b_(inr|eur|gbp|usd|aed|cad|aud|sgd|dol)\b/.exec(s);
  if (cm) {
    ent.cur = cm[1].toUpperCase();
    if (/^(?:in|into|to) /.test(cm[0]) || /\b(show|change|switch|convert|display|see|use)\b/.test(s)
      || ws.every(w => CURW.test(w) || STOP.has(w) || /^(price|prices|currency|please|pls)$/.test(w))) ent.ask = 1;
    if (CONV.test(s)) ent.conv = 1;
  }
  if (/\b(yen|yuan|ruble|roubles?|francs?|kronas?|kroner|zloty|riyals?|naira|reais|pesos?)\b/.test(s)) ent.cur = '?';
  const ind = Object.keys(kb.lex.industry).find(w => new RegExp(`\\b${w}s?\\b`).test(s) || toks.includes(canon(w)));
  if (ind) ent.industry = ind;
  return { raw, s, ws, toks, c, ent };
};
// concept weights of a message (the service closest to a priced-on-scope question: "an interactive 3D experience for my
// brand" is 3D, not brand)
const weigh = toks => { const w = {}; toks.forEach(t => (CON[t] || []).forEach(k => (w[k] = (w[k] || 0) + 1))); return w; };

// ---- scoring (0..1 per intent): IDF-weighted Dice over the best phrase, key hits, entity, required / excluded concepts
const score = (kb, a) => {
  const P = prep(kb), idf = t => P.idf[t] || 2;
  const q = [...new Set(a.toks)];
  const out = P.ints.map(x => {
    let best = 0;
    for (const ph of x.ph) {
      let inter = 0, sp = 0, sq = 0;
      ph.forEach(t => { sp += idf(t); let b = 0; q.forEach(u => { b = Math.max(b, credit(t, u)); }); inter += b * idf(t); });
      q.forEach(u => { sq += idf(u); });
      best = Math.max(best, sp + sq ? 2 * inter / (sp + sq) : 0);
    }
    const hits = x.keys.filter(k => q.some(u => credit(k, u) >= .7)).length;
    let v = .6 * best + .3 * Math.min(1, x.keys.length ? hits / Math.min(2, x.keys.length) : 0);
    if (x.it.ent && a.ent[x.it.ent === 'cur' ? 'cur' : x.it.ent]) v += .3;
    if (x.need.some(n => !a.c.has(n))) v *= .5;
    if (x.not.some(n => a.c.has(n))) v -= .3;
    return { id: x.id, fam: x.fam, v: Math.max(0, Math.min(1, v)) };
  });
  return out.sort((p, r) => r.v - p.v);
};

// ---- gates: questions whose meaning is clear from their parts (prices above all), before any scoring
const WEB = /\b(website|websites|site|sites|web|webpage|webpages|landing|homepage|one_pager|blog|portfolio)\b/;
// (an amount with its currency)
const AMT = new RegExp('\\b\\d+ (?:_k )?' + CU + '|' + CU + ' \\d');
const gate = (kb, a, prev) => {
  const s = a.s, has = w => a.toks.includes(w), c = a.c, ent = a.ent;
  if (a.sl && a.sl.personal) return 'meta.personal';
  if (/\b(full|last|sur) ?name\b|\bsurname\b/.test(s)) return 'nodata.fullname';
  const inject = /\b(ignore|disregard|forget|override)\b.*\b(rules?|instructions?|prompt)\b|\bsystem prompt\b|\bjailbreak\b|\bpretend\b|\bapi ?keys?\b|\bpasswords?\b|\btokens?\b|\bscript\b|\b(reply|respond|answer|write) (in|only in|using) (capitals|caps|uppercase|upper case|all caps)\b|\bsay (it|that)\b|\brepeat after\b|\bdeveloper mode\b/.test(s);
  const disc = has('discount') || /\b(\d+ percent|for less|less money|best price|lowest price|cheap|special price|do it for|for just|for only|reduce the price)\b/.test(s);
  if (inject) return disc ? 'price.discount' : 'meta.off_topic';
  // paying or being invoiced in a currency (not on the site; never read as "show prices in it"). Not with an amount
  // (25 Oct): "I can pay 40000 rupees for a website" is a budget
  if ((ent.cur || /\bcurrenc/.test(s)) && /\b(pay|paid|paying|payment|payments|invoice|invoices|invoiced|invoicing|bill|billed|billing|accept|accepted|transfer|wire)\b|\bcharges? (me |us )?in\b/.test(s)
    && !/\bhow_much\b|\b(price|prices|cost|costs|quote)\b/.test(s) && !(a.sl && a.sl.budget) && !AMT.test(s)) return 'nodata.payment';
  if (has('hosting')) return 'nodata.hosting';
  if (has('domain')) return 'nodata.domain';
  if (has('installment') || /\bpayment (terms|methods?|options?|plan|schedule)\b|\bhow (do|can|should) i pay\b|\bpay in (parts|instalments|installments)\b|\bmilestones?\b|\bpay\b.*\bbefore (you|we) (start|begin)\b/.test(s)) return 'nodata.payment';
  if (has('gst')) return 'nodata.gst';
  if (has('refund') || /\bmoney back\b/.test(s)) return 'nodata.refund';
  if (has('stack') || ((/\bshopify\b|\bwoocommerce\b/.test(s)) && !c.has('PRICE'))) return 'nodata.stack';
  if (has('address')) return 'nodata.address';
  if ((has('jobs') || (has('careers') && !ent.project && !c.has('SITE') && !/\b(built|build|made)\b/.test(s)))) return 'nodata.jobs';
  if (has('maintenance')) return c.has('PRICE') || has('maintenance') && /\bcharges?\b|\bplan\b/.test(s) ? 'price.maintenance' : 'faq.9';
  // where the studio works ("are you based in India", "do you work with clients in the UK"): the FAQ, never a currency
  if (/\b(you|your|teseract|studio|gireesh)\b/.test(s) && !c.has('PRICE') && (/\b(based|located|situated|internationally|international|abroad|overseas|remote|remotely|worldwide|globally)\b/.test(s)
    || ((ent.place || /\boutside\b/.test(s)) && /\b(work|working|clients?|customers?|serve|available|deliver)\b/.test(s))
    // ("are you in the uk")
    || (ent.place && /\b(are|is) (you|your studio|the studio|teseract|gireesh) (in|from)\b/.test(s)))) return 'faq.1';
  // not on this website: results, rates of success; marketing and ads, copywriting - unless the message also asks about a
  // website, a store or a price (25 Oct: "landing page for google ads, how much" is a website price; a.also: the rest
  // of it goes to Gireesh with "Ask Gireesh")
  const mkt = /\b(social media|digital|performance|influencer|email|content|instagram|facebook|linkedin|youtube|whatsapp|online|video) marketing\b(?! (agency|agencies|company|companies|firm|business|website|site))|\b(google|facebook|instagram|meta|paid) ads\b|\b(ads?|marketing) campaigns?\b|\badvertising\b|\bppc\b|\bcopywriting\b|\b(write|writing|writes) (the |my |our )?(content|copy|text|blogs?)\b|\bcontent writing\b|\bmanag\w* (my|our) (instagram|facebook|linkedin|youtube|social media|socials)\b/.test(s);
  if ((/\bguarantee/.test(s) && !c.has('TIME')) || /\b(success|conversion|bounce|interest) rates?\b/.test(s)) return 'nodata.other';
  if (mkt) { if (!c.has('PRICE') && !((c.has('SITE') || c.has('ECOM') || WEB.test(s)) && /\b(build|builds|design|make|create|develop|need|want|looking)\b/.test(s))) return 'nodata.other'; a.also = 1; if (!c.has('PRICE') && /\blanding\b/.test(s)) return 'faq.6'; }
  if (/\bfree\b/.test(s) && /\b(consultation|consult|call|meeting|discovery|session|quote|estimate|first call)\b/.test(s)) return 'nodata.consult';
  // a few questions whose words mean something else on their own ("day" is a timeline, "person" is near "personal")
  if (/\blaunch day\b|\bday of (the )?launch\b|\bon launch\b/.test(s)) return 'process.step.8';
  if (/\b(only|one|single) (person|man|guy|designer|developer|member)\b|\bsolo\b|\balone\b|\bby (yourself|himself)\b|\b(just|only) (you|him|gireesh)\b|\bone man\b|\bfreelancers?\b/.test(s)) return 'about.team';
  // an amount asked about, not offered ("is ₹35,000 the minimum?", "is 50k the lowest for a store"): the price answer
  const ask = !(a.sl && a.sl.budget) && (AMT.test(s) || /\b\d+ _k\b|\b(said|says|quoted|mentioned) \d{4,}\b/.test(s)) &&/\b(minimum|starting|start|starts|begin|begins|lowest|least|base|entry|says|said|mentions|mentioned)\b/.test(s);
  if (disc && !(ask && !/\b(go|less|discount|negotiate|cheaper|reduce|lower|bargain|best)\b/.test(s))) return 'price.discount';
  if (/\bfree\b/.test(s) && !/\bfeel free\b|\bfree time\b|\bfreedom\b/.test(s)) return 'price.free';
  if (ent.conv) return 'price.currency';
  const get = GETQ.test(s);
  if ((c.has('INCLUDE') || get) && (c.has('PRICE') || /\b\d{4,}\b|\bstart(ing)?\b/.test(s))) return c.has('ECOM') ? 'price.ecommerce' : 'price.included';
  if (c.has('INCLUDE') && c.has('ECOM')) return 'svc.e-commerce';
  if (c.has('TIME') && !c.has('PRICE') && !ent.project) return 'time.timeline';
  if (ent.project && (c.has('PRICE') || c.has('BUDGET')) && !(a.sl && a.sl.budget)) return 'price.project';
  if (ask) return c.has('ECOM') ? 'price.ecommerce' : c.has('SITE') ? 'price.website' : 'price.general';
  if (a.sl && a.sl.budget && !c.has('INCLUDE') && !(c.has('PRICE') && (c.has('SITE') || c.has('ECOM')))) return 'price.budget';
  if (c.has('BUDGET') && !c.has('PRICE')) return 'price.discount';
  // a currency or a place with nothing else in the message: the currency (a place is only offered: 40-chat region rule)
  const rest = a.ws.filter(t => !STOP.has(t) && !/^_/.test(t) && !(kb._p.place[t] || kb._p.other.has(t)) && !/^(based|base|live|living|from|located|price|prices|currency|show|change|switch|country|convert|see|display|please|company|business|firm|startup|agency|team|do|us|we)$/.test(t));
  if ((ent.cur || ent.place) && !rest.length) return 'price.currency';
  if (c.has('PRICE')) {
    if (ent.project || (prev && prev.ent && prev.ent.project && a.toks.length <= 5 &&/\b(that|it|this|one|same)\b/.test(s))) return 'price.project';
    if (c.has('ECOM')) return 'price.ecommerce';
    // an app, AI, a brand, 3D or strategy has no starting price unless the visitor asks about a website for it
    const web = WEB.test(s) || (a.sl && a.sl.pages), special = c.has('SAAS') || c.has('AI') || c.has('BRAND') || c.has('THREE_D') || c.has('STRAT');
    if (special && !web) return 'price.product';
    if (c.has('SITE') || (a.sl && a.sl.pages)) return 'price.website';
    if (special) return 'price.product';
    return 'price.general';
  }
  if (ent.project) return 'project.' + ent.project;
  if (has('gireesh') && a.toks.every(t => /^(gireesh|who|founder|tell|about|person|guy|man)$/.test(t))) return 'about.founder';
  const other = concepts(a.toks.filter(t => t !== canon(ent.industry || '')));
  if (ent.industry && (other.has('WORK') || other.has('SITE') || other.has('ECOM') || /\b(any|have|done|experience|worked|build|built|example)\b/.test(s))) return 'work.industry';
  if (c.has('CALL') && /\b(book|call|schedule|talk|speak)\b/.test(a.ws.join(' ').replace(/\bcall\b/g, 'call')) && !/\bcan i call you\b/.test(s)) return 'contact.book';
  // "I need a website before Diwali, around 5 pages": a project in a sentence (its details go into the brief)
  if ((c.has('SITE') || c.has('ECOM')) && a.sl && (a.sl.pagesN > 1 || a.sl.products || a.sl.timeline || a.sl.budget)
    && /\b(i|we|my|our)\b/.test(s) && /\b(need|needs|want|wants|looking|planning|plan|would like|require)\b/.test(s) && !/^(do|can|could|will|would) you\b/.test(s)) return 'contact.start';
  return null;
};

// ---- decide: gate, else the best-scoring intent; "did you mean", then a sentence search, then the fallback
const match = (kb, raw, prev, active, step) => {
  const a = analyze(kb, raw);
  a.sl = slots(raw, a.s, kb, active || 'INR');
  let id = gate(kb, a, prev);
  if (id) return { kind: 'answer', id, a, v: 1 };
  const th = kb.th, list = score(kb, a);
  // a follow-up ("and e-commerce?", "what about an app?", "in euros?") borrows the last turn's question type (a price,
  // a timeline) and project: when it opens with and / what about / also, or is a word or two that nothing answers well
  // (not while the chat waits on a question of its own, step: a word or two there answers that question)
  const more = /^(and|what about|how about|also|plus|or|same for)\b/.test(a.s);
  const kind = prev && prev.c ? prev.c.filter(k => /^(PRICE|BUDGET|TIME)$/.test(k)) : [];
  if (kind.length && (more ? a.toks.length <= 6 : !step && a.toks.length <= 2 && list[0].v < th.answer)) {
    const b = Object.assign({}, a, { c: new Set([...a.c, ...kind]), ent: Object.assign({}, prev.ent || {}, a.ent) });
    id = gate(kb, b, prev);
    if (id) return { kind: 'answer', id, a: b, v: .6 };
  }
  const top = list[0], second = list.find(x => x.id !== top.id) || { v: 0 };
  if (top.v >= th.answer && (top.v - second.v >= th.margin || top.fam === second.fam)) return { kind: 'answer', id: top.id, a, v: top.v };
  if (top.v >= th.maybe) return { kind: 'maybe', ids: list.filter(x => x.v >= th.maybe * .8).slice(0, 3).map(x => x.id), a, v: top.v };
  const hits = search(kb, a);
  if (hits.length) return { kind: 'search', hits, a };
  return { kind: 'miss', a };
};

// ---- sentence search over the knowledge base's own text (BM25-lite), indexed on the first miss
const sentences = kb => {
  if (kb._s) return kb._s;
  const out = [], push = (text, page, url) => String(text || '').split(/(?<=[.?])\s+/).forEach(t => { if (t.length > 12) out.push({ text: t, page, url, toks: tokens(t) }); });
  kb.faq.forEach(f => push(f.a, kb.nav[''], kb.faq_url));
  kb.services.forEach(v => { push(v.title, kb.nav['what-we-create'], { r: 'what-we-create', f: v.id }); push(v.body, kb.nav['what-we-create'], { r: 'what-we-create', f: v.id }); });
  kb.process.steps.forEach((v, i) => [v.sub, v.body, v.end].forEach(t => push(t, kb.nav['our-approach'], { r: 'our-approach', f: 'ap-step-' + (i + 1) })));
  kb.founder.body.forEach(t => push(t, kb.nav['who-we-are'], kb.founder.url));
  kb.intents.forEach(it => (it.b || []).forEach(b => { if (b.t === 'p') { const f = (it.b.find(x => x.t === 'from') || {}); push(b.text, f.page, f.url); } }));
  kb.projects.forEach(p => { const n = out.length; push(p.sum, p.t, { r: 'projects/' + p.s, f: '' }); out.slice(n).forEach(x => (x.p = 1)); });
  const df = {};
  out.forEach(x => new Set(x.toks).forEach(t => (df[t] = (df[t] || 0) + 1)));
  const avg = out.reduce((n, x) => n + x.toks.length, 0) / (out.length || 1);
  return (kb._s = { out, df, avg, N: out.length });
};
// (24 Oct) words every page says don't make a match, and a project's summary needs the question to be about work
const GEN = new Set('website page project make build built create design develop work want need first new good like help business company digital experience studio teseract thing'.split(' ').map(canon));
const search = (kb, a) => {
  const S = sentences(kb), q = [...new Set(a.toks)].filter(t => S.df[t]), work = !!(a.ent.project || a.ent.industry || a.c.has('WORK'));
  if (q.filter(t => !GEN.has(t)).length < 2) return [];
  const res = S.out.map(x => {
    let v = 0, n = 0;
    q.forEach(t => {
      const f = x.toks.filter(u => u === t).length;
      if (!f) return;
      if (!GEN.has(t)) n++;
      v += Math.log(1 + (S.N - S.df[t] + .5) / (S.df[t] + .5)) * f * 2.2 / (f + 1.2 * (.25 + .75 * x.toks.length / S.avg));
    });
    return { x, v, n };
  }).filter(r => r.n >= 2 && r.v >= kb.th.search && (work || !r.x.p)).sort((p, r) => r.v - p.v);
  const seen = new Set();
  return res.filter(r => !seen.has(r.x.text) && seen.add(r.x.text)).slice(0, 2).map(r => r.x);
};

G.TSChatEngine = { norm, tokens, canon, stem, dl, credit, prep, analyze, slots, stepSlot, weigh, score, gate, match, search, detectCurrency, money, moneySr, group, PAGES, PRODUCTS, CATS };
})();
