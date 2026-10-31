import Button from './Button';

export default function FaqSection({
  id = 'faq',
  eyebrow = 'FAQs',
  title,
  lead,
  items = [],
  cta,
  className = '',
}) {
  return (
    <section className={`fq-s ${className}`.trim()} id={id}>
      <div className="fq-grid">
        <div className="fq-l">
          <p className="ab-eb">
            <i />
            {eyebrow}
          </p>
          <h2>{title}</h2>
          {lead ? <p className="ab-lead">{lead}</p> : null}
          {cta ? (
            <Button href={cta.href} to={cta.to} variant={cta.variant || 'pur'} arrow>
              {cta.label}
            </Button>
          ) : null}
        </div>
        <div className="fq-list">
          {items.map((item, index) => (
            <details className="fq rv" name={`${id}-accordion`} open={index === 0} key={item.q}>
              <summary>
                <em>{String(index + 1).padStart(2, '0')}</em>
                <span>{item.q}</span>
                <i className="pl">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </i>
              </summary>
              <div className="fa">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
