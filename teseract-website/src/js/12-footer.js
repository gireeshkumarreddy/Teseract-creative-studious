/* Footer: live clock (visitor's local time, or the studio's when the markup carries data-tz), ring
   rotation paused off-screen (reference loopPauseOffscreen), and early loading of the ring images
   so cards never pop in mid-rotation. Phones show the ring at phone scale too (12-footer.css); on touch
   screens and under Save-Data its images are fetched only as the footer approaches, never on idle. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    const panels = [...document.querySelectorAll('[data-ft]')];
    if (!panels.length) return;

    /* ---------- Clock: "10:06:57 PM — your local time" (tabular figures, updates every second) */
    const clocks = [...document.querySelectorAll('[data-ft-clock]')];
    const tz = (clocks[0] && clocks[0].getAttribute('data-tz')) || undefined;
    const make = (locale, opts) => { try { return new Intl.DateTimeFormat(locale, Object.assign(opts, tz ? { timeZone: tz } : {})); } catch (e) { return null; } };
    const fmt = make('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const iso = make('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    if (!fmt || !iso) {
      // unknown time zone (or no Intl): hide the line rather than show a wrong time
      clocks.forEach(c => { const line = c.closest('p'); if (line) line.hidden = true; });
      clocks.length = 0;
    }
    const tick = () => {
      if (!clocks.length) return;
      const now = new Date();
      const text = fmt.format(now).replace(/ /g, ' ');
      const dt = iso.format(now);
      clocks.forEach(c => { if (c.textContent !== text) c.textContent = text; c.setAttribute('datetime', dt); });
    };
    let timer = 0;
    const startClock = () => {
      if (timer || !clocks.length) return;
      tick();
      // align updates to the start of each second
      const loop = () => { tick(); timer = setTimeout(loop, 1000 - (Date.now() % 1000)); };
      timer = setTimeout(loop, 1000 - (Date.now() % 1000));
    };
    const stopClock = () => { clearTimeout(timer); timer = 0; };
    tick();

    /* ---------- Ring images: fade in once loaded; fetch early, but only where the ring is shown */
    const ring = document.querySelector('[data-ft-ring]');
    const wrap = ring && ring.closest('.ft__ring-wrap');
    const ringImgs = ring ? [...ring.querySelectorAll('img')] : [];
    if (ring) {
      ring.setAttribute('data-fade', '');
      ringImgs.forEach(img => {
        const card = img.closest('.ft__card');
        const done = () => card && card.classList.add('is-loaded');
        if (img.complete && img.naturalWidth) done();
        else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
      });
    }
    const ringShown = () => !!wrap && wrap.getClientRects().length > 0;
    let eagerDone = !ringImgs.length;
    const eager = () => {
      if (eagerDone || !ringShown()) return eagerDone;
      ringImgs.forEach(img => { if (img.loading !== 'eager') img.loading = 'eager'; });
      eagerDone = true;
      return true;
    };

    /* ---------- Visibility: run the clock + ring only while a footer panel is on screen */
    const visible = new Set();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          en.target.classList.toggle('is-live', en.isIntersecting);
          if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
        });
        if (visible.size && !document.hidden) startClock(); else stopClock();
      }, { threshold: 0 });
      panels.forEach(p => io.observe(p));
      if (!eagerDone) {
        const near = new IntersectionObserver(entries => {
          if (entries.some(en => en.isIntersecting) && eager()) near.disconnect();
        }, { rootMargin: '1600px 0px 1600px 0px' });
        panels.forEach(p => near.observe(p));
        // Jumps (End key, anchors) can skip the margin: also fetch on idle after load, unless the visitor
        // asked to save data or is on a touch screen (no End key; the near margin covers a fling).
        const noIdle = (navigator.connection && navigator.connection.saveData) || matchMedia('(hover: none) and (pointer: coarse)').matches;
        const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
        const later = () => setTimeout(() => idle(() => { if (eager()) near.disconnect(); }, { timeout: 4000 }), 2500);
        if (!noIdle) {
          if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
        }
      }
    } else {
      panels.forEach(p => p.classList.add('is-live'));
      eager();
      startClock();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopClock(); else if (visible.size) startClock();
    });
  });
})();
