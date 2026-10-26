"""The white/black scroll's colour transform (owner 22 + 25 Oct; src/css/96-tone.css, src/js/96-tone.js). Every page
opens BLACK and turns WHITE / BLACK on scroll, so every hard-coded NEUTRAL colour of the component CSS must follow the
tone: in the dark tone it resolves to exactly today's value, in the light tone to its mirror (v -> 255 - v), translucent
text lifted to alpha >= --a-min (.62 on white), black depth shadows scaled by --shadow-k.

The BUILD applies it (scripts/build.py, styles.css): every declaration of src/css with a neutral literal gets its
tone-aware token form IN PLACE, so the cascade order stays the authors' own and the dark tone is exactly today's black
site. (Review, 26 Oct: an override layer appended after every file beat later rules of equal specificity - a modifier's
'fill:var(--red)', a media query's 'border:0' - in eight places.) The source files stay as written and nothing has to be
re-run after a colour change. 96-tone.css keeps the tokens, islands and hand fixes; the build fills its @tone-gen block
with the :root custom properties re-declared on every tone unit and island (a custom property inherits as its RESOLVED
value, so one computed on :root would stay dark inside a white chapter). check.py compares dist/styles.css with it.

  python scripts/tone_codemod.py              statistics of the transform
  python scripts/tone_codemod.py 22-services  print a partial as the build ships it (before minifying)

Rewrites (token form, the tone build spec section 6):
  white  rgb(255 255 255 / a) -> rgb(var(--hi-rgb) / a)     black (non-shadow) -> rgb(var(--lo-rgb) / a)
  ink    rgb(244 244 242 / a) -> rgb(var(--ink-rgb) / a)    other greys v -> color-mix(in srgb,var(--hi) v/255,var(--lo))
  text alpha >= .35 -> max(a, var(--a-min))   black shadows -> rgb(0 0 0 / calc(a * var(--shadow-k)))   tinted greys:
  rgb(calc(var(--pb) + var(--ps) * v) ...)
Skipped: 00-tokens (hand-made), 05-cursor, 38-scene (framed stages keep their colours), 90/95 font files, 96-tone itself,
@keyframes / @font-face / @property, mask properties, url(), chroma colours (red, orange, blue ...). Stdlib only.
Value rules ported from the prototype's gen_tone.py + tokenform.py."""
import re, sys, os, glob

SKIP_FILES = {'00-tokens.css', '38-scene.css', '05-cursor.css', '90-font-hn.css', '95-typography.css', '96-tone.css'}
SKIP_AT = ('@keyframes', '@-webkit-keyframes', '@font-face', '@property', '@page', '@counter-style')
TEXT_PROPS = {'color', '-webkit-text-fill-color', 'caret-color', 'text-decoration-color', '-webkit-text-stroke-color'}
SHADOW_PROPS = {'box-shadow', 'text-shadow', 'filter', '-webkit-filter'}
# custom properties whose name says "text"
TEXT_VAR = re.compile(r'^--.*(ink|text|label|soon|grey|gray|muted|cap-ink|chip-ink|chip-icon|-hi)$')
SHADOW_VAR = re.compile(r'^--.*(shadow|glow)')
COL = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\(\s*[\d.]+%?\s*[, ]\s*[\d.]+%?\s*[, ]\s*[\d.]+%?\s*(?:[,/]\s*[\d.]+%?\s*)?\)')


def strip_comments(s):
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)


def parse_col(t):
    t = t.strip().lower()
    if t.startswith('#'):
        h = t[1:]
        if len(h) in (3, 4):
            rgb = [int(h[k] * 2, 16) for k in range(3)]; a = int(h[3] * 2, 16) / 255 if len(h) == 4 else 1.0
        elif len(h) in (6, 8):
            rgb = [int(h[k:k + 2], 16) for k in (0, 2, 4)]; a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        else:
            return None
        return rgb, a
    m = re.match(r'rgba?\((.*)\)', t)
    if not m: return None
    parts = [p for p in re.split(r'[,/\s]+', m.group(1).strip()) if p]
    try:
        rgb = [float(p.rstrip('%')) * (2.55 if p.endswith('%') else 1) for p in parts[:3]]
        a = (float(parts[3].rstrip('%')) / (100 if parts[3].endswith('%') else 1)) if len(parts) > 3 else 1.0
    except Exception:
        return None
    return rgb, a


