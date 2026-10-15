# Issues found on your websites during capture

While capturing each website for the TESERACT portfolio, the capture agents noted problems a visitor could hit.
Nothing was changed on any site. Updated as each capture finishes.

---

## Geetha Jewellers: https://geetha-seven.vercel.app/
Captured 13 Oct 2026, desktop 1440 px and phone 390 px.

**Content**
- Two different store phone numbers: the "Visit Our Store" card and the "Contact Us" button use **+91 99449 93523**,
  the footer shows **+91 98448 93523**. One of them is probably a typo.
- Links that go nowhere (`#`): TERMS and PRIVACY POLICY in the header and menu; in the footer Terms & Conditions,
  Privacy Policy, Refund Policy, Shipping Policy, and the Instagram, Facebook and YouTube icons.

**Layout**
- The fixed "SCROLL DOWN" hint stays on screen for the whole page and covers content (desktop: first card of the rings
  row and the necklace detail cards; phone: the hero).
- Desktop 1440 px: in Earrings and Men's Rings the intro paragraph runs under the first glass arch; "DRAG TO ROTATE"
  next to the 360° button is cut off at the right edge ("DRAG T").
- Desktop: in the Silver Bangles view the "EVERYDAY ELEGANCE" label overlaps the paragraph.
- Phone: in Earrings the labels "DIAMOND DROPS" and "PEARL ELEGANCE" run into each other; in Rings the callout labels
  are hidden but their dotted leader lines still show.
- Men's Bracelets: the first bracelet sits over the "Detail" headline (desktop and phone).
- Desktop, gold-to-silver rings transition (around 9000–9400 px scrolled): a blurred see-through rectangle briefly
  covers the pedestal.

**Privacy note**
- The Customer Stories section shows customers' full names. It was kept out of every portfolio image and video.

---

## Derlin Haus: https://derlin-haus.vercel.app/
Captured 13 Oct 2026. Online menswear shop (shirts, T-shirts, trousers; INR, free delivery, cash on delivery).

**Layout**
- Home, desktop 1440 px: the carousel's previous arrow (←) sits on top of the "C" of "THE SHIRT COLLECTION".
- Bag page (/cart), desktop: the item card's top border touches the "My Bag" divider (no spacing), and an extra short
  divider appears above the Offers & Coupons box.
- Product page offer tiles (auto-scroll every 3 s): in the end position the left tile is cut so only its copy icon shows.
- The announcement bar blinks off for about 0.9 s every time its message changes (every 3 s) - visible as flicker.

**Images**
- Shop by Category cards (Casual Shirts, Full Sleeve T-Shirts, Half Sleeve T-Shirts): cut-off text fragments ("BE" / "BET")
  in the top-right corners - text printed on the source photos. Desktop and phone.
- Home hero, desktop: faint lighter rectangles in the sky behind the logo and headline (the patch behind the copy doesn't
  quite match the photo). Only noticeable up close.

**Content**
- Product names are inconsistent: some are plural ("Dark Grey Checked Shirts"), some leave out the garment type
  ("Aqua Blue Printed", "Light Grey Striped", "Steel Blue Textured"...).

**Accessibility**
- "EXPLORE THE PIECE" on the home editorial image is grey text over dark denim: low contrast.

---

# Concept sites (from your own screen recordings)
Stills were taken straight from your videos (1920x1080). Where the recording itself shows a problem, it is noted here;
re-recording fixes cursor-related items.

## AARADHYA (Maa Durga saree house) - "durga saree.mp4"
- The ring cursor sits on the text in two screens (verse over brocade; "Not just a drape. A legacy.").
- "WOVEN IN DIVINITY." never settles on screen in the recording, so it isn't in the gallery.
- The sticky header has no background: headlines and the Durga image run into the navigation while scrolling.
- One Sanskrit verse shows ङ्ग with a visible halant instead of the joined letter.
- The first 5.5 s of the recording is the loading splash.

