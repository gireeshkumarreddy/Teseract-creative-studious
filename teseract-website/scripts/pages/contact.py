"""CONTACT page (/contact/): hero, project form (left) + "Before you send" card (right).

Behaviour lives in src/js/35-contact.js:
  * site.config.json "form_endpoint" set  -> POST FormData to it (data-endpoint) and show success/error;
  * otherwise                              -> open a pre-filled mailto: to CONFIG.email.
Without JS the form still works natively (action = endpoint, or mailto: with text/plain).
CSS: src/css/35-contact.css (.ct-*). Footer CTA is suppressed for this page by chrome.document.
"""
from lib import E, fmt, CONFIG, BRAND, ICONS, roll
from content import CONTACT, CREATE, PRIMARY_CTA
from pages.who import page_hero, mark3d, SEAL, DOTS

EMAIL = CONFIG.get('email') or ''
ENDPOINT = (CONFIG.get('form_endpoint') or '').strip()
PLACEHOLDER = bool(CONFIG.get('email_is_placeholder'))
SERVICES = [s['name'] for s in CREATE['services']]
# Spam trap for form services (Formspree & co. drop submissions that fill "_gotcha").
HONEYPOT = ('<div class="ct-hp" aria-hidden="true"><label for="ct-website">Leave this field empty</label>'
            '<input id="ct-website" name="_gotcha" type="text" tabindex="-1" autocomplete="off"></div>')

ERR_ICON = ('<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.6" fill="none" '
            'stroke="currentColor" stroke-width="1.4"/><path d="M8 4.6v4.2" stroke="currentColor" stroke-width="1.6" '
            'stroke-linecap="round"/><circle cx="8" cy="11.3" r=".95" fill="currentColor"/></svg>')

# Inline validation copy (UI text, not marketing content).
MESSAGES = {
    'name': {'missing': 'Please tell us your name.'},
    'email': {'missing': 'Please add your email address so we can reply.',
              'invalid': "That email address doesn't look quite right."},
    'idea': {'missing': 'Tell us a little about your idea. A sentence or two is plenty.'},
}


def _field_meta():
    return {key: (label, kind, req) for key, label, kind, req in CONTACT['form']['fields']}


def _label(fid, text, required, hint=''):
    req = '<span class="ct-req" aria-hidden="true">*</span>' if required else ''
    # Leading space keeps the accessible name readable ("Estimated Budget Optional", not "BudgetOptional").
    h = f' <span class="ct-hint">{E(hint)}</span>' if hint else ''
    return f'<label class="ct-label" for="ct-{fid}">{E(text)}{req}{h}</label>'


def _err(fid):
    return f'<p class="ct-err" id="ct-{fid}-err" hidden>{ERR_ICON}<span></span></p>'


def _input(fid, label, required, *, type_='text', autocomplete='', placeholder='', full=False, extra=''):
    ac = f' autocomplete="{autocomplete}"' if autocomplete else ''
    ph = f' placeholder="{E(placeholder)}"' if placeholder else ''
    req = ' required aria-required="true"' if required else ''
    desc = f' aria-describedby="ct-{fid}-err"' if required else ''
    msgs = MESSAGES.get(fid, {})
    data = ''.join(f' data-msg-{k}="{E(v)}"' for k, v in msgs.items())
    return (f'<div class="ct-field{" ct-field--full" if full else ""}">{_label(fid, label, required)}'
            f'<input class="ct-input" id="ct-{fid}" name="{fid}" type="{type_}"{ac}{ph}{req}{desc}{data}{extra}>'
            f'{_err(fid) if required else ""}</div>')


