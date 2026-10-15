/* Contact form (/contact/). Inline validation, then either
   - POST FormData to the configured form service (form[data-endpoint], from site.config.json "form_endpoint"), or
   - open a pre-filled email (mailto:) to the studio address (form[data-email]).
   Also: budget quick answers, select placeholder tint, ?service=… pre-selection, Enter moves to the next field
   (never submits), the iOS tap wash. Without JS the form
   submits natively (action = endpoint or mailto:). */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    form.noValidate = true;

    const card = form.closest('.ct-card') || form.parentElement;
    const done = card.querySelector('[data-done]');
    const doneTitle = card.querySelector('[data-done-title]');
    const doneText = card.querySelector('[data-done-text]');
    const reopen = card.querySelector('[data-reopen]');
    const edit = card.querySelector('[data-edit]');
    const status = form.querySelector('[data-status]');
    const submit = form.querySelector('[data-submit]');
    const submitSr = form.querySelector('[data-submit-sr]');
    const submitText = submitSr ? submitSr.textContent : '';
    const endpoint = (form.dataset.endpoint || '').trim();
    const studioEmail = (form.dataset.email || '').trim();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const required = [...form.querySelectorAll('[required]')];

    /* ---------- validation */
    const problem = el => {
      const v = el.value.trim();
      if (!v) return el.dataset.msgMissing || 'This field is required.';
      if (el.type === 'email' && !EMAIL_RE.test(v)) return el.dataset.msgInvalid || 'Please check this email address.';
      return '';
    };
    const show = (el, msg) => {
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      const err = document.getElementById(`${el.id}-err`);
      if (!err) return;
      err.querySelector('span').textContent = msg;
      err.hidden = !msg;
    };
    required.forEach(el => {
      // Validate on leave only once something was typed (tabbing through stays quiet) …
      el.addEventListener('blur', () => { if (el.value.trim() || el.hasAttribute('aria-invalid')) show(el, problem(el)); });
      // … and clear/update an error live while it is being fixed.
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') show(el, problem(el)); });
    });

    /* ---------- select placeholder tint */
    form.querySelectorAll('select').forEach(sel => {
      const sync = () => sel.classList.toggle('is-empty', !sel.value);
      sel.addEventListener('change', sync); sync();
    });

    /* ---------- budget quick answers (toggle buttons that fill the free-text field) */
    const budget = form.querySelector('#ct-budget');
    const quicks = [...form.querySelectorAll('[data-fill]')];
    const syncQuick = () => quicks.forEach(b => b.setAttribute('aria-pressed', String(!!budget && budget.value.trim() === b.dataset.fill)));
    quicks.forEach(b => b.addEventListener('click', () => {
      if (!budget) return;
      budget.value = budget.value.trim() === b.dataset.fill ? '' : b.dataset.fill;
      syncQuick();
    }));
    if (budget) budget.addEventListener('input', syncQuick);

    /* ---------- tap feedback: iOS Safari paints :active on touch only under a touch listener, so a passive no-op one
       on the form gives the chips and quick answers their short :active wash (35-contact.css; Android has it anyway) */
    form.addEventListener('touchstart', () => {}, { passive: true });

    /* ---------- Enter (the phone keyboard's "next", enterkeyhint) in a one-line field moves on to the next field
       instead of submitting half a form: only the button sends. The textarea keeps its newlines. */
    const fields = [...form.querySelectorAll('.ct-input')];
    form.addEventListener('keydown', e => {
      const el = e.target;
      if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229 || el.tagName !== 'INPUT' || !fields.includes(el)) return;
      e.preventDefault();
      const next = fields[fields.indexOf(el) + 1];
      if (next) next.focus();
    });

    /* ---------- ?service=website-design (or the exact name) pre-selects the select + chip */
    try {
      const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
      const want = norm(new URLSearchParams(location.search).get('service'));
      if (want) {
        const sel = form.querySelector('#ct-build');
        const opt = sel && [...sel.options].find(o => o.value && norm(o.value) === want);
        if (opt) { sel.value = opt.value; sel.dispatchEvent(new Event('change')); }
        const chip = [...form.querySelectorAll('input[name="help"]')].find(c => norm(c.value) === want);
        if (chip) chip.checked = true;
      }
    } catch (e) { /* ignore malformed URLs */ }

    /* ---------- helpers */
    const labelOf = name => {
      const field = form.elements[name];
      const el = field && (field.id ? form.querySelector(`label[for="${field.id}"]`) : null);
      return el && el.firstChild ? el.firstChild.textContent.trim() : name;
    };
    const legendOf = name => {
      const input = form.querySelector(`input[name="${name}"]`);
      const lg = input && input.closest('fieldset') && input.closest('fieldset').querySelector('legend');
      return lg && lg.firstChild ? lg.firstChild.textContent.trim() : name;
    };
    const values = () => {
      const fd = new FormData(form);
      const v = k => String(fd.get(k) || '').trim();
      return { name: v('name'), email: v('email'), company: v('company'), build: v('build'), help: fd.getAll('help').map(String), budget: v('budget'), idea: v('idea'), trap: v('_gotcha') };
    };
    const mailtoHref = d => {
      const lines = [`${labelOf('name')}: ${d.name}`, `${labelOf('email')}: ${d.email}`];
      if (d.company) lines.push(`${labelOf('company')}: ${d.company}`);
      if (d.build) lines.push(`${labelOf('build')} ${d.build}`);
      if (d.help.length) lines.push(`${legendOf('help')} ${d.help.join(', ')}`);
      if (d.budget) lines.push(`${labelOf('budget')}: ${d.budget}`);
      lines.push('', `${labelOf('idea')}:`, d.idea);
      const body = lines.join('\n').replace(/\r?\n/g, '\r\n');
      const subject = `New project — ${d.name}`;
      return `mailto:${studioEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    const mailLink = (text) => {
      const a = document.createElement('a');
      a.href = `mailto:${studioEmail}`; a.textContent = text || studioEmail;
      return a;
    };
    const busy = on => {
      submit.disabled = on;
      submit.classList.toggle('is-busy', on);
      form.setAttribute('aria-busy', String(on));
      if (submitSr) submitSr.textContent = on ? 'Sending…' : submitText;
    };
    const setStatus = nodes => {
      if (!status) return;
      status.replaceChildren(...nodes);
      status.hidden = !nodes.length;
    };
    const scrollIntoViewIfNeeded = el => {
      const r = el.getBoundingClientRect();
      if (r.top < 80 || r.top > innerHeight * 0.7) TS.scrollTo ? TS.scrollTo(el, { offset: -120 }) : el.scrollIntoView({ block: 'start' });
    };

    /* ---------- success / edit */
    const showDone = (mode, href) => {
      if (!done) return;
      doneText.replaceChildren();
      if (mode === 'sent') {
        doneTitle.textContent = 'Thank you. Your message is on its way.';
        doneText.append("We'll take it from there.");
      } else {
        doneTitle.textContent = 'Your email app should now be open.';
        doneText.append('Your message is written and ready, just press send. If nothing opened, you can write to us at ', mailLink(), '.');
      }
      if (reopen) { reopen.hidden = mode === 'sent'; if (href) reopen.href = href; }
      card.classList.add('is-sent');
      done.hidden = false;
      done.focus({ preventScroll: true });
      scrollIntoViewIfNeeded(card);
    };
    if (edit) edit.addEventListener('click', () => {
      card.classList.remove('is-sent');
      done.hidden = true;
      const first = form.querySelector('#ct-name');
      if (first) first.focus();
    });

    /* ---------- submit */
    form.addEventListener('submit', async e => {
      e.preventDefault();
      setStatus([]);
      let firstBad = null;
      required.forEach(el => { const msg = problem(el); show(el, msg); if (msg && !firstBad) firstBad = el; });
      if (firstBad) {
        scrollIntoViewIfNeeded(firstBad);
        firstBad.focus({ preventScroll: !!TS.lenis });
        return;
      }
      const d = values();

      if (!endpoint) {
        const href = mailtoHref(d);
        window.location.href = href;
        showDone('mail', href);
        return;
      }
      if (d.trap) { showDone('sent'); return; } // honeypot filled: quietly drop

      busy(true);
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.reset();
        form.querySelectorAll('select').forEach(s => s.dispatchEvent(new Event('change')));
        syncQuick();
        showDone('sent');
      } catch (err) {
        setStatus(["Something went wrong and your message wasn't sent. Please try again, or email us at ", mailLink(), '.']);
      } finally {
        busy(false);
      }
    });
  });
})();
