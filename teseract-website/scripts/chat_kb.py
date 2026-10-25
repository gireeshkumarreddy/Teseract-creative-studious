"""Knowledge base of the 'Ask {brand}' site chat (owner request, 21 Oct): dist/assets/chat-kb.json.

Built from the website's own copy and nothing else: content.py (FAQ, CREATE, APPROACH, WHO, HOME hero lead, WORK, STORIES
experience, CONTACT, BRAND, WHERE_WE_WORK, NAV), projects.PROJECTS (the Work page's shown list) and site.config.json
(brand, email, socials, chat.booking_url, chat.pricing). The browser fetches it only when the chat opens; matching runs
in the visitor's browser (src/chat/10-engine.js), so nothing is sent anywhere.

Rules (check.py re-checks them on the build):
  - every text block carries src (a content path such as 'FAQ.3.1' / 'CREATE.services.2.tags', 'portfolio:<slug>.<field>',
    'config:<key>' or 'chat:<key>') and its text is fmt(source), one sentence of it or one of its list items;
  - prices: exactly the two starting prices of chat.pricing, plus their conversions with the config's static rates
    (round_half_up, precomputed here so the browser does no price arithmetic);
  - never: the sample testimonials, HOME 'Our Numbers', the founder's full name, an EXCLUDED project, a placeholder
    email, any *_note field.
The chat's own scaffolding (welcome, price wording, chips) is content.CHAT, embedded in chat.js by build.py.
"""
import datetime, json, math, re

import lib
import content
import projects
from lib import fmt, CONFIG

KB_FILE = 'assets/chat-kb.json'
MEDIA = 'assets/media/'
AVATARS = ('assets/brand/logo-mark-3d-96.webp', 'assets/brand/logo-mark-3d-192.webp')

# Display table of the currencies the chat can show (not owner-editable: the rates live in site.config.json).
CURRENCIES = {
    'INR': {'sym': '₹', 'name': 'rupees', 'long': 'Indian rupees', 'grp': 'in'},
    'EUR': {'sym': '€', 'name': 'euros', 'long': 'euros'},
    'GBP': {'sym': '£', 'name': 'pounds', 'long': 'British pounds'},
    'USD': {'sym': 'US$', 'name': 'US dollars', 'long': 'US dollars'},
    'AED': {'sym': 'AED ', 'name': 'UAE dirhams', 'long': 'UAE dirhams'},
    'CAD': {'sym': 'CA$', 'name': 'Canadian dollars', 'long': 'Canadian dollars'},
    'AUD': {'sym': 'A$', 'name': 'Australian dollars', 'long': 'Australian dollars'},
    'SGD': {'sym': 'S$', 'name': 'Singapore dollars', 'long': 'Singapore dollars'},
}

# The visitor's region, read on the device only (time zone first, then the language region): build spec section 5.
_US = ('New_York Detroit Kentucky/Louisville Kentucky/Monticello Indiana/Indianapolis Indiana/Vincennes Indiana/Winamac '
       'Indiana/Marengo Indiana/Petersburg Indiana/Vevay Indiana/Tell_City Indiana/Knox Chicago Menominee '
       'North_Dakota/Center North_Dakota/New_Salem North_Dakota/Beulah Denver Boise Phoenix Los_Angeles Anchorage Juneau '
       'Sitka Metlakatla Yakutat Nome Adak Puerto_Rico Fort_Wayne Indianapolis Louisville').split()
_CA = ('Toronto Montreal Nipigon Thunder_Bay Iqaluit Pangnirtung Atikokan Winnipeg Rainy_River Rankin_Inlet Resolute Regina '
       'Swift_Current Edmonton Cambridge_Bay Yellowknife Inuvik Creston Dawson_Creek Fort_Nelson Vancouver Whitehorse Dawson '
       'Halifax Glace_Bay Moncton Goose_Bay Blanc-Sablon St_Johns').split()
TZ = {'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR', 'Asia/Dubai': 'AED', 'Asia/Singapore': 'SGD', 'Singapore': 'SGD',
      'Antarctica/Macquarie': 'AUD', 'Pacific/Honolulu': 'USD', 'Pacific/Guam': 'USD', 'Pacific/Saipan': 'USD'}
TZ.update({z: 'GBP' for z in ('Europe/London', 'Europe/Belfast', 'Europe/Jersey', 'Europe/Guernsey', 'Europe/Isle_of_Man',
                              'GB', 'GB-Eire')})
TZ.update({z: 'EUR' for z in ('Atlantic/Canary', 'Atlantic/Madeira', 'Atlantic/Azores', 'Atlantic/Reykjavik', 'Atlantic/Faroe',
                              'Africa/Ceuta', 'Asia/Nicosia', 'Asia/Famagusta', 'Arctic/Longyearbyen')})
