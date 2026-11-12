import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { ENROLMENT_STATUSES, getEnrolmentCounts, listEnrolments } from '@/lib/academy/admin-queries';
import { formatNaira } from '@/lib/academy/pricing';

export const metadata = {
  title: 'Enrolments | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const STATUS_LABELS = {
  pending: 'Pending',
  part_paid: 'Part paid',
  paid: 'Paid',
  failed: 'Failed',
  abandoned: 'Abandoned',
  refunded: 'Refunded',
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
  return query ? `/admin/enrolments?${query}` : '/admin/enrolments';
}

export default async function AdminEnrolmentsPage({ searchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const status = typeof params?.status === 'string' ? params.status : '';

  const [{ counts, total, collectedKobo }, list] = await Promise.all([
    getEnrolmentCounts(),
    listEnrolments({ page, status }),
  ]);

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>Enrolments</h1>
          <p>Ray Academy course payments.</p>
        </div>
        <span className="admin-user">Admin</span>
      </div>

      <div className="admin-stats">
        <div className="admin-stat"><span>Total</span><strong>{total}</strong></div>
        <div className="admin-stat"><span>Paid</span><strong>{counts.paid}</strong></div>
        <div className="admin-stat"><span>Part paid</span><strong>{counts.part_paid}</strong></div>
        <div className="admin-stat"><span>Pending</span><strong>{counts.pending}</strong></div>
        <div className="admin-stat"><span>Collected</span><strong>{formatNaira(collectedKobo)}</strong></div>
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{list.status ? `${STATUS_LABELS[list.status]} enrolments` : 'All enrolments'}</h2>
          <div className="admin-filters" aria-label="Filter by status">
            <Link href={adminUrl()} className={!list.status ? 'active' : ''}>All</Link>
            {ENROLMENT_STATUSES.map((key) => (
              <Link
                key={key}
                href={adminUrl({ status: key })}
                className={list.status === key ? 'active' : ''}
              >
                {STATUS_LABELS[key]}
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
                  <th>Student</th>
                  <th>Course</th>
                  <th>Plan</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/admin/enrolments/${row.id}`} className="admin-ref">
                        {row.reference}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/enrolments/${row.id}`}>{row.full_name}</Link>
                      <small>{row.email}</small>
                    </td>
                    <td>{row.course_title}</td>
                    <td>
                      {row.plan === 'installment' ? '2 instalments' : 'Full'}
                      {row.coupon_code ? <small>{row.coupon_code}</small> : null}
                    </td>
                    <td>
                      {formatNaira(row.amount_paid_kobo)}
                      <small>of {formatNaira(row.total_kobo)}</small>
                    </td>
                    <td>
                      <span className={`status status-${row.status}`}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                    <td>{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty">No enrolments match this view yet.</p>
        )}

        <div className="admin-pagination">
          <span>
            Page {list.page} of {list.pageCount} &middot; {list.total} {list.total === 1 ? 'enrolment' : 'enrolments'}
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
