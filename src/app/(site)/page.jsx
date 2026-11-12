import HomeSections from '../../components/home/sections';
import { HomeEffects } from '../../components/site/PageEffects';
import JsonLd from '../../components/seo/JsonLd';
import { absoluteUrl, buildMetadata, webPageSchema } from '../../lib/seo';

const title = 'Wemray Technology | Branding, Software & AI | Port Harcourt';
const description =
  'Branding, web design & software company in Port Harcourt, Nigeria, serving Lagos, London, the UK and Canada. Websites, apps, AI and automation for growth.';

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'software development company Port Harcourt, web design company Port Harcourt, branding agency Nigeria, digital agency Lagos, technology company London UK, digital agency Canada, AI automation Nigeria, website design Nigeria, custom software Port Harcourt',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <HomeEffects />
      <HomeSections />
      <JsonLd
        data={webPageSchema({
          url: absoluteUrl('/'),
          title,
          description,
        })}
      />
    </>
  );
}