TZ.update({f'America/{z}': 'USD' for z in _US})
TZ.update({f'America/{z}': 'CAD' for z in _CA})
REGIONS = {
    'tz': {code: ' '.join(sorted(z for z, c in TZ.items() if c == code)) for code in sorted(set(TZ.values()))},
    'prefix': {'Europe/': 'EUR', 'Australia/': 'AUD', 'Canada/': 'CAD', 'US/': 'USD'},
    # Russia, Belarus, Turkey and Crimea: no currency the chat can honestly call "closest"
    'tz_unknown': ('Europe/Moscow Europe/Kaliningrad Europe/Samara Europe/Volgograd Europe/Kirov Europe/Astrakhan '
                   'Europe/Saratov Europe/Ulyanovsk Europe/Minsk Europe/Istanbul Europe/Simferopol Asia/Istanbul'),
    # Europe outside the euro: euros, with the 'closest currency' note (owner: "Europe -> euros")
    'tz_near': ('Europe/Zurich Europe/Vaduz Europe/Busingen Europe/Oslo Europe/Stockholm Europe/Copenhagen Europe/Warsaw '
                'Europe/Prague Europe/Budapest Europe/Bucharest Europe/Belgrade Europe/Sarajevo Europe/Skopje Europe/Tirane '
                'Europe/Chisinau Europe/Kyiv Europe/Kiev Europe/Uzhgorod Europe/Zaporozhye Europe/Gibraltar '
                'Atlantic/Reykjavik Atlantic/Faroe Arctic/Longyearbyen'),
    'lang': {'INR': 'IN', 'GBP': 'GB', 'USD': 'US PR', 'CAD': 'CA', 'AUD': 'AU', 'SGD': 'SG', 'AED': 'AE',
             'EUR': 'AT BE BG CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK CH LI NO SE DK IS PL CZ HU RO'},
    'lang_near': 'CH LI NO SE DK IS PL CZ HU RO',
    # typed countries and cities (the visitor says where they are): the chat only OFFERS that currency, the device
    # decides (owner, 24 Oct); and the answer to its own "Where are you based?". No demonyms and no 'us' / 'states' /
    # 'york': "a website for us", "Indian ethnic wear", "a German shepherd" are not places (review 22 Oct, TP-01)
    'places': {
        'INR|India': 'india hyderabad bangalore bengaluru mumbai delhi chennai kolkata pune',
        'GBP|the UK': 'uk united_kingdom england london britain scotland wales manchester',
        'EUR|Germany': 'germany berlin munich', 'EUR|France': 'france paris',
        'EUR|Europe': 'europe eu', 'EUR|Spain': 'spain madrid barcelona', 'EUR|Italy': 'italy milan rome',
        'EUR|the Netherlands': 'netherlands holland amsterdam', 'EUR|Ireland': 'ireland dublin',
        'EUR|Portugal': 'portugal lisbon', 'EUR|Belgium': 'belgium brussels', 'EUR|Austria': 'austria vienna',
        'USD|the US': 'usa america united_states new_york california texas',
        'AED|the UAE': 'uae dubai abu_dhabi emirates united_arab_emirates sharjah', 'CAD|Canada': 'canada toronto vancouver montreal',
        'AUD|Australia': 'australia sydney melbourne', 'SGD|Singapore': 'singapore',
    },
    # places outside the eight currencies (the reply keeps the current one: CHAT cur_unsupported)
    'other_places': 'japan china brazil mexico russia nigeria kenya pakistan bangladesh nepal saudi qatar yen yuan',
}

# Matching (src/chat/10-engine.js holds the language: stopwords, synonyms, concepts). Industry words of the Work page:
INDUSTRY_SYN = {'furniture': 'chair', 'perfume': 'fragrance'}
# lexicon words a project's industry does not name but its summary does (review 22 Oct, TP-16): AeroSkys books hotels,
# Hidden Stories are short stays
INDUSTRY_ALSO = {'hotel': ('hotel', 'stay')}
GENERIC = {'creative', 'studio', 'select', 'network', 'media', 'solution', 'stories', 'hidden', 'by', 'at', 'careers',
           'a', 'the', 'of', 's', 'and', 'gireesh', 'artist', 'storyteller', 'designer', 'working', 'desk', 'luffy'}
# keys of the FAQ intents (the words that decide them) and extra phrases of the process steps
FAQ_KEYS = {0: ['studio', 'teseract'], 1: ['where', 'based', 'outside', 'abroad', 'internationally', 'overseas', 'remotely'], 2: ['brief'], 3: ['package', 'fixed'],
            5: ['ecommerce', 'build'], 6: ['saas', 'landing'], 7: ['template', 'generic'], 9: ['after', 'launch', 'support'],
            10: ['involved', 'communication', 'feedback'], 11: ['name', 'mean']}
STEP_PH = {6: ['do you test', 'do you test the website', 'testing'], 8: ['after launch evolve', 'evolve stage']}
TH = {'answer': .55, 'maybe': .35, 'margin': .08, 'search': 2.0}


