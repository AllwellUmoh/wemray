import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getSeoAudit } from '@/lib/admin';

export const metadata = {
  title: 'SEO Audit | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminAuditDetailPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  if (!UUID.test(id)) notFound();

  const audit = await getSeoAudit(id);
  if (!audit) notFound();

  let categories = [];
  try {
    categories = audit.category_scores ? JSON.parse(audit.category_scores) : [];
  } catch {
    categories = [];
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <p className="admin-crumbs">
            <Link href="/admin/audits">Audits</Link> / {audit.reference}
          </p>
          <h1>{audit.reference}</h1>
          <p className="admin-truncate">{audit.final_url || audit.url}</p>
        </div>
        <span className="admin-user">Admin</span>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-card-head"><h2>Audit</h2></div>
          <dl className="admin-dl">
            <div><dt>Status</dt><dd>{audit.status}</dd></div>
            <div><dt>Score</dt><dd>{audit.overall_score != null ? `${audit.overall_score} / 100 (${audit.grade || '—'})` : '—'}</dd></div>
            <div><dt>Progress</dt><dd>{audit.progress ?? 0}%</dd></div>
            <div><dt>Submitted</dt><dd>{formatDate(audit.created_at)}</dd></div>
            <div><dt>Completed</dt><dd>{formatDate(audit.completed_at)}</dd></div>
            <div><dt>Expires</dt><dd>{formatDate(audit.expires_at)}</dd></div>
            {audit.error_code ? (
              <div><dt>Error</dt><dd>{audit.error_code}: {audit.error_message}</dd></div>
            ) : null}
          </dl>
        </section>

        <section className="admin-card">
          <div className="admin-card-head"><h2>Contact</h2></div>
          <dl className="admin-dl">
            <div>
              <dt>Contact details</dt>
              <dd>
                {audit.contact_deleted_at
                  ? 'Deleted by requester'
                  : audit.email_encrypted
                    ? 'On file (encrypted — not shown)'
                    : 'Not available'}
              </dd>
            </div>
            <div><dt>Contact retention until</dt><dd>{formatDate(audit.retention_until)}</dd></div>
          </dl>
        </section>
      </div>

      <section className="admin-card">
        <div className="admin-card-head"><h2>Category scores</h2></div>
        {categories.length ? (
          <ul className="admin-scores">
            {categories.map((cat) => (
              <li key={cat.id || cat.label}>
                <span>{cat.label || cat.id}</span>
                <strong>{typeof cat.score === 'number' ? cat.score : 'n/a'}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-empty">No category scores recorded.</p>
        )}
      </section>
    </>
  );
}
