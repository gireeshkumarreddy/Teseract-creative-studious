# Capture notes (capture.cjs)

Field notes from the pilot run on **geetha-jewellers** (https://geetha-seven.vercel.app/,
2026-10-13). Read the usage block at the top of `capture.cjs` for every option; this file
is the "how it actually goes" companion.

## House rules (memory + disk) - read first

This machine has 16 GB RAM that is usually almost full, and Windows grows its page file
onto C: when memory runs out (C: hit 100 % earlier).

- **One browser at a time.** Never run two capture commands in parallel, never leave Edge
  running. `capture.cjs` closes its browser on every exit path (errors, hard timeout,
  low disk). Other agents' Playwright Edges may be running - leave those alone (check the
  parent process before touching anything).
- **Free space:** before every recording and every ~5 stills:
  `powershell -NoProfile -Command "(Get-PSDrive C).Free/1GB"`.
  Under **4 GB**: stop, delete your own scratch files, report `stopped: low disk`.
  The tool enforces the same rule: `frames`/`record` refuse to start (and `frames`
  re-checks every 5 shots) with exit code **3** and a `LOW DISK` message.
- Deliverables per site <= 250 MB, no frame sequences left on disk. Delete `--samples`
  folders, exploration PNGs and contact sheets from scratch when done.
- Under memory pressure a screenshot can stall: in the pilot one frame took **17 min**
  and came back torn (half the frame shifted). The tool now retakes any screenshot that
  takes > 8 s and > 8x the typical time, and `verify` flags torn frames as
  `glitch_frames`. If it still happens: re-record (the output is deterministic).

## Paths

- Tool: `C:/Users/giris/OneDrive/Desktop/Teseract/_tools/capture.cjs` (Playwright lives in
  `_tools/node_modules`; scripts elsewhere need
  `NODE_PATH=C:/Users/giris/OneDrive/Desktop/Teseract/_tools/node_modules`).
