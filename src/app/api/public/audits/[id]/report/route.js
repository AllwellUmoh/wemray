import {
  jsonResponse,
  isValidAuditId,
  readBearerToken,
} from '../../../../../../lib/seo-audit/route-helpers';
import { authorizeAuditToken, getAuditReport } from '../../../../../../lib/seo-jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { id } = await params;

  if (!isValidAuditId(id)) {
    return jsonResponse({ error: 'Report not found.' }, { status: 404 });
  }

  const token = readBearerToken(request);
  if (!(await authorizeAuditToken(id, token))) {
    return jsonResponse({ error: 'Report not found.' }, { status: 404 });
  }

  const audit = await getAuditReport(id);
  if (!audit) {
    return jsonResponse({ error: 'Report not found.' }, { status: 404 });
  }

  if (audit.status !== 'succeeded' || !audit.report) {
    return jsonResponse(
      {
        id: audit.id,
        reference: audit.reference,
        status: audit.status,
        progress: audit.progress,
        error: 'The report is not ready yet.',
      },
      { status: 409 },
    );
  }

  return jsonResponse({
    id: audit.id,
    reference: audit.reference,
    report: audit.report,
    expiresAt: audit.expires_at,
  });
}
