import Button from '../ui/Button';

const steps = [
  ['Explore the learning areas', 'Browse the eight courses across four tracks and pick the path that fits.'],
  ['Contact our team', 'Tell us the course, or the team, you have in mind.'],
  ['Confirm the details', 'We confirm what is currently on offer so you can decide with clarity.'],
];

const included = [
  ['Availability', <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>],
  ['Format', <><rect width="20" height="14" x="2" y="3" rx="2" /><path d="M8 21h8M12 17v4" /></>],
  ['Duration', <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>],
  ['Fees', <><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><circle cx="7.5" cy="7.5" r=".5" /></>],
  ['Upcoming dates', <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>],
  ['Certification', <><circle cx="12" cy="8" r="6" /><path d="M15.5 13 17 22l-5-3-5 3 1.5-9" /></>],
];

export default function AcademyEnrol() {
  return (
    <section className="ac-s n" id="start">
      <div className="ac-ln">
        <div>
          <p className="ab-eb rv"><i />Start Your Learning Journey</p>
          <h2 className="rv">Your Next Step, <span>Made Simple.</span></h2>
          <p className="ab-lead rv">
            Explore the learning areas, then contact our team to confirm programme details, formats, and upcoming
            opportunities.
          </p>
          <ol className="ac-stp">
            {steps.map(([title, copy], index) => (
              <li className="rv" style={{ '--i': index }} key={title}>
                <div>
                  <b>{title}</b>
                  <span>{copy}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="ac-cf rv">
          <span className="k"><i />Confirm with our team</span>
          <h3>Programme details, confirmed directly.</h3>
          <p>Contact us to confirm course availability, format, duration, fees, and upcoming dates.</p>
          <ul className="ac-cl">
            {included.map(([label, icon]) => (
              <li key={label}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {icon}
                </svg>
                {label}
              </li>
            ))}
          </ul>
          <div className="ct-act" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Button href="contact.html#form" variant="pur" arrow>Enquire About Training</Button>
            <Button href="mailto:hello@wemray.com?subject=Ray%20Academy%20enquiry" variant="line">
              Email Wemray Technology
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
