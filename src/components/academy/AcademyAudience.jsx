import SectionHeading from '../ui/SectionHeading';

const audiences = [
  {
    title: 'Individuals',
    copy: 'Build a practical skill set in the digital areas you want to grow in, taught through real-world challenges.',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
  },
  {
    title: 'Aspiring Professionals',
    copy: 'Prepare to apply what you know, with skills in development, design, marketing, website management, and data.',
    icon: (
      <>
        <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z" />
        <path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5" />
      </>
    ),
  },
  {
    title: 'Organisations & Teams',
    copy: 'Develop digital capability across your team with training that connects directly to the work you do.',
    icon: (
      <>
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
      </>
    ),
  },
];

export default function AcademyAudience() {
  return (
    <section className="ac-s w" id="who">
      <SectionHeading
        eyebrow="Learn with Purpose"
        title={<>Skills Built on <span>Real Work</span></>}
        lead="We teach useful digital skills that individuals and organisations can apply to practical challenges."
      />
      <div className="ac-w">
        {audiences.map((audience, index) => (
          <article className="ac-wc rv" style={{ '--i': index }} key={audience.title}>
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {audience.icon}
              </svg>
            </span>
            <h3>{audience.title}</h3>
            <p>{audience.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