## TĀVRA (Indian-craft activewear) - "Tavra.mp4"
- Section numbers in the menu skip: 01, 02, 04, 05, 07, 09.
- Sport section: the left info card is cut off by the screen edge.
- A "SHOP" hover bubble covers the photo in the sport edit grid for the whole time it's on screen; another cursor ring
  overlaps "BAG (1)".
- Prices are in euros - confirm that's intended.
- The bag says checkout isn't connected (fine for a concept).

## SAANJH (drinks) - "saanjh.mp4"
- The recording is only 10 s and ends mid-scroll, so nothing below the golden-hour banner is captured.
- "Old roots. New rituals.": the ingredient image overlaps the body copy and numbers (left out of the gallery).
- "Scroll to savour" sits on top of the ginger in the hero; the header button stays on "Meet Gulab Velvet" after leaving
  that blend; the header tagline is clipped over the golden-hour banner.
- Kesar Cloud: the ingredient explorer adds ginger but the label doesn't list it.

## VELORA PARIS (fragrance) - "Perfume.mp4"
- **Photo licences:** the gallery credits named photographers (Denis Gorbuleac, Hassan Ouajbir). Check you may use those
  photos before the site is published with them.
- "VIEW" / "READ" hover bubbles sit on photos in two screens; a small cursor dot shows in several.
- Hero: the scroll hint is hidden behind the giant "velora" letters; the top-right ÉCLAT label is hard to read on the sky.
- "Shop" is the only nav item not in capitals; the last word of the footer line wraps alone; a faint leftover label shows
  in the orange "Dusk" setting. The first 3.3 s is a loading screen.

---

## AeroSkys: https://aeroskys.vercel.app/
Travel booking (flights, hotels, holidays, bus) for Jackpot Travels Pvt Ltd; footer says "Working prototype · bookings are simulated".
- Open-roles count disagrees: the menu says "We're hiring — 3 open roles", the careers site says 15 designations (5 hiring now).
- Home offers rail: two visa cards have the identical title "Special Visa Services Deal – Flat 25% OFF"; the offer banner
  images are cropped at the top, cutting off the first line of text inside them.
- Blog "Best Visa Deal" is about US credit cards (Chase Sapphire, Capital One, Discover) in USD - doesn't fit an Indian
  travel agency's visa services.
- Flight results (desktop): the first item of the fare calendar strip is clipped under the left arrow.
- Minor: a hidden "Role details" link with href="#undefined"; the 404 page has no H1.
- Privacy: a reviewer's name shows in the reviews section - kept out of all portfolio images.

## Careers at Aeroskys: https://aeroskys-careers.vercel.app/
- Brand spelling is inconsistent: "Aeroskys" (title, logo, nav, body) vs "AeroSkys" (application question 6, "Why AeroSkys"
  heading, footer legal text, mailto subject). The main site uses "AeroSkys".
- Job page, "What the job actually is" (desktop 1440 px): card 04 and the edge of card 01 hang off the dark panel onto the
  light background, where their white text becomes hard to read.
- Phone: the top utility bar hides its text but keeps the divider, leaving an empty half-bar with a stray line.
- Scroll-reveal content appears late: blocks entering the lower part of the screen stay blank until scrolled further
  (e.g. the Growth group, the three benefit cards), leaving large empty areas.
- Minor: a hidden "Role details" link with href="#undefined".

---

## Vesper: https://wall-lights.vercel.app/
Architectural lighting storefront with a site-wide day/night mode; footer says "Prototype storefront — no real orders are processed."
**Content**
- Placeholder contact details: studio@vesper.example and +351 21 000 0000.
- Instagram and Pinterest footer links go to the generic instagram.com / pinterest.com home pages, not a profile.
- The footer's Shop list leaves out Outdoor and Decorative Lighting (the menu and shop tabs include them).
- Ora product page, "From the same family" (Terra collection) includes Vessel, which is labelled Pendant · Nocturne.
**Layout**
- Phone (390 px), Day & Night section: pendant cords and the Knot rope run across the heading, paragraph and the
  "Let the evening arrive" button; the labels "Arc Shade" and "Cage Globe" wrap onto two lines.
