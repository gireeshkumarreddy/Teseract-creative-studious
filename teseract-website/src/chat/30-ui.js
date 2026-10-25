/* Ask TESERACT, part 3: the chat window. A native <dialog> (focus trap, inert page, Esc), a bottom sheet on phones
   (keyboard-safe through visualViewport, Back closes it), a panel from 800 px. Visitor text is only ever set as
   textContent. The conversation lives in sessionStorage ('ts-cc'); nothing is sent anywhere: the hand-off fills the
   contact form, which the visitor sends. Loaded on demand by src/js/40-chat.js; window.TSChat = {open, close}. */
(() => {
'use strict';
if (typeof document === 'undefined') return;
const EN = window.TSChatEngine, CC = window.__CC || {}, C = CC.copy;
const dock = document.querySelector('[data-cc]');
if (!dock || !C || window.TSChat) return;
const TS = window.TS || {}, root = document.documentElement, D = dock.dataset;
const launch = dock.querySelector('[data-cc-launch]');
const NS = dock.querySelector('svg').namespaceURI;   // the launcher's own shards are SVG
const fill = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (o && o[k] != null ? o[k] : m));
const S = {
  get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); return true; } catch (e) { return false; } },
  del: k => { try { sessionStorage.removeItem(k); } catch (e) { /* blocked */ } },
};
const stored = S.set('ts-cc-test', '1') && (S.del('ts-cc-test'), true);
const reduced = () => !(TS.motion ? TS.motion() : !matchMedia('(prefers-reduced-motion: reduce)').matches);
const coarse = () => matchMedia('(pointer: coarse)').matches;
const phone = () => matchMedia('(max-width: 799.98px)').matches;
const el = (tag, cls, text, attrs) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  if (attrs) Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
  return n;
};
// a link to a route of this site, exactly as the build writes them (lib.Ctx.url)
const href = u => {
  const idx = D.ccIndex === '1', r = (u && u.r) || '';
  return D.ccBase + (r ? r + (idx ? '/index.html' : '/') : (idx ? 'index.html' : '')) + (u && u.f ? '#' + u.f : '');
};

// ---- the logo mark as four shards (chrome_intro._mark(), embedded by build.py)
const mark = cls => {
  const m = el('span', 'cc-mk ' + (cls || ''), null, { 'aria-hidden': 'true' });
  ['c', 'l', 'r', 'b'].forEach(k => {
    const s = CC.mark[k], n = s.n.split(','), sh = el('span', 'cc-sh cc-sh--' + k);
    sh.style.cssText = `--o:${s.o};--nx:${k === 'c' ? 0 : n[0]};--ny:${k === 'c' ? 0 : n[1]}`;
    const svg = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('focusable', 'false'); p.setAttribute('d', s.d);
    svg.appendChild(p); sh.appendChild(svg); m.appendChild(sh);
  });
  return m;
};
const icon = d => {
  const svg = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  p.setAttribute('d', d); svg.appendChild(p);
  return svg;
};
const I = { close: 'M6 6l12 12M18 6 6 18', send: 'M5 12h13M13 6l6 6-6 6', restart: 'M5 12a7 7 0 1 0 2.1-5M5 4v4h4', check: 'm6 12.5 4 4 8-9', down: 'M12 5v13M6 12l6 6 6-6' };

// ---- knowledge base: fetched on open, once (the only request the chat makes, to this website)
let kb = null, kbP = null;
const loadKb = () => kbP || (kbP = fetch(D.ccKb, { credentials: 'same-origin', cache: 'force-cache' })
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(j => { kb = j; EN.prep(kb); det = EN.detectCurrency(tz(), navigator.languages || [navigator.language], kb); return kb; })
  .catch(e => { kbP = null; throw e; }));
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } };
let det = null;
let chosen = S.get('ts-cc-cur');
const cur = () => chosen ? { code: chosen, chosen: 1 } : det || { code: 'INR', unknown: 1 };
const flow = window.TSChatFlow(C, {
  kb: () => kb, cur, page: D.ccPage, project: D.ccProject || '',
  setCur: code => { chosen = code; S.set('ts-cc-cur', code); rerender(); },
});

// ---- state: transcript (at most 60 turns) + the flow's brief, in this tab only
let turns = [];
const save = () => { turns = turns.slice(-60); S.set('ts-cc', JSON.stringify({ v: 1, turns, st: flow.st })); };
const restore = () => {
  try {
    const j = JSON.parse(S.get('ts-cc') || 'null');
    if (j && j.v === 1) { turns = j.turns || []; Object.assign(flow.st, j.st || {}); }
  } catch (e) { turns = []; }
};
restore();

// ---- money in the active currency ({W} {E} {W_inr} {E_inr} {B})
const prices = () => {
  const c = cur(), A = kb.pricing.amounts, m = (n, k) => EN.money(n, k, kb);
  const one = k => c.unknown ? `${m(A.INR[k], 'INR')} (${C.about} ${m(A.USD[k], 'USD')})` : c.code === 'INR' ? m(A.INR[k], 'INR') : `${C.about} ${m(A[c.code][k], c.code)}`;
  const bu = flow.st.brief.budget;
  return { W: one('w'), E: one('e'), W_inr: m(A.INR.w, 'INR'), E_inr: m(A.INR.e, 'INR'), B: bu && bu.amount ? flow.budgetText(bu) : '',
    email: kb.contact.email, rates_month: kb.pricing.month };
};
const T = t => kb ? fill(t, prices()) : t;

