import { query } from '../db';
import { deliveryLabel, formatLabel } from './labels';

export { deliveryLabel, formatLabel };

/* ------------------------------------------------------------------ *
 * Database access for Ray Academy courses.
 *
 * Everything here is server-only. The public site reads courses through
 * these functions, so the database is the single source of truth for the
 * academy catalogue.
 * ------------------------------------------------------------------ */

const COURSE_COLUMNS = `
  c.id, c.slug, c.number, c.title, c.track_key, c.formats, c.delivery,
  c.duration, c.classes, c.certificate, c.description, c.outcome,
  c.price_kobo, c.icon, to_jsonb(c)->>'image_url' as image_url, c.is_active,
  t.label as track_label`;

function mapCourse(row) {
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    number: row.number,
    title: row.title,
    trackKey: row.track_key,
    track: row.track_label,
    formats: row.formats || [],
    delivery: row.delivery || [],
    // Backwards compatible alias for components written against the old shape.
    format: (row.formats || [])[0] || 'Online',
    duration: row.duration,
    classes: row.classes,
    certificate: row.certificate,
    description: row.description,
    outcome: row.outcome,
    priceKobo: Number(row.price_kobo) || 0,
    price: (Number(row.price_kobo) || 0) / 100,
    icon: row.icon,
    imageUrl: row.image_url || '',
    isActive: row.is_active,
  };
}

export async function listTracks() {
  const result = await query(
    `select key, label, description, sort_order
     from academy_tracks
     order by sort_order, label`,
  );
  return result.rows;
}

export async function listCourses({ activeOnly = true } = {}) {
  const result = await query(
    `select ${COURSE_COLUMNS}
     from academy_courses c
     join academy_tracks t on t.key = c.track_key
     ${activeOnly ? 'where c.is_active' : ''}
     order by c.created_at desc, c.id desc`,
  );
  return result.rows.map(mapCourse);
}

export async function getCourseBySlug(slug) {
  if (!slug) return null;

  const result = await query(
    `select ${COURSE_COLUMNS}
     from academy_courses c
     join academy_tracks t on t.key = c.track_key
     where (c.slug = $1 or exists (
       select 1 from academy_course_slug_history h
       where h.slug = $1 and h.course_id = c.id
     )) and c.is_active
     order by (c.slug = $1) desc
     limit 1`,
    [slug],
  );

  return mapCourse(result.rows[0]);
}

export async function listCourseModules(courseId) {
  const result = await query(
    `select id, number, title, summary, topics, sort_order
     from academy_course_modules
     where course_id = $1
     order by sort_order, number`,
    [courseId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    number: row.number,
    title: row.title,
    summary: row.summary,
    topics: Array.isArray(row.topics) ? row.topics : [],
  }));
}

/** Course plus its modules — what the detail page needs. */
export async function getCourseDetail(slug) {
  const course = await getCourseBySlug(slug);
  if (!course) return null;
  const modules = await listCourseModules(course.id);
  return { ...course, modules };
}

/** Track counts for the filter row, including an "all" bucket. */
export async function getTrackCounts() {
  const [tracks, counts] = await Promise.all([
    listTracks(),
    query(
      `select track_key, count(*)::int as count
       from academy_courses
       where is_active
       group by track_key`,
    ),
  ]);

  const byKey = Object.fromEntries(counts.rows.map((row) => [row.track_key, row.count]));
  const total = counts.rows.reduce((sum, row) => sum + row.count, 0);

  return [
    { key: 'all', label: 'All courses', count: total },
    ...tracks.map((track) => ({
      key: track.key,
      label: track.label,
      count: byKey[track.key] || 0,
    })),
  ];
}

/** Slugs only — used by the sitemap and generateStaticParams. */
export async function listCourseSlugs() {
  const result = await query(
    `select slug from academy_courses where is_active order by created_at desc, id desc`,
  );
  return result.rows.map((row) => row.slug);
}

/** Active course sitemap data, including only values safe to publish. */
export async function listCourseSitemapEntries() {
  const result = await query(
    `select slug, updated_at, image_url
     from academy_courses
     where is_active
     order by created_at desc, id desc`,
  );

  return result.rows.map((row) => ({
    slug: row.slug,
    lastModified: row.updated_at || undefined,
    imageUrl: row.image_url || '',
  }));
}

/** Light payload for the Ray assistant — keeps the client bundle small. */
export async function listCoursesForAssistant() {
  const result = await query(
    `select c.slug, c.title, c.track_key, c.formats, c.delivery, c.duration, c.price_kobo,
            t.label as track_label
     from academy_courses c
     join academy_tracks t on t.key = c.track_key
     where c.is_active
     order by c.created_at desc, c.id desc`,
  );

  return result.rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    trackKey: row.track_key,
    track: row.track_label,
    format: formatLabel(row.formats || []),
    delivery: deliveryLabel(row.delivery || []),
    duration: row.duration,
    price: (Number(row.price_kobo) || 0) / 100,
  }));
}
