# SEO, AEO and GEO: what was done, and what comes next

For Gireesh · night of 18 to 19 Oct 2026

---

## 1. In short

While you slept, the site got the full SEO, AEO and GEO pass you asked for. Every page now has its own clear title and description. The home page answers the questions people and AI tools ask about the studio. The site also describes TESERACT Creative Studios the same way everywhere. Everything for launch is ready and tested. When you have your domain, one setting switches it all on. Until then the site stays hidden from Google and Bing, as you chose. The look, motion and phone layout are unchanged. The only new text people can see is 5 FAQ answers, 29 one-line project summaries and the footer line. They are all waiting for your OK (section 4). The site's own checker passes with 0 errors. One thing still blocks launch, on purpose: the 6 sample testimonials.

---

## 2. What was done

**SEO** means being found in Google and Bing results. **AEO** means answer engines: Google's answer boxes, "People also ask" and voice assistants, which pick short, direct answers. **GEO** means AI engines like ChatGPT, Perplexity, Gemini and Copilot, which write answers from what they read on websites.

### SEO: being found on Google and Bing

- **Titles.** Every page has its own title, the blue link text in Google. None is longer than 60 characters, so none gets cut off. *Where: the SEO file (`scripts/seo.py`).*
- **Descriptions.** Every page has its own short description, the grey text under the link. Each is 109–155 characters and no two are the same. *Where: the same file.*
- **Keywords.** Each search phrase belongs to one page only, so your pages never compete with each other. The full list is in section 3. *Where: `docs/SEO.md`.*
- **Home page.** The title is "TESERACT Creative Studios | Website Design & Development". The new description names the studio, tailor-made websites and "across India and worldwide".
- **Project summaries.** One plain sentence now sits under each of the 29 project titles, so every project page says what the site is. Before, these pages had very little text. *Where: the portfolio file (`scripts/portfolio.json`).*
- **Project titles.** Client pages now read like "Derlin Haus — Menswear e-commerce website | TESERACT". Every project description also names TESERACT, so no page looks like the client's own site.
- **Concepts stay concepts.** Every concept, demo and fan project still says so in its title, summary and data.
- **Internal links.** The service words in the footer and the "What we created" chips on project pages now link to the matching service on What We Create. They look exactly the same as before.
- **Full name in the footer.** "TESERACT Creative Studios" now appears on every page.
- **Who We Are heading.** Google now reads "Who we are." once. Before, it read it twice. It looks the same.

### AEO: answer engines

- **5 new FAQ entries** on the home page, making 12 in total. They cover what the studio does, where it works, e-commerce, SaaS and landing pages, and what the name means. *Where: the content file (`scripts/content.py`), shown in the home FAQ.*
- **One clear definition, used everywhere:** "TESERACT Creative Studios is a digital creative studio focused on design, technology and experiences." It appears in the home description, Who We Are, the FAQ, the structured data and llms.txt.
- **Structured answers.** The 12 FAQ answers are also written in the format search engines read (FAQ structured data), word for word as on the page. Your 8 services and 9 process steps are written the same way.

### GEO: AI engines

- **llms.txt.** This is a plain-text fact sheet about the studio, made for AI tools. At launch it will sit at your-domain/llms.txt. It gives the name and its one-S spelling, what the name means and "not affiliated with other companies or software named Tesseract". It also has the tagline, founder, where you work, contact, services, process, the FAQ and all 29 projects with their summaries. It never includes the sample reviews or the "Our Numbers" figures. *Where: built automatically by `scripts/seo.py`.*
- **Consistent entity data.** An "entity" is how machines recognise you as one specific business. The name, one-line definition, founder, area (India and worldwide) and email are now the same on every page, in the structured data and in llms.txt.
- **Nothing invented.** There is no address, city, phone, price, rating or client count anywhere, so AI tools cannot repeat anything false about you.

### Technical SEO

- **Structured data.** These are labels inside the page code, hidden from visitors, that tell search engines facts in their own language. Every page now carries:
  - the studio: name, other name "TESERACT", logo, founder, India and worldwide, email
  - the website and the page
  - services and projects, where they appear
  - at launch, breadcrumbs (the "Home › The Work › Derlin Haus" path)

  *Where: `scripts/seo.py`.*