// ---- the window
let dlg, panel, log, live, input, sendBtn, title, ava, stripBtn, briefBox, more, moreTo = null, opener = null, pushed = false, open = false, busy = false;
const build = () => {
  dlg = el('dialog', 'cc-dlg', null, { id: 'cc-dialog', 'aria-labelledby': 'cc-title', 'aria-describedby': 'cc-desc', 'data-lenis-prevent': '' });
  panel = el('div', 'cc-panel');
  const head = el('header', 'cc-head');
  ava = el('span', 'cc-ava');
  ava.appendChild(mark('cc-ava__mk'));
  const img = el('img', 'cc-ava__img', null, { alt: '', width: '40', height: '40', decoding: 'async', src: D.ccAva, srcset: `${D.ccAva} 96w, ${D.ccAva2} 192w`, sizes: '40px' });
  img.addEventListener('load', () => ava.classList.add('is-3d'));
  ava.appendChild(img);
  const txt = el('div', 'cc-head__txt');
  title = el('h2', 'cc-title', null, { id: 'cc-title', tabindex: '-1' });
  title.appendChild(el('strong', null, C.title));
  const desc = el('p', 'cc-desc', null, { id: 'cc-desc' });
  desc.append(el('i', 'cc-desc__dot', null, { 'aria-hidden': 'true' }), C.status);
  txt.append(title, desc);
  const restart = el('button', 'cc-hbtn', null, { type: 'button', 'aria-label': C.restart });
  restart.appendChild(icon(I.restart));
  restart.addEventListener('click', () => run({ i: 'meta.restart' }, C.restart));
  const close = el('button', 'cc-hbtn', null, { type: 'button', 'aria-label': C.close });
  close.appendChild(icon(I.close));
  close.addEventListener('click', () => hide());
  head.append(el('span', 'cc-grab', null, { 'aria-hidden': 'true' }), ava, txt, restart, close);
  const strip = el('div', 'cc-strip');
  stripBtn = el('button', 'cc-strip__btn', null, { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'cc-brief' });
  briefBox = el('div', 'cc-brief', null, { id: 'cc-brief' });
  briefBox.hidden = true;
  stripBtn.addEventListener('click', () => { const o = stripBtn.getAttribute('aria-expanded') !== 'true'; stripBtn.setAttribute('aria-expanded', String(o)); briefBox.hidden = !o; });
  strip.append(stripBtn, briefBox);
  log = el('ol', 'cc-log', null, { 'aria-label': 'Conversation' });
  live = el('div', 'sr-only', null, { 'aria-live': 'polite', 'aria-atomic': 'true' });
  const form = el('form', 'cc-compose');
  const lab = el('label', 'sr-only', C.input_label, { for: 'cc-in' });
  input = el('textarea', 'cc-in', null, { id: 'cc-in', rows: '1', maxlength: '500', enterkeyhint: 'send', autocapitalize: 'sentences', autocomplete: 'off', placeholder: C.placeholder });
  sendBtn = el('button', 'cc-send', null, { type: 'submit', 'aria-label': C.send });
  sendBtn.appendChild(icon(I.send));
  sendBtn.disabled = true;
  const priv = el('p', 'cc-priv', C.privacy_line);
  const row = el('div', 'cc-compose__row');
  row.append(input, sendBtn);
  form.append(lab, row, priv);
  input.addEventListener('input', () => { sendBtn.disabled = !input.value.trim(); size(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : submit(e); }
  });
  const submit = e => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ''; sendBtn.disabled = true; size(); say(v); };
  form.addEventListener('submit', submit);
  // "More below" (25 Oct): a long answer shows from its start; the rest of its batch waits below this cue
  more = el('div', 'cc-more');
  more.hidden = true;
  const mb = el('button', 'cc-chip', C.more_below, { type: 'button' });
  mb.prepend(icon(I.down));
  mb.addEventListener('click', onMore);
  more.appendChild(mb);
  log.addEventListener('scroll', () => { if (!more.hidden && atBottom()) noMore(); }, { passive: true });
  panel.append(head, strip, log, more, live, form);
  dlg.appendChild(panel);
  document.body.appendChild(dlg);
  // close: Esc ('cancel'), the backdrop, Back on phones, a drag down on the header
  dlg.addEventListener('cancel', e => { e.preventDefault(); const set = log.querySelector('.cc-chips.is-cur'); if (set && set.contains(document.activeElement)) { set.remove(); input.focus(); return; } hide(); });
  dlg.addEventListener('close', () => { if (open) finish(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) hide(); });
  dlg.addEventListener('click', e => {        // internal links: close at once, then the page transition runs
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || /^mailto:/.test(a.getAttribute('href'))) return;
    hide(true);
  }, true);
  drag(head);
};
const size = () => { input.style.height = 'auto'; if (input.value) input.style.height = Math.min(input.scrollHeight, 4 * 22 + 20) + 'px'; };