- Desktop, Day & Night: lamp names aren't centred under their lamps (25-60 px to the left at 1440 px).
**Behaviour**
- The header reappears at the end of every smooth/momentum scroll (code: hidden = y > 240 && y > last + 4), instead of
  staying hidden until the visitor scrolls up.
- The header's frosted blur didn't render in the automated captures, so text shows through it sharply - check in a
  real browser (may be a capture limitation).
All 41 internal links worked; no console errors, broken images or placeholder text.

---

## THE PARADISE (film promo concept): https://paradise-lc5r.vercel.app/
Single-page cinematic promo for the film "The Paradise" (starring Nani). Shown in the portfolio as an unofficial fan project.
- The full-screen loader blocks the page for about 7-9 s (the whole hero film loads first) - consider streaming it.
- Between the hero and Chapter II the screen is almost entirely black for 600-900 px of scrolling; it can look like a blank page.
- Release text disagrees: "IN CINEMAS 2025" under the billboard vs "COMING SOON" elsewhere (2025 is in the past).
- The four social icons link to "#"; the Characters/World/Gallery tiles and "Explore the world" all jump to the same
  section, and "Music" / "Stay updated" jump to the block they're in (no sign-up).
- Phone: the Chapter II caption is drawn across the winged figure's face; a 1 px light line runs down the right edge of
  the hero film.
- Chapter II (desktop): the image bounds clip the wing tips with straight edges; Chapter III: the centre figure's cut-out
  has a flat, dark-edged top on the hair.

---

## Mahira Select: https://mahira2.netlify.app/
Online store for Indian ethnic womenswear (sarees, kurta sets, anarkalis, lehengas, Kalakaari line) with a 4-step checkout.
**Images (most visible to customers)**
- Several catalogue photos have image-generation artefacts baked in: s3-sarees / s3-kurta / s3-dresses repeat a band of
  the photo with a visible seam (e.g. the main photo of "Chanderi Silk Saree"); s4-p1/p2/p3 have a smeared, stretched
  bottom quarter; s5-p4 has ghost lettering ("tradition.") and a stray sleeve; s7-story has an extra hand fragment.
- Product photos are low resolution (277-600 px wide) but shown up to ~800 px wide - soft on desktop and retina.
**Shop pages**
- Search, Wishlist and Bag icons are invisible on every inner page (.util stays opacity 0 because only the home intro sets
  body.is-ready) - no visible cart icon or count outside the home page.
- Wishlist icon links to /track and the Search icon to /shop?c=women instead of opening a search.
- "Added to Cart" shows an empty circle instead of the green tick (.ad-tick is defined twice in shop.css).
- 35 of 60 home-page links are href="#" although the real category/product pages exist.
- A "Powered by Netlify" badge is fixed bottom-right on inner pages and covers the Buy Now button on phones.
**Content**
- Product pages show hard-coded star ratings and review counts ("84 reviews") but the site has no reviews - remove or
  connect real reviews before launch (fake social proof can mislead customers).
- The footer's "The Complete Journey" opens a prototype walkthrough (/explore) - remove before launch.
- "Kalamkari" (home card) vs "Kalakaari" (nav, sections) - check spelling. Footer says © 2025.
- Cart page is shorter than the window (empty band below the footer at 1440x900).

---

## Vynk Network: https://vynk-zeta.vercel.app/
Travel eSIM store (190+ destinations, USD plans, 17 languages). The login page says it's a preview build with simulated payments.
- Contact page shows a placeholder phone/WhatsApp number: "+1 0000000000".
- Blog is empty ("No blog posts found…"), yet the footer's "Latest posts" links to it.
- Footer social links (Facebook, X, LinkedIn, YouTube) go to the generic home pages; Instagram points to
  instagram.com/vynknetworkoffical - check the spelling ("offical").
- Broken flag: the "Netherlands Antilles" card loads flagcdn.com/w160/an.png, which fails; that card has no price either.
- Some catalogue cards show "View plans" instead of "From $…" (e.g. Vietnam, Bangladesh) although their pages list prices.
- Wording/claims: "Join 1M+ travelers" vs "Trusted by thousands of travelers" elsewhere; brand written "Vynk Network" and
  "VYNK Network". Make sure "1M+" is a real figure before launch.
