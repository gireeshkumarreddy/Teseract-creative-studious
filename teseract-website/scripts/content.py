"""All website copy, transcribed from the TESSERACT Website Content Master Document.

Brand mentions use {brand}; build.py formats them with site.config.json's "brand".
Nothing here is invented: where the document has placeholders (case-study narratives) the site renders no
fabricated content. The one exception is STORIES['testimonials']: SAMPLE reviews the owner asked for (14 Oct) to
preview the Client Stories section, each flagged 'sample': True until it is replaced with real client feedback.
WHO['founder'] and WHO['why'] are the owner's founder content (15 Oct, _ref/specs/founder-content.md).
"""

NAV = [
    ('home', 'Home', ''),
    ('who-we-are', 'Who We Are', 'who-we-are'),
    ('what-we-create', 'What We Create', 'what-we-create'),
    ('our-approach', 'Our Approach', 'our-approach'),
    ('work', 'The Work', 'work'),
    ('client-stories', 'Client Stories', 'client-stories'),
    ('contact', 'Contact', 'contact'),
]
PRIMARY_CTA = 'Start a Project'

# ---------------------------------------------------------------- 01 HOME
HOME = {
    'hero': {
        'label': 'Hero',
        # Keyword line inside the H1 (SEO), approved by the client on 13 Oct; built from the document's service names.
        'kicker': 'Website design & development studio',
        'title': "We don't build ordinary websites.",
        'lead': 'We create interactive, thoughtful and tailor-made digital experiences for businesses that want to be different.',
        'body': 'From the first idea to the final interaction, we design and build your digital presence around your business, your audience and your vision.',
        'ctas': ['Start a Project', 'Explore Our Work'],
    },
    'idea': {
        'label': 'The Idea',
        'title': ['Your business is unique.', 'Your website should be too.'],
        'lines': ["You don’t need another template.", "You don’t need a website that looks like everyone else’s.", 'You need something that feels like you.', "That’s what we build."],
        'body': 'We combine strategy, design, technology, interaction and storytelling to create websites and digital experiences made specifically for your brand.',
        'disciplines': ['Strategy and design', 'UX design', 'UI design', 'Technology and storytelling'],
    },
    'believe': {
        'label': 'What We Believe',
        'title': 'Simple for people. Powerful for business.',
        'body': [
            'A website should not make people think too hard. It should be easy to understand, easy to explore and easy to remember.',
            'Behind every beautiful experience, there should be a clear purpose.',
            'We make complex things feel simple.',
        ],
    },
    'numbers': {
        'label': 'Our Numbers',
        # Reach updated by the client on 13 Oct (document said 400K+): 2 million.
        'items': [('20K+', 'Community'), ('2M+', 'Reach'), ('Millions', 'Views Generated'), ('Global', 'Clients & Projects')],
        'body': 'What started with an idea has grown into a community, a portfolio and a growing network of people who believe that digital experiences can be better.',
    },
    'agency': {
        'label': 'A Different Kind of Agency',
        'title': "We don't want to look like every other agency.",
        'kicker': "Because we're not trying to be one.",
        'body': "We work closely with our clients, understand what they're trying to achieve and build around that.",
        'nots': ['No unnecessary layers.', 'No confusing language.', 'No copy-paste solutions.'],
        'closing': 'Just good thinking, good design and technology that serves a purpose.',
    },
    'final_cta': {
        'label': 'Final CTA',
        'title': 'Have an idea?',
        'lines': ["You don't need a perfect brief.", "You don't need to know exactly what you need."],
        'lines2': ['Just bring us the idea.', "We'll figure out the rest together."],
        'cta': 'Start a Project',
    },
}

# ---------------------------------------------------------------- 02 WHO WE ARE
WHO = {
    'hero': {
        'title': "We're a small team with big ideas.",
        'body': [
            '{brand} is a digital creative studio focused on design, technology and experiences.',
            'We work with businesses, founders and teams that want to build something different.',
            'Our work sits somewhere between strategy, design, technology and creativity.',
        ],
    },
    'founder': {
        'label': 'The person behind {brand}',
        'name': 'Gireesh',   # owner, 15 Oct: "name should be only Gireesh" (never the full name on the site)
        'roles': ['Founder', 'Product Designer', 'Business & Technology'],
        'journey': ['From aviation to business.', 'From business to technology.', 'From technology to product design.'],
        'quote': "Great design doesn't just look different. It makes people experience something differently.",
        'body': [
            'With nearly five years of professional experience across aviation, business, technology and digital innovation, Gireesh brings together a multidisciplinary perspective shaped by different industries and disciplines.',
            'His journey began in aviation, followed by a transition into business and strategy, before moving into technology and ultimately product design. Today, he focuses on Product Design, UI/UX and interactive digital experiences, combining business thinking with design to turn complex ideas into products that are clear, intuitive and purposeful.',
            'Over the years, Gireesh has worked across diverse digital projects, exploring the relationship between people, business and technology. His work has also extended into innovation challenges and hackathons, including a first-place hackathon achievement.',
        ],
    },
    'why': {
        'label': 'Why {brand} exists',
        'title': 'The idea behind {brand} came from a simple observation: businesses with great ideas were often represented by digital experiences that felt exactly the same.',
        'replaced': ['Templates replaced thinking.', 'Trends replaced identity.', 'Complexity replaced clarity.'],
        'body': 'Gireesh wanted to build something different. {brand} was created to bring together strategy, design and technology to create digital experiences that are not only visually distinctive, but also meaningful, intuitive and built around the people using them.',
        'quote': 'Technology creates possibilities. Design gives those possibilities meaning.',
        'closing': 'For Gireesh, the goal is simple: build products people understand, create experiences people remember, and help businesses move beyond ordinary.',
    },
    'philosophy': {
        'label': 'Our Philosophy',
        'title': 'Understand first. Design second. Build better.',
        'body': "We don't jump straight into design.",
        'steps': ['First, we understand the business.', 'Then we understand the people.', 'Then we find the right idea.', 'Then we build it.'],
    },
    'think': {
        'label': 'How We Think',
        'items': [
            ('People first.', 'Technology changes. Trends change. Design styles change. But people remain people.',
             "We create experiences that are easy to understand, enjoyable to use and meaningful to the people they're built for."),
            ('Details matter.', 'A button. A transition. A headline. A colour. A loading screen.',
             'Small details can change how something feels. We care about those details.'),
            ("Different doesn't mean complicated.", 'We love creative ideas. But creativity should never get in the way of clarity.',
             "If someone can't understand what you're offering, the design isn't doing its job."),
        ],
    },
    'promise': {
        'label': 'Our Promise',
        'title': 'We will never build something just because everyone else is doing it.',
        'lines': ["We'll question the obvious.", "We'll explore different directions.", "And we'll always ask:"],
        'question': 'Is this right for the brand?',
    },
}

