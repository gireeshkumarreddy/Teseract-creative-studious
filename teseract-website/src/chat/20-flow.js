/* Ask TESERACT, part 2: the conversation. Turns the matcher's answer into bot turns (blocks + chips), runs the price
   intake (type, pages / products, needs, timeline, budget, region) and keeps the visitor's brief. No DOM: 30-ui.js
   renders. Prices: only {t:'price'} blocks and the {W} / {E} placeholders, filled from the knowledge base's
   config-derived amounts in the active currency when they are shown. Build spec, sections 3 and 6. */
(() => {
'use strict';
const G = globalThis, EN = G.TSChatEngine;
const STEPS = { W: ['pages', 'needs', 'time', 'budget', 'region'], L: ['needs', 'time', 'budget', 'region'],
  E: ['products', 'categories', 'store', 'time', 'budget', 'region'], S: ['service', 'time'], N: ['idea', 'time'] };
const MULTI = { needs: 'needs', store: 'store' };
const CURS = ['INR', 'EUR', 'GBP', 'USD', 'AED', 'CAD', 'AUD', 'SGD'];
const REGION = { India: 'INR', UK: 'GBP', Europe: 'EUR', US: 'USD', UAE: 'AED', Canada: 'CAD', Australia: 'AUD', Singapore: 'SGD' };
const BUILD = { W: 'Website Development', L: 'Website Development', E: 'E-commerce', N: 'Something else' };
const fill = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (o && o[k] != null ? o[k] : m));
const P = (text, src) => ({ t: 'p', text, src });

G.TSChatFlow = (C, env) => {
  // env: kb() -> knowledge base, cur() -> {code, unknown, near, chosen}, setCur(code, how), page, project (slug)
  // prev: the last answer's concepts and entity (a project page starts with its project: "how much was this site?")
  const st = { brief: { needs: [], store: [], questions: [] }, step: null, path: null, misses: 0, prev: env.project ? { c: [], ent: { project: env.project } } : null, noted: 0, q0: '' };
  const kb = () => env.kb();
  const chip = (k, a, extra) => ({ l: fill(C.chips[k] || k, extra), a: a || { k } });
  const chips = keys => keys.map(k => chip(k));
  const proj = s => kb().projects.find(p => p.s === s);
  const welcomeChips = () => chips([env.project ? 'like' : 'prices', 'create', 'process', 'work', 'founder', 'book']);
  const from = (r, f) => ({ t: 'from', page: kb().nav[r] || r, url: { r, f: f || '' } });

  // ---- prices: depends on scope first, then "starts from", then a call or a brief
  const curNote = () => {
    const c = env.cur();
    if (st.noted || c.code === 'INR' || c.chosen) return [];
    st.noted = 1;
    return [P(c.near ? C.cur_note_near : fill(C.cur_note, { cur_name: kb().pricing.cur[c.code].name }))];
  };
  const p0 = () => [P(C.p0[0]), { t: 'faq', i: 3, bare: 1 }, P(C.p0[1]), { t: 'list', items: C.factors_web, src: 'chat:factors_web' }];
  const ask = step => {
    st.step = step;
    if (MULTI[step]) st.multi = (st.brief[MULTI[step]] || []).slice();
    const q = { pages: 'q_pages', needs: 'q_needs', time: 'q_time', budget: 'q_budget', region: 'q_region', products: 'q_products',
      categories: 'q_categories', store: 'q_store', service: 'q_service', idea: 'q_idea' }[step];
    const opts = (C.choices[step === 'time' ? 'time' : step] || []).map(v => ({ l: v, a: MULTI[step] ? { m: v, s: step } : { v, s: step } }));
    if (MULTI[step]) opts.push({ l: C.chips.done, a: { d: step } });
    return { b: [P(C[q], 'chat:' + q)], c: opts, multi: !!MULTI[step] };
  };
  const answered = k => {
    const b = st.brief;
    return k === 'time' ? !!b.timeline : k === 'needs' ? !!b.needsDone : k === 'store' ? !!b.storeDone : k === 'budget' ? !!b.budget
      : k === 'region' ? !env.cur().unknown || !!b.regionDone : !!b[k];
  };
  const next = (lead) => {
    const k = (STEPS[st.path] || []).find(s => !answered(s));
    if (k) { const t = ask(k); t.b = (lead || []).concat(t.b); return [t]; }
    st.step = null;
    return [{ b: (lead || []).concat([P(C.summary), { t: 'brief' }, P(C.next_step)]), c: chips(['book', 'send_brief', 'ask_else']) }];
  };
  const priceTurn = (k, lead) => lead.concat([{ t: 'price', k }]).concat(curNote());
  const enter = (path, direct, a) => {
    const b = st.brief;
    st.path = path; b.type = path;
    if (path === 'L') { b.pages = 'One page'; b.pagesN = 1; }
    if (a) take(a.sl || {}, a);
    const lead = direct && (path === 'W' || path === 'L' || path === 'E') ? [{ t: 'faq', i: 3, bare: 1 }] : [];
    if (path === 'W' || path === 'L') {
      if (direct) lead.push(P(C.p0[1]), { t: 'list', items: C.factors_web, src: 'chat:factors_web' });
      return next(priceTurn('w', lead).concat(st.bq ? budgetReply() : [], [P(C.w_after)]));
    }
    if (path === 'E') {   // two turns (24 Oct): what the service includes, then the price and the first question
      const s = kb().services.find(v => v.id === 'e-commerce');
      return [{ b: lead.concat([P(C.e_intro), P(s.body, s.src + '.body'), { t: 'included' }]), c: [] }]
        .concat(next(priceTurn('e', []).concat(st.bq ? budgetReply() : [], [P(C.e_after)])));
    }
    if (path === 'S') {
      const svc = a && guessService(a);
      if (svc) b.service = svc;
      const lead2 = [P(C.s_intro)];
      if (svc) lead2.push({ t: 'service', id: serviceId(svc) });
      return next(lead2);
    }
    return next(kb().create.cta.map(t => P(t, 'CREATE.cta.lines')).concat([P(C.n_scale)]));
  };
  const SVC = { 'Product & SaaS': 'product-saas', 'AI & Automation': 'ai-automation', 'Interactive & 3D': 'interactive-3d',
    'Brand & Digital Identity': 'brand-digital-identity', 'Digital Strategy': 'digital-strategy' };
  const serviceId = name => SVC[name];
  // the service the question weighs most ("an interactive 3D experience for my brand" is 3D); ties in this order
  const GUESS = [['THREE_D', 'Interactive & 3D'], ['AI', 'AI & Automation'], ['SAAS', 'Product & SaaS'], ['BRAND', 'Brand & Digital Identity'], ['STRAT', 'Digital Strategy']];
  const guessService = a => {
    const w = EN.weigh(a.toks || []);
    a.c.forEach(k => { if (!w[k]) w[k] = .5; });   // (a concept found by phrase: "digital product")
    const best = GUESS.reduce((b, g) => ((w[g[0]] || 0) > (w[b[0]] || 0) ? g : b), GUESS[0]);
    return w[best[0]] ? best[1] : null;
  };

  // ---- slots typed in passing: fill the brief, say back what was understood
  const take = (sl, a) => {
    const b = st.brief, parts = [];
    if (sl.pages && (!b.pages || sl.pagesN > 1)) { b.pages = sl.pages; b.pagesN = sl.pagesN; parts.push(sl.pagesN > 1 ? `about ${sl.pagesN} pages` : sl.pages.toLowerCase()); }
    if (sl.products) { b.products = sl.products; b.productsN = sl.productsN; parts.push(sl.productsN ? `about ${sl.productsN} products` : sl.products.toLowerCase() + ' products'); }
    if (sl.categories) { b.categories = sl.categories; parts.push(sl.categories + ' categories'); }
    if (sl.timeline) { b.timeline = sl.timeline; parts.push('live ' + (sl.timeText || sl.timeline.toLowerCase())); }
    if (sl.budget) { b.budget = sl.budget; st.bq = 1; parts.push('budget {B}'); }
    if (a && a.c) {
      if (a.c.has('THREE_D') && !b.needs.includes('3D') && /3d/.test(a.s)) b.needs.push('3D');
      if (/\bmotion|animation|interactive/.test(a.s) && !b.needs.includes(C.choices.needs[0])) b.needs.push(C.choices.needs[0]);
      if (/\bcms\b/.test(a.s) && !b.needs.includes(C.choices.needs[2])) b.needs.push(C.choices.needs[2]);
    }
    return parts;
  };
  const echo = (parts, typeWord) => {
    if (typeWord) parts.unshift(typeWord);
    return parts.length >= 2 ? [{ t: 'echo', parts }] : [];
  };
  const budgetReply = () => {
    const b = st.brief, bu = b.budget;
    st.bq = 0;
    if (!bu || bu.text || bu.skip) return [];
    if (st.path === 'S') return [P(C.budget_s)];
    // compared in the visitor's own currency with the amount the chat shows (24 Oct: £430 for a store is not "below")
    const e = st.path === 'E', A = kb().pricing.amounts, k = e ? 'e' : 'w';
    if (A[bu.cur] ? bu.amount < A[bu.cur][k] : bu.inr < A.INR[k]) return [P(fill(C.budget_low, { Xs: e ? C.budget_low_e : C.budget_low_w, X: e ? '{E}' : '{W}' }))];
    return [P(C.budget_ok)];
  };

  // ---- one handler per intent the knowledge base answers with more than its own blocks
  const H = {
    'price.general': () => { st.step = 'type'; st.path = null; return [{ b: p0().concat([P(C.p0_ask)]), c: C.choices.type.map((v, i) => ({ l: v, a: { v: 'WLESN'[i], s: 'type' } })) }]; },
    'price.website': (a) => enter(a && a.sl && a.sl.pagesN === 1 && /landing|one_pager/.test(a.s) ? 'L' : 'W', true, a),
    'price.ecommerce': (a) => enter('E', true, a),
    'price.product': (a) => enter('S', true, a),
    'price.project': (a) => projectPrice(proj((a && a.ent.project) || (st.prev && st.prev.ent && st.prev.ent.project) || env.project)),
    'price.included': () => [{ b: [P(C.included_in_start)], c: chips(['prices', 'book']) }],
    'price.discount': (a) => { if (a && a.sl && a.sl.budget) st.brief.budget = a.sl.budget; return [{ b: [P(C.discount)], c: chips(['quote', 'book']) }]; },
    'price.free': () => [{ b: [P(C.free)], c: chips(['prices', 'book']) }],
    'price.budget': (a) => {
      st.brief.budget = a.sl.budget;
      st.bq = 1;
      const t = !st.path && (a.c.has('ECOM') ? 'E' : /landing|one_pager/.test(a.s) ? 'L' : a.c.has('SITE') ? 'W' : null);
      if (t) return enter(t, true, a);
      if (!st.path) { const t = H['price.general'](); t[0].b = [P(C.budget_s), P(C.p0_ask)]; return t; }
      return [{ b: budgetReply(), c: [] }].concat(st.step ? [ask(st.step)] : next());
    },
    'price.currency': (a) => currency(a),
    'price.maintenance': () => [{ b: [{ t: 'faq', i: 9 }, P(C.maintenance)], c: chips(['ask_gireesh', 'prices']) }],
    'time.timeline': () => [{ b: [P(C.timeline)], c: chips(['process', 'quote']) }],
    'svc.overview': () => [{ b: [P(kb().create.title, 'CREATE.hero.title'), { t: 'faq', i: 4 }],
      c: kb().services.map(s => ({ l: s.name, a: { i: 'svc.' + s.id } })) }],
    'work.overview': () => work('client', true),
    'work.filter.client': () => work('client'), 'work.filter.ecommerce': () => work('ecommerce'), 'work.filter.saas': () => work('saas'),
    'work.filter.concept': () => work('concept'), 'work.filter.personal': () => work('personal'), 'work.filter.all': () => work('all'),
    'work.industry': (a) => industry(a),
    'about.founder': () => [{ b: [{ t: 'founder' }], c: [{ l: C.chips.story, a: { u: { r: 'who-we-are', f: 'founder' } } }].concat(chips(['why', 'talk'])) }],
    'about.clients_count': () => {
      const cl = kb().projects.filter(p => p.k === 'client');
      return [{ b: [P(fill(C.clients_count, { n_client: cl.length, first: low(cl[0].i), another: low(cl[cl.length - 1].i) })), from('work', 'projects')], c: chips(['work']) }];
    },
    'contact.how': () => [{ b: [P(fill(C.contact, { email: kb().contact.email })), { t: 'email' }, { t: 'socials' }], c: chips(['book']) }],
    'contact.phone': () => [{ b: [P(C.phone), { t: 'email' }], c: chips(['book']) }],
    'contact.socials': () => [{ b: [{ t: 'socials' }], c: chips(['book', 'show_email']) }],
    'contact.email': () => [{ b: [{ t: 'email' }], c: chips(['book']) }],
    'contact.book': () => handoff('book'),
    // "I want to start", or a project told in a sentence ("a website before Diwali, around 5 pages": into the brief)
    'contact.start': (a) => {
      if (st.brief.type) { if (a && a.sl) take(a.sl, a); return next(); }
      const t = a && a.c && a.c.size ? (a.c.has('ECOM') ? 'E' : /landing|one_pager/.test(a.s) ? 'L' : a.c.has('SITE') ? 'W' : null) : null;
      return t ? enter(t, false, a) : H['price.general']();
    },
    'meta.hi': () => [{ b: [P(C.hi)], c: welcomeChips() }],
    'meta.thanks': () => [{ b: [P(C.thanks)], c: welcomeChips().slice(0, 4) }],
    'meta.bye': () => [{ b: [P(C.bye)], c: [] }],
    'meta.bot': () => [{ b: [P(C.bot)], c: chips(['ask_gireesh', 'prices']) }],
    'meta.chat_privacy': () => [{ b: [P(C.privacy_line), P(C.chat_privacy)], c: [] }],
    'meta.restart': () => [{ b: [P(C.restart_ask)], c: [{ l: C.choices.restart[0], a: { x: '@restart' } }, { l: C.choices.restart[1], a: { k: 'keep' } }] }],
    'meta.help': () => [{ b: [P(C.welcome[0])], c: welcomeChips() }],
    'meta.personal': () => [{ b: [P(C.personal)], c: [] }],
    'meta.off_topic': () => [{ b: [P(C.off_topic)], c: welcomeChips(), g: 'tilt' }],
    'nodata.address': () => [{ b: [{ t: 'faq', i: 1 }, P(C.nodata)], c: chips(['ask_gireesh', 'book']), g: 'tilt' }],
    // paying in a currency is not on the site; the displayed currency can still change (24 Oct)
    'nodata.payment': (a) => [{ b: [P(C.nodata)], c: chips(a && a.ent && a.ent.cur ? ['ask_gireesh', 'change_cur', 'prices'] : ['ask_gireesh', 'prices', 'back_start']), g: 'tilt' }],
    'nodata.consult': () => [{ b: [P(C.nodata)], c: chips(['ask_gireesh', 'book']), g: 'tilt' }],
  };
  const nodata = () => [{ b: [P(C.nodata)], c: chips(['ask_gireesh', 'prices', 'back_start']), g: 'tilt' }];
  // a project's name in a sentence (24 Oct): "ONE PIECE (Luffy)", and a personal project named after the founder by
  // what it is, "Gireesh's designer portfolio"; an industry in a sentence keeps its acronyms ("AI creative ...")
  const low = t => String(t).split(' ').map(w => (/[A-Z].*[A-Z]/.test(w) ? w : w.toLowerCase())).join(' ');
  const self = p => p.k === 'personal' && kb().founder && new RegExp('^' + kb().founder.name + '\\b', 'i').test(p.t);
  const pname = p => (self(p) ? `${kb().founder.name}'s ${low(p.i)}` : p.t.replace(/\s*\|\s*(.+)$/, ' ($1)'));

  // never a figure for the project itself; then, as every price answer, a quote through Gireesh (24 Oct: + Book a call).
  // A client store (p.e, or p.st: a store by its summary, Vynk) compares with the e-commerce start.
  const projectPrice = p => {
    if (!p) return H['price.general']();
    st.pent = { project: p.s };
    const n = pname(p), shop = p.e || p.st;
    let t;
    if (p.k === 'client') t = fill(C.pp_client, { project: n, industry: low(p.i), X: shop ? '{E}' : '{W}', factors: shop ? C.pp_factors_e : C.pp_factors_w });
    else if (p.k === 'personal') t = fill(self(p) ? C.pp_personal_self : C.pp_personal, { project: n });
    else t = fill(p.sa ? C.pp_saas : p.e ? C.pp_concept_e : C.pp_concept, { project: n });
    return [{ b: [P(t), P(C.s_close)], c: [{ l: C.chips.like, a: { x: '@like', p: p.s } }, { l: fill(C.chips.see_project, { project: n }), a: { u: { r: 'projects/' + p.s, f: '' } } }].concat(chips(['book', 'other_prices'])) }];
  };
  const FILTERS = { client: p => p.k === 'client', ecommerce: p => p.e, saas: p => p.sa, concept: p => p.k !== 'client', personal: p => p.k === 'personal', all: () => true };
  const work = (f, intro) => {
    const k = kb(), others = ['client', 'ecommerce', 'saas', 'concept', 'all'].filter(x => x !== f);
    const b = intro ? [P(k.work.title.join(' '), 'WORK.hero.title'), P(fill(C.work_count, { n_client: k.counts.client, n_other: k.counts.other }))] : [];
    b.push({ t: 'projects', filter: f }, from('work', 'projects'));
    return [{ b, c: others.map(x => ({ l: C.choices.filters[['client', 'ecommerce', 'saas', 'concept', 'all'].indexOf(x)], a: { i: 'work.filter.' + x } })) }];
  };
  const industry = a => {
    const w = a.ent.industry, hits = (kb().lex.industry[w] || []);
    if (hits.length) return [{ b: [{ t: 'projects', slugs: hits }, from('work', 'projects')], c: chips(['more_work', 'prices']) }];
    return [{ b: [P(w ? fill(C.no_industry, { word: w }) : C.no_industry_any), { t: 'faq', i: 7, sent: 2 }], c: chips(['work', 'prices']) }];
  };
  const currency = a => {
    const e = a.ent;
    let cur = e.cur, country = null;
    if (!cur && e.place) { cur = e.place[0]; country = e.place[1]; }
    const name = c => kb().pricing.cur[c].name;
    const back = st.step ? [ask(st.step)] : [];
    if (cur === '?' || (!cur && !e.place)) {
      if (cur === '?') return [{ b: [P(fill(C.cur_unsupported, { cur_name: name(env.cur().code) }))], c: curChips() }];
      return [{ b: [P(fill(C.cur_unsupported, { cur_name: '' }).split('. ')[0] + '.')], c: curChips() }];
    }
    if (cur === 'DOL') {
      const now = env.cur().code;
      if (['USD', 'CAD', 'AUD', 'SGD'].includes(now)) cur = now;
      else return [{ b: [P(C.cur_which)], c: C.choices.dollars.map((l, i) => ({ l, a: { cur: ['USD', 'CAD', 'AUD', 'SGD'][i] } })) }];
    }
    // a place the visitor names (24 Oct review, TP-01; awaiting the owner, LAUNCH-CHECKLIST 3h): it switches the
    // currency only when this device's region is unknown (as the chat's own "Where are you based?" does), else it is
    // offered as a chip. The owner's rule is the device, never an IP lookup.
    if (country) {
      const c = env.cur();
      if (c.unknown) { env.setCur(cur); st.brief.regionDone = 1; }
      if (c.unknown || (cur === c.code && !c.unknown)) return [{ b: [P(fill(C.cur_country, { cur_name: name(cur), country }))], c: [] }].concat(back);
      const t = [{ b: [P(fill(C.cur_offer, { cur_now: name(c.code), cur_name: name(cur) }))], c: [] }].concat(back);
      t[t.length - 1].c = (t[t.length - 1].c || []).concat(offer(cur));   // (only the last turn keeps its chips)
      return t;
    }
    env.setCur(cur);
    return [{ b: [P(fill(C.cur_switched, { cur_name: name(cur) }))], c: [] }].concat(back);
  };
  const offer = code => ({ l: fill(C.chips.show_cur, { cur_name: kb().pricing.cur[code].name }), a: { cur: code } });
  const curChips = () => CURS.map(c => ({ l: (kb().pricing.cur[c].sym.trim() === c ? c : kb().pricing.cur[c].sym.trim() + ' ' + c), a: { cur: c }, pressed: env.cur().code === c && !env.cur().unknown }));
  const handoff = mode => {
    const has = Object.keys(st.brief).some(k => !/^(needs|store|questions)$/.test(k) && st.brief[k]) || st.brief.questions.length;
    const card = has ? [{ t: 'brief' }] : [];
    const url = kb().contact.booking_url;
    if (mode === 'book' && url) return [{ b: [P(C.book_url)].concat(card, [{ t: 'handoff', mode: 'url' }]), c: [] }];
    if (mode === 'book') return [{ b: [P(C.book)].concat(card, [{ t: 'handoff', mode: 'book' }]), c: [] }];
    // (nothing to show yet: no "Here's what I'll put in the form:" over an empty brief)
    return [{ b: (has ? [P(C.send_lead)] : []).concat(card, [P(C.send_after), { t: 'handoff', mode: 'send' }]), c: [] }];
  };

  // ---- an intent's answer
  const answer = (id, a) => {
    if (H[id]) return H[id](a);
    if (/^nodata\./.test(id)) return nodata();
    if (/^project\./.test(id)) {
      const p = proj(id.slice(8));
      st.pent = { project: p.s };
      return [{ b: [{ t: 'project', s: p.s }], c: [{ l: C.chips.like, a: { x: '@like', p: p.s } }].concat(chips(['more_work'])) }];
    }
    const it = kb().intents.find(x => x.id === id);
    if (!it) return miss();
    return [{ b: (it.b || []).slice(), c: chips(it.c || []) }];
  };
  const miss = () => {
    st.misses++;
    if (st.misses >= 2) return [{ b: [P(C.miss2)], c: chips(['pass', 'show_email', 'keep']), g: 'tilt' }];
    return [{ b: [P(C.miss1)], c: chips(['prices', 'create', 'process', 'work', 'founder', 'ask_gireesh']), g: 'tilt' }];
  };

  // ---- a step's answer (chip or typed)
  const stepAnswer = (step, v) => {
    const b = st.brief;
    if (step === 'type') return enter(v, false);
    if (step === 'pages') b.pages = v;
    if (step === 'products') b.products = v;
    if (step === 'categories') b.categories = v;
    if (step === 'time') b.timeline = v;
    if (step === 'service') { b.service = v; return next([{ t: 'service', id: serviceId(v) }]); }
    if (step === 'idea') b.idea = String(v).slice(0, 600);
    if (step === 'budget') {
      b.budget = v === C.choices.budget[2] ? { skip: 1 } : typeof v === 'string' ? { text: v } : v;
      return next(budgetReply());
    }
    if (step === 'region') {
      if (REGION[v]) { env.setCur(REGION[v]); return next([P(fill(C.cur_country, { cur_name: kb().pricing.cur[REGION[v]].name, country: v === 'US' || v === 'UK' || v === 'UAE' ? 'the ' + v : v }))]); }
      b.regionDone = 1;
      return next();
    }
    return next();
  };
  const stepTyped = (text, m) => {
    const step = st.step, opts = step === 'type' ? C.choices.type : C.choices[step] || [];
    const n = EN.norm(text), r = step === 'region' ? n.replace(/^(i am |im |we are |based |i live |we live )?(in |from )?(the )?/, '') : n;
    const i = opts.findIndex(o => EN.norm(o) === r || (r.length > 3 && EN.norm(o).startsWith(r)));
    if (i >= 0 && !MULTI[step]) return stepAnswer(step, step === 'type' ? 'WLESN'[i] : opts[i]);
    const path = { W: 'price.website', L: 'price.website', E: 'price.ecommerce', S: 'price.product' }[st.path];
    const other = m.kind === 'answer' && m.id !== path && !/^price\.(budget|currency)$/.test(m.id);
    const sl = m.a.sl || {};
    if (step === 'type') {
      if (other && !/^(price\.|svc\.|faq\.[56]$)/.test(m.id)) return null;
      const c = m.a.c;
      const t = c.has('ECOM') ? 'E' : /landing|one_pager/.test(m.a.s) ? 'L' : c.has('SITE') ? 'W' : (c.has('SAAS') || c.has('AI') || c.has('BRAND') || c.has('THREE_D')) ? 'S' : /not sure|no idea|dont know|do not know/.test(n) ? 'N' : null;
      if (t) { const parts = take(sl, m.a); return [{ b: echo(parts, null), c: [] }].filter(x => x.b.length).concat(enter(t, false, m.a)); }
      return null;
    }
    if (step === 'idea' && !sl.personal) return stepAnswer('idea', text.trim());
    if (MULTI[step]) {
      const picked = opts.filter(o => { const w = EN.tokens(o).filter(x => x.length > 2); return w.some(x => m.a.toks.includes(x)); });
      if (picked.length) { st.brief[MULTI[step]] = picked; st.brief[step + 'Done'] = 1; return next(); }
    }
    // the answer to the question asked comes first (24 Oct): a bare "8", "five", "1000", "1 lakh", "2 months", or
    // "about 50 products" (never read as a product-design question), with anything else said in it ("8 pages by
    // December, budget 50k"). Not when the visitor asks another price ("how much is an online store?")
    if (!(other && /^price\.(website|ecommerce|product|project)$/.test(m.id) && m.a.c.has('PRICE'))) {
      const own = EN.stepSlot(step, text, kb(), env.cur().code), x = Object.assign({}, sl, own || {});
      if (own || x.pages || x.products || x.categories || x.timeline || x.budget) {
        const parts = take(x, m.a);
        if (x.budget) return [{ b: echo(parts).concat(budgetReply()), c: [] }].concat(next()).filter(t => t.b.length || t.c.length);
        return [{ b: echo(parts), c: [] }].filter(t => t.b.length).concat(next());
      }
    }
    // "how much is it?" in the middle of the intake: the price again, then the question that waits
    if (m.kind === 'answer' && m.id === 'price.general' && /^[WLE]$/.test(st.path || '')) return enter(st.path, false);
    // a clear question about something else is answered as asked (the step waits: "Back to my brief")
    if (other && !(MULTI[step] && /^svc\./.test(m.id))) return null;
    if (step === 'budget' && /not sure|no idea/.test(n)) return stepAnswer('budget', C.choices.budget[0]);
    if (step === 'region' && m.a.ent.place) return stepAnswer('region', Object.keys(REGION).find(k => REGION[k] === m.a.ent.place[0]) || 'else');
    // not understood while a question waits: say so, and ask it again (never a restart of the intake)
    if (m.kind === 'miss' || m.kind === 'search') { const t = ask(step); t.b = [P(C.miss1)].concat(t.b); return [t]; }
    return null;
  };

  // ---- the public face: one input (typed text or a chip) -> {user, turns}
  const ASK = /^(ask_gireesh|pass)$/;
  const input = (x) => {
    if (x.chip) return { user: x.chip.l, turns: chipTurns(x.chip) };
    const text = String(x.text || '').slice(0, 500);
    const m = EN.match(kb(), text, st.prev, env.cur().code, st.step);
    const e = m.a.ent, cur = env.cur();
    // "in dollars" with no dollar currency on: ask which dollars first
    if (m.kind === 'answer' && /^price\./.test(m.id) && e.cur === 'DOL' && e.ask && !/^(USD|CAD|AUD|SGD)$/.test(cur.code)) m.id = 'price.currency';
    let turns = null;
    if (st.step && m.a.sl && !m.a.sl.personal) turns = stepTyped(text, m);
    if (!turns) {
      if (m.kind === 'answer') {
        st.misses = 0;
        // the currency (24 Oct review, TP-01): it changes when the visitor asks to see prices in one ("in euros", "show
        // pounds"), or names a place on a device whose region is unknown (25 Oct, as SPEC 'currency'); else a currency
        // or a place named in passing is offered as a chip (the device's region stays, pending the owner: 3h)
        const lead = [], ok = c => c && c !== '?' && c !== 'DOL';
        let offerCur = null;
        if (m.id !== 'price.currency' && !/^nodata\./.test(m.id)) {   // ("can I pay in euros": not a display request)
          if (ok(e.cur) && e.ask) {
            if (e.cur !== cur.code || cur.unknown) { env.setCur(e.cur); lead.push(P(fill(C.cur_switched, { cur_name: kb().pricing.cur[e.cur].name }))); }
          } else if (cur.unknown && e.place && ok(e.place[0]) && m.id !== 'faq.1') {   // (not "do you work in the UK")
            env.setCur(e.place[0]); st.brief.regionDone = 1;
            lead.push(P(fill(C.cur_country, { cur_name: kb().pricing.cur[e.place[0]].name, country: e.place[1] })));
          } else {
            const c = ok(e.cur) ? e.cur : e.place && ok(e.place[0]) ? e.place[0] : null;
            if (c && (c !== cur.code || cur.unknown)) offerCur = c;
          }
        }
        const sl = m.a.sl;
        const said = /^price\.(website|ecommerce|budget)$|^contact\.start$/.test(m.id) && ((sl.pages ? 1 : 0) + (sl.products ? 1 : 0) + (sl.timeline ? 1 : 0) + (sl.budget ? 1 : 0)) >= 1;
        turns = answer(m.id, m.a);
        const typeWord = said ? { E: 'an online store', W: 'a website', L: 'a landing page' }[st.path] : null;   // (said back: "Got it: ...")
        if (typeWord) {
          const parts = [];
          const b = st.brief;
          if (sl.pagesN > 1) parts.push(`about ${sl.pagesN} pages`);
          if (sl.productsN) parts.push(`about ${sl.productsN} products`);
          if (sl.timeline) parts.push('live ' + (sl.timeText || sl.timeline.toLowerCase()));
          if (sl.budget) { b.budget = sl.budget; st.bq = 1; parts.push('budget {B}'); }
          const ec = echo(parts, typeWord);
          if (ec.length) turns[0].b = ec.concat(turns[0].b);
        }
        if (lead.length) turns[0].b = lead.concat(turns[0].b);
        const last = turns[turns.length - 1];
        if (offerCur && last && !last.multi && !(last.c || []).some(c => c.a && c.a.cur)) last.c = (last.c || []).slice(0, 7).concat(offer(offerCur));
        if (st.step && !/^price\.|^contact\.book|^meta\.restart/.test(m.id) && turns.length === 1 && !turns[0].c.some(c => c.a.k === 'back_brief')) turns[0].c = turns[0].c.slice(0, 5).concat(chip('back_brief'));
        // ads, marketing or copy asked with a website (25 Oct): the website part is answered, the rest offered to Gireesh
        if (m.a.also && !st.step && last && !last.multi && !(last.c || []).some(c => c.a && ASK.test(c.a.k || ''))) last.c = (last.c || []).slice(0, 7).concat(chip('ask_gireesh'));
        // a question the site can't answer goes with "Ask Gireesh" into the form (24 Oct: it was lost)
        if (m.a.also || turns.some(t => (t.c || []).some(c => c.a && ASK.test(c.a.k || '')))) st.q0 = text;
        st.prev = { c: [...m.a.c], ent: Object.assign({}, m.a.ent, st.pent || {}) };
        st.pent = null;
      } else if (m.kind === 'maybe') {
        st.q0 = text;
        const ids = m.ids.filter((v, i, l) => l.indexOf(v) === i).slice(0, 3);
        turns = [{ b: [P(C.maybe)], c: ids.map(id => ({ l: label(id), a: { i: id } })).concat(chip(st.step ? 'back_brief' : 'something_else')) }];
      } else if (m.kind === 'search') {
        st.q0 = text;
        turns = [{ b: [P(C.search)].concat(...m.hits.map(h => [{ t: 'quote', text: h.text }, { t: 'from', page: h.page, url: h.url }])), c: chips(['that_helps', 'ask_gireesh']) }];
      } else {
        st.q0 = text;
        turns = miss();
      }
    }
    return { user: text, turns };
  };
  const label = id => {
    const it = kb().intents.find(x => x.id === id);
    return (it && it.q) || id;
  };
  const chipTurns = c => {
    const a = c.a || {};
    if (a.s === 'type' || a.s) return stepAnswer(a.s, a.v);
    if (a.d) { st.brief[MULTI[a.d]] = (a.vals || []).filter(v => v !== C.choices[a.d][C.choices[a.d].length - 1]); st.brief[a.d + 'Done'] = 1; return next(); }
    if (a.cur) { env.setCur(a.cur); return [{ b: [P(fill(C.cur_switched, { cur_name: kb().pricing.cur[a.cur].name }))], c: [] }].concat(st.step ? [ask(st.step)] : []); }
    if (a.re) return [ask(a.re)];
    if (a.i) return answer(a.i, EN.analyze(kb(), ''));
    if (a.x === '@like' || a.k === 'like') {
      const p = proj(a.p || (st.prev && st.prev.ent && st.prev.ent.project) || env.project);
      if (p) st.brief.similar = pname(p);
      return enter(p && (p.e || p.st) ? 'E' : 'W', true);
    }
    const k = a.k, t = kb().chips[k];
    if (k === 'keep' || k === 'ask_else' || k === 'something_else') return [{ b: [P(C.else)], c: welcomeChips() }];
    if (k === 'back_brief') return st.step ? [ask(st.step)] : next();
    if (k === 'send_brief') return handoff('send');
    if (k === 'talk') return handoff('book');
    if (k === 'ask_gireesh' || k === 'pass') {
      if (st.q0 && !st.brief.questions.includes(st.q0)) st.brief.questions.push(st.q0);
      st.q0 = '';
      return handoff('send');
    }
    if (k === 'change_cur') return [{ b: [P(fill(C.cur_unsupported, { cur_name: '' }).split('. ')[0] + '.')], c: curChips() }];
    if (typeof t === 'string' && !t.startsWith('@')) return answer(t, EN.analyze(kb(), ''));
    return [];
  };

  // ---- the brief as text (the contact form's idea field, the copy button, the email)
  const briefRows = () => {
    const b = st.brief, r = C.brief_rows, rows = [], cur = env.cur();
    const add = (k, v) => { if (v) rows.push({ k, l: r[k], v }); };
    add('type', b.type && C.type_names[b.type]);
    add('service', b.service);
    add('pages', b.pagesN > 1 ? `About ${b.pagesN}` : b.pages);
    add('products', b.productsN ? `About ${b.productsN}` : b.products);
    add('categories', b.categories);
    add('needs', (b.needs || []).concat(b.store || []).join(', '));
    add('timeline', b.timeline);
    add('budget', b.budget && (b.budget.text || (b.budget.amount ? budgetText(b.budget) : '')));
    add('cur', b.type && b.type !== 'S' && kb().pricing.cur[cur.code].long);
    add('similar', b.similar);
    add('idea', b.idea);
    add('questions', (b.questions || []).join(' / '));
    return rows;
  };
  const budgetText = bu => {
    const k = kb(), own = EN.money(bu.amount, bu.cur, k);
    return bu.cur === 'INR' ? `about ${own}` : `about ${own} (${EN.money(bu.inr, 'INR', k)})`;
  };
  const briefText = () => {
    const T = C.idea_template, rows = briefRows();
    return [T.head].concat(rows.map(x => fill(T[x.k], { v: x.v }))).join('\n').slice(0, 2000);
  };
  const strip = () => {
    const b = st.brief, parts = [];
    if (b.type) parts.push(C.strip_names[b.type]);
    if (b.pages) parts.push(b.pagesN > 1 ? `${b.pagesN} pages` : b.pages === 'One page' ? 'one page' : `${b.pages} pages`);
    if (b.products) parts.push(`${b.products.toLowerCase()} products`);
    if (b.type && b.type !== 'S') parts.push(env.cur().code);
    return parts.join(' · ');
  };
  const prefill = () => {
    const b = st.brief, help = [];
    let build = BUILD[b.type] || (b.service || '');
    if (b.type === 'W' || b.type === 'L') help.push('Website Design', 'Website Development');
    if (b.type === 'E') help.push('E-commerce', 'Website Design');
    if ((b.needs || []).some(n => n === '3D' || n === C.choices.needs[0])) help.push('Interactive & 3D');
    if (b.type === 'S' && b.service) help.push(b.service);
    const bu = b.budget;
    const budget = !bu || bu.skip ? '' : bu.text ? bu.text : budgetText(bu);
    return { v: 1, at: Date.now(), build, help, budget: budget.slice(0, 120), idea: briefText() };
  };
  const welcome = () => {
    const b = [P(C.welcome[0])];
    const p = env.project && proj(env.project);
    if (p) b.push(P(self(p) ? fill(C.welcome_self, { project: pname(p) }) : fill(C.welcome_project, { project: pname(p), industry: p.i, label_phrase: C.label_phrase[p.k] })));
    b.push(P(C.welcome[1]));
    return [{ b, c: welcomeChips() }];
  };
  return { st, input, welcome, briefRows, briefText, strip, prefill, budgetText, curChips, answer, ask };
};
})();
