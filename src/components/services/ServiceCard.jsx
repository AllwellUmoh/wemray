import { Link } from 'react-router-dom';

const gradients = [
  ['#6a3df0', '#2a14a8'],
  ['#2a14a8', '#000066'],
  ['#8b6cff', '#3a1fc0'],
  ['#3a1fc0', '#00003f'],
  ['#5125d2', '#000066'],
  ['#a28bff', '#4a22cc'],
  ['#4a22cc', '#00004a'],
  ['#7a55f5', '#1a0f8c'],
  ['#2a14a8', '#5125d2'],
];

export default function ServiceCard({ service, index }) {
  const [from, to] = gradients[index % gradients.length];
  const href = service.href || `/services/${service.slug}`;
  const tags = service.tags || service.tagsDisplay || [];

  return (
    <Link
      className="mc svc"
      to={href}
      data-i={index}
      draggable={false}
      aria-label={`Explore ${service.name}`}
    >
      <div
        className="art"
        style={{
          backgroundImage: `url(${service.image}),linear-gradient(135deg,${from},${to})`,
        }}
      >
        <i className="mc-dots" />
        <i className="mc-frame" />
      </div>
      <div className="tx">
        <i className="mc-bar" />
        <h3>{service.name}</h3>
        <div className="tags">
          {tags.map((tag) => <b key={tag}>{tag}</b>)}
        </div>
        <span className="mc-go">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
