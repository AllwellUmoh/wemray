import AppLink from '../../ui/AppLink';
import Button from '../../ui/Button';
import CTASection from '../../ui/CTASection';
import SocialLinks from '../../ui/SocialLinks';
import { contactFaqs } from '../../../data/faqs';

export function ContactHeroSection() {
  return (
    <section className="hero ah ct-h no-vis" id="top">
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
      <AppLink className="scrl" href="#form" aria-label="Scroll to the form"><i />Scroll</AppLink>
    </section>
  );
}

export function ContactFormSection() {
  return (
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
          <p className="ct-areas">Based in Port Harcourt, Nigeria. Serving Lagos, London, the UK and Canada.</p>
          <div className="ct-soc"><small>Follow</small><SocialLinks /><span>@wemraytechnology</span></div>
          {/* <div className="ct-mail">
            <i className="dots" />
            <span className="k"><i />Prefer Email?</span>
            <p>Send us a note describing your project or training interest.</p>
            <Button href="mailto:hello@wemray.com?subject=Enquiry%20for%20Wemray%20Technology" variant="lav" arrow>Email Wemray Technology</Button>
          </div> */}
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
        </div>
      </div>
    </section>
  );
}

export function ContactFaqSection() {
  return (
    <section className="fq-s" id="faq">
      <div className="fq-grid">
        <div className="fq-l">
          <p className="ab-eb"><i />FAQs</p>
          <h2>Questions, Answered. <span>Clarity Before You Begin.</span></h2>
          <p className="ab-lead">What to know before working with Wemray Technology.</p>
          <Button href="#form" variant="pur" arrow>Let’s Discuss Your Needs</Button>
        </div>
        <div className="fq-list">
          {contactFaqs.map((item, index) => (
            <details className="fq" open={index === 0} key={item.q}>
              <summary>
                <em>{String(index + 1).padStart(2, '0')}</em>
                <span>{item.q}</span>
                <i className="pl">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </i>
              </summary>
              <div className="fa"><p>{item.a}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactCtaSection() {
  return (
    <CTASection
      title={
        <>
          Build for progress, <em>not for passing trends.</em>
        </>
      }
      copy="Whether you have an idea to build or a process to improve, we choose technology for what it does for you, and plan for security, stability, and growth from day one."
      primaryHref="#form"
      cardOneTitle="Start a conversation"
      cardOneCopy="Tell us what you want to build or improve, and we will help you find the right starting point."
      cardTwoTitle="See our work"
      cardTwoCopy="Browse selected projects across branding, software, and digital solutions."
    />
  );
}

export default function ContactSections() {
  return (
    <>
      <ContactHeroSection />
      <ContactFormSection />
      <ContactCtaSection />
      <ContactFaqSection />
    </>
  );
}