- **A larger logo for Google.** A new 512 px logo is ready for Google's business panel. *Where: `public/assets/brand/logo-512.png`.*
- **Launch switch, one setting.** Set your domain and "indexable" in the settings file (`site.config.json`). Everything below then turns on by itself.
- **Sitemap.** This is a list of all your pages for search engines. It is made automatically at launch, with 37 pages plus project images.
- **robots.txt.** This is the "may I come in?" file for search robots. Today it says "keep out". At launch it says "welcome, here is the sitemap".
- **Canonical.** This tag tells Google each page's one official address. It is added to every page at launch.
- **No duplicate addresses.** At launch, links switch from ".../work/index.html" to the clean ".../work/", so each page has only one address.
- **Hidden pages stay hidden.** The 404 page and the "Coming soon" Terms page are kept out of Google at launch.
- **Big image previews.** At launch, Google Images and Discover may show your work large.
- **Share previews.** When someone shares a project link (WhatsApp, X, Slack…), the preview shows a still of that project. Main pages show the logo card.
- **Faster project pages.** The first big image on each project page starts loading earlier.
- **Guards in check.py.** check.py is the site's automatic checker that runs after every build. It now refuses:
  - a launch without a proper https domain
  - a launch while sample reviews remain
  - any review stars
  - any address or phone number in the data
  - duplicate titles and broken links
  - a concept described as client work
  - a project description without "TESERACT"
- **Launch tested safely.** A full launch build was made on a copy with a pretend domain (www.example-domain.com). Only one thing stopped it: the sample testimonials. Your real settings were not touched.

**How it was checked.**
- check.py: 0 errors, plus 1 reminder about the sample testimonials.
- Every page was tested on desktop, tablet and phone, with reduced motion and with JavaScript off: 0 problems.
- Before and after were compared page by page. Only the text listed in section 4 changed.
- Page speed is the same as before.
- The founder section and the typeface file were not touched.

---

## 3. Keywords by page

**Primary** = what the page's title, description and data aim at. **Secondary** = supported by the page's text. Each primary phrase belongs to one page only.

### Home (/)
- **Primary:**
  - TESERACT Creative Studios
  - TESERACT
  - brand variants: TESERACT studio, Teseract studios, Teseract creative
  - Tesseract Creative Studios, the double-S spelling (covered by the name FAQ, and by the alternate name if you approve it)
  - website design and development studio
  - web design studio India / website design agency India
  - website development company India
  - remote web design studio (India and worldwide)
  - custom / tailor-made website design
  - what does TESERACT Creative Studios do
  - what does the name TESERACT mean
- **Secondary:**
  - creative web design agency
  - bespoke website design
  - do I need a brief to hire a web designer
  - custom website vs template
  - website fixed packages / website cost (no prices are given)
  - how involved is the client in a website project

### Who We Are (/who-we-are/)
- **Primary:** about TESERACT Creative Studios · TESERACT founder / who founded TESERACT · Gireesh product designer / Gireesh UI/UX designer · digital creative studio
- **Secondary:** product design and UI/UX studio · TESERACT team · why TESERACT exists

### What We Create (/what-we-create/)
Each primary phrase points to its own service section on the page.
- **Primary:**
  - website design services
  - UI/UX design services
  - website development services
  - landing page design and development
  - e-commerce website design and development
  - interactive & 3D website design
  - brand & digital identity design
  - SaaS product design / dashboard UI design
  - AI & automation: AI interfaces, workflow automation, internal tools
  - digital strategy / website strategy
- **Secondary:**
  - responsive website design
  - design systems
  - wireframes and prototyping
  - business / corporate / CMS websites
  - web application development
  - cart & checkout / payment integration / order management
  - scroll animation / cinematic websites
  - brand guidelines / colour systems
  - conversion strategy / competitor analysis / user research
  - SaaS landing page design

### Our Approach (/our-approach/)
- **Primary:** website design process · web design process steps · how a website project works
- **Secondary:** what happens after a website launch · website support and evolution · how TESERACT works

### The Work (/work/)
- **Primary:** TESERACT portfolio / TESERACT work · website design portfolio · website case studies
- **Secondary:** client website examples · e-commerce website examples · SaaS landing page examples · concept websites

### Client Stories (/client-stories/)
- **Primary:** TESERACT client stories / client experience
- **Secondary:** "TESERACT reviews / testimonials", but only after real reviews (with consent) replace the samples

