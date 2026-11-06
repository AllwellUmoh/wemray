import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getEnquiryCounts, listEnquiries } from '@/lib/admin';

export const metadata = {
  title: 'Enquiries | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

function adminUrl({ status = '', page = 1 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/admin?${query}` : '/admin';
}

export default async function AdminDashboardPage({ searchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const status = typeof params?.status === 'string' ? params.status : '';
  const [{ counts, total }, list] = await Promise.all([
    getEnquiryCounts(),
    listEnquiries({ page, status }),
  ]);

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>Enquiries</h1>
          <p>Messages submitted through the Wemray website.</p>
        </div>
        <span className="admin-user">Admin</span>
      </div>

      <div className="admin-stats">
        <div className="admin-stat"><span>Total</span><strong>{total}</strong></div>
        <div className="admin-stat"><span>New</span><strong>{counts.new}</strong></div>
        <div className="admin-stat"><span>Contacted</span><strong>{counts.contacted}</strong></div>
        <div className="admin-stat"><span>Qualified</span><strong>{counts.qualified}</strong></div>
        <div className="admin-stat"><span>Won</span><strong>{counts.won}</strong></div>
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{list.status ? `${STATUS_LABELS[list.status]} enquiries` : 'All enquiries'}</h2>
          <div className="admin-filters" aria-label="Filter by status">
            <Link href={adminUrl()} className={!list.status ? 'active' : ''}>All</Link>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={adminUrl({ status: key })}
                className={list.status === key ? 'active' : ''}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {list.rows.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/admin/enquiries/${row.id}`} className="admin-ref">
                        {row.reference}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/enquiries/${row.id}`}>{row.name}</Link>
                      <small>{row.email}</small>
                    </td>
                    <td>
                      {row.service}
                      <small>{row.intent === 'consultation' ? 'Consultation request' : 'Conversation'}</small>
                    </td>
                    <td><span className={`status status-${row.status}`}>{STATUS_LABELS[row.status] || row.status}</span></td>
                    <td>{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty">No enquiries match this view yet.</p>
        )}

        <div className="admin-pagination">
          <span>
            Page {list.page} of {list.pageCount} · {list.total} {list.total === 1 ? 'enquiry' : 'enquiries'}
          </span>
          <div>
            {list.page > 1 ? (
              <Link href={adminUrl({ status: list.status, page: list.page - 1 })}>Previous</Link>
            ) : (
              <span>Previous</span>
            )}
            {list.page < list.pageCount ? (
              <Link href={adminUrl({ status: list.status, page: list.page + 1 })}>Next</Link>
            ) : (
              <span>Next</span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