def _form(ctx):
    f = _field_meta()
    cta = CONTACT['form']['cta']
    build_opts = ''.join(f'<option value="{E(n)}">{E(n)}</option>' for n in SERVICES + ['Something else'])
    chips = ''.join(
        f'<label class="ct-chip"><input type="checkbox" name="help" value="{E(n)}">'
        f'<span><span class="ct-chip__tick" aria-hidden="true">{ICONS["check"]}</span>{E(n)}</span></label>'
        for n in SERVICES)
    quick = ''.join(f'<button type="button" class="ct-quick" data-fill="{E(v)}" aria-pressed="false">{E(v)}</button>'
                    for v in ("Not sure yet", "Let's discuss"))
    name_l, _, name_r = f['name']
    email_l, _, email_r = f['email']
    comp_l, _, comp_r = f['company']
    build_l, _, _ = f['build']
    help_l, _, _ = f['help']
    budget_l, _, _ = f['budget']
    idea_l, _, idea_r = f['idea']
    if ENDPOINT:
        action, extra_attrs = E(ENDPOINT), 'method="post"'
        note = f'Your message is sent straight to {E(BRAND)}.'
    else:
        action, extra_attrs = E(f'mailto:{EMAIL}'), 'method="post" enctype="text/plain"'
        note = 'Pressing the button opens your email app with everything filled in, ready for you to send.'
    privacy = f'<a class="ct-link" href="{ctx.url("privacy")}">How we handle your details</a>'
    idea_msgs = ''.join(f' data-msg-{k}="{E(v)}"' for k, v in MESSAGES['idea'].items())
    return f'''<form class="ct-form" id="contact-form" action="{action}" {extra_attrs} data-contact-form
        data-endpoint="{E(ENDPOINT)}" data-email="{E(EMAIL)}" data-brand="{E(BRAND)}"{' data-email-placeholder="true"' if PLACEHOLDER else ''}>
      <div class="ct-form__grid">
        {_input('name', name_l, name_r, autocomplete='name', extra=' autocapitalize="words" enterkeyhint="next"')}
        {_input('email', email_l, email_r, type_='email', autocomplete='email', extra=' inputmode="email" spellcheck="false" enterkeyhint="next"')}
        {_input('company', comp_l, comp_r, autocomplete='organization', extra=' enterkeyhint="next"')}
        <div class="ct-field">
          {_label('build', build_l, False)}
          <div class="ct-select"><select class="ct-input" id="ct-build" name="build">
            <option value="">Choose one</option>{build_opts}
          </select></div>
        </div>
        <fieldset class="ct-field ct-field--full ct-fieldset">
          <legend class="ct-label">{E(help_l)} <span class="ct-hint">Choose any</span></legend>
          <div class="ct-chips">{chips}</div>
        </fieldset>
        <div class="ct-field ct-field--full">
          {_label('budget', budget_l, False, hint='Optional')}
          <div class="ct-budget">
            <input class="ct-input" id="ct-budget" name="budget" type="text" autocomplete="off" enterkeyhint="next" placeholder="e.g. a range you have in mind">
            <div class="ct-quicks" role="group" aria-label="Quick answers for {E(budget_l)}">{quick}</div>
          </div>
        </div>
        <div class="ct-field ct-field--full">
          {_label('idea', idea_l, idea_r)}
          <textarea class="ct-input ct-textarea" id="ct-idea" name="idea" rows="6" required aria-required="true"
            aria-describedby="ct-idea-err" placeholder="{E(CONTACT['before']['closing'][0])}"{idea_msgs}></textarea>
          {_err('idea')}
        </div>
        {HONEYPOT if ENDPOINT else ''}
      </div>
      <div class="ct-actions">
        <p class="ct-status" role="status" aria-live="polite" data-status hidden></p>
        <button class="btn btn--dark ct-submit" type="submit" aria-describedby="ct-note" data-submit>
          <span class="sr-only" data-submit-sr>{E(cta)}</span>
          <span class="btn__label">{roll(cta)}</span>
          <span class="btn__icon" aria-hidden="true">{ICONS['arrow-r']}</span>
          <span class="ct-spinner" aria-hidden="true"></span>
        </button>
        <p class="ct-note" id="ct-note">{note} {privacy}.</p>
      </div>
    </form>'''


