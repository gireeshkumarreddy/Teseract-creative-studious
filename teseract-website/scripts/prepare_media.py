"""Prepare the studio's own project videos and gallery images for the website.

    python scripts/prepare_media.py                          # reads C:/Teseract-media
    python scripts/prepare_media.py --src D:/handover        # another media folder
    python scripts/prepare_media.py --force                  # re-encode everything
    python scripts/prepare_media.py --max-seconds 10         # trim loop clips to 10 s
    python scripts/prepare_media.py --keep-fps               # keep >30 fps sources as they are
    python scripts/prepare_media.py --prune                  # delete outputs no longer in the manifest
    python scripts/prepare_media.py --skip sedile            # leave a folder out (e.g. still being captured): its
                                                             # previous manifest entry and files are kept as they are

Input (one folder per project; see MEDIA-GUIDE.md):
    <src>/<project-slug>/info.txt           "key: value" lines (name, client, url, description, services, year, permission)
    <src>/<project-slug>/laptop.<mp4|mov|webm|m4v>   landscape website recording (home laptop screen)
    <src>/<project-slug>/hero.<ext>         short loop for a hero gallery tile
    <src>/<project-slug>/gallery-01.<video|jpg|png|webp> ... gallery-NN   project page gallery, in order
    <src>/<project-slug>/<name>.<video>     any other name (lower-case, e.g. aivinci/tiger.mp4): a NAMED loop clip, used where
                                             portfolio.json says ("card_clip": Work card, "tile_clip": home hero tile);
                                             <name>.<jpg|png|webp> next to it is its poster (instead of a decoded frame)
    <src>/<project-slug>/capture-report.json optional (capture tool): name/url/group/site_is/tagline_verbatim and a
                                             "shows" line per file -> manifest "report" and per-item "alt"/"frame"
    <src>/order.txt                          optional: folder names, one per line (manifest order)
    scripts/media-edits.json                 optional per-clip edits kept with the site (the media folder stays
                                             read-only): {"<slug>": {"<role>": {"start": s, "seconds": s,
                                             "poster": s after start, "crf": n}}} - e.g. skip a site's preloader

Output (paths follow this script, so a copied project writes into the copy):
    public/assets/media/<slug>/<role>-<w>.mp4    H.264 / yuv420p / faststart / no audio, widths 640-2560, never upscaled;
                                                 hero.<ext> (a home gallery tile) centre-cropped to the tile's 4:5 at
                                                 480 + 640, a named clip also at 480 (TILE_* / CLIP_WIDTHS below)
    public/assets/media/<slug>/<role>-<w>.webp   posters (videos) and gallery image variants (640-2560 with a 1440 rung,
                                                 plus a 480 "thumb" that only small images use, see lib.media_img)
    scripts/media-manifest.json                  read by the build (lib.media_manifest)

Requires ffmpeg + ffprobe (PATH, else imageio-ffmpeg) for videos and Pillow for images/posters.
Idempotent: an output newer than its source is reused unless --force (use it after changing --max-seconds/--keep-fps);
a clip whose frame size changed since the last manifest (e.g. a new crop) is re-encoded by itself.
"""
import argparse, io, json, os, pathlib, re, shutil, subprocess, sys, time

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
OUT_REL = 'assets/media'
OUT = PUBLIC / OUT_REL
MANIFEST = ROOT / 'scripts/media-manifest.json'
EDITS_FILE = ROOT / 'scripts/media-edits.json'
DEFAULT_SRC = 'C:/Teseract-media'

WIDTHS = (640, 1280, 1920, 2560)                  # video (and poster) widths
# Gallery stills: + a 1440 rung, what a full-width still needs on a 3x phone (390-430 px x 3 = 1170-1290; it took the
# 1920 file before), and a 480 thumbnail flagged "thumb" that lib.media_img offers only to small fixed-size images:
# the footer ring's ~90-110 px square cards, whose 16:10 stills are drawn ~1.6x the card wide (object-fit: cover), so a
# 3x phone needs ~300 px of height = a 480 px wide file (12 of them ~300 KB instead of ~430 KB at 640), and no larger
# or fluid image is ever drawn from it.
IMAGE_WIDTHS = (640, 1280, 1440, 1920, 2560)
THUMB_W = 480
# Named loop clips (aivinci/tiger.mp4: a Work card and a home hero tile): + 480, for a phone's 166 px tile (x DPR 2).
CLIP_WIDTHS = (480,) + WIDTHS
# Home hero gallery tiles: hero.<ext> is a portrait phone-scroll loop (9:19.5) drawn in 4:5 / 1:1 tiles 166-316 CSS px
# wide (object-fit: cover, centred), so ~40 % of every frame was never seen. It is encoded centre-cropped to 4:5 - what
# a 4:5 tile shows; a square one crops the same centre further - at 480 (phones: 166 px x DPR 2) and 640 (desktop).
# CRF 28 (not 23): drawn at 166-316 CSS px the extra quantisation does not show (compared frame by frame at 3x),
# and a phone's 480 file is ~390 KB instead of ~700 KB (the 640 x 1386 original was 1.6 MB).
TILE_ROLE, TILE_AR, TILE_WIDTHS, TILE_CRF = 'hero', 4 / 5, (480, 640), 28
VIDEO_EXT = {'.mp4', '.mov', '.webm', '.m4v'}
IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.webp'}
ROLE_RE = re.compile(r'^(laptop|hero|gallery-?(\d{1,3}))$', re.I)
CLIP_RE = re.compile(r'^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$', re.I)     # a named loop clip / its poster still (tiger.mp4 + tiger.png)
INFO_KEYS = ('name', 'client', 'url', 'description', 'services', 'year', 'permission')
YES = {'yes', 'y', 'true', 'granted', 'approved', 'ok'}
CRF, PRESET, POSTER_Q, IMAGE_Q, FPS_CAP = 23, 'slow', 82, 88, 30
MB = 1024 * 1024