# ---------------------------------------------------------------- 03 WHAT WE CREATE
CREATE = {
    'hero': {
        'title': 'Digital experiences built around your business.',
        'body': ["We don't believe in fixed packages.", 'Every business has different goals, audiences and challenges.', 'So we build what makes sense for you.'],
    },
    'services': [
        {'n': '01', 'name': 'Website Design', 'title': 'Make a great first impression.',
         'body': 'We design websites that look beautiful, feel intuitive and communicate your business clearly.',
         'tags': ['UX Strategy', 'User Journeys', 'Wireframes', 'UI Design', 'Responsive Design', 'Prototyping', 'Design Systems', 'Interaction Design']},
        {'n': '02', 'name': 'Website Development', 'title': 'From design to reality.',
         'body': 'We turn the design into a real, responsive and functional website.',
         'tags': ['Business Websites', 'Corporate Websites', 'Landing Pages', 'CMS Websites', 'Interactive Websites', 'Web Applications']},
        {'n': '03', 'name': 'E-commerce', 'title': 'Make buying feel simple.',
         'body': 'From discovering a product to completing a purchase, we design every step of the experience.',
         'tags': ['Product Pages', 'Shopping Experiences', 'Cart & Checkout', 'Payment Integration', 'Order Management', 'CMS', 'Mobile Experiences']},
        {'n': '04', 'name': 'Interactive & 3D', 'title': "Don't just show people. Let them experience it.",
         'body': 'We create digital experiences using motion, interaction and 3D.',
         'tags': ['Scroll animations', 'Interactive storytelling', 'Product interactions', 'Micro-interactions', 'Cinematic experiences', '3D environments'],
         'note': 'Every interaction has a purpose.'},
        {'n': '05', 'name': 'Brand & Digital Identity', 'title': 'Your brand should feel consistent everywhere.',
         'body': '',
         'tags': ['Typography', 'Colour Systems', 'Visual Direction', 'Digital Identity', 'Design Systems', 'Brand Guidelines']},
        {'n': '06', 'name': 'Product & SaaS', 'title': 'Digital products people actually want to use.',
         'body': '',
         'tags': ['Dashboards', 'SaaS Platforms', 'Web Applications', 'Mobile Interfaces', 'User Flows', 'Prototypes', 'Design Systems']},
        {'n': '07', 'name': 'AI & Automation', 'title': 'Make your business work smarter.',
         'body': '',
         'tags': ['AI Experiences', 'Workflow Automation', 'AI Interfaces', 'Internal Tools', 'Intelligent Dashboards', 'API Integrations']},
        {'n': '08', 'name': 'Digital Strategy', 'title': 'Before we build, we think.',
         'body': '',
         'tags': ['Digital Positioning', 'Website Strategy', 'User Research', 'Competitor Analysis', 'Content Structure', 'Conversion Strategy']},
    ],
    'cta': {
        'label': 'Service CTA',
        'title': 'Not sure what you need?',
        'lines': ["That's completely fine.", "Tell us what you're trying to achieve.", "We'll help you figure out what needs to be built."],
        'cta': "Let's Talk",
    },
}