// ---- rendering
const fromLink = (page, u) => { const p = el('p', 'cc-from'); p.appendChild(el('a', null, fill(C.from, { page }), { href: href(u) })); return p; };
const bubble = (text, cls) => el('p', 'cc-bub' + (cls ? ' ' + cls : ''), text);
const micro = t => el('p', 'cc-micro', t);
const pill = p => { const s = el('span', 'cc-lab cc-lab--' + p.k); s.append(el('i', null, null, { 'aria-hidden': 'true' }), kb.labels[p.k]); return s; };
const projCard = (p, full) => {
  const a = el('a', 'cc-proj' + (full ? ' cc-proj--full' : ''), null, { href: href({ r: 'projects/' + p.s }) });
  a.appendChild(el('img', null, null, { src: D.ccBase + kb.media + p.th, alt: '', loading: 'lazy', decoding: 'async', width: '480', height: '300' }));
  const b = el('span', 'cc-proj__txt');
  b.append(el('strong', null, p.t), el('span', 'cc-proj__ind', p.i), pill(p));
  if (full && p.n) b.appendChild(el('span', 'cc-proj__note', p.n));
  a.appendChild(b);
  return a;
};
const priceCard = k => {
  const c = cur(), A = kb.pricing.amounts, card = el('div', 'cc-card cc-price');
  card.appendChild(micro(k === 'w' ? C.price_label_w : C.price_label_e));
  const code = c.unknown ? 'INR' : c.code, n = A[code][k];
  const fig = el('p', 'cc-fig');
  if (code !== 'INR') fig.appendChild(el('span', 'cc-fig__about', C.about, { 'aria-hidden': 'true' }));
  fig.appendChild(el('span', 'cc-fig__n', EN.money(n, code, kb), { 'aria-hidden': 'true' }));
  const sr = code === 'INR' ? EN.moneySr(n, 'INR', kb) : `${C.about} ${EN.group(n, code)} ${kb.pricing.cur[code].name}, converted from ${EN.moneySr(A.INR[k], 'INR', kb)}`;
  fig.appendChild(el('span', 'sr-only', sr));
  card.appendChild(fig);
  if (c.unknown) card.appendChild(el('p', 'cc-alt', `${C.about} ${EN.money(A.USD[k], 'USD', kb)}`));
  const sub = c.unknown ? C.price_sub_unknown : code === 'INR' ? C.price_sub_inr : fill(C.price_sub_cur, { X_inr: EN.money(A.INR[k], 'INR', kb), rates_month: kb.pricing.month });
  card.appendChild(el('p', 'cc-sub', sub));
  const sw = el('button', 'cc-linkbtn', C.chips.change_cur, { type: 'button' });
  sw.addEventListener('click', () => run({ k: 'change_cur' }, C.chips.change_cur));
  card.appendChild(sw);
  return card;
};
const R = {
  p: b => bubble(T(b.text)),
  c: b => bubble(T(C[b.k])),
  echo: b => bubble(T(fill(C.echo, { parts: b.parts.join(', ') }))),
  quote: b => bubble(b.text, 'cc-bub--quote'),
  list: b => { const w = el('div', 'cc-bub'), u = el('ul', 'cc-list'); b.items.forEach(t => u.appendChild(el('li', null, T(t)))); w.appendChild(u); return w; },
  from: b => fromLink(b.page, b.url),
  faq: b => { const f = kb.faq[b.i]; let a = f.a; if (b.sent != null) a = a.split(/(?<=[.?])\s+/)[b.sent] || a; return [bubble(a), fromLink(kb.nav[''], kb.faq_url)]; },
  price: b => priceCard(b.k),
  included: () => {
    const s = kb.services.find(v => v.id === 'e-commerce'), card = el('div', 'cc-card cc-inc');
    card.appendChild(micro(C.included_label));
    const u = el('ul', 'cc-check');
    s.tags.forEach(t => { const li = el('li'); li.append(icon(I.check), t); u.appendChild(li); });
    card.append(u, el('p', 'cc-sub', kb.faq[8].a.split(/(?<=\.)\s+/)[0]), el('p', 'cc-micro', C.included_work));
    const strip = el('div', 'cc-strip-p');
    kb.projects.filter(p => p.e).forEach(p => strip.appendChild(projCard(p)));
    card.append(strip, fromLink(kb.nav['what-we-create'], { r: 'what-we-create', f: 'e-commerce' }));
    return card;
  },
  service: b => {
    const s = kb.services.find(v => v.id === b.id), card = el('div', 'cc-card cc-svc');
    card.append(micro(`${s.n} · ${s.name}`), el('p', 'cc-card__t', s.title));
    if (s.body) card.appendChild(el('p', 'cc-card__b', s.body));
    card.appendChild(micro(C.service_includes));
    const u = el('ul', 'cc-tags');
    s.tags.forEach(t => u.appendChild(el('li', null, t)));
    card.append(u, fromLink(kb.nav['what-we-create'], { r: 'what-we-create', f: s.id }));
    return card;
  },
  stepper: () => {
    const o = el('ol', 'cc-card cc-steps');
    kb.process.steps.forEach((s, i) => {
      const li = el('li'), d = el('details'), sm = el('summary');
      sm.append(el('span', 'cc-steps__n', s.n, { 'aria-hidden': 'true' }), el('strong', null, s.name), ` · ${s.sub}`);
      d.appendChild(sm);
      d.appendChild(stepBody(s, i));
      li.appendChild(d); o.appendChild(li);
    });
    return o;
  },
  step: b => { const s = kb.process.steps[b.i], card = el('div', 'cc-card'); card.append(micro(`${s.n} · ${s.name}`), el('p', 'cc-card__t', s.sub), stepBody(s, b.i)); return card; },
  founder: () => {
    const f = kb.founder, card = el('div', 'cc-card cc-fdr');
    card.append(micro(f.label), el('p', 'cc-card__t', f.name), el('p', 'cc-sub', f.roles.join(' · ')));
    const u = el('ul', 'cc-plain');
    f.journey.forEach(t => u.appendChild(el('li', null, t)));
    card.append(u, el('p', 'cc-card__b', f.body[0]), el('blockquote', 'cc-q', f.quote), fromLink(kb.nav['who-we-are'], f.url));
    return card;
  },
  projects: b => {
    const s = el('div', 'cc-strip-p cc-strip-p--big');
    projList(b).forEach(p => s.appendChild(projCard(p)));
    return s;
  },
  project: b => {
    const p = kb.projects.find(x => x.s === b.s), w = el('div', 'cc-card cc-pcard');
    w.appendChild(projCard(p, true));
    if (p.sum) w.appendChild(el('p', 'cc-card__b', p.sum));
    w.append(el('a', 'cc-linkbtn', C.chips.view, { href: href({ r: 'projects/' + p.s }) }), fromLink(kb.nav.work, { r: 'work', f: 'wk-t-' + p.s }));
    return w;
  },
  email: () => emailBlock(),
  socials: () => {
    const u = el('ul', 'cc-socials');
    kb.contact.socials.forEach(s => { const li = el('li'); li.appendChild(el('a', 'cc-chip', s.label, { href: s.url, target: '_blank', rel: 'noopener', 'aria-label': `${s.label} ${C.new_tab}` })); u.appendChild(li); });
    return u;
  },
  brief: () => {
    const card = el('div', 'cc-card cc-briefc');
    card.appendChild(micro(C.brief_title));
    card.appendChild(briefRows());
    return card;
  },
  handoff: b => {
    const w = el('div', 'cc-hand');
    if (b.mode === 'url') {
      w.appendChild(el('a', 'cc-cta', `${C.chips.pick_time} ${C.new_tab}`, { href: kb.contact.booking_url, target: '_blank', rel: 'noopener' }));
      w.appendChild(actBtn(C.chips.copy_brief, copyBrief));
      w.appendChild(actBtn(C.chips.by_form, handoff));
      return w;
    }
    const cta = el('button', 'cc-cta', null, { type: 'button' });
    const lead = el('span', 'cc-cta__lead', null, { 'aria-hidden': 'true' });
    lead.append(mark('cc-cta__mk'), el('span', 'cc-cta__plus', '+'), el('span', 'cc-cta__you', C.you));
    cta.append(lead, el('span', null, b.mode === 'send' ? C.chips.open_form_short : C.chips.open_form));
    cta.addEventListener('click', handoff);
    w.appendChild(cta);
    w.appendChild(actBtn(C.chips.copy_brief, copyBrief));
    if (!stored) w.appendChild(mailLink(C.chips.email_instead, true));
    if (b.mode === 'book') w.appendChild(emailBlock(true));
    return w;
  },
};
const FILTER = { client: p => p.k === 'client', ecommerce: p => p.e, saas: p => p.sa, concept: p => p.k !== 'client', personal: p => p.k === 'personal', all: () => true };
const projList = b => (b.slugs ? kb.projects.filter(p => b.slugs.includes(p.s)) : kb.projects.filter(FILTER[b.filter]));
const stepBody = (s, i) => {
  const w = el('div', 'cc-step');
  if (s.body) w.appendChild(el('p', null, s.body));
  if (s.list_intro) w.appendChild(el('p', null, s.list_intro));
  if (s.list) { const u = el('ul', 'cc-plain'); s.list.forEach(t => u.appendChild(el('li', null, t))); w.appendChild(u); }
  if (s.ask) w.appendChild(el('p', null, s.ask.join(' ')));
  if (s.end) w.appendChild(el('p', null, s.end));
  w.appendChild(fromLink(kb.nav['our-approach'], { r: 'our-approach', f: 'ap-step-' + (i + 1) }));
  return w;
};
const actBtn = (t, fn) => { const b = el('button', 'cc-chip', t, { type: 'button' }); b.addEventListener('click', fn); return b; };
const mailLink = (t, brief) => el('a', 'cc-chip', t, { href: `mailto:${kb.contact.email}` + (brief ? `?subject=${encodeURIComponent(C.email_subject)}&body=${encodeURIComponent(flow.briefText())}` : '') });
const emailBlock = (or) => {
  const w = el('div', 'cc-mail'), e = kb.contact.email, p = el('p', or ? 'cc-sub' : 'cc-mail__addr');
  if (or) p.append(fill(C.or_write, { email: '' }));
  p.appendChild(el('a', null, e, { href: 'mailto:' + e }));
  w.append(p, actBtn(C.copy, () => copy(e)));
  return w;
};
const briefRows = () => {
  const u = el('ul', 'cc-rows');
  flow.briefRows().forEach(r => {
    const li = el('li');
    const step = { type: 'type', pages: 'pages', products: 'products', categories: 'categories', needs: flow.st.path === 'E' ? 'store' : 'needs', timeline: 'time', budget: 'budget', cur: 'cur', idea: 'idea', service: 'service' }[r.k];
    if (step) {
      const b = el('button', 'cc-row', null, { type: 'button', 'aria-label': `${r.l}: ${r.v}, ${C.change}` });
      b.append(el('span', 'cc-row__l', r.l), el('span', 'cc-row__v', r.v));
      b.addEventListener('click', () => step === 'cur' ? run({ k: 'change_cur' }, C.chips.change_cur) : step === 'type' ? run({ i: 'price.general' }, r.l) : rerun(step, r.l));
      li.appendChild(b);
    } else li.append(el('span', 'cc-row__l', r.l), el('span', 'cc-row__v', r.v));
    u.appendChild(li);
  });
  return u;
};
const rerun = (step, l) => {
  if (step === 'needs' || step === 'store') flow.st.brief[step + 'Done'] = 0;
  push({ who: 'u', text: l });
  bot([flow.ask(step)]);
};

