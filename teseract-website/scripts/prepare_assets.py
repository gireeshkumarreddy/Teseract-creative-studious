"""Prepare web assets from the audited public source manifest. No image invention or upscaling.

    python scripts/prepare_assets.py           # downloads scripts/asset-sources.json into dist/assets + asset-manifest.json
    python scripts/prepare_assets.py --brand   # only the small copies of the 3D brand mark (local, no download)
    python scripts/prepare_assets.py --logo    # only the 512 px square logo (local, no download)

--brand: public/assets/brand/logo-mark-3d-<w>.webp at BRAND_MARK_WIDTHS from the 515 x 519 master
(logo-mark-3d.png), for the 20-64 px avatars that lib.img() serves them to (the master stays for the large marks).
--logo: public/assets/brand/logo-512.png, the flat mark (logo-mark.svg's four triangles) on white, framed like the 180 px
touch icon - the Organization logo in the JSON-LD (seo.LOGO; owner's SEO request, 18 Oct: a large square for knowledge
panels)."""
import concurrent.futures, hashlib, io, json, pathlib, sys, urllib.request
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/assets'
BRAND = ROOT / 'public/assets/brand'
BRAND_MARK_WIDTHS = (96, 192)          # 32 px avatar x 3, 64 px x 3 (lib.MARK_3D_SMALL)

def brand_marks():
    """Lanczos-downscaled WebP copies of the 3D mark (alpha kept), never wider than the master."""
    with Image.open(BRAND / 'logo-mark-3d.png') as raw:
        img = ImageOps.exif_transpose(raw)
        img.load()
    img = img.convert('RGBA')
    for width in BRAND_MARK_WIDTHS:
        if width >= img.width:
            continue
        height = round(img.height * width / img.width)
        path = BRAND / f'logo-mark-3d-{width}.webp'
        img.resize((width, height), Image.Resampling.LANCZOS).save(path, 'WEBP', quality=88, method=6)
        print('Prepared', path.relative_to(ROOT).as_posix(), f'{width}x{height}', path.stat().st_size, 'bytes', flush=True)

# logo-mark.svg (viewBox 0 0 100 100): its four triangles, drawn like apple-touch-icon-180.png - the mark in #111 on white,
# centred, 61.7% of the canvas high (111 of 180 px).
LOGO_TRIANGLES = (((50, 0.73), (92.11, 73.66), (7.89, 73.66)), ((6.14, 24.03), (47.76, 0), (6.14, 55.27)),
                  ((66.81, 8.41), (93.86, 24.03), (93.86, 72.09)), ((8.38, 75.97), (77.05, 84.38), (50, 100)))
LOGO_SIZE, LOGO_SHARE, LOGO_INK, SUPER = 512, 111 / 180, (17, 17, 17), 4


def brand_logo():
    """The square logo PNG, drawn at 4x and downscaled (smooth edges)."""
    from PIL import ImageDraw
    size = LOGO_SIZE * SUPER
    scale = LOGO_SHARE * size / 100
    off = size / 2 - 50 * scale
    img = Image.new('RGB', (size, size), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    for tri in LOGO_TRIANGLES:
        draw.polygon([(off + x * scale, off + y * scale) for x, y in tri], fill=LOGO_INK)
    path = BRAND / 'logo-512.png'
    img.resize((LOGO_SIZE, LOGO_SIZE), Image.Resampling.LANCZOS).save(path, 'PNG', optimize=True)
    print('Prepared', path.relative_to(ROOT).as_posix(), f'{LOGO_SIZE}x{LOGO_SIZE}', path.stat().st_size, 'bytes', flush=True)


def prepare(item):
    url, name = item['url'], item['name']
    if item.get('vector') or item.get('font'):
        data = urllib.request.urlopen(url, timeout=60).read()
        (OUT / name).write_bytes(data)
        return {**item, 'file': 'assets/' + name, 'bytes': len(data)}
    data = urllib.request.urlopen(url, timeout=90).read()
    img = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
    if img.mode not in ('RGB', 'RGBA'): img = img.convert('RGBA' if 'transparency' in img.info else 'RGB')
    widths = sorted(set(min(w, img.width) for w in (640, 1280, 2560, 3840)))
    variants = []
    for width in widths:
        height = round(img.height * width / img.width)
        path = OUT / f'{name}-{width}.webp'
        view = img if width == img.width else img.resize((width, height), Image.Resampling.LANCZOS)
        view.save(path, 'WEBP', quality=88, method=5)
        variants.append({'file': 'assets/' + path.name, 'width': width, 'height': height, 'bytes': path.stat().st_size})
    return {**item, 'native_width': img.width, 'native_height': img.height, 'sha256': hashlib.sha256(data).hexdigest(), 'variants': variants}

if __name__ == '__main__':
    if '--brand' in sys.argv[1:]:
        brand_marks()
        sys.exit(0)
    if '--logo' in sys.argv[1:]:
        brand_logo()
        sys.exit(0)
    OUT.mkdir(parents=True, exist_ok=True)
    SOURCES = json.loads((ROOT / 'scripts/asset-sources.json').read_text())
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(prepare, item): item for item in SOURCES}
        for future in concurrent.futures.as_completed(futures):
            item = futures[future]
            try:
                result = future.result()
                results.append(result)
                print('Prepared', item['name'], flush=True)
            except Exception as exc:
                print('FAILED', item['name'], repr(exc), flush=True)
                raise
    results.sort(key=lambda item: item['name'])
    (ROOT / 'scripts/asset-manifest.json').write_text(json.dumps(results, indent=2))
    print('ASSETS', len(results), 'BYTES', sum(p.stat().st_size for p in OUT.iterdir()), flush=True)
