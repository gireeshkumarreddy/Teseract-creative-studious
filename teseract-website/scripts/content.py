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
    'copyright': '© {year} {brand}. All rights reserved.',
    'motto': 'BUILT DIFFERENT. BUILT FOR YOU.',
}

# ---------------------------------------------------------------- BRAND
BRAND = {
    'tagline': 'Build beyond the ordinary.',
    'meaning': 'Tesseract is a geometric concept associated with a fourth dimension. For the agency, the name represents thinking beyond the obvious, exploring new dimensions of digital experiences, and building work that goes beyond ordinary websites.',
    'personality': ['Minimal', 'Intelligent', 'Precise', 'Experimental', 'Premium', 'Digital', 'Human'],
    'idea': "We don't simply make websites look different. We think differently about how a digital experience can work, feel and communicate.",
}

# ---------------------------------------------------------------- FAQ (reference layout)
# Every answer is assembled from sentences in the content document; no new claims.
FAQ = [
    ('Do I need a perfect brief before we talk?',
     "No. You don't need a perfect brief. You don't need technical knowledge. You don't even need to know exactly what you want yet. Tell us what you have in mind — we'll take it from there."),
    ('Do you offer fixed packages?',
     "We don't believe in fixed packages. Every business has different goals, audiences and challenges, so we build what makes sense for you."),
    ('What can you build for us?',
     'Website design, website development, e-commerce, interactive & 3D experiences, brand & digital identity, product & SaaS, AI & automation and digital strategy.'),
    ('Will my website look like a template?',
     "No. You don't need another template. Every project starts from zero, built around your business, your audience and your vision."),
    ('How does a project work?',
     'Understand, define, explore, design, refine, build, test, launch and evolve. We take the time to understand, explore, design, build and refine.'),
    ('What happens after launch?',
     'Launch is not the end. Businesses change, and your website should be able to change with them. We can continue supporting, improving and evolving your digital experience as your business grows.'),
    ('How involved will we be?',
     "We communicate, share progress, ask questions, listen to feedback and build together — because the best results happen when the client isn't just watching the process. They're part of it."),
]
