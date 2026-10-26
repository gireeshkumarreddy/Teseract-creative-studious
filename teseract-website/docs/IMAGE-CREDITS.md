# Image credits: third-party photos

The site's own images are the studio's work: project media, Gireesh's designs and the AI images he made. The
photos below are the only third-party images. They are free stock photos, used as **inspiration** on the Who We
Are page, and the page never presents them as the studio's work: each large panel is labelled "Inspiration 0X"
and names its photographer.

**Licence:** the [Unsplash License](https://unsplash.com/license). It allows free use, including commercial use,
with no permission or attribution needed. It does not allow selling a photo unaltered or building a competing
photo service from them. No Unsplash+ (paid) photo is used. We credit the photographers anyway.

**Originals:** each one is kept untouched (all 4K or larger) in `C:/Teseract-media/_inspiration`. The site serves
WebP copies cut from them, at 640/1280/1920 px for the panels and 320/640 px for the small tiles. The table is
`scripts/inspiration.json`, and the files are made with `python scripts/prepare_supplied.py --table scripts/inspiration.json`.

| Where on /who-we-are/ | Photo | Photographer | Original |
|---|---|---|---|
| How we think, panel 01 (form) | [Curved red paper layers](https://unsplash.com/photos/curved-red-paper-layers-1Q6gfwHc5GI) | [Forest S](https://unsplash.com/@forest_ms) | 4054 × 6081 |
| How we think, panel 02 (colour) | [Colour-blocked paper planes](https://unsplash.com/photos/green-white-and-blue-abstract-painting-0p6jFznXPsg) | [Max van den Oetelaar](https://unsplash.com/@maxvdo) | 4000 × 6000 |
| How we think, panel 03 (clarity) | [Glass prism on colour blocks](https://unsplash.com/photos/colorful-geometric-shapes-and-a-glass-prism-B9uu2KWsPv8) | [Maxim Berg](https://unsplash.com/@maxberg) | 2851 × 5000 |
| [ Who we are ] box | [Blue fibre optics](https://unsplash.com/photos/abstract-blue-glowing-fiber-optics-with-bokeh-effect-DGwunSOMMbk) | [Kashish Lamba](https://unsplash.com/@drunkenchimp) | 4160 × 6240 |
| Our philosophy, /03 box | [Prism light spectrum](https://unsplash.com/photos/rainbow-prism-light-spectrum-on-dark-surface-kBzQNk9AgOg) | [Evie S.](https://unsplash.com/@evieshaffer) | 3337 × 4611 |
| How we think, the (people) tile | [Orange light streaks](https://unsplash.com/photos/orange-red-and-purple-fluid-streaks-on-black-background-5jJ8p_S1t7M) | [Susan Wilkinson](https://unsplash.com/@susan_wilkinson) | 3375 × 6000 |

Chosen 26 Oct 2026 at the owner's request: "cool aesthetic images about the technology ... a unique design
approach ... colour ... inspiration designs ... from a free source ... 4K". The set's direction is
**form, colour, clarity** in the site's own accent colours (red, blue and the hero's orange). There are no people
and no brand marks: Pantone cards were left out because they print a third-party brand name. Each panel's swatch
strip shows that photo's four main colours, which `prepare_supplied.py` extracts and stores in
`scripts/inspiration-manifest.json`.

To swap a photo: put the new original in the folder, change its row in `scripts/inspiration.json` (file, crop,
credit), re-run the command above, then run `build.py` and `check.py`. check.py fails if a photo has no credit,
isn't prepared, or isn't shown on the page.
