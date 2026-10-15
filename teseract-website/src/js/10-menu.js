/* Menu overlay (image 3). Markup: scripts/chrome_menu.py · styles + choreography: src/css/11-menu.css.
   - Opens from any [data-menu-open]; closes via the X, Escape, or a link (page transitions in
     02-core.js take over navigation; a link to the current page just closes the menu).
   - While open: role=dialog/aria-modal, focus trapped, page siblings inert, scroll locked through
     TS.lockScroll, trigger aria-expanded + label updated. Focus returns to the trigger on close.
   - Choreography is CSS (state classes .is-open / .is-closing on .menu), so it is interruptible:
     re-opening mid-close simply reverses the running transitions.
   - Art tie-in: the "01 —" marker rolls to the hovered / focused item's index.
   - Header hand-off: the header is logo + three-line toggle. Opened from that toggle, the overlay's bar
     is anchored to it (.is-anchored + --tgl-x/--tgl-y, see 11-menu.css): the circle grows from the
     toggle, the X lands exactly where the hamburger was (the header morphs it to an X underneath via
     aria-expanded), and the circle closes back into it while focus returns to it. */
(() => {
  'use strict';
  const TS = window.TS = window.TS || {};
  const root = document.documentElement;
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = () => (TS.motion ? TS.motion() : root.classList.contains('motion') && !reducedMQ.matches);

  ready(() => {
    const menu = document.getElementById('site-menu');
    if (!menu || !menu.querySelector('.menu__inner')) return;
    const closeBtn = menu.querySelector('[data-menu-close]');
    const art = menu.querySelector('.menu__art');
    const num = menu.querySelector('[data-menu-num]');
    const list = menu.querySelector('.menu__list');
    const links = [...menu.querySelectorAll('.menu__link')];
    const homeIndex = Math.max(0, links.findIndex(a => a.hasAttribute('aria-current')));
    let state = 'closed';          // closed | open | closing
    let opener = null, timer = 0, inerted = [], after = null, shown = homeIndex, origin = null, anchorEl = null, openedAt = 0;

    /* ---------- helpers */
    const focusables = () => [...menu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');

    const strokeScale = () => {           // keep 1px hairlines at any panel scale (see CSS --k)
      if (!art) return;
      const w = art.getBoundingClientRect().width;
      if (w > 0) art.style.setProperty('--k', (900 / w).toFixed(4));
    };
    if (art && 'ResizeObserver' in window) new ResizeObserver(strokeScale).observe(art);

    const setOrigin = trigger => {        // circle reveal grows from the trigger's centre
      const vw = innerWidth, vh = innerHeight;
      if (trigger) {
        const r = trigger.getBoundingClientRect();
        origin = r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null;
      }
      const [x, y] = origin || [vw * 0.922, vh * 0.07];
      const radius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)) + 8;
      menu.style.setProperty('--ox', `${x.toFixed(1)}px`);
      menu.style.setProperty('--oy', `${y.toFixed(1)}px`);
      menu.style.setProperty('--or', `${Math.ceil(radius)}px`);
    };

    /* Bar anchoring: only for a trigger in the header band (top-right), e.g. the header's three-line
       toggle. Measured after the page scroll lock, against the overlay's own client width, so the X
       sits on the toggle with or without a (compensated) scrollbar. */
    const anchor = trigger => {
      const r = trigger && trigger.getClientRects().length ? trigger.getBoundingClientRect() : null;
      const w = menu.clientWidth || innerWidth;
      if (!r || r.top > 140 || r.bottom < 0 || r.left < w * 0.5) {
        menu.classList.remove('is-anchored');
        return;
      }
      menu.style.setProperty('--tgl-x', `${(w - (r.left + r.width / 2)).toFixed(1)}px`);
      menu.style.setProperty('--tgl-y', `${(r.top + r.height / 2).toFixed(1)}px`);
      menu.classList.add('is-anchored');
    };
    const headerToggle = () => document.querySelector('.site-header [data-menu-open]') || document.querySelector('[data-menu-open]');

    const setInert = on => {
      if (on) {
        inerted = [...document.body.children].filter(el => el !== menu && !el.inert && !/^(SCRIPT|TEMPLATE|STYLE|LINK)$/.test(el.tagName));
        inerted.forEach(el => { el.inert = true; });
      } else {
        inerted.forEach(el => { el.inert = false; });
        inerted = [];
      }
    };

    const syncTriggers = open => {
      document.querySelectorAll('[data-menu-open]').forEach(t => {
        if (t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', String(open));
        const label = t.querySelector('.sr-only');
        if (label && /menu/i.test(label.textContent)) label.textContent = open ? 'Close menu' : 'Open menu';
        else if (t.hasAttribute('aria-label') && /menu/i.test(t.getAttribute('aria-label'))) t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
    };

    const lock = on => {
      // compensate the scrollbar that overflow:hidden removes (no layout shift behind the reveal).
      // A plain inline padding, not a custom property on <html>: an inherited custom property
      // change would restyle every element of the page on the first frame.
      if (on) {
        const sbw = Math.max(0, innerWidth - root.clientWidth);
        if (sbw) root.style.paddingRight = `${sbw}px`;
        root.classList.add('menu-is-open');
      } else {
        root.classList.remove('menu-is-open');
        root.style.removeProperty('padding-right');
      }
      if (TS.lockScroll) TS.lockScroll(on);
    };

    /* ---------- pointer settle: the overlay opens under a stationary cursor (at 1440 the header
       toggle sits right where the menu's "Start a Project" pill appears). Until the mouse really
       moves (> 6px), .is-settling keeps every hover style off (CSS) and a pointer click on that
       same spot (e.g. the second click of a double-click on the toggle) is swallowed, so nothing
       flashes or navigates by accident. Hit-testing is untouched; keyboard activation (detail 0)
       always goes through. Fine pointers only: touch never sees this. */
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let settleAt = null;
    const onSettleMove = e => {
      if (!settleAt || Math.hypot(e.clientX - settleAt[0], e.clientY - settleAt[1]) <= 6) return;
      settle();
      const link = e.target && e.target.closest ? e.target.closest('.menu__link') : null;
      if (link) roll(links.indexOf(link));    // its pointerenter was skipped while settling
    };
    menu.addEventListener('click', e => {
      if (!settleAt || e.detail === 0) return;
      // the X sits exactly on the hamburger: a deliberate click on it (not the tail of a double-click
      // on the toggle) closes the menu even if the mouse never moved
      if (closeBtn && closeBtn.contains(e.target) && e.detail === 1 && performance.now() - openedAt > 500) return;
      e.preventDefault(); e.stopPropagation();
    }, true);
    // ...and the tail of that double-click neither selects a word (e.g. the CTA's "Start") nor moves
    // focus. Document-level: in the very first frame the circle reveal has no radius yet, so that
    // second press can land outside the overlay.
    document.addEventListener('mousedown', e => { if (settleAt && e.detail > 1) e.preventDefault(); }, true);
    function settle() {
      settleAt = null;
      menu.classList.remove('is-settling');
      document.removeEventListener('pointermove', onSettleMove, true);
    }
    const unsettle = pt => {
      if (!pt || !finePointer.matches) return;
      settleAt = pt;
      menu.classList.add('is-settling');
      document.addEventListener('pointermove', onSettleMove, true);
    };

    /* ---------- "01 —" marker roll */
    const focusVisible = el => { try { return el.matches(':focus-visible'); } catch (err) { return true; } };
    const pad = i => String(i + 1).padStart(2, '0');
    const roll = i => {
      if (!num || i === shown || i < 0) return;
      const dir = i > shown ? 1 : -1;
      shown = i;
      const spans = [...num.children];
      spans.slice(0, -1).forEach(s => s.remove());
      const old = spans[spans.length - 1];
      const next = document.createElement('span');
      next.textContent = pad(i);
      if (!motion() || !next.animate || !old) { num.replaceChildren(next); return; }
      num.appendChild(next);
      const opts = { duration: 350, easing: 'cubic-bezier(.16,1,.3,1)' };
      next.animate([{ transform: `translateY(${100 * dir}%)` }, { transform: 'translateY(0)' }], opts);
      old.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-100 * dir}%)` }], Object.assign({ fill: 'forwards' }, opts))
        .finished.then(() => old.remove(), () => {});
    };
    links.forEach((a, i) => {
      a.addEventListener('pointerenter', () => { if (!settleAt) roll(i); });
      // keyboard focus rolls the marker; the quiet programmatic focus of a mouse-opened menu
      // does not, so the marker keeps showing the current page's index
      a.addEventListener('focus', () => { if (focusVisible(a)) roll(i); });
    });
    if (list) {
      // back to the current page's index, unless keyboard focus (visible) sits on an item; the quiet
      // programmatic focus of a mouse-opened menu does not hold the marker
      list.addEventListener('pointerleave', () => {
        const a = document.activeElement, i = links.indexOf(a);
        roll(i >= 0 && focusVisible(a) ? i : homeIndex);
      });
      list.addEventListener('focusout', e => { if (!list.contains(e.relatedTarget)) roll(homeIndex); });
    }

    /* ---------- open / close */
    function open(trigger, pointerAt) {
      if (state === 'open') return;
      clearTimeout(timer);
      const fromClosed = state === 'closed';
      opener = trigger || (document.activeElement !== document.body ? document.activeElement : null);
      anchorEl = trigger || headerToggle();
      setOrigin(trigger);
      unsettle(pointerAt);
      menu.hidden = false;
      menu.inert = false;
      menu.removeAttribute('aria-hidden');
      if (fromClosed) {
        lock(true);
        openedAt = performance.now();
        menu.scrollTop = 0;
        anchor(anchorEl);
        roll(homeIndex);
        strokeScale();
        void menu.offsetWidth;            // commit the pre-open pose so the transitions run
      }
      setInert(true);
      syncTriggers(true);
      menu.classList.remove('is-closing');
      menu.classList.add('is-open');
      menu.dataset.state = 'open';
      state = 'open';
      const first = links[0] || closeBtn;
      if (first) first.focus({ preventScroll: true });
      document.addEventListener('keydown', onKey, true);
    }

    function finish() {
      clearTimeout(timer);
      settle();
      menu.classList.remove('is-open', 'is-closing');
      menu.dataset.state = 'closed';
      menu.hidden = true;
      menu.inert = false;
      menu.removeAttribute('aria-hidden');
      state = 'closed';
      lock(false);
      const cb = after; after = null;
      if (cb) cb();
    }

    function close(opts = {}) {
      if (state !== 'open') return;
      state = 'closing';
      settle();
      after = opts.after || null;
      document.removeEventListener('keydown', onKey, true);
      menu.classList.remove('is-open');
      menu.classList.add('is-closing');
      menu.dataset.state = 'closing';
      syncTriggers(false);
      setInert(false);
      // leave the dialog out of the accessibility tree while it animates away
      menu.setAttribute('aria-hidden', 'true');
      menu.inert = true;
      const target = opener && opener.isConnected && opener.getClientRects().length ? opener : document.querySelector('[data-menu-open]');
      setOrigin(target);                  // the circle closes back into the control (re-measured: the page may have resized)
      if (opts.restoreFocus !== false && target) target.focus({ preventScroll: true });
      opener = null;
      if (opts.instant) { finish(); return; }
      timer = setTimeout(finish, motion() ? 690 : 220);
    }

    function onKey(e) {
      if (state !== 'open') return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      if (!menu.contains(active)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }

    /* ---------- wiring */
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-menu-open]');
      if (!t || menu.contains(t)) return;
      e.preventDefault();
      // e.detail is 0 for keyboard activation (Enter / Space): no pointer to settle then
      if (state === 'open') close(); else open(t, e.detail ? [e.clientX, e.clientY] : null);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => close());

    menu.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || state !== 'open' || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.getAttribute('aria-disabled') === 'true' || a.target) return;
      const url = new URL(a.href, location.href);
      // a link to the page we are already on: just close (and go back to the top)
      if (url.origin === location.origin && url.pathname === location.pathname && !url.hash) {
        e.preventDefault();
        close({ restoreFocus: false, after: () => { if (TS.scrollTo) TS.scrollTo(0, { offset: 0 }); else scrollTo(0, 0); const m = document.getElementById('main'); if (m) m.focus({ preventScroll: true }); } });
      }
      // otherwise 02-core.js runs the page transition (or the browser navigates immediately)
    });

    // back/forward cache: never come back to a half-open overlay
    addEventListener('pageshow', ev => { if (ev.persisted && state !== 'closed') { document.removeEventListener('keydown', onKey, true); syncTriggers(false); setInert(false); opener = null; finish(); } });
    // the header toggle moves with the viewport (max-width centring, breakpoints): follow it
    addEventListener('resize', () => {
      if (state !== 'open') return;
      const t = anchorEl && anchorEl.isConnected ? anchorEl : headerToggle();
      setOrigin(t);
      anchor(t);
    }, { passive: true });

    // (no font warm-up: the menu uses the site's single typeface, already loaded by the page)

    TS.menu = { open: t => open(t || document.querySelector('[data-menu-open]')), close: () => close(), get state() { return state; } };
  });
})();
