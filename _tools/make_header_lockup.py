"""Header lockup: TESERACT + 'CREATIVE STUDIOS' re-set from the logo's own traced glyphs (wordmark-lockup.svg),
each glyph scaled by S and re-tracked so the line stays legible at header size. Usage: python _tools/make_header_lockup.py teseract-website/public/assets/brand/wordmark-lockup.svg teseract-website/public/assets/brand/wordmark-header.svg"""
import re, sys

S = 1.6            # glyph scale vs the logo lockup's small line (cap 33 -> 52.9 units)
WIDTH_SHARE = 0.94 # the line spans 94% of TESERACT's width, centred (logo: 78% at a larger size)
GAP_Y = 44         # TESERACT baseline (100) -> small line cap top
STROKE = 6.2       # stroke width in the logo's units (logo: 4.4) - heavier so the line stays crisp at 1x header size
CAP_TOP, CAP = 171.62, 204.67 - 171.62
W = 1474.29

src = open(sys.argv[1], encoding='utf-8').read()
paths = re.findall(r'<path d="([^"]+)"', src)
big, fill_d, stroke_d = paths[0], paths[1], paths[2]


def subpaths(d):
    return [('M' + p).strip() for p in re.split(r'M', d) if p.strip()]


def xs(sub):
    """absolute x coordinates of a subpath made of M/L(implicit)/H/V/A/Z commands"""
    toks = re.findall(r'[MLHVAZ]|-?\d*\.?\d+', sub)
    out, cmd, i = [], None, 0
    while i < len(toks):
        t = toks[i]
        if t in 'MLHVAZ':
            cmd = t; i += 1
            if cmd == 'Z':
                continue
            continue
        if cmd in ('M', 'L'):
            out.append(float(toks[i])); i += 2
        elif cmd == 'H':
            out.append(float(toks[i])); i += 1
        elif cmd == 'V':
            i += 1
        elif cmd == 'A':
            out.append(float(toks[i + 5])); i += 7
        else:
            i += 1
    return out


CENTRES = [179, 260, 338, 415, 490, 556, 623, 704, 836, 913, 994, 1077, 1146, 1217, 1299]   # C R E A T I V E  S T U D I O S
glyphs = [{'fill': [], 'stroke': [], 'xs': []} for _ in CENTRES]
for kind, d in (('fill', fill_d), ('stroke', stroke_d)):
    for sp in subpaths(d):
        x = xs(sp)
        c = (min(x) + max(x)) / 2
        k = min(range(len(CENTRES)), key=lambda j: abs(CENTRES[j] - c))
        glyphs[k][kind].append(sp)
        half = STROKE / 2 if kind == 'stroke' else (STROKE - 4.4) / 2
        glyphs[k]['xs'] += [min(x) - half, max(x) + half]
for g in glyphs:
    g['l'], g['r'] = min(g['xs']), max(g['xs'])
widths = [(g['r'] - g['l']) * S for g in glyphs]
WORD = 7                                         # index of the last glyph of CREATIVE (word gap after it = 2 gaps)
total = W * WIDTH_SHARE
gap = (total - sum(widths)) / (len(glyphs) - 1 + 1)
x = (W - total) / 2
y0 = 100 + GAP_Y
parts = []
for i, (g, w) in enumerate(zip(glyphs, widths)):
    tx, ty = x - g['l'] * S, y0 - CAP_TOP * S
    inner = ''
    if g['fill']:
        inner += f'<path d="{"".join(g["fill"])}" stroke="currentColor" stroke-width="{STROKE - 4.4:.2f}" stroke-linejoin="miter"/>'
    if g['stroke']:
        inner += f'<path d="{" ".join(g["stroke"])}" fill="none" stroke="currentColor" stroke-width="{STROKE}" stroke-linejoin="miter" stroke-linecap="butt"/>'
    parts.append(f'<g transform="translate({tx:.2f} {ty:.2f}) scale({S})">{inner}</g>')
    x += w + gap * (2 if i == WORD else 1)
H = y0 + CAP * S + STROKE * S / 2
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H:.2f}" fill="currentColor" role="img" '
       f'aria-label="Teseract Creative Studios"><title>Teseract Creative Studios</title><path d="{big}"/>{"".join(parts)}</svg>\n')
open(sys.argv[2], 'w', encoding='utf-8').write(svg)
print(f'viewBox 0 0 {W} {H:.2f}; gap {gap:.1f}; glyph widths {[round(w) for w in widths]}')