### Contact (/contact/)
- **Primary:** contact TESERACT Creative Studios · start a website project · hire a website design studio
- **Secondary:** TESERACT email · website project enquiry · website budget estimate

### Privacy and Terms
- No targets. Terms stays hidden from Google while it is a "Coming soon" placeholder.

### Project pages (primary · secondary)

**Client projects**
- **Aivinci Creative Studio:** AI creative studio website · creative technology studio website design
- **Geetha Jewellers:** jewellery website design · gold and diamond jewellery shop website
- **AeroSkys:** travel booking website design · flight and hotel booking website
- **Derlin Haus:** menswear e-commerce website · online menswear store design
- **Mahira Select:** Indian ethnic womenswear online store · ethnic wear e-commerce website
- **SAN Media Solution:** digital marketing agency website design · marketing agency website
- **SIAARA By S&A:** handcrafted saree e-commerce website · saree boutique website
- **Vynk Network:** travel eSIM website · eSIM store website design
- **LiveCV:** resume builder website · career platform website design
- **Hidden Stories:** short-stay homes website Hyderabad · homestay / villa stay website
- **Careers at Aeroskys:** careers portal website design · careers site design

**Concepts and fan projects**
- **Sagewell:** AI SaaS landing page concept · AI reasoning model landing page
- **Vantline:** decision-intelligence SaaS landing page · AI copilot landing page concept
- **Tidings:** chat-commerce landing page concept · messaging commerce SaaS landing page (keeps "not affiliated with WhatsApp or Meta" and never targets that trademark)
- **Emberpost:** email app landing page concept · email product landing page
- **Ines Morrow:** film editor portfolio website concept · video editor portfolio website
- **Maren Holt:** book editor newsletter website concept · editor newsletter landing page
- **ONE PIECE | Luffy:** cinematic fan tribute website (unofficial) · never targets the One Piece trademark
- **TĀVRA:** sportswear e-commerce concept · Indian textile craft sportswear website
- **VELORA:** fragrance website design concept · perfume brand website concept
- **AARADHYA:** saree editorial website concept · fashion editorial website
- **SAANJH:** Indian-flavoured drinks brand website concept · beverage brand website concept
- **THENGA:** coconut water brand website concept · 3D scroll product website
- **VYRN:** editorial fashion e-commerce concept · fashion storefront website concept
- **Vesper:** architectural lighting website concept · lighting brand online store concept
- **Sedile:** 3D product showroom website concept · 3D chair finder website

**Personal projects**
- **Gireesh:** one-page designer portfolio website
- **Gireesh — a designer's working desk:** UI/UX portfolio website · multi-page designer portfolio website
- **GIREESH — Artist · Creative · Storyteller:** cinematic WebGL portfolio website

Close neighbours are kept apart on purpose:
- SIAARA, AARADHYA and Mahira Select (sarees and ethnic wear)
- THENGA and SAANJH (drinks)
- Derlin Haus and VYRN (fashion)
- your three personal sites and Who We Are (you, as founder, belong on Who We Are)

---

## 4. New visible text: please review

All of these are **drafts for you to approve or edit**. The FAQ answers are built from your content document's own sentences and your 18 Oct answers. The project summaries were drafted from the capture reports, the notes made when each site was recorded. Any wording can change. Just tell us what you'd like.

### The 5 new FAQ entries (home page, FAQ section)

1. Shown first:
   **What does TESERACT Creative Studios do?**
   > TESERACT is a digital creative studio focused on design, technology and experiences. We create interactive, thoughtful and tailor-made digital experiences for businesses that want to be different.

2. Shown second:
   **Where do you work?**
   > Remotely, with businesses, founders and teams across India and worldwide.

3. Shown after "What can you build for us?":
   **Do you build e-commerce websites?**
   > Yes. From discovering a product to completing a purchase, we design every step of the experience: product pages, shopping experiences, cart & checkout, payment integration and order management.

4. Shown next:
   **Do you design SaaS products and landing pages?**
   > Yes. We design dashboards, SaaS platforms, web applications, user flows and prototypes, and we build landing pages.

5. Shown last:
   **What does the name TESERACT mean?**
   > Tesseract is a geometric concept associated with a fourth dimension. For the agency, the name represents thinking beyond the obvious, exploring new dimensions of digital experiences, and building work that goes beyond ordinary websites.

The other 7 FAQ entries are unchanged.

### The footer line (bottom of every page)