def _done():
    return '''<div class="ct-done" role="region" data-done hidden tabindex="-1" aria-labelledby="ct-done-title">
      <span class="ct-done__icon" aria-hidden="true">''' + SEAL + '''</span>
      <h3 class="ct-done__title" id="ct-done-title" data-done-title>Thank you.</h3>
      <p class="ct-done__text" data-done-text></p>
      <div class="ct-done__actions">
        <button type="button" class="btn btn--light" data-edit aria-label="Edit your message"><span class="btn__label">''' + roll('Edit your message') + '''</span></button>
        <a class="btn btn--ghost" href="#" data-reopen hidden aria-label="Open the email again"><span class="btn__label">''' + roll('Open the email again') + '''</span></a>
      </div>
    </div>'''


def _out_button(ctx):
    detail = EMAIL if (EMAIL and not PLACEHOLDER) else 'Opens your email app'
    icon = f'<span class="ct-out__icon">{ICONS["mail"]}</span>'
    return (f'<a class="ct-out" href="mailto:{E(EMAIL)}" aria-label="Email us{(" at " + E(EMAIL)) if not PLACEHOLDER else ""}">'
            f'<span class="ct-out__blob" aria-hidden="true"></span>'
            f'<span class="ct-out__win" aria-hidden="true">'
            f'<span class="ct-out__row">{icon}<span>Email us</span></span>'
            f'<span class="ct-out__row">{icon}<span>{E(detail)}</span></span></span></a>')


def _before(ctx):
    b = CONTACT['before']
    rows = ''.join(f'<li>{SEAL}<span>{E(l)}</span></li>' for l in b['lines'])
    closing = '<br>'.join(E(c) for c in b['closing'])
    return f'''<aside class="card ct-before" aria-labelledby="ct-before-title" data-reveal style="--y:60px;--d:120ms">
      {DOTS}
      <span class="ct-before__avatar">{mark3d(ctx, 'ct-before__mark', 40)}</span>
      <p class="ct-before__label mono">{E(b['label'])}</p>
      <h2 class="ct-before__title" id="ct-before-title">{E(b['title'])}</h2>
      <p class="ct-before__ok">{E(b['body'])}</p>
      <ul class="ct-check" role="list">{rows}</ul>
      <p class="ct-before__close">{closing}</p>
      {_out_button(ctx)}
    </aside>'''


def _hero(ctx):
    h = CONTACT['hero']
    asks = ''.join(f'<li class="ct-ask" data-reveal style="--y:24px;--d:{380 + i * 70}ms">{E(q)}</li>'
                   for i, q in enumerate(h['lines']))
    extra = (f'<ul class="ct-asks" role="list">{asks}</ul>'
             f'<p class="ct-talk" data-reveal style="--y:40px;--d:700ms"><span class="ct-talk__dot" aria-hidden="true"><i></i></span>{E(h["closing"])}</p>')
    return page_hero(ctx, 'Contact', E(h['title']), extra=extra, cls='ct-hero')


def render(ctx):
    owner_note = ''
    if PLACEHOLDER:
        owner_note = ('<!-- Owner note: site.config.json "email" is still the placeholder address. '
                      'Set your real address (and optionally "form_endpoint", e.g. a Formspree URL) before launch; '
                      'the form and the "Email us" button use it. -->')
    return f'''{_hero(ctx)}
{owner_note}
<section class="ct-sec" id="project-form" aria-labelledby="ct-form-title"{' data-config-email-placeholder="true"' if PLACEHOLDER else ''}>
  <div class="container">
    <div class="frame ct-frame" data-reveal style="--y:60px;--d:200ms">
      <div class="ct-grid">
        <div class="card ct-card">
          {DOTS}
          <header class="ct-card__head">
            <h2 class="ct-card__title" id="ct-form-title">{E(PRIMARY_CTA)}</h2>
            <p class="ct-card__req">Fields marked <span class="ct-req">*</span> are required</p>
          </header>
          {_form(ctx)}
          {_done()}
        </div>
        <div class="ct-side">{_before(ctx)}</div>
      </div>
    </div>
  </div>
</section>'''