def round_half_up(x, step):
    """35,000 / 115 = 304.3 -> 300 (step 10); .5 always rounds up."""
    return int(math.floor(x / step + 0.5) * step)


def amounts(pricing):
    w, e, step = pricing['website_from'], pricing['ecommerce_from'], pricing['round_to']
    out = {pricing['base_currency']: {'w': w, 'e': e}}
    for code, rate in pricing['rates'].items():
        out[code] = {'w': round_half_up(w / rate, step), 'e': round_half_up(e / rate, step)}
    return out


def _slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def _nav():
    return {route: label for _key, label, route in content.NAV}


def _sentences(text):
    return [s for s in re.split(r'(?<=[.?])\s+', text) if s]


# ---------------------------------------------------------------- blocks (src: where the text comes from)
def P(text, src):
    return {'t': 'p', 'text': fmt(text), 'src': src}


def L(items, src):
    return {'t': 'list', 'items': [fmt(i) for i in items], 'src': src}


def C(key):
    """A line of the chat's own copy (content.CHAT[key], rendered from chat.js's embedded copy)."""
    return {'t': 'c', 'k': key}


def FROM(route, frag=''):
    return {'t': 'from', 'page': _nav()[route], 'url': {'r': route, 'f': frag}}


def _faq_blocks(i):
    return [{'t': 'faq', 'i': i}]


# ---------------------------------------------------------------- intents
def I(id, q, ph, keys=(), *, need=(), not_=(), ent=None, blocks=(), chips=(), fam=None):
    # short field names (the knowledge base is fetched on open): ph phrases, k keys, b blocks, c chips
    d = {'id': id, 'q': fmt(q), 'ph': list(ph), 'k': list(keys)}
    if fam and fam != id.split('.')[0]:
        d['fam'] = fam                                  # (else the family is the id's first part)
    if need:
        d['need'] = list(need)
    if not_:
        d['not'] = list(not_)
    if ent:
        d['ent'] = ent
    if blocks:
        d['b'] = list(blocks)
    if chips:
        d['c'] = list(chips)
    return d


