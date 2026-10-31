import AppLink from '../../components/ui/AppLink';
import Button from '../../components/ui/Button';
import ServiceGrid from '../../components/services/ServiceGrid';

export default function ServicesBody() {
  return (
    <>
      {/* 1 Â· HERO */}
        <section className="hero ah sv-h" id="top">
          <div className="hero-bg" aria-hidden="true"><div className="bl l1 on" /><div className="ov" /><div className="gr" /><div className="pxf" id="pxHero" /><div className="orb o1" /><div className="orb o2" /></div>
          <div className="hero-txt">
            <div className="eb"><span className="pd" />Our Services</div>
            <h1 id="hTitle" aria-label="Solutions Built Around You. Engineered to Grow with You."><span className="ln"><i>Solutions Built</i></span><span className="ln"><i>Around You.</i></span><span className="ln"><i><span className="fw">Engineered to Grow</span></i></span><span className="ln"><i><span className="fw">with You.</span></i><svg className="ul" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M4 16C80 4 150 22 220 12S340 6 396 14" /></svg></span></h1>
            <p className="sub">From a focused project to full-scale transformation, we assemble the right capabilities to move you forward.</p>
            <div className="ctas">
              <Button href="contact.html" variant="lav" arrow>Discuss Your Project</Button>
              <Button href="#capabilities" variant="ghost">See the Nine Capabilities</Button>
            </div>
          </div>
          <div className="svn" id="svn">
            <i className="vn-ring r1"><b /></i><i className="vn-ring r2"><b /><b className="b2" /></i>
            <svg className="svn-svg" viewBox="0 0 100 100" role="group" aria-label="Nine connected capabilities"><g className="lg"><path d="M20 20L50 20" /><path d="M50 20L80 20" /><path d="M20 50L50 50" /><path d="M50 50L80 50" /><path d="M20 80L50 80" /><path d="M50 80L80 80" /><path d="M20 20L20 50" /><path d="M20 50L20 80" /><path d="M50 20L50 50" /><path d="M50 50L50 80" /><path d="M80 20L80 50" /><path d="M80 50L80 80" /><path className="dg" d="M20 20L50 50" /><path className="dg" d="M80 20L50 50" /><path className="dg" d="M20 80L50 50" /><path className="dg" d="M80 80L50 50" /></g><circle className="sg" r="1.7"><animateMotion dur="10s" repeatCount="indefinite" path="M20 20L50 20L80 20L80 50L50 50L20 50L20 80L50 80L80 80" /></circle><circle className="sg2" r="4.2"><animateMotion dur="10s" repeatCount="indefinite" path="M20 20L50 20L80 20L80 50L50 50L20 50L20 80L50 80L80 80" /></circle><AppLink className="nd" href="/services/branding" data-i={0} style={{'--dl': '0.0s'}} aria-label="Corporate & Event Branding"><circle className="ndr" cx={20} cy={20} r="10.5" /><circle className="ndc" cx={20} cy={20} r="8.6" /><g transform="translate(14.6 14.6) scale(.45)" className="ndi" data-ic={0} /><text className="ndn" x={20} y="35.2">01</text></AppLink><AppLink className="nd" href="/services/website" data-i={1} style={{'--dl': '1.25s'}} aria-label="Website Development"><circle className="ndr" cx={50} cy={20} r="10.5" /><circle className="ndc" cx={50} cy={20} r="8.6" /><g transform="translate(44.6 14.6) scale(.45)" className="ndi" data-ic={1} /><text className="ndn" x={50} y="35.2">02</text></AppLink><AppLink className="nd" href="/services/saas" data-i={2} style={{'--dl': '2.5s'}} aria-label="SaaS Product Development"><circle className="ndr" cx={80} cy={20} r="10.5" /><circle className="ndc" cx={80} cy={20} r="8.6" /><g transform="translate(74.6 14.6) scale(.45)" className="ndi" data-ic={2} /><text className="ndn" x={80} y="35.2">03</text></AppLink><AppLink className="nd" href="/services/mobile" data-i={3} style={{'--dl': '6.25s'}} aria-label="Mobile Application Development"><circle className="ndr" cx={20} cy={50} r="10.5" /><circle className="ndc" cx={20} cy={50} r="8.6" /><g transform="translate(14.6 44.6) scale(.45)" className="ndi" data-ic={3} /><text className="ndn" x={20} y="65.2">04</text></AppLink><AppLink className="nd" href="/services/software" data-i={4} style={{'--dl': '5.0s'}} aria-label="Custom Software & Business Systems"><circle className="ndr" cx={50} cy={50} r="10.5" /><circle className="ndc" cx={50} cy={50} r="8.6" /><g transform="translate(44.6 44.6) scale(.45)" className="ndi" data-ic={4} /><text className="ndn" x={50} y="65.2">05</text></AppLink><AppLink className="nd" href="/services/ai" data-i={5} style={{'--dl': '3.75s'}} aria-label="AI Solutions & Intelligent Agents"><circle className="ndr" cx={80} cy={50} r="10.5" /><circle className="ndc" cx={80} cy={50} r="8.6" /><g transform="translate(74.6 44.6) scale(.45)" className="ndi" data-ic={5} /><text className="ndn" x={80} y="65.2">06</text></AppLink><AppLink className="nd" href="/services/automation" data-i={6} style={{'--dl': '7.5s'}} aria-label="Workflow Automation"><circle className="ndr" cx={20} cy={80} r="10.5" /><circle className="ndc" cx={20} cy={80} r="8.6" /><g transform="translate(14.6 74.6) scale(.45)" className="ndi" data-ic={6} /><text className="ndn" x={20} y="95.2">07</text></AppLink><AppLink className="nd" href="/services/seo" data-i={7} style={{'--dl': '8.75s'}} aria-label="Search Engine Optimization (SEO)"><circle className="ndr" cx={50} cy={80} r="10.5" /><circle className="ndc" cx={50} cy={80} r="8.6" /><g transform="translate(44.6 74.6) scale(.45)" className="ndi" data-ic={7} /><text className="ndn" x={50} y="95.2">08</text></AppLink><AppLink className="nd" href="/academy" data-i={8} style={{'--dl': '10.0s'}} aria-label="Technology & Digital Skills Training"><circle className="ndr" cx={80} cy={80} r="10.5" /><circle className="ndc" cx={80} cy={80} r="8.6" /><g transform="translate(74.6 74.6) scale(.45)" className="ndi" data-ic={8} /><text className="ndn" x={80} y="95.2">09</text></AppLink></svg>
          </div>
          <AppLink className="scrl" href="#capabilities" aria-label="Scroll to content"><i />Scroll</AppLink>
        </section>
        {/* 2 Â· NINE CAPABILITIES */}
        <section className="svc-s" id="capabilities">
          <div className="sh"><p className="ab-eb"><i />What We Do</p><h2>Nine Capabilities. <span>One Connected Team.</span></h2></div>
          <ServiceGrid />
        </section>
        {/* 4 Â· ONE NEED OR MANY */}
        <section className="one" id="connected">
          <div className="pxf" id="pxOne" />
          <div className="one-in">
            <div className="one-l">
              <div className="eb">One Connected Approach</div>
              <h2>One Need or Many. <em>One Connected Approach.</em></h2>
              <div className="one-sw" role="tablist" aria-label="Project scope"><button type="button" className="on" data-m="one" role="tab" aria-selected="true">One need</button><button type="button" data-m="many" role="tab" aria-selected="false">Many needs</button><i /></div>
              <div className="one-t">
                <p data-m="one" className="on">Some challenges call for a single solution.</p>
                <p data-m="many">Others call for strategy, design, technology, and continued improvement working together.</p>
              </div>
              <p className="one-f">We help you find the right fit.</p>
              <Button href="contact.html" variant="lav" arrow>Discuss Your Project</Button>
            </div>
            <div className="one-r" id="oneNet" data-m="one">
              <svg className="one-svg" viewBox="0 0 100 100" role="group" aria-label="Nine connected capabilities"><g className="lg"><path d="M20 20L50 20" /><path d="M50 20L80 20" /><path d="M20 50L50 50" /><path d="M50 50L80 50" /><path d="M20 80L50 80" /><path d="M50 80L80 80" /><path d="M20 20L20 50" /><path d="M20 50L20 80" /><path d="M50 20L50 50" /><path d="M50 50L50 80" /><path d="M80 20L80 50" /><path d="M80 50L80 80" /><path className="dg" d="M20 20L50 50" /><path className="dg" d="M80 20L50 50" /><path className="dg" d="M20 80L50 50" /><path className="dg" d="M80 80L50 50" /></g><AppLink className="nd" href="/services/branding" data-i={0} style={{'--dl': '0.0s'}} aria-label="Corporate & Event Branding"><circle className="ndr" cx={20} cy={20} r="10.5" /><circle className="ndc" cx={20} cy={20} r="8.6" /><g transform="translate(14.6 14.6) scale(.45)" className="ndi" data-ic={0} /><text className="ndn" x={20} y="35.2">01</text></AppLink><AppLink className="nd" href="/services/website" data-i={1} style={{'--dl': '1.25s'}} aria-label="Website Development"><circle className="ndr" cx={50} cy={20} r="10.5" /><circle className="ndc" cx={50} cy={20} r="8.6" /><g transform="translate(44.6 14.6) scale(.45)" className="ndi" data-ic={1} /><text className="ndn" x={50} y="35.2">02</text></AppLink><AppLink className="nd" href="/services/saas" data-i={2} style={{'--dl': '2.5s'}} aria-label="SaaS Product Development"><circle className="ndr" cx={80} cy={20} r="10.5" /><circle className="ndc" cx={80} cy={20} r="8.6" /><g transform="translate(74.6 14.6) scale(.45)" className="ndi" data-ic={2} /><text className="ndn" x={80} y="35.2">03</text></AppLink><AppLink className="nd" href="/services/mobile" data-i={3} style={{'--dl': '6.25s'}} aria-label="Mobile Application Development"><circle className="ndr" cx={20} cy={50} r="10.5" /><circle className="ndc" cx={20} cy={50} r="8.6" /><g transform="translate(14.6 44.6) scale(.45)" className="ndi" data-ic={3} /><text className="ndn" x={20} y="65.2">04</text></AppLink><AppLink className="nd" href="/services/software" data-i={4} style={{'--dl': '5.0s'}} aria-label="Custom Software & Business Systems"><circle className="ndr" cx={50} cy={50} r="10.5" /><circle className="ndc" cx={50} cy={50} r="8.6" /><g transform="translate(44.6 44.6) scale(.45)" className="ndi" data-ic={4} /><text className="ndn" x={50} y="65.2">05</text></AppLink><AppLink className="nd" href="/services/ai" data-i={5} style={{'--dl': '3.75s'}} aria-label="AI Solutions & Intelligent Agents"><circle className="ndr" cx={80} cy={50} r="10.5" /><circle className="ndc" cx={80} cy={50} r="8.6" /><g transform="translate(74.6 44.6) scale(.45)" className="ndi" data-ic={5} /><text className="ndn" x={80} y="65.2">06</text></AppLink><AppLink className="nd" href="/services/automation" data-i={6} style={{'--dl': '7.5s'}} aria-label="Workflow Automation"><circle className="ndr" cx={20} cy={80} r="10.5" /><circle className="ndc" cx={20} cy={80} r="8.6" /><g transform="translate(14.6 74.6) scale(.45)" className="ndi" data-ic={6} /><text className="ndn" x={20} y="95.2">07</text></AppLink><AppLink className="nd" href="/services/seo" data-i={7} style={{'--dl': '8.75s'}} aria-label="Search Engine Optimization (SEO)"><circle className="ndr" cx={50} cy={80} r="10.5" /><circle className="ndc" cx={50} cy={80} r="8.6" /><g transform="translate(44.6 74.6) scale(.45)" className="ndi" data-ic={7} /><text className="ndn" x={50} y="95.2">08</text></AppLink><AppLink className="nd" href="/academy" data-i={8} style={{'--dl': '10.0s'}} aria-label="Technology & Digital Skills Training"><circle className="ndr" cx={80} cy={80} r="10.5" /><circle className="ndc" cx={80} cy={80} r="8.6" /><g transform="translate(74.6 74.6) scale(.45)" className="ndi" data-ic={8} /><text className="ndn" x={80} y="95.2">09</text></AppLink></svg>
            </div>
          </div>
        </section>
        {/* 9 Â· CTA */}
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
        {/* 10 Â· FOOTER */}
    </>
  );
}
