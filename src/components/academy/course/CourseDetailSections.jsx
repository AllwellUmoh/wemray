import Link from 'next/link';
import Button from '../../ui/Button';
import CourseModules from './CourseModules';
import EnrolPanel from './EnrolPanel';
import {
  deliveryLabel,
  formatLabel,
} from '../../../lib/academy/labels';
import { formatNaira } from '../../../lib/academy/pricing';
import CourseIcon from '../CourseIcon';

export default function CourseDetailSections({ course, related = [] }) {
  const formats = formatLabel(course.formats);
  const delivery = deliveryLabel(course.delivery);

  return (
    <>
      <section className="cd-hero" id="top">
        <div className="cd-hero-bg" aria-hidden="true">
          <div className="bl l1 on" />
          <div className="ov" />
          <div className="gr" />
        </div>

        <div className="cd-hero-in">
          <nav className="cd-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/academy">Ray Academy</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{course.title}</span>
          </nav>

          <div className="cd-hero-grid">
            <div className="cd-hero-copy">
              <h1>{course.title}</h1>
              <p className="cd-lead">{course.description}</p>

              <div className="cd-price-row">
                <div>
                  <span>Training fee</span>
                  <strong>{formatNaira(course.priceKobo)}</strong>
                </div>
                <p>
                  or 2 instalments of about {formatNaira(Math.ceil(course.priceKobo / 2 / 100) * 100)}.
                  Save 25% with code <b>WEMRAY25</b>.
                </p>
              </div>
            </div>

            <div className="cd-hero-side">
              <dl className="cd-facts">
                <div>
                  <dt>Duration</dt>
                  <dd>{course.duration}</dd>
                </div>
                <div>
                  <dt>Classes</dt>
                  <dd>{course.classes}</dd>
                </div>
                <div>
                  <dt>Mode</dt>
                  <dd>{formats}</dd>
                </div>
                <div>
                  <dt>Schedule</dt>
                  <dd>{delivery}</dd>
                </div>
                <div>
                  <dt>Certificate</dt>
                  <dd>{course.certificate}</dd>
                </div>
                <div>
                  <dt>Modules</dt>
                  <dd>{course.modules.length}</dd>
                </div>
              </dl>
              <Button href="#enrol" variant="pur" arrow>
                Enrol now
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="cd-body">
        <div className="cd-body-in">
          <div className="cd-main">
            {course.outcome ? (
              <div className="cd-outcome">
                <p className="ab-eb"><i />What you leave with</p>
                <p>{course.outcome}</p>
              </div>
            ) : null}

            <CourseModules modules={course.modules} courseTitle={course.title} />
          </div>

          <aside className="cd-aside">
            <EnrolPanel course={course} />
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="cd-related">
          <div className="ac-hd">
            <div>
              <p className="ab-eb rv"><i />Same track</p>
              <h2 className="rv">Other <span>{course.track}</span> courses</h2>
            </div>
            <div className="rv">
              <Button to="/academy#tracks" variant="line" arrow>
                All courses
              </Button>
            </div>
          </div>
          <div className="cd-related-grid">
            {related.map((item) => (
              <Link className="cd-related-card" href={`/academy/courses/${item.slug}`} key={item.slug}>
                <span className="cd-related-ic" aria-hidden="true">
                  <CourseIcon name={item.icon} />
                </span>
                <b>{item.title}</b>
                <small>{item.duration} · {formatLabel(item.formats)}</small>
                <span className="cd-related-fee">{formatNaira(item.priceKobo)}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
