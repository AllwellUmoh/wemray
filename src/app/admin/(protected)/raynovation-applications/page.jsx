import Link from 'next/link';
import { listRaynovationApplications } from '@/lib/raynovation/applications';

export const metadata = {
  title: 'Raynovation Applications | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Lagos',
});

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : '—';
}

export default async function RaynovationApplicationsPage() {
  const applications = await listRaynovationApplications();

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>Raynovation Applications</h1>
          <p>Applications for the Raynovation 1.0 training program.</p>
        </div>
        <span className="admin-user">Admin</span>
      </div>

      <div className="admin-stats">
        <div className="admin-stat"><span>Total applications</span><strong>{applications.length}</strong></div>
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>Recent applications</h2>
        </div>
        {applications.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Track</th>
                  <th>Status</th>
                  <th>Acceptance email</th>
                  <th>Submitted</th>
                  <th><span className="sr-only">Review</span></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <Link className="admin-ref" href={`/admin/raynovation-applications/${application.id}`}>
                        {application.reference}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/raynovation-applications/${application.id}`}>
                        {application.first_name} {application.last_name}
                      </Link>
                      <small>{application.email}</small>
                    </td>
                    <td>{application.track_label}</td>
                    <td><span className={`status status-${application.status}`}>{application.status.replaceAll('_', ' ')}</span></td>
                    <td>
                      {application.status === 'accepted'
                        ? application.accepted_email_sent_at ? 'Sent' : 'Needs retry'
                        : '—'}
                    </td>
                    <td>{formatDate(application.created_at)}</td>
                    <td><Link className="admin-ref" href={`/admin/raynovation-applications/${application.id}`}>Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty">No Raynovation applications have been submitted yet.</p>
        )}
      </section>
    </>
  );
}
