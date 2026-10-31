import { courses, tracks } from '../data/courses';
import { services } from '../data/services';

/* ------------------------------------------------------------------ *
 * Ray — the Wemray assistant.
 * A small local conversation engine: intents, memory and two guided
 * flows (project intake, course matching). No backend required.
 * ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SERVICE_ALIASES = {
  branding: ['brand', 'branding', 'logo', 'identity', 'rebrand', 'event branding', 'stationery'],
  website: ['website', 'web site', 'web', 'site', 'ecommerce', 'e commerce', 'landing page', 'wordpress'],
  saas: ['saas', 'mvp', 'subscription', 'platform', 'product build', 'web app', 'web application'],
  mobile: ['mobile', 'android', 'ios', 'phone app', 'mobile app'],
  software: ['software', 'system', 'dashboard', 'portal', 'internal tool', 'integration', 'erp', 'crm', 'custom build'],
  ai: ['ai', 'artificial intelligence', 'chatbot', 'agent', 'llm', 'machine learning'],
  automation: ['automation', 'automate', 'workflow', 'zapier', 'repetitive work', 'manual work'],
  seo: ['seo', 'search engine', 'rank', 'ranking', 'keywords', 'google'],
};

const TRACK_ALIASES = {
  sw: ['software', 'developer', 'development', 'frontend', 'backend', 'full stack', 'coding', 'programming'],
  ds: ['design', 'creative', 'branding', 'ui', 'ux', 'product design'],
  dm: ['marketing', 'website management', 'wordpress', 'social media', 'content'],
  da: ['data', 'analytics', 'analysis', 'power bi', 'excel'],
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function scoreAliases(value, aliases) {
  const text = ` ${normalize(value)} `;
  return aliases.reduce((score, alias) => (text.includes(` ${alias} `) ? score + alias.length : score), 0);
}

function detectService(value) {
  let best = null;
  let bestScore = 0;
  Object.entries(SERVICE_ALIASES).forEach(([slug, aliases]) => {
    const score = scoreAliases(value, aliases);
    if (score > bestScore) {
      bestScore = score;
      best = slug;
    }
  });
  return best;
}

function detectTrack(value) {
  let best = null;
  let bestScore = 0;
  Object.entries(TRACK_ALIASES).forEach(([key, aliases]) => {
    const score = scoreAliases(value, aliases);
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  });
  return best;
}

const getService = (slug) => services.find((service) => service.slug === slug);
const serviceLabel = (slug) => getService(slug)?.name ?? 'Project';
const trackLabel = (key) => tracks.find((track) => track.key === key)?.label ?? 'that track';
const trackCourses = (key) => courses.filter((course) => course.trackKey === key);

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const out = (text, chips = [], links = [], items = []) => ({
  messages: [
    {
      text,
      links: links.length ? links : undefined,
      items: items.length ? items : undefined,
    },
  ],
  chips,
});

export function createSession() {
  return { turn: 0, topic: null, flow: null, slots: {} };
}

export function openingMessage(pathname = '/') {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  if (pathname.startsWith('/academy')) {
    return `${part} — I'm Ray, the Wemray assistant. You're on the Ray Academy page, so ask me about tracks, courses or training.`;
  }
  if (pathname.startsWith('/services')) {
    return `${part} — I'm Ray. You're on our services pages, so ask me how we handle the work you're looking at.`;
  }
  if (pathname.startsWith('/portfolio')) {
    return `${part} — I'm Ray. You're looking at our work, so ask me about any project here.`;
  }
  if (pathname.startsWith('/contact')) {
    return `${part} — I'm Ray. If the form feels like a lot, tell me what you need and I'll take the first details.`;
  }
  return `${part} — I'm Ray, the Wemray assistant. Ask me about our services, Ray Academy, pricing, or how to start a project.`;
}

const defaultChips = (session) => {
  if (session.topic?.type === 'service') {
    return ["What's the process?", 'How much does it cost?', 'Start this project', 'See our work'];
  }
  if (session.topic?.type === 'academy') {
    return ['Which course fits me?', 'Course fees', 'Enquire about training'];
  }
  return ['What do you do?', 'Start a project', 'Ray Academy', 'Talk to a human'];
};

const isGreeting = (n) =>
  /^(hi|hey|hello|yo|hiya|good (morning|afternoon|evening))\b|^(hey|hi|hello) ray\b/.test(n);
const isAck = (n) => /^(ok|okay|k|cool|nice|great|alright|sure|yes|yeah|yep|nope|hmm|interesting|i see)$/.test(n);
const isThanks = (n) => /\b(thanks|thank you|thx|appreciate it|cheers)\b/.test(n);
const isBye = (n) => /\b(bye|goodbye|see you|later|good night)\b/.test(n);
const isIdentity = (n) =>
  /\b(who are you|what are you|your name|are you (a )?(bot|human|real|ai|robot|person))\b/.test(n);
const isHowAreYou = (n) => /\bhow are you|how is it going|how are things\b/.test(n);
const isCapabilities = (n) =>
  /\b(what can you do|what do you do|what do you offer|how can you help|help me|menu|options)\b/.test(n);
const isJoke = (n) => /\b(joke|funny|make me laugh)\b/.test(n);
const isMore = (n) =>
  /^(more|tell me more|go on|expand|what else|details|another one)$/.test(n) ||
  /\b(tell me more|more detail|more about|what else)\b/.test(n);
const isPricing = (n) => /\b(price|pricing|cost|costs|quote|budget|how much|fees?|rate|cheap|expensive)\b/.test(n);
const isProcess = (n) =>
  /\b(process|how do you work|how you work|steps|stages|blueprint|timeline|how long|duration)\b/.test(n);
const isPortfolio = (n) => /\b(portfolio|your work|our work|case stud(y|ies)|examples)\b/.test(n);
const isContact = (n) => /\b(contact|talk to|speak to|human|call|phone|email|reach|whatsapp|location|where are you)\b/.test(n);
const isAcademy = (n) =>
  /\b(academy|training|train|course|courses|learn|learning|student|classes?|skills?|tracks?)\b/.test(n);
const isAbout = (n) => /\b(about wemray|about you|your team|who is wemray|company|nigeria|lagos)\b/.test(n);
const isStart = (n) =>
  /\b(start|begin|kick ?off|launch|hire|engage|enquire|inquire|quote|brief|work with you|work together|get started|need a (website|brand|logo|app|system|platform))\b/.test(
    n,
  );

function servicesOverview() {
  return {
    messages: [
      {
        text: 'Three connected areas, one team:',
        items: [
          'Brand & Digital Presence — branding, websites, SEO',
          'Product & Custom Engineering — SaaS, mobile apps, custom software',
          'Intelligence & Efficiency — AI solutions and workflow automation',
        ],
      },
      { text: 'Ray Academy sits alongside that as our training arm. Which of those is closest to what you need?' },
    ],
    chips: ['Branding', 'Website', 'Custom software', 'AI & automation', 'Ray Academy'],
  };
}

function serviceReply(session, slug) {
  const service = getService(slug);
  if (!service) return servicesOverview();
  session.topic = { type: 'service', slug };
  return {
    messages: [
      { text: `${service.name}. ${service.sub}` },
      { text: 'In practice that usually means:', items: service.create.items.slice(0, 4).map((item) => item.title) },
    ],
    chips: ["What's the process?", 'How much does it cost?', 'Start this project', 'See our work'],
  };
}

function processReply(session) {
  const service = session.topic?.type === 'service' ? getService(session.topic.slug) : null;
  if (service) {
    return {
      messages: [
        { text: `For ${service.name.toLowerCase()}, it runs in clear stages:` },
        { text: service.approach.lead, items: service.approach.steps.map((step) => `${step.t} — ${step.d}`) },
      ],
      chips: ['How much does it cost?', 'Start this project', 'Talk to a human'],
    };
  }
  session.topic = { type: 'process' };
  return {
    messages: [
      {
        text: 'Everything follows the Ray Blueprint — three stages, one direction:',
        items: [
          '01 Research & Reveal — study the business, audience and goals, then set priorities.',
          '02 Architect & Activate — design and build the identity, product or system.',
          '03 Yield & Evolve — refine and adapt as the business grows.',
        ],
      },
      { text: 'You always know which stage you are in.' },
    ],
    chips: ['Start a project', 'What do you do?', 'See our work'],
  };
}

function pricingReply(session) {
  const service = session.topic?.type === 'service' ? getService(session.topic.slug) : null;
  if (service) {
    return out(
      `${service.name} is scoped rather than priced from a list — the size of the build decides the figure. Share a little context and the team will come back with a clear number.`,
      ['Start this project', "What's the process?", 'Talk to a human'],
      [['Start a conversation', 'contact.html']],
    );
  }
  if (session.topic?.type === 'academy') {
    return out(
      'Course fees, dates and formats are confirmed by the Ray Academy team, since they change by cohort. One message usually gets you the current numbers.',
      ['Enquire about training', 'Which course fits me?'],
      [['Contact Ray Academy', 'contact.html']],
    );
  }
  return out(
    'We scope each project around what it actually needs, so there is no price list. Tell me what you want to build and I will point you to the right place.',
    ['Start a project', 'What do you do?', 'Talk to a human'],
  );
}

function academyTrackReply(track) {
  const list = trackCourses(track);
  return {
    messages: [
      { text: `${trackLabel(track)} it is.` },
      { text: 'Courses in that track:', items: list.map((course) => `${course.title} · ${course.format}`) },
    ],
    chips: ['Course fees', 'Enquire about training', 'Another track'],
    links: list.length ? [[`Enquire about ${list[0].title}`, `contact.html?course=${list[0].slug}`]] : [],
  };
}

function academyReply(session, extra = '') {
  const track = detectTrack(extra);
  if (track) {
    session.topic = { type: 'academy', track };
    return academyTrackReply(track);
  }
  session.topic = { type: 'academy' };
  return {
    messages: [
      { text: 'Ray Academy is practical, project-based training — build real work, get feedback, leave with evidence.' },
      { text: 'Four tracks:', items: tracks.map((item) => `${item.label} — ${trackCourses(item.key).length} ${trackCourses(item.key).length === 1 ? 'course' : 'courses'}`) },
      { text: 'Which one sounds like you?' },
    ],
    chips: ['Software development', 'Design & creative', 'Marketing & websites', 'Data analytics'],
  };
}

function portfolioReply() {
  return {
    messages: [
      { text: 'Selected work covers branding, web, software, mobile, AI and search.' },
      { text: 'Each case study is told in four parts — challenge, approach, deliverables, verified outcome.' },
    ],
    chips: ['Start a project', 'What do you do?', 'Talk to a human'],
    links: [['View the portfolio', 'portfolio.html']],
  };
}

function contactReply() {
  return {
    messages: [
      { text: 'The quickest route is the contact form — it reaches the whole team.' },
      { text: 'Prefer email? hello@wemray.com. Phone: 0813 993 4328.' },
    ],
    chips: ['Start a project', 'What do you do?'],
    links: [
      ['Open the contact form', 'contact.html'],
      ['Email hello@wemray.com', 'mailto:hello@wemray.com'],
    ],
  };
}

function aboutReply() {
  return out(
    'Wemray Technology brings brand, technology and intelligent systems under one roof, working with ambitious businesses in Nigeria and beyond. Small enough to stay close, broad enough to cover the whole journey.',
    ['What do you do?', 'See our work', 'Start a project'],
    [['About Wemray', 'about.html']],
  );
}

/* ---------------------------- project flow ---------------------------- */

