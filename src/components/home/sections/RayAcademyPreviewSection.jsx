import Button from '../../ui/Button';

export default function RayAcademyPreviewSection() {
  return (
    <section className="pb band" id="academy">
      <div className="pbg">
        <div className="pbl">
          <p className="eb">Ray Academy</p>
          <h2>Skills built on real work</h2>
          <p>We invest in people as well as projects. Ray Academy trains professionals and teams in software development, design, digital marketing, website management, and data analytics, through real-world challenges that prepare learners to apply what they know.</p>
          <ul>
            <li><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r="9.5" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>Software Development</li>
            <li><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r="9.5" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>Design &amp; Creative Skills</li>
            <li><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r="9.5" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>Digital Marketing &amp; Website Management</li>
            <li><svg viewBox="0 0 24 24"><circle cx={12} cy={12} r="9.5" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>Data Analytics</li>
          </ul>
        </div>
        <div className="fm" id="fm">
          <h3>Learn. Create. Build.</h3>
          <p>Practical digital skills that help you turn knowledge into real work.</p>
          <div className="pills"><span>Frontend Development</span><span>Backend Development</span><span>Full-Stack Development</span><span>Product Design</span><span>Corporate Branding &amp; Design</span><span>Social Media Management</span><span>WordPress</span><span>Data Analytics</span></div>
          <Button to="/academy" variant="lav" arrow>View Academy Courses</Button>
        </div>
      </div>
    </section>
  );
}
