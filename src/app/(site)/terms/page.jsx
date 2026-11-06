import LegalPage, { LEGAL_PAGES } from '../../../components/legal/LegalPage';
import JsonLd from '../../../components/seo/JsonLd';
import { absoluteUrl, breadcrumbSchema, buildMetadata, webPageSchema } from '../../../lib/seo';

const page = LEGAL_PAGES.terms;

export const metadata = buildMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  keywords: `${page.title}, Wemray Technology legal, ${page.title} Wemray Technology`,
  path: '/terms',
});

export default function TermsPage() {
  return (
    <>
      <LegalPage kind="terms" />
      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/terms'),
            title: page.metaTitle,
            description: page.metaDescription,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: page.title, path: '/terms' },
          ]),
        ]}
      />
    </>
  );
}
