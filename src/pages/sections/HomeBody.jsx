import Button from '../../components/ui/Button';
import CTASection from '../../components/ui/CTASection';
import ServiceCard from '../../components/services/ServiceCard';
import { capabilities } from '../../data/services';

export default function HomeBody() {
  return (
    <>
      {/* 1 · HERO */}
        <section className="hero" id="top">
          <div className="hero-bg" aria-hidden="true"><div className="bl l0 on" /><div className="bl l1" /><div className="bl l2" /><div className="ov" /><div className="gr" /><div className="pxf" id="pxHero" /><div className="orb o1" /><div className="orb o2" /></div>
          <div className="hero-txt">
            <h1 id="hTitle" aria-label="Build What Moves You Forward"><span className="ln">Build What Moves<svg className="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" /></svg></span><span className="ln">You <span className="fw">Forward<svg className="circ" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M30 62C14 36 78 10 156 9c82-1 138 18 132 48-6 30-86 40-160 36C58 89 8 74 16 46 22 26 70 12 118 7" /></svg></span></span></h1>
            <p className="sub">We design and build digital products, platforms and experiences that help ambitious businesses move forward.</p>
            <div className="ctas">
              <Button to="/contact" variant="lav" arrow>Start a Conversation</Button>
              <Button href="#capabilities" variant="ghost">Explore Our Capabilities</Button>
            </div>
          </div>
          <div className="hv2" aria-roledescription="carousel" aria-label="What we do">
            <div className="dk" id="dk" tabIndex={0} aria-live="polite">
              <article className="dk-card c0" data-i={0} style={{'--p': 0}} data-p={0}>
                <div className="dk-in"><div className="dk-img" /><div className="dk-shade" />
                  <span className="dk-tag"><i />01 · BRAND</span><i className="dk-frame" aria-hidden="true" /><i className="dk-grid" aria-hidden="true" /><span className="dk-num" aria-hidden="true">01</span><span className="dk-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg></span>
                  <i className="dk-bar" /><h3>Brand that<br />commands attention.</h3>
                  <div className="dk-chips"><b>Identity</b><b>Corporate</b><b>Events</b></div>
                </div></article>
              <article className="dk-card c1" data-i={1} style={{'--p': 1}} data-p={1}>
                <div className="dk-in"><div className="dk-img" /><div className="dk-shade" />
                  <span className="dk-tag"><i />02 · BUILD</span><i className="dk-frame" aria-hidden="true" /><i className="dk-grid" aria-hidden="true" /><span className="dk-num" aria-hidden="true">02</span><span className="dk-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg></span>
                  <i className="dk-bar" /><h3>Software built<br />to scale.</h3>
                  <div className="dk-chips"><b>Web</b><b>SaaS</b><b>Mobile</b></div>
                </div></article>
              <article className="dk-card c2" data-i={2} style={{'--p': 2}} data-p={2}>
                <div className="dk-in"><div className="dk-img" /><div className="dk-shade" />
                  <span className="dk-tag"><i />03 · INTELLIGENCE</span><i className="dk-frame" aria-hidden="true" /><i className="dk-grid" aria-hidden="true" /><span className="dk-num" aria-hidden="true">03</span><span className="dk-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg></span>
                  <i className="dk-bar" /><h3>Systems that<br />think with you.</h3>
                  <div className="dk-chips"><b>AI</b><b>Automation</b><b>SEO</b></div>
                </div></article>
            </div>
            <div className="dk-ctl">
              <div className="dk-dots" id="dkD"><span className="on" /><span /><span /></div>
            </div>
          </div>
        </section>
        {/* 1b · CLIENTS */}
        <section className="clients" id="clients" aria-label="Our clients">
          <div className="cl-wrap"><div className="cl-track" id="clTrack" /></div>
        </section>
        {/* 2 · ABOUT / ONE TEAM */}
        <section className="about band" id="about">
          <div className="ab-wrap">
            <div className="ab-l">
              <p className="ab-eb"><i />About Wemray</p>
              <h2>One Team. <span>One Direction.</span> Every Capability You Need.</h2>
              <p className="ab-lead">Brand, software, and AI work best in concert. At Wemray, <b>strategy, design, engineering, and intelligence move together</b>, from your first conversation to the finished solution, and well beyond launch.</p>
              <Button to="/about" variant="pur" arrow>More about us</Button>
            </div>
            <div className="ab-r">
              <div className="ab-grid">
                <article className="abp f"><span className="abn">01</span><span className="abi"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx={12} cy={12} r={10} /><circle cx={12} cy={12} r={6} /><circle cx={12} cy={12} r={2} /></svg></span><h3>Strategy</h3><p>Research and direction that give every project a clear purpose.</p></article>
                <article className="abp "><span className="abn">02</span><span className="abi"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg></span><h3>Design</h3><p>Brand identities and interfaces people recognise and trust.</p></article>
                <article className="abp "><span className="abn">03</span><span className="abi"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg></span><h3>Engineering</h3><p>Websites, SaaS, mobile apps and custom systems built to last.</p></article>
                <article className="abp "><span className="abn">04</span><span className="abi"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 8V4H8" /><rect width={16} height={12} x={4} y={8} rx={2} /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></svg></span><h3>Intelligence</h3><p>AI solutions and automation that cut repetitive work.</p></article>
                <span className="ab-hub" aria-hidden="true"><img data-logo src="/logo.png" alt=""  /></span>
              </div>
              <div className="ab-stats stats" id="stats">
                <div className="stat" style={{'--d': '.1s'}}><div className="n" data-to={9}>0</div><p>capabilities, one connected team</p></div>
                <div className="stat" style={{'--d': '.35s'}}><div className="n" data-to={3}>0</div><p>stages in the Ray Blueprint, from insight to impact</p></div>
                <div className="stat" style={{'--d': '.6s'}}><div className="n" data-to={6}>0</div><p>principles, one standard in every project</p></div>
              </div>
            </div>
          </div>
        </section>
        {/* 3 · THREE WAYS (pinned) */}
        <section className="pin ww" id="ww"><div className="stick">
            <div className="wl"><p className="eb">What we do</p>
              <h2>Three ways we move you forward</h2></div>
            <div className="wc"><span className="no" id="wno">01</span><div className="wt" id="wt"><h3 /><p /></div><div className="vis" id="vis" /></div>
          </div></section>
        {/* 4 · NINE CAPABILITIES (horizontal pin) */}
        <section className="cap band" id="capabilities">
          <div className="stk">
            <div className="top">
              <div className="eb">Our services</div>
              <div className="navs">
                <button id="cPrev" aria-label="Previous"><svg className="arr" viewBox="0 0 24 24"><path d="M20 12H4M11 5l-7 7 7 7" /></svg></button>
                <button id="cNext" aria-label="Next"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></button>
              </div>
            </div>
            <h2>Nine capabilities. One connected team.</h2>
            <div className="track" id="track">
              {capabilities.map((service, index) => (
                <ServiceCard key={service.slug} service={service} index={index} />
              ))}
              <i className="sp" />
            </div>
          </div>
        </section>
        {/* 5 · RAY BLUEPRINT (stacked cards) */}
        <section className="how band" id="how">
          <div className="stk">
            <div className="hl"><div className="eb">How we work</div>
              <div className="tt">The Ray Blueprint<small>From insight to impact. Three stages. One clear direction.</small></div></div>
            <div className="stage">
              <div className="stepper" id="stepper"><span className="on">01</span><span>02</span><span>03</span></div>
              <div className="deck" id="deck" />
            </div>
          </div>
        </section>
        {/* 6 · WHY WEMRAY */}
        <section className="why band" id="why">
          <div className="pxf" id="pxWhy" />
          <div className="eb">Why Wemray</div>
          <h2>Six principles. One standard.</h2>
          <div className="flow" id="flow"><i className="fline" /></div>
        </section>
        {/* 7 · PORTFOLIO */}
        <section className="work band" id="work">
          <div className="whead">
            <div><p className="eb">Portfolio</p><h2>Purposeful ideas. Thoughtfully delivered.</h2><p className="wsub">Selected projects across branding, software, and digital solutions.</p></div>
            <div className="navs"><button id="pPrev" aria-label="Previous project"><svg className="arr" viewBox="0 0 24 24"><path d="M20 12H4M11 5l-7 7 7 7" /></svg></button><button id="pNext" aria-label="Next project"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></button></div>
          </div>
          <div className="pf" id="pf" aria-roledescription="carousel" aria-label="Portfolio"><div className="pstage" id="pstage" /></div>
          <div className="pdots" id="pdots" />
          <div className="pcta"><Button to="/portfolio" variant="pur" arrow>Explore Our Work</Button></div>
        </section>
        {/* 8 · RAY ACADEMY */}
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
        {/* 9 · CTA */}
        <CTASection primaryLabel="Start a Conversation" primaryHref="contact.html" />
        {/* 10 · FOOTER */}
    </>
  );
}
