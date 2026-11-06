import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getEnquiry } from '@/lib/admin';
import { CONTACT_STATUSES } from '@/lib/contact-options';
import { updateEnquiryAction } from '../../actions';

export const metadata = {
  title: 'Enquiry | Wemray Admin',
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

export default async function EnquiryDetailPage({ params, searchParams }) {
  await requireAdmin();

  const { id } = await params;
  const query = await searchParams;
  const enquiry = await getEnquiry(id);

  if (!enquiry) notFound();

  return (
    <>
      <div className="admin-top">
        <div>
          <p className="admin-ref">{enquiry.reference}</p>
          <h1>{enquiry.name}</h1>
          <p>{formatDate(enquiry.created_at)}</p>
        </div>
        <Link className="admin-user" href="/admin">Back to enquiries</Link>
      </div>

      {query?.saved ? <p className="admin-notice ok">Changes saved.</p> : null}
      {query?.error ? <p className="admin-notice bad">The update could not be saved.</p> : null}

      <div className="admin-detail-grid">
        <div>
          <section className="admin-panel">
            <h2>Message</h2>
            <p className="admin-message">{enquiry.details || 'No project details were provided.'}</p>
          </section>

          <section className="admin-panel" style={{ marginTop: 18 }}>
            <h2>Enquiry details</h2>
            <dl className="admin-meta">
              <div><dt>Reference</dt><dd>{enquiry.reference}</dd></div>
              <div><dt>Name</dt><dd>{enquiry.name}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a></dd></div>
              <div><dt>Organisation</dt><dd>{enquiry.organisation || '—'}</dd></div>
              <div><dt>Budget</dt><dd>{enquiry.budget || '—'}</dd></div>
              <div><dt>Service</dt><dd>{enquiry.service}</dd></div>
              <div><dt>Intent</dt><dd>{enquiry.intent === 'consultation' ? 'Consultation request' : 'Conversation'}</dd></div>
              <div><dt>Confirmation email</dt><dd>{enquiry.confirmation_sent_at ? formatDate(enquiry.confirmation_sent_at) : 'Not sent'}</dd></div>
              <div><dt>Admin notification</dt><dd>{enquiry.notification_sent_at ? formatDate(enquiry.notification_sent_at) : 'Not sent'}</dd></div>
              <div><dt>Last updated</dt><dd>{formatDate(enquiry.updated_at)}</dd></div>
            </dl>
          </section>
        </div>

        <aside className="admin-panel">
          <h2>Manage enquiry</h2>
          <form className="admin-form" action={updateEnquiryAction}>
            <input type="hidden" name="id" value={enquiry.id} />
            <label>
              Status
              <select name="status" defaultValue={enquiry.status}>
                {CONTACT_STATUSES.map((status) => (
                  <option key={status} value={status}>{STATUS_LABELS[status] || status}</option>
                ))}
              </select>
            </label>
            <label>
              Internal notes
              <textarea
                name="admin_notes"
                defaultValue={enquiry.admin_notes || ''}
                placeholder="Add context for follow-up, calls, or next steps."
              />
            </label>
            <button className="btn pur" type="submit">Save changes</button>
          </form>
        </aside>
      </div>
    </>
  );
}
