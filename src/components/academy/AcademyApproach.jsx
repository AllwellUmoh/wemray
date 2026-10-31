import SectionHeading from '../ui/SectionHeading';

const approach = [
  {
    title: 'Learn by doing',
    copy: 'Work through practical briefs that mirror the kind of digital tasks teams handle every day.',
    icon: <><path d="m12 19 7-7 3 3-7 7-3-3z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="m2 2 7.6 7.6" /><circle cx="11" cy="11" r="2" /></>,
  },
  {
    title: 'Feedback that moves you forward',
    copy: 'Review sessions focus on what to improve next, so progress is clear rather than left to chance.',
    icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8M8 13h5" /></>,
  },
  {
    title: 'Work you can show',
    copy: 'Finish with practical outputs you can explain, present, and carry into your next opportunity.',
    icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M9 7h7M9 11h5" /></>,
  },
];

export default function AcademyApproach() {
  return (
    <section className="ac-s p" id="learning">
      <SectionHeading
        eyebrow="Inside Ray Academy"
        title={<>Learning That <span>Sticks</span></>}
        lead="A practical structure that keeps the focus on what you can do, not just what you have read."
      />
      <div className="ac-ap">
        {approach.map((item, index) => (
          <article className="ac-apc rv" style={{ '--i': index }} key={item.title}>
            <span className="n" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {item.icon}
              </svg>
            </span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
