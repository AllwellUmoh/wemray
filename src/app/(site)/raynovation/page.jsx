import JsonLd from '../../../components/seo/JsonLd';
import Link from 'next/link';
import {
  absoluteUrl,
  breadcrumbSchema,
  buildMetadata,
  webPageSchema,
} from '../../../lib/seo';

const title = 'Raynovation 1.0 | Wemray Technology';
const description =
  'Apply for Raynovation 1.0, a special training program by Wemray Technology and Nexab Solutions Ltd, starting February 1, 2027.';

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'Raynovation 1.0, technology training program, digital skills training Nigeria, Wemray Academy, Nexab Solutions',
  path: '/raynovation',
});

export default function RaynovationPage() {
  return (
    <main className="raynovation-page">
      <section className="rn-hero" aria-labelledby="rn-title">
        <div className="rn-hero-copy">
          <p className="rn-partners">
            <span>Wemray Technology</span>
            <i aria-hidden="true">×</i>
            <span>Nexab Solutions Ltd</span>
          </p>
          <p className="rn-kicker">Build skills for what comes next</p>
          <h1 id="rn-title">
            <span className="rn-word"><b>RAY</b><span>NOVATION</span></span>
            <span className="rn-version">1.0</span>
          </h1>
          <p className="rn-intro">
            A special training program for people ready to explore technology, build practical
            skills, and turn new ideas into useful work.
          </p>
          <p className="rn-date"><span>Starts</span> February <b>1, 2027</b></p>
          <div className="rn-actions">
            <Link className="btn pur" href="/raynovation/apply">Apply now</Link>
            <a
              className="btn line"
              href="mailto:hello@wemray.com?subject=Raynovation%201.0%20updates"
            >
              Get updates
            </a>
          </div>
        </div>

        <figure className="rn-poster">
          <div className="rn-poster-art">
            <img
              src="/images/raynovation-poster.jpg"
              alt="Raynovation 1.0 poster by Wemray Technology and Nexab Solutions Ltd"
              fetchPriority="high"
            />
          </div>
          <figcaption>Raynovation 1.0 · February 1, 2027</figcaption>
        </figure>
      </section>

      <section className="rn-program" id="program" aria-labelledby="rn-program-title">
        <div className="rn-program-heading">
          <p className="rn-kicker">The program</p>
          <h2 id="rn-program-title">Learn practical skills.<br /><span>Use them to build.</span></h2>
        </div>
        <div className="rn-program-copy">
          <p>
            Raynovation 1.0 is a special technology training program by Wemray Technology in
            partnership with Nexab Solutions Ltd. It is for curious people who want to gain
            practical skills and use technology to solve real problems.
          </p>
          <p>
            The program starts February 1, 2027. Apply now to share your interests and choose
            the training track that fits your goals.
          </p>
        </div>
      </section>

      <section className="rn-pillars" aria-label="Raynovation program themes">
        <article>
          <h3>Explore</h3>
          <p>Get curious about technology and the ways it can help people and businesses.</p>
        </article>
        <article>
          <h3>Build</h3>
          <p>Develop practical skills that help turn ideas and digital tools into useful work.</p>
        </article>
        <article>
          <h3>Apply</h3>
          <p>Use what you learn to take on real projects, contribute to teams, and pursue new opportunities.</p>
        </article>
      </section>

      <section className="rn-cta" aria-labelledby="rn-cta-title">
        <div>
          <p className="rn-kicker">February 1, 2027</p>
          <h2 id="rn-cta-title">Be ready for Raynovation.</h2>
          <p>Complete the application form to tell us about yourself and choose a training track for the February 1 start.</p>
        </div>
        <Link className="btn pur" href="/raynovation/apply">Start your application</Link>
      </section>

      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/raynovation'),
            title,
            description,
            type: 'WebPage',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Academy', path: '/academy' },
            { name: 'Raynovation', path: '/raynovation' },
          ]),
        ]}
      />
    </main>
  );
}
