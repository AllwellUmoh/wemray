import { services } from '../data/services';
import { SITE } from '../lib/seo';

export default function sitemap() {
  const lastModified = new Date();

  const pages = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/portfolio', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/academy', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
    { path: '/tools/ray-seo-analyser', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/tools/ray-seo-analyser/crawler', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [
    ...pages.map((page) => ({
      url: `${SITE.url}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...services.map((service) => ({
      url: `${SITE.url}/services/${service.slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    })),
  ];
}
