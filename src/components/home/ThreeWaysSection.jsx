import { useEffect, useRef, useState } from 'react';
import AppLink from '../ui/AppLink';
import threeWaysImage from '../../assets/three-ways-intelligence.svg';

const U = (id) => `/images/${id}.jpg`;

const WAYS = [
  {
    h: 'Brand & Digital Presence',
    p: 'Corporate and event branding, website development, and SEO. A presence people recognise, find, and trust.',
    l: 'Explore Brand Services',
  },
  {
    h: 'Product & Custom Engineering',
    p: 'SaaS products, mobile apps, and custom business systems. Ideas become digital services shaped around how you work.',
    l: 'Explore Engineering Services',
  },
  {
    h: 'Intelligence & Efficiency',
    p: 'AI solutions and workflow automation. Less repetitive work, faster response to customers.',
    l: 'Explore Automation Services',
  },
];

const IMAGES = [
  U('photo-1558655146-9f40138edfeb'),
  U('photo-1517694712202-14dd9538aa97'),
  threeWaysImage,
];

const GRADIENTS = [
  'linear-gradient(135deg,#7a4dff,#1a0f8c)',
  'linear-gradient(135deg,#2a14a8,#000066)',
  'linear-gradient(135deg,#8b6cff,#3a1fc0)',
];

const Arrow = () => (
  <svg className="arr" viewBox="0 0 24 24">
    <path d="M4 12h16M13 5l7 7-7 7" />
  </svg>
);

export default function ThreeWaysSection() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let ticking = false;
    const progress = (element) => {
      const style = getComputedStyle(element);
      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingBottom = parseFloat(style.paddingBottom) || 0;
      return Math.max(
        0,
        Math.min(
          1,
          -(element.getBoundingClientRect().top + paddingTop) /
            Math.max(1, element.offsetHeight - paddingTop - paddingBottom - innerHeight),
        ),
      );
    };

    const update = () => {
      ticking = false;
      setActive(Math.min(2, Math.floor(progress(section) * 3)));
    };
    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    addEventListener('scroll', requestUpdate, { passive: true });
    addEventListener('resize', requestUpdate);
    requestUpdate();

    return () => {
      removeEventListener('scroll', requestUpdate);
      removeEventListener('resize', requestUpdate);
    };
  }, []);

  useEffect(() => {
    if (active === display) return undefined;
    const timer = setTimeout(() => setDisplay(active), 250);
    return () => clearTimeout(timer);
  }, [active, display]);

  const current = WAYS[display];
  const shown = active === display;

  return (
    <section className="pin ww" id="ww" ref={sectionRef}>
      <div className="stick">
        <div className="wl">
          <p className="eb">What we do</p>
          <h2>Three ways we move you forward</h2>
        </div>
        <div className="wc">
          <span className="no" id="wno">{`0${display + 1}`}</span>
          <div
            className="wt"
            id="wt"
            style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(12px)' }}
          >
            <h3>{current.h}</h3>
            <p>{current.p}</p>
            <AppLink className="lnk" href="/services">{current.l} <Arrow /></AppLink>
          </div>
          <div className="vis" id="vis">
            {IMAGES.map((image, index) => (
              <div
                className={`vi${index === active ? ' on' : ''}`}
                key={image}
                style={{ backgroundImage: `url(${image}),${GRADIENTS[index]}` }}
              />
            ))}
            <div className="vsh" />
          </div>
        </div>
      </div>
    </section>
  );
}