- Minor: faint rectangular seams in the cloud layers behind "Your Global Connection Starts Here" (1440 px); a faint grey
  shadow in the top-left corner from the hidden "Skip to content" link.

---

## SIAARA By S&A: https://gleeful-belekoy-e52bbe.netlify.app/
Online saree boutique, Jubilee Hills, Hyderabad (25 handcrafted sarees, ₹2,750–3,650).
**Images**
- "Shop by Color": the decorative leaf-shadow image has baked-in text ("EXPLORE OUR SAREE / SHOP BY") that shows as a
  clipped ghost heading above the real heading.
- Decorative photo tiles (leaf shadows, blossoms, gold leaves) show hard rectangular edges instead of blending in.
- Several "Sarees by Origin" card photos have stretched/smeared pixels near the Explore buttons; a pixelated patch in the
  New Arrivals corner arc; a smeared patch in the hero above "Scroll to discover"; a smeared band in the map image.
- color.html: the Orange and Black tiles show a plain placeholder circle instead of a photo.
**Layout**
- New Arrivals (1440 px): the first card cuts off the last letter of "Timeless Grace".
- Side statements ("Heritage in Every Weave", "Heritage Never Fades", "Loved by Generations") sit under the header icons.
- The fixed header covers the start of each section reached from the nav (eyebrows, "SAREES BY ORIGIN", the "01" label).
- Hero: the divider lines run through "THE SIAARA SIGNATURE".
- Tulip card: the description is partly hidden behind the model's head.
- Phone: the header has no background when scrolling, so content passes under the logo and icons.
**Content / behaviour**
- Colour lists disagree: home rail has Neutrals (links to a page with no colour), the colour page has Orange and Black.
- Kota Doria page: the film shows the browser's own video controls on top of the custom "PLAY THE COLLECTION FILM" overlay.
- A "Powered by Netlify" badge sits bottom-right on every page.

---

## Aivinci Creative Studio: https://aivinci.ai/
Single-page site for an AI creative & technology studio (films, content, digital products; its own product Zynnect).
- "View All Work" does nothing when clicked.
- All four case-study overlays (Beyond Limits, Urban Pulse, Living Spaces, The Next You) show the same generic text and a
  single still - no project-specific description or media.
- Work images are low resolution (e.g. tile-04.jpg 222x285 px shown at ~638x359): soft on desktop and phones; eye.jpg too.
- With a case-study overlay open, the next section ("04 / AI VIDEO STORY") stays visible and undimmed at the bottom.
- Section numbering repeats and skips: two "04", two "05", no "06" before "07 / CONTACT".
- The founder section's name, title, bio and "10+ years" are baked into one image - not selectable, searchable (SEO) or
  translatable; make them live text.
No console errors, failed requests, broken images or overflow found.

---

## SAN Media Solution: https://www.sanmediasolutions.com/
Digital marketing agency in Coimbatore ("AI Snake Marketing Agency").
**Privacy / data (fix first)**
- The contact form uses method="get" with its action pointing at sanmedia-onboarding.netlify.app/?fbclid=… - a GET
  submit would put the visitor's name and email in a URL. Check where messages go and switch to POST.
- 36 home-page links (and 3 on projects.html, plus "Join The Team") carry a pasted Facebook click ID (?fbclid=…). Remove it.
**Layout**
- The fixed header has no background until ~500 px of scroll, so the hero headline and button slide under the logo and nav.
- Desktop: the pinned "We build Growth Systems." stage has its first heading line and paragraph cut off under the header.
- Desktop services deck: a strip of the previous slide (05 Website Development) shows along the left edge.
- Desktop: ~500 px of almost-empty white screen between the package cards and the Growth Systems stage.
- Phone: "WE BUILD GROWTH SYSTEMS." runs past the right edge during the cross-fade.
- Founder section: "BIGGER TOMORROWS" is clipped at the right; the vertical "SAN MEDIA SOLUTION" label reads "…SOLUTIO".
- Clients: the divider runs through the word "Campaigns"; Contact card: the address runs into its arrow button.
- Hero plant images end in hard vertical edges; the fixed "BACK TO TOP" pill covers content in places.
**Accessibility**
- 75 of 146 home-page images have empty alt text.

