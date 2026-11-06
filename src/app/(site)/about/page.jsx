import AboutSections from '../../../components/about/sections';
import { AboutEffects } from '../../../components/site/PageEffects';
import JsonLd from '../../../components/seo/JsonLd';
import { absoluteUrl, breadcrumbSchema, buildMetadata, webPageSchema } from '../../../lib/seo';

const title = 'About Wemray Technology | Digital Agency in Nigeria & UK';
const description =
  'Meet Wemray Technology, a branding, web design and software agency in Port Harcourt, Nigeria, serving Lagos, London, the UK and Canada.';

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'about Wemray Technology, digital agency Port Harcourt, branding agency Nigeria, software company Lagos, technology company London UK, digital agency Canada, web design company Nigeria',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <AboutEffects />
      <AboutSections />
      <JsonLd
        data={[
          webPageSchema({ url: absoluteUrl('/about'), title, description, type: 'AboutPage' }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />
    </>
  );
}
