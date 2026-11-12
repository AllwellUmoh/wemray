import { services } from '../data/services';
import { SITE } from '../lib/seo';
import { listCourseSitemapEntries } from '../lib/academy/courses';
import { projects } from '../data/projects';

export const revalidate = 3600;

function absoluteImageUrl(imagePath) {
  return imagePath ? new URL(imagePath, SITE.url).toString() : undefined;
}

export default async function sitemap() {
  const pages = [
    '/',
    '/about',
    '/services',
    '/academy',
    '/contact',
    '/tools/ray-seo-analyser',
    '/tools/ray-seo-analyser/crawler',
    '/privacy',
    '/terms',
  ];

  // Academy courses come from the database. A missing table must not break
  // the sitemap, so fall back to the core pages.
  let courseEntries = [];
  try {
    courseEntries = await listCourseSitemapEntries();
  } catch (error) {
    console.error('Sitemap could not load academy courses', error);
  }

  return [
    ...pages.map((path) => ({ url: `${SITE.url}${path}` })),
    ...services.map((service) => ({
      url: `${SITE.url}/services/${service.slug}`,
      images: service.hero?.main ? [absoluteImageUrl(service.hero.main)] : undefined,
    })),
    {
      url: `${SITE.url}/portfolio`,
      images: projects.map((project) => absoluteImageUrl(project.image)),
    },
    ...courseEntries.map((course) => ({
      url: `${SITE.url}/academy/courses/${course.slug}`,
      lastModified: course.lastModified,
      images: course.imageUrl ? [absoluteImageUrl(course.imageUrl)] : undefined,
    })),
  ];
}