- Before: "© 2026 TESERACT. All rights reserved."
- **Now: "© 2026 TESERACT Creative Studios. All rights reserved."**

Your content document has "© [YEAR] TESSERACT." The full name matches the logo lockup.

### The 29 project summaries (one sentence under each project's title line)

**Client projects**
- **Aivinci Creative Studio:** A single-page website for Aivinci Creative Studio, an AI creative and technology studio, showing its AI films, creative technology and digital products.
- **Geetha Jewellers:** A one-page website for Geetha Jewellers, a gold and diamond jewellery shop: scroll-animated collections, a store-visit section and gold savings schemes.
- **AeroSkys:** A travel booking website for AeroSkys to search and book flights, hotels, holiday packages and buses; a working prototype in which bookings are simulated.
- **Derlin Haus:** An online menswear shop for Derlin Haus: shirts, T-shirts and trousers, with category pages, search and filters, size selection and a bag with coupons.
- **Mahira Select:** An online store for Mahira Select's Indian ethnic womenswear, from sarees and kurta sets to lehengas, with a cinematic home page, a cart and checkout.
- **SAN Media Solution:** A website for SAN Media Solution, a digital marketing agency: its services, marketing packages and team, and a work page of reels, films and posters.
- **SIAARA By S&A:** An online saree boutique for SIAARA By S&A: handcrafted sarees by weave and colour, product pages, a wishlist, a bag and an English and Telugu switch.
- **Vynk Network:** A travel eSIM store for Vynk Network: compare plans by destination and get a QR-code eSIM; in this preview build, accounts, codes and payments are simulated.
- **LiveCV:** A resume-builder website for LiveCV that turns a resume into one permanent live link, shown with example profiles the site labels illustrative. *(see section 5)*
- **Hidden Stories:** A website for Hidden Stories, eight short-stay homes in Hyderabad: a scroll-driven story around a home-tour film, then search and booking in demo mode.
- **Careers at Aeroskys:** A careers site for Aeroskys, a travel booking company: open roles in three groups, each with its own page, career ladder, hiring process and application.

**Concepts and fan projects**
- **Sagewell:** A concept landing page for Sagewell, an invented AI reasoning model for developers and teams, with a prompt composer and a reasoning-trace demo.
- **Vantline:** A concept landing page for Vantline, an invented decision-intelligence copilot that explains what changed in your numbers, shown with sample data.
- **Tidings:** A concept landing page for Tidings, an invented chat-commerce platform for small shops and restaurants, with clickable phone chats and a campaign builder.
- **Emberpost:** A concept landing page for Emberpost, an invented people-first email app that files every email under its sender, with a clickable sample inbox.
- **Ines Morrow:** A portfolio concept for Ines Morrow, a fictional film and commercial editor, with a scrubbable reel timeline and a before-and-after colour-grade slider.
- **Maren Holt:** A concept landing page for Maren Holt, a fictional developmental editor with a weekly newsletter: a keycap headline, sample essays, a reader and search.
- **ONE PIECE | Luffy:** An unofficial fan tribute to Monkey D. Luffy, told in cinematic, scroll-driven chapters: a fan experiment made for fun and never sold.
- **TĀVRA:** A concept store for TĀVRA, a women's sportswear concept built on Indian textile crafts such as bandhani, ikat and ajrakh; checkout and payment are off.
- **VELORA:** A concept website for VELORA, a fragrance-house concept built around its signature eau de parfum, with an interactive bottle and notes; ordering is not open.
- **AARADHYA:** An editorial concept website for AARADHYA, a saree-house concept themed around Maa Durga: a love letter to the saree, to heritage and to the feminine spirit.
- **SAANJH:** A concept website for SAANJH, a drinks-brand concept of bottled Indian-flavoured blends in three flavours: Kesar Cloud, Elaichi Silk and Gulab Velvet.
- **THENGA:** A one-page brand-concept website for THENGA, a coconut-water concept: a scroll-driven 3D coconut cracks open to reveal the can, then five flavours.
- **VYRN:** A fashion storefront concept for VYRN, a concept label of modern essentials, with animated editorial sections, a collection and product pages; payments are off.
- **Vesper:** A concept storefront for Vesper, an architectural-lighting brand concept: a shop, four collections and a day/night mode; no real orders are processed.
- **Sedile:** A concept 3D showroom and demo store for office chairs under the invented brand Sedile, with a Chair Finder, real-time 3D views and a demo checkout.