def fmt(x):
    s = ('%.3f' % x).rstrip('0').rstrip('.')
    return s if s else '0'


def mirror(rgb, a, alpha_expr=None):
    ch = ' '.join('calc(var(--pb) + var(--ps) * %s)' % fmt(v) for v in rgb)
    al = alpha_expr if alpha_expr is not None else (None if a >= 0.999 else fmt(a))
    return 'rgb(%s%s)' % (ch, (' / ' + al) if al else '')


def kind(prop):
    p = prop.lower()
    if 'mask' in p or 'reflect' in p: return 'mask'
    if p in TEXT_PROPS or (p.startswith('--') and TEXT_VAR.match(p)): return 'text'
    if p in SHADOW_PROPS or p.endswith('shadow') or (p.startswith('--') and SHADOW_VAR.match(p)): return 'shadow'
    return 'surface'


def rewrite_value(prop, val, stats):
    k = kind(prop)
    if k == 'mask': return None
    # protect url(...) segments
    urls = []
    def keep(m):
        urls.append(m.group(0)); return '\x00%d\x00' % (len(urls) - 1)
    v = re.sub(r'url\([^)]*\)', keep, val)
    changed = False

    def sub(m):
        nonlocal changed
        c = parse_col(m.group(0))
        if not c: return m.group(0)
        rgb, a = c
        mx, mn = max(rgb), min(rgb)
        if mx - mn > 18:                     # chroma (red, orange, blue...): fixed
            stats['chroma'] += 1
            return m.group(0)
        changed = True
        if k == 'shadow' and mx <= 60:       # black depth shadow: stays black, lighter on the light tone
            stats['shadow'] += 1
            base = ' '.join(fmt(x) for x in rgb)
            return 'rgb(%s / calc(%s * var(--shadow-k)))' % (base, fmt(a))
        if k == 'text':
            stats['text'] += 1
            if a < 0.999 and a >= 0.35:
                return mirror(rgb, a, 'max(%s, var(--a-min))' % fmt(a))
            return mirror(rgb, a)
        stats['surface'] += 1
        return mirror(rgb, a)

    v = COL.sub(sub, v)
    # named black/white keywords
    def kw(m):
        nonlocal changed
        w = m.group(0).lower()
        changed = True
        rgb = [255, 255, 255] if w == 'white' else [0, 0, 0]
        if k == 'shadow' and w == 'black':
            return 'rgb(0 0 0 / var(--shadow-k))'
        return mirror(rgb, 1.0)
    v = re.sub(r'(?<![-\w])(white|black)(?![-\w])', kw, v)
    if not changed: return None
    v = re.sub(r'\x00(\d+)\x00', lambda m: urls[int(m.group(1))], v)
    return v


# ---------------------------------------------------------------- token form (tokenform.py)
_C = r'calc\(var\(--pb\) \+ var\(--ps\) \* (\d+)\)'
_PAT = re.compile(r'rgb\(' + _C + ' ' + _C + ' ' + _C + r'(?: / ((?:max\([^()]*\(--a-min\)\))|[^)]*?))?\)')


