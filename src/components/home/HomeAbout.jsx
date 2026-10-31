import Button from '../ui/Button';

const pillars = [
  {
    title: 'Strategy',
    copy: 'Research and direction that give every project a clear purpose.',
    icon: (
      <>
        <circle cx={12} cy={12} r={10} />
        <circle cx={12} cy={12} r={6} />
        <circle cx={12} cy={12} r={2} />
      </>
    ),
  },
  {
    title: 'Design',
    copy: 'Brand identities and interfaces people recognise and trust.',
    icon: (
      <>
        <circle cx="13.5" cy="6.5" r=".5" />
        <circle cx="17.5" cy="10.5" r=".5" />
        <circle cx="8.5" cy="7.5" r=".5" />
        <circle cx="6.5" cy="12.5" r=".5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </>
    ),
  },
  {
    title: 'Engineering',
    copy: 'Websites, SaaS, mobile apps and custom systems built to last.',
    icon: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </>
    ),
  },
  {
    title: 'Intelligence',
    copy: 'AI solutions and automation that cut repetitive work.',
    icon: (
      <>
        <path d="M12 8V4H8" />
        <rect width={16} height={12} x={4} y={8} rx={2} />
        <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
      </>
    ),
  },
];

export default function HomeAbout() {
  return (
    <section className="about band" id="about">
      <div className="ab-wrap">
        <div className="ab-l">
          <p className="ab-eb"><i />About Wemray</p>
          <h2>One Team. <span>One Direction.</span> Every Capability You Need.</h2>
          <p className="ab-lead">
            Brand, software, and AI work best in concert. At Wemray,{' '}
            <b>strategy, design, engineering, and intelligence move together</b>, from your first conversation to the
            finished solution, and well beyond launch.
          </p>
          <Button to="/about" variant="pur" arrow>More about us</Button>
        </div>
        <div className="ab-r">
          <div className="ab-grid">
            {pillars.map((pillar, index) => (
              <article className={`abp${index === 0 ? ' f' : ''}`} key={pillar.title}>
                <span className="abn">{`0${index + 1}`}</span>
                <span className="abi">
                  <svg
                    className="ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {pillar.icon}
                  </svg>
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
            <span className="ab-hub" aria-hidden="true"><img data-logo src="/logo.png" alt="" /></span>
          </div>
          <div className="ab-stats stats" id="stats">
            <div className="stat" style={{ '--d': '.1s' }}>
              <div className="n" data-to={9}>0</div>
              <p>capabilities, one connected team</p>
            </div>
            <div className="stat" style={{ '--d': '.35s' }}>
              <div className="n" data-to={3}>0</div>
              <p>stages in the Ray Blueprint, from insight to impact</p>
            </div>
            <div className="stat" style={{ '--d': '.6s' }}>
              <div className="n" data-to={6}>0</div>
              <p>principles, one standard in every project</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
