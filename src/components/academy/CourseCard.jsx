import Link from 'next/link';
import Image from 'next/image';
import Button from '../ui/Button';
import CourseIcon, { FORMAT_ICONS } from './CourseIcon';
import { deliveryLabel, formatLabel } from '../../lib/academy/labels';
import { formatNaira } from '../../lib/academy/pricing';

export default function CourseCard({ course, index = 0 }) {
  const formats = course.formats?.length ? course.formats : [course.format || 'Online'];
  const primaryFormat = formats[0];
  const label = formatLabel(formats);
  const delivery = deliveryLabel(course.delivery || []);

  return (
    <article className="course-card" style={{ '--i': index }}>
      <Link
        className="course-image"
        href={`/academy/courses/${course.slug}`}
        aria-label={`Explore ${course.title}`}
      >
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <span className="course-image-placeholder" aria-hidden="true">
            <CourseIcon name={course.icon} />
          </span>
        )}
      </Link>

      <div className="course-content">
        <h3>
          <Link href={`/academy/courses/${course.slug}`}>{course.title}</Link>
        </h3>

        <div className="course-meta">
          <span className={`course-format format-${primaryFormat.toLowerCase()}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {FORMAT_ICONS[primaryFormat]}
            </svg>
            {label}
          </span>
          {course.duration ? <span className="course-duration">{course.duration}</span> : null}
        </div>

        {delivery ? <p className="course-delivery">{delivery} classes</p> : null}

        <div className="course-actions">
          {course.priceKobo ? <span className="course-price">{formatNaira(course.priceKobo)}</span> : null}
          <Button to={`/academy/courses/${course.slug}#enrol`} variant="pur" arrow>
            Enrol
          </Button>
        </div>
      </div>
    </article>
  );
}
