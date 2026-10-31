import AppLink from '../../components/ui/AppLink';
import Button from '../../components/ui/Button';

export default function AboutBody() {
  return (
    <>
      {/* 1 · HERO */}
        <section className="hero ah" id="top">
          <div className="hero-bg" aria-hidden="true"><div className="bl l0 on" /><div className="ov" /><div className="gr" /><div className="pxf" id="pxHero" /><div className="orb o1" /><div className="orb o2" /></div>
          <div className="hero-txt">
            <div className="eb"><span className="pd" />About Wemray</div>
            <h1 id="hTitle" aria-label="Technology with Purpose. Progress That Lasts."><span className="ln"><i>Technology</i></span><span className="ln"><i>with Purpose.</i></span><span className="ln"><i><span className="fw">Progress That Lasts.</span></i><svg className="ul" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M4 16C80 4 150 22 220 12S340 6 396 14" /></svg></span></h1>
            <p className="sub">We bring strategy, creativity, and technology together to solve real problems and create meaningful progress.</p>
            <div className="ctas">
              <Button href="contact.html" variant="lav" arrow>Start a Conversation</Button>
              <Button href="#how" variant="ghost">See How We Work</Button>
            </div>
          </div>
          <div className="vn" id="vn" aria-label="Strategy, creativity and technology, brought together" role="img">
            <i className="vn-ring r1"><b /></i><i className="vn-ring r2"><b /><b className="b2" /></i><i className="vn-ring r3" />
            <div className="vn-lay" id="vnLay">
              <div className="vn-c c1"><span className="vl"><em>01</em>Strategy</span></div>
              <div className="vn-c c2"><span className="vl"><em>02</em>Creativity</span></div>
              <div className="vn-c c3"><span className="vl"><em>03</em>Technology</span></div>
              <div className="vn-hub"><i className="rp" /><i className="rp p2" /><span><img data-logo src="/logo.png" alt=""  /></span></div>
            </div>
            <span className="vn-tag t1">Real problems</span><span className="vn-tag t2">Meaningful progress</span>
          </div>
          <AppLink className="scrl" href="#about" aria-label="Scroll to content"><i />Scroll</AppLink>
        </section>
        {/* 2 · INTRO */}
        <section className="about abt band" id="about">
          <div className="ab-wrap">
            <div className="ab-l">
              <p className="ab-eb"><i />Who We Are</p>
              <h2>A Technology Company <span>Built for Growth</span></h2>
              <p className="ab-lead">Wemray Technology helps businesses build <b>credible brands, useful digital products, and smarter ways of working</b>. From brand identity to software, AI, and automation, we connect the capabilities you need to move forward.</p>
              <Button href="services.html" variant="pur" arrow>Explore our services</Button>
            </div>
            <div className="ab-r">
              <div className="ab-grid">
                <article className="abp f"><span className="abn">01</span><span className="abi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-ico="palette" /></span><h3>Credible Brands</h3><p>Identity people recognise and trust.</p></article>
                <article className="abp"><span className="abn">02</span><span className="abi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-ico="code" /></span><h3>Useful Products</h3><p>Websites, apps and systems that serve.</p></article>
                <article className="abp"><span className="abn">03</span><span className="abi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-ico="refresh" /></span><h3>Smarter Work</h3><p>AI and automation that save effort.</p></article>
                <article className="abp"><span className="abn">04</span><span className="abi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-ico="users" /></span><h3>Digital Talent</h3><p>Skills built through Ray Academy.</p></article>
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
        {/* 3 · VISION + MISSION */}
        <section className="vm band" id="vision">
          <div className="sh"><p className="ab-eb"><i />Vision &amp; Mission</p><h2>Where We’re Headed, <span>and How We Get There</span></h2></div>
          <div className="vmg">
            <article className="vmc f"><i className="dots" /><span className="k"><i />Our Vision</span><span className="big" aria-hidden="true">01</span><i className="vbar" /><h3>An Africa recognised globally for innovation, digital excellence, and solutions that matter.</h3></article>
            <article className="vmc"><i className="dots" /><span className="k"><i />Our Mission</span><span className="big" aria-hidden="true">02</span><i className="vbar" /><h3>To equip businesses with thoughtful branding, practical technology, and intelligent digital solutions, while developing digital talent ready to innovate and compete globally.</h3></article>
          </div>
        </section>
        {/* 4 · VALUES */}
        <section className="val band" id="values">
          <div className="sh"><p className="ab-eb"><i />Our Values</p><h2>What We <span>Stand For</span></h2></div>
          <div className="vg">
            <article className="vc"><i className="dots" /><span className="n">01</span><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-ico="target" /></span><i className="vbar" /><h3>Create with Purpose</h3><p>We build around real needs.</p></article>
            <article className="vc"><i className="dots" /><span className="n">02</span><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-ico="bulb" /></span><i className="vbar" /><h3>Think Beyond the Obvious</h3><p>We look for better approaches and more meaningful uses of technology.</p></article>
            <article className="vc"><i className="dots" /><span className="n">03</span><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-ico="layers" /></span><i className="vbar" /><h3>Raise the Standard</h3><p>We pursue quality in our work and our relationships.</p></article>
            <article className="vc"><i className="dots" /><span className="n">04</span><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-ico="trend" /></span><i className="vbar" /><h3>Build for Progress</h3><p>We design solutions for lasting growth.</p></article>
          </div>
        </section>
        {/* 5 · RAY BLUEPRINT */}
        <section className="how band" id="how">
          <div className="stk">
            <div className="hl"><div className="eb">How we work</div>
              <div className="tt">The Ray Blueprint<small>Our way of working. Three stages. One clear direction.</small></div></div>
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
        {/* 9 · CTA */}
        <section className="cta band" id="cta">
          <div className="ctg">
            <div className="ctl">
              <div className="eb">Ready to start?</div>
              <h2>Let’s build something <em>meaningful.</em></h2>
              <p>Tell us what you want to achieve. We’ll help you find the right way forward.</p>
              <div className="row">
                <Button href="contact.html" variant="lav" arrow>Start a Conversation</Button>
                <Button href="mailto:hello@wemray.com" variant="ghost">hello@wemray.com</Button>
              </div>
            </div>
            <div className="ctc" id="ctv">
              <AppLink className="cc main" href="contact.html"><span className="ci" id="ci1" /><div><h3>Start a conversation</h3><p>Tell us what you want to build or improve, and we will help you find the right starting point.</p></div><span className="cgo"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></span></AppLink>
              <AppLink className="cc" href="portfolio.html"><span className="ci" id="ci2" /><div><h3>See our work</h3><p>Browse selected projects across branding, software, and digital solutions.</p></div><span className="cgo"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></span></AppLink>
            </div>
          </div>
        </section>
        {/* 10 · FOOTER */}
    </>
  );
}
