import {
  jsonResponse,
  isValidAuditId,
  readBearerToken,
} from '../../../../../../lib/seo-audit/route-helpers';
import { authorizeAuditToken, getAuditReport } from '../../../../../../lib/seo-jobs';
import { buildReportPdf } from '../../../../../../lib/seo-report/pdf';

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
  if (!audit || audit.status !== 'succeeded' || !audit.report) {
    return jsonResponse({ error: 'The report is not ready yet.' }, { status: 409 });
  }

  try {
    const buffer = await buildReportPdf(audit.report);
    const filename = `RAY-SEO-${audit.reference || id}.pdf`;
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch (error) {
    console.error('PDF generation failed', error);
    return jsonResponse({ error: 'We could not generate the PDF.' }, { status: 500 });
  }
}
