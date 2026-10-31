import { useEffect } from 'react';
import Button from '../ui/Button';

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function NavArrow({ direction }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'prev' ? 'M20 12H4M11 5l-7 7 7 7' : 'M4 12h16M13 5l7 7-7 7'} />
    </svg>
  );
}

export default function CaseStudyModal({ project, index, total, onClose, onPrevious, onNext }) {
  useEffect(() => {
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = 'hidden';

    const keydown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrevious();
      if (event.key === 'ArrowRight') onNext();
    };

    addEventListener('keydown', keydown);
    return () => {
      document.documentElement.style.overflow = overflow;
      removeEventListener('keydown', keydown);
    };
  }, [onClose, onPrevious, onNext]);

  if (!project) return null;

  return (
    <div className="pm" role="presentation">
      <div className="pm-bd" onClick={onClose} />
      <div className="pm-p" role="dialog" aria-modal="true" aria-labelledby="pmTitle">
        <button className="pm-x" type="button" onClick={onClose} aria-label="Close case study">
          <CloseIcon />
        </button>
        <div
          className="pm-im"
          style={{ background: `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]})` }}
        >
          <img src={project.image} alt="" />
        </div>
        <div className="pm-b">
          <span className="pm-k">{project.categoryLabel}</span>
          <h3 id="pmTitle">{project.title}</h3>
          <p className="pm-s">{project.summary}</p>
          <dl className="pm-d">
            <div>
              <dt>Challenge</dt>
              <dd>{project.challenge}</dd>
            </div>
            <div>
              <dt>Approach</dt>
              <dd>{project.approach}</dd>
            </div>
            <div>
              <dt>Deliverables</dt>
              <dd>
                <ul>
                  {project.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>Verified outcome</dt>
              <dd>{project.outcome}</dd>
            </div>
          </dl>
          <div className="pm-f">
            <div className="pm-actions">
              <Button
                href={project.url || '#projects'}
                variant="pur"
                arrow
                {...(project.url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                See live project
              </Button>
              <Button to="/contact" variant="line">
                Discuss a similar project
              </Button>
            </div>
            <div className="pm-nav">
              <button type="button" onClick={onPrevious} aria-label="Previous project">
                <NavArrow direction="prev" />
              </button>
              <span>{`${index + 1} / ${total}`}</span>
              <button type="button" onClick={onNext} aria-label="Next project">
                <NavArrow direction="next" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