def longpath(path):
    """Windows extended-length path for Python file operations (deep workspace paths)."""
    if os.name != 'nt':
        return pathlib.Path(path)
    p = str(pathlib.Path(path).absolute())
    prefix = '\\\\?\\'
    return pathlib.Path(p if p.startswith(prefix) else prefix + p)


def slugify(name):
    s = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return s or 'project'


def even(n):
    return max(2, int(n) - int(n) % 2)


def scaled_height(w, src_w, src_h):
    """Same rounding as ffmpeg's scale=w:-2 (nearest, then a multiple of 2)."""
    return max(2, int(round(w * src_h / (src_w * 2))) * 2)


def target_widths(src_w, widths=WIDTHS):
    ws = [w for w in widths if w <= src_w]
    return ws or [even(src_w)]          # narrower than the smallest: one variant at its own (even) width


def clip_crf(role, edit):
    """x264 CRF of a clip: media-edits.json "crf", else TILE_CRF for a hero tile clip, else CRF."""
    return int(edit['crf']) if (edit or {}).get('crf') else TILE_CRF if role == TILE_ROLE else CRF


def clip_geometry(role, info):
    """(dims, crop) of a clip's variants: dims = [(w, h)] in the encoded frame, crop = the ffmpeg crop filter applied
    before the scale ('' for none). A hero tile clip taller than 4:5 keeps its centre 4:5 at TILE_WIDTHS; a named
    clip adds the 480 rung; everything else keeps its frame at WIDTHS."""
    sw, sh = info['width'], info['height']
    crop, widths = '', WIDTHS
    if role == TILE_ROLE:
        widths = TILE_WIDTHS
        if sw / sh < TILE_AR - 0.005:
            ch = even(sw / TILE_AR)
            crop = f'crop={even(sw)}:{ch}:0:{even((sh - ch) / 2)}'
            sw, sh = even(sw), ch
    elif role not in ('laptop',) and not role.startswith('gallery-'):
        widths = CLIP_WIDTHS
    return [(w, scaled_height(w, sw, sh)) for w in target_widths(sw, widths)], crop


# ---------------------------------------------------------------- tools

class Tools:
    ffmpeg = ffprobe = None

    @classmethod
    def find(cls):
        if cls.ffmpeg:
            return cls
        cls.ffmpeg = shutil.which('ffmpeg')
        cls.ffprobe = shutil.which('ffprobe')
        if not cls.ffmpeg:
            try:
                import imageio_ffmpeg
                cls.ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
            except Exception:
                cls.ffmpeg = None
        if not cls.ffmpeg:
            sys.exit('ERROR: ffmpeg was not found. Install it (for example "winget install Gyan.FFmpeg") and open a new '
                     'terminal, or "pip install imageio-ffmpeg", then run this script again.')
        return cls


def run(cmd, **kw):
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kw)


def _rate(s):
    try:
        a, b = (s or '0/1').split('/')
        return float(a) / float(b) if float(b) else 0.0
    except ValueError:
        return 0.0


