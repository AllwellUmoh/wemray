import AppLink from '../../../../../components/ui/AppLink';
import JsonLd from '../../../../../components/seo/JsonLd';
import { absoluteUrl, breadcrumbSchema, buildMetadata, webPageSchema } from '../../../../../lib/seo';

const title = 'RAY SEO Analyser Crawler | How Wemray Fetches Your Page';
const description =
  'How the RAY SEO Analyser crawler works: what it fetches, how it respects your page and privacy, and what it deliberately does not do.';

export const metadata = buildMetadata({
  title,
  description,
  keywords: 'SEO crawler, what is a crawler, Wemray crawler, single page fetch, SEO audit crawler',
  path: '/tools/ray-seo-analyser/crawler',
});

export default function CrawlerPage() {
  return (
    <>
      <section className="ray-crawler band">
        <nav className="sp-bc ray-bc-dark" aria-label="Breadcrumb">
          <AppLink href="/tools/ray-seo-analyser">RAY SEO Analyser</AppLink>
          <i>/</i>
          <span>Crawler</span>
        </nav>
        <div className="ray-crawler-in">
          <h1>About the RAY SEO Analyser crawler.</h1>
          <p className="ray-lede">
            When you run an audit, our crawler fetches the single page you submit, reads
            its HTML and checks it against our rule set. This page explains exactly what
            it does, how it behaves politely, and what it does not do.
          </p>
        </div>

        <div className="ray-crawler-grid">
          <article>
            <h3>What it fetches</h3>
            <p>
              It makes one HTTP GET request for the page you submit, follows a small
              number of redirects, and reads the returned HTML. It only supports ports
              80 and 443 and refuses private or internal addresses.
            </p>
          </article>
          <article>
            <h3>How it identifies itself</h3>
            <p>
              Requests use a clear user-agent string identifying the Wemray RAY SEO
              Analyser, so you can recognise our crawler in your logs.
            </p>
          </article>
          <article>
            <h3>What it respects</h3>
            <p>
              It only fetches the page you ask about. It does not submit forms, log in,
              click through the site, or store page content beyond what is needed to
              produce and store your report.
            </p>
          </article>
          <article>
            <h3>What it does not do</h3>
            <p>
              It does not execute JavaScript, so client-rendered content may not be
              assessed. It does not crawl your whole website, and it does not guarantee
              rankings or imply a Google penalty.
            </p>
          </article>
          <article>
            <h3>Data and retention</h3>
            <p>
              We store the page URL, findings and your contact details to deliver the
              report. Contact details are encrypted at rest and kept for up to 90 days,
              and you can request deletion from your report page.
            </p>
          </article>
          <article>
            <h3>Being a good citizen</h3>
            <p>
              If you would like us to stop fetching your site, or have questions about
              the crawler, contact us and we will respond promptly.
            </p>
          </article>
        </div>

        <div className="ray-crawler-cta">
          <AppLink className="btn pur" href="/tools/ray-seo-analyser">
            Run an audit
          </AppLink>
          <AppLink className="ray-link" href="/contact">
            Contact us about the crawler
          </AppLink>
        </div>
      </section>

      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/tools/ray-seo-analyser/crawler'),
            title,
            description,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'RAY SEO Analyser', path: '/tools/ray-seo-analyser' },
            { name: 'Crawler', path: '/tools/ray-seo-analyser/crawler' },
          ]),
        ]}
      />
    </>
  );
}
