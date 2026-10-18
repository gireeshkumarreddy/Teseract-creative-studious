# Adding your project videos

The website is ready for your own project videos. Nothing changes on the site until you add them.
Put the files in folders as shown below, then run two commands.

## 1. One folder per project

```
C:\Teseract-media\              <- keep this folder OUTSIDE OneDrive
  order.txt                      optional: folder names, one per line = order on the site
  derlin-haus\
    info.txt
    laptop.mp4                   website recording for the laptop on the home page
    hero.mp4                     short loop for a tile in the home hero gallery
    gallery-01.mp4               project page media, in order (videos or images)
    gallery-02.jpg
    gallery-03.mp4
```

- **Folder name = the project's web name** (lower-case letters, digits, hyphens), as listed in
  `scripts/portfolio.json` (the curated list of the studio's own websites: name, group, industry, services,
  live link, concept label). A project appears on the site once its folder has `gallery-NN` stills and
  `permission: yes`; to add a new project, add an entry to `portfolio.json` as well.
- `capture-report.json` (written by the capture tool) is optional: its per-file "shows" lines become the
  images' alt text and its tagline is used in the page description.
- Videos: `.mp4`, `.mov`, `.webm` or `.m4v`. Images: `.jpg`, `.png` or `.webp`.
- Every file is optional. A project can have just a hero clip.

## 2. info.txt

Copy this into `info.txt` in each project folder and fill it in:

```
name: Project name
client: Client company
url: https://client-website.com
description: One or two sentences about the project.
services: Website Design / Development
year: 2026
permission: yes
```

- `permission: yes` confirms the client is happy for you to show this work. Without it the files are prepared,
  but the website does not show the project.
- For a project already on the site, its name, industry and case-study page stay as they are.
- Links: a project with a case-study page links there; otherwise to `url`; otherwise no link.
- Optional still frame: `laptop poster: 8` (or `hero poster: 3`) uses the frame at that second as the
  still image shown before the video plays and on phones that block autoplay. Without it the first
  clear frame is used. Pick a calm moment, not a transition.

## 3. Which clip goes where

| File | Where it appears | What to supply |
|---|---|---|
| `laptop` | Home page, the laptop screen in "The Idea" section. Up to 4 projects take turns, cross-fading; only the one on screen plays. They replace the screenshots shown now. | A **landscape** screen recording of the website, 16:10 or 16:9, ideally **1920 px wide or more** (2560 or 4K is welcome). 8-15 seconds that loops cleanly. |
| `hero` | Home page hero gallery. Up to 7 clips play there, spread across the columns (on phones too). | A **5-10 second loop**, portrait or landscape. The tile crops it to its own shape, so keep the subject in the middle. |
| `gallery-01`, `gallery-02`, ... | The project page gallery, in this order (ready for when the portfolio pages are rebuilt). | Any mix of videos and images. |
| any other name, e.g. `tiger.mp4` (+ `tiger.png`) | A **named loop clip**: shown where `scripts/portfolio.json` names it - `"card_clip"` plays it on the project's Work page card (muted, looped, only while on screen), `"tile_clip"` on its home hero tile instead of `hero`. Aivinci uses its tiger; the six landing pages use `tile.mp4` (a 16:9 desktop loop: hero, then the second section) and their `hero.mp4` where only a portrait tile is left. | A short silent loop. An image with the same name is used as its still (poster) instead of a frame from the video. |

## 4. Quality notes

- **Keep your 4K masters.** The site makes its own copies 640, 1280, 1920 and 2560 px wide (never wider than
  your file). Each visitor gets the smallest copy that looks sharp on their screen.
- Copies downloaded from Instagram are at most about 1080p and already compressed. Use the originals when you can.
- **Sound is removed.** The website videos always play muted, and music licensed through Instagram does not
  cover use on a website.
- Videos are limited to 30 frames per second, which keeps the files small.
- Phones in **Low Power Mode** or **Data Saver**, and visitors who switched on "reduce motion", see a still frame
  (the poster) instead of the video. This is expected.
- Short loops load fastest. The script warns when a copy is large. `--max-seconds 10` trims every clip to 10 s.
- One clip only (the media folder itself is never edited): `scripts/media-edits.json` cuts a clip's start (for example a
  site's loading screen), keeps a set length and picks its still frame - `{"tavra": {"laptop": {"start": 1.5,
  "seconds": 15, "poster": 0.5, "crf": 26}}}`. A changed entry is re-encoded on the next run.

## 5. The two commands

Open a terminal in the `teseract-website` folder and run:

```
python scripts/prepare_media.py --src C:/Teseract-media
python scripts/build.py
```

The first command needs **ffmpeg** (install once with `winget install Gyan.FFmpeg`, then open a new terminal).
It takes roughly **3-5 minutes per minute of 4K video** (up to about 12 when the PC is busy with other work). Running it again only processes
new or changed files. Read the **WARNINGS** it prints at the end. Then upload `dist/` as usual.

Options: `--force` (redo everything; use it after changing the next two) · `--max-seconds 10` (trim clips) · `--keep-fps` (keep 60 fps) ·
`--prune` (delete prepared files you have removed from the media folder) · `--skip <folder>` (leave a folder out of the
run, e.g. one still being captured: its earlier prepared files stay as they are). Folders whose name starts with `_`
(`_supplied`, `_removed`) are never read as projects.
