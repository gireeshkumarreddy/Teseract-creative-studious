/* Home 4 — WHAT WE BELIEVE (image 10). Markup: scripts/sections/home_believe.py, CSS 23-believe.css.

   1. Scroll-linked statement ink: the lead sentence starts in the reference grey and brightens word
      by word to white as the block's centre travels from 85 % to 50 % of the viewport (done by the
      time it reaches the natural reading position). The continuation keeps the reference grey, so
      the statement settles on the reference's two-tone composition, the same state reduced motion
      and no-JS visitors get. JS writes one custom property per frame (--p on the block); each lead
      word carries its own threshold (--a) and the CSS maps both to opacity.
   2. Count-up for numeric stats ("20K+", "2M+"): an aria-hidden overlay counts while the real value
      (the exact document string) stays in the DOM, invisible but in place, so there is no layout shift
      and assistive tech / crawlers only ever see the final text. Values below 10 count with one
      decimal (0.0 → 1.9 M+) and land on the exact string ("2M+").
   Everything else (rises, clip reveals, rules) is CSS on the 02-core reveal classes.
   Ink and count-up are off under reduced motion and without JS: the static two-tone statement and
   the final numbers show. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const motion = () => (TS.motion ? TS.motion() : document.documentElement.classList.contains('motion'));
  const RAMP = 1 / 5;   // per-word ramp width in progress units (CSS multiplies by 5): ~2 words light at once

  function ink(block) {
    const lead = block.querySelector('.bel__lead');
    const words = lead ? [...lead.querySelectorAll('.w__i')] : [];   // created by 02-core's data-split
    if (!words.length) return;
    words.forEach((w, i) => {
      const t = words.length > 1 ? i / (words.length - 1) : 0;
      w.style.setProperty('--a', ((1 - RAMP) * t).toFixed(4));
    });
    block.classList.add('is-ink');

    let raf = 0, last = -1, listening = false;
    const update = () => {
      raf = 0;
      const r = block.getBoundingClientRect();
      const vh = innerHeight || document.documentElement.clientHeight;
      const start = vh * 0.85, end = vh * 0.5;
      const p = Math.min(1, Math.max(0, (start - (r.top + r.height / 2)) / (start - end)));
      if (Math.abs(p - last) > 0.0004) { last = p; block.style.setProperty('--p', p.toFixed(4)); }
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(update); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !listening) addEventListener('scroll', request, { passive: true });
        if (!e.isIntersecting && listening) removeEventListener('scroll', request);
        listening = e.isIntersecting;
        request();                              // settle on the exact value when leaving too
      }, { rootMargin: '20% 0px 20% 0px' }).observe(block);
    } else addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    update();
  }

  const easeOut = t => (t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));   // cubic: the digits visibly tick, then settle

  function countUp(stat) {
    const num = stat.querySelector('.bel__num[data-count]');
    if (!num) return;
    const final = num.textContent;
    const raw = num.dataset.count;
    const to = parseFloat(raw);
    const suffix = num.dataset.suffix || '';
    if (!isFinite(to) || final !== raw + suffix) return;      // only animate values we can reproduce exactly
    const decimals = (raw.split('.')[1] || '').length || (to < 10 ? 1 : 0);
    const overlay = document.createElement('span');
    overlay.className = 'bel__count';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.textContent = (0).toFixed(decimals) + suffix;
    num.classList.add('is-counting');
    num.after(overlay);
    const finish = () => { overlay.remove(); num.classList.remove('is-counting'); };
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const delay = (parseFloat(getComputedStyle(stat).getPropertyValue('--d')) || 0) + 180;
      const dur = 1800;
      setTimeout(() => {
        const t0 = performance.now();
        const step = now => {
          const t = Math.min(1, (now - t0) / dur);
          const v = (to * easeOut(t)).toFixed(decimals);
          overlay.textContent = parseFloat(v) === to ? final : v + suffix;   // '2.0M+' never shows: lands on '2M+'
          if (t < 1) requestAnimationFrame(step); else finish();   // settle on the document string
        };
        requestAnimationFrame(step);
      }, delay);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.5 });
    io.observe(stat);
  }

  ready(() => {
    const root = document.querySelector('.bel');
    if (!root || !motion()) return;
    const block = root.querySelector('[data-bel-ink]');
    if (block) ink(block);
    if ('IntersectionObserver' in window) root.querySelectorAll('.bel__stat').forEach(countUp);
  });
})();