const turnEl = (t, i, last) => {
  const li = el('li', 'cc-turn cc-turn--' + t.who);
  if (t.who === 'u') { li.append(bubble(t.text, 'cc-bub--u'), el('span', 'cc-you', C.you, { 'aria-hidden': 'true' })); return li; }
  const body = el('div', 'cc-turn__b');
  t.b.forEach((b, j) => {
    let n = R[b.t] ? R[b.t](b) : null;
    if (!n) return;
    (Array.isArray(n) ? n : [n]).forEach(x => { x.style.setProperty('--i', j); body.appendChild(x); });
  });
  li.append(mark('cc-tava'), body);
  return li;
};
const chipsEl = (t) => {
  const g = el('div', 'cc-chips' + (t.c.every(c => c.a && c.a.cur) ? ' is-cur' : ''), null, { role: 'group', 'aria-label': 'Suggested replies' });
  const multi = new Set(t.multi ? (flow.st.multi || []) : []);
  t.c.slice(0, 9).forEach((c, j) => {
    const a = c.a || {}, k = a.k && kb && kb.chips[a.k];
    let b;
    if (a.u || (k && typeof k === 'object')) b = el('a', 'cc-chip', c.l, { href: href(a.u || k) });
    else {
      b = el('button', 'cc-chip', c.l, { type: 'button' });
      if (a.m) { b.setAttribute('aria-pressed', String(multi.has(a.m))); b.prepend(icon(I.check)); }
      if (a.cur && 'pressed' in c) b.setAttribute('aria-pressed', String(!!c.pressed));   // (the switcher; not an offer)
      b.addEventListener('click', () => {
        if (a.m) {
          const none = /^(None of these|Not sure yet)$/.test(a.m);
          if (multi.has(a.m)) multi.delete(a.m); else { if (none) multi.clear(); else [...multi].forEach(v => /^(None of these|Not sure yet)$/.test(v) && multi.delete(v)); multi.add(a.m); }
          flow.st.multi = [...multi];
          g.querySelectorAll('[aria-pressed]').forEach(x => x.setAttribute('aria-pressed', String(multi.has(x.dataset.v))));
          return;
        }
        if (a.d) { run(Object.assign({}, a, { vals: [...multi] }), multi.size ? [...multi].join(', ') : c.l); return; }
        run(a, c.l);
      });
      if (a.m) b.dataset.v = a.m;
    }
    b.style.setProperty('--i', Math.min(j, 6));
    g.appendChild(b);
  });
  const li = el('li', 'cc-turn cc-turn--chips');
  li.appendChild(g);
  return li;
};
const render = () => {
  if (!log) return;
  noMore();
  log.replaceChildren(...turns.map((t, i) => turnEl(t, i)));
  const last = turns[turns.length - 1];
  if (last && last.who === 'b' && last.c && last.c.length) log.appendChild(chipsEl(last));
  strip();
};
const rerender = () => {
  if (!open || !kb) return;
  log.classList.add('is-swap');
  setTimeout(() => { render(); log.classList.remove('is-swap'); }, reduced() ? 0 : 160);
};
const strip = () => {
  const s = flow.strip();
  stripBtn.parentNode.hidden = !s;
  stripBtn.textContent = `${C.brief_title} · ${s}`;
  briefBox.replaceChildren(briefRows());
};
const atBottom = () => log.scrollHeight - log.scrollTop - log.clientHeight < 40;
const toEnd = () => { log.scrollTop = log.scrollHeight; };
const top = li => li.offsetTop - log.offsetTop - 12;
// the cue: shown while the visitor reads a long answer from its start and more of it waits below; it goes at the bottom
const showMore = li => { if (!moreTo) moreTo = li; more.hidden = false; };
const noMore = () => { if (more) more.hidden = true; moreTo = null; };
const onMore = () => {
  const li = moreTo, f = more.contains(document.activeElement);
  if (li && li.isConnected && log.scrollHeight - li.offsetTop + log.offsetTop > log.clientHeight) log.scrollTop = top(li); else toEnd();
  noMore();
  if (f) { const c = log.querySelector('.cc-turn--chips .cc-chip'), n = li && li.isConnected ? li : [...log.querySelectorAll('.cc-turn--b')].pop(); if (c && c.getBoundingClientRect().bottom <= log.getBoundingClientRect().bottom) c.focus({ preventScroll: true }); else if (n) { n.tabIndex = -1; n.focus({ preventScroll: true }); } }
};
// a chip's group goes when it is used: focus that was on one of its chips moves to the title first (24 Oct: it fell to
// the page), and on to the next chips or the answer when it arrives (bot). keep: the reading position stays (bot)
const push = (t, keep) => {
  turns.push(t);
  if (log) {
    const c = log.querySelector('.cc-turn--chips');
    if (c) { if (c.contains(document.activeElement)) title.focus({ preventScroll: true }); c.remove(); }
    log.appendChild(turnEl(t, turns.length - 1));
    if (!keep) { noMore(); toEnd(); }
  }
  save();
};
// a turn as text for the live region: what every block shows (24 Oct: cards were silent, only the options were read)
const SR = {
  p: b => T(b.text), c: b => T(C[b.k]), echo: b => T(fill(C.echo, { parts: (b.parts || []).join(', ') })), quote: b => b.text,
  price: b => T(b.k === 'w' ? `${C.price_label_w} {W}.` : `${C.price_label_e} {E}.`),
  faq: b => { const a = kb.faq[b.i].a; return b.sent != null ? a.split(/(?<=[.?])\s+/)[b.sent] || a : a; },
  list: b => b.items.map(T).join('. ') + '.',
  included: () => { const s = kb.services.find(v => v.id === 'e-commerce'); return `${C.included_label}: ${s.tags.join(', ')}. ${C.included_work} ${kb.projects.filter(p => p.e).map(p => p.t).join(', ')}.`; },
  service: b => { const s = kb.services.find(v => v.id === b.id); return `${s.n} ${s.name}. ${s.title} ${s.body || ''} ${C.service_includes}: ${s.tags.join(', ')}.`; },
  step: b => { const s = kb.process.steps[b.i]; return `${s.n} ${s.name}. ${s.sub} ${[s.body, s.list_intro, (s.list || []).join(', '), (s.ask || []).join(' '), s.end].filter(Boolean).join(' ')}`; },
  stepper: () => kb.process.steps.map(s => `${s.n} ${s.name}: ${s.sub}`).join(' '),
  founder: () => { const f = kb.founder; return `${f.label}. ${f.name}, ${f.roles.join(', ')}. ${f.body[0]}`; },
  project: b => { const p = kb.projects.find(x => x.s === b.s); return `${p.t}, ${p.i}, ${kb.labels[p.k]}. ${p.sum || ''}`; },
  projects: b => projList(b).map(p => `${p.t}, ${p.i}`).join('. ') + '.',
  email: () => kb.contact.email,
  socials: () => kb.contact.socials.map(s => s.label).join(', ') + '.',
  brief: () => `${C.brief_title}: ${flow.briefRows().map(r => `${r.l}: ${r.v}`).join('. ')}.`,
  handoff: b => `${b.mode === 'url' ? C.chips.pick_time : b.mode === 'send' ? C.chips.open_form_short : C.chips.open_form}, ${C.chips.copy_brief}.`,
};
const plain = t => t.b.map(b => (SR[b.t] ? SR[b.t](b) : '')).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