- Browser: Edge only, `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`
  (do **not** run `msedge.exe --version`: it opens a window in the user's own Edge session).
- Media: `C:/Teseract-media/<slug>/` (never touch `vyrn/` or other slugs).
- Scratch: `.../scratchpad/capture/<slug>/` for plans, logs, traces, samples, sheets.

## Commands that work (copy, change slug/url/positions)

Run from the `_tools` folder (Git Bash shown; `S` = your scratch folder in Windows form,
e.g. `S=$(cygpath -m /c/Users/.../scratchpad/capture/<slug>)`).

```bash
# 1. Look at the site: sections + tops, sticky/fixed elements, links/buttons, errors
node capture.cjs inspect https://site/ --json $S/inspect-desktop.json
node capture.cjs inspect https://site/ --preset phone --scan --json $S/inspect-phone.json
#    (--scan: broken images, placeholder text, overflow; read the JSON as UTF-8)

# 2. Explore cheaply: many positions at 1x, then contact sheets (Pillow) to choose
node capture.cjs frames --plan $S/explore-plan.json --dpr 1 --summary $S/explore-summary.json
#    plan: {"url":"https://site/","shots":[{"out":".../x/d-00-0.png","steps":["scroll:0"],"settle":1200}, ...]}

# 3. Final stills (full resolution) from one plan - one browser, one page per preset
node capture.cjs frames --plan $S/final-plan.json --summary $S/final-summary.json
#    first shot of each preset: "steps": ["gone:#intro-overlay", "hide:.chat-bubble", "wait:500"]
#    later shots:               "steps": ["scroll:13800"], "settle": 3000

# 4. Recordings (trace + a few sample frames into scratch, never the media folder)
node capture.cjs record https://site/ --out C:/Teseract-media/<slug>/laptop.mp4 \
  --duration 15 --hold-start 1.5 --hold-end 1 --to 6150 --steps "hide:.chat-bubble" \
  --trace $S/laptop.trace.json --samples $S/laptop-s --sample-every 30
node capture.cjs record https://site/ --preset phone --out C:/Teseract-media/<slug>/hero.mp4 \
  --duration 9 --hold-start 1.5 --hold-end 1 --to 3030 --steps "hide:.chat-bubble" \
  --trace $S/hero.trace.json --samples $S/hero-s --sample-every 30

# 5. Verify (must say "verdict": "OK"), look at the sheet, extract notable frames
node capture.cjs verify C:/Teseract-media/<slug>/laptop.mp4 --trace $S/laptop.trace.json --sheet $S/laptop-sheet.jpg
ffmpeg -v error -y -i laptop.mp4 -vf "select='between(n\,396\,401)',scale=640:-2,tile=3x2" -frames:v 1 $S/check.jpg
```

Shell pitfall: in this Bash tool, backslashes inside heredocs reach Python/Node altered
(`\\n` became a newline, `\\b` a backspace). Write files that contain regexes or escapes
with the Write/Edit tool, not through a heredoc.

## Typical timings (pilot, machine under load, other agents running browsers)

| What | Time |
|---|---|
| `inspect` | ~30 s (`--scan` adds the whole-page scroll, ~30 s more for a 35 000 px page) |
| one still, desktop 2880x1800 / phone 1170x2532, settle 3 s | 5-8 s per shot (first shot of a preset 11-13 s incl. load) |
| 13 desktop + 5 phone full-res stills in one plan | ~2 min |
| record pre-load pass (35 000 px page at 2500 px/s) | ~28 s |
| record desktop 1920x1200, 450 frames | 1.5-2.9 frames/s -> 5-6 min incl. pre-load (once 22 min: paging stall) |
| record phone 780x1688, 270 frames | 2-4 frames/s -> ~3.5 min incl. pre-load |
| verify | 4-10 s |
| file sizes | laptop.mp4 15 s = 21 MB; hero.mp4 9 s = 5.8 MB; PNG 1-5 MB each; pilot folder 64 MB |

Long recordings: run them with the Bash tool's `run_in_background` and wait for the
result (a PowerShell loop that checks the output file every 10 s works); a foreground
call times out after 10 min.

## Settle times

- Default `settle` 2500 ms is the minimum; 3000 ms was used for finals.
- Intro/loader overlays: wait for them explicitly (`gone:#gjintro` on the pilot - its
  logo film runs ~3.2 s after load and then removes the element).
- Scroll-driven sticky "stages" (lerp-smoothed in JS) need the settle after a `scroll:`
  step; they converge in < 1 s.
- Scroll-triggered reveals can depend on the exact position, not on time: the pilot's gold
  bangle rail showed 4 of 5 cards at y=13600 even after 6 s, all 5 at y=13800. If
  something is missing, move the position, not the settle.
- Lazy images: `frames` forces in-view lazy images to load and ignores images clipped by
  carousels/rails (those used to cause a 20 s wait + false warning per shot).

## Smooth-scroll libraries and scroll-driven sites

- `inspect` reports `scroller`: `native`, `lenis` (instance found on window) or a warning.
  - Lenis with an instance on `window`: auto mode drives it with
    `lenis.scrollTo(y, {immediate:true})`.
  - Lenis without an exposed instance: native scrolling is followed by Lenis; usually fine.
  - Locomotive smooth mode (`[data-scroll-container]`, `has-scroll-smooth`): pass
    `--scroller js:<code that scrolls to y>` or `--scroller element:<css>` for a custom
    scroll container.
- The recording's trace (`max_deviation_from_plan_px`) must be 0-2 px; more means scroll
  snapping or scroll-jacking - change `--scroller`.
- Sticky sections that pin and animate (pilot: hero dome carousel, necklace, rings,
  bangles, men's chains, bracelets): positions are linear in scroll, so plan stills by
  `section top + fraction * (section height - viewport height)`. Pilot hero: 5 items,
  item i centred at `0.2 * i * (track - viewport)` (desktop 0/900/1800/2700/3600,
  phone 0/776/1553/2329/3106). The next section (`#our-story`) overlaps the end of the
  track and slides in from `top - viewport` (desktop 3600, phone 3038): a recording
  that ends exactly on the last item shows a cream band at the bottom. End a little
  earlier (phone `--to 3030`). Always check the LAST frames of a recording, not only
  the middle.
- **Transition starvation (fixed in the tool):** sites that set a CSS variable on every
  scroll event on an element with `transition: transform 0.18s` (pilot necklace) restart
  the transition every frame. The first version of the virtual clock froze such elements
  until scrolling stopped, then they jumped. The tool now advances running animations
  before the page reacts to each scroll step. If you ever see an element "lagging then
  snapping" at the end of a scroll, check `notable_onsets` in `verify` and extract those
  frames.

## Choosing frames / honesty

- Always LOOK at every frame (Read the PNG) before keeping it; the contact sheets are only
  for choosing.
- Chat bubbles/floating WhatsApp buttons: `hide:<css>` for stills and videos, and say so
  in the report. Do not hide anything else that belongs to the design (e.g. the pilot's
  fixed "SCROLL DOWN" hint stays; pick positions where it does not cover content).
- Testimonials with customer names are personal data of real people: keep them out of
  the gallery and the videos, mention it in `personal_data_seen`.
- Business contact details (shop address, shop phone, map) are fine to show.
- Pick scroll positions where text is not mid-reveal (half-faded spec lists, cards still
  sliding in).

## Deliverable checklist (per slug)

- `gallery-01..NN.png` (8-11): 01 = desktop cover, then best sections / inner pages, last
  two = phone (home first screen + one key page). Sizes 2880x1800 and 1170x2532 (the
  `frames` summary warns if not).
- `laptop.mp4` 12-16 s and (client sites) `hero.mp4` 7-9 s, both `verify` verdict OK,
  last frames looked at.
- `info.txt`: name / url / permission: yes / laptop poster / hero poster (seconds; pick
  a moment inside a hold, e.g. 1.0 s on the first screen).
- `capture-report.json` as specified; issues = what the owner should fix (wrong/duplicate
  phone numbers, `#` placeholder links, overlaps, clipped labels...).
- Scratch cleaned (keep only small plans/logs/traces), no browser left running.

## Pitfalls seen in the pilot

- ffmpeg 8 ignores `-color_primaries/-color_trc` unless the frames carry them: fixed with a
  `setparams` filter; `verify` now shows `bt709/bt709/bt709`.
- Mean-abs-diff motion analysis saturates: a dropped frame only gives ~1.24x the
  neighbours' diff. `verify` thresholds are calibrated on synthetic drop/dup videos;
  sticky sections pinning or reveal animations starting are one-sided changes and are
  reported only as `notable_onsets`.
- `inspect` de-duplicates links by href - all `#` placeholder links collapse into one
  entry. For a link audit, list anchors with raw `getAttribute('href')`.
- The record trace used to be written next to the MP4 (inside the media folder). Default is
  now `%TEMP%/capture-traces/`; pass `--trace $S/...` anyway.

## Our own site: the intro logo animation (14 Oct)

The TESERACT site plays an intro logo animation (~2.9 s black stage, then the logo flies into the
header) once per tab session on whatever page a fresh tab opens. Every fresh Playwright page is a
fresh tab, so a screenshot/perf tool would capture the black stage.

- `shoot.cjs`, `section-shot.cjs`, `menu-open.cjs`, `menu-measure.cjs`, `vp-at.cjs`, `perf.cjs`,
  `line-measure.cjs`, `countup-check.cjs` seed it off with
  `addInitScript(() => sessionStorage.setItem('ts-intro', '1'))`; `capture.cjs` does the same, but
  only on localhost / 127.0.0.1 (never on client sites). New tools: do the same.
- `?intro=0` suppresses it for one load, `?intro=1` replays it (owner review); never link them.
- `qa.cjs` needs nothing: its first programmatic scroll skips the intro, and it asserts that the
  overlay is gone, html has no `ts-intro` / `tsi-*` class and the header logo has opacity 1.
- `font-check.cjs` and `nojs.cjs` need nothing (no text in the overlay; no JS = no intro).
- Lab audits (Lighthouse etc.): use `?intro=0` and report the first-visit cost separately.