def probe(path):
    """width/height (display orientation), fps, duration, codec, rotation, has_audio."""
    t = Tools.find()
    if t.ffprobe:
        r = run([t.ffprobe, '-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', str(path)])
        if r.returncode != 0:
            raise RuntimeError(f'ffprobe failed on {path.name}: {r.stderr.decode(errors="replace")[-400:]}')
        data = json.loads(r.stdout or b'{}')
        streams = data.get('streams', [])
        v = next((s for s in streams if s.get('codec_type') == 'video' and not (s.get('disposition') or {}).get('attached_pic')), None)
        if not v:
            raise RuntimeError(f'{path.name}: no video stream')
        rot = 0
        for sd in v.get('side_data_list') or []:
            if 'rotation' in sd:
                rot = int(round(float(sd['rotation'])))
        if not rot and (v.get('tags') or {}).get('rotate'):
            rot = int(v['tags']['rotate'])
        w, h = int(v['width']), int(v['height'])
        if abs(rot) % 180 == 90:
            w, h = h, w
        dur = float((data.get('format') or {}).get('duration') or v.get('duration') or 0)
        fps = _rate(v.get('avg_frame_rate')) or _rate(v.get('r_frame_rate'))
        return {'width': w, 'height': h, 'fps': round(fps, 3), 'duration': round(dur, 3), 'codec': v.get('codec_name', ''),
                'rotation': rot, 'has_audio': any(s.get('codec_type') == 'audio' for s in streams)}
    # Fallback (imageio-ffmpeg ships ffmpeg only): parse "ffmpeg -i" output.
    err = run([t.ffmpeg, '-hide_banner', '-i', str(path)]).stderr.decode(errors='replace')
    m = re.search(r'Stream #\S+.*?Video: (\w+).*?, (\d{2,5})x(\d{2,5})', err)
    if not m:
        raise RuntimeError(f'{path.name}: could not read the video stream')
    w, h = int(m.group(2)), int(m.group(3))
    rm = re.search(r'rotation of (-?[\d.]+) degrees', err) or re.search(r'rotate\s*:\s*(-?\d+)', err)
    rot = int(round(float(rm.group(1)))) if rm else 0
    if abs(rot) % 180 == 90:
        w, h = h, w
    d = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err)
    dur = int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3)) if d else 0.0
    f = re.search(r'([\d.]+) fps', err)
    return {'width': w, 'height': h, 'fps': float(f.group(1)) if f else 0.0, 'duration': round(dur, 3), 'codec': m.group(1),
            'rotation': rot, 'has_audio': bool(re.search(r'Stream #\S+.*?Audio:', err))}


# ---------------------------------------------------------------- inputs

def read_info(folder):
    info = {}
    f = folder / 'info.txt'
    if not f.exists():
        return info
    last = None
    for raw in f.read_text(encoding='utf-8-sig', errors='replace').splitlines():
        line = raw.strip()
        if not line or line.startswith('#'):
            continue
        m = re.match(r'^([A-Za-z][\w \-]{0,30}):\s*(.*)$', line)
        if m and not re.match(r'^https?$', m.group(1), re.I):
            last = m.group(1).strip().lower().replace(' ', '_')
            info[last] = m.group(2).strip()
        elif last:                                   # continuation line (long description)
            info[last] = (info[last] + ' ' + line).strip()
    return info


REPORT_KEYS = ('name', 'url', 'group', 'site_is', 'tagline_verbatim')


def read_report(folder, warnings):
    """capture-report.json (written by the capture tool): project facts + per-file "shows" text, which the
    build uses as alt text. Returns (project facts, {file name: {'shows', 'kind'}}); empty when absent."""
    f = folder / 'capture-report.json'
    if not f.exists():
        return {}, {}
    try:
        data = json.loads(f.read_text(encoding='utf-8-sig'))
    except ValueError as ex:
        warnings.append(f'{folder.name}/capture-report.json: not valid JSON ({ex}) - ignored')
        return {}, {}
    facts = {k: data[k] for k in REPORT_KEYS if isinstance(data.get(k), str) and data[k].strip()}
    files = {}
    for item in data.get('files') or []:
        if isinstance(item, dict) and item.get('file'):
            files[str(item['file']).lower()] = {k: str(item[k]).strip() for k in ('shows', 'kind') if item.get(k)}
    return facts, files


