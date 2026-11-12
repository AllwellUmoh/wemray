import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { listEventsAdmin } from '@/lib/events';

export const metadata = {
  title: 'Events | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function displayDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(`${String(value).slice(0, 10)}T00:00:00Z`));
}

function displayTime(value) {
  return value ? String(value).slice(0, 5) : 'Time not set';
}

export default async function AdminEventsPage() {
  await requireAdmin();
  const events = await listEventsAdmin();
  const published = events.filter((event) => event.status === 'published').length;
  const drafts = events.filter((event) => event.status === 'draft').length;
  const upcoming = events.filter((event) => event.status === 'published' && String(event.event_date).slice(0, 10) >= new Date().toISOString().slice(0, 10)).length;

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>Events</h1>
          <p>Publish workshops, webinars, and other Wemray events.</p>
        </div>
        <div className="admin-top-actions">
          <Link className="admin-button admin-button-primary" href="/admin/events/new">Add event</Link>
          <span className="admin-user">Admin</span>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat"><span>Events</span><strong>{events.length}</strong></div>
        <div className="admin-stat"><span>Published</span><strong>{published}</strong></div>
        <div className="admin-stat"><span>Upcoming</span><strong>{upcoming}</strong></div>
        <div className="admin-stat"><span>Drafts</span><strong>{drafts}</strong></div>
      </div>

      <section className="admin-card">
        <div className="admin-card-head"><h2>All events</h2></div>
        {events.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Event</th><th>Date</th><th>Time</th><th>Venue</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <Link href={`/admin/events/${event.id}`} className="admin-ref">{event.title}</Link>
                      <small>{event.slug}</small>
                    </td>
                    <td>{displayDate(event.event_date)}</td>
                    <td>{displayTime(event.start_time)}</td>
                    <td>{event.venue || '—'}</td>
                    <td><span className={`status ${event.status === 'published' ? 'status-paid' : 'status-archived'}`}>{event.status}</span></td>
                    <td>
                      <div className="admin-row-actions">
                        <Link className="admin-table-action" href={`/admin/events/${event.id}`}>Edit</Link>
                        {event.status === 'published' ? (
                          <Link className="admin-table-action" href={`/events/${event.slug}`} target="_blank" rel="noreferrer">View ↗</Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty admin-empty-callout">
            <p>No events have been added. Create one to announce it on the website.</p>
            <Link className="admin-button admin-button-primary" href="/admin/events/new">Create an event</Link>
          </div>
        )}
      </section>
    </>
  );
}
