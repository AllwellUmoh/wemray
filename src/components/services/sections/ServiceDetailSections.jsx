import AppLink from '../../ui/AppLink';
import Button from '../../ui/Button';
import CTASection from '../../ui/CTASection';

function splitTitle(title) {
  const words = title.split(' ');
  const middle = Math.ceil(words.length / 2);
  return {
    lead: words.slice(0, middle).join(' '),
    rest: words.slice(middle).join(' '),
  };
}

function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function ServiceDetailHeroSection({ service }) {
  const { lines, sub, badge, hero, ctas } = service;
  const primary = ctas?.[0];
  const secondary = ctas?.[1];

  return (
    <section className="hero ah sp-h sp-long" id="top">
      <div className="hero-bg" aria-hidden="true">
        <div
          className="bl l1 on"
          style={{ backgroundImage: `url(${service.approach.img}), linear-gradient(135deg, #1a2a8a, #00002e)` }}
        />
        <div className="ov" />
        <div className="gr" />
        <div className="pxf" id="pxHero" />
        <div className="orb o1" />
        <div className="orb o2" />
      </div>
      <div className="hero-txt">
        <nav className="sp-bc" aria-label="Breadcrumb">
          <AppLink href="/services">Services</AppLink>
          <i>/</i>
          <span>{service.name}</span>
        </nav>
        <div className="eb">
          <span className="pd" />
          {service.eyebrow}
        </div>
        <h1 aria-label={service.title}>
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
        <p className="sub">{sub}</p>
        <div className="ctas">
          {primary ? (
            <Button href={primary.href} variant={primary.style || 'lav'} arrow>
              {primary.label}
            </Button>
          ) : null}
          {secondary ? (
            <Button href={secondary.href} variant={secondary.style || 'ghost'}>
              {secondary.label}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="sp-v" id="spv" aria-hidden="true">
        <i className="sp-dots" />
        <div className="sp-ph main">
          <img src={hero.main} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="sp-ph sm">
          <img src={hero.small} alt="" loading="lazy" decoding="async" />
        </div>
        <svg className="sp-badge" viewBox="0 0 200 200">
          <defs>
            <path id="bc" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0" />
          </defs>
          <circle cx="100" cy="100" r="98" className="bg" />
          <text textLength="486" lengthAdjust="spacing">
            <textPath href="#bc" startOffset="0">
              {badge}
            </textPath>
          </text>
          <path className="ar" d="M80 120l40-40M88 80h32v32" />
        </svg>
        {(service.tags || []).slice(0, 2).map((tag, index) => (
          <span className={`vn-tag t${index + 1}`} key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <AppLink className="scrl" href="#why" aria-label="Scroll to content">
        <i />
        Scroll
      </AppLink>
    </section>
  );
}

export function ServiceDetailWhySection({ service }) {
  const { why } = service;
  const whyTitle = splitTitle(why.title);
  const tags = service.tags || [];

  return (
    <section className="sp-in" id="why">
      <div className="sp-in-g">
        <div className="sp-in-l">
          <p className="ab-eb">
            <i />
            {service.name}
          </p>
          <h2>
            {whyTitle.lead} <span>{whyTitle.rest}</span>
          </h2>
          <p className="ab-lead">{why.lead}</p>
          <div className="sp-chips">
            {tags.map((tag) => (
              <b key={tag}>{tag}</b>
            ))}
          </div>
        </div>
        <div className="sp-in-r">
          <div className="sp-fr">
            <i className="sp-dots d2" />
            <div className="sp-ph tall">
              <img src={why.img} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="sp-cap">
              <span className="k">
                <i />
                What it does
              </span>
              <p>{why.cap}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServiceDetailCreateSection({ service }) {
  const { create } = service;
  const createTitle = splitTitle(create.title);

  return (
    <section className="sp-ex" id="create">
      <div className="sh">
        <p className="ab-eb">
          <i />
          Capabilities
        </p>
        <h2>
          {createTitle.lead} <span>{createTitle.rest}</span>
        </h2>
      </div>
      <div className="sx-g">
        <div className="sx-list" role="tablist" aria-label={create.title}>
          {create.items.map((item, index) => (
            <button
              type="button"
              className={`sx-i${index === 0 ? ' on' : ''}`}
              data-i={index}
              role="tab"
              aria-selected={index === 0}
              key={`${item.title}-${index}`}
            >
              <em>{`0${index + 1}`}</em>
              <span>
                <b>{item.title}</b>
                <small>{item.desc}</small>
              </span>
              <i className="sx-a">
                <Arrow />
              </i>
            </button>
          ))}
        </div>
        <div className="sx-stage" id="sxStage">
          <div className="sx-fb" aria-hidden="true" />
          {create.figures.map((figure, index) => (
            <figure className={`sx-s${index === 0 ? ' on' : ''}`} data-i={index} key={`${figure.caption}-${index}`}>
              <img src={figure.img} alt="" loading="lazy" decoding="async" />
              <figcaption>
                <span className="big" aria-hidden="true">
                  {`0${index + 1}`}
                </span>
                <b>{figure.caption}</b>
                <small>{create.items[index]?.desc || figure.caption}</small>
              </figcaption>
            </figure>
          ))}
          <i className="sx-bar" id="sxBar" />
          <span className="sx-c" id="sxC">
            01 / 05
          </span>
        </div>
      </div>
    </section>
  );
}

export function ServiceDetailApproachSection({ service }) {
  const { approach } = service;

  return (
    <section className="sp-ap" id="approach">
      <div className="ap-bg" aria-hidden="true">
        <img src={approach.img} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="ap-in">
        <div className="ap-hd">
          <div className="eb">Our Approach</div>
          <h2>
            How we <em>approach it</em>
          </h2>
          <p>{approach.lead}</p>
        </div>
        <ol className="ap-st" id="apSt">
          <i className="ap-ln">
            <b />
          </i>
          {approach.steps.map((step, index) => (
            <li className="ap-s" style={{ '--n': index }} key={step.t}>
              <span className="ap-n">{`0${index + 1}`}</span>
              <h3>{step.t}</h3>
              <p>{step.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ServiceDetailCtaSection({ service }) {
  const primary = service?.ctas?.[0];

  if (service?.slug === 'seo') {
    return (
      <CTASection
        primaryHref={primary?.href}
        cardOneTitle="Take the SEO Analysis"
        cardOneCopy="Run a free, evidence-backed audit of a page and get clear, prioritised fixes."
        cardOneHref="/tools/ray-seo-analyser"
        cardTwoTitle="Contact us"
        cardTwoCopy="Tell us about your website and search goals, and we will help you plan the next step."
        cardTwoHref="/contact?service=seo"
      />
    );
  }

  return (
    <CTASection
      primaryLabel={primary?.label}
      primaryHref={primary?.href}
      cardOneTitle="Start a conversation"
      cardOneCopy="Tell us what you want to build or improve, and we will help you find the right starting point."
      cardTwoTitle="See our work"
      cardTwoCopy="Browse selected projects across branding, software, and digital solutions."
    />
  );
}

export default function ServiceDetailSections({ service }) {
  return (
    <>
      <ServiceDetailHeroSection service={service} />
      <ServiceDetailWhySection service={service} />
      <ServiceDetailCreateSection service={service} />
      <ServiceDetailApproachSection service={service} />
      <ServiceDetailCtaSection service={service} />
    </>
  );
}
