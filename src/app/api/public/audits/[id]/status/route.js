import {
  jsonResponse,
  isValidAuditId,
  readBearerToken,
} from '../../../../../../lib/seo-audit/route-helpers';
import { authorizeAuditToken, getAuditById } from '../../../../../../lib/seo-jobs';

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

  const audit = await getAuditById(id);
  if (!audit) {
    return jsonResponse({ error: 'Report not found.' }, { status: 404 });
  }

  return jsonResponse({
    id: audit.id,
    reference: audit.reference,
    status: audit.status,
    progress: audit.progress,
    overallScore: audit.overall_score,
    grade: audit.grade,
    error: audit.error_code
      ? { code: audit.error_code, message: audit.error_message }
      : null,
    emailStatus: audit.email_status,
    completedAt: audit.completed_at,
  });
}
