import AcademySections from '../components/academy/sections';
import usePageMeta, { absoluteUrl, faqSchema, SITE } from '../lib/usePageMeta';
import { academyFaqs } from '../data/faqs';
import { courses } from '../data/courses';

export default function Academy() {
  usePageMeta({
    title: 'Ray Academy | Digital Skills Training | Port Harcourt',
    description:
      'Ray Academy offers practical digital skills training in web development, design, WordPress, social media and data analytics in Port Harcourt, Nigeria.',
    keywords:
      'digital skills training Port Harcourt, web development training Nigeria, product design course Nigeria, data analytics training Port Harcourt, WordPress training Nigeria, coding bootcamp Nigeria, Ray Academy, tech training Lagos',
    schemaType: 'CollectionPage',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Ray Academy', path: '/academy' },
    ],
    extraSchema: [
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
    ],
  });
  return <AcademySections />;
}
