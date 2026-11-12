import Link from 'next/link';
import EventEditor from '@/components/admin/EventEditor';
import { requireAdmin } from '@/lib/admin-auth';

export const metadata = {
  title: 'Add Event | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <>
      <div className="admin-crumbs"><Link href="/admin/events">Events</Link> / Add event</div>
      <div className="admin-top">
        <div>
          <h1>Add an event</h1>
          <p>Set the event details, registration destination, and public visibility.</p>
        </div>
      </div>
      <EventEditor />
    </>
  );
}
