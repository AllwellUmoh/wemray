import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { listAllCoursesAdmin } from '@/lib/academy/admin-queries';
import { formatNaira } from '@/lib/academy/pricing';

export const metadata = {
  title: 'Courses | Wemray Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  await requireAdmin();

  const courses = await listAllCoursesAdmin();
  const active = courses.filter((course) => course.is_active).length;

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>Courses</h1>
          <p>Ray Academy catalogue. Edit content in the database or add an editor here later.</p>
        </div>
        <span className="admin-user">Admin</span>
      </div>

      <div className="admin-stats">
        <div className="admin-stat"><span>Courses</span><strong>{courses.length}</strong></div>
        <div className="admin-stat"><span>Active</span><strong>{active}</strong></div>
        <div className="admin-stat">
          <span>Modules</span>
          <strong>{courses.reduce((sum, course) => sum + Number(course.module_count || 0), 0)}</strong>
        </div>
        <div className="admin-stat">
          <span>Enrolled</span>
          <strong>{courses.reduce((sum, course) => sum + Number(course.enrolment_count || 0), 0)}</strong>
        </div>
      </div>

      <section className="admin-card">
        <div className="admin-card-head"><h2>All courses</h2></div>

        {courses.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th>Track</th>
                  <th>Mode</th>
                  <th>Duration</th>
                  <th>Fee</th>
                  <th>Modules</th>
                  <th>Enrolled</th>
                  <th>Live</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.number}</td>
                    <td>
                      <Link href={`/academy/courses/${course.slug}`} target="_blank" rel="noreferrer">
                        {course.title}
                      </Link>
                      <small>{course.slug}</small>
                    </td>
                    <td>{course.track_label}</td>
                    <td>{(course.formats || []).join(', ')}</td>
                    <td>{course.duration}</td>
                    <td>{formatNaira(course.price_kobo)}</td>
                    <td>{course.module_count}</td>
                    <td>{course.enrolment_count}</td>
                    <td>
                      <span className={`status ${course.is_active ? 'status-paid' : 'status-archived'}`}>
                        {course.is_active ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty">
            No courses yet. Run <code>db/academy.sql</code> then <code>db/academy.seed.sql</code> to load the catalogue.
          </p>
        )}
      </section>
    </>
  );
}
