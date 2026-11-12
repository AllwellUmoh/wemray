import { notFound } from 'next/navigation';
import Link from 'next/link';
import TrackEditor from '@/components/admin/TrackEditor';
import { requireAdmin } from '@/lib/admin-auth';
import { getTrackForAdmin } from '@/lib/academy/admin-queries';

export const metadata = {
  title: 'Edit Course Track | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EditTrackPage({ params, searchParams }) {
  await requireAdmin();
  const { key } = await params;
  const [track, query] = await Promise.all([getTrackForAdmin(key), searchParams]);
  if (!track) notFound();
  return (
    <>
      <div className="admin-crumbs"><Link href="/admin/tracks">Tracks</Link> / {track.label}</div>
      <div className="admin-top"><div><h1>Edit track</h1><p>Update the name, description, and display order.</p></div></div>
      {query?.saved === '1' ? <p className="admin-notice ok">Track changes saved.</p> : null}
      <TrackEditor track={track} />
    </>
  );
}