const SERVICE_CHIPS = [
  'A website',
  'A brand identity',
  'Custom software',
  'A mobile app',
  'AI or automation',
  'Not sure yet',
];

function startProjectFlow(session, slug) {
  session.flow = { name: 'project', step: 0 };
  session.slots = { service: slug || '', stage: '', timing: '', name: '', email: '', emailTries: 0 };
  return {
    messages: [
      {
        text: slug
          ? `${serviceLabel(slug)} — good. Tell me a little more, or pick the closest match:`
          : "Let's shape this properly. What do you need built?",
      },
    ],
    chips: SERVICE_CHIPS,
  };
}

function projectSummary(session) {
  const { service, stage, timing, name, email } = session.slots;
  const known = service && service !== 'other';
  const label = known ? serviceLabel(service) : 'Project';
  const href = known ? `contact.html?service=${service}` : 'contact.html';
  const body = [
    `Name: ${name || '-'}`,
    `Email: ${email || '-'}`,
    `Service: ${label}`,
    `Stage: ${stage || '-'}`,
    `Timing: ${timing || '-'}`,
    '',
    'Sent from the Wemray assistant.',
  ].join('\n');
  const mailto = `mailto:hello@wemray.com?subject=${encodeURIComponent(`${label} enquiry`)}&body=${encodeURIComponent(body)}`;

  session.flow = null;
  session.topic = known ? { type: 'service', slug: service } : null;

  return {
    messages: [
      {
        text: `That is enough to start${name ? `, ${name}` : ''} — ${label.toLowerCase()} · ${
          stage || 'exploring'
        } · ${timing || 'timing open'}.`,
      },
      { text: 'Send it over and the team will pick it up from there.' },
    ],
    chips: ['See our work', 'How do you work?', 'Start over'],
    links: [
      ['Open the contact form', href],
      ['Email it instead', mailto],
    ],
  };
}

