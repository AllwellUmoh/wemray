import ContactSections from '../../../components/contact/sections';
import JsonLd from '../../../components/seo/JsonLd';
import {
  absoluteUrl,
  breadcrumbSchema,
  buildMetadata,
  faqSchema,
  webPageSchema,
} from '../../../lib/seo';
import { contactFaqs } from '../../../data/faqs';
import { courses } from '../../../data/courses';
import { SERVICE_VALUES } from '../../../lib/contact-options';

const title = 'Contact Wemray Technology | Port Harcourt, Nigeria & Global';
const description =
  'Talk to Wemray Technology about branding, web design, software, AI or training. Based in Port Harcourt, serving Lagos, London, the UK and Canada.';

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'contact Wemray Technology, software company Port Harcourt contact, web design agency Nigeria contact, digital agency London UK, technology company Canada, book a consultation Nigeria',
  path: '/contact',
});

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const serviceSlug = typeof params?.service === 'string' ? params.service : '';
  const courseSlug = typeof params?.course === 'string' ? params.course : '';
  const course = courses.find((item) => item.slug === courseSlug);

  const defaults = {
    service: SERVICE_VALUES[serviceSlug] || '',
    details: course ? `Course of interest: ${course.title} (${course.track})` : '',
  };

  return (
    <>
      <ContactSections defaults={defaults} />
      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/contact'),
            title,
            description,
            type: 'ContactPage',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
          faqSchema(contactFaqs),
        ]}
      />
    </>
  );
}
