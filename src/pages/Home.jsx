import HomeSections from '../components/home/sections';
import useHomeEffects from '../hooks/useHomeEffects';
import usePageMeta from '../lib/usePageMeta';

export default function Home() {
  usePageMeta({
    title: 'Wemray Technology | Branding, Software & AI | Port Harcourt',
    description:
      'Branding, web design & software company in Port Harcourt, Nigeria, serving Lagos, London, the UK and Canada. Websites, apps, AI and automation for growth.',
    keywords:
      'software development company Port Harcourt, web design company Port Harcourt, branding agency Nigeria, digital agency Lagos, technology company London UK, digital agency Canada, AI automation Nigeria, website design Nigeria, custom software Port Harcourt',
  });
  useHomeEffects();
  return <HomeSections />;
}
