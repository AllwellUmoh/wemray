export const SITE = {
  name: 'Wemray Technology',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://wemray.com',
  email: 'hello@wemray.com',
  phone: '+2348139934328',
  image: 'https://wemray.com/wemray-og.jpg',
  logo: 'https://wemray.com/logo.png',
  social: [
    'https://instagram.com/wemraytechnology',
    'https://tiktok.com/@wemraytechnology',
    'https://facebook.com/wemraytechnology',
    'https://linkedin.com/company/wemraytechnology',
  ],
  areasServed: ['Port Harcourt', 'Lagos', 'Nigeria', 'London', 'United Kingdom', 'Canada'],
  defaultTitle: 'Wemray Technology | Branding, Software & AI | Port Harcourt',
  defaultDescription:
    'Branding, web design and software company in Port Harcourt, Nigeria, serving Lagos, London, the UK and Canada. Websites, apps, AI and automation for growth.',
  defaultKeywords:
    'software development company Port Harcourt, web design company Port Harcourt, branding agency Nigeria, digital agency Lagos, technology company London UK, digital agency Canada, AI automation Nigeria',
  defaultRobots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

const ORGANIZATION_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationSchema() {
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORGANIZATION_ID,
    name: SITE.name,
    alternateName: 'Wemray',
    url: `${SITE.url}/`,
    logo: {
      '@type': 'ImageObject',
      url: SITE.logo,
      width: 420,
      height: 231,
    },
    image: SITE.image,
    description:
      'Wemray Technology is a branding, web design, software development, AI and automation company in Port Harcourt, Nigeria, serving Lagos, London, the United Kingdom and Canada.',
    email: SITE.email,
    telephone: SITE.phone,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Port Harcourt',
      addressRegion: 'Rivers State',
      addressCountry: 'NG',
    },
    areaServed: [
      { '@type': 'City', name: 'Port Harcourt' },
      { '@type': 'City', name: 'Lagos' },
      { '@type': 'Country', name: 'Nigeria' },
      { '@type': 'City', name: 'London' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Canada' },
    ],
    sameAs: SITE.social,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.phone,
        email: SITE.email,
        contactType: 'customer service',
        areaServed: ['NG', 'GB', 'CA'],
        availableLanguage: ['English'],
      },
    ],
    knowsAbout: [
      'Brand identity',
      'Corporate and event branding',
      'Website development',
      'E-commerce',
      'SaaS product development',
      'Mobile app development',
      'Custom software',
      'AI solutions',
      'Workflow automation',
      'Search engine optimization',
      'Digital skills training',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Digital services',
      itemListElement: [
        'Corporate & Event Branding',
        'Website Development',
        'SaaS Product Development',
        'Mobile Application Development',
        'Custom Software & Business Systems',
        'AI Solutions & Intelligent Agents',
        'Workflow Automation',
        'Search Engine Optimization',
        'Technology & Digital Skills Training',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
  };
}

export function webPageSchema({
  url,
  title,
  description,
  type = 'WebPage',
  image = SITE.image,
  dateModified = '2026-10-31',
}) {
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'en',
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
    },
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    dateModified,
  };
}

export function breadcrumbSchema(items = []) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(items[items.length - 1]?.path || '/')}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items = []) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function toGraph(schema) {
  if (!schema) return null;
  const list = (Array.isArray(schema) ? schema : [schema]).filter(Boolean);
  if (!list.length) return null;
  return {
    '@context': 'https://schema.org',
    '@graph': list.map((item) => {
      const copy = { ...item };
      delete copy['@context'];
      return copy;
    }),
  };
}

export function buildMetadata({
  title,
  description,
  path = '/',
  keywords,
  image,
  type = 'website',
  robots,
  noIndex = false,
}) {
  const url = absoluteUrl(path);
  const metaTitle = title || SITE.defaultTitle;
  const metaDescription = description || SITE.defaultDescription;
  const metaImage = image ? absoluteUrl(image) : SITE.image;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords || SITE.defaultKeywords,
    alternates: {
      canonical: url,
    },
    robots: robots || (noIndex ? { index: false, follow: false } : SITE.defaultRobots),
    openGraph: {
      type,
      siteName: SITE.name,
      title: metaTitle,
      description: metaDescription,
      url,
      locale: 'en_NG',
      images: [
        {
          url: metaImage,
          secureUrl: metaImage,
          width: 1200,
          height: 630,
          alt: `${SITE.name} — branding, software and intelligent growth`,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wemraytechnology',
      creator: '@wemraytechnology',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
  };
}
