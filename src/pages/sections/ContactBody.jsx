import AppLink from '../../components/ui/AppLink';
import Button from '../../components/ui/Button';

export default function ContactBody() {
  return (
    <>
      {/* 1 · HERO */}
        <section className="hero ah ct-h" id="top">
          <div className="hero-bg" aria-hidden="true"><div className="bl l2 on" /><div className="ov" /><div className="gr" /><div className="pxf" id="pxHero" /><div className="orb o1" /><div className="orb o2" /></div>
          <div className="hero-txt">
            <div className="eb"><span className="pd" />Contact</div>
            <h1 id="hTitle" aria-label="Let’s Talk About What’s Next."><span className="ln"><i>Let’s Talk About</i></span><span className="ln"><i><span className="fw">What’s Next.</span></i><svg className="ul" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M4 16C80 4 150 22 220 12S340 6 396 14" /></svg></span></h1>
            <p className="sub">Tell us what you’re building, what needs to work better, or where you want to go. We’ll help you find the right next step.</p>
            <div className="ctas">
              <Button href="#form" variant="lav" arrow>Start a Conversation</Button>
              <Button href="mailto:hello@wemray.com" variant="ghost">hello@wemray.com</Button>
            </div>
          </div>
          <div className="cn" id="cn" role="img" aria-label="Topics we can help with, orbiting a conversation">
            <i className="cn-w" /><i className="cn-w w2" /><i className="cn-w w3" /><i className="cn-w w4" />
            <i className="vn-ring r1"><b /></i>
            <div className="cn-orb"><span className="cn-it" style={{left: '50.00%', top: '9.00%'}}><b>Branding</b></span><span className="cn-it" style={{left: '85.51%', top: '29.50%'}}><b>Software</b></span><span className="cn-it" style={{left: '85.51%', top: '70.50%'}}><b>AI</b></span><span className="cn-it" style={{left: '50.00%', top: '91.00%'}}><b>Automation</b></span><span className="cn-it" style={{left: '14.49%', top: '70.50%'}}><b>SEO</b></span><span className="cn-it" style={{left: '14.49%', top: '29.50%'}}><b>Training</b></span></div>
            <div className="cn-core"><span id="cnIc" /></div>
          </div>
          <AppLink className="scrl" href="#form" aria-label="Scroll to the form"><i />Scroll</AppLink>
        </section>
        {/* 2 · FORM */}
        <section className="ct-s" id="form">
          <div className="ct-grid">
            <div className="ct-l">
              <p className="ab-eb"><i />Get in Touch</p>
              <h2>Tell Us About <span>Your Project</span></h2>
              <p className="ab-lead">Share a few details so we can understand your enquiry.</p>
              <ul className="ct-info">
                <li><span className="cic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width={20} height={16} x={2} y={4} rx={2} /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></span><div><small>Email</small><AppLink href="mailto:hello@wemray.com">hello@wemray.com</AppLink></div></li>
                <li><span className="cic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg></span><div><small>Phone</small><AppLink href="tel:08139934328">08139934328</AppLink></div></li>
              </ul>
              <div className="ct-mail">
                <i className="dots" />
                <span className="k"><i />Prefer Email?</span>
                <p>Send us a note describing your project or training interest.</p>
                <Button href="mailto:hello@wemray.com?subject=Enquiry%20for%20Wemray%20Technology" variant="lav" arrow>Email Wemray Technology</Button>
              </div>
            </div>
            <div className="ct-r">
              <form className="ct-form" id="ctForm" noValidate>
                <i className="dots" />
                <div className="row2">
                  <label className="fld"><input name="name" type="text" placeholder=" " autoComplete="name" required /><span>Full name <em>*</em></span><small className="err">Please tell us your name.</small></label>
                  <label className="fld"><input name="email" type="email" placeholder=" " autoComplete="email" required /><span>Email address <em>*</em></span><small className="err">Please enter a valid email address.</small></label>
                </div>
                <div className="row2">
                  <label className="fld"><input name="org" type="text" placeholder=" " autoComplete="organization" /><span>Organisation <i>Optional</i></span></label>
                  <label className="fld"><input name="budget" type="text" placeholder=" " /><span>Estimated budget <i>Optional</i></span></label>
                </div>
                <label className="fld sel"><select name="service" required><option value selected disabled hidden /><option>Corporate &amp; Event Branding</option><option>Website Development</option><option>SaaS Product Development</option><option>Mobile App Development</option><option>Custom Software &amp; Business Systems</option><option>AI Solutions &amp; Intelligent Agents</option><option>Workflow Automation</option><option>SEO</option><option>Ray Academy Training</option><option>Other / Multiple Services</option></select><span>Service of interest</span><svg className="chv" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></label>
                <label className="fld ta"><textarea name="details" rows={5} placeholder=" " defaultValue={""} /><span>Project details</span></label>
                <div className="ct-act">
                  <Button variant="pur" type="submit" data-intent="conversation" arrow>Start a Conversation</Button>
                  <Button variant="line" type="submit" data-intent="consultation" arrow>Book a Consultation</Button>
                </div>
                <p className="ct-note">Your message opens in your email app, addressed to hello@wemray.com.</p>
              </form>
              <div className="ct-ok" id="ctOk" hidden>
                <span className="okc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
                <h3>Thank you. We’re ready when you are.</h3>
                <p>Your email app should have opened with your details. If it didn’t, write to us at <AppLink href="mailto:hello@wemray.com">hello@wemray.com</AppLink>.</p>
                <Button variant="line" type="button" id="ctAgain">Send another message</Button>
              </div>
            </div>
          </div>
        </section>
        {/* 3 · FAQ */}
        <section className="fq-s" id="faq">
          <div className="fq-grid">
            <div className="fq-l">
              <p className="ab-eb"><i />FAQs</p>
              <h2>Questions, Answered. <span>Clarity Before You Begin.</span></h2>
              <p className="ab-lead">What to know before working with Wemray Technology.</p>
              <Button href="#form" variant="pur" arrow>Let’s Discuss Your Needs</Button>
            </div>
            <div className="fq-list">
              <details className="fq" open><summary><em>01</em><span>What services does Wemray offer?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>Branding, website and mobile app development, SaaS products, custom software, AI solutions, workflow automation, SEO, and technology training.</p></div></details>
              <details className="fq"><summary><em>02</em><span>Can I engage Wemray for one service only?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>Yes. Enquire about a focused project, or discuss a combination of services suited to your wider goals.</p></div></details>
              <details className="fq"><summary><em>03</em><span>How does a project begin?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>We start by understanding your business, audience, challenges, and objectives, so there is a clear direction before work begins.</p></div></details>
              <details className="fq"><summary><em>04</em><span>Can Wemray develop a custom business system?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>Yes. Depending on your requirements, we build management systems, dashboards, internal tools, portals, and integrations.</p></div></details>
              <details className="fq"><summary><em>05</em><span>Can AI or automation be integrated into my business?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>We help identify practical use cases, including suitable customer-support, information, reporting, and workflow tasks.</p></div></details>
              <details className="fq"><summary><em>06</em><span>What courses does Ray Academy offer?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>Frontend, backend, and full-stack development, product design, corporate branding and design, social media management, WordPress, and data analytics.</p></div></details>
              <details className="fq"><summary><em>07</em><span>How do I find out about training fees and dates?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>Contact Ray Academy to confirm current availability, fees, formats, durations, certification, and schedules.</p></div></details>
              <details className="fq"><summary><em>08</em><span>Does Wemray provide ongoing support?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>Support arrangements depend on the project and are agreed before engagement. Contact us to discuss your requirements.</p></div></details>
              <details className="fq"><summary><em>09</em><span>How do I get started?</span><i className="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary><div className="fa"><p>Email hello@wemray.com or use the contact form to describe your project or training interest.</p></div></details>
            </div>
          </div>
        </section>
        {/* 9 · CTA */}
        <section className="cta band" id="cta">
          <div className="ctg">
            <div className="ctl">
              <div className="eb">Ready to start?</div>
              <h2>Build for progress, <em>not for passing trends.</em></h2>
              <p>Whether you have an idea to build or a process to improve, we choose technology for what it does for you, and plan for security, stability, and growth from day one.</p>
              <div className="row">
                <Button href="#form" variant="lav" arrow>Start a Conversation</Button>
                <Button href="mailto:hello@wemray.com" variant="ghost">hello@wemray.com</Button>
              </div>
            </div>
            <div className="ctc" id="ctv">
              <AppLink className="cc main" href="#form"><span className="ci" id="ci1" /><div><h3>Start a conversation</h3><p>Tell us what you want to build or improve, and we will help you find the right starting point.</p></div><span className="cgo"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></span></AppLink>
              <AppLink className="cc" href="portfolio.html"><span className="ci" id="ci2" /><div><h3>See our work</h3><p>Browse selected projects across branding, software, and digital solutions.</p></div><span className="cgo"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></span></AppLink>
            </div>
          </div>
        </section>
        {/* 10 · FOOTER */}
    </>
  );
}