---

## Hidden Stories: https://gireeshkumarreddy.github.io/hidden/
Eight short-stay homes in Hyderabad (villas, farmhouse, heritage homes, apartments) with a booking platform.
**Content (confirm before launch)**
- Guest testimonials with names and cities, review texts, review counts, ratings and host names are hard-coded in
  site-data.js / catalogue.js - confirm they're real (and that the guests agreed), or remove them.
- The same photos are reused for different homes (e.g. Amara Villa and Palm & Pine share two; Nest Residences, Ivory Loft
  and The Meridian Suites share three).
- Rating format differs: Qutb Manor shows "★ 5" while the others show one decimal (4.9).
- Booking requires sign-in, and sign-in says "Demo mode… until Firebase is connected."
**Layout / accessibility**
- Desktop hero: the tour controls (previous/pause/next) sit under the "Three reasons" dome and can't be clicked.
- The home page has no H1 (the headline is SVG text) - bad for SEO.
- The transparent desktop header lets headings and illustrations run into the logo and nav at several points.
- The fixed "Check dates & book" bar covers captions, paragraphs, prices and card text at the bottom of the screen.
- Neighbourhood map: the Hussain Sagar icon covers its label; Shamshabad and Kokapet are cut off at the edge.
- Low contrast: the white paragraph over the bright sky in "Real-life Hyderabad".
- Bougainvillea illustrations end in hard straight edges; hero captions wrap awkwardly; on the Stays page cards below
  the first row stay invisible until you scroll further.
**Privacy note**: guest names, reviews and host names were kept out of every portfolio image and video.

---

# More concept sites (captured live)

## Kingfisher (unofficial concept): https://gireeshkumarreddy.github.io/kingfisher/
**REMOVED from the portfolio** (your decision, 14 Oct): it is no longer on the TESERACT website; its captures are kept
in C:/Teseract-media/_removed/kingfisher. The notes below only concern the site itself.
The site itself says it's an unofficial concept and doesn't sell alcohol - good.
- Phone: on the first screen the bottle covers most of the headline ("TH… OF / GO…MES."); while scrolling it also sits over
  "Scroll to discover", the "beer at a glance" card text and "Some things just feel like India."
- Phone: the beer filter tabs scroll sideways and the last tab is cut off ("FLAVO…") with no fade or arrow.
- The main Strong bottle image is 234x886 px but shown ~640 px tall on desktop - soft on retina screens.

---

## ONE PIECE | Luffy (unofficial fan tribute): https://gireeshkumarreddy.github.io/one-piece-/
- Phone: the chapter openers (Chapters I-IV) don't stay pinned - they scroll away, the arch animation plays off-screen,
  then they snap back; while a pin is "active" the header turns white, so the ONE PIECE wordmark vanishes on white panels.
- Phone: in the bounty section the wanted posters cover the headline.
- Desktop: flying cards in "The voyage" pass in front of the fixed header; the bounty section shows an almost-white screen
  for a moment before its content animates in.
- favicon.ico 404 (no <link rel="icon">) logs a console error on every load.
- Minor: colour banding in the Chapter I flame clip at full screen on 2x displays.
- Rights: the page uses anime footage and artwork owned by others (credited to Eiichiro Oda / Shueisha, Toei Animation;
  "unofficial fan experiment, never sold"). It's labelled as an unofficial fan project in the portfolio.

---

## LiveCV (product concept): https://gireeshkumarreddy.github.io/Livecv/
- Phone: for-institutions.html is 441 px wide at a 390 px screen - header, headline and intro are cut off on the right.
- Home: after the blue launch-video section, the navy "What is LiveCV?" section shows without its background for ~0.65 s
  (white text on the light page), then the gradient pops in.
