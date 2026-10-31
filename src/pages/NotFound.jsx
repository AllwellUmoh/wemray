import Button from '../components/ui/Button';
import usePageMeta from '../lib/usePageMeta';

export default function NotFound() {
  usePageMeta({
    title: 'Page Not Found | Wemray Technology',
    description:
      'The page you are looking for could not be found. Explore Wemray Technology services, portfolio, Ray Academy and contact pages.',
    robots: 'noindex, follow',
  });

  return (
    <section className="hero ah" id="top">
      <div className="hero-bg" aria-hidden="true">
        <div className="bl l2 on" />
        <div className="ov" />
        <div className="gr" />
        <div className="pxf" id="pxHero" />
        <div className="orb o1" />
        <div className="orb o2" />
      </div>
      <div className="hero-txt">
        <div className="eb"><span className="pd" />404</div>
        <h1 aria-label="Page not found.">
          <span className="ln"><i>Page Not</i></span>
          <span className="ln"><i><span className="fw">Found.</span></i></span>
        </h1>
        <p className="sub">The page you are looking for may have moved or no longer exists.</p>
        <div className="ctas">
          <Button to="/" variant="lav">Back to Home</Button>
          <Button to="/contact" variant="ghost">Contact Us</Button>
        </div>
      </div>
    </section>
  );
}