def find_roles(folder, warnings):
    """([(role, file, kind)], {named clip: poster still}): laptop, hero, the named clips, then gallery-NN in order."""
    roles, stills = {}, {}
    for f in sorted(folder.iterdir()):
        if not f.is_file() or f.name.lower() in ('info.txt', 'capture-report.json', 'thumbs.db', 'desktop.ini') or f.name.startswith('.'):
            continue
        ext = f.suffix.lower()
        m = ROLE_RE.match(f.stem)
        if not m and CLIP_RE.match(f.stem) and not f.stem.lower().startswith('gallery') and ext in VIDEO_EXT | IMAGE_EXT:
            name = f.stem.lower()
            if ext in IMAGE_EXT:                         # a poster still - kept only when a clip of the same name exists
                stills.setdefault(name, f)
            elif name in roles:
                warnings.append(f'{folder.name}/{f.name}: a second "{name}" clip - skipped (keeping {roles[name][0].name})')
            else:
                roles[name] = (f, 'video')
            continue
        if not m or ext not in VIDEO_EXT | IMAGE_EXT:
            warnings.append(f'{folder.name}/{f.name}: not a recognised file name (laptop / hero / gallery-NN / a named clip + video or image) - skipped')
            continue
        role = m.group(1).lower()
        if m.group(2):
            role = f'gallery-{int(m.group(2)):02d}'
        kind = 'video' if ext in VIDEO_EXT else 'image'
        if role in ('laptop', 'hero') and kind != 'video':
            warnings.append(f'{folder.name}/{f.name}: {role} must be a video - skipped')
            continue
        if role in roles:
            prev = roles[role]
            if prev[1] == 'video' or kind == 'image':
                warnings.append(f'{folder.name}/{f.name}: a second "{role}" file - skipped (keeping {prev[0].name})')
                continue
            warnings.append(f'{folder.name}/{prev[0].name}: a second "{role}" file - using the video {f.name} instead')
        roles[role] = (f, kind)
    posters = {}
    for name, f in stills.items():
        if name in roles:
            posters[name] = f
        else:
            warnings.append(f'{folder.name}/{f.name}: an image named like a clip, but there is no {name} video - skipped')
    named = sorted(r for r in roles if r not in ('laptop', 'hero') and not r.startswith('gallery-'))
    order = ['laptop', 'hero'] + named + sorted(r for r in roles if r.startswith('gallery-'))
    return [(r, *roles[r]) for r in order if r in roles], posters


# ---------------------------------------------------------------- outputs

def fresh(out, src, force):
    o = longpath(out)
    return not force and o.exists() and o.stat().st_size > 0 and o.stat().st_mtime >= longpath(src).stat().st_mtime


def rel(path):
    return path.relative_to(PUBLIC).as_posix()


def read_edits(warnings):
    """scripts/media-edits.json -> {(slug, role): {'start', 'seconds', 'poster', 'crf'}} (numbers only)."""
    if not EDITS_FILE.exists():
        return {}
    try:
        data = json.loads(EDITS_FILE.read_text(encoding='utf-8-sig'))
    except ValueError as ex:
        warnings.append(f'{EDITS_FILE.name}: not valid JSON ({ex}) - ignored')
        return {}
    out = {}
    for slug, roles in data.items():
        if slug.startswith('_') or not isinstance(roles, dict):
            continue
        for role, e in roles.items():
            if isinstance(e, dict):
                clean = {k: float(e[k]) for k in ('start', 'seconds', 'poster', 'crf') if isinstance(e.get(k), (int, float))}
                if clean:
                    out[(slug, role)] = clean
    return out


def encode_video(src, info, outdir, role, args, timings, edit=None, force=False, stale=()):
    """All missing width variants from one decode (split filter). Returns variant list.
    edit = {'start', 'seconds', 'crf'} from media-edits.json; force = re-encode (the edit changed);
    stale = widths whose file has another frame size than clip_geometry() now gives (re-encoded too)."""
    edit = edit or {}
    sw, sh = info['width'], info['height']
    dims, crop = clip_geometry(role, info)
    todo = [(w, h) for w, h in dims if force or w in stale or not fresh(outdir / f'{role}-{w}.mp4', src, args.force)]
    if todo:
        t = Tools.find()
        cap = info['fps'] > FPS_CAP + 0.5 and not args.keep_fps
        n = len(todo)
        chains = [f'[s{i}]scale={w}:{h}:flags=lanczos,setsar=1{",fps=" + str(FPS_CAP) if cap else ""},format=yuv420p[o{i}]'
                  for i, (w, h) in enumerate(todo)]
        head = f'[0:v:0]{crop + "," if crop else ""}'
        graph = (f'{head}split={n}' + ''.join(f'[s{i}]' for i in range(n)) + ';' if n > 1 else f'{head}null[s0];') + ';'.join(chains)
        cmd = [t.ffmpeg, '-y', '-hide_banner', '-loglevel', 'error']
        if edit.get('start'):
            cmd += ['-ss', f"{edit['start']:.3f}"]       # input seek (frame-accurate when re-encoding)
        length = min([x for x in (edit.get('seconds'), args.max_seconds) if x] or [0])
        if length:
            cmd += ['-t', str(length)]                    # input option: limits every output at once
        cmd += ['-i', str(src), '-filter_complex', graph]
        crf = str(clip_crf(role, edit))
        tmp = []
        for i, (w, h) in enumerate(todo):
            part = outdir / f'{role}-{w}.part.mp4'
            tmp.append((part, outdir / f'{role}-{w}.mp4'))
            cmd += ['-map', f'[o{i}]', '-c:v', 'libx264', '-preset', PRESET, '-crf', crf, '-pix_fmt', 'yuv420p',
                    '-profile:v', 'high', '-movflags', '+faststart', '-an', '-sn', '-dn', '-map_metadata', '-1', str(part)]
        t0 = time.perf_counter()
        r = run(cmd)
        if r.returncode != 0:
            for part, _ in tmp:
                if longpath(part).exists():
                    longpath(part).unlink()
            raise RuntimeError(f'ffmpeg failed on {src.name}: {r.stderr.decode(errors="replace")[-800:]}')
        timings.append({'file': f'{src.parent.name}/{src.name}', 'role': role, 'seconds': round(time.perf_counter() - t0, 2),
                        'source': f'{sw}x{sh}', 'source_seconds': info['duration'], 'widths': [w for w, _ in todo]})
        for part, final in tmp:
            os.replace(longpath(part), longpath(final))
    return [{'file': rel(outdir / f'{role}-{w}.mp4'), 'width': w, 'height': h,
             'bytes': longpath(outdir / f'{role}-{w}.mp4').stat().st_size} for w, h in dims]


