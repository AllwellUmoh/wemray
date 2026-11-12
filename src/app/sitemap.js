import { services } from '../data/services';
import { SITE } from '../lib/seo';
import { listCourseSlugs } from '../lib/academy/courses';

export const revalidate = 3600;

export default async function sitemap() {
  const lastModified = new Date();

  const pages = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/portfolio', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/academy', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
    { path: '/tools/ray-seo-analyser', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/tools/ray-seo-analyser/crawler', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Academy courses come from the database. A missing table must not break
  // the sitemap, so fall back to the core pages.
  let courseSlugs = [];
  try {
    courseSlugs = await listCourseSlugs();
  } catch (error) {
    console.error('Sitemap could not load academy courses', error);
  }

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
    ...courseSlugs.map((slug) => ({
      url: `${SITE.url}/academy/courses/${slug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