function projectStep(session, n, text) {
  const slots = session.slots;
  const step = session.flow.step;

  // Side questions never lose the thread.
  if (isPricing(n)) return pricingReply(session);
  if (isProcess(n)) return processReply(session);
  if (isContact(n)) return contactReply();

  if (step === 0) {
    const slug = detectService(n);
    const unsure = /not sure|no idea|dont know|do not know|unsure|anything|advice|guide me|everything/.test(n);
    if (!slug && !unsure) return out('Give me the closest match and I will take it from there.', SERVICE_CHIPS);
    slots.service = slug || 'other';
    if (slug) session.topic = { type: 'service', slug };
    session.flow.step = 1;
    return out(
      slug
        ? `${serviceLabel(slug)} — one of our strongest areas. Where are you with it right now?`
        : 'No problem — a short conversation usually finds the right starting point. Where are you with it?',
      ['Just exploring', 'Ready to start', 'I have a deadline'],
    );
  }

  if (step === 1) {
    slots.stage = text.slice(0, 80);
    session.flow.step = 2;
    return out('Noted. When would you like to begin?', ['This month', 'This quarter', 'Still deciding']);
  }

  if (step === 2) {
    slots.timing = text.slice(0, 60);
    session.flow.step = 3;
    return out('Perfect. Who should the team reply to?', ['Skip this']);
  }

  if (step === 3) {
    slots.name = /skip|rather not|no name/.test(n) ? '' : text.slice(0, 40);
    session.flow.step = 4;
    return out(
      slots.name ? `Thanks, ${slots.name}. And the best email to reach you?` : 'No problem. Best email to reach you?',
      ['Skip this'],
    );
  }

  if (step === 4) {
    if (/skip|rather not|no email/.test(n)) return projectSummary(session);
    if (!EMAIL_RE.test(text.trim())) {
      slots.emailTries += 1;
      if (slots.emailTries > 1) return projectSummary(session);
      return out('That does not look quite right — mind checking it? You can also type "skip".', ['Skip this']);
    }
    slots.email = text.trim();
    return projectSummary(session);
  }

  return projectSummary(session);
}

