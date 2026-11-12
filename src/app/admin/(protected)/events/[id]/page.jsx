import { notFound } from 'next/navigation';
import Link from 'next/link';
import EventEditor from '@/components/admin/EventEditor';
import { requireAdmin } from '@/lib/admin-auth';
import { getEventForAdmin } from '@/lib/events';

export const metadata = {
  title: 'Edit Event | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const [event, query] = await Promise.all([getEventForAdmin(id), searchParams]);
  if (!event) notFound();

  return (
    <>
      <div className="admin-crumbs"><Link href="/admin/events">Events</Link> / {event.title}</div>
      <div className="admin-top">
        <div>
          <h1>Edit event</h1>
          <p>Manage the flyer, schedule, venue, registration, and public status.</p>
        </div>
        {event.status === 'published' ? (
          <Link href={`/events/${event.slug}`} target="_blank" rel="noreferrer">View public page ↗</Link>
        ) : null}
      </div>
      {query?.saved === '1' ? <p className="admin-notice ok">Event changes saved.</p> : null}
      <EventEditor event={event} />
    </>
  );
}
