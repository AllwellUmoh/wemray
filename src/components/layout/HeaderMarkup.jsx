import AppLink from '../ui/AppLink';
import Button from '../ui/Button';

export default function HeaderMarkup() {
  return (
    <header className="nav" id="nav">
      <AppLink className="logo" href="#top" aria-label="Wemray Technology home"><img src="/logo.png" alt="" />WEMRAY</AppLink>
      <ul>
        <li><AppLink className="cur" href="index.html">Home</AppLink></li>
        <li><AppLink href="about.html">About</AppLink></li>
        <li className="has-mega"><AppLink href="services.html" aria-haspopup="true" aria-expanded="false" aria-controls="mega">Services <svg className="chv" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></AppLink>
          <div className="mega" id="mega">
            <div className="mg"><h5>Brand &amp; Digital Presence</h5>
              <AppLink className="mi" href="/services/branding"><span className="mic"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg></span><span><b>Corporate &amp; Event Branding</b><small>Consistent, recognisable identity across every touchpoint.</small></span></AppLink>
              <AppLink className="mi" href="/services/website"><span className="mic"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width={20} height={14} x={2} y={3} rx={2} /><path d="M8 21h8M12 17v4" /></svg></span><span><b>Website Development</b><small>A clear, useful online experience for your audience.</small></span></AppLink>
              <AppLink className="mi" href="/services/seo"><span className="mic"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx={11} cy={11} r={8} /><path d="m21 21-4.3-4.3" /></svg></span><span><b>Search Engine Optimization</b><small>Stronger search foundations and discoverability.</small></span></AppLink>
            </div>
            <div className="mg"><h5>Product &amp; Custom Engineering</h5>
              <AppLink className="mi" href="/services/saas"><span className="mic"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></svg></span><span><b>SaaS Product Development</b><small>Product ideas shaped into usable subscription services.</small></span></AppLink>
              <AppLink className="mi" href="/services/mobile"><span className="mic"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width={14} height={20} x={5} y={2} rx={2} /><path d="M12 18h.01" /></svg></span><span><b>Mobile App Development</b><small>Android, iOS and cross-platform apps.</small></span></AppLink>
              <AppLink className="mi" href="/services/software"><span className="mic"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg></span><span><b>Custom Software &amp; Business Systems</b><small>Tools that mirror your processes and strengthen your team.</small></span></AppLink>
            </div>
            <div className="mg"><h5>Intelligence &amp; Efficiency</h5>
              <AppLink className="mi" href="/services/ai"><span className="mic"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 8V4H8" /><rect width={16} height={12} x={4} y={8} rx={2} /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></svg></span><span><b>AI Solutions &amp; Intelligent Agents</b><small>Practical AI for business tasks and customer support.</small></span></AppLink>
              <AppLink className="mi" href="/services/automation"><span className="mic"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></span><span><b>Workflow Automation</b><small>Less repetitive work through connected tasks and tools.</small></span></AppLink>
            </div>
            <AppLink className="mf" href="/academy"><span className="mfe">Ray Academy</span><b>Technology &amp; Digital Skills Training</b><small>Practical skills for digital work and emerging opportunities.</small><span className="mfb">View Academy Courses <svg className="arr2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span></AppLink>
            <div className="mbar"><span>Not sure what you need? We will help you find the right starting point.</span><AppLink to="/contact">Talk to us <svg className="arr2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></AppLink><AppLink to="/services">View all services <svg className="arr2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></AppLink></div>
          </div>
        </li>
        <li><AppLink to="/portfolio">Portfolio</AppLink></li>
        <li><AppLink to="/academy">Ray Academy</AppLink></li>
      </ul>
      <Button to="/contact" variant="pur">Start a Conversation</Button>
      <button className="burger" id="burger" aria-label="Menu" aria-expanded="false"><i /><i /><i /></button>
    </header>
    
  );
}
