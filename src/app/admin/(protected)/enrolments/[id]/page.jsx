import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getEnrolmentDetail } from '@/lib/academy/admin-queries';
import { formatNaira } from '@/lib/academy/pricing';
import { updateEnrolmentStatusAction } from '../actions';

export const metadata = {
  title: 'Enrolment | Wemray Admin',
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

const PAYMENT_LABELS = {
  pending: 'Pending',
  success: 'Success',
  failed: 'Failed',
  abandoned: 'Abandoned',
  reversed: 'Reversed',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

export default async function AdminEnrolmentPage({ params, searchParams }) {
  await requireAdmin();

  const { id } = await params;
  const query = await searchParams;
  const enrolment = await getEnrolmentDetail(id);

  if (!enrolment) notFound();

  const balance = Math.max(0, Number(enrolment.total_kobo) - Number(enrolment.amount_paid_kobo));

  return (
    <>
      <div className="admin-top">
        <div>
          <Link href="/admin/enrolments" className="admin-back">? All enrolments</Link>
          <h1>{enrolment.full_name}</h1>
          <p>
            {enrolment.course_title} · <code>{enrolment.reference}</code>
          </p>
        </div>
        <span className={`status status-${enrolment.status}`}>
          {STATUS_LABELS[enrolment.status] || enrolment.status}
        </span>
      </div>

      {query?.saved ? <p className="admin-flash ok">Enrolment updated.</p> : null}
      {query?.error ? <p className="admin-flash bad">That update could not be saved.</p> : null}

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-card-head"><h2>Payment</h2></div>
          <dl className="admin-dl">
            <div><dt>Base price</dt><dd>{formatNaira(enrolment.base_price_kobo)}</dd></div>
            <div>
              <dt>Discount</dt>
              <dd>
                {enrolment.discount_kobo ? formatNaira(enrolment.discount_kobo) : '—'}
                {enrolment.coupon_code ? ` · ${enrolment.coupon_code}` : ''}
              </dd>
            </div>
            <div><dt>Total</dt><dd>{formatNaira(enrolment.total_kobo)}</dd></div>
            <div><dt>Paid</dt><dd>{formatNaira(enrolment.amount_paid_kobo)}</dd></div>
            <div><dt>Balance</dt><dd>{balance ? formatNaira(balance) : '—'}</dd></div>
            <div><dt>Plan</dt><dd>{enrolment.plan === 'installment' ? '2 instalments' : 'Full payment'}</dd></div>
          </dl>

          <div className="admin-card-head"><h2>Payments</h2></div>
          {enrolment.payments.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Channel</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolment.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.installment_no}</td>
                      <td><code>{payment.reference}</code></td>
                      <td>{formatNaira(payment.amount_kobo)}</td>
                      <td>
                        <span className={`status status-${payment.status}`}>
                          {PAYMENT_LABELS[payment.status] || payment.status}
                        </span>
                      </td>
                      <td>{payment.channel || '—'}</td>
                      <td>{formatDate(payment.verified_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-empty">No payment attempts recorded.</p>
          )}
        </section>

        <section className="admin-card">
          <div className="admin-card-head"><h2>Student</h2></div>
          <dl className="admin-dl">
            <div><dt>Name</dt><dd>{enrolment.full_name}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${enrolment.email}`}>{enrolment.email}</a></dd></div>
            <div><dt>Phone</dt><dd><a href={`tel:${enrolment.phone}`}>{enrolment.phone}</a></dd></div>
            <div><dt>Course</dt><dd>{enrolment.course_title}</dd></div>
            <div><dt>Track</dt><dd>{enrolment.track_label || '—'}</dd></div>
            <div><dt>Duration</dt><dd>{enrolment.duration || '—'}</dd></div>
            <div><dt>Classes</dt><dd>{enrolment.classes || '—'}</dd></div>
            <div><dt>Created</dt><dd>{formatDate(enrolment.created_at)}</dd></div>
            <div><dt>Paystack ref</dt><dd>{enrolment.paystack_reference || '—'}</dd></div>
          </dl>

          {enrolment.note ? (
            <>
              <div className="admin-card-head"><h2>Student note</h2></div>
              <p className="admin-note">{enrolment.note}</p>
            </>
          ) : null}

          <div className="admin-card-head"><h2>Emails</h2></div>
          <dl className="admin-dl">
            <div><dt>Welcome</dt><dd>{formatDate(enrolment.welcome_email_sent_at)}</dd></div>
            <div><dt>Receipt</dt><dd>{formatDate(enrolment.receipt_email_sent_at)}</dd></div>
            <div><dt>Admin notice</dt><dd>{formatDate(enrolment.admin_notified_at)}</dd></div>
          </dl>

          <form action={updateEnrolmentStatusAction} className="admin-form">
            <input type="hidden" name="id" value={enrolment.id} />
            <label className="fld sel">
              <select name="status" defaultValue={enrolment.status}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <span>Update status</span>
            </label>
            <button className="btn pur" type="submit">Save status</button>
          </form>
        </section>
      </div>
    </>
  );
}