- Pricing lists only the Free plan, while other pages mention paid plans ("See plans", "from the Basic plan").
- About page uses the placeholder "John Doe · Sr. Product Designer · Stripe · Berlin" (a real company).
- Mixed domains: livecv.dev / placements.livecv.dev vs livecv.work for examples and emails.
- Possible typo (features): "Resumes and cover letters retuned for the role…" ("returned"/"tuned"?).

---

## Gireesh (your portfolio): https://gireeshuiux.vercel.app/
- At 1440x900 the "Request a meeting" dialog content is 44 px taller than the box, so the last line
  ("Prefer email? gireeshuiux@gmail.com") sits on the bottom edge until you scroll inside it.
- Two booking paths: the header "Book a Call" opens the on-site form, while every "Book an appointment" button opens an
  email draft instead - pick one.
No broken images, console errors or overflow found.

---

# Your GitHub projects (captured from local copies of the repos, 15 Oct; none is hosted yet)

## VYRN (fashion storefront concept): repo https://github.com/gireeshkumarreddy/VYRN
**Rights - please read**: the home hero's headline is **A-COLD-WALL** (with "ACW_01"), a real fashion label, and the hero
photo and layout come from another designer's published concept page for that label (the repo ships it as
public/assets/image2.jpeg), and the Casual look in the categories wears Nike-swoosh socks. Your portfolio page for VYRN
leaves out every A-COLD-WALL / Nike-sock screen; your own VYRN film on the home laptop still shows them (your choice).
Every model photo is an AI recreation of reference screenshots made to keep the models' faces, and the repo doesn't say
where the reference photos come from. This concerns every VYRN image we show, not only the film: the project page's
stills (gallery-03 to 08, 10), its Work card, home tile, footer ring and the E-commerce frame all show these models.
Confirm their rights and likeness before launch. Two kept stills (gallery-05 Knitwear / Bomber looks, gallery-06 product
cards 02 and 06) also show Air Force 1-style sneakers with a faint same-colour swoosh. The logo is written VYRN® while
the brand is a concept; the ® sign is only for a registered trademark. See LAUNCH-CHECKLIST 3d.
- The reference screenshots (public/assets/image1.png, image2.jpeg ... image10.jpeg, category-models.png,
  product-portraits.png) are built into the site and downloadable although no page uses them - remove them before any
  deployment.
- Hero labels: "ACW_01 / EDITORIAL STUDY" is partly covered by a texture tile; on desktop "MATERIAL / ARCHITECTURE /
  HUMANITY" is dark grey on the dark jacket and almost unreadable.
- "Our approach" collage at 1440 px: "ONE SHARED LANGUAGE." is partly hidden behind the Berlin card and the numeral 3 is
  half covered.
- Console error on every page: "[vinext] RSC prefetch setup error: TypeError: te is not a function".
- It is a preview (payments off, "Preview terms.", "illustrative until launch") - fine for a concept, to change before a
  real launch.
All 32 internal routes worked; no broken images, placeholder text or horizontal overflow.

---

## THENGA (coconut-water brand concept): repo https://github.com/gireeshkumarreddy/thenga
- Photo licences: the "Rooted in Kerala" section and the backwaters panel use credited third-party photos (Unsplash /
  CC BY-SA, incl. a real Kathakali performer). None of them is in our stills or videos; if you ever show those sections,
  keep the credits (and CC BY-SA terms).
- The logo is written THENGA® while the brand is a concept - the ® sign is only for a registered trademark.
- 3D story: the photo coconut and the 3D coconut overlap for a moment at the hand-off (very visible on phones), and the
  3D halves disappear in one frame near the end; two chapter headlines cross-fade on top of each other.
- Decorative fronds, leaves and small coconuts often sit over body copy (e.g. "The colours of Kathakali..."); on desktop the
  can covers the middle of "A TASTE OF KERALA IN EVERY SIP."; the product dialog's "330 ML OF TROPICAL POSSIBILITY" is
  crossed by a frond.
