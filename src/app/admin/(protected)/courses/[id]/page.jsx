import { notFound } from 'next/navigation';
import Link from 'next/link';
import CourseEditor from '@/components/admin/CourseEditor';
import { requireAdmin } from '@/lib/admin-auth';
import { getCourseForAdmin } from '@/lib/academy/admin-queries';
import { listTracks } from '@/lib/academy/courses';

export const metadata = {
  title: 'Edit Course | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EditCoursePage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const [course, tracks, query] = await Promise.all([
    getCourseForAdmin(id),
    listTracks(),
    searchParams,
  ]);
  if (!course) notFound();

  return (
    <>
      <div className="admin-crumbs"><Link href="/admin/courses">Courses</Link> / {course.title}</div>
      <div className="admin-top">
        <div>
          <h1>Edit course</h1>
          <p>Update the course details and module learning plan.</p>
        </div>
        <Link href={`/academy/courses/${course.slug}`} target="_blank" rel="noreferrer">View public page ↗</Link>
      </div>
      {query?.saved === '1' ? <p className="admin-notice ok">Course changes saved.</p> : null}
      <CourseEditor course={course} tracks={tracks} />
    </>
  );
}
