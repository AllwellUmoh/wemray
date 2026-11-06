import AppLink from '../../../../../../components/ui/AppLink';
import RaySeoReport from '../../../../../../components/tools/RaySeoReport';
import { buildMetadata } from '../../../../../../lib/seo';

export const metadata = buildMetadata({
  title: 'Your RAY SEO Report | Wemray',
  description:
    'Your RAY SEO Analyser report — a Wemray single-page SEO diagnosis with prioritised, evidence-backed fixes.',
  path: '/tools/ray-seo-analyser/report',
  noIndex: true,
});

export default async function RaySeoReportPage({ params, searchParams }) {
  const { id } = await params;
  const search = await searchParams;
  const token = typeof search?.token === 'string' ? search.token : '';

  return (
    <main className="ray-report-page">
      <div className="ray-report-bg" aria-hidden="true" />
      <header className="ray-report-bar">
        <AppLink href="/" className="ray-brand" aria-label="Wemray Technology home">
          <span className="ray-brand-dot" aria-hidden="true" />
          <span className="ray-brand-name">Wemray</span>
          <span className="ray-brand-sep" aria-hidden="true" />
          <span className="ray-brand-tool">RAY SEO Analyser</span>
        </AppLink>
        <AppLink href="/tools/ray-seo-analyser" className="ray-report-new">
          Run another audit
        </AppLink>
      </header>
      <div className="ray-report-wrap">
        <RaySeoReport auditId={id} token={token} />
      </div>
    </main>
  );
}
