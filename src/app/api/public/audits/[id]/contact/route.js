import {
  jsonResponse,
  isValidAuditId,
  readBearerToken,
} from '../../../../../../lib/seo-audit/route-helpers';
import { authorizeAuditToken, deleteContact } from '../../../../../../lib/seo-jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!isValidAuditId(id)) {
    return jsonResponse({ error: 'Report not found.' }, { status: 404 });
  }

  const token = readBearerToken(request);
  if (!(await authorizeAuditToken(id, token))) {
    return jsonResponse({ error: 'Report not found.' }, { status: 404 });
  }

  try {
    await deleteContact(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Contact deletion failed', error);
    return jsonResponse({ error: 'We could not delete your contact details.' }, { status: 500 });
  }
}
