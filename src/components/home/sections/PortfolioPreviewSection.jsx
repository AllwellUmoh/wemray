import Button from '../../ui/Button';

export default function PortfolioPreviewSection() {
  return (
    <section className="work band" id="work">
      <div className="whead">
        <div><p className="eb">Portfolio</p><h2>Purposeful ideas. Thoughtfully delivered.</h2><p className="wsub">Selected projects across branding, software, and digital solutions.</p></div>
        <div className="navs"><button id="pPrev" aria-label="Previous project"><svg className="arr" viewBox="0 0 24 24"><path d="M20 12H4M11 5l-7 7 7 7" /></svg></button><button id="pNext" aria-label="Next project"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></button></div>
      </div>
      <div className="pf" id="pf" aria-roledescription="carousel" aria-label="Portfolio"><div className="pstage" id="pstage" /></div>
      <div className="pdots" id="pdots" />
      <div className="pcta"><Button to="/portfolio" variant="pur" arrow>Explore Our Work</Button></div>
    </section>
  );
}
