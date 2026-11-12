import AcademySections from '../../../components/academy/sections';
import JsonLd from '../../../components/seo/JsonLd';
import {
  absoluteUrl,
  breadcrumbSchema,
  buildMetadata,
  faqSchema,
  SITE,
  webPageSchema,
} from '../../../lib/seo';
import { academyFaqs } from '../../../data/faqs';
import { listCourses } from '../../../lib/academy/courses';

const title = 'Ray Academy | Digital Skills Training | Port Harcourt';
const description =
  'Ray Academy offers practical digital skills training in web development, design, AI, WordPress, social media and data analytics in Port Harcourt, Nigeria.';

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'digital skills training Port Harcourt, web development training Nigeria, artificial intelligence course Nigeria, product design course Nigeria, data analytics training Port Harcourt, WordPress training Nigeria, coding bootcamp Nigeria, Ray Academy, tech training Lagos',
  path: '/academy',
});

export const revalidate = 60;

export default async function AcademyPage() {
  // Course data now comes from the database. If the academy tables are not
  // in place yet the page still renders — the grid simply shows nothing.
  let courses = [];
  try {
    courses = await listCourses();
  } catch (error) {
    console.error('Academy page could not load courses', error);
  }

  return (
    <>
      <AcademySections courses={courses} />
      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/academy'),
            title,
            description,
            type: 'CollectionPage',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Ray Academy', path: '/academy' },
          ]),
          {
            '@type': 'EducationalOrganization',
            '@id': `${SITE.url}/academy#organization`,
            name: 'Ray Academy',
            url: absoluteUrl('/academy'),
            description:
              'Practical digital skills training in software development, design, marketing, website management and data analytics by Wemray Technology.',
            parentOrganization: { '@id': `${SITE.url}/#organization` },
            areaServed: SITE.areasServed.map((name) => ({ '@type': 'Place', name })),
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Ray Academy courses',
              itemListElement: courses.map((course) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Course',
                  name: course.title,
                  description: course.description,
                  educationalLevel: 'Beginner to advanced',
                  inLanguage: 'en',
                  courseMode: course.formats,
                  provider: { '@id': `${SITE.url}/academy#organization` },
                  url: absoluteUrl(`/academy/courses/${course.slug}`),
                },
                price: (course.priceKobo / 100).toFixed(2),
                priceCurrency: 'NGN',
                availability: 'https://schema.org/InStock',
              })),
            },
          },
          faqSchema(academyFaqs),
        ]}
      />
    </>
  );
}
