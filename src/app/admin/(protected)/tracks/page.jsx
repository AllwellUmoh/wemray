import Link from 'next/link';
import { listTracksAdmin } from '@/lib/academy/admin-queries';
import { requireAdmin } from '@/lib/admin-auth';

export const metadata = {
  title: 'Course Tracks | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function TracksPage() {
  await requireAdmin();
  const tracks = await listTracksAdmin();

  return (
    <>
      <div className="admin-crumbs"><Link href="/admin/courses">Courses</Link> / Tracks</div>
      <div className="admin-top">
        <div>
          <h1>Course tracks</h1>
          <p>Manage the database-backed learning paths used by Academy courses.</p>
        </div>
        <Link className="admin-button admin-button-primary" href="/admin/tracks/new">Add track</Link>
      </div>
      <section className="admin-panel">
        {tracks.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Track</th><th>URL key</th><th>Courses</th><th>Order</th><th /></tr></thead>
              <tbody>
                {tracks.map((track) => (
                  <tr key={track.key}>
                    <td><strong>{track.label}</strong>{track.description ? <small className="admin-track-description">{track.description}</small> : null}</td>
                    <td><code>{track.key}</code></td>
                    <td>{track.course_count}</td>
                    <td>{track.sort_order}</td>
                    <td><Link className="admin-table-action" href={`/admin/tracks/${track.key}`}>Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-callout">
            <p>No course tracks yet. Add a track to make it available in the course editor.</p>
            <Link className="admin-button admin-button-primary" href="/admin/tracks/new">Create a track</Link>
          </div>
        )}
      </section>
    </>
  );
}