// one bot turn after the typing shards: delay = min(900, 360 + 10 x words); reduced motion 120 ms. A turn taller than
// the log shows from its start; the rest of the batch then lands below without moving it, behind "More below" (25 Oct:
// the e-commerce answer's first turn was scrolled away unseen). The live region reads the whole batch once, at its end.
const bot = async list => {
  let hold = false;
  const said = [];
  for (const t of list) {
    const words = plain(t).split(/\s+/).length;
    busy = true;
    log.setAttribute('aria-busy', 'true');
    const ty = el('li', 'cc-turn cc-turn--b cc-typing');
    ty.appendChild(mark('cc-tava is-typing'));
    log.appendChild(ty);
    if (!hold) toEnd();
    await new Promise(r => setTimeout(r, reduced() ? 120 : Math.min(900, 360 + 10 * words)));
    ty.remove();
    push({ who: 'b', b: t.b, c: t.c || [], multi: t.multi, g: t.g }, hold);
    const c = t.c && t.c.length ? chipsEl(t) : null;
    if (c) log.appendChild(c);
    strip();   // (24 Oct) before the scroll: the brief strip appearing makes the log shorter
    const li = [...log.querySelectorAll('.cc-turn--b')].pop(), h = log.scrollHeight - (li ? li.offsetTop - log.offsetTop : 0);
    if (hold) { if (!atBottom()) showMore(li); }
    else if (li && h > log.clientHeight - 24) { log.scrollTop = top(li); hold = true; if (!atBottom()) showMore(null); }
    else toEnd();
    if (t.g || t.b.some(b => b.t === 'price')) gesture(t.g || 'nod');
    log.removeAttribute('aria-busy');
    busy = false;
    said.push(plain(t) + (t.c && t.c.length ? ` ${C.options} ${t.c.map(x => x.l).join(', ')}.` : ''));
  }
  if (said.length) live.textContent = said.join(' ');
  // after a chip: focus goes to the next chips, else the composer (on touch screens the newest answer: no keyboard pops)
  const first = log.querySelector('.cc-turn--chips .cc-chip'), newest = [...log.querySelectorAll('.cc-turn--b')].pop();
  if (focusChips && !more.hidden && !coarse()) more.firstChild.focus({ preventScroll: true });   // (the rest waits below)
  else if (focusChips && first) first.focus({ preventScroll: true });
  else if (focusChips && coarse() && newest) { newest.tabIndex = -1; newest.focus({ preventScroll: true }); }
  else if (focusChips) input.focus({ preventScroll: true });
  focusChips = false;
};
let focusChips = false;
const gesture = g => { ava.classList.remove('is-nod', 'is-tilt'); void ava.offsetWidth; ava.classList.add('is-' + g); };

