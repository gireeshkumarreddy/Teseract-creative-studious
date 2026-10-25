/* Ask TESERACT launcher (owner 21 Oct; markup chrome.chat_dock, look 40-chat.css). Load: a query + listeners; after
   paint: button semantics; idle: corner obstacles, greeting, field watch, living. The chat loads on the first hover /
   focus / touch or with the greeting (else, or in 4 s, it is a link to the contact form). Living (owner 21 Oct 23:20):
   unscrolled, the mark visits clear edge spots, looks at the page, says a line now and then (CHAT 'say'); home on
   scroll, menu, dialog, hidden tab; calm after a minute or once opened. Reduced motion or hushed: still. */
(() => {
  const dock = document.querySelector('[data-cc]');
  if (!dock) return;
  const TS = window.TS || {}, root = document.documentElement, d = dock.dataset, cl = dock.classList, now = () => performance.now();
  const btn = dock.querySelector('[data-cc-launch]'), hi = dock.querySelector('.cc-hello');
  const ss = (k, v) => { try { return v == null ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch (e) { return null; } };
  const saying = () => hi && !hi.hidden && hi.classList.contains('is-say');
  let p = null, opened = false, tuck = false, away = false, t0 = 0, tIn = 0, turns = 0, ft = 0, ht = 0, sw = 0, x0 = 0, home = () => {};
  // hushed (WCAG 2.2.2): a bubble dismissed, Esc on the launcher, a Pause motion ('ts:motion'): home, still
  let hushed = !!ss('ts-cc-still');
  const hush = () => { hushed = true; ss('ts-cc-still', '1'); cl.remove('is-ring', 'is-breath', 'is-shim', 'is-bob'); home(1); }, dismiss = () => { fold(1); hush(); };
  document.addEventListener('ts:motion', e => { if (e.detail && e.detail.still) hush(); }, true);
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
  // fold the bubble; gone: dismissed or the chat opened (the dot goes, no more lines)
  const fold = gone => {
    if (gone) { cl.remove('has-dot'); ss('ts-cc-hush', '1'); }
    clearTimeout(ht);
    if (!hi || hi.hidden) return;
    hi.classList.add('is-off'); btn.removeAttribute('aria-describedby');
    clearTimeout(ft); ft = setTimeout(() => { hi.hidden = true; }, 200);
  };
  const pop = (line, say, ms, side) => {   // the greeting or a line; folds itself unless hovered / focused
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
    if (e.key === 'Escape') dismiss();
  });
  if (hi) {   // a chip asks; X, Esc, a swipe dismiss (focus: to the launcher); else a tap opens the chat
    const off = () => { const f = hi.contains(document.activeElement); dismiss(); if (f) btn.focus({ preventScroll: true }); };
    hi.addEventListener('pointerdown', e => { x0 = e.clientX; sw = 0; });
    hi.addEventListener('pointerup', e => { if (e.clientX - x0 > 60) { sw = 1; off(); } });
    hi.addEventListener('keydown', e => { if (e.key === 'Escape') off(); });
    hi.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (sw) return;
      if (b && b.dataset.ccQ) open(b.dataset.ccQ, e); else if (b) off(); else open(null, e);
    });
  }
  const END = { 'cc-br': 'is-breath', 'cc-sm': 'is-shim', 'cc-in': 'is-arrive', 'cc-fd': 'is-fade', 'cc-ld': 'is-land', 'cc-bob': 'is-bob', 'cc-ring': 'is-ring' };
  dock.addEventListener('animationend', e => {
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
  // arrival: in full on a tab's first page, a fade after
  const arrive = () => {
    const first = !ss('ts-cc-seen');
    ss('ts-cc-seen', '1');
    setTimeout(() => { tIn = now(); cl.add('is-in', first ? 'is-arrive' : 'is-fade'); }, first ? 600 : 0);
  };
  if (TS.afterIntro) TS.afterIntro(() => (root.classList.contains('ts-intro') ? document.addEventListener('ts:intro-end', arrive, { once: true }) : arrive()));
  else arrive();

  const idle = () => {
    t0 = now();
    const R = matchMedia('(prefers-reduced-motion: reduce)'), still = () => R.matches || !root.classList.contains('motion') || hushed;
    const shut = () => (tuck && !away) || root.matches('.is-locked,.cc-field,.ts-intro,.cc-open');
    const ok = () => !opened && !shut();
    const cue = c => { if (!shut() && !still()) cl.add(c); };   // breath, shimmer, ring, landing, hop
    // corner obstacles (IntersectionObserver): A = the resting box + 12 px, B = 68 px above it and 8 px into it. A pause
    // control in A lifts it 60 px; anything else in A, or in B while lifted (that control too, 25 Oct), tucks it
    const LIFT = '.motion-toggle:not([hidden])', AVOID = '.btn,.ct-submit,.ct-quick,.ct-input,.ct-chip,.ct-out,.ct-link,.ft-bar a,.ft-bar__motto,.ft__bigmark,'
      + '.pj-visit,.faq-btn,.sto-btn,.sto-rev__btn,.svc-tap,.video-ctl,[data-cc-avoid]';
    const inA = new Set(), inB = new Set(), inC = new Set();   // C: where the greeting would sit
    let ios = [], back = 0, rt = 0, vt = 0, G = null, M;
    const untuck = () => { tuck = false; cl.remove('is-tuck'); };
    const sync = () => {
      const lift = [...inA].some(x => x.matches(LIFT)), t = [...inA].some(x => !x.matches(LIFT)) || (lift && [...inB].some(x => !inA.has(x) || x.matches(LIFT)));
      cl.toggle('is-lift', lift && !t);
      clearTimeout(back);
      if (t) { tuck = true; cl.add('is-tuck'); kk(); }
      else if (tuck) back = setTimeout(untuck, 400);
    };
    dock.addEventListener('cc:closed', untuck);
    // tucked, it stays in the Tab order: focused (or tucking, or scrolled, while focused: 25 Oct) it shows in the first
    // gap up its column clear of controls
    const kk = () => {
      if (!tuck || away || document.activeElement !== btn) return;
      const r = btn.getBoundingClientRect(), s = btn.offsetWidth, x = r.left + r.width / 2, y0 = innerHeight - parseFloat(getComputedStyle(dock).bottom);
      const q = [...document.querySelectorAll('a[href],button,input,select,textarea,summary')].filter(e => !dock.contains(e))
        .map(e => e.getBoundingClientRect()).filter(b => b.width && b.right > x - s / 2 - 8 && b.left < x + s / 2 + 8);
      let y = y0, b;
      while (y - s > 96 && (b = q.find(k => k.top < y + 8 && k.bottom > y - s - 8))) y = b.top - 8;
      dock.style.setProperty('--kl', Math.round(Math.max(y, 96 + s) - y0) + 'px');
      cl.add('is-kbd');
    };
    btn.addEventListener('focus', kk);
    btn.addEventListener('blur', () => cl.remove('is-kbd'));
    const watch = () => {
      ios.forEach(o => o.disconnect()); inA.clear(); inB.clear(); inC.clear();
      const W = innerWidth, H = innerHeight, cs = getComputedStyle(dock), n = btn.offsetWidth + 12;
      M = [n - 12, parseFloat(cs.right), parseFloat(cs.bottom), parseFloat(cs.marginLeft), W - root.clientWidth];
      const a = Math.round(parseFloat(cs.bottom) + n), w = Math.round(parseFloat(cs.right) + n);
      const els = [...document.querySelectorAll(LIFT + ',' + AVOID)].filter(x => !x.closest('.menu,[data-intro],[data-cc],[aria-hidden="true"],dialog')
        && !(x.matches('.video-ctl') && x.closest('[data-ticker]')));
      ios = [[inA, `-${H - a}px 0px 0px -${W - w}px`], [inB, `-${H - a - 68}px 0px -${a - 8}px -${W - w}px`],
        [inC, `-${Math.max(0, H - a - 250)}px 0px -${a - 12}px -${Math.max(0, W - 330)}px`]].map(([set, m]) => {
        const o = new IntersectionObserver(es => { es.forEach(x => (x.isIntersecting ? set.add(x.target) : set.delete(x.target))); sync(); }, { rootMargin: m });
        els.forEach(x => o.observe(x));
        return o;
      });
    };
    watch();
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { G = null; V.clear(); home(1); watch(); }, 150); });
    // video controls added later join the obstacles
    if (TS.observeVideos) { const ov = TS.observeVideos; TS.observeVideos = r => { ov(r); clearTimeout(vt); vt = setTimeout(watch, 300); }; }
    // a text field elsewhere has focus: it steps aside (the keyboard)
    const field = x => x && x.matches && x.matches('input,textarea,select,[contenteditable]') && !x.closest('dialog,[data-cc]');
    document.addEventListener('focusin', e => root.classList.toggle('cc-field', field(e.target)));
    document.addEventListener('focusout', () => setTimeout(() => root.classList.toggle('cc-field', field(document.activeElement)), 0));

    // ---- living: a hop every 7-10 s, a line 20-30 s apart (4 a page), then calm
    const talk = !!(hi && d.ccSay), lines = (d.ccSay || '').split('|'), l0 = hi ? hi.querySelector('p').textContent : '';
    const BAD = 'a[href],button,input,select,textarea,summary,label,iframe,video[controls],[role=button],[role=link],[role=slider],[tabindex]:not([tabindex="-1"]),[contenteditable],header,nav,.ft-bar,[data-cc-avoid]';
    let wx = 0, wy = 0, wt = 0, tk = 0, mt = 0, prev = 0, act = 0, lastS = 0, lastB = 0, gap = 5e3, says = 0, n = 0;
    let hover = false, calm = false, hopped = false, short = !!(ss('ts-cc-calm') || ss('ts-cc'));
    // reads and hit tests just after a paint, on a clean layout
    const clean = f => requestAnimationFrame(() => setTimeout(() => { if (!document.hidden) f(); }, 0));
    const geo = () => {   // (25 Oct: no layout read; M from watch)
      const [s, r, b, l, sb] = M, W = innerWidth - sb, H = innerHeight;
      return (G = { s, W, H, l: l || r, hx: W - r - s / 2, hy: H - b - s / 2, ph: W < 800 || matchMedia('(pointer:coarse)').matches });
    };
    // spots: bottom left, up the right edge (desktop: left too)
    const spots = g => {
      const L = g.l + g.s / 2, out = [[L, g.hy]];
      (g.ph ? [.8, .66, .52, .38] : [.7, .52, .36]).forEach(k => {
        const y = Math.max(120 + g.s / 2, g.H * k);
        if (g.hy - y > g.s) { out.push([g.hx, y]); if (!g.ph) out.push([L, y]); }
      });
      return out;
    };
    // hit test of kx x ky points, one a task: 2 = a control, a headline, text with a link (or a scroll), 1 = text, 0 =
    // clear. Verdicts (V) hold at this scroll position: clear 30 s, taken until a scroll (25 Oct: not re-tested a hop)
    const V = new Map();
    const probe = (ax, ay, bx, by, kx, ky, cb) => {
      let t = 0;
      const P = [], mx = (ax + bx) / 2, my = (ay + by) / 2, s0 = lastS, key = [ax, ay, bx, by, kx].map(Math.round).join(), v = V.get(key);
      const done = r => { if (s0 === lastS) V.set(key, [r, now()]); cb(r); };
      if (v && (v[0] || now() - v[1] < 3e4)) return cb(v[0], 1);
      if (ax < 0 || ay < 96 || bx > G.W || by > G.H) return done(2);
      for (let i = 0; i < kx * ky; i++) P.push([ax + (bx - ax) * (i % kx) / (kx - 1), ay + (by - ay) * Math.floor(i / kx) / (ky - 1)]);
      P.sort((a, b) => Math.hypot(a[0] - mx, a[1] - my) - Math.hypot(b[0] - mx, b[1] - my));
      const next = () => {
        const [x, y] = P.shift(), st = document.elementsFromPoint(x, y).filter(e => !dock.contains(e)), b = st[0] && st[0].closest('p,li,h1,h2,h3,h4,h5,h6,blockquote,figcaption,dd,dt,td');
        if (s0 !== lastS || st.some(e => e.matches(BAD)) || (st[0] && parseFloat(getComputedStyle(st[0]).fontSize) >= 28)) return done(2);
        if (b) { if (b.matches('h1,h2') || b.querySelector('a[href],button')) return done(2); t = 1; }
        if (P.length) setTimeout(next, 0); else done(s0 !== lastS ? 2 : t);
      };
      next();
    };
    // glide to a spot (null: home), turning a third, then looking at the page centre
    const go = (c, ms, say) => {
      const g = G || geo(), x = c ? Math.round(c[0] - g.hx) : 0, y = c ? Math.round(c[1] - g.hy) : 0, at = c || [g.hx, g.hy];
      if (x === wx && y === wy) return;
      const dur = ms || Math.round(Math.min(1300, 600 + Math.hypot(x - wx, y - wy) * .8)), lx = g.W / 2 - at[0], ly = g.H / 2 - at[1], m = Math.hypot(lx, ly) || 1;
      wx = x; wy = y; away = !!(x || y);
      [['--gd', dur + 'ms'], ['--wx', x + 'px'], ['--wy', y + 'px'], ['--lx', (lx / m).toFixed(2)], ['--ly', (ly / m).toFixed(2)], ['--w', (wt -= 120) + 'deg']]
        .forEach(([k, v]) => dock.style.setProperty(k, v));
      cl.toggle('is-away', away); cl.toggle('is-l', at[0] < g.W / 2); cl.add('is-move');
      clearTimeout(mt); mt = setTimeout(() => { cl.remove('is-move'); if (ms !== 1) cue('is-land'); if (say) clean(speak); }, dur);
    };
    home = fast => { if (away) { if (saying()) fold(); go(null, fast ? 1 : 450); } };
    // out to a clear spot (2 probed at most), else a hop in place; text is taken
    const hop = done => {
      const g = G || geo(), all = spots(g);
      let i = 0, f = 0;
      for (let k = all.length; k > 1; k--) { const j = Math.floor(Math.random() * k); [all[k - 1], all[j]] = [all[j], all[k - 1]]; }
      const end = c => { if (c && free()) go(c, 0, 1); else if (!c) cue('is-bob'); done(!!c); };
      const next = () => {
        const c = all[i++];
        if (!c || f > 1) return end(null);
        probe(c[0] - g.s / 2 - 12, c[1] - g.s / 2 - 12, c[0] + g.s / 2 + 12, c[1] + g.s / 2 + 12, 3, 3, (r, old) => {
          if (!old) f++;
          if (!r) return end(c);
          next();
        });
      };
      next();
    };
    const speak = () => {   // until the chat opened or a bubble was dismissed
      if (!talk || still() || opened || ss('ts-cc') || ss('ts-cc-hush') || says > 3 || !hi.hidden || shut() || hover || now() - lastB < gap) return;
      // above it, else beside it (towards the page), on a clear area
      const g = G || geo(), s = g.s, l = cl.contains('is-l'), cx = g.hx + wx, cy = g.hy + wy - (cl.contains('is-lift') && !away ? 60 : 0);
      const w = Math.min(270, g.W - 32), ax = l ? cx - s / 2 : cx + s / 2 - w, by = cy - s / 2 - 10;
      const ws = Math.min(270, l ? g.W - cx - s / 2 - 26 : cx - s / 2 - 26), sx = l ? cx + s / 2 + 10 : cx - s / 2 - 10 - ws, w0 = wx + ',' + wy;
      const say = side => {
        if (w0 !== wx + ',' + wy || !hi.hidden || shut() || hover) return;
        const i = +ss('ts-cc-say') || 0;
        ss('ts-cc-say', String(i + 1)); says++; lastB = now(); gap = 2e4 + Math.random() * 1e4;
        dock.style.setProperty('--bw', (side ? ws : w) + 'px');
        pop(lines[i % lines.length], true, 7e3, side); cue('is-ring');
      };
      const beside = r => (!r ? say(0) : ws >= 200 && probe(sx, cy - 46, sx + ws, cy + 46, 4, 3, q => !q && say(1)));
      if (!away && [...inC].some(x => !x.matches(LIFT))) beside(2); else probe(ax, by - 92, ax + w, by, 4, 3, beside);
    };
    const later = (f, ms) => { clearTimeout(tk); tk = setTimeout(f, ms); };
    const settle = () => { calm = true; if (hopped) ss('ts-cc-calm', '1'); home(still()); later(rest, 9e3 + Math.random() * 6e3); };
    const rest = () => {   // calm: a breath or shimmer every 14-22 s, a line when due
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
      if (away) { go(null, 0, 1); return short || act > 6e4 ? settle() : later(step, 7e3 + Math.random() * 3e3); }
      if (short ? hopped : act > 6e4) return settle();
      hopped = true;
      clean(() => hop(out => later(step, out ? 5e3 + Math.random() * 1500 : 7e3 + Math.random() * 3e3)));
    };
    // menu, dialog, field: home at once
    new MutationObserver(() => { if (away && root.matches('.is-locked,.cc-open,.cc-field')) home(1); }).observe(root, { attributes: true, attributeFilter: ['class'] });
    // any bubble folds on scroll (25 Oct: the greeting sat over a link)
    let kr = 0;
    addEventListener('scroll', () => { lastS = now(); V.clear(); if (away) home(); else if (hi && !hi.hidden) fold(); if (tuck && !kr) kr = requestAnimationFrame(() => { kr = 0; kk(); }); }, { passive: true });
    ['pointerdown', 'keydown'].forEach(t => addEventListener(t, () => { lastS = now(); }, { passive: true, capture: true }));
    dock.addEventListener('pointerenter', () => { hover = true; });
    dock.addEventListener('pointerleave', () => { hover = false; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(tk); prev = 0; home(1); } else later(calm ? rest : step, 1500); });
    later(step, 1200);

    // the greeting: once a tab, after 8 s seen or 40% down the page (never in the first 3 s)
    if (!hi || ss('ts-cc-hello')) return;
    let left = 8e3, at = 0, tm = 0, pS = -1;
    const show = () => clean(greet), greet = () => {
      if (ss('ts-cc-hello')) return;
      if (!ok() || !hi.hidden || [...inC].some(x => !x.matches(LIFT)) || now() - t0 < 3e3 || now() - lastB < 12e3) { tm = setTimeout(show, 2e3); return; }   // never over a button
      const g = G || geo(), y = g.hy - g.s / 2 - (cl.contains('is-lift') ? 70 : 10), w = Math.min(300, g.W - 32);
      if (now() - lastS < 1e3 || pS === lastS) { tm = setTimeout(show, 2e3); return; }
      probe(g.hx + g.s / 2 - w, y - 150, g.hx + g.s / 2, y, 5, 3, r => {   // nor a link or headline
        if (r > 1 || !ok() || !hi.hidden) { if (r > 1) pS = lastS; tm = setTimeout(show, 2e3); return; }
        if (away) { home(); tm = setTimeout(show, 1e3); return; }
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