def _frame(src, at, width, height, crop=''):
    """One decoded frame (display orientation) at `at` seconds, cropped (clip_geometry) and scaled to width x height,
    as a PIL image."""
    from PIL import Image
    t = Tools.find()
    r = run([t.ffmpeg, '-hide_banner', '-loglevel', 'error', '-ss', f'{at:.3f}', '-i', str(src), '-frames:v', '1',
             '-vf', f'{crop + "," if crop else ""}scale={width}:{height}:flags=lanczos,setsar=1', '-f', 'image2pipe', '-vcodec', 'png', '-'])
    if r.returncode != 0 or not r.stdout:
        return None
    return Image.open(io.BytesIO(r.stdout)).convert('RGB')


def make_posters(src, info, outdir, role, args, at=None, offset=0.0, length=None, force=False):
    """WebP posters at the video widths from a frame at min(1 s, 10 % of the clip); skips a black frame.
    at = seconds from info.txt "<role> poster: N" (e.g. "laptop poster: 8"): that frame is used instead,
    and the posters are always re-extracted (cheap) so editing info.txt takes effect without --force.
    offset / length = the part of the source an edited clip keeps (media-edits.json): `at` and the
    automatic candidates are then seconds within that part."""
    from PIL import Image, ImageStat
    dims, crop = clip_geometry(role, info)
    if at is None and not force and all(fresh(outdir / f'{role}-{w}.webp', src, args.force) for w, _ in dims):
        return [{'file': rel(outdir / f'{role}-{w}.webp'), 'width': w, 'height': h} for w, h in dims]
    dur = min(max((info['duration'] or 1.0) - offset, 0.1), length or 1e9, args.max_seconds or 1e9)
    candidates = [min(1.0, dur * 0.1), dur * 0.25, dur * 0.5, dur * 0.75]
    if at is not None:
        candidates = [min(max(at, 0.0), max(dur - 0.05, 0.0))] + candidates
    candidates = [offset + c for c in candidates]
    W, H = dims[-1]
    best, best_lum = None, -1.0
    for at in candidates:
        im = _frame(src, at, W, H, crop)
        if im is None:
            continue
        lum = sum(ImageStat.Stat(im.convert('L')).mean)
        if lum > best_lum:
            best, best_lum = im, lum
        if lum >= 16:                                # not a black / fade-in frame: use it
            best = im
            break
    if best is None:
        raise RuntimeError(f'could not extract a poster frame from {src.name}')
    out = []
    for w, h in dims:
        view = best if (w, h) == best.size else best.resize((w, h), Image.Resampling.LANCZOS)
        p = outdir / f'{role}-{w}.webp'
        view.save(longpath(p), 'WEBP', quality=POSTER_Q, method=6)
        out.append({'file': rel(p), 'width': w, 'height': h})
    return out


