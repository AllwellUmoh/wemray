import Button from '../ui/Button';

const ArrowUpRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const cards = [
  {
    tag: '01 — BRAND',
    title: <>Brand that<br />commands attention.</>,
    chips: ['Identity', 'Corporate', 'Events'],
  },
  {
    tag: '02 — BUILD',
    title: <>Software built<br />to scale.</>,
    chips: ['Web', 'SaaS', 'Mobile'],
  },
  {
    tag: '03 — INTELLIGENCE',
    title: <>Systems that<br />think with you.</>,
    chips: ['AI', 'Automation', 'SEO'],
  },
];

export default function HomeHero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true">
        <div className="bl l0 on" />
        <div className="bl l1" />
        <div className="bl l2" />
        <div className="ov" />
        <div className="gr" />
        <div className="pxf" id="pxHero" />
        <div className="orb o1" />
        <div className="orb o2" />
      </div>
      <div className="hero-txt">
        <h1 id="hTitle" aria-label="Build What Moves You Forward">
          <span className="ln">
            Build What Moves
            <svg className="spark" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" />
            </svg>
          </span>
          <span className="ln">
            You{' '}
            <span className="fw">
              Forward
              <svg className="circ" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                <path
                  pathLength={1}
                  d="M30 62C14 36 78 10 156 9c82-1 138 18 132 48-6 30-86 40-160 36C58 89 8 74 16 46 22 26 70 12 118 7"
                />
              </svg>
            </span>
          </span>
        </h1>
        <p className="sub">
          We design and build digital products, platforms and experiences for ambitious businesses in Port Harcourt,
          Lagos, Nigeria, London, the UK and Canada.
        </p>
        <div className="ctas">
          <Button to="/contact" variant="lav" arrow>Start a Conversation</Button>
          <Button href="#capabilities" variant="ghost">Explore Our Capabilities</Button>
        </div>
      </div>
      <div className="hv2" aria-roledescription="carousel" aria-label="What we do">
        <div className="dk" id="dk" tabIndex={0} aria-live="polite">
          {cards.map((card, index) => (
            <article
              className={`dk-card c${index}`}
              data-i={index}
              style={{ '--p': index }}
              data-p={index}
              key={card.tag}
            >
              <div className="dk-in">
                <div className="dk-img" />
                <div className="dk-shade" />
                <span className="dk-tag"><i />{card.tag}</span>
                <i className="dk-frame" aria-hidden="true" />
                <i className="dk-grid" aria-hidden="true" />
                <span className="dk-num" aria-hidden="true">{`0${index + 1}`}</span>
                <span className="dk-go" aria-hidden="true"><ArrowUpRight /></span>
                <i className="dk-bar" />
                <h3>{card.title}</h3>
                <div className="dk-chips">
                  {card.chips.map((chip) => <b key={chip}>{chip}</b>)}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="dk-ctl">
          <div className="dk-dots" id="dkD">
            <span className="on" />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
