import { notFound, permanentRedirect } from 'next/navigation';
import CourseDetailSections from '../../../../../components/academy/course/CourseDetailSections';
import JsonLd from '../../../../../components/seo/JsonLd';
import {
  absoluteUrl,
  breadcrumbSchema,
  buildMetadata,
  SITE,
  webPageSchema,
} from '../../../../../lib/seo';
import { getCourseDetail, listCourseSlugs, listCourses } from '../../../../../lib/academy/courses';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await listCourseSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Academy generateStaticParams failed', error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  let course = null;
  try {
    course = await getCourseDetail(slug);
  } catch (error) {
    console.error('Academy course metadata failed', error);
  }

  if (!course) {
    return buildMetadata({
      title: 'Course not found | Ray Academy',
      description: 'That Ray Academy course could not be found. Browse the full course catalogue instead.',
      path: `/academy/courses/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${course.title} Course | Ray Academy`,
    description: `${course.description} ${course.duration}, ${course.classes}. Enrol online for ${course.title} at Ray Academy, Port Harcourt.`,
    keywords: `${course.title} course Port Harcourt, ${course.title} training Nigeria, learn ${course.title}, Ray Academy ${course.title}, ${course.track} course Nigeria`,
    path: `/academy/courses/${course.slug}`,
  });
}

export default async function AcademyCoursePage({ params }) {
  const { slug } = await params;

  let course = null;
  try {
    course = await getCourseDetail(slug);
  } catch (error) {
    console.error('Academy course page failed to load course', error);
  }

  if (!course) notFound();
  if (course.slug !== slug) permanentRedirect(`/academy/courses/${course.slug}`);

  let related = [];
  try {
    const all = await listCourses();
    related = all.filter((item) => item.slug !== course.slug && item.trackKey === course.trackKey).slice(0, 3);
  } catch (error) {
    console.error('Academy related courses failed', error);
  }

  const url = absoluteUrl(`/academy/courses/${course.slug}`);
  const title = `${course.title} Course | Ray Academy`;
  const description = `${course.description} ${course.duration}, ${course.classes}. Enrol online for ${course.title} at Ray Academy, Port Harcourt.`;

  return (
    <>
      <CourseDetailSections course={course} related={related} />
      <JsonLd
        data={[
          webPageSchema({ url, title, description }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Ray Academy', path: '/academy' },
            { name: course.title, path: `/academy/courses/${course.slug}` },
          ]),
          {
            '@type': 'Course',
            '@id': `${url}#course`,
            name: course.title,
            description: course.description,
            url,
            inLanguage: 'en',
            educationalLevel: 'Beginner to advanced',
            teaches: course.modules.map((module) => module.title),
            courseMode: course.formats.map((format) =>
              format === 'Onsite' ? 'Onsite' : format === 'Online' ? 'Online' : 'Blended',
            ),
            provider: { '@id': `${SITE.url}/academy#organization` },
            offers: {
              '@type': 'Offer',
              price: (course.priceKobo / 100).toFixed(2),
              priceCurrency: 'NGN',
              availability: 'https://schema.org/InStock',
              url,
              category: 'Paid course',
            },
            hasPart: course.modules.map((module) => ({
              '@type': 'CreativeWork',
              name: module.title,
              description: module.summary,
            })),
          },
        ]}
      />
    </>
  );
}