# ---------------------------------------------------------------- 04 OUR APPROACH
APPROACH = {
    'hero': {
        'title': 'How an idea becomes an experience.',
        'body': ["Great work doesn't happen in one step.", 'We take the time to understand, explore, design, build and refine.'],
    },
    'steps': [
        {'n': '01', 'name': 'Understand', 'sub': 'First, we listen.',
         'body': 'Before we design anything, we learn about your business.',
         'list': ['Your goals.', 'Your audience.', 'Your competitors.', 'Your challenges.', 'Your vision.'],
         'result': "A clear understanding of what we're building and why."},
        {'n': '02', 'name': 'Define', 'sub': 'Then, we find the direction.',
         'body': "We turn everything we've learned into a clear plan.",
         'list_intro': 'We define:',
         'list': ['The structure', 'The user journey', 'The content', 'The functionality', 'The visual direction'],
         'result': 'A clear project blueprint.'},
        {'n': '03', 'name': 'Explore', 'sub': 'Now we start thinking differently.',
         'body': 'We explore ideas, layouts, references and visual directions.',
         'ask': ['This is where we ask:', 'What could this become?', 'Not:', 'What template should we use?']},
        {'n': '04', 'name': 'Design', 'sub': 'The idea starts to take shape.',
         'list': ['Typography.', 'Colours.', 'Layouts.', 'Components.', 'Images.', 'Interactions.'],
         'body': 'Everything starts coming together.'},
        {'n': '05', 'name': 'Refine', 'sub': 'Details make the difference.',
         'body': 'We review every important detail.',
         'list': ['Spacing.', 'Responsiveness.', 'Interactions.', 'Hierarchy.', 'Readability.', 'Motion.'],
         'closing': 'We refine until everything feels right.'},
        {'n': '06', 'name': 'Build', 'sub': 'Design meets technology.',
         'body': 'Once the direction is approved, we bring the experience to life.',
         'closing': 'We develop the website, integrate the required functionality and make it responsive across devices.'},
        {'n': '07', 'name': 'Test', 'sub': 'Before people use it, we test it.',
         'list': ['Desktop.', 'Tablet.', 'Mobile.', 'Navigation.', 'Forms.', 'Animations.', 'Performance.', 'Content.', 'Functionality.']},
        {'n': '08', 'name': 'Launch', 'sub': 'Ready for the world.',
         'body': 'Once everything is tested and approved, we launch.',
         'closing': 'Your idea becomes a real digital experience.'},
        {'n': '09', 'name': 'Evolve', 'sub': 'Launch is not the end.',
         'body': 'Businesses change. Your website should be able to change with them.',
         'closing': 'We can continue supporting, improving and evolving your digital experience as your business grows.'},
    ],
}

# ---------------------------------------------------------------- 05 THE WORK
WORK = {
    'hero': {
        'title': ["We could tell you we're different.", "But we'd rather show you."],
        'body': "Explore a selection of work we've created for businesses, brands and digital products.",
    },
    'intro': {
        'title': 'Every project starts with a different challenge.',
        'lines': ['Some need a complete digital transformation.', 'Some need a better way to sell.', 'Some need to explain something complicated.', 'Some simply need to be seen differently.'],
        'closing': 'There is no single formula.',
    },
    'case_structure': [
        ('The Challenge', 'What needed to change?'),
        ('The Idea', 'What direction did we take?'),
        ('The Experience', 'What did we design and build?'),
        ('The Details', 'What made the project different?'),
        ('The Result', 'What changed after launch?'),
    ],
    'card_cta': 'View Case Study',
    'cta': {'title': 'Have something in mind?', 'body': 'Your project could be next.', 'cta': 'Start a Project'},
}

# ---------------------------------------------------------------- 06 CLIENT STORIES
STORIES = {
    'hero': {
        'title': ['We can talk about our work.', 'But our clients can tell the story better.'],
        'body': 'We believe the best measure of our work is what our clients think after working with us.',
    },
    # Client reviews section (pages/stories.py): one card of the "Client Deck" per CLIENT project in portfolio.json,
    # in this order. Each entry:
    #   project  the client project's slug - company name, industry, label pill, glow colour ("spill"), project still
    #            and the "View project" link all come from portfolio.json / the media manifest (never a concept project)
    #   rating   out of 5, one decimal (shown as the number plus five stars with a partial fill)
    #   quote    the client's words (typographic apostrophes are applied when rendered); a sample names Gireesh, and
    #            check.py warns above 320 characters (the longest quote sets the deck's height)
    #   sample   True = a SAMPLE review written by the studio, not real client feedback
    #   name / role  optional: only with that person's written consent (attribution is company + industry otherwise)
    # !! SAMPLE TESTIMONIALS (owner request, 14 Oct): the six entries below are placeholders written by the studio
    # !! to preview the section (ratings mixed 4.7 / 4.8 / 4.9 / 5.0 as the owner asked). Replace each quote and
    # !! rating with the client's real feedback, with their written consent, and drop 'sample' before launch:
    # !! scripts/check.py fails while a sample remains and site.config.json is indexable or has a site_url.
    'testimonials': [
        {'project': 'aivinci', 'rating': 5.0, 'sample': True,
         'quote': "We make films, so we're fussy about pace and atmosphere. Gireesh understood that straight away and "
                  "gave us a site that feels cinematic, from the dark services intro to the AI video showcase. He took "
                  "every round of feedback seriously."},
        {'project': 'geetha-jewellers', 'rating': 4.9, 'sample': True,
         'quote': "A jewellery shop is built on trust and warmth, and our website feels the same. The glass domes and "
                  "that marble-and-gold showroom look stunning, even on a phone. Gireesh explained every step "
                  "patiently and kept our store details and savings schemes easy to find."},
        {'project': 'derlin-haus', 'rating': 4.8, 'sample': True,
         'quote': "Menswear online can look very samey, so we asked Gireesh for a shop with an editorial feel. The "
                  "zipper hero, the shirt carousel and the calm product pages carry that mood, and the bag, sizes and "
                  "coupons simply work. Honest advice throughout."},
        {'project': 'aeroskys', 'rating': 4.7, 'sample': True,
         'quote': "Simple to say, hard to build: flights, hotels, holiday packages, buses and offers, all in one place. "
                  "Gireesh turned that into a clear search and a step-by-step booking flow, and always answered our "
                  "questions quickly."},
        {'project': 'siaara', 'rating': 5.0, 'sample': True,
         'quote': "Every saree we sell is handcrafted, and the site honours that. Browsing by weave or by colour comes "
                  "naturally, the Telugu option feels like home, and the silk intro is pure joy. Gireesh was lovely to "
                  "work with, start to finish."},
        {'project': 'hidden-stories', 'rating': 4.8, 'sample': True,
         'quote': "The brief was to let guests feel Hyderabad before they choose a home. The home-tour film, the Pearl "
                  "City chapter and the little Hyderabadi phrases set that mood beautifully, while booking stays clear. "
                  "Gireesh listened closely and never rushed us."},
    ],
    # Head of the client reviews section (pill + H2 + tag); sample_tag is shown only while a sample entry remains.
    # No sub line: the deck explains itself (peeks, arrows / dots, "Drag" cursor, first-view nudge). An optional
    # 'body' would render as the sub again.
    'reviews': {'label': 'Client Reviews', 'title': "In our clients' words.", 'sample_tag': 'Sample reviews'},
    'experience': {
        'label': 'Client Experience',
        'title': 'Good work starts with good collaboration.',
        'body': "We don't disappear after sending a proposal.",
        'lines': ['We communicate.', 'We share progress.', 'We ask questions.', 'We listen to feedback.', 'And we build together.'],
        'closing': ["Because the best results happen when the client isn't just watching the process.", "They're part of it."],
    },
    'review_cta': {'title': 'Worked with us?', 'body': "We'd love to hear what you thought.", 'cta': 'Leave a Review'},
}

