const web = (file) => `/portfolio/web/${file}.png`;

export const projects = [
  {
    slug: 'elm-integrated-services',
    number: '01',
    title: 'ELM Integrated Services',
    category: 'Oil & Gas',
    categoryLabel: 'Oil & Gas',
    summary: 'An authoritative website for an ISO-certified oilfield services, procurement and engineering company.',
    image: web('elmintegrated'),
    gradient: ['#2a14a8', '#000066'],
    sample: false,
    url: 'https://elmintegrated.com',
    challenge:
      'ELM needed a credible digital presence that reflected its technical depth and ISO 9001:2015 certification while making six complex service lines easy to understand.',
    approach:
      'We structured the site around the company’s core operations, gave certifications and HSE credentials clear prominence, and created direct pathways to service information and quote requests.',
    deliverables: [
      'Corporate website',
      'Service architecture',
      'Quote request journey',
      'HSE and certification content',
      'Responsive design',
    ],
    outcome:
      'A confident, standards-led platform that helps operators and procurement teams evaluate ELM’s capabilities quickly.',
  },
  {
    slug: 'stone-and-stone-international',
    number: '02',
    title: 'Stone and Stone International',
    category: 'Oil & Gas',
    categoryLabel: 'Oil & Gas',
    summary: 'A service-led website for an engineering, crane installation and oilfield supply company with decades of experience.',
    image: web('stonandstone'),
    gradient: ['#5125d2', '#1a0f8c'],
    sample: false,
    url: 'https://stoneandstoneint.com',
    challenge:
      'Decades of project history and several distinct engineering services were difficult to navigate, leaving potential clients without a clear view of the company’s capability.',
    approach:
      'We consolidated the offer into clear service areas, brought the project track record and major clients forward, and added an appointment request flow for faster enquiries.',
    deliverables: [
      'Corporate website',
      'Service and project pages',
      'Client and project showcase',
      'Appointment request form',
      'Responsive design',
    ],
    outcome:
      'A structured, credible experience that presents the company’s engineering experience and completed projects with confidence.',
  },
  {
    slug: 'proteinpoint',
    number: '03',
    title: 'ProteinPoint',
    category: 'E-commerce',
    categoryLabel: 'E-commerce',
    summary: 'An online grocery store for fresh proteins, poultry and farm supplies with delivery across Nigeria.',
    image: web('proteinpoint'),
    gradient: ['#6a3df0', '#2a14a8'],
    sample: false,
    url: 'https://proteinpointng.com',
    challenge:
      'ProteinPoint needed to bring a broad catalogue of chicken, turkey, beef, fish, prawns, day-old chicks and feeds online without losing the trust built through its farms and physical supply business.',
    approach:
      'We built a category-led storefront with search, wishlist, cart and account flows, supported by farm-origin content, delivery incentives and clear quality assurances.',
    deliverables: [
      'E-commerce website',
      'Product catalogue and categories',
      'Cart and checkout flow',
      'Wishlist and account pages',
      'Mobile app promotion',
    ],
    outcome:
      'A dependable online store that makes fresh, quality-assured protein easy to browse, order and track.',
  },
  {
    slug: 'nice-atlantic-global',
    number: '04',
    title: 'Nice Atlantic Global',
    category: 'Geospatial',
    categoryLabel: 'Geospatial',
    summary: 'A precise, industry-appropriate website for land surveying and geospatial services.',
    image: web('niceatlantic'),
    gradient: ['#3a1fc0', '#00003f'],
    sample: false,
    url: 'https://niceatlanticglobal.com',
    challenge:
      'A specialist surveying firm needed to explain complex geospatial services clearly to public, private, oil and gas, and construction clients.',
    approach:
      'We shaped a concise service structure, paired technical descriptions with project imagery and proof points, and made a free consultation the central next step.',
    deliverables: [
      'Corporate website',
      'Service showcase',
      'Project gallery',
      'Credential and impact stats',
      'Consultation enquiry journey',
    ],
    outcome:
      'A precise, credible presence that helps the right clients understand the firm’s scope and start a conversation.',
  },
  {
    slug: 'sheltaplux-global-synergy',
    number: '05',
    title: 'SheltaPlux Global Synergy',
    category: 'Construction',
    categoryLabel: 'Construction',
    summary: 'A construction and engineering brand built around precision, safety and end-to-end project delivery.',
    image: web('sheltaplux'),
    gradient: ['#7a55f5', '#1a0f8c'],
    sample: false,
    url: 'https://sheltaplux.com',
    challenge:
      'The company needed a web presence that conveyed technical authority across architecture, construction and facility management without feeling like a collection of unrelated services.',
    approach:
      'We built a single practice narrative, documented the five-stage project process, and gave projects, equipment and the quote journey clear, consistent prominence.',
    deliverables: [
      'Corporate website',
      'Service architecture',
      'Project portfolio',
      'Process and standards content',
      'Equipment showcase and quote request',
    ],
    outcome:
      'A polished platform that positions Sheltaplux as a single point of accountability for built projects.',
  },
  {
    slug: 'chayil-consulting',
    number: '06',
    title: 'Chayil Consulting',
    category: 'Consulting',
    categoryLabel: 'Consulting',
    summary: 'A leadership development website that positions practical people capability as a commercial advantage.',
    image: web('chayil'),
    gradient: ['#8b6cff', '#3a1fc0'],
    sample: false,
    url: 'https://chayilconsulting.co.uk',
    challenge:
      'Chayil needed to translate its management, leadership and outplacement programmes into a clear, credible offer for HR and organisational buyers.',
    approach:
      'We structured the services around critical people moments, added accessible assessments and strong client testimonials, and gave the brand an assured editorial tone.',
    deliverables: [
      'Corporate website',
      'Service pages',
      'Assessment entry points',
      'Testimonial content',
      'Contact journey',
    ],
    outcome:
      'A trustworthy, conversion-focused site that supports conversations with senior HR stakeholders.',
  },
  {
    slug: 'secject-chemicals',
    number: '07',
    title: 'SECJECT Chemicals',
    category: 'Oil & Gas',
    categoryLabel: 'Oil & Gas',
    summary: 'An industrial chemicals platform that makes drilling fluid engineering and field services easier to understand.',
    image: web('secject'),
    gradient: ['#4a22cc', '#00004a'],
    sample: false,
    url: 'https://www.secjectchem.com',
    challenge:
      'SECJECT needed to present a highly technical portfolio — drilling and completion fluids, production chemicals, laboratory services, warehousing and logistics — with clarity and visible proof of standards.',
    approach:
      'We organised the offer into six clear services, added track record, ISO certification and partner credibility, and kept quote requests prominent throughout the journey.',
    deliverables: [
      'Corporate website',
      'Service and product presentation',
      'Track record timeline',
      'QHSE and certification content',
      'Quote request journey',
    ],
    outcome:
      'A technical, trustworthy site that supports operator and OEM conversations from first review to enquiry.',
  },
];

export const projectCategories = ['All', ...new Set(projects.map((project) => project.category))];
