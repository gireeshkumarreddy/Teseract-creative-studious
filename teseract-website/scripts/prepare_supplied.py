"""Prepare the owner-supplied images (scripts/supplied.json) for the website.

    python scripts/prepare_supplied.py              # reads the "src" folder named in supplied.json
    python scripts/prepare_supplied.py --src D:/x   # another folder
    python scripts/prepare_supplied.py --force      # re-encode even when the outputs are up to date
    python scripts/prepare_supplied.py --table scripts/inspiration.json   # the Who We Are inspiration photos

For every entry: open <src>/<file>, apply the optional "crop" ([left, top, right, bottom] source pixels), then write
public/assets/supplied/<name>-<w>.webp at 640 / 1280 / 1920 px wide - never wider than the (cropped) source, so nothing
is upscaled (prepare_media.py conventions: Lanczos, WebP q88). scripts/supplied-manifest.json records the variants,
the source size, the crop and the source's SHA-256 (check.py compares them). Files of entries no longer in the table
are removed from public/assets/supplied/. Requires Pillow.
Another table may name its own "out" folder, "manifest", "quality" and "widths" (an entry's own "widths" wins), and
"palette": N to record each image's N main colours (hex, most common first) in the manifest.
"""
import argparse, hashlib, json, os, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
TABLE = ROOT / 'scripts/supplied.json'
MANIFEST = ROOT / 'scripts/supplied-manifest.json'
OUT_REL = 'assets/supplied'
OUT = ROOT / 'public' / OUT_REL
WIDTHS = (640, 1280, 1920)
QUALITY = 88


def longpath(path):
    if os.name != 'nt':
        return pathlib.Path(path)
    p = str(pathlib.Path(path).absolute())
    prefix = '\\\\?\\'
    return pathlib.Path(p if p.startswith(prefix) else prefix + p)


def palette(img, n):
    """The n main colours of an image (hex, most common first): median cut on a small copy, near-duplicates merged."""
    from PIL import Image
    small = img.convert('RGB')
    small.thumbnail((240, 240))
    q = small.quantize(colors=16, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()
    out = []
    for count, k in sorted(q.getcolors(), reverse=True):
        c = pal[3 * k:3 * k + 3]
        if all(sum((a - b) ** 2 for a, b in zip(c, o)) > 48 ** 2 for o in out):
            out.append(c)
        if len(out) == n:
            break
    return ['#%02x%02x%02x' % tuple(c) for c in out]


def main():
    from PIL import Image, ImageOps
    global TABLE, MANIFEST, OUT_REL, OUT, WIDTHS, QUALITY
    ap = argparse.ArgumentParser(description='Encode the owner-supplied service-card images (scripts/supplied.json).')
    ap.add_argument('--table', default=str(TABLE), help='image table (default scripts/supplied.json)')
    ap.add_argument('--src', help='folder holding the image files (default: the table\'s "src")')
    ap.add_argument('--force', action='store_true')
    args = ap.parse_args()
    TABLE = pathlib.Path(args.table).resolve()
    table = json.loads(TABLE.read_text(encoding='utf-8'))
    MANIFEST = ROOT / table.get('manifest', MANIFEST.relative_to(ROOT).as_posix())
    OUT_REL = table.get('out', OUT_REL)
    OUT = ROOT / 'public' / OUT_REL
    WIDTHS = tuple(table.get('widths', WIDTHS))
    QUALITY = table.get('quality', QUALITY)
    n_pal = table.get('palette', 0)
    src_root = pathlib.Path(args.src or table.get('src'))
    if not src_root.is_dir():
        sys.exit(f'ERROR: supplied-images folder not found: {src_root}')
    longpath(OUT).mkdir(parents=True, exist_ok=True)
    old = json.loads(MANIFEST.read_text(encoding='utf-8')).get('images', {}) if MANIFEST.exists() else {}
    images, keep = {}, set()
    for e in table['images']:
        src = src_root / e['file']
        if not src.is_file():
            sys.exit(f'ERROR: {src} is missing ({TABLE.name} entry "{e["name"]}")')
        data = longpath(src).read_bytes()
        sha = hashlib.sha256(data).hexdigest()
        crop = list(e['crop']) if e.get('crop') else None
        widths = tuple(e.get('widths', WIDTHS))
        prev = old.get(e['name']) or {}
        same = (prev.get('source', {}).get('sha256') == sha and prev.get('source', {}).get('crop') == crop
                and prev.get('widths', list(WIDTHS)) == list(widths) and len(prev.get('palette', [])) == n_pal
                and all(longpath(ROOT / 'public' / v['file']).exists() for v in prev.get('variants', [])))
        if same and not args.force:
            images[e['name']] = prev
            keep.update(v['file'] for v in prev['variants'])
            print(f'up to date  {e["name"]}')
            continue
        with Image.open(longpath(src)) as raw:
            img = ImageOps.exif_transpose(raw)
            img.load()
        src_w, src_h = img.size
        if crop:
            l, t, r, b = crop
            if not (0 <= l < r <= src_w and 0 <= t < b <= src_h):
                sys.exit(f'ERROR: crop {crop} is outside {e["file"]} ({src_w}x{src_h})')
            img = img.crop((l, t, r, b))
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA' if 'transparency' in img.info else 'RGB')
        variants = []
        for w in sorted({min(w, img.width) for w in widths}):
            h = round(img.height * w / img.width)
            rel = f'{OUT_REL}/{e["name"]}-{w}.webp'
            view = img if w == img.width else img.resize((w, h), Image.Resampling.LANCZOS)
            view.save(longpath(ROOT / 'public' / rel), 'WEBP', quality=QUALITY, method=6)
            variants.append({'file': rel, 'width': w, 'height': h, 'bytes': longpath(ROOT / 'public' / rel).stat().st_size})
            keep.add(rel)
        images[e['name']] = {'variants': variants,
                             'source': {'file': e['file'], 'width': src_w, 'height': src_h, 'crop': crop, 'sha256': sha}}
        if widths != WIDTHS:
            images[e['name']]['widths'] = list(widths)
        if n_pal:
            images[e['name']]['palette'] = palette(img, n_pal)
        print(f'prepared    {e["name"]}: {src_w}x{src_h}' + (f' crop {crop}' if crop else '') +
              ' -> ' + ', '.join(f'{v["width"]}x{v["height"]}' for v in variants))
    for f in sorted(longpath(OUT).iterdir()):
        if f.is_file() and f'{OUT_REL}/{f.name}' not in keep:
            f.unlink()
            print(f'removed     {OUT_REL}/{f.name}')
    MANIFEST.write_text(json.dumps({'images': images}, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'{len(images)} image(s) -> {MANIFEST.relative_to(ROOT).as_posix()}\nNext: python scripts/build.py')
    return 0


if __name__ == '__main__':
    sys.exit(main())