# ---------------------------------------------------------------- 07 CONTACT
CONTACT = {
    'hero': {
        'title': "Let's build something worth remembering.",
        'lines': ['Have an idea?', 'A new business?', 'A website that needs a complete rethink?', "A digital product you've been thinking about?"],
        'closing': "Let's talk.",
    },
    'form': {
        'fields': [
            ('name', 'Your Name', 'text', True),
            ('email', 'Email Address', 'email', True),
            ('company', 'Company / Brand', 'text', False),
            ('build', 'What are you looking to build?', 'select', False),
            ('help', 'What do you need help with?', 'chips', False),
            ('budget', 'Estimated Budget', 'select', False),
            ('idea', 'Tell us a little about your idea', 'textarea', True),
        ],
        'cta': 'Start the conversation',
    },
    'before': {
        'label': 'Before You Send',
        'title': "Don't have everything figured out?",
        'body': "That's okay.",
        'lines': ["You don't need a perfect brief.", "You don't need technical knowledge.", "You don't even need to know exactly what you want yet."],
        'closing': ['Tell us what you have in mind.', "We'll take it from there."],
    },
}

# ---------------------------------------------------------------- FOOTER
FOOTER = {
    'line': 'Digital experiences, built around you.',
    'services': ['Web Design', 'Development', 'E-commerce', 'Interactive', 'Branding', 'Product', 'AI'],
    'socials': ['Instagram', 'LinkedIn', 'GitHub', 'Email'],
    # owner's SEO request (18 Oct; for the owner's review): the full name, as in the logo's own lockup, so every page
    # names 'TESERACT Creative Studios' once (the content document reads '© [YEAR] TESSERACT.')
    'copyright': '© {year} {brand} Creative Studios. All rights reserved.',
    'motto': 'BUILT DIFFERENT. BUILT FOR YOU.',
}

# ---------------------------------------------------------------- BRAND
BRAND = {
    'tagline': 'Build beyond the ordinary.',
    'meaning': 'Tesseract is a geometric concept associated with a fourth dimension. For the agency, the name represents thinking beyond the obvious, exploring new dimensions of digital experiences, and building work that goes beyond ordinary websites.',
    'personality': ['Minimal', 'Intelligent', 'Precise', 'Experimental', 'Premium', 'Digital', 'Human'],
    'idea': "We don't simply make websites look different. We think differently about how a digital experience can work, feel and communicate.",
}

# Where the studio works (owner's answer, 18 Oct: remote, India-wide - no city, no address) with the WHO hero's
# 'businesses, founders and teams': the FAQ answer below and the llms.txt key facts (seo.llms_txt).
WHERE_WE_WORK = 'Remotely, with businesses, founders and teams across India and worldwide.'

