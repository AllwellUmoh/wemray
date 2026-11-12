import AppLink from '../../../../components/ui/AppLink';
import JsonLd from '../../../../components/seo/JsonLd';
import RaySeoForm from '../../../../components/tools/RaySeoForm';
import {
  absoluteUrl,
  breadcrumbSchema,
  buildMetadata,
  faqSchema,
  webPageSchema,
  SITE,
} from '../../../../lib/seo';

const title = 'RAY SEO Analyser | Free Single-Page SEO Audit | Wemray';
const description =
  'Run a free evidence-backed single-page SEO audit. Get a RAY diagnostic score, prioritised fixes and a PDF report by email. Not an official Google score.';

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'SEO analyser, free SEO audit tool, single page SEO checker, on-page SEO audit Nigeria, SEO report PDF, technical SEO check',
  path: '/tools/ray-seo-analyser',
});

const faqs = [
  {
    q: 'What is the RAY SEO Analyser?',
    a: 'It is a free Wemray tool that audits a single web page for on-page, technical and content SEO issues, explains the evidence, applies deterministic fixes and produces a prioritised report with a PDF.',
  },
  {
    q: 'Is the RAY Score the same as a Google score?',
    a: 'No. The RAY Score is an independent Wemray diagnostic. It is not an official Google metric and does not imply a Google penalty or guarantee rankings.',
  },
  {
    q: 'What does the audit check?',
    a: 'It checks titles, meta descriptions, headings, canonicals, robots directives, language, images, links, structured data, hreflang, indexability and — when a PageSpeed API key is configured — performance metrics.',
  },
  {
    q: 'Does it crawl my whole website?',
    a: 'No. It audits one page per request. This is stated clearly in the report and is a deliberate limitation.',
  },
  {
    q: 'How is my data handled?',
    a: 'Contact details are encrypted at rest and stored only to deliver the report, for up to 90 days. You can request deletion from the report page, and we never sell your data.',
  },
];

const webAppSchema = {
  '@type': 'WebApplication',
  '@id': `${absoluteUrl('/tools/ray-seo-analyser')}#webapp`,
  name: 'RAY SEO Analyser',
  url: absoluteUrl('/tools/ray-seo-analyser'),
  applicationCategory: 'SEO Tool',
  operatingSystem: 'Web',
  description: SITE.defaultDescription,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@id': `${SITE.url}/#organization` },
  browserRequirements: 'Requires JavaScript.',
};

export default function RaySeoAnalyserPage() {
  return (
    <>
      <section className="ray-hero band">
        <div className="ray-hero-bg" aria-hidden="true" />
        <nav className="sp-bc" aria-label="Breadcrumb">
          <AppLink href="/tools/ray-seo-analyser">Tools</AppLink>
          <i>/</i>
          <span>RAY SEO Analyser</span>
        </nav>
        <div className="ray-hero-grid">
          <div className="ray-hero-copy">
            <h1>
              Audit one page. <span className="fw">Fix what matters.</span>
            </h1>
            <p className="ray-lede">
              A free single-page SEO audit with evidence-backed fixes and a PDF report by
              email. The RAY Score is a Wemray diagnostic — not an official Google score.
            </p>
          </div>

          <div className="ray-hero-form">
            <RaySeoForm />
          </div>
        </div>
      </section>

      <section className="ray-explain band">
        <div className="ray-explain-grid">
          <div>
            <span className="eb"><span className="pd" /> What you get</span>
            <h2>An honest, page-level diagnosis.</h2>
            <p>
              No vanity metrics and no page-wide guesswork. Each finding is a single,
              addressable issue with the evidence that triggered it and a specific fix.
            </p>
          </div>
          <div className="ray-cards">
            <article>
              <h3>A clear RAY Score</h3>
              <p>
                A transparent score out of 100 with a breakdown across technical,
                content, on-page, structured data, links and performance.
              </p>
            </article>
            <article>
              <h3>Prioritised findings</h3>
              <p>
                Issues ranked by severity and confidence, with the affected element,
                the reason, and the exact change to make.
              </p>
            </article>
            <article>
              <h3>Report by email</h3>
              <p>
                A shareable web report and a downloadable PDF sent to your inbox, with
                an option to resend if it does not arrive.
              </p>
            </article>
            <article>
              <h3>Honest scope</h3>
              <p>
                We clearly state that this audits one page and does not execute
                JavaScript, so you always know what the result does and does not cover.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="ray-faq band">
        <div className="ray-faq-grid">
          <div>
            <span className="eb"><span className="pd" /> Questions</span>
            <h2>Good to know.</h2>
            <p>
              Want a full-site review?{' '}
              <AppLink href="/services/seo">Explore our SEO services</AppLink> or{' '}
              <AppLink href="/contact">talk to us</AppLink>.
            </p>
          </div>
          <div className="ray-faq-list">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/tools/ray-seo-analyser'),
            title,
            description,
            type: 'WebPage',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'RAY SEO Analyser', path: '/tools/ray-seo-analyser' },
          ]),
          webAppSchema,
          faqSchema(faqs),
        ]}
      />
    </>
  );
}