def _token(m):
    r, g, b, a = m.groups()
    r, g, b = int(r), int(g), int(b)
    fam = {(255, 255, 255): 'hi', (0, 0, 0): 'lo', (244, 244, 242): 'ink'}.get((r, g, b))
    if fam:
        return f'rgb(var(--{fam}-rgb) / {a})' if a else f'var(--{fam})'
    if r == g == b:
        p = round(r / 255 * 100, 2)
        mix = f'color-mix(in srgb,var(--hi) {p:g}%,var(--lo))'
        if not a:
            return mix
        if a.startswith('max'):
            return m.group(0)
        try:
            A = round(float(a) * 100, 2)
        except ValueError:
            return m.group(0)
        return f'color-mix(in srgb,{mix} {A:g}%,transparent)'
    return m.group(0)


def islands(tone_css):
    """The always-dark island list = the dark set's selector in 96-tone.css (':root,[data-tone=dark],<islands>{')."""
    m = re.search(r':root,\[data-tone=dark\],\s*(.*?)\{', tone_css, re.S)
    if not m:
        raise SystemExit('tone_codemod: 96-tone.css has no ":root,[data-tone=dark],<islands>{" dark set')
    return re.sub(r'\s+', '', m.group(1)).rstrip(',')


BEGIN, END = '/* @tone-gen begin', '/* @tone-gen end */'
CSS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'css')
TONE_CSS = os.path.join(CSS_DIR, '96-tone.css')
ROOT_SEL = re.compile(r'(:root|html|body|\.page-[\w-]+)(\s*,\s*(:root|html|body|\.page-[\w-]+))*')
_LEAD = re.compile(r'^((?:\s|/\*.*?\*/)*)', re.S)


def new_stats():
    return {'text': 0, 'surface': 0, 'shadow': 0, 'chroma': 0, 'decls': 0}


def tokenise(css, stats=None, root_vars=None):
    """css with every neutral literal of a declaration in its tone-aware token form, IN PLACE: selectors, at-rules,
    comments, order and every other byte stay as written. root_vars (a dict) collects the custom properties declared on
    :root / html / body / .page-* outside at-rules, in their token form."""
    stats = stats if stats is not None else new_stats()
    root_vars = root_vars if root_vars is not None else {}
    out, n = [], len(css)

    def comment_end(i):
        j = css.find('*/', i + 2)
        return n if j < 0 else j + 2

    def scan(i, stops):                      # the first stop character at depth 0 (strings, comments, parens aware)
        depth, q = 0, None
        while i < n:
            c = css[i]
            if q:
                if c == '\\':
                    i += 2
                    continue
                if c == q:
                    q = None
            elif css.startswith('/*', i):
                i = comment_end(i)
                continue
            elif c in '"\'':
                q = c
            elif c in '([':
                depth += 1
            elif c in ')]':
                depth -= 1
            elif depth <= 0 and c in stops:
                return i
            i += 1
        return n

    def block_end(j):                        # css[j] == '{' -> the index after its matching '}'
        depth, q, i = 0, None, j
        while i < n:
            c = css[i]
            if q:
                if c == '\\':
                    i += 2
                    continue
                if c == q:
                    q = None
            elif css.startswith('/*', i):
                i = comment_end(i)
                continue
            elif c in '"\'':
                q = c
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    return i + 1
            i += 1
        return n

    def declaration(text, sel, at):
        lead = _LEAD.match(text).group(1)
        body = text[len(lead):]
        k = body.find(':')
        if k <= 0:
            return text
        prop = body[:k].strip()
        raw = body[k + 1:]
        tail = raw[len(raw.rstrip()):]
        val = strip_comments(raw).strip()
        imp = ''
        if re.search(r'!\s*important\s*$', val, re.I):
            val = re.sub(r'\s*!\s*important\s*$', '', val, flags=re.I)
            imp = '!important'
        nv = rewrite_value(prop, val, stats)
        if nv is None:
            return text
        stats['decls'] += 1
        nv = _PAT.sub(_token, nv)
        if prop.startswith('--') and not at and ROOT_SEL.fullmatch(sel):
            root_vars[prop] = nv
        return '%s%s:%s%s%s' % (lead, body[:k].rstrip(), nv, imp, tail)

    def decls(i, sel, at):                   # a declaration block; returns the index after its '}'
        while i < n:
            k = scan(i, ';}{')
            if k < n and css[k] == '{':        # a nested rule (the site has none): kept as written
                e = block_end(k)
                out.append(css[i:e])
                i = e
                continue
            out.append(declaration(css[i:k], sel, at))
            if k >= n:
                return n
            out.append(css[k])
            i = k + 1
            if css[k] == '}':
                return i
        return i

    def rules(i, at):
        while i < n:
            j = i
            while j < n and (css[j] in ' \t\r\n' or css.startswith('/*', j)):
                j = comment_end(j) if css.startswith('/*', j) else j + 1
            out.append(css[i:j])
            i = j
            if i >= n or css[i] == '}':
                return i
            j = scan(i, '{;}')
            if j >= n:
                out.append(css[i:])
                return n
            if css[j] != '{':                  # @import / @charset (or a stray '}')
                e = j + 1 if css[j] == ';' else j
                out.append(css[i:e])
                i = e
                if css[j] == '}':
                    return i
                continue
            pre = re.sub(r'\s+', ' ', strip_comments(css[i:j])).strip()
            if pre.startswith('@'):
                if pre.lower().startswith(SKIP_AT):
                    e = block_end(j)
                    out.append(css[i:e])
                    i = e
                    continue
                out.append(css[i:j + 1])
                i = rules(j + 1, at + [pre])
                if i < n:
                    out.append('}')
                    i += 1
                continue
            out.append(css[i:j + 1])
            i = decls(j + 1, pre, at)
        return i

    rules(0, [])
    return ''.join(out)