# ---------------------------------------------------------------- FAQ (reference layout)
# Every answer is assembled from sentences in the content document; no new claims. Five entries were added for the
# owner's SEO request (18 Oct; for the owner's review, built only from existing copy + his answer on where the studio
# works): what the studio does (WHO hero line 1 + HOME hero lead), where it works, e-commerce (CREATE E-commerce body +
# tags), SaaS and landing pages (CREATE Product & SaaS tags + the 'Landing Pages' tag) and what the name means
# (BRAND['meaning'] verbatim). home_faq.py renders them, seo.py makes them the FAQPage JSON-LD and llms.txt FAQ.
FAQ = [
    ('What does {brand} Creative Studios do?',
     '{brand} is a digital creative studio focused on design, technology and experiences. We create interactive, '
     'thoughtful and tailor-made digital experiences for businesses that want to be different.'),
    ('Where do you work?', WHERE_WE_WORK),
    ('Do I need a perfect brief before we talk?',
     "No. You don't need a perfect brief. You don't need technical knowledge. You don't even need to know exactly what you want yet. Tell us what you have in mind — we'll take it from there."),
    ('Do you offer fixed packages?',
     "We don't believe in fixed packages. Every business has different goals, audiences and challenges, so we build what makes sense for you."),
    ('What can you build for us?',
     'Website design, website development, e-commerce, interactive & 3D experiences, brand & digital identity, product & SaaS, AI & automation and digital strategy.'),
    ('Do you build e-commerce websites?',
     'Yes. From discovering a product to completing a purchase, we design every step of the experience: product pages, '
     'shopping experiences, cart & checkout, payment integration and order management.'),
    ('Do you design SaaS products and landing pages?',
     'Yes. We design dashboards, SaaS platforms, web applications, user flows and prototypes, and we build landing pages.'),
    ('Will my website look like a template?',
     "No. You don't need another template. Every project starts from zero, built around your business, your audience and your vision."),
    ('How does a project work?',
     'Understand, define, explore, design, refine, build, test, launch and evolve. We take the time to understand, explore, design, build and refine.'),
    ('What happens after launch?',
     'Launch is not the end. Businesses change, and your website should be able to change with them. We can continue supporting, improving and evolving your digital experience as your business grows.'),
    ('How involved will we be?',
     "We communicate, share progress, ask questions, listen to feedback and build together — because the best results happen when the client isn't just watching the process. They're part of it."),
    ('What does the name {brand} mean?', BRAND['meaning']),
]

