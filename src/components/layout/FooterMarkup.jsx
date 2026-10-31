import AppLink from '../ui/AppLink';
import SocialLinks from '../ui/SocialLinks';

export default function FooterMarkup() {
  return (
    <footer className="ft">
      <div className="ft-in">
        <div className="ft-top" id="ftg">
          <div className="ft-brand fcol">
            <AppLink className="ft-logo" href="#top" aria-label="Wemray Technology home"><img src="/logo.png" alt="" /><span>WEMRAY</span></AppLink>
            <p>We build brands people remember, digital products people value, and intelligent systems that move businesses forward.</p>
            <p className="ft-areas">Port Harcourt | Lagos | Nigeria | London, UK | Canada</p>
            <AppLink className="ft-cta" href="contact.html">Start a Conversation <svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></AppLink>
          </div>
          <div className="ft-cols">
            <div className="fcol" style={{'--d': '.1s'}}><h4>Explore</h4><ul><li><AppLink href="index.html">Home</AppLink></li><li><AppLink href="about.html">About</AppLink></li><li><AppLink href="services.html">Services</AppLink></li><li><AppLink to="/portfolio">Portfolio</AppLink></li><li><AppLink to="/academy">Ray Academy</AppLink></li><li><AppLink to="/contact">Contact</AppLink></li></ul></div>
            <div className="fcol" style={{'--d': '.2s'}}><h4>Services</h4><ul><li><AppLink href="/services/branding">Corporate &amp; Event Branding</AppLink></li><li><AppLink href="/services/website">Website Development</AppLink></li><li><AppLink href="/services/saas">SaaS &amp; Mobile Apps</AppLink></li><li><AppLink href="/services/software">Custom Software</AppLink></li><li><AppLink href="/services/ai">AI &amp; Automation</AppLink></li><li><AppLink href="/services/seo">SEO</AppLink></li><li><AppLink to="/academy">Training</AppLink></li></ul></div>
            <div className="fcol" style={{'--d': '.3s'}}>
              <h4>Contact</h4>
              <ul className="ft-ct"><li><AppLink href="mailto:hello@wemray.com">hello@wemray.com</AppLink></li><li><AppLink href="tel:08139934328">08139934328</AppLink></li></ul>
              <SocialLinks className="ft-soc" />
              <p className="ft-handle">@wemraytechnology</p>
            </div>
          </div>
        </div>
        <div className="ft-bar">
          <span>© 2026 Wemray Technology. All rights reserved.</span>
          <span className="ft-legal"><AppLink href="privacy.html">Privacy Policy</AppLink><AppLink href="terms.html">Terms of Service</AppLink></span>
          <AppLink className="ft-up" href="#top">Back to top <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg></AppLink>
        </div>
      </div>
    </footer>
    
  );
}
