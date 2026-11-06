import { query } from './db';
import { runAudit } from './seo-audit';
import {
  createReference,
  createReportToken,
  decryptValue,
  encryptValue,
  hashToken,
} from './seo-audit/crypto';
import { getSeoConfig } from './seo-audit/config';
import { RULE_VERSION, SCORE_VERSION } from './seo-audit/constants';

const ALLOWED_STATUS = new Set(['queued', 'running', 'succeeded', 'partial', 'failed']);

function config() {
  return getSeoConfig();
}

function expiryFor(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Create the audit row, contact and consent records.
 * Returns the id, human reference and the plaintext report token (only ever
 * returned to the caller once; only the hash is stored).
 */
export async function createAudit({ input, ipHash, userAgentHash }) {
  const cfg = config();
  const reference = createReference();
  const token = createReportToken();
  const tokenHash = hashToken(token);

  const insert = await query(
    `insert into seo_audits
       (reference, url, normalized_url, status, progress, rule_version, score_version,
        ip_hash, user_agent_hash, token_hash, token_expires_at, expires_at)
     values ($1, $2, $2, 'queued', 0, $3, $4, $5, $6, $7, $8, $9)
     returning id, reference`,
    [
      reference,
      input.url,
      RULE_VERSION,
      SCORE_VERSION,
      ipHash,
      userAgentHash || null,
      tokenHash,
      expiryFor(cfg.tokenTtlDays),
      expiryFor(cfg.auditRetentionDays),
    ],
  );

  const auditId = insert.rows[0].id;

  await query(
    `insert into seo_audit_contacts
       (audit_id, first_name_encrypted, first_name_hash, email_encrypted, email_hash, retention_until)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      auditId,
      encryptValue(input.firstName || ''),
      input.firstNameHash || '',
      encryptValue(input.email),
      input.emailHash,
      expiryFor(cfg.auditRetentionDays),
    ],
  );

  await query(
    `insert into seo_consent_records
       (audit_id, purpose, consent_version, granted, source)
     values
       ($1, 'report_delivery', $2, true, 'ray-seo-analyser'),
       ($1, 'marketing', $2, $3, 'ray-seo-analyser')
     on conflict (audit_id, purpose) do nothing`,
    [auditId, input.consentVersion, Boolean(input.marketingConsent)],
  );

  return { auditId, reference, token };
}

async function setStatus(auditId, status, fields = {}) {
  if (!ALLOWED_STATUS.has(status)) {
    throw new Error(`Unsupported audit status: ${status}`);
  }
  const sets = ['status = $2'];
  const params = [auditId, status];
  let index = 3;
  for (const [column, value] of Object.entries(fields)) {
    sets.push(`${column} = $${index}`);
    params.push(value);
    index += 1;
  }
  await query(`update seo_audits set ${sets.join(', ')} where id = $1`, params);
}

/**
 * Execute the audit for an already-created audit row and persist the result.
 * Used by both the synchronous (serverless) and background (persistent) wrappers.
 */
export async function processAudit(auditId, { url, reference }) {
  await setStatus(auditId, 'running', { started_at: new Date() });

  const progress = async (value) => {
    try {
      await query('update seo_audits set progress = $2 where id = $1', [auditId, value]);
    } catch (error) {
      console.error('Failed to update audit progress', error);
    }
  };

  try {
    const { report, page } = await runAudit({ url, reference, onProgress: progress });

    await query(
      `insert into seo_audit_pages
         (audit_id, url, final_url, http_status, content_type, bytes, fetch_ms,
          title, meta_description, canonical, lang, robots_directives, word_count, data)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       on conflict (audit_id) do nothing`,
      [
        auditId,
        page.url,
        page.finalUrl,
        page.status,
        page.contentType || '',
        page.bytes || null,
        page.fetchMs || null,
        page.title || '',
        page.description || '',
        page.canonical || '',
        page.lang || '',
        page.robotsDirectives || '',
        page.wordCount || 0,
        JSON.stringify({
          h1Count: page.h1s.length,
          imageCount: page.images.length,
          linkCount: page.links.length,
          structuredDataBlocks: page.jsonLd.length,
          hreflangLinks: page.hreflang.length,
        }),
      ],
    );

    const issues = report.issues || [];
    if (issues.length) {
      const values = [];
      const rows = [];
      let i = 1;
      for (const issue of issues) {
        rows.push(
          `($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`,
        );
        values.push(
          auditId,
          issue.ruleId,
          issue.category,
          issue.severity,
          issue.confidence,
          issue.title,
          issue.description || '',
          issue.fix || '',
          JSON.stringify(issue.evidence || {}),
          issue.affectedUrl || page.finalUrl || '',
        );
      }
      await query(
        `insert into seo_audit_issues
           (audit_id, rule_id, category, severity, confidence, title,
            description, fix, evidence, affected_url)
         values ${rows.join(', ')}`,
        values,
      );
    }

    await setStatus(auditId, 'succeeded', {
      progress: 100,
      final_url: report.finalUrl,
      overall_score: report.score?.overall ?? null,
      grade: report.score?.grade ?? null,
      category_scores: JSON.stringify(report.score?.categories ?? []),
      report: JSON.stringify(report),
      completed_at: new Date(),
    });

    return { ok: true, report };
  } catch (error) {
    const code = error?.code || 'audit_failed';
    const message =
      error?.publicMessage || error?.message || 'The audit could not be completed.';

    await setStatus(auditId, 'failed', {
      error_code: code,
      error_message: message,
      completed_at: new Date(),
    });

    return { ok: false, error: { code, message } };
  }
}

export async function getAuditById(auditId) {
  const result = await query(
    `select id, reference, url, final_url, status, progress, overall_score, grade,
            category_scores, rule_version, score_version, error_code, error_message,
            email_status, contact_deleted_at, created_at, completed_at
     from seo_audits
     where id = $1 and expires_at > now()`,
    [auditId],
  );
  return result.rows[0] || null;
}

export async function getAuditReport(auditId) {
  const result = await query(
    `select id, reference, url, final_url, status, progress, report, overall_score,
            grade, category_scores, email_status, created_at, completed_at, expires_at
     from seo_audits
     where id = $1 and expires_at > now()`,
    [auditId],
  );
  return result.rows[0] || null;
}

/**
 * Verify a report token against the stored hash (constant-time) and expiry.
 */
export async function authorizeAuditToken(auditId, token) {
  if (!token) return false;
  const result = await query(
    `select token_hash, token_expires_at
     from seo_audits
     where id = $1 and expires_at > now()`,
    [auditId],
  );
  const row = result.rows[0];
  if (!row) return false;
  const provided = hashToken(token);
  if (provided.length !== row.token_hash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i += 1) {
    mismatch |= provided.charCodeAt(i) ^ row.token_hash.charCodeAt(i);
  }
  if (mismatch !== 0) return false;
  return new Date(row.token_expires_at).getTime() > Date.now();
}

export async function setEmailStatus(auditId, status) {
  await query('update seo_audits set email_status = $2 where id = $1', [auditId, status]);
}

export async function deleteContact(auditId) {
  await query(
    `update seo_audit_contacts
     set email_encrypted = '', first_name_encrypted = ''
     where audit_id = $1`,
    [auditId],
  );
  await query(
    `update seo_audits
     set contact_deleted_at = now(), email_status = 'skipped'
     where id = $1`,
    [auditId],
  );
}

/**
 * Decrypt and return the contact name/email for an audit, or null when the
 * contact was deleted.
 */
export async function getDecryptedContact(auditId) {
  const result = await query(
    `select c.email_encrypted, c.first_name_encrypted, a.contact_deleted_at
     from seo_audit_contacts c
     join seo_audits a on a.id = c.audit_id
     where c.audit_id = $1`,
    [auditId],
  );
  const row = result.rows[0];
  if (!row || row.contact_deleted_at || !row.email_encrypted) return null;
  try {
    return {
      email: decryptValue(row.email_encrypted),
      firstName: row.first_name_encrypted ? decryptValue(row.first_name_encrypted) : '',
    };
  } catch (error) {
    console.error('Failed to decrypt contact', error);
    return null;
  }
}

export async function countRecentAudits({ column, value, minutes }) {
  if (column === 'global') {
    const result = await query(
      `select count(*)::int as count from seo_audits
       where created_at > now() - ($1 || ' minutes')::interval`,
      [minutes],
    );
    return result.rows[0]?.count || 0;
  }

  if (column === 'email_hash') {
    const result = await query(
      `select count(*)::int as count
       from seo_audit_contacts c
       join seo_audits a on a.id = c.audit_id
       where c.email_hash = $1
         and a.created_at > now() - ($2 || ' minutes')::interval`,
      [value, minutes],
    );
    return result.rows[0]?.count || 0;
  }

  const allowed = new Set(['ip_hash', 'references', 'created_at']);
  if (!allowed.has(column)) {
    throw new Error(`Unsupported rate-limit column: ${column}`);
  }
  const result = await query(
    `select count(*)::int as count from seo_audits
     where ${column} = $1 and created_at > now() - ($2 || ' minutes')::interval`,
    [value, minutes],
  );
  return result.rows[0]?.count || 0;
}