- The chapter indicator is one step ahead while "01 / STRAIGHT FROM NATURE" shows.
- Phone: the hero paragraph is printed over the fronds and partly under the chapter indicator; in chapter 04 the can covers
  "Original Kerala Coconut Water" and its details; the product dialog's "Discover the next flavour" button is cut off.
- The logo intro (about 5 s) plays on every load, and the 3D scene and can pictures only start after it.
- The page still carries <meta name="codex-preview" content="development">; the README is the starter template's text.
No console errors, broken images, placeholder text or horizontal overflow.

---

## Gireesh — a designer's working desk (personal UI/UX portfolio): repo https://github.com/gireeshkumarreddy/greenportfolio
- Placeholder email: "Let’s talk ✳" and the email link use hello@gireesh.design - replace it with your real address before
  sharing the site (it is in none of our media).
- The README calls the case studies and the about texts illustrative portfolio copy; the Daylight mock-up greets "Alex".
  Some of that copy is in our media. The hero says "INDEPENDENT DESIGNER / BASED IN FRANCE · OPEN TO THE WORLD"
  (gallery-01, which is also the Work card and scene still, plus phone gallery-09, the film and our alt texts). The about
  note says "I'm a UI/UX designer based in France, with roots in India" (gallery-04). The FORME / SONAR case studies are
  in gallery-02, 06, 07 and 08. Confirm these are true of you, or update the desk site and re-capture
  (LAUNCH-CHECKLIST 3e).
- Desktop hero: the crumpled paper ball covers the end of "Just like all good thin…".
- Desktop process scene: the scissors sit on each sheet's "0X / 03" counter, the pencil's eraser on the "Sketch" chip,
  and on sheet 03 the pencil tip covers the start of the checklist; sheet 01 sweeps across the heading as it enters.
- Phone: the pink folder hides the "W" of "WELCOME…", the floating "Motion on" button covers content in several places,
  the handbag runs through the FORME wordmark, the "Made with intent" sticker overlaps the Daylight card, the glasses
  cover the contact card's "06".
- The about marquee runs short on wide screens (at 1440 px its right end is empty about half the time; at 2560 px always) -
  repeat the phrase set 3-4 times.
- FORME case study: the #F0E7CF swatch is almost the colour of its card.
- Fonts: the URW font licence (AGPL with a font exception for PostScript/PDF) - confirm it covers web use.
No console errors, broken images, placeholder text or horizontal overflow.

---

## GIREESH — Artist · Creative · Storyteller (cinematic portfolio): repo https://github.com/gireeshkumarreddy/cinematic-portofilo
- Third-party logos: the Scene 02 film shows tool logos (Figma, Adobe apps, Notion, Claude, ChatGPT, Midjourney, Framer,
  Spline, Webflow) - kept out of our portfolio. The footer's second photo shows a Ferrari badge (not in our media).
- All 15 links (logo, nav, mobile menu, footer Contact / Instagram / Behance / LinkedIn) point to "#".
- The header can't be clicked or tapped: the page content layer lies over it, so the phone menu only opens by keyboard.
- Mobile menu: the close icon shows one diagonal bar across a straight one instead of an X.
- The walking figure's cut-out leaves white blotches around the shoes, and from about 6.8 s into the walk loop white debris
  around the head and shins; the closing shot's wordmark is smudged above the head.
- "Projects" scene: the "01" counter reads "01 1", a black box sits behind "Real Projects Real Stories", and the "Sound &
  Second Motion" card shows garbled lettering; on phones the room's baked-in cards show through as grey halos.
- Phone time machine: the years are clipped at the edge ("021"), the clock hand crosses the title, two captions overlap.
- Desktop time machine: the figure's head covers the end of the 2023 card's lines.
- Soft images on retina screens (264 px year-card photos); the Scene 02 film's corner labels are cut off at 16:10.
- Development helpers (window.__shot / __tune) and the source and reference files would be downloadable if the repo root is
  deployed as is; the README still says "Two scenes so far".
- Please confirm the portraits on the "Play Create Repeat" and "Timeless Experiences" screens are not real private people.
No console errors, failed requests, broken images or horizontal overflow.

---
