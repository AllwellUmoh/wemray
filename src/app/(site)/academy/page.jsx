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
import { courses } from '../../../data/courses';

const title = 'Ray Academy | Digital Skills Training | Port Harcourt';
const description =
  'Ray Academy offers practical digital skills training in web development, design, WordPress, social media and data analytics in Port Harcourt, Nigeria.';

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'digital skills training Port Harcourt, web development training Nigeria, product design course Nigeria, data analytics training Port Harcourt, WordPress training Nigeria, coding bootcamp Nigeria, Ray Academy, tech training Lagos',
  path: '/academy',
});

export default function AcademyPage() {
  return (
    <>
      <AcademySections />
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
                  courseMode: course.format,
                  provider: { '@id': `${SITE.url}/academy#organization` },
                  url: absoluteUrl('/academy'),
                },
              })),
            },
          },
          faqSchema(academyFaqs),
        ]}
      />
    </>
  );
}
