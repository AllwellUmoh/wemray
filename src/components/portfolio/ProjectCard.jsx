'use client';

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export default function ProjectCard({ project, index, onOpen }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(project);
    }
  };

  return (
    <article
      className="pj"
      style={{ '--k': index }}
      tabIndex={0}
      role="button"
      aria-label={`Open case study: ${project.title}`}
      onClick={() => onOpen(project)}
      onKeyDown={handleKeyDown}
    >
      <div
        className="pj-i"
        style={{ background: `linear-gradient(135deg,${project.gradient[0]},${project.gradient[1]})` }}
      >
        <img src={project.image} alt="" loading="lazy" decoding="async" onError={(event) => event.currentTarget.remove()} />
        <i className="pj-dots" aria-hidden="true" />
        <span className="pj-n" aria-hidden="true">{project.number}</span>
        <span className="pj-c"><i />{project.categoryLabel}</span>
        <span className="pj-s">{project.sample ? 'Sample' : 'Case study'}</span>
        <div className="pj-ov">
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <span className="pj-go">
            View case study
            <i>
              <Arrow />
            </i>
          </span>
        </div>
      </div>
    </article>
  );
}
