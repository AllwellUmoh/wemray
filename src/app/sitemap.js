import { services } from '../data/services';
import { SITE } from '../lib/seo';
import { listCourseSitemapEntries } from '../lib/academy/courses';
import { projects } from '../data/projects';
import { listEventSitemapEntries } from '../lib/events';

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
    '/events',
    '/contact',
    '/tools/ray-seo-analyser',
    '/tools/ray-seo-analyser/crawler',
    '/privacy',
    '/terms',
  ];

  // Database-backed content must never break the core sitemap pages.
  let courseEntries = [];
  let eventEntries = [];
  const [coursesResult, eventsResult] = await Promise.allSettled([
    listCourseSitemapEntries(),
    listEventSitemapEntries(),
  ]);
  if (coursesResult.status === 'fulfilled') courseEntries = coursesResult.value;
  else console.error('Sitemap could not load academy courses', coursesResult.reason);
  if (eventsResult.status === 'fulfilled') eventEntries = eventsResult.value;
  else console.error('Sitemap could not load events', eventsResult.reason);

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
    ...eventEntries.map((event) => ({
      url: `${SITE.url}/events/${event.slug}`,
      lastModified: event.updated_at || undefined,
      images: event.flyer_url ? [absoluteImageUrl(event.flyer_url)] : undefined,
    })),
  ];
}