**Personal projects**
- **Gireesh:** A one-page personal site for Gireesh: a portrait hero, an about statement, the kinds of digital work he offers to build and a meeting request.
- **Gireesh — a designer's working desk:** A six-page personal UI/UX portfolio for Gireesh, styled as a designer's desk, with a work board, a process scene and illustrative case studies.
- **GIREESH — Artist · Creative · Storyteller:** A single-page cinematic personal portfolio for Gireesh, built from WebGL and video scenes: a walk-out opening, a creative universe, a journey through time.

Google shows a slightly shorter version of each sentence under the project's link, naming TESERACT (for example "by TESERACT"). If you change a summary, that line is updated to match.

---

## 5. Please confirm

1. **LiveCV's wording.** On 14 Oct you decided LiveCV is a client project. It is labelled "Client Project" everywhere, and "concept" appears nowhere on its page. Its example profiles are made up, and the LiveCV site says so itself. So, to stay honest, its summary ends: *"shown with example profiles the site labels illustrative."* Please confirm this wording.
   - Note: the LiveCV site's own footer still reads "Design concept · Illustrative profiles". Since it is client work, you may want to remove "Design concept" from that footer, so the two sites agree.

2. **The six concept brands: are the names invented?** These are VELORA, AARADHYA, SAANJH, VYRN, Vesper and TĀVRA. Their summaries call each one "a … concept" either way. If any name belongs to a real company, a "not affiliated" line will be added, as on Tidings. Note: VELORA's site says "VELORA Paris", and VYRN's logo shows "®", which is only for registered trademarks (checklist item 3d).

3. **"Tesseract" with two S as an alternate name.** The logo and site spell it TESERACT. Your content document spells it TESSERACT. Should "TESSERACT Creative Studios" be added as an alternate name in the data? That helps Google link people who type the double-S spelling to you. It is one line in the settings file (`alternate_names`), and it is never shown as visible text. Yes or no?

4. **Your personal profiles, used for the studio for now.** Your Instagram (itsgireesh.uiux), personal LinkedIn and GitHub are currently listed in the data as the studio's profiles too. The footer icons say "TESERACT on Instagram" and so on. llms.txt says they are the founder's own, used until the studio has company pages. Is that fine as a stop-gap? Once the company profiles exist (section 7), send the links and they replace yours.

**Also before launch** (already in `LAUNCH-CHECKLIST.md`):
- the image-rights items 3b, 3d, 3e and 3f
- optional: one sentence each for the services Brand & Digital Identity, Product & SaaS, AI & Automation and Digital Strategy
- when you have real terms, the Terms page can come out of hiding

---

## 6. Launch day, step by step

**1. Buy the domain.** For example `your-domain.com`. You'll use `www.your-domain.com` as the main address.

**2. Point it at GitHub Pages.** DNS is the internet's address book, set at the company where you buy the domain. Add these records there:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | gireeshkumarreddy.github.io |

Then, on GitHub:
- Open the repo, then **Settings › Pages › Custom domain**. Enter `www.your-domain.com` and save.
- Wait for the DNS check and the certificate, then tick **Enforce HTTPS**. HTTPS is the padlock, a secure connection.
- Open `https://www.your-domain.com/` and check that the site loads.
- Don't add a CNAME file. It isn't needed, and the checker blocks it.

**3. Flip the switch: one change in `site.config.json`.** Set both values together:
```json
"site_url": "https://www.your-domain.com",
"indexable": true
```
`site_url` must be exactly the address GitHub serves: https, your domain, nothing after it.

**4. Replace the 6 sample testimonials. This is required.** The checker refuses the launch while any sample remains. Send the real words of your clients, with their written OK, and they replace the samples. You can do this step any time before launch day.

**5. Build, check, push.**
- Run `python scripts/build.py --clean`.
- Then run `python scripts/check.py`. It must end with **0 errors**.
- Push to `main`. GitHub publishes the site automatically.
- Quick check: `https://www.your-domain.com/robots.txt` should say `Allow: /` plus a Sitemap line, and `/sitemap.xml` should list 37 pages.

**6. Google Search Console.** This is Google's free dashboard for your site in search.
- Add a **Domain** property.
- Verify it with the **DNS TXT record** Google gives you. Nothing is added to the site, so your privacy page stays true.
- Submit `sitemap.xml`.
- Use **URL Inspection** to request indexing of the home page, Who We Are, What We Create and The Work.

