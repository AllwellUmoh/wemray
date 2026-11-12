import AppLink from './AppLink';
import Button from './Button';

export default function PageHero({
  lines = [],
  sub,
  primary,
  secondary,
  visual,
  className = '',
  scrollHref,
  scrollLabel = 'Scroll',
}) {
  const label = lines.map((line) => line.t).join(' ');

  return (
    <section className={`hero ah ct-h ${className}`.trim()} id="top">
      <div className="hero-bg" aria-hidden="true">
        <div className="bl l1 on" />
        <div className="ov" />
        <div className="gr" />
        <div className="pxf" id="pxHero" />
        <div className="orb o1" />
        <div className="orb o2" />
      </div>
      <div className="hero-txt">
        <h1 aria-label={label}>
          {lines.map((line, index) => (
            <span className="ln" key={`${line.t}-${index}`}>
              <i>
                {line.fw ? <span className="fw">{line.t}</span> : line.t}
                {index === lines.length - 1 ? (
                  <svg className="ul" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
                    <path pathLength={1} d="M4 16C80 4 150 22 220 12S340 6 396 14" />
                  </svg>
                ) : null}
              </i>
            </span>
          ))}
        </h1>
        {sub ? <p className="sub">{sub}</p> : null}
        {primary || secondary ? (
          <div className="ctas">
            {primary ? (
              <Button
                to={primary.to}
                href={primary.href}
                variant={primary.variant || 'lav'}
                arrow={primary.arrow !== false}
              >
                {primary.label}
              </Button>
            ) : null}
            {secondary ? (
              <Button
                to={secondary.to}
                href={secondary.href}
                variant={secondary.variant || 'ghost'}
                arrow={secondary.arrow}
              >
                {secondary.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      {visual}
      {scrollHref ? (
        <AppLink className="scrl" href={scrollHref} aria-label={`Scroll to ${scrollLabel}`}>
          <i />
          {scrollLabel}
        </AppLink>
      ) : null}
    </section>
  );
}