# ---------------------------------------------------------------- CHAT ("Ask {brand}", owner request 21 Oct)
# Every visible line of the site chat (scripts/chat_kb.py, src/chat/*, src/js/40-chat.js). Its answers come from the
# copy above (FAQ, CREATE, APPROACH, WHO...): this dict holds only the chat's own scaffolding around them, the price
# wording and the visitor's answer chips. Prices are never written here: {W} / {E} are the two starting prices from
# site.config.json "chat.pricing" in the visitor's currency ({W_inr} / {E_inr} in rupees). Digits appear only in
# 'choices' (the visitor's answers) and placeholders; no '!', no emoji, no hype (check.py). 'owner_review' True =
# the owner has not approved this copy yet: a check.py warning now, an error in a launch build (LAUNCH-CHECKLIST 'Chat').
CHAT = {
    'owner_review': True,
    'name': 'Ask {brand}',
    'launcher_label': 'Ask {brand}, opens the chat',
    'launcher_label_resume': 'Ask {brand}, continue the chat',
    'launcher_nojs': 'Contact {brand}',
    'pill': 'Ask {brand}',
    'pill_resume': 'Continue the chat',
    'title': '{brand}',
    'status': 'Studio assistant · answers from this website',
    'placeholder': 'Ask about prices, our work, the process...',
    'input_label': 'Your message',
    'send': 'Send',
    'close': 'Close the chat',
    'restart': 'Start over',
    'restart_ask': 'Start over? This clears the chat and your brief.',
    'privacy_line': 'Your chat stays in this browser tab. Nothing is sent unless you send it.',
    'from': 'From: {page}',
    'kb_fail': "I can't load my notes right now. You can reach Gireesh at {email} or through the contact form.",
    'you': 'You',
    'options': 'Options:',
    'more_below': 'More below',   # (25 Oct) a long answer shows from its start; this cue scrolls on to the rest
    'brief_title': 'Your brief',
    'change': 'change',
    'copy': 'Copy',
    'copied': 'Copied.',
    'new_tab': '(opens in a new tab)',
    # greeting bubble, by page (not on contact, 404, privacy or terms)
    'hello': {
        'home': 'Planning a website? I can tell you what it starts from and how we work.',
        'stories': 'Planning a website? I can tell you what it starts from and how we work.',
        'create': 'Not sure which service you need? I can help you work it out.',
        'approach': 'Questions about how a project runs? Ask me.',
        'who': 'Want to know about Gireesh or how we work? Ask me.',
        'work': 'Like what you see? Ask me about any project, or what a site like it starts from.',
        'project': 'Like {project}? I can tell you what a site like it starts from.',
    },
    'hello_chips': ['What does a website cost?', 'Ask a question'],
    'hello_dismiss': 'Dismiss',
    # the living launcher (owner, 21 Oct 23:20): short lines it says now and then while it wanders (same pages as the
    # greeting; 20-30 s apart, at most four a page, until the chat is opened or a bubble dismissed), in this order
    'say': ["Hi, I'm the {brand} assistant. Ask me anything about the studio.",
            'Planning a website? Ask me about prices.',
            'Curious what we build? Ask me.',
            'Selling online? Ask me about online stores.',
            'Want to know how a project runs? Ask me.',
            'I answer from this website. Anything else goes to Gireesh.'],
    'ask_label': 'Ask',   # under the mark when the visitor's device asks for reduced motion (the launcher stays still)
    # first open
    'welcome': ["Hi. I'm the {brand} assistant, and I answer from what's on this website.",
                "For anything I can't answer, I'll put you in touch with Gireesh, the person behind {brand}. What can I help you with?"],
    'welcome_project': "You're looking at {project}: {industry}, {label_phrase}.",
    'welcome_self': "You're looking at {project}, one of his personal projects.",
    'label_phrase': {'client': 'a client project', 'concept': 'a concept project',
                     'interactive': 'an interactive concept', 'personal': 'a personal project'},
    'welcome_contact': 'Your brief is in the form below. Add your name and email, then press Start the conversation.',
    # chips the assistant offers (actions); the visitor's answers with digits live in 'choices'
    'chips': {
        'prices': 'Prices', 'create': 'What we create', 'process': 'Our process', 'work': 'See our work',
        'founder': 'Who is Gireesh?', 'book': 'Book a call', 'like': 'A site like this', 'ask_gireesh': 'Ask Gireesh',
        'something_else': 'Something else', 'that_helps': 'That helps', 'pass': 'Pass it to Gireesh',
        'show_email': 'Show me the email', 'keep': 'Keep chatting', 'back_start': 'Back to start', 'show_cur': 'Prices in {cur_name}',
        'back_brief': 'Back to my brief', 'send_brief': 'Send my brief', 'ask_else': 'Ask something else',
        'quote': 'Get a quote', 'other_prices': 'Other prices', 'more_work': 'More work',
        'see_project': 'See {project}', 'cost_site': 'What does a website cost?', 'cost_store': 'What does a store cost?',
        'story': 'Read his story', 'why': 'Why {brand} exists', 'talk': 'Talk to Gireesh',
        'involved': 'How involved will we be?', 'after_launch': 'What happens after launch?',
        'how_long': 'How long does it take?', 'see_create': 'See it on What We Create',
        'change_cur': 'Change currency', 'open_form': 'Open the form with my brief', 'open_form_short': 'Open the form',
        'copy_brief': 'Copy my brief', 'email_instead': 'Email it instead', 'pick_time': 'Pick a time',
        'by_form': 'Send it by form instead', 'done': 'Done', 'stories_link': 'Client Stories', 'view': 'View project',
    },
    # the visitor's answers (chips), per step
    'choices': {
        'type': ['A website', 'A landing page', 'An online store', 'A product or app', 'Not sure yet'],
        'pages': ['One page', '2 to 5', '6 to 10', 'More than 10', 'Not sure'],
        'needs': ['Motion and interactions', '3D', 'A CMS to edit it yourself', 'Forms or booking', 'Other integrations',
                  'Help with content and copy', 'None of these'],
        'time': ['Within a month', '1 to 3 months', '3 to 6 months', 'Flexible'],
        'budget': ['Not sure yet', "Let's discuss", 'Skip'],
        'region': ['India', 'UK', 'Europe', 'US', 'UAE', 'Canada', 'Australia', 'Singapore', 'Somewhere else'],
        'products': ['Under 20', '20 to 100', '100 to 500', 'More than 500', 'Not sure'],
        'categories': ['1 to 3', '4 to 10', 'More than 10', 'Not sure'],
        'store': ['Online payments', 'Shipping and delivery', 'Coupons and offers', 'Sizes or variants', 'Order management',
                  'Editing products yourself', 'Not sure yet'],
        'service': ['Product & SaaS', 'AI & Automation', 'Interactive & 3D', 'Brand & Digital Identity', 'Digital Strategy'],
        'filters': ['Client work', 'Online stores', 'SaaS concepts', 'Concepts', 'Everything'],
        'restart': ['Start over', 'Keep chatting'],
        'dollars': ['US$', 'CA$', 'A$', 'S$'],
    },
    # PRICING (src/chat/20-flow.js): it depends on scope first, then 'start(s) from', then a call or a brief
    'p0': ['Good question to ask early.', 'So the final price depends on the scope, mainly:'],
    'factors_web': ['How many pages you need', 'Features and interactions, like motion or 3D', 'Content and copy',
                    'How detailed the design is', 'Integrations, like a CMS, forms or payments'],
    'p0_ask': 'What are you planning?',
    'price_label_w': 'Websites start from',
    'price_label_e': 'E-commerce websites start from',
    'about': 'about',
    'price_sub_inr': 'The final price depends on your scope.',
    'price_sub_cur': 'Converted from {X_inr} at an approximate rate ({rates_month}). The final price depends on your scope.',
    'price_sub_unknown': "I couldn't tell your region from this device, so this is in rupees, with US dollars alongside.",
    'cur_note': "I've shown {cur_name} based on this device's region settings. You can change it any time.",
    'cur_note_near': "I've shown euros, the closest currency I can show for your region. You can change it any time.",
    'w_after': "That's a starting point, not a quote. A few quick questions, so Gireesh can tell you where yours would land.",
    'q_pages': 'Roughly how many pages?',
    'q_needs': 'Anything special it needs? Choose any, then Done.',
    'q_time': 'And when would you like it live?',
    'q_budget': 'Do you have a budget in mind? It helps Gireesh suggest the right scope. Type an amount, or choose one of these.',
    'q_region': "Where are you based? I'll show prices in your currency.",
    'e_intro': 'Online stores take more to design and build, because every step has to work.',
    'included_label': 'Our e-commerce service includes',
    'included_work': 'E-commerce in our work:',
    'e_after': 'Where it lands depends on the number of products and categories, payments and checkout, shipping, and the features you need.',
    'q_products': 'How many products will you start with?',
    'q_categories': 'And roughly how many categories?',
    'q_store': 'What should the store handle? Choose any, then Done.',
    's_intro': ("We also design products and SaaS, AI and automation, interactive and 3D experiences, brand identity and "
                "digital strategy. These are priced on scope alone, so there isn't a starting price I can honestly give you."),
    'q_service': 'Which is closest?',
    'service_includes': 'It can include',
    's_close': 'Gireesh can scope it with you and send a quote.',
    'n_scale': 'For a sense of scale, websites start from {W} and online stores from {E}. The final price always depends on the scope.',
    'q_idea': 'In a sentence or two, what would you like it to do?',
    'echo': 'Got it: {parts}.',
    'budget_low': ("Thanks for being upfront. {Xs} start from {X}, so that's below where we usually begin. Gireesh can tell "
                   "you honestly what's possible, so it's still worth a conversation."),
    'budget_low_w': 'Websites',
    'budget_low_e': 'Online stores',
    'budget_ok': "Thanks, that's a good starting point for a conversation. The exact quote depends on the scope.",
    'budget_s': "Thanks, I'll add that to your brief.",
    'summary': "Thanks. Here's your brief so far:",
    'next_step': 'The best next step is a short call, or send us this brief and Gireesh will come back to you with a quote.',
    'brief_rows': {'type': 'Looking for', 'service': 'Service', 'pages': 'Pages', 'products': 'Products',
                   'categories': 'Categories', 'needs': 'Needs', 'timeline': 'Timeline', 'budget': 'Budget',
                   'cur': 'Prices shown in', 'similar': 'Similar to', 'idea': 'Your idea', 'questions': 'Your questions'},
    'type_names': {'W': 'A website', 'L': 'A landing page', 'E': 'An online store', 'S': 'A product or app', 'N': 'Not sure yet'},
    'strip_names': {'W': 'Website', 'L': 'Landing page', 'E': 'Online store', 'S': 'Product or app', 'N': 'Not sure yet'},
    'echo_words': {'pages': 'pages', 'products': 'products', 'categories': 'categories', 'about': 'about',
                   'live': 'live', 'budget': 'budget'},
    # a portfolio project's price: never a figure for the project itself
    'pp_client': ("I can't share what a client paid, and every project is priced on its own scope. {project} ({industry}) "
                  "is a client project, so a site like it would start from {X}, depending on {factors}."),
    'pp_factors_w': 'pages, features and content',
    'pp_factors_e': 'products, categories, checkout and features',
    'pp_concept': "{project} is one of our concept projects, so there's no client price behind it. A site like it would start from {W}, or {E} if it needs to sell online.",
    'pp_concept_e': "{project} is one of our concept projects, so there's no client price behind it. A store like it would start from {E}.",
    'pp_personal': "{project} is one of Gireesh's personal projects, so there's no client price behind it. A site like it would start from {W}.",
    'pp_personal_self': "{project} is one of his personal projects, so there's no client price behind it. A site like it would start from {W}.",
    'pp_saas': ("{project} is a concept project. Product & SaaS work is priced on scope, so there's no starting price I can "
                "give you for the product. A marketing website like it starts from {W}."),
    # other price-adjacent replies
    'included_in_start': "The starting price isn't a fixed package. What's included is shaped around your project, and your quote will set out what it covers.",
    'discount': ("Prices follow the scope, so the best way to fit a budget is to shape the scope around it. Add your budget "
                 "to your brief, and Gireesh will tell you what's possible."),
    'free': 'Every project is priced on its scope. Websites start from {W} and online stores from {E}.',
    'timeline': ("It depends on the scope, so I'd rather not guess. Every project goes through the same nine steps, from "
                 "Understand to Evolve, and Gireesh will give you a timeline with your quote."),
    'maintenance': "What that costs isn't listed on this website, so Gireesh can tell you directly.",
    'cur_switched': 'Done. Prices now show in {cur_name}.',
    'cur_country': 'Showing prices in {cur_name} for {country}.',
    # a place named in a message is only offered (owner, 24 Oct: the device's region decides the currency)
    'cur_offer': "Prices follow this device's region settings, so they're still in {cur_now}. You can see them in {cur_name} instead.",
    'cur_unsupported': ("I can show prices in rupees, euros, pounds, US dollars, UAE dirhams, and Canadian, Australian and "
                        "Singapore dollars. I've kept {cur_name}."),
    'cur_which': 'Which dollars?',
    # other answers (scaffolding around the site's own text)
    'work_count': 'There are {n_client} client projects and {n_other} concept and personal projects on this website.',
    'no_industry': "There isn't a {word} project on this site yet.",
    'no_industry_any': "There isn't a project like that on this site yet.",
    'contact': 'The quickest way to reach Gireesh is the contact form, or email {email}.',
    'phone': "There's no phone number on this website. The quickest way to reach Gireesh is the contact form or email.",
    'seo': ("SEO isn't listed as a separate service on this website. Digital Strategy covers Website Strategy, Content "
            "Structure and Conversion Strategy. For SEO itself, Gireesh can tell you more."),
    'logo': ("Logo design isn't listed on its own. Brand & Digital Identity covers Typography, Colour Systems, Visual "
             "Direction, Digital Identity, Design Systems and Brand Guidelines."),
    'bot': "I'm an automated assistant that answers from this website. I'm not Gireesh, but anything I can't answer can go to him.",
    'chat_privacy': 'Nothing you type here leaves this browser tab unless you send the contact form.',
    'personal': "No need to share contact details here. You'll add them on the contact form when you're ready.",
    'hi': 'Hello. What can I help you with?',
    'thanks': "You're welcome. Anything else?",
    'bye': 'Thanks for stopping by. Your chat stays in this tab if you come back.',
    'off_topic': "I'm here for questions about the studio and its work. What can I help you with?",
    'else': 'Of course. What would you like to know?',
    'clients_count': 'The Work page shows {n_client} client projects, from {first} to {another}.',
    # fallback
    'maybe': 'Did you mean one of these?',
    'search': 'This is the closest I found on the site:',
    'miss1': ("I'm not sure I've understood, and I only answer from what's on this website, so I'd rather not guess. "
              "Could you put it another way, or pick one of these?"),
    'miss2': ("This one is best answered by Gireesh himself. I can add your question to the contact form, and you send "
              "it when you're ready."),
    'nodata': "That isn't covered on this website, so I don't want to guess. Gireesh can answer it directly.",
    # hand-off
    'book': ("Happy to set that up. Send your brief through the contact form and say when suits you for a call. Gireesh "
             "will come back to you to arrange it."),
    'book_url': "Here's where you can pick a time with Gireesh. I've put your brief together, so you can paste it into the booking notes.",
    'send_lead': "Here's what I'll put in the form:",   # (was a second 'send' key, which renamed the composer's Send button)
    'send_after': 'Add your name and email on the next page, check everything, and press Start the conversation. Nothing is sent until you do.',
    'or_write': 'Or write to {email}',
    'email_subject': 'Project brief from the website chat',
    'prefill_note': 'Filled in from your chat. Add your name and email, check the details, and send.',
    'prefill_clear': 'Clear',
    'idea_template': {
        'head': "Hi Gireesh, here's my brief from the chat on your website.",
        'type': 'Looking for: {v}', 'service': 'Service: {v}', 'pages': 'Pages: {v}', 'products': 'Products: {v}',
        'categories': 'Categories: {v}', 'needs': 'Needs: {v}', 'timeline': 'Timeline: {v}', 'budget': 'Budget: {v}',
        'cur': 'Prices seen in: {v}', 'similar': 'Similar to: {v}', 'questions': 'My questions: {v}', 'idea': 'My idea: {v}',
    },
    # matching data (scripts/chat_kb.py folds these into the knowledge base; never shown as such)
    'faq_aliases': {
        0: ['what do you do', 'what is teseract', 'what kind of studio are you', 'tell me about the studio', 'what does your company do'],
        1: ['where are you based', 'where are you located', 'do you work outside india', 'do you work remotely',
            'can you work with clients abroad', 'which country are you in', 'do you work internationally',
            'do you work with international clients'],
        2: ['do i need a brief', 'i do not know what i need', 'do i need a plan before', 'i only have an idea',
            'do i need technical knowledge'],
        3: ['fixed price', 'packages', 'price list', 'do you have plans', 'standard package', 'pricing plans'],
        4: ['what services do you offer', 'what can you build', 'what do you make', 'your services', 'what do you design'],
        5: ['do you build online stores', 'can you make an online shop', 'do you do ecommerce', 'shopping website',
            'can you build a store'],
        6: ['do you design saas', 'can you design a dashboard', 'do you build landing pages', 'saas product design', 'web app design'],
        7: ['template', 'theme', 'wix', 'will it look generic', 'do you use templates', 'is it a custom design'],
        8: ['what is your process', 'how do you work', 'project steps', 'what are the stages', 'how does it work'],
        9: ['after launch', 'do you offer support', 'can you update it later', 'ongoing support', 'will you maintain it'],
        10: ['how involved', 'will you update me', 'communication', 'will i see progress', 'can i give feedback'],
        11: ['what does the name mean', 'why the name teseract', 'what is a tesseract', 'meaning of the name', 'why tesseract'],
    },
    'project_aliases': {
        'darlin house': 'derlin-haus', 'derlin': 'derlin-haus', 'derlin house': 'derlin-haus', 'darlin': 'derlin-haus',
        'siara': 'siaara', 'siaara': 'siaara', 'siyara': 'siaara',
        'aerosky': 'aeroskys', 'aero skys': 'aeroskys', 'aero sky': 'aeroskys', 'aeroskies': 'aeroskys',
        'geeta': 'geetha-jewellers', 'geetha': 'geetha-jewellers',
        'one piece': 'one-piece', 'luffy': 'one-piece',
        'careers aeroskys': 'aeroskys-careers', 'aeroskys careers': 'aeroskys-careers', 'careers portal': 'aeroskys-careers',
        'gireesh portfolio': 'gireesh-portfolio', 'designer portfolio': 'gireesh-portfolio',
        'desk': 'gireesh-desk', 'working desk': 'gireesh-desk', 'green portfolio': 'gireesh-desk',
        'cinematic portfolio': 'gireesh-cinematic', 'gireesh cinematic': 'gireesh-cinematic', 'storyteller': 'gireesh-cinematic',
        'cinematic': 'gireesh-cinematic',
        'live cv': 'livecv', 'vink': 'vynk', 'san media': 'san-media', 'hidden stories': 'hidden-stories',
        'mahira': 'mahira-select', 'ai vinci': 'aivinci', 'ines': 'ines-morrow', 'maren': 'maren-holt',
    },
    'industry_lexicon': ['jewellery', 'travel', 'saree', 'fashion', 'menswear', 'womenswear', 'fragrance', 'beverage',
                         'furniture', 'chair', 'lighting', 'homes', 'stay', 'marketing agency', 'esim', 'resume', 'careers',
                         'email', 'editor', 'film', 'portfolio', 'restaurant', 'hotel', 'school', 'clinic', 'gym', 'salon',
                         'real estate'],
}
