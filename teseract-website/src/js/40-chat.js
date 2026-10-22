/* Ask TESERACT launcher (owner, 21 Oct; markup chrome.chat_dock, look 40-chat.css). At load: one query and the
   launcher's listeners. After paint: the button semantics. At idle after load: the corner obstacles, the greeting,
   the field watch, the living launcher. The chat (assets/chat/) loads on the first hover / focus / touch or with the
   greeting; without it (or in 4 s) the launcher stays a link to the contact form.
   Living (owner, 21 Oct 23:20, "moving here and there ... he should touch it"): while the visitor is not scrolling, the
   mark visits a free spot on the screen edge (a hit test per hop: never on or within 12 px of a control or a headline)
   and comes back, looks at the page, now and then says a line (CHAT 'say'). Home on scroll, menu, dialog, hidden tab;
   calm after a minute or once the chat is opened, then one short visit a page. Reduced motion: still, "Ask" shown. */
(() => {
  const dock = document.querySelector('[data-cc]');
  if (!dock) return;
  const TS = window.TS || {}, root = document.documentElement, d = dock.dataset, cl = dock.classList, now = () => performance.now();
  const btn = dock.querySelector('[data-cc-launch]'), hi = dock.querySelector('.cc-hello');
  const ss = (k, v) => { try { return v == null ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch (e) { return null; } };
  const saying = () => hi && !hi.hidden && hi.classList.contains('is-say');
  let p = null, opened = false, tuck = false, away = false, t0 = 0, tIn = 0, turns = 0, ft = 0, ht = 0, sw = 0, x0 = 0, home = () => {};
  const load = () => p || (p = new Promise((ok, no) => {
    const l = document.createElement('link'), s = document.createElement('script');
    l.rel = 'stylesheet'; l.href = d.ccCss; s.src = d.ccJs; s.async = true;
    s.onload = () => (window.TSChat ? ok(window.TSChat) : no()); s.onerror = no;
    document.head.append(l, s);
  }));
  const open = (q, e) => {
    if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
    if (e) e.preventDefault();
    opened = true; fold(1); home();
    cl.add('is-wait');
    Promise.race([load(), new Promise((r, no) => setTimeout(no, 4000))])
      .then(c => c.open({ q, from: btn }), () => location.assign(btn.href))
      .finally(() => cl.remove('is-wait'));
  };
  // fold the bubble; gone = dismissed (or the chat opened): the dot goes, and no more lines in this tab
  const fold = gone => {
    if (gone) { cl.remove('has-dot'); ss('ts-cc-hush', '1'); }
    clearTimeout(ht);
    if (!hi || hi.hidden) return;
    hi.classList.add('is-off'); btn.removeAttribute('aria-describedby');
    clearTimeout(ft); ft = setTimeout(() => { hi.hidden = true; }, 200);
  };
  const pop = (line, say, ms, side) => {   // show the bubble (the greeting, or a line), folding by itself unless hovered / focused
    hi.querySelector('p').textContent = line; cl.toggle('is-side', !!side);
    hi.classList.toggle('is-say', say); hi.classList.remove('is-off'); hi.classList.add('is-on'); clearTimeout(ft); hi.hidden = false;
    cl.add('has-dot'); btn.setAttribute('aria-describedby', 'cc-hello');
    clearTimeout(ht); ht = setTimeout(function f() { if (hi.matches(':hover,:focus-within')) ht = setTimeout(f, 2e3); else fold(); }, ms);
  };
  ['pointerenter', 'focus', 'touchstart'].forEach(t => btn.addEventListener(t, () => load().catch(() => {}), { passive: true, once: true }));
  btn.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') dock.style.setProperty('--t', `${--turns * 120}deg`); });
  btn.addEventListener('click', e => open(null, e));
  btn.addEventListener('keydown', e => {
    if (e.key === ' ') { e.preventDefault(); btn.click(); }
    if (e.key === 'Escape') fold(1);
  });
  if (hi) {   // a chip asks it; the X or a swipe right dismisses; a tap anywhere else on the bubble opens the chat
    hi.addEventListener('pointerdown', e => { x0 = e.clientX; sw = 0; });
    hi.addEventListener('pointerup', e => { if (e.clientX - x0 > 60) { sw = 1; fold(1); } });
    hi.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (sw) return;
      if (b && b.dataset.ccQ) open(b.dataset.ccQ, e); else if (b) fold(1); else open(null, e);
    });
  }
  const END = { 'cc-br': 'is-breath', 'cc-sm': 'is-shim', 'cc-in': 'is-arrive', 'cc-fd': 'is-fade', 'cc-ld': 'is-land', 'cc-bob': 'is-bob', 'cc-ring': 'is-ring' };
  dock.addEventListener('animationend', e => {   // (staggered shards: the last one, b, ends theirs)
    const k = END[e.animationName], c = e.target.classList;
    if (k && !(c.contains('cc-sh') && !c.contains('cc-sh--b'))) cl.remove(k);
  });
  TS.afterPaint = TS.afterPaint || (fn => requestAnimationFrame(() => setTimeout(fn, 0)));
  TS.afterPaint(() => {
    const resume = !!ss('ts-cc');
    btn.setAttribute('role', 'button'); btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-controls', 'cc-dialog');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', resume ? d.ccL2 : d.ccL1);
    if (resume) dock.querySelector('.cc-pill').textContent = d.ccP2;
  });
  // arrival: the full one in the first page of a tab, a fade on the next ones
  const arrive = () => {
    const first = !ss('ts-cc-seen');
    ss('ts-cc-seen', '1');
    setTimeout(() => { tIn = now(); cl.add('is-in', first ? 'is-arrive' : 'is-fade'); }, first ? 600 : 0);
  };
  if (TS.afterIntro) TS.afterIntro(() => (root.classList.contains('ts-intro') ? document.addEventListener('ts:intro-end', arrive, { once: true }) : arrive()));
  else arrive();

  const idle = () => {
    t0 = now();
    const R = matchMedia('(prefers-reduced-motion: reduce)'), still = () => R.matches || !root.classList.contains('motion');
    const shut = () => (tuck && !away) || root.matches('.is-locked,.cc-field,.ts-intro,.cc-open');
    const ok = () => !opened && !shut();
    const cue = c => { if (!shut() && !still()) cl.add(c); };   // breath, shimmer, ring, landing, hop
    // corner obstacles (IntersectionObserver only): A = the launcher's corner (its resting box + 12 px), B = the 68 px
    // above it. A pause control in A lifts the launcher 60 px; anything else in A (or in B while lifted) tucks it away.
    // (Not while it has wandered off, is-away: its spot was hit-tested.)
    const LIFT = '.motion-toggle:not([hidden])', AVOID = '.btn,.ct-submit,.ct-quick,.ct-input,.ct-chip,.ft-bar a,.ft-bar__motto,.pj-visit,[data-cc-avoid]';
    const inA = new Set(), inB = new Set(), inC = new Set();   // C: where the greeting would sit
    let ios = [], back = 0, rt = 0, G = null;
    const pin = () => { dock.inert = tuck && !away; };
    const untuck = () => { tuck = false; cl.remove('is-tuck'); pin(); };
    const sync = () => {
      const lift = [...inA].some(x => x.matches(LIFT)), t = [...inA].some(x => !x.matches(LIFT)) || (lift && [...inB].some(x => !inA.has(x)));
      cl.toggle('is-lift', lift && !t);
      clearTimeout(back);
      if (t) { tuck = true; cl.add('is-tuck'); pin(); }
      else if (tuck) back = setTimeout(untuck, 400);
    };
    dock.addEventListener('cc:closed', untuck);   // the chat closed: focus returns to the launcher, so it shows
    const watch = () => {
      ios.forEach(o => o.disconnect()); inA.clear(); inB.clear(); inC.clear();
      const W = innerWidth, H = innerHeight, cs = getComputedStyle(dock), n = btn.offsetWidth + 12;
      const a = Math.round(parseFloat(cs.bottom) + n), w = Math.round(parseFloat(cs.right) + n);
      const els = [...document.querySelectorAll(LIFT + ',' + AVOID)].filter(x => !x.closest('.menu,[data-intro],[data-cc],[aria-hidden="true"],dialog'));
      ios = [[inA, `-${H - a}px 0px 0px -${W - w}px`], [inB, `-${H - a - 68}px 0px -${a}px -${W - w}px`],
        [inC, `-${Math.max(0, H - a - 250)}px 0px -${a - 12}px -${Math.max(0, W - 330)}px`]].map(([set, m]) => {
        const o = new IntersectionObserver(es => { es.forEach(x => (x.isIntersecting ? set.add(x.target) : set.delete(x.target))); sync(); }, { rootMargin: m });
        els.forEach(x => o.observe(x));
        return o;
      });
    };
    watch();
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { G = null; V.clear(); home(1); watch(); }, 150); });
    // a text field outside the chat has focus: the launcher steps aside (phones: the keyboard is up)
    const field = x => x && x.matches && x.matches('input,textarea,select,[contenteditable]') && !x.closest('dialog,[data-cc]');
    document.addEventListener('focusin', e => root.classList.toggle('cc-field', field(e.target)));
    document.addEventListener('focusout', () => setTimeout(() => root.classList.toggle('cc-field', field(document.activeElement)), 0));

    // ---- living: wander (hop) every 7-10 s, a line (speak) 20-30 s apart (4 a page), calm (rest) after
    const talk = !!(hi && d.ccSay), lines = (d.ccSay || '').split('|'), l0 = hi ? hi.querySelector('p').textContent : '';
    const BAD = 'a[href],button,input,select,textarea,summary,label,iframe,video[controls],[role=button],[role=link],[role=slider],[tabindex]:not([tabindex="-1"]),[contenteditable],header,nav,.ft-bar,[data-cc-avoid]';
    let wx = 0, wy = 0, wt = 0, tk = 0, mt = 0, prev = 0, act = 0, lastS = 0, lastB = 0, gap = 5e3, says = 0, n = 0;
    let hover = false, calm = false, hopped = false, short = !!(ss('ts-cc-calm') || ss('ts-cc'));
    // reads and hit tests run just after a frame has painted, on its clean layout (never forcing one)
    const clean = f => requestAnimationFrame(() => setTimeout(() => { if (!document.hidden) f(); }, 0));
    const geo = () => {   // one read per hop: the home spot's centre, the launcher's size, the viewport
      const cs = getComputedStyle(dock), s = btn.offsetWidth, W = root.clientWidth, H = innerHeight, r = parseFloat(cs.right);
      return (G = { s, W, H, l: parseFloat(cs.marginLeft) || r, hx: W - r - s / 2, hy: H - parseFloat(cs.bottom) - s / 2,
        ph: W < 800 || matchMedia('(pointer:coarse)').matches });
    };
    // spots (centres): bottom left, part-way up the right edge (desktop: and the left edge), below the header
    const spots = g => {
      const L = g.l + g.s / 2, out = [[L, g.hy]];
      (g.ph ? [.8, .66, .52, .38] : [.7, .52, .36]).forEach(k => {
        const y = Math.max(120 + g.s / 2, g.H * k);
        if (g.hy - y > g.s) { out.push([g.hx, y]); if (!g.ph) out.push([L, y]); }
      });
      return out;
    };
    // hit test of kx x ky points, centre first, two a task (one costs 1-3 ms, 4-10 on a phone): done(2) = a control, a
    // headline (h1/h2, 28 px type) or text with a link, done(1) = text, done(0) = clear. A scroll meanwhile = 2. The
    // verdicts hold for this scroll position (V, cleared on scroll) for 30 s, so a still page is tested once.
    const V = new Map();
    const probe = (ax, ay, bx, by, kx, ky, cb) => {
      let t = 0;
      const P = [], mx = (ax + bx) / 2, my = (ay + by) / 2, s0 = lastS, key = [ax, ay, bx, by, kx].map(Math.round).join(), v = V.get(key);
      const done = r => { if (s0 === lastS) V.set(key, [r, now()]); cb(r); };
      if (v && now() - v[1] < 3e4) return cb(v[0], 1);
      if (ax < 0 || ay < 96 || bx > G.W || by > G.H) return done(2);   // (and clear of the header band)
      for (let i = 0; i < kx * ky; i++) P.push([ax + (bx - ax) * (i % kx) / (kx - 1), ay + (by - ay) * Math.floor(i / kx) / (ky - 1)]);
      P.sort((a, b) => Math.hypot(a[0] - mx, a[1] - my) - Math.hypot(b[0] - mx, b[1] - my));
      const next = () => {
        for (let k = 0; k < 2 && P.length; k++) {
          const [x, y] = P.shift(), st = document.elementsFromPoint(x, y).filter(e => !dock.contains(e)), b = st[0] && st[0].closest('p,li,h1,h2,h3,h4,h5,h6,blockquote,figcaption,dd,dt,td');
          if (s0 !== lastS || st.some(e => e.matches(BAD)) || (st[0] && parseFloat(getComputedStyle(st[0]).fontSize) >= 28)) return done(2);
          if (b) { if (b.matches('h1,h2') || b.querySelector('a[href],button')) return done(2); t = 1; }
        }
        if (P.length) setTimeout(next, 0); else done(s0 !== lastS ? 2 : t);
      };
      next();
    };
    // glide (transform only) to a spot, c = null: home. The mark turns a third on the way, then looks at the page centre.
    const go = (c, ms, say) => {
      const g = G || geo(), x = c ? Math.round(c[0] - g.hx) : 0, y = c ? Math.round(c[1] - g.hy) : 0, at = c || [g.hx, g.hy];
      if (x === wx && y === wy) return;
      const dur = ms || Math.round(Math.min(1300, 600 + Math.hypot(x - wx, y - wy) * .8)), lx = g.W / 2 - at[0], ly = g.H / 2 - at[1], m = Math.hypot(lx, ly) || 1;
      wx = x; wy = y; away = !!(x || y);
      [['--gd', dur + 'ms'], ['--wx', x + 'px'], ['--wy', y + 'px'], ['--lx', (lx / m).toFixed(2)], ['--ly', (ly / m).toFixed(2)], ['--w', (wt -= 120) + 'deg']]
        .forEach(([k, v]) => dock.style.setProperty(k, v));
      cl.toggle('is-away', away); cl.toggle('is-l', at[0] < g.W / 2); cl.add('is-move'); pin();
      clearTimeout(mt); mt = setTimeout(() => { cl.remove('is-move'); if (ms !== 1) cue('is-land'); if (say) clean(speak); }, dur);
    };
    home = fast => { if (away) { if (saying()) fold(); go(null, fast ? 1 : 450); } };
    const hop = done => {   // out to a free spot (2 newly tested at most; done(true)), or a small hop where it is
      const g = geo(), all = spots(g);
      let alt = null, i = 0, f = 0;
      for (let k = all.length; k > 1; k--) { const j = Math.floor(Math.random() * k); [all[k - 1], all[j]] = [all[j], all[k - 1]]; }
      const end = c => { if (c && free()) go(c, 0, 1); else if (!c) cue('is-bob'); done(!!c); };
      const next = () => {
        const c = all[i++];
        if (!c || f > 1) return end(alt);
        probe(c[0] - g.s / 2 - 12, c[1] - g.s / 2 - 12, c[0] + g.s / 2 + 12, c[1] + g.s / 2 + 12, 3, 3, (r, old) => {
          if (!old) f++;
          if (!r) return end(c);
          if (r === 1 && !alt) alt = c;
          next();
        });
      };
      next();
    };
    const speak = () => {   // until the chat has been opened or a bubble dismissed in this tab
      if (!talk || still() || opened || ss('ts-cc') || ss('ts-cc-hush') || says > 3 || !hi.hidden || shut() || hover || now() - lastB < gap) return;
      // above the launcher, or else beside it (towards the page); never over a control or a headline
      const g = G || geo(), s = g.s, l = cl.contains('is-l'), cx = g.hx + wx, cy = g.hy + wy - (cl.contains('is-lift') && !away ? 60 : 0);
      const w = Math.min(270, g.W - 32), ax = l ? cx - s / 2 : cx + s / 2 - w, by = cy - s / 2 - 10;
      const ws = Math.min(270, l ? g.W - cx - s / 2 - 26 : cx - s / 2 - 26), sx = l ? cx + s / 2 + 10 : cx - s / 2 - 10 - ws, w0 = wx + ',' + wy;
      const say = side => {
        if (w0 !== wx + ',' + wy || !hi.hidden || shut() || hover) return;   // (it moved, or something else showed meanwhile)
        const i = +ss('ts-cc-say') || 0;
        ss('ts-cc-say', String(i + 1)); says++; lastB = now(); gap = 2e4 + Math.random() * 1e4;
        dock.style.setProperty('--bw', (side ? ws : w) + 'px');
        pop(lines[i % lines.length], true, 7e3, side); cue('is-ring');
      };
      const beside = r => (r < 2 ? say(0) : ws >= 200 && probe(sx, cy - 46, sx + ws, cy + 46, 4, 3, q => q < 2 && say(1)));
      if (!away && [...inC].some(x => !x.matches(LIFT))) beside(2); else probe(ax, by - 92, ax + w, by, 4, 3, beside);
    };
    const later = (f, ms) => { clearTimeout(tk); tk = setTimeout(f, ms); };
    const settle = () => { calm = true; if (hopped) ss('ts-cc-calm', '1'); home(still()); later(rest, 9e3 + Math.random() * 6e3); };
    const rest = () => {   // calm: a breath or a shimmer every 14-22 s, and a line when one is due
      if (document.hidden) return;
      if (root.matches('.is-locked,.cc-open')) home(1);
      else if (!still()) { cue(++n % 2 ? 'is-breath' : 'is-shim'); clean(speak); }
      later(rest, 14e3 + Math.random() * 8e3);
    };
    const free = () => !document.hidden && !opened && cl.contains('is-in') && now() - tIn > 3500 && now() - lastS > 2500 && !hover
      && document.activeElement !== btn && hi.hidden && !cl.contains('is-wait') && !root.matches('.is-locked,.cc-open,.cc-field');
    const step = () => {
      if (document.hidden) return;
      const t = now();
      if (!talk || still() || opened) return settle();
      if (root.matches('.is-locked,.cc-open,.cc-field')) { home(1); return later(step, 1500); }
      if (!free()) return later(step, 1200);
      if (prev) act += t - prev;
      prev = t;
      if (away) { go(null, 0, 1); return short || act > 6e4 ? settle() : later(step, 7e3 + Math.random() * 3e3); }   // a visit, then home
      if (short ? hopped : act > 6e4) return settle();
      hopped = true;
      clean(() => hop(out => later(step, out ? 5e3 + Math.random() * 1500 : 7e3 + Math.random() * 3e3)));
    };
    // the menu / a dialog / a field (html classes): home at once
    new MutationObserver(() => { if (away && root.matches('.is-locked,.cc-open,.cc-field')) home(1); }).observe(root, { attributes: true, attributeFilter: ['class'] });
    addEventListener('scroll', () => { lastS = now(); V.clear(); if (away) home(); else if (saying()) fold(); }, { passive: true });
    ['pointerdown', 'keydown'].forEach(t => addEventListener(t, () => { lastS = now(); }, { passive: true, capture: true }));
    dock.addEventListener('pointerenter', () => { hover = true; });
    dock.addEventListener('pointerleave', () => { hover = false; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(tk); prev = 0; home(1); } else later(calm ? rest : step, 1500); });
    later(step, 1200);

    // the greeting: once per tab, 8 s of visible time after the intro or 40% down the page, never in the first 3 s
    if (!hi || ss('ts-cc-hello')) return;
    let left = 8e3, at = 0, tm = 0, pS = -1;
    const show = () => clean(greet), greet = () => {
      if (ss('ts-cc-hello')) return;
      if (!ok() || !hi.hidden || [...inC].some(x => !x.matches(LIFT)) || now() - t0 < 3e3 || now() - lastB < 12e3) { tm = setTimeout(show, 2e3); return; }   // never over a button
      const g = G || geo(), y = g.hy - g.s / 2 - (cl.contains('is-lift') ? 70 : 10), w = Math.min(300, g.W - 32);
      if (now() - lastS < 1e3 || pS === lastS) { tm = setTimeout(show, 2e3); return; }
      probe(g.hx + g.s / 2 - w, y - 150, g.hx + g.s / 2, y, 5, 3, r => {   // nor a link or a headline (tested again after a scroll)
        if (r > 1 || !ok() || !hi.hidden) { if (r > 1) pS = lastS; tm = setTimeout(show, 2e3); return; }
        if (away) { home(); tm = setTimeout(show, 1e3); return; }   // (it shows from the launcher's corner)
        ss('ts-cc-hello', '1'); lastB = now(); gap = 2e4 + Math.random() * 1e4;
        pop(l0, false, 12e3); cue('is-breath');
        const c = navigator.connection;
        if (!(c && (c.saveData || /2g/.test(c.effectiveType || '')))) (window.requestIdleCallback || setTimeout)(() => load().catch(() => {}));
      });
    };
    const run = () => { at = now(); tm = setTimeout(show, left); };
    document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(tm); left -= now() - at; } else run(); });
    if (!document.hidden) run();
    const kids = document.querySelector('main') ? document.querySelector('main').children : [];
    const mark = kids[Math.floor(kids.length * .4)];
    if (mark) { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); show(); } }); o.observe(mark); }
  };
  addEventListener('load', () => (window.requestIdleCallback || setTimeout)(idle, { timeout: 3000 }), { once: true });
})();