def intents():
    W, A, S, B, CT = content.WHO, content.APPROACH, content.STORIES, content.BRAND, content.CONTACT
    al = content.CHAT['faq_aliases']
    faq = content.FAQ
    out = [
        # ---- prices (answers built by src/chat/20-flow.js from content.CHAT + chat.pricing)
        I('price.general', 'What does a website cost?',
          ['how much is a website', 'how much does a website cost', 'what do you charge', 'pricing', 'prices', 'rates',
           'quote please', 'how much do you charge', 'what is the cost', 'website ka price kya hai', 'kitna lagega',
           'entha', 'evlo', 'starting price', 'price range', 'what are your fees', 'how much'], ['price'], need=['PRICE']),
        I('price.website', 'What does a website start from?',
          ['cost of a 5 page website', 'business website price', 'landing page cost', 'portfolio site price',
           'how much for a website', 'website cost', 'price of a website'], ['price', 'website', 'landing'], need=['PRICE']),
        I('price.ecommerce', 'What does an online store start from?',
          ['ecommerce website price', 'online store with 200 products cost', 'shopify store price', 'dukaan website kitne ka',
           'how much for an online store', 'ecommerce cost'], ['price', 'ecommerce'], need=['PRICE']),
        I('price.product', 'What does an app or SaaS product cost?',
          ['how much for an app', 'saas dashboard cost', 'ai chatbot price', 'logo price', '3d experience cost',
           'branding cost'], ['price', 'app', 'saas', 'ai', 'logo', '3d'], need=['PRICE']),
        I('price.project', 'What did one of your projects cost?',
          ['how much did derlin haus cost', 'price of a site like siara', 'what did aivinci pay'], ['price'],
          need=['PRICE'], ent='project'),
        I('price.included', "What's included in the starting price?",
          ['what is included in 35k', 'what do i get for the starting price', 'what does the price include',
           'what is included'], ['include', 'price']),
        I('price.discount', 'Can you do it for less?',
          ['discount', 'cheaper', 'can you do it for less', 'best price', 'negotiate', 'any offers'], ['discount']),
        I('price.free', 'Is it free?', ['is it free', 'free website', 'free trial', 'do it for free'], ['free']),
        I('price.budget', 'I have a budget in mind',
          ['my budget is', 'i have a budget', 'budget is around', 'lakh budget'], ['budget']),
        I('price.currency', 'Show prices in another currency',
          ['in dollars', 'price in pounds', 'show euros', 'change currency', 'other currency', 'which currency'],
          ['currency'], ent='cur'),
        I('price.maintenance', 'What does support after launch cost?',
          ['maintenance charges', 'amc', 'support cost after launch', 'maintenance cost'], ['maintenance']),
        I('time.timeline', 'How long does a project take?',
          ['how long does it take', 'how many weeks', 'turnaround time', 'can you finish by next week', 'timeline',
           'how fast can you build', 'when will it be ready', 'delivery time'], ['time'], need=['TIME'], fam='time',
          chips=['process', 'quote']),
        # ---- services
        I('svc.overview', 'What do you create?',
          ['what services do you offer', 'what can you build', 'what do you create', 'services', 'what do you offer',
           'your services', 'what do you make'], ['service', 'offer', 'build', 'create']),
        I('svc.seo', 'Do you do SEO?', ['seo', 'search engine optimisation', 'google ranking', 'do you do seo'], ['seo'],
          blocks=[C('seo'), FROM('what-we-create', 'digital-strategy')], chips=['ask_gireesh', 'create']),
        I('svc.logo', 'Do you design logos?', ['logo design', 'can you make a logo', 'do you design logos'], ['logo'],
          blocks=[C('logo'), FROM('what-we-create', 'brand-digital-identity')], chips=['cost_site', 'ask_gireesh']),
        # ---- process
        I('process.overview', 'How does a project work?',
          ['how does a project work', 'what is your process', 'process', 'how do you work', 'project steps',
           'what are the stages', 'your approach', 'how do you start a project'], ['process', 'step', 'approach'],
          blocks=[P(A['hero']['body'][0], 'APPROACH.hero.body.0'), P(A['hero']['body'][1], 'APPROACH.hero.body.1'),
                  {'t': 'stepper'}, FROM('our-approach')], chips=['involved', 'after_launch', 'how_long']),
        # ---- work
        I('work.overview', 'Can I see your work?',
          ['show me your work', 'portfolio', 'examples', 'your projects', 'see your work', 'see your portfolio', 'previous work',
           'what have you built', 'case studies'], ['work', 'portfolio'], not_=['PRICE']),
        I('work.filter.client', 'Show me your client work', ['client work', 'client projects', 'real clients',
          'show client websites'], ['client']),
        I('work.filter.ecommerce', 'Show me your online stores', ['ecommerce projects', 'online stores you built',
          'ecommerce examples', 'stores you made'], ['ecommerce', 'work'], not_=['PRICE']),
        I('work.filter.saas', 'Show me your SaaS concepts', ['saas concepts', 'saas projects', 'saas examples',
          'dashboards you designed'], ['saas', 'work'], not_=['PRICE']),
        I('work.filter.concept', 'Show me your concept projects', ['concept projects', 'concepts', 'your concepts',
          'fan projects'], ['concept']),
        I('work.filter.personal', "Show me Gireesh's personal projects", ['personal projects', 'gireesh personal sites',
          'your own portfolio sites'], ['personal']),
        I('work.industry', 'Have you built a site like mine?',
          ['have you built a jewellery site', 'any travel websites', 'restaurant website', 'have you worked with',
           'do you have experience with'], ['built', 'experience'], ent='industry'),
        # ---- about
        I('about.founder', 'Who is Gireesh?',
          ['who is gireesh', 'who runs the studio', 'founder', 'who is behind teseract', 'who owns the company',
           'tell me about gireesh', 'who will work on my project', 'who will design my website', 'your experience',
           'how experienced are you'], ['gireesh', 'founder', 'who'], chips=['story', 'why', 'talk']),
        I('about.why', 'Why does {brand} exist?',
          ['why does teseract exist', 'why did you start', 'why teseract exists', 'story behind the studio'],
          ['why', 'start', 'exist'],
          blocks=[P(W['why']['title'], 'WHO.why.title'), L(W['why']['replaced'], 'WHO.why.replaced'),
                  P(W['why']['body'], 'WHO.why.body'), P(W['why']['quote'], 'WHO.why.quote'), FROM('who-we-are', 'why')],
          chips=['founder', 'work']),
        I('about.philosophy', 'What is your philosophy?', ['philosophy', 'what do you believe', 'your values',
          'how do you think about design'], ['philosophy', 'believe', 'value'],
          blocks=[P(W['philosophy']['title'], 'WHO.philosophy.title'), P(W['philosophy']['body'], 'WHO.philosophy.body'),
                  L(W['philosophy']['steps'], 'WHO.philosophy.steps'), FROM('who-we-are', 'philosophy')],
          chips=['process', 'work']),
        I('about.think', 'How do you think about design?', ['how you think', 'design principles', 'people first',
          'details matter'], ['principle', 'detail', 'people'],
          blocks=[L([t[0] for t in W['think']['items']], 'WHO.think.items.*.0'), P(W['think']['items'][0][2], 'WHO.think.items.0.2'),
                  FROM('who-we-are', 'how-we-think')], chips=['process', 'work']),
        I('about.promise', 'What do you promise?', ['your promise', 'what do you promise', 'can i trust you'],
          ['promise', 'trust'],
          blocks=[P(W['promise']['title'], 'WHO.promise.title'), L(W['promise']['lines'], 'WHO.promise.lines'),
                  P(W['promise']['question'], 'WHO.promise.question'), FROM('who-we-are', 'promise')]),
        I('about.different', 'Why should I choose you?', ['why should i choose you', 'what makes you different',
          'why you', 'why hire you', 'how are you different from other agencies'], ['different', 'choose', 'why'],
          blocks=[P(B['idea'], 'BRAND.idea'), P(W['promise']['title'], 'WHO.promise.title'), FROM('who-we-are', 'promise')],
          chips=['work', 'process', 'prices']),
        I('about.team', 'How big is your team?', ['how big is your team', 'how many people', 'team size',
          'are you a big agency', 'is it one person'], ['team', 'big', 'people'],
          blocks=[P(W['hero']['title'], 'WHO.hero.title'), P(W['hero']['body'][0], 'WHO.hero.body.0'),
                  P(W['hero']['body'][1], 'WHO.hero.body.1'), FROM('who-we-are')], chips=['founder', 'work']),
        I('about.audience', 'Who do you work with?', ['who do you work with', 'do you work with startups',
          'do you work with small businesses', 'what kind of clients', 'is it only for big companies'],
          ['startup', 'business', 'small', 'company', 'kind'],
          blocks=[P(W['hero']['body'][1], 'WHO.hero.body.1'), {'t': 'faq', 'i': 1}], chips=['work', 'prices']),
        I('about.reviews', 'What do clients say?', ['what do clients say', 'testimonials', 'reviews', 'feedback from clients',
          'client experience'], ['review', 'testimonial', 'say'],
          blocks=[P(S['experience']['title'], 'STORIES.experience.title'), P(S['experience']['body'], 'STORIES.experience.body'),
                  L(S['experience']['lines'], 'STORIES.experience.lines'), FROM('client-stories', 'experience')],
          chips=['work', 'involved']),
        I('about.clients_count', 'How many clients have you worked with?', ['how many clients', 'number of clients',
          'how many clients have you worked with',
          'how many projects have you done', 'how many websites have you built'], ['how_many', 'client']),
        # ---- contact
        I('contact.how', 'How can I contact you?', ['how can i contact you', 'contact', 'get in touch', 'reach you',
          'contact details', 'how do i reach gireesh'], ['contact', 'reach', 'touch'], chips=['book', 'show_email']),
        I('contact.phone', 'Can I call you?', ['phone number', 'can i call you', 'whatsapp number', 'mobile number',
          'contact number'], ['phone'], chips=['book', 'show_email']),
        I('contact.socials', 'Are you on Instagram or LinkedIn?', ['instagram', 'linkedin', 'github', 'social media',
          'socials'], ['instagram', 'linkedin', 'github', 'social']),
        I('contact.email', 'What is your email?', ['email', 'email address', 'what is your email', 'mail id'], ['email']),
        I('contact.book', 'Book a call', ['book a call', 'schedule a meeting', 'can we talk', 'i want to talk to someone',
          'set up a call', 'speak to gireesh'], ['call', 'book', 'talk']),
        I('contact.start', 'I want to start a project', ['i want to start', 'lets do it', 'hire you', 'start a project',
          'i am ready', 'work with you', 'i want a website'], ['start', 'hire', 'ready']),
        # ---- not on the website: say so, never guess
        I('nodata.hosting', 'Do you provide hosting?', ['hosting', 'do you host', 'server', 'hosting cost'], ['hosting']),
        I('nodata.domain', 'Do you register domains?', ['domain', 'domain name', 'buy a domain'], ['domain']),
        I('nodata.payment', 'What are your payment terms?', ['payment terms', 'advance payment', 'emi', 'installments',
          'how do i pay', 'payment methods'], ['installment', 'payment']),
        I('nodata.gst', 'Do you charge GST?', ['gst', 'invoice', 'tax invoice', 'billing'], ['gst']),
        I('nodata.refund', 'Do you offer refunds?', ['refund', 'money back', 'refund policy'], ['refund']),
        I('nodata.stack', 'Which technology do you use?', ['tech stack', 'wordpress', 'react', 'do you use shopify',
          'which technology', 'what framework', 'webflow'], ['stack', 'technology', 'framework']),
        I('nodata.jobs', 'Are you hiring?', ['jobs', 'are you hiring', 'careers', 'internship', 'vacancy'], ['jobs', 'careers']),
        I('nodata.address', 'Where is your office?', ['office address', 'where is your office', 'can i visit',
          'address'], ['address']),
        I('nodata.fullname', "What is Gireesh's full name?", ['full name', 'surname', 'last name'], ['surname', 'full']),
        # ---- small talk and the assistant itself
        I('meta.hi', 'Hello', ['hi', 'hello', 'good morning', 'good evening', 'namaste'], ['hi']),
        I('meta.thanks', 'Thanks', ['thanks', 'thank you', 'great thanks', 'that helps', 'perfect'], ['thanks']),
        I('meta.bye', 'Bye', ['bye', 'goodbye', 'see you later', 'that is all'], ['bye']),
        I('meta.bot', 'Are you a bot?', ['are you a bot', 'are you human', 'are you real', 'is this ai', 'who am i talking to',
          'are you gireesh', 'are you a real person', 'am i talking to a human'], ['bot', 'human', 'real']),
        I('meta.chat_privacy', 'Is this chat private?', ['is this chat private', 'do you store my data', 'privacy',
          'is my data safe', 'are you recording this'], ['privacy', 'private', 'data']),
        I('meta.personal', 'My contact details', ['my email is', 'my number is', 'call me on'], ['email', 'phone']),
        I('meta.restart', 'Start over', ['start over', 'restart', 'reset the chat', 'clear chat'], ['restart', 'reset']),
        I('meta.help', 'What can you do?', ['help', 'what can you do', 'what can i ask', 'menu', 'options'], ['help']),
        I('meta.off_topic', 'Something else', ['ignore your rules', 'weather', 'tell me a joke', 'who won the match',
          'write me a poem', 'reply in capitals'], ['joke', 'weather', 'poem']),
    ]
    # FAQ: question + owner-review aliases; answer verbatim (four of them open the richer answer of their topic)
    special = {2: [{'t': 'faq', 'i': 2}, L(CT['before']['lines'], 'CONTACT.before.lines')],
               10: [{'t': 'faq', 'i': 10}, L(S['experience']['lines'], 'STORIES.experience.lines')]}
    faq_chips = {0: ['create', 'work', 'founder'], 1: ['prices', 'book'], 2: ['book', 'prices'], 3: ['prices', 'book'],
                 4: ['create', 'prices'], 5: ['cost_store', 'work'], 6: ['cost_site', 'work'], 7: ['work', 'process'],
                 8: ['process'], 9: ['ask_gireesh', 'process'], 10: ['process', 'work'], 11: ['founder', 'create']}
    for i, (q, _a) in enumerate(faq):
        fid = f'faq.{i}'
        if i == 4:
            continue                                   # 'What can you build for us?' = svc.overview (the 8 services)
        if i == 8:
            continue                                   # 'How does a project work?' = the process stepper
        # (q and the question itself as a phrase: added by the engine from kb.faq, so the KB stays small)
        x = I(fid, '', list(al.get(i, [])), FAQ_KEYS.get(i, []), blocks=special.get(i, _faq_blocks(i)), chips=faq_chips.get(i, []))
        del x['q']
        out.append(x)
    svc = next(x for x in out if x['id'] == 'svc.overview')
    svc['ph'] += al.get(4, [])
    proc = next(x for x in out if x['id'] == 'process.overview')
    proc['ph'] += al.get(8, [])
    # one intent per service: its name and tags (the card is built from kb.services)
    aliases = {'website-design': ['web design', 'ui ux', 'ux design', 'ui design', 'redesign', 'do you do redesigns', 'website design'],
               'website-development': ['development', 'web development', 'coding', 'cms website', 'responsive website',
                                       'develop a website'],
               'e-commerce': ['ecommerce', 'online store', 'what is included in ecommerce', 'ecommerce services'],
               'interactive-3d': ['3d', 'animation', 'motion design', 'interactive website', 'scroll animations', '3d website'],
               'brand-digital-identity': ['branding', 'branding services', 'brand identity', 'brand guidelines', 'visual identity'],
               'product-saas': ['saas', 'dashboard', 'app design', 'product design', 'web app', 'do you make apps',
                                'do you build apps', 'mobile app'],
               'ai-automation': ['ai', 'automation', 'ai tools', 'workflow automation', 'internal tools'],
               'digital-strategy': ['strategy', 'digital strategy', 'competitor analysis', 'user research']}
    for s in content.CREATE['services']:
        sid = _slug(s['name'])
        chips = ['cost_store'] if sid == 'e-commerce' else ['cost_site'] if sid.startswith('website') else ['prices']
        # (q = the name; the name and tags as phrases: added by the engine from kb.services)
        x = I(f'svc.{sid}', '', aliases.get(sid, []),
              [w for w in re.findall(r'[a-z0-9]+', s['name'].lower().replace('e-commerce', 'ecommerce')) if w not in ('and', 'website', 'digital')],
              blocks=[{'t': 'service', 'id': sid}], chips=chips + ['work'])
        del x['q']
        out.append(x)
    for i, st in enumerate(content.APPROACH['steps']):
        name = st['name'].lower()
        # (q = 'Name: sub'; 'what happens in the <name> stage', '<name> step' ...: added by the engine)
        x = I(f'process.step.{i + 1}', '', [f'{name} stage'] + STEP_PH.get(i, []), [name, 'step'], blocks=[{'t': 'step', 'i': i}], chips=['process'])
        del x['q']
        out.append(x)
    for x in out:                                      # the FAQ.9 / FAQ.10 topics answer the process chips
        if x['id'] == 'faq.9':
            x['ph'] += ['after the website goes live']
        if x['id'] == 'faq.10':
            x['ph'] += ['will i be involved']
    return out


