import Link from 'next/link';
import CourseEditor from '@/components/admin/CourseEditor';
import { requireAdmin } from '@/lib/admin-auth';
import { listTracks } from '@/lib/academy/courses';

export const metadata = {
  title: 'Add Course | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NewCoursePage() {
  await requireAdmin();
  const tracks = await listTracks();

  return (
    <>
      <div className="admin-crumbs"><Link href="/admin/courses">Courses</Link> / Add course</div>
      <div className="admin-top">
        <div>
          <h1>Add a course</h1>
          <p>Set the course information and build its module outline.</p>
        </div>
      </div>
      <CourseEditor tracks={tracks} />
    </>
  );
}
