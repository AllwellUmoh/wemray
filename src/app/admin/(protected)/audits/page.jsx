import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { listSeoAudits } from '@/lib/admin';

export const metadata = {
  title: 'SEO Audits | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const STATUS_LABELS = {
  queued: 'Queued',
  running: 'Running',
  succeeded: 'Succeeded',
  partial: 'Partial',
  failed: 'Failed',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

function adminUrl({ page = 1 } = {}) {
  return page > 1 ? `/admin/audits?page=${page}` : '/admin/audits';
}

export default async function AdminAuditsPage({ searchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const list = await listSeoAudits({ page });

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>SEO Audits</h1>
          <p>RAY SEO Analyser requests. Contact details are encrypted and never shown here.</p>
        </div>
        <span className="admin-user">Admin</span>
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>Recent audits</h2>
        </div>

        {list.rows.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Page</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Contact</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/admin/audits/${row.id}`} className="admin-ref">
                        {row.reference}
                      </Link>
                    </td>
                    <td className="admin-truncate">{row.final_url || row.url}</td>
                    <td>
                      <span className={`status status-${row.status}`}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                    <td>{row.overall_score != null ? `${row.overall_score} (${row.grade || ''})` : '—'}</td>
                    <td>{row.contact_deleted_at ? 'Deleted' : 'On file'}</td>
                    <td>{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty">No audits yet.</p>
        )}

        <div className="admin-pagination">
          <span>
            Page {list.page} of {list.pageCount} · {list.total} {list.total === 1 ? 'audit' : 'audits'}
          </span>
          <div>
            {list.page > 1 ? (
              <Link href={adminUrl({ page: list.page - 1 })}>Previous</Link>
            ) : (
              <span>Previous</span>
            )}
            {list.page < list.pageCount ? (
              <Link href={adminUrl({ page: list.page + 1 })}>Next</Link>
            ) : (
              <span>Next</span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
