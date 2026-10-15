/* "View Project" cursor pill. Any element with data-cursor="Label" shows a pill that trails the
   pointer (hover-capable fine pointers only). Keyboard users get the same label via the link's
   accessible name, so this is purely decorative. data-cursor-icon="drag" swaps the arrow for a
   left-right arrow (the Client Stories deck: "Drag"); a data-cursor-off element inside a
   data-cursor area hides the pill (a button that names itself); the pill shrinks while pressed. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  TS.ready && TS.ready(() => {
    if (!fine.matches) return;
    const pill = document.createElement('div');
    pill.className = 'cursor-pill';
    pill.setAttribute('aria-hidden', 'true');
    pill.innerHTML = '<span class="cursor-pill__label"></span><span class="cursor-pill__icon cursor-pill__icon--ne"><svg viewBox="0 0 16 16"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
      + '<span class="cursor-pill__icon cursor-pill__icon--drag"><svg viewBox="0 0 16 16"><path d="M2.5 8h11M5 5.5 2.5 8 5 10.5M11 5.5 13.5 8 11 10.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    document.body.appendChild(pill);
    const label = pill.querySelector('.cursor-pill__label');
    let x = -200, y = -200, cx = x, cy = y, active = null, raf = 0;
    const smooth = !(TS.reduced && TS.reduced());
    const tick = () => {
      cx += (x - cx) * (smooth ? 0.2 : 1);
      cy += (y - cy) * (smooth ? 0.2 : 1);
      pill.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const move = e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(tick); };
    const target = el => { const t = el && el.closest && el.closest('[data-cursor],[data-cursor-off]'); return t && t.hasAttribute('data-cursor') ? t : null; };
    document.addEventListener('pointermove', e => {
      move(e);
      const t = target(e.target);
      if (t !== active) {
        active = t;
        if (t) { label.textContent = t.dataset.cursor || 'View Project'; pill.classList.toggle('is-external', t.dataset.cursorExternal === 'true'); }
        pill.classList.toggle('is-drag', !!t && t.dataset.cursorIcon === 'drag');
        pill.classList.toggle('is-on', !!t);
        document.documentElement.classList.toggle('has-cursor-pill', !!t);
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { active = null; pill.classList.remove('is-on'); }, { passive: true });
    document.addEventListener('pointerdown', () => { if (active) pill.classList.add('is-pressed'); }, { passive: true });
    ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, () => pill.classList.remove('is-pressed'), { passive: true }));
    window.addEventListener('scroll', () => {
      if (!active) return;
      const t = document.elementFromPoint(x, y);
      if (!target(t)) { active = null; pill.classList.remove('is-on'); }
    }, { passive: true });
  });
})();
