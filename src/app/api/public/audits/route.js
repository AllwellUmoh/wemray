import { parseAuditInput } from '../../../../lib/seo-audit/validation';
import { validateTargetUrl, AuditFetchError } from '../../../../lib/seo-audit/safe-fetch';
import { getSeoConfig } from '../../../../lib/seo-audit/config';
import { jsonResponse, requestContext } from '../../../../lib/seo-audit/route-helpers';
import { countRecentAudits, createAudit, processAudit } from '../../../../lib/seo-jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16_000;

function tooMany(message, retryAfter = '3600') {
  return jsonResponse(
    { error: message },
    { status: 429, headers: { 'Retry-After': retryAfter } },
  );
}

async function assertRateLimits(context, input) {
  const { limits } = getSeoConfig();

  const [ipHourly, ipDaily, contactDaily, globalDaily] = await Promise.all([
    countRecentAudits({ column: 'ip_hash', value: context.ipHash, minutes: 60 }),
    countRecentAudits({ column: 'ip_hash', value: context.ipHash, minutes: 1440 }),
    countRecentAudits({ column: 'email_hash', value: input.emailHash, minutes: 1440 }),
    countRecentAudits({ column: 'global', minutes: 1440 }),
  ]);

  if (globalDaily >= limits.globalDaily) {
    return { limited: true, kind: 'global' };
  }
  if (contactDaily >= limits.contactDaily) {
    return { limited: true, kind: 'contact' };
  }
  if (ipHourly >= limits.ipHourly || ipDaily >= limits.ipDaily) {
    return { limited: true, kind: 'ip' };
  }
  return { limited: false };
}

export async function POST(request) {
  const context = requestContext(request);

  if (!context.originAllowed) {
    return jsonResponse({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Request body is too large.' }, { status: 413 });
  }

  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return jsonResponse({ error: 'Unsupported content type.' }, { status: 415 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Honeypot: silently accept but do nothing for bots.
  if (body?.website) {
    return jsonResponse({ ok: true });
  }

  const parsed = parseAuditInput(body);
  if (!parsed.success) {
    return jsonResponse(
      { error: 'Please check the highlighted fields.', fieldErrors: parsed.fieldErrors },
      { status: 422 },
    );
  }

  const input = parsed.data;

  // SSRF-safe URL validation happens before any record is created.
  try {
    await validateTargetUrl(input.url);
  } catch (error) {
    if (error instanceof AuditFetchError) {
      return jsonResponse(
        { error: error.message, fieldErrors: { url: error.message } },
        { status: error.status || 422 },
      );
    }
    return jsonResponse(
      { error: 'We could not validate that URL.', fieldErrors: { url: 'Invalid URL.' } },
      { status: 422 },
    );
  }

  try {
    const limits = await assertRateLimits(context, input);
    if (limits.limited) {
      const message =
        limits.kind === 'contact'
          ? 'This email has submitted too many audits today. Please try again tomorrow.'
          : 'Too many audits from this connection. Please try again later.';
      return tooMany(message);
    }

    const { auditId, reference, token } = await createAudit({
      input,
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
    });

    const asyncMode = process.env.ENABLE_INLINE_AUDIT_JOBS === 'true';

    if (asyncMode) {
      // Persistent Node host: run in-process without awaiting.
      processAudit(auditId, { url: input.url, reference }).catch((error) => {
        console.error('Background audit failed', error);
      });
    } else {
      // Serverless: run synchronously within this request's budget.
      await processAudit(auditId, { url: input.url, reference });
    }

    const base = `/tools/ray-seo-analyser`;
    return jsonResponse({
      ok: true,
      id: auditId,
      reference,
      token,
      status: asyncMode ? 'queued' : 'completed',
      statusUrl: `/api/public/audits/${auditId}/status?token=${encodeURIComponent(token)}`,
      reportUrl: `${base}/report/${auditId}?token=${encodeURIComponent(token)}`,
      reportApiUrl: `/api/public/audits/${auditId}/report?token=${encodeURIComponent(token)}`,
      pdfUrl: `/api/public/audits/${auditId}/pdf?token=${encodeURIComponent(token)}`,
    });
  } catch (error) {
    console.error('Audit submission failed', error);
    return jsonResponse(
      { error: 'We could not start the audit. Please try again.' },
      { status: 500 },
    );
  }
}
