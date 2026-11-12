import CourseCard from './CourseCard';

export default function CourseGrid({ courses = [] }) {
  if (!courses.length) {
    return (
      <p className="course-filters-note">
        Course listings are being updated. Please contact the academy team for the current timetable.
      </p>
    );
  }

  return (
    <div className="course-grid">
      {courses.map((course, index) => (
        <CourseCard key={course.slug} course={course} index={index} />
      ))}
    </div>
  );
}
