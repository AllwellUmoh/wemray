import AppLink from '../../ui/AppLink';
import Button from '../../ui/Button';
import ServiceGrid from '../../services/ServiceGrid';

export function ServicesHeroSection() {
  return (
    <section className="hero ah sv-h" id="top">
      <div className="hero-bg" aria-hidden="true"><div className="bl l1 on" /><div className="ov" /><div className="gr" /><div className="pxf" id="pxHero" /><div className="orb o1" /><div className="orb o2" /></div>
      <div className="hero-txt">
        <h1 id="hTitle" aria-label="Solutions Built Around You. Engineered to Grow with You."><span className="ln"><i>Solutions Built</i></span><span className="ln"><i>Around You.</i></span><span className="ln"><i><span className="fw">Engineered to Grow</span></i></span><span className="ln"><i><span className="fw">with You.</span></i><svg className="ul" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M4 16C80 4 150 22 220 12S340 6 396 14" /></svg></span></h1>
        <p className="sub">From a focused project to full-scale transformation, we assemble the right capabilities for businesses in Port Harcourt, Lagos, Nigeria, London, the UK and Canada.</p>
        <div className="ctas">
          <Button href="contact.html" variant="lav" arrow>Discuss Your Project</Button>
          <Button href="#capabilities" variant="ghost">See the Nine Capabilities</Button>
        </div>
      </div>
      <div className="svn" id="svn">
        <i className="vn-ring r1"><b /></i><i className="vn-ring r2"><b /><b className="b2" /></i>
      </div>
      <AppLink className="scrl" href="#capabilities" aria-label="Scroll to content"><i />Scroll</AppLink>
    </section>
  );
}

export function ServicesGridSection() {
  return (
    <section className="svc-s" id="capabilities">
      <div className="sh"><p className="ab-eb"><i />What We Do</p><h2>Nine Capabilities. <span>One Connected Team.</span></h2></div>
      <ServiceGrid />
    </section>
  );
}

export function ServicesCtaSection() {
  return (
    <section className="cta band" id="cta">
      <div className="ctg">
        <div className="ctl">
          <div className="eb">Ready to start?</div>
          <h2>Build for progress, <em>not for passing trends.</em></h2>
          <p>Whether you have an idea to build or a process to improve, we choose technology for what it does for you, and plan for security, stability, and growth from day one.</p>
          <div className="row">
            <Button href="contact.html" variant="lav" arrow>Discuss Your Project</Button>
            <Button href="mailto:hello@wemray.com" variant="ghost">hello@wemray.com</Button>
          </div>
        </div>
        <div className="ctc" id="ctv">
          <AppLink className="cc main" href="contact.html"><span className="ci" id="ci1" /><div><h3>Start a conversation</h3><p>Tell us what you want to build or improve, and we will help you find the right starting point.</p></div><span className="cgo"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></span></AppLink>
          <AppLink className="cc" href="portfolio.html"><span className="ci" id="ci2" /><div><h3>See our work</h3><p>Browse selected projects across branding, software, and digital solutions.</p></div><span className="cgo"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></span></AppLink>
        </div>
      </div>
    </section>
  );
}

export default function ServicesSections() {
  return (
    <>
      <ServicesHeroSection />
      <ServicesGridSection />
      <ServicesCtaSection />
    </>
  );
}