# chip key (content.CHAT['chips']) -> what it does: an intent id, a flow action ('@...') or a link {r, f}
CHIP_TARGETS = {
    'prices': 'price.general', 'create': 'svc.overview', 'process': 'process.overview', 'work': 'work.overview',
    'founder': 'about.founder', 'book': 'contact.book', 'like': '@like', 'ask_gireesh': '@ask', 'something_else': '@else',
    'that_helps': 'meta.thanks', 'pass': '@ask', 'show_email': 'contact.email', 'keep': '@keep', 'back_start': 'meta.help',
    'back_brief': '@brief', 'send_brief': '@send', 'ask_else': '@else', 'quote': 'contact.start',
    'other_prices': 'price.general', 'more_work': 'work.overview', 'see_project': '@see', 'cost_site': 'price.website',
    'cost_store': 'price.ecommerce', 'story': {'r': 'who-we-are', 'f': 'founder'}, 'why': 'about.why', 'talk': '@ask',
    'involved': 'faq.10', 'after_launch': 'faq.9', 'how_long': 'time.timeline',
    'see_create': {'r': 'what-we-create', 'f': ''}, 'change_cur': '@cur', 'open_form': '@form', 'open_form_short': '@form',
    'copy_brief': '@copy', 'email_instead': '@mail', 'pick_time': '@booking', 'by_form': '@form', 'done': '@done',
    'stories_link': {'r': 'client-stories', 'f': 'experience'}, 'view': '@see',
}
ACTIONS = {'@like', '@ask', '@else', '@keep', '@brief', '@send', '@see', '@cur', '@form', '@copy', '@mail', '@booking', '@done'}


