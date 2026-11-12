import CourseGrid from './CourseGrid';

export default function LearningPaths({ courses = [] }) {
  return (
    <section className="ac-s p trk" id="tracks">
      <div className="ac-hd">
        <div>
          <p className="ab-eb rv"><i />Learning Paths</p>
          <h2 className="rv">Find Your <span>Learning Path</span></h2>
        </div>
        <div className="rv">
          <p className="ab-lead">
            Ray Academy supports individuals, aspiring professionals, and organisations building practical digital
            capability. We train people to build, design, and manage real digital work, ready to innovate and compete
            globally and to help shape an Africa recognised for digital excellence.
          </p>
        </div>
      </div>
      <CourseGrid courses={courses} />
    </section>
  );
}
