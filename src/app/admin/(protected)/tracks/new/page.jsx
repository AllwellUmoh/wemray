import Link from 'next/link';
import TrackEditor from '@/components/admin/TrackEditor';
import { requireAdmin } from '@/lib/admin-auth';

export const metadata = {
  title: 'Add Course Track | Wemray Admin',
  robots: { index: false, follow: false },
};

export default async function NewTrackPage() {
  await requireAdmin();
  return (
    <>
      <div className="admin-crumbs"><Link href="/admin/tracks">Tracks</Link> / Add track</div>
      <div className="admin-top"><div><h1>Add a track</h1><p>Create a track for grouping related courses.</p></div></div>
      <TrackEditor />
    </>
  );
}
