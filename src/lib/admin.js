import { query } from './db';
import { CONTACT_STATUSES } from './contact-options';

export const PAGE_SIZE = 20;

export async function getEnquiryCounts() {
  const result = await query(
    `select status, count(*)::int as count
     from contact_enquiries
     group by status`,
  );

  const counts = Object.fromEntries(CONTACT_STATUSES.map((status) => [status, 0]));
  let total = 0;
  for (const row of result.rows) {
    counts[row.status] = row.count;
    total += row.count;
  }
  return { counts, total };
}

export async function listEnquiries({ page = 1, status = '' } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * PAGE_SIZE;
  const validStatus = CONTACT_STATUSES.includes(status) ? status : '';
  const params = [];
  let where = '';

  if (validStatus) {
    params.push(validStatus);
    where = `where status = $${params.length}`;
  }

  const countResult = await query(
    `select count(*)::int as total from contact_enquiries ${where}`,
    params,
  );

  const listParams = [...params, PAGE_SIZE, offset];
  const result = await query(
    `select id, reference, name, email, organisation, service, status, intent,
            confirmation_sent_at, notification_sent_at, created_at
     from contact_enquiries
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
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    status: validStatus,
  };
}

export async function getEnquiry(id) {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;

  const result = await query(
    `select *
     from contact_enquiries
     where id = $1`,
    [numericId],
  );

  return result.rows[0] || null;
}

export async function updateEnquiry(id, { status, adminNotes }) {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;
  if (!CONTACT_STATUSES.includes(status)) return null;

  const result = await query(
    `update contact_enquiries
     set status = $2,
         admin_notes = $3,
         updated_at = now()
     where id = $1
     returning *`,
    [numericId, status, adminNotes || ''],
  );

  return result.rows[0] || null;
}

export async function listSeoAudits({ page = 1 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * PAGE_SIZE;

  const countResult = await query(
    `select count(*)::int as total from seo_audits where expires_at > now()`,
  );

  const result = await query(
    `select a.id, a.reference, a.url, a.final_url, a.status, a.overall_score, a.grade,
            a.contact_deleted_at, a.error_code, a.created_at, a.completed_at
     from seo_audits a
     where a.expires_at > now()
     order by a.created_at desc
     limit $1 offset $2`,
    [PAGE_SIZE, offset],
  );

  const total = countResult.rows[0]?.total || 0;
  return {
    rows: result.rows,
    total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getSeoAudit(id) {
  const result = await query(
    `select a.id, a.reference, a.url, a.final_url, a.status, a.progress, a.overall_score,
            a.grade, a.category_scores, a.contact_deleted_at, a.error_code,
            a.error_message, a.created_at, a.completed_at, a.expires_at,
            c.email_encrypted, c.email_hash, c.retention_until
     from seo_audits a
     left join seo_audit_contacts c on c.audit_id = a.id
     where a.id = $1`,
    [id],
  );
  const audit = result.rows[0];
  if (!audit) return null;

  return audit;
}