def _thumb(p):
    """The smallest Work-card still variant of at least 320 px (the project strip's lazy image)."""
    vs = sorted(p['scene_still']['entry']['variants'], key=lambda v: v['width'])
    return next((v for v in vs if v['width'] >= 320), vs[-1])['file']


def _project_keys(p, shown):
    """Words that name a project in a question: its distinctive title words, its slug, the owner-review aliases. A
    word two projects share (Aeroskys / Careers at Aeroskys) names neither on its own."""
    def words(x):
        title = _norm(x['title'].split('|')[0].split('—')[0].split(' by ')[0])
        return [w for w in title.split() if w not in GENERIC and len(w) > 3]
    keys = set()
    ws = words(p)
    if ws:
        keys.add(' '.join(ws))
        keys.add(ws[0])
    others = {w for x in shown if x is not p for w in words(x)}
    keys = {k for k in keys if k not in others}
    slug = p['slug'].replace('-', ' ')
    if not set(slug.split()) <= GENERIC:
        keys.add(slug)
    return sorted(k for k in keys if k)          # (+ the aliases of kb.lex.alias, merged by the engine)


def _norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', s.lower().replace('ā', 'a'))).strip()


def prose_name(p):
    """A project's name in a sentence (review 22 Oct, TP-14; src/chat/20-flow.js pname() says the same): 'ONE PIECE |
    Luffy' -> 'ONE PIECE (Luffy)', a personal project named after the founder -> "Gireesh's designer portfolio"."""
    t, who = p['title'], content.WHO['founder']['name']
    if p.get('label_kind') == 'personal' and re.match(rf'{re.escape(who)}\b', t, re.I):
        return f"{who}'s " + ' '.join(w if re.search(r'[A-Z].*[A-Z]', w) else w.lower() for w in p['industry'].split())
    return re.sub(r'\s*\|\s*(.+)$', r' (\1)', t)