def block(tone_css):
    """The text between the @tone-gen markers (None without markers; empty in src: the build fills it)."""
    a, b = tone_css.find(BEGIN), tone_css.find(END)
    if a < 0 or b < a:
        return None
    return tone_css[tone_css.index('*/', a) + 2:b].strip()


def fill(tone_css, root_vars):
    """96-tone.css with its @tone-gen block filled: the :root custom properties re-declared on every tone unit and
    island (the dark set's island list)."""
    if block(tone_css) is None:
        raise SystemExit('tone_codemod: 96-tone.css has no "/* @tone-gen begin ... */ /* @tone-gen end */" block')
    a, b = tone_css.find(BEGIN), tone_css.find(END)
    a = tone_css.index('*/', a) + 2
    rule = '%s{%s}' % ('[data-tone],' + islands(tone_css), ';'.join('%s:%s' % kv for kv in root_vars.items()))
    return tone_css[:a] + '\n' + rule + '\n' + tone_css[b:]


def partials(paths, stats=None):
    """[(file name, text)] of src/css as the build concatenates them: every partial but SKIP_FILES tokenised in place,
    96-tone.css with its @tone-gen block filled."""
    stats = stats if stats is not None else new_stats()
    root_vars, out = {}, []
    for p in sorted(paths, key=lambda q: os.path.basename(str(q))):
        name = os.path.basename(str(p))
        with open(p, encoding='utf-8') as fh:
            text = fh.read()
        if name not in SKIP_FILES:
            text = tokenise(text, stats, root_vars)
        out.append([name, text])
    for item in out:
        if item[0] == '96-tone.css':
            item[1] = fill(item[1].replace('\r\n', '\n'), root_vars)
    return [tuple(x) for x in out]


def main():
    paths = sorted(glob.glob(os.path.join(CSS_DIR, '*.css')))
    stats = new_stats()
    parts = partials(paths, stats)
    want = [a for a in sys.argv[1:] if not a.startswith('-')]
    if want:
        for name, text in parts:
            if any(name.startswith(w) for w in want):
                sys.stdout.write(text)
        return
    print('tone transform: %(decls)d declarations tokenised (%(text)d text, %(surface)d surface, %(shadow)d shadow '
          'literals; %(chroma)d chroma literals kept as written)' % stats)


if __name__ == '__main__':
    main()