**7. Bing Webmaster Tools.**
- Sign in and choose **import from Google Search Console**, then submit the sitemap.
- Bing also feeds Copilot, DuckDuckGo and much of ChatGPT's web search, so this step matters.

---

## 7. "Our company name first in Google, and in the suggestions"

### Already done on the site

- The full name "TESERACT Creative Studios" is in:
  - the home page title and description
  - the Who We Are title
  - the FAQ
  - the footer of every page
- The structured data tells Google the name and the short name "TESERACT". It also gives a one-S note, the logo, the founder, India and worldwide, and the email. It is the same on every page.
- Google uses the website's name in the data to show your site name in results.
- The name-meaning FAQ and llms.txt explain the spelling. llms.txt also says you are not linked to other things called Tesseract.
- Nothing is hidden or stuffed, so nothing can get the site penalised.

### What only you can do (most impact first)

None of this works before launch on your own domain. The current github.io address can't carry a brand.

1. **Company profiles named exactly "TESERACT Creative Studios".** Make a LinkedIn company page, a studio Instagram and Behance (Dribbble is optional). Give each the same logo, the tagline "Build beyond the ordinary.", the one-line description and a link to the site. Send the links and they go into the site's data as "this is also us" links. Also set your personal LinkedIn headline to "Founder, TESERACT Creative Studios" and link it to the company page.
2. **Use the same name everywhere.** Use exactly "TESERACT Creative Studios" in your email signature, proposals, invoices, business cards, bios and posts. Not "Teseract Studio", not "Tesseract".
3. **Credit links from your own sites.** Add "Designed & built by TESERACT Creative Studios" with a link to your domain. Put it on your concept and personal sites: the six landing concepts, Sedile, ONE PIECE, VELORA, Vesper and your three personal sites. Add it to client sites only with the client's OK.
4. **Google Business Profile** (your listing on Google Maps), only if you really meet clients in person somewhere. In that case, set it up as a "service-area business" with your address hidden. A studio that only works remotely is not eligible. Never use a virtual-office address. If this isn't you, skip it, and skip Bing Places too.
5. **Directory listings**, once you have real reviews. Use Clutch, GoodFirms, DesignRush and Sortlist, with true facts only. Ask happy clients for LinkedIn recommendations too.
6. **People searching the full name.** The more real people type "TESERACT Creative Studios", the stronger the signal. They do it because they saw the name on a card, a proposal or a post. Real people only: never buy clicks or use search bots. Google spots it, and it can hurt you.

### An honest note

- **Search suggestions come from real search volume.** Google suggests a name once enough different people type it over time. Nobody can force it or buy it.
- **"TESERACT" on its own competes with "Tesseract".** That is a well-known text-reading (OCR) software and Marvel's cosmic cube. For a while Google may even ask "Did you mean tesseract?".
- **So the realistic first target is "TESERACT Creative Studios".** With the steps above, you can expect to be first for the full name **a few weeks after launch**. "TESERACT" alone, and the suggestions, come later, as more people come to know the name.

---

## 8. What to measure after launch

**Impressions** = how many times your site appeared in results. **Clicks** = how many times people clicked it. **Core Web Vitals** = Google's speed and smoothness scores, measured from real visitors.

| What to look at | Where | When |
|---|---|---|
| Sitemap read, no errors | Search Console › Sitemaps | 2–3 days after launch |
| Pages indexed (in Google): expect most of the 37 | Search Console › Pages | weeks 1 and 2, then monthly |
| Brand searches: impressions, clicks and average position for queries containing "teseract" | Search Console › Performance (filter: Query contains "teseract") | weekly in the first month, then monthly |
| Your spot for "TESERACT Creative Studios" | Google, in a private window | weekly in the first month |
| Core Web Vitals | Search Console › Core Web Vitals | after about a month. "Not enough data" is normal at first. |
| The same numbers for Bing | Bing Webmaster Tools | monthly |
| Share preview on LinkedIn | LinkedIn Post Inspector | once, at launch. If a project link shows no picture, JPEG copies can be added. |

**Good signs:** first place for the full name within a few weeks, and brand impressions growing month after month.

---

*More detail: the developer notes are in `docs/SEO.md`, and the launch steps are in `LAUNCH-CHECKLIST.md` under "Launch steps".*
