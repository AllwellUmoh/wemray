import ContactSections from '../components/contact/sections';
import useContactEffects from '../hooks/useContactEffects';
import usePageMeta, { faqSchema } from '../lib/usePageMeta';
import { contactFaqs } from '../data/faqs';

export default function Contact() {
  usePageMeta({
    title: 'Contact Wemray Technology | Port Harcourt, Nigeria & Global',
    description:
      'Talk to Wemray Technology about branding, web design, software, AI or training. Based in Port Harcourt, serving Lagos, London, the UK and Canada.',
    keywords:
      'contact Wemray Technology, software company Port Harcourt contact, web design agency Nigeria contact, digital agency London UK, technology company Canada, book a consultation Nigeria',
    schemaType: 'ContactPage',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ],
    extraSchema: faqSchema(contactFaqs),
  });
  useContactEffects();
  return <ContactSections />;
}
