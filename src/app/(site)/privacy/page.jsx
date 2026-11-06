import LegalPage, { LEGAL_PAGES } from '../../../components/legal/LegalPage';
import JsonLd from '../../../components/seo/JsonLd';
import { absoluteUrl, breadcrumbSchema, buildMetadata, webPageSchema } from '../../../lib/seo';

const page = LEGAL_PAGES.privacy;

export const metadata = buildMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  keywords: `${page.title}, Wemray Technology legal, ${page.title} Wemray Technology`,
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <>
      <LegalPage kind="privacy" />
      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/privacy'),
            title: page.metaTitle,
            description: page.metaDescription,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: page.title, path: '/privacy' },
          ]),
        ]}
      />
    </>
  );
}
