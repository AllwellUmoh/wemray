import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE = {
  name: 'Wemray Technology',
  url: 'https://wemray.com',
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

function upsertMeta(attribute, key, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function normalizePath(pathname) {
  const path = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return path || '/';
}

function toGraph(schema) {
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

export default function usePageMeta(titleOrOptions, description, options = {}) {
  const location = useLocation();
  const config =
    typeof titleOrOptions === 'string'
      ? { title: titleOrOptions, description, ...options }
      : titleOrOptions || {};

  const path = normalizePath(config.path || location.pathname);
  const url = absoluteUrl(path);
  const title = config.title || SITE.defaultTitle;
  const metaDescription = config.description || SITE.defaultDescription;
  const keywords = config.keywords || SITE.defaultKeywords;
  const image = config.image ? absoluteUrl(config.image) : SITE.image;
  const type = config.type || 'website';
  const robots = config.robots || SITE.defaultRobots;

  let schema = config.jsonLd;
  if (!schema) {
    schema = [
      webPageSchema({
        url,
        title,
        description: metaDescription,
        type: config.schemaType || 'WebPage',
        image,
      }),
      config.breadcrumb ? breadcrumbSchema(config.breadcrumb) : null,
      ...(config.extraSchema
        ? Array.isArray(config.extraSchema)
          ? config.extraSchema
          : [config.extraSchema]
        : []),
    ].filter(Boolean);
  }

  const schemaKey = JSON.stringify(toGraph(schema));

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = 'en';

    upsertMeta('name', 'description', metaDescription);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'author', SITE.name);
    upsertMeta('name', 'theme-color', '#000066');

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE.name);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', metaDescription);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:secure_url', image);
    upsertMeta('property', 'og:image:type', 'image/jpeg');
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:image:alt', `${SITE.name} — branding, software and intelligent growth`);
    upsertMeta('property', 'og:locale', 'en_NG');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:site', '@wemraytechnology');
    upsertMeta('name', 'twitter:creator', '@wemraytechnology');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', metaDescription);
    upsertMeta('name', 'twitter:image', image);
    upsertMeta('name', 'twitter:image:alt', `${SITE.name} — branding, software and intelligent growth`);

    upsertCanonical(url);

    let script = document.getElementById('page-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'page-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = schemaKey;
  }, [title, metaDescription, keywords, robots, type, url, image, schemaKey]);
}
