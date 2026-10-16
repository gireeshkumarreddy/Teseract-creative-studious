/* What We Create — the reference "works" stack on the Website Design image card
   (ref-services-testimonials §2.7). The next image peeks from the bottom-right corner, the previous
   one from the top-right; clicking a peeking card brings it forward, the "Tap Here" badge advances
   (and wraps). The current card stays a normal link to the project. On touch screens the cards' hover motion plays
   while a card is centred (.is-live, below).
   Markup: scripts/sections/service_cards.py media(stack=True); styles: src/css/22-services.css. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  ready(() => {
    document.querySelectorAll('[data-svc-stack]').forEach(stack => {
      const cards = [...stack.querySelectorAll('[data-stack-card]')];
      const next = stack.querySelector('[data-stack-next]');
      const status = stack.querySelector('[data-stack-status]');
      if (cards.length < 2) { if (next) next.hidden = true; return; }
      cards.forEach(card => { if (card.dataset.cursor) card.dataset.cursorLabel = card.dataset.cursor; });
      let index = 0;
      const set = (n, announce) => {
        index = (n + cards.length) % cards.length;
        cards.forEach((card, k) => {
          const pos = Math.max(-2, Math.min(3, k - index));
          card.dataset.pos = String(pos);
          if (pos === 0) {
            card.removeAttribute('tabindex'); card.removeAttribute('aria-hidden');
            if (card.dataset.cursorLabel) card.dataset.cursor = card.dataset.cursorLabel;
          } else {
            card.setAttribute('tabindex', '-1'); card.setAttribute('aria-hidden', 'true');
            delete card.dataset.cursor; // a peeking card advances the stack instead of opening the project
          }
          // a card that comes into view is revealed even if the scroll observer has not fired for it
          const media = card.querySelector('.reveal-image');
          if (media && Math.abs(pos) <= 1) media.classList.add('is-in');
        });
        if (announce && status) status.textContent = `Image ${index + 1} of ${cards.length}`;
      };
      /* Tap Here attention cue: the badge wiggles (twice, CSS) each time the stack comes into view,
         until the visitor has used the stack once. */
      let cue = null;
      if (next && 'IntersectionObserver' in window) {
        cue = new IntersectionObserver(([e]) => stack.classList.toggle('is-cued', e.isIntersecting), { threshold: 0.6 });
        cue.observe(stack);
      }
      const used = () => { if (cue) { cue.disconnect(); cue = null; } stack.classList.remove('is-cued'); };
      cards.forEach((card, k) => card.addEventListener('click', e => {
        if (card.dataset.pos === '0') return;
        e.preventDefault();
        used();
        set(k, true);
      }));
      if (next) next.addEventListener('click', () => { used(); set(index + 1, true); });
      set(0, false);
    });

    /* Touch screens have no hover, so each card's hover motion plays while it is centred on screen instead (.is-live:
       it crosses the middle 30 % of the viewport): the folder papers lift (.svc-info); the parked stack cards lift and
       the AI mark rises with its orbit, tags and flow wires running (.svc-media, .svc-small__art); the small-card
       prints rise once (.was-live). The loops rest after 4.8 s (.is-rest, inside WCAG 2.2.2's 5 s, as the Tap Here
       cue) and play again on the next pass. Hover screens keep :hover; nothing moves under reduced motion. */
    if (TS.motion && TS.motion() && matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
      const rest = new WeakMap();
      const live = new IntersectionObserver(entries => entries.forEach(({ target: el, isIntersecting: on }) => {
        clearTimeout(rest.get(el));
        el.classList.toggle('is-live', on);
        el.classList.remove('is-rest');
        if (on) { el.classList.add('was-live'); rest.set(el, setTimeout(() => el.classList.add('is-rest'), 4800)); }
      }), { rootMargin: '-35% 0px -35% 0px' });
      document.querySelectorAll('.svc-info, .svc-media, .svc-small__art').forEach(el => live.observe(el));
    }

    /* Service rows are anchors (/what-we-create/#e-commerce, the page index, the home "+N" chips).
       A row that has not been revealed yet still carries its 60px reveal offset, so the scroll
       would land short of it: settle the row first (no transition), then let the scroll measure. */
    const settle = el => {
      if (!el || !el.matches('.svc-row[data-reveal]') || el.classList.contains('is-in')) return false;
      el.style.transition = 'none';
      el.classList.add('is-in');
      void el.offsetHeight;
      requestAnimationFrame(() => { el.style.transition = ''; });
      return true;
    };
    const target = hash => { try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; } };
    // capture phase: runs before the core's in-page anchor handler measures the target
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.pathname !== location.pathname) return;
      settle(target(a.hash));
    }, true);
    // bubble phase, after the core scrolled to the row: move focus there too (as a native fragment
    // jump would), so Tab continues inside the chosen service instead of in the page index
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || !e.defaultPrevented || a.pathname !== location.pathname) return;
      const el = target(a.hash);
      if (!el || !el.matches('.svc-row')) return;
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
    // arriving with a hash: the browser jumped before the reveal offset was removed — correct it
    const arrive = () => {
      const el = location.hash && target(location.hash);
      if (!settle(el)) return;
      const off = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 96;
      const y = el.getBoundingClientRect().top + window.scrollY - off;
      if (TS.lenis) TS.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    };
    arrive();
  });
})();
