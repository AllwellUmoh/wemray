import AppLink from './AppLink';

const Arrow = () => (
  <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function CTASection({
  eyebrow = 'Ready to start?',
  title = (
    <>
      Build for progress, <em>not for passing trends.</em>
    </>
  ),
  copy = 'Whether you have an idea to build or a process to improve, we choose technology for what it does for you, and plan for security, stability, and growth from day one.',
  primaryHref = 'contact.html',
  cardOneTitle = 'Start a conversation',
  cardOneCopy = 'Tell us what you want to build or improve, and we will help you find the right starting point.',
  cardTwoTitle = 'See our work',
  cardTwoCopy = 'Browse selected projects across branding, software, and digital solutions.',
  cardTwoHref = 'portfolio.html',
}) {
  return (
    <section className="cta band" id="cta">
      <div className="ctg">
        <div className="ctl">
          <div className="eb">{eyebrow}</div>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
        <div className="ctc" id="ctv">
          <AppLink className="cc main" href={primaryHref}>
            <span className="ci" id="ci1" />
            <div>
              <h3>{cardOneTitle}</h3>
              <p>{cardOneCopy}</p>
            </div>
            <span className="cgo"><Arrow /></span>
          </AppLink>
          <AppLink className="cc" href={cardTwoHref}>
            <span className="ci" id="ci2" />
            <div>
              <h3>{cardTwoTitle}</h3>
              <p>{cardTwoCopy}</p>
            </div>
            <span className="cgo"><Arrow /></span>
          </AppLink>
        </div>
      </div>
    </section>
  );
}
