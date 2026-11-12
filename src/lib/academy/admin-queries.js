import { query } from '../db';

/* ------------------------------------------------------------------ *
 * Admin-facing queries for the academy area (phase 2 surface, but the
 * read functions live here so the pages stay thin).
 * ------------------------------------------------------------------ */

export const ENROLMENT_PAGE_SIZE = 20;

export const ENROLMENT_STATUSES = [
  'pending',
  'part_paid',
  'paid',
  'failed',
  'abandoned',
  'refunded',
];

export async function getEnrolmentCounts() {
  const result = await query(
    `select status, count(*)::int as count
     from academy_enrolments
     group by status`,
  );

  const counts = Object.fromEntries(ENROLMENT_STATUSES.map((status) => [status, 0]));
  let total = 0;
  for (const row of result.rows) {
    counts[row.status] = row.count;
    total += row.count;
  }

  const revenue = await query(
    `select coalesce(sum(amount_paid_kobo), 0)::bigint as collected
     from academy_enrolments
     where status in ('paid', 'part_paid')`,
  );

  return { counts, total, collectedKobo: Number(revenue.rows[0]?.collected || 0) };
}

export async function listEnrolments({ page = 1, status = '', course = '' } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * ENROLMENT_PAGE_SIZE;
  const validStatus = ENROLMENT_STATUSES.includes(status) ? status : '';

  const params = [];
  const clauses = [];

  if (validStatus) {
    params.push(validStatus);
    clauses.push(`status = $${params.length}`);
  }
  if (course) {
    params.push(course);
    clauses.push(`course_slug = $${params.length}`);
  }

  const where = clauses.length ? `where ${clauses.join(' and ')}` : '';

  const countResult = await query(
    `select count(*)::int as total from academy_enrolments ${where}`,
    params,
  );

  const listParams = [...params, ENROLMENT_PAGE_SIZE, offset];
  const result = await query(
    `select id, reference, course_slug, course_title, full_name, email, phone, plan,
            total_kobo, amount_paid_kobo, currency, status, coupon_code,
            welcome_email_sent_at, created_at
     from academy_enrolments
     ${where}
     order by created_at desc
     limit $${listParams.length - 1} offset $${listParams.length}`,
    listParams,
  );

  const total = countResult.rows[0]?.total || 0;

  return {
    rows: result.rows,
    total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(total / ENROLMENT_PAGE_SIZE)),
    status: validStatus,
    course,
  };
}

export async function getEnrolmentDetail(id) {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;

  const result = await query(
    `select e.*, c.slug as course_current_slug, c.title as course_current_title,
            c.duration, c.classes, c.certificate, t.label as track_label
     from academy_enrolments e
     left join academy_courses c on c.id = e.course_id
     left join academy_tracks t on t.key = c.track_key
     where e.id = $1`,
    [numericId],
  );

  const enrolment = result.rows[0];
  if (!enrolment) return null;

  const payments = await query(
    `select id, reference, installment_no, amount_kobo, status, channel,
            gateway_response, verified_at, created_at
     from academy_enrolment_payments
     where enrolment_id = $1
     order by installment_no, created_at`,
    [numericId],
  );

  return { ...enrolment, payments: payments.rows };
}

export async function listAllCoursesAdmin() {
  const result = await query(
    `select c.id, c.slug, c.number, c.title, c.track_key, c.formats, c.delivery,
            c.duration, c.classes, c.certificate, c.price_kobo, c.is_active,
            t.label as track_label,
            (select count(*)::int from academy_course_modules m where m.course_id = c.id) as module_count,
            (select count(*)::int from academy_enrolments e
              where e.course_slug = c.slug and e.status in ('paid', 'part_paid')) as enrolment_count
     from academy_courses c
     join academy_tracks t on t.key = c.track_key
     order by c.created_at desc, c.id desc`,
  );
  return result.rows;
}

export async function listTracksAdmin() {
  const result = await query(
    `select t.key, t.label, t.description, t.sort_order,
            count(c.id)::int as course_count
     from academy_tracks t
     left join academy_courses c on c.track_key = t.key
     group by t.id, t.key, t.label, t.description, t.sort_order
     order by t.sort_order, t.label`,
  );
  return result.rows;
}

export async function getTrackForAdmin(key) {
  const result = await query(
    `select key, label, description, sort_order
     from academy_tracks where key = $1`,
    [key],
  );
  return result.rows[0] || null;
}

export async function getCourseForAdmin(id) {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;

  const courseResult = await query(
    `select c.*, t.label as track_label
     from academy_courses c
     join academy_tracks t on t.key = c.track_key
     where c.id = $1`,
    [numericId],
  );

  const course = courseResult.rows[0];
  if (!course) return null;

  const modulesResult = await query(
    `select id, number, title, summary, topics, sort_order
     from academy_course_modules
     where course_id = $1
     order by sort_order, number`,
    [numericId],
  );

  return {
    ...course,
    modules: modulesResult.rows.map((module) => ({
      ...module,
      topics: Array.isArray(module.topics) ? module.topics : [],
    })),
  };
}

export async function updateEnrolmentStatus(id, status) {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;
  if (!ENROLMENT_STATUSES.includes(status)) return null;

  const result = await query(
    `update academy_enrolments
     set status = $2, updated_at = now()
     where id = $1
     returning *`,
    [numericId, status],
  );

  return result.rows[0] || null;
}

export async function setCourseActive(slug, isActive) {
  const result = await query(
    `update academy_courses
     set is_active = $2, updated_at = now()
     where slug = $1
     returning slug, is_active`,
    [slug, Boolean(isActive)],
  );
  return result.rows[0] || null;
}
