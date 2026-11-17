import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRaynovationApplication } from '@/lib/raynovation/applications';
import { acceptRaynovationApplicant } from '../actions';

export const metadata = {
  title: 'Raynovation Application | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Lagos',
});

function displayDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

function displayBoolean(value) {
  return value ? 'Yes' : 'No';
}

function DetailGroup({ title, rows }) {
  return (
    <section className="ra-detail-group">
      <h2>{title}</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const NOTICES = {
  'accepted-sent': { kind: 'success', text: 'Applicant accepted. The scholarship acceptance email was sent.' },
  'accepted-failed': { kind: 'error', text: 'Applicant is accepted, but the acceptance email was not sent. Retry below.' },
  'accepted-unconfigured': { kind: 'error', text: 'Applicant is accepted, but email delivery is not configured. Configure the email service, then retry below.' },
  'already-sent': { kind: 'success', text: 'This applicant is already accepted and the acceptance email was sent.' },
  sending: { kind: 'info', text: 'The acceptance email is currently being processed.' },
  missing: { kind: 'error', text: 'This application could not be found.' },
  error: { kind: 'error', text: 'The application could not be updated. Please refresh and try again.' },
};

export default async function RaynovationApplicationDetailPage({ params, searchParams }) {
  const { id } = await params;
  const queryParams = await searchParams;
  if (!/^\d+$/.test(id)) notFound();
  const application = await getRaynovationApplication(id);
  if (!application) notFound();
  const notice = typeof queryParams?.notice === 'string' ? NOTICES[queryParams.notice] : null;

  return (
    <>
      <div className="admin-crumbs">
        <Link href="/admin/raynovation-applications">Raynovation Applications</Link> / {application.reference}
      </div>
      <div className="admin-top">
        <div>
          <h1>{application.first_name} {application.last_name}</h1>
          <p>{application.reference} · Submitted {displayDate(application.created_at)}</p>
        </div>
        <div className="ra-review-actions">
          <span className={`status status-${application.status}`}>{application.status.replaceAll('_', ' ')}</span>
          {application.status !== 'accepted' || !application.accepted_email_sent_at ? (
            <form action={acceptRaynovationApplicant}>
              <input type="hidden" name="id" value={application.id} />
              <button className="btn pur" type="submit">
                {application.status === 'accepted' ? 'Retry acceptance email' : 'Accept applicant and email'}
              </button>
            </form>
          ) : (
            <span className="ra-email-sent">Acceptance email sent</span>
          )}
        </div>
      </div>

      {notice ? <p className={`ra-notice ra-notice-${notice.kind}`} role="status">{notice.text}</p> : null}

      <div className="ra-detail-grid">
        <DetailGroup
          title="Personal details"
          rows={[
            ['First name', application.first_name],
            ['Last name', application.last_name],
            ['Email', application.email],
            ['Phone', application.phone],
            ['WhatsApp', application.whatsapp_phone],
            ['Same as phone', displayBoolean(application.whatsapp_same_as_phone)],
            ['Date of birth', String(application.date_of_birth).slice(0, 10)],
            ['Sex', application.sex],
            ['Living with a disability', displayBoolean(application.has_disability)],
          ]}
        />
        <DetailGroup
          title="Address"
          rows={[
            ['Address', application.address],
            ['City', application.city],
            ['State', application.state],
            ['Country', application.country],
          ]}
        />
        <DetailGroup
          title="Education and experience"
          rows={[
            ['Current occupation', application.occupation],
            ['Highest qualification', application.qualification],
            ['Previous work experience', application.work_experience],
          ]}
        />
        <DetailGroup
          title="Training and attestation"
          rows={[
            ['Computer knowledge', displayBoolean(application.computer_knowledge)],
            ['Track', application.track_label],
            ['Working laptop', displayBoolean(application.has_laptop)],
            ['Working smartphone', displayBoolean(application.has_smartphone)],
            ['Available for sessions', displayBoolean(application.available_for_sessions)],
            ['Has a guarantor', displayBoolean(application.has_guarantor)],
            ['Application details confirmed', displayBoolean(application.consent)],
            ['Acceptance email', application.accepted_email_sent_at ? `Sent ${displayDate(application.accepted_email_sent_at)}` : 'Not sent'],
          ]}
        />
        <section className="ra-detail-group ra-motivation">
          <h2>Why Raynovation?</h2>
          <p>{application.motivation}</p>
        </section>
      </div>
    </>
  );
}