/* ---------------------------- course flow ---------------------------- */

const TRACK_CHIPS = ['Software development', 'Design & creative', 'Marketing & websites', 'Data analytics'];

function academyStep(session, n) {
  const track = detectTrack(n);
  if (!track) return out('No rush — which of these sounds closest?', TRACK_CHIPS);
  session.flow = null;
  return academyTrackReply(track);
}

/* ------------------------------ routing ------------------------------ */

export function respond(session, raw) {
  const text = String(raw ?? '').trim();
  const n = normalize(text);
  session.turn += 1;

  if (!n) return out('I am listening — ask me anything about Wemray.', defaultChips(session));

  if (/^(cancel|stop|never ?mind|forget it|reset|start over)$/.test(n)) {
    session.flow = null;
    session.slots = {};
    return out('Cleared. What next?', defaultChips(session));
  }

  if (session.flow?.name === 'project') return projectStep(session, n, text);
  if (session.flow?.name === 'academy') return academyStep(session, n);

  if (isGreeting(n)) {
    return out(
      session.turn <= 2
        ? pick([
            'Hello — good to have you here. What are you working on?',
            'Hey there. What can I help you figure out?',
            'Hi. Ask me anything — services, training, pricing, or where to start.',
          ])
        : pick(['Hi again — where were we?', 'Hello again. What else can I dig into?']),
      defaultChips(session),
    );
  }
  if (isAck(n)) {
    return out(
      pick([
        'Good. Anything else — services, pricing, process, or Ray Academy?',
        'Noted. What would you like to look at next?',
      ]),
      defaultChips(session),
    );
  }
  if (isIdentity(n)) {
    return out(
      'I am Ray, the assistant that lives in the corner of this site. Software rather than a person, but everything I know comes from the Wemray team.',
      ['What do you do?', 'Talk to a human'],
    );
  }
  if (isHowAreYou(n)) {
    return out('Running smoothly, thanks for asking. How is your own project treating you?', defaultChips(session));
  }
  if (isJoke(n)) {
    return out(
      pick([
        'Our designers asked for a joke about kerning. I said it was not my type. They are still deciding whether to forgive me.',
        'I would tell you a joke about pixels, but it would only work at the right resolution.',
      ]),
      ['What do you do?', 'Start a project'],
    );
  }
  if (isThanks(n)) {
    return out(
      pick(['Any time. Anything else I can dig into?', 'You are welcome — happy to keep going.']),
      defaultChips(session),
    );
  }
  if (isBye(n)) return out('Catch you later — I will be right here if something comes up.', []);

  if (isPricing(n)) return pricingReply(session);
  if (isProcess(n)) return processReply(session);
  if (isContact(n) && !detectService(n)) return contactReply();

  if (isStart(n) && !isAcademy(n)) {
    const slug = detectService(n) || (session.topic?.type === 'service' ? session.topic.slug : '');
    return startProjectFlow(session, slug);
  }

  if (isAcademy(n)) {
    if (/enquire|inquire|apply|join|sign up|talk|speak/.test(n) && !detectTrack(n)) {
      return out(
        'Happy to pass that on. Send the course or question and the academy team will reply with dates, fees and format.',
        ['Which course fits me?', 'Course fees', 'What do you do?'],
        [
          ['Open the contact form', 'contact.html'],
          ['Email hello@wemray.com', 'mailto:hello@wemray.com?subject=Ray%20Academy%20enquiry'],
        ],
      );
    }
    if (/which course|what course|fits me|recommend|suggest|not sure|track/.test(n)) {
      session.flow = { name: 'academy', step: 0 };
      return out('Let us narrow it down. Which area interests you most?', TRACK_CHIPS);
    }
    return academyReply(session, n);
  }

  const slug = detectService(n);
  if (slug) return serviceReply(session, slug);

  if (isPortfolio(n)) return portfolioReply();
  if (isMore(n)) {
    if (session.topic?.type === 'service') return processReply(session);
    if (session.topic?.type === 'academy') return academyReply(session);
    return servicesOverview();
  }
  if (isAbout(n)) return aboutReply();
  if (isCapabilities(n)) return servicesOverview();

  return out(
    pick([
      'That one is outside my little library — the team will know, though. Ask me about services, pricing, process or training, or send the question straight to a person.',
      'I do not have a scripted answer for that. I can cover services, pricing, process, our work and Ray Academy — or you can put it to a person.',
    ]),
    ['What do you do?', 'Start a project', 'Talk to a human'],
    [
      ['Ask the team', 'contact.html'],
      ['Email hello@wemray.com', 'mailto:hello@wemray.com'],
    ],
  );
}

