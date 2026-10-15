/* Home FAQ accordion (reference component framer-TAjGh).
   Markup: [data-faq] > [data-faq-item] > h3 > button[aria-expanded][aria-controls] + answer panel.
   Items are independent (several may be open). Opening un-hides the panel, then the CSS grid-row
   transition grows it (300ms cubic-bezier(.44,0,.56,1)); closing collapses it and re-hides it so the
   answer leaves the accessibility tree. Closed answers use hidden="until-found" where supported, so
   the browser's find-in-page still reaches them (the match opens the item). The whole card toggles
   on click, like the reference; Up/Down/Home/End move between questions. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reduced = () => (TS.reduced ? TS.reduced() : matchMedia('(prefers-reduced-motion: reduce)').matches);
  const DURATION = 340;
  const HIDE = 'onbeforematch' in document.documentElement ? 'until-found' : true;

  ready(() => {
    document.querySelectorAll('[data-faq]').forEach(list => {
      const items = [...list.querySelectorAll('[data-faq-item]')];
      const buttons = [];
      items.forEach(item => {
        const btn = item.querySelector('button[aria-controls]');
        const panel = btn && document.getElementById(btn.getAttribute('aria-controls'));
        if (!btn || !panel) return;
        buttons.push(btn);
        let timer = 0;
        const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
        const set = open => {
          clearTimeout(timer);
          btn.setAttribute('aria-expanded', String(open));
          if (open) {
            panel.hidden = false;
            void panel.offsetHeight;           // commit the collapsed row before animating
            item.classList.add('is-open');
          } else {
            item.classList.remove('is-open');
            timer = setTimeout(() => { if (!isOpen()) panel.hidden = HIDE; }, reduced() ? 0 : DURATION);
          }
        };
        if (isOpen()) item.classList.add('is-open'); else panel.hidden = HIDE;
        btn.addEventListener('click', () => set(!isOpen()));
        // find-in-page hit: open instantly (no height tween) so the browser scrolls to the final spot
        panel.addEventListener('beforematch', () => {
          if (isOpen()) return;
          panel.style.transition = 'none';
          set(true);
          void panel.offsetHeight;
          requestAnimationFrame(() => { panel.style.transition = ''; });
        });
        item.addEventListener('click', e => {
          if (e.target.closest('button, a, input, select, textarea')) return;
          const sel = window.getSelection && String(window.getSelection());
          if (sel) return;                      // let people select answer text
          set(!isOpen());
        });
      });

      list.addEventListener('keydown', e => {
        const i = buttons.indexOf(document.activeElement);
        if (i < 0) return;
        let next = -1;
        if (e.key === 'ArrowDown') next = (i + 1) % buttons.length;
        else if (e.key === 'ArrowUp') next = (i - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = buttons.length - 1;
        if (next < 0) return;
        e.preventDefault();
        buttons[next].focus();
      });
    });
  });
})();
