import CTASection from '../../components/ui/CTASection';
import PageHero from '../../components/ui/PageHero';
import PortfolioGrid from '../../components/portfolio/PortfolioGrid';
import SectionHeading from '../../components/ui/SectionHeading';
import { projects } from '../../data/projects';

const mosaic = projects.slice(0, 5);

export default function PortfolioBody() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        lines={[
          { t: 'Ideas Made Tangible.' },
          { t: 'Work Made to Matter.', fw: true },
        ]}
        sub="Selected website design and development work for clients in Port Harcourt, Lagos, Nigeria, London, the UK and Canada."
        primary={{ label: 'See Selected Projects', href: '#projects', variant: 'lav' }}
        secondary={{ label: 'Discuss Your Project', to: '/contact', variant: 'ghost' }}
        scrollHref="#projects"
        scrollLabel="Scroll"
        className="pf-hero"
        visual={
          <div className="pf-mosaic" aria-hidden="true">
            {mosaic.map((project, index) => (
              <figure
                key={project.slug}
                className={`pf-mosaic-tile tile-${index + 1}`}
                style={{ background: `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]})` }}
              >
                <img src={project.image} alt="" loading="lazy" />
              </figure>
            ))}
          </div>
        }
      />

      <section className="pf-sec" id="projects">
        <SectionHeading
          eyebrow="Selected Projects"
          title={
            <>
              Work That <span>Speaks for Itself</span>
            </>
          }
        />
        <PortfolioGrid />
      </section>

      <section className="sp-ap" id="story">
        <div className="ap-bg" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
            alt=""
            loading="lazy"
          />
        </div>
        <div className="ap-in">
          <div className="ap-hd">
            <div className="eb">Case studies</div>
            <h2>
              Every project, <em>told in four parts</em>
            </h2>
            <p>
              Each case study follows the same clear structure, so you can see what we were asked to solve and what
              changed as a result.
            </p>
          </div>
          <ol className="ap-st" id="apSt">
            <i className="ap-ln">
              <b />
            </i>
            {[
              ['Challenge', 'What needed to change.'],
              ['Approach', 'How the work was planned and built.'],
              ['Deliverables', 'What we handed over.'],
              ['Verified outcome', 'Results confirmed with the client.'],
            ].map(([title, copy], index) => (
              <li className="ap-s" style={{ '--n': index }} key={title}>
                <span className="ap-n">{`0${index + 1}`}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTASection
        title={
          <>
            Have a Project <em>in Mind?</em>
          </>
        }
        copy="Let's explore how the right combination of design and technology can support your goals."
        primaryLabel="Discuss Your Project"
        secondaryLabel="hello@wemray.com"
        cardOneTitle="Start a conversation"
        cardOneCopy="Tell us what you want to build or improve, and we will help you find the right starting point."
        cardTwoTitle="Explore our services"
        cardTwoCopy="Branding, software, AI, and automation from one connected team."
      />
    </>
  );
}
