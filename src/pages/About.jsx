import AboutSections from '../components/about/sections';
import useAboutEffects from '../hooks/useAboutEffects';
import usePageMeta from '../lib/usePageMeta';

export default function About() {
  usePageMeta({
    title: 'About Wemray Technology | Digital Agency in Nigeria & UK',
    description:
      'Meet Wemray Technology, a branding, web design and software agency in Port Harcourt, Nigeria, serving Lagos, London, the UK and Canada.',
    keywords:
      'about Wemray Technology, digital agency Port Harcourt, branding agency Nigeria, software company Lagos, technology company London UK, digital agency Canada, web design company Nigeria',
    schemaType: 'AboutPage',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ],
  });
  useAboutEffects();
  return <AboutSections />;
}
