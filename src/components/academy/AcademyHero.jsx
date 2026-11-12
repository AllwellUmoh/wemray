import Image from 'next/image';
import Link from 'next/link';
import PageHero from '../ui/PageHero';

const FEATURED_COURSES = [
  'introduction-to-ai',
  'frontend-development',
  'product-design',
];

function AcademyCourseCollage({ courses = [] }) {
  const bySlug = new Map(courses.map((course) => [course.slug, course]));
  const featured = FEATURED_COURSES.map((slug) => bySlug.get(slug)).filter(Boolean);
  const highlights = featured.length >= 3 ? featured : courses.slice(0, 3);

  return (
    <div className="ac-hero-visual" aria-label="Featured Ray Academy courses">
      <div className="ac-hero-orbit ac-hero-orbit-one" aria-hidden="true" />
      <div className="ac-hero-orbit ac-hero-orbit-two" aria-hidden="true" />

      {highlights.map((course, index) => (
        <Link
          className={`ac-hero-tile ac-hero-tile-${index + 1}`}
          href={`/academy/courses/${course.slug}`}
          aria-label={`Explore ${course.title}`}
          key={course.slug}
        >
          <span className="ac-hero-photo">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt=""
                fill
                sizes="(max-width: 900px) 60vw, 34vw"
                unoptimized
              />
            ) : null}
          </span>
          <span className="ac-hero-tile-copy">
            <span className="ac-hero-tile-kicker">Ray Academy</span>
            <b>{course.title}</b>
          </span>
          <span className="ac-hero-tile-arrow" aria-hidden="true">↗</span>
        </Link>
      ))}

    </div>
  );
}

export default function AcademyHero({ courses = [] }) {
  return (
    <PageHero
      lines={[
        { t: 'Learn. Create. Build.', fw: true },
      ]}
      sub="Turn Skills into Meaningful Work."
      primary={{ label: 'Explore Ray Academy', href: '#tracks', variant: 'lav' }}
      secondary={{ label: 'Enquire About Training', href: 'contact.html#form', variant: 'ghost' }}
      visual={<AcademyCourseCollage courses={courses} />}
      className="ac-h ac-hero"
    />
  );
}