// ---- input: typed text or a chip
const ready = () => kb ? Promise.resolve(kb) : loadKb();
// one at a time: a message sent while the assistant is still answering waits its turn (never dropped)
let queue = Promise.resolve();
const serial = fn => (queue = queue.then(fn, fn));
const say = text => serial(async () => {
  push({ who: 'u', text });
  try { await ready(); } catch (e) { return fail(); }
  await bot(flow.input({ text }).turns);
  save();
});
const run = (a, label) => {
  if (a.x === '@restart') return restart();
  if (busy) return;
  return serial(async () => {
    focusChips = true;
    push({ who: 'u', text: label });
    try { await ready(); } catch (e) { return fail(); }
    await bot(flow.input({ chip: { l: label, a } }).turns);
    save();
  });
};
const fail = () => { busy = false; log.removeAttribute('aria-busy'); push({ who: 'b', b: [{ t: 'p', text: fill(C.kb_fail, { email: D.ccEmail || '' }) }], c: [] }); };
const copy = t => {
  const done = () => { live.textContent = C.copied; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => {});
  else { const a = el('textarea'); a.value = t; panel.appendChild(a); a.select(); try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ } a.remove(); }
};
const copyBrief = () => copy(flow.briefText());

// ---- the hand-off: the contact form, filled in from the brief (sessionStorage, read once there; ?service= as backup)
const handoff = () => {
  const data = flow.prefill();
  const ok = S.set('ts-cc-prefill', JSON.stringify(data));
  flow.st.handed = 1; save();
  dock.style.setProperty('--t', (parseFloat(getComputedStyle(dock).getPropertyValue('--t')) || 0) - 360 + 'deg');
  const slug = (data.build || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const onContact = D.ccPage === 'contact' && document.getElementById('project-form');
  hide(true, () => {
    if (onContact) {
      document.dispatchEvent(new CustomEvent('ts:cc-prefill', { detail: ok ? data : data }));
      if (TS.scrollTo) TS.scrollTo('#project-form');
      return;
    }
    const u = href({ r: 'contact' }), a = el('a', null, null, { href: u + (slug ? '?service=' + slug : '') + '#project-form' });
    a.hidden = true; document.body.appendChild(a); a.click(); a.remove();
  });
};

// ---- open / close
const restart = () => {
  ['ts-cc', 'ts-cc-cur', 'ts-cc-seen', 'ts-cc-prefill'].forEach(S.del);
  turns = []; chosen = null;
  Object.keys(flow.st).forEach(k => delete flow.st[k]);
  Object.assign(flow.st, { brief: { needs: [], store: [], questions: [] }, step: null, path: null, misses: 0, prev: null, noted: 0, q0: '' });
  render();
  serial(() => ready().then(() => bot(flow.welcome()), fail));
};
const show = async (opts = {}) => {
  if (open) return;
  if (!dlg) build();
  opener = opts.from || launch;
  open = true;
  root.classList.add('cc-open');
  if (TS.lockScroll) TS.lockScroll(true);
  dlg.classList.remove('is-out', 'is-in', 'is-drag');
  dlg.showModal();
  launch.setAttribute('aria-expanded', 'true');   // (the launcher carries the state; the dock is a plain div)
  dock.classList.remove('has-dot');
  vv(true);
  requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('is-in')));
  if (coarse()) { try { history.pushState({ tsCc: 1 }, ''); pushed = true; addEventListener('popstate', onPop); } catch (e) { pushed = false; } }
  render(); toEnd();
  if (opts.focus === 'composer' || (!coarse() && !opts.q)) input.focus({ preventScroll: true }); else title.focus({ preventScroll: true });
  loadKb().catch(() => {});
  if (!turns.length) {
    await serial(async () => {
      try { await ready(); } catch (e) { return fail(); }
      await bot(flow.welcome());
      if (D.ccPage === 'contact' && flow.st.handed) { flow.st.handed = 0; await bot([{ b: [{ t: 'p', text: C.welcome_contact }], c: [] }]); }
    });
  }
  if (opts.q && opts.q !== 'ask') { try { await ready(); } catch (e) { return fail(); } const it = kb.intents.find(x => x.id === opts.q); run({ i: opts.q }, (it && it.q) || C.hello_chips[0]); }
  if (opts.q === 'ask') input.focus({ preventScroll: true });
};
let after = null, popT = 0;
const onPop = () => { if (!open) return; pushed = false; clearTimeout(popT); removeEventListener('popstate', onPop); hide(after ? true : false, after, true); };
// hide(now, then): now = no close animation (a link or the hand-off leaves the page; the top layer would sit above the shade)
const hide = (now, then, fromPop) => {
  if (!open) return;
  if (pushed && !fromPop) { after = then || null; pushed = false; removeEventListener('popstate', onPop); history.back(); popT = setTimeout(() => close2(now, then), 450); addEventListener('popstate', function p() { removeEventListener('popstate', p); clearTimeout(popT); close2(now, then); }); return; }
  close2(now, then);
};
const close2 = (now, then) => {
  if (!open) return;
  after = null;
  if (now || reduced()) { dlg.classList.remove('is-in'); finish(); if (then) then(); return; }
  dlg.classList.add('is-out'); dlg.classList.remove('is-in');
  setTimeout(() => { finish(); if (then) then(); }, phone() ? 240 : 200);
};
const finish = () => {
  if (!open) return;
  open = false;
  vv(false);
  if (TS.lockScroll) TS.lockScroll(false);       // (the launcher stays shown under the chat: focus can return to it)
  if (dlg.open) dlg.close();
  dlg.classList.remove('is-out', 'is-drag');
  panel.style.transform = '';
  launch.setAttribute('aria-expanded', 'false');
  if (turns.length) { launch.setAttribute('aria-label', C.launcher_label_resume); const p = dock.querySelector('.cc-pill'); if (p) p.textContent = C.pill_resume; }
  dock.dispatchEvent(new CustomEvent('cc:closed'));
  const t = opener && opener.isConnected && opener.getClientRects().length ? opener : launch;
  if (t) t.focus({ preventScroll: true });
  root.classList.remove('cc-open');
};

