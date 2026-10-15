TESERACT Creative Studios - brand kit
=====================================

Start with guides/TESERACT-brand-guidelines.pdf: how to use everything below.

logos/svg   The logo as vector files - use these wherever you can (website, print, design tools).
            teseract-logo                 full logo: the mark above TESERACT and CREATIVE STUDIOS
            teseract-horizontal           mark left, wordmark right, 256 px wide and up
            teseract-horizontal-compact   the website header lockup: mark + compact wordmark,
                                          132 to 255 px wide
            teseract-wordmark             TESERACT + CREATIVE STUDIOS, 200 px wide and up
            teseract-wordmark-compact     the small-size wordmark, below 200 px wide (never under 104 px)
            teseract-mark                 the mark on its own, 24 px tall and up
            -white = for black or dark backgrounds, -black = for white or light backgrounds.

logos/png   The same logos as transparent PNG at 512, 1024, 2048 and 4096 px wide,
            for apps that do not take SVG (Word, PowerPoint, Canva, social posts).
            teseract-mark-3d.png - the 3D render of the mark: the studio's avatar where the studio
            speaks (28-64 px on the website: buttons, chat bubbles, contact cards) and hero moments
            up to 515 px; never a favicon or app icon (use the flat mark), never enlarged beyond
            515 px. Its canvas includes a soft shadow down and to the right: centre the shards,
            not the file.

app-icons   Website and phone icons: favicon.svg / favicon-32.png / favicon.ico for browser tabs,
            apple-touch-icon-180.png for iPhone home screens, icon-192 / icon-512 / icon-maskable-512
            with site.webmanifest for the web-app manifest. The app icons keep the mark inside the
            80 % safe zone; the favicon fills its tile so it stays legible at 16 px.
            This is the kit's black-first set, ready to install with the head tags below. The live
            website still ships its earlier icons (a dark mark on white) and the 3D logo on white
            as its link preview.

social      Ready-to-upload images: profile pictures (dark and light), the link-preview image
            (og-image), the LinkedIn banner and an Instagram story cover.

guides      The rules: clear space, minimum sizes, colours, what not to do, and the full PDF guide.

Quick rules
- Use the files as they are: white on black, black on white. Never stretch, recolour, rotate,
  outline, add effects or retype the name in a font.
- Leave clear space around the logo equal to the height of the letters in TESERACT.
  The mark on its own keeps a quarter of its height clear.
- Smallest sizes on screen: full logo and wordmark 200 px wide, horizontal 256 px,
  horizontal compact 132 px, compact wordmark 104 px, flat mark 24 px tall (browser tabs
  use the favicon files), 3D mark 28 px.
- Colours: black #000000, white #FFFFFF, text #F4F4F2, red accent #FB2629, deep red #970102.
- Typeface: Inter Tight (Light 300 for text, Regular 400 for buttons and small labels,
  Medium 500 for emphasis). Brand files use Inter Tight. On Apple devices the website shows
  the installed Helvetica Neue first (same weights); Inter Tight everywhere else.
  Never embed or share Helvetica Neue.

Website head tags
The paths assume the files sit at the site root. Replace YOUR-DOMAIN with the site's address:
link previews need an absolute URL.
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#000000">
<meta property="og:image" content="https://YOUR-DOMAIN/og-image-1200x630.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