def poster_from_still(still, video, info, outdir, role, args, force=False):
    """WebP posters at the clip's widths from the poster still supplied next to a named clip (aivinci/tiger.png for
    tiger.mp4) instead of a decoded frame: centre-cropped to the clip's aspect when it differs, never upscaled (widths
    above the still's own are left out). force = rewrite them (the clip's frame size changed)."""
    from PIL import Image, ImageOps
    with Image.open(longpath(still)) as raw:
        im = ImageOps.exif_transpose(raw)
        im.load()
    im = im.convert('RGB')
    clip_dims, _ = clip_geometry(role, info)
    want = clip_dims[-1][0] / clip_dims[-1][1]
    if abs(im.width / im.height - want) > 0.005:
        if im.width / im.height > want:
            w = round(im.height * want)
            im = im.crop(((im.width - w) // 2, 0, (im.width - w) // 2 + w, im.height))
        else:
            h = round(im.width / want)
            im = im.crop((0, (im.height - h) // 2, im.width, (im.height - h) // 2 + h))
    dims = [(w, h) for w, h in clip_dims if w <= im.width] or [(im.width, im.height)]
    out = []
    for w, h in dims:
        p = outdir / f'{role}-{w}.webp'
        if args.force or force or not (fresh(p, still, False) and fresh(p, video, False)):
            view = im if (w, h) == im.size else im.resize((w, h), Image.Resampling.LANCZOS)
            view.save(longpath(p), 'WEBP', quality=POSTER_Q, method=6)
        out.append({'file': rel(p), 'width': w, 'height': h})
    return out


def poster_at(info, role, warnings, slug):
    """Seconds from info.txt "<role> poster: N" (key normalised to '<role>_poster'), else None."""
    raw = (info.get(f'{role.lower().replace("-", "_")}_poster') or '').strip().lower().rstrip('s').strip()
    if not raw:
        return None
    try:
        return float(raw)
    except ValueError:
        warnings.append(f'{slug}: "{role} poster: {raw}" is not a number of seconds - using the automatic frame')
        return None


def make_image(src, outdir, role, args):
    """Gallery image -> WebP variants (prepare_assets.py conventions: Lanczos, q88, no upscaling): IMAGE_WIDTHS plus
    the THUMB_W thumbnail (flagged "thumb", see IMAGE_WIDTHS). The source is decoded only when a file is missing."""
    from PIL import Image, ImageOps
    with Image.open(longpath(src)) as raw:               # the size only (no decode): most variants are up to date
        sw, sh = raw.size
        if raw.getexif().get(0x0112, 1) in (5, 6, 7, 8):  # EXIF orientation turned by 90 degrees
            sw, sh = sh, sw
    widths = sorted(set(min(w, sw) for w in IMAGE_WIDTHS))
    thumb = [THUMB_W] if THUMB_W < min(widths) else []
    img, variants = None, []
    for w in thumb + widths:
        h = round(sh * w / sw)
        p = outdir / f'{role}-{w}.webp'
        if not fresh(p, src, args.force):
            if img is None:
                with Image.open(longpath(src)) as raw:
                    img = ImageOps.exif_transpose(raw)
                    img.load()
                if img.mode not in ('RGB', 'RGBA'):
                    img = img.convert('RGBA' if 'transparency' in img.info else 'RGB')
            view = img if w == img.width else img.resize((w, h), Image.Resampling.LANCZOS)
            view.save(longpath(p), 'WEBP', quality=IMAGE_Q, method=5)
        variants.append({'file': rel(p), 'width': w, 'height': h, 'bytes': longpath(p).stat().st_size,
                         **({'thumb': True} if w in thumb else {})})
    return variants, {'width': sw, 'height': sh, 'codec': (src.suffix.lstrip('.') or '').lower()}


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description='Encode project videos/images for the website (see MEDIA-GUIDE.md).')
    ap.add_argument('--src', default=DEFAULT_SRC, help=f'media folder (default {DEFAULT_SRC})')
    ap.add_argument('--force', action='store_true', help='re-encode even when outputs are up to date (needed after changing --max-seconds / --keep-fps)')
    ap.add_argument('--keep-fps', action='store_true', help='keep frame rates above 30 fps')
    ap.add_argument('--max-seconds', type=float, default=0, help='trim every clip to N seconds (loops)')
    ap.add_argument('--prune', action='store_true', help='delete files in public/assets/media that the new manifest no longer uses')
    ap.add_argument('--skip', action='append', default=[], metavar='FOLDER',
                    help='leave a project folder out of this run (e.g. one still being captured); its previous manifest entry '
                         'and its files are kept unchanged (repeatable)')
    args = ap.parse_args()

    src_root = pathlib.Path(args.src).expanduser().resolve()
    if not src_root.is_dir():
        sys.exit(f'ERROR: media folder not found: {src_root}\nCreate it (one sub-folder per project, see MEDIA-GUIDE.md) or pass --src <folder>.')

    warnings, timings, rows, projects = [], [], [], []
    edits = read_edits(warnings)
    try:                                                 # previous edits: a changed edit re-encodes that clip
        old = json.loads(MANIFEST.read_text(encoding='utf-8')) if MANIFEST.exists() else {}
    except ValueError:
        old = {}
    prev_edits = {(p.get('slug'), r): m.get('edit') for p in old.get('projects') or [] for r, m in (p.get('media') or {}).items()}
    # previous frame sizes per clip width: a width whose size changes (a new crop, e.g. the hero tiles) is re-encoded
    prev_dims = {(p.get('slug'), r): {v['width']: v['height'] for v in m.get('variants') or []}
                 for p in old.get('projects') or [] for r, m in (p.get('media') or {}).items() if m.get('type') == 'video'}
    # ... and its previous CRF (entries written before "crf" was recorded: the edit's, else the default 23)
    prev_crf = {(p.get('slug'), r): m.get('crf') or int((m.get('edit') or {}).get('crf') or CRF)
                for p in old.get('projects') or [] for r, m in (p.get('media') or {}).items() if m.get('type') == 'video'}
    folders = [d for d in sorted(src_root.iterdir(), key=lambda p: p.name.lower()) if d.is_dir() and not d.name.startswith(('.', '_'))]
    slugs = {}
    for d in folders:
        s = slugify(d.name)
        if s in slugs:
            warnings.append(f'{d.name}: same web name "{s}" as {slugs[s].name} - skipped')
            continue
        slugs[s] = d
        if s != d.name:
            warnings.append(f'{d.name}: folder name used on the web as "{s}" (lower-case letters, digits and hyphens)')

    order_file = src_root / 'order.txt'
    order = []
    if order_file.exists():
        for line in order_file.read_text(encoding='utf-8-sig', errors='replace').splitlines():
            name = line.strip()
            if not name or name.startswith('#'):
                continue
            s = slugify(name)
            if s in slugs and s not in order:
                order.append(s)
            elif s not in slugs:
                warnings.append(f'order.txt: "{name}" has no project folder - ignored')
    order += [s for s in slugs if s not in order]

    t_all = time.perf_counter()
    skip = {slugify(s) for s in args.skip}
    for slug in order:
        if slug in skip:                                 # --skip: not read this run; the previous entry (if any) stays
            prev = next((p for p in old.get('projects') or [] if p.get('slug') == slug), None)
            if prev:
                projects.append(prev)
            warnings.append(f'{slug}: skipped (--skip) - ' + ('previous manifest entry kept' if prev else 'not in the manifest'))
            continue
        folder = slugs[slug]
        info = read_info(folder)
        if not info:
            warnings.append(f'{slug}: info.txt missing or empty')
        if (info.get('permission') or '').strip().lower() not in YES:
            warnings.append(f'{slug}: "permission: yes" is missing in info.txt - the media is prepared but the website will NOT show this project')
        roles, stills = find_roles(folder, warnings)
        report, shows = read_report(folder, warnings)
        if not roles:
            warnings.append(f'{slug}: no media files found')
        outdir = OUT / slug
        longpath(outdir).mkdir(parents=True, exist_ok=True)
        media = {}
        for role, f, kind in roles:
            try:
                if kind == 'video':
                    pi = probe(f)
                    edit = edits.get((slug, role)) or {}
                    changed = (edit or None) != (prev_edits.get((slug, role)) or None)
                    was = prev_dims.get((slug, role)) or {}
                    dims = clip_geometry(role, pi)[0]
                    stale = {w for w, h in dims if was.get(w, h) != h}
                    if prev_crf.get((slug, role), clip_crf(role, edit)) != clip_crf(role, edit):
                        stale = {w for w, _ in dims}                 # the quality changed: every width again
                    variants = encode_video(f, pi, outdir, role, args, timings, edit=edit, force=changed, stale=stale)
                    start = edit.get('start') or 0.0
                    # an edited clip's poster: media-edits "poster" (s after start), else the automatic frame
                    # (info.txt "<role> poster" counts from the source's own start, before the cut)
                    at = edit.get('poster') if edit else poster_at(info, role, warnings, slug)
                    if stills.get(role):                 # a named clip's own poster still (tiger.png) wins over a frame
                        poster = poster_from_still(stills[role], f, pi, outdir, role, args, force=bool(stale))
                    else:
                        poster = make_posters(f, pi, outdir, role, args, at=at, offset=start, length=edit.get('seconds'), force=changed or bool(stale))
                    dur = min([x for x in (max(pi['duration'] - start, 0.0), edit.get('seconds'), args.max_seconds) if x] or [0.0])
                    fps = min(pi['fps'], FPS_CAP) if (pi['fps'] > FPS_CAP + 0.5 and not args.keep_fps) else pi['fps']
                    media[role] = {'type': 'video', 'variants': variants, 'poster': poster, 'duration': round(dur, 3),
                                   'fps': round(fps, 3), 'crf': clip_crf(role, edit), **({'edit': edit} if edit else {}),
                                   **({'poster_source': f'{folder.name}/{stills[role].name}'} if stills.get(role) else {}),
                                   'source': {'width': pi['width'], 'height': pi['height'], 'codec': pi['codec'],
                                              'file': f'{folder.name}/{f.name}', 'fps': pi['fps'], 'rotation': pi['rotation'],
                                              'has_audio': pi['has_audio'], 'duration': pi['duration']}}
                    # ---- warnings the client can act on
                    ar = pi['width'] / pi['height'] if pi['height'] else 0
                    if role == 'laptop' and ar < 1.3:
                        warnings.append(f'{slug}/{f.name}: the laptop clip should be a landscape website recording (16:10 or 16:9); this one is {pi["width"]}x{pi["height"]}')
                    if role in ('laptop', 'hero') and pi['width'] < 1280 and ar >= 1:
                        warnings.append(f'{slug}/{f.name}: source is only {pi["width"]} px wide (1280+ recommended, 1920+ for the laptop)')
                    elif role == 'laptop' and pi['width'] < 1920:
                        warnings.append(f'{slug}/{f.name}: {pi["width"]} px wide - a 1920+ px recording keeps the laptop screen sharp on large and retina screens')
                    if role == 'hero' and ar < 1 and pi['width'] < 720:
                        warnings.append(f'{slug}/{f.name}: portrait source is only {pi["width"]} px wide (1080 recommended)')
                    if dur > 20:
                        warnings.append(f'{slug}/{f.name}: {dur:.1f} s long - loop clips should be 5-20 s (use --max-seconds 10 to trim)')
                    if pi['has_audio']:
                        warnings.append(f'{slug}/{f.name}: sound removed (website videos are always muted)')
                    for v in variants:
                        if v['width'] >= 1920 and v['bytes'] > 4 * MB:
                            warnings.append(f'{v["file"]}: {v["bytes"] / MB:.1f} MB - over 4 MB for a desktop variant (shorter clip or --max-seconds)')
                        elif v['width'] <= 1280 and v['bytes'] > 1.5 * MB:
                            warnings.append(f'{v["file"]}: {v["bytes"] / MB:.1f} MB - over 1.5 MB for a {v["width"]} px variant (shorter clip or --max-seconds)')
                else:
                    variants, source = make_image(f, outdir, role, args)
                    source['file'] = f'{folder.name}/{f.name}'
                    media[role] = {'type': 'image', 'variants': variants, 'source': source}
            except Exception as ex:                      # one bad file never stops the others
                warnings.append(f'{slug}/{f.name}: FAILED - {ex}')
                continue
            seen = shows.get(f.name.lower()) or {}
            if seen.get('shows'):                        # capture-report "shows" = alt text / video label
                media[role]['alt'] = seen['shows']
            if seen.get('kind'):                         # desktop | phone | video
                media[role]['frame'] = seen['kind']
            for v in media[role]['variants']:
                rows.append((v['file'], f'{v["width"]}x{v["height"]}', v['bytes']))
            for p in media[role].get('poster', []):
                rows.append((p['file'], f'{p["width"]}x{p["height"]}', longpath(PUBLIC / p['file']).stat().st_size))
        clean_info = {k: info[k] for k in INFO_KEYS if k in info}
        clean_info.update({k: v for k, v in info.items() if k not in clean_info})
        entry = {'slug': slug, 'info': clean_info, 'media': media}
        if report:
            entry['report'] = report
        projects.append(entry)

    manifest = {'projects': projects, 'order': order}
    MANIFEST.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')

    if args.prune and longpath(OUT).exists():
        keep = {v['file'] for p in projects for m in p['media'].values() for v in m['variants'] + m.get('poster', [])}
        removed = 0
        for f in sorted(longpath(OUT).rglob('*')):
            if f.is_file() and pathlib.PurePosixPath(OUT_REL, *f.relative_to(longpath(OUT)).parts).as_posix() not in keep:
                f.unlink()
                removed += 1
        for d in sorted((p for p in longpath(OUT).rglob('*') if p.is_dir()), key=lambda p: -len(p.parts)):
            if not any(d.iterdir()):
                try:
                    d.rmdir()
                except OSError:                          # e.g. a sync client holds the empty folder: harmless
                    pass
        print(f'Pruned {removed} unused file(s) from public/{OUT_REL}')

    # ---- report
    if rows:
        wf = max(len(r[0]) for r in rows)
        print(f'\n{"file".ljust(wf)}  {"size":>11}  {"bytes":>10}')
        for f, dim, b in rows:
            print(f'{f.ljust(wf)}  {dim:>11}  {b / 1024:>8.0f} KB')
        print(f'{"total".ljust(wf)}  {"":>11}  {sum(r[2] for r in rows) / MB:>7.1f} MB')
    if timings:
        print('\nEncode time:')
        for t in timings:
            print(f'  {t["file"]:<36} {t["source"]:>10}  {t["source_seconds"]:>6.1f} s of video -> {t["seconds"]:.1f} s ({len(t["widths"])} widths)')
    print(f'\n{len(projects)} project(s), {sum(len(p["media"]) for p in projects)} media item(s) -> {MANIFEST.relative_to(ROOT).as_posix()} '
          f'({time.perf_counter() - t_all:.1f} s)')
    if warnings:
        print('\nWARNINGS:')
        for w in warnings:
            print('  - ' + w)
    print('\nNext: python scripts/build.py')
    return 0


if __name__ == '__main__':
    sys.exit(main())