def _industry_words(p):
    return re.findall(r'[a-z0-9]+', (p['industry'] + ' ' + p['title']).lower().replace('ā', 'a'))


def _industry_map(shown):
    out = {}
    for word in content.CHAT['industry_lexicon']:
        want = INDUSTRY_SYN.get(word, word)
        parts = want.split()
        hits = [p['slug'] for p in shown
                if all(any(w == x or w.rstrip('s') == x.rstrip('s') for x in _industry_words(p)) for w in parts)]
        for w in INDUSTRY_ALSO.get(word, ()):
            hits += [p['slug'] for p in shown if p['slug'] not in hits and any(
                x.rstrip('s') == w for x in _industry_words(p) + re.findall(r'[a-z]+', (p.get('summary') or '').lower()))]
        out[word] = hits
    return out


def build(out):
    """Write out/assets/chat-kb.json and return the knowledge base."""
    pricing = CONFIG['chat']['pricing']
    when = datetime.date.fromisoformat(pricing['rates_date'])
    shown = projects.PROJECTS
    socials = [{'label': {'instagram': 'Instagram', 'linkedin': 'LinkedIn', 'github': 'GitHub', 'behance': 'Behance'}[k],
                'url': v} for k, v in (CONFIG.get('socials') or {}).items() if v]
    email = '' if CONFIG.get('email_is_placeholder') else (CONFIG.get('email') or '')
    projs = []
    for p in shown:
        th = _thumb(p)
        lib.USED.add(th)
        # k: the label kind (kb.labels names it); th: the still under assets/media/
        d = {'s': p['slug'], 't': p['title'], 'i': p['industry'], 'k': p['label_kind'],
             'th': th[len(MEDIA):] if th.startswith(MEDIA) else th, 'keys': _project_keys(p, shown)}
        if p.get('note'):
            d['n'] = p['note']
        if p.get('summary'):
            d['sum'] = p['summary']
        if 'E-commerce' in p['services_list']:
            d['e'] = 1
        elif re.search(r'\b(checkout|cart|storefront|payments)\b', p.get('summary') or ''):
            d['st'] = 1                                 # sells online by its summary (Vynk): a store's starting price
        if 'SaaS' in p['industry']:
            d['sa'] = 1
        projs.append(d)
    for a in AVATARS:
        lib.USED.add(a)
    W = content.WHO
    f = W['founder']
    kb = {
        'v': 1, 'built': datetime.date.today().isoformat(),
        'brand': {'name': CONFIG['brand'], 'full': CONFIG['brand_full'], 'tagline': CONFIG['tagline']},
        'nav': _nav(),
        'contact': {'email': email, 'form': {'r': 'contact', 'f': 'project-form'}, 'socials': socials,
                    'booking_url': (CONFIG['chat'].get('booking_url') or '').strip()},
        'pricing': {'base': pricing['base_currency'], 'w': pricing['website_from'], 'e': pricing['ecommerce_from'],
                    'month': when.strftime('%B %Y'), 'confirmed': bool(pricing['rates_confirmed']),
                    'rates': dict(pricing['rates']), 'amounts': amounts(pricing), 'cur': CURRENCIES},
        'regions': REGIONS,
        'faq': [{'q': fmt(q), 'a': fmt(a), 'src': f'FAQ.{i}'} for i, (q, a) in enumerate(content.FAQ)],
        'faq_url': {'r': '', 'f': 'faq'},
        'services': [dict({'id': _slug(s['name']), 'n': s['n'], 'name': s['name'], 'title': fmt(s['title']),
                           'body': fmt(s['body']), 'tags': s['tags'], 'src': f'CREATE.services.{i}',
                           'price': 'ecommerce' if s['name'] == 'E-commerce' else 'website' if s['name'].startswith('Website') else None},
                          **({'note': s['note']} if s.get('note') else {}))
                     for i, s in enumerate(content.CREATE['services'])],
        'create': {'title': fmt(content.CREATE['hero']['title']), 'cta': content.CREATE['cta']['lines']},
        'process': {'steps': [dict({'n': s['n'], 'name': s['name'], 'sub': s['sub'], 'src': f'APPROACH.steps.{i}'},
                                   **{k: s[k] for k in ('body', 'list_intro', 'list', 'ask') if s.get(k)},
                                   **({'end': s.get('result') or s.get('closing')} if (s.get('result') or s.get('closing')) else {}))
                              for i, s in enumerate(content.APPROACH['steps'])]},
        'founder': {'label': fmt(f['label']), 'name': f['name'], 'roles': f['roles'], 'journey': f['journey'],
                    'quote': f['quote'], 'body': f['body'], 'src': 'WHO.founder', 'url': {'r': 'who-we-are', 'f': 'founder'}},
        'work': {'title': content.WORK['hero']['title'], 'body': content.WORK['hero']['body'], 'src': 'WORK.hero'},
        'projects': projs, 'media': MEDIA,
        'labels': {kind: label for label, kind in projects.LABEL_KIND.items()},
        'counts': {'client': sum(p['group'] == 'client' for p in shown), 'other': sum(p['group'] != 'client' for p in shown)},
        'intents': intents(),
        'chips': CHIP_TARGETS,
        'lex': {'alias': content.CHAT['project_aliases'], 'industry': _industry_map(shown)},
        'th': TH,
    }
    dest = lib.longpath(out / KB_FILE)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(kb, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    return kb


def copy():
    """content.CHAT for chat.js (window.__CC.copy): {brand} filled in, the matching data and the owner flag left out
    (the aliases and the industry words go into the knowledge base)."""
    skip = {'owner_review', 'faq_aliases', 'project_aliases', 'industry_lexicon'}

    def f(v):
        if isinstance(v, str):
            return fmt(v)
        if isinstance(v, list):
            return [f(x) for x in v]
        if isinstance(v, dict):
            return {str(k): f(x) for k, x in v.items()}
        return v
    return {k: f(v) for k, v in content.CHAT.items() if k not in skip}


def mark():
    """The four shards of the logo mark (chrome_intro._mark(): centre triangle + three slivers): path, transform origin
    and the outward normal of each, for the launcher and the chat avatar."""
    import chrome_intro
    return {k: {'d': s['d'], 'o': s['o'], 'n': s['n']} for k, s in chrome_intro._mark().items()}