// ---- phones: the keyboard (visualViewport), a drag down closes
let vvRaf = 0;
const vvSync = () => {
  vvRaf = 0;
  const v = window.visualViewport, h = v ? v.height : innerHeight, top = v ? v.offsetTop : 0, pin = atBottom();
  dlg.style.setProperty('--vvh', h + 'px');
  dlg.style.setProperty('--vvt', top + 'px');
  dlg.classList.toggle('is-kb', innerHeight - h > 120);
  dlg.classList.toggle('is-cramped', h < 420);
  if (pin) toEnd();
};
const vvReq = () => { if (!vvRaf) vvRaf = requestAnimationFrame(vvSync); };
const vv = on => {
  const v = window.visualViewport;
  if (on) { vvSync(); if (v) { v.addEventListener('resize', vvReq); v.addEventListener('scroll', vvReq); } else addEventListener('resize', vvReq); }
  else if (v) { v.removeEventListener('resize', vvReq); v.removeEventListener('scroll', vvReq); } else removeEventListener('resize', vvReq);
};
const drag = head => {
  let y0 = 0, t0 = 0, dy = 0, id = null;
  head.addEventListener('pointerdown', e => {
    if (!phone() || e.button || e.target.closest('button')) return;
    id = e.pointerId; y0 = e.clientY; t0 = performance.now(); dy = 0;
    head.setPointerCapture(id); dlg.classList.add('is-drag');
  });
  head.addEventListener('pointermove', e => { if (e.pointerId !== id) return; dy = Math.max(0, e.clientY - y0); panel.style.transform = `translateY(${dy}px)`; });
  const up = e => {
    if (e.pointerId !== id) return;
    id = null; dlg.classList.remove('is-drag');
    const v = dy / Math.max(1, performance.now() - t0);
    if (dy > 96 || v > .5) { panel.style.transform = ''; hide(); } else panel.style.transform = '';
  };
  head.addEventListener('pointerup', up); head.addEventListener('pointercancel', up);
};

window.TSChat = { open: show, close: () => hide(), ready: true };
})();
