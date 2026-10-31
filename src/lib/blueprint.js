import { ico } from './icons.js';

const HOW = [
  {
    n: '01',
    t: 'Research &amp; Reveal',
    f: 'See the opportunity clearly.',
    d: 'We study your business, audience, and goals, then set priorities that give the work a direction worth following.',
    big: 'search',
    a: '#7a4dff',
    b: '#2a14a8',
    chips: [
      ['users', 'Audience'],
      ['target', 'Goals'],
      ['bulb', 'Insights'],
    ],
  },
  {
    n: '02',
    t: 'Architect &amp; Activate',
    f: 'Turn strategy into substance.',
    d: 'We design and build brand identities, digital experiences, software, and automated systems around your needs.',
    big: 'layers',
    a: '#5125d2',
    b: '#000066',
    chips: [
      ['palette', 'Design'],
      ['code', 'Build'],
      ['refresh', 'Automate'],
    ],
  },
  {
    n: '03',
    t: 'Yield &amp; Evolve',
    f: 'Make progress continuous.',
    d: 'Launch is a beginning. Where it makes sense, we refine and adapt the work as your business grows.',
    big: 'rocket',
    a: '#8b6cff',
    b: '#3a1fc0',
    chips: [
      ['target', 'Measure'],
      ['refresh', 'Refine'],
      ['trend', 'Grow'],
    ],
  },
];

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function sectionProgress(el) {
  const cs = getComputedStyle(el);
  const pt = parseFloat(cs.paddingTop) || 0;
  const pb = parseFloat(cs.paddingBottom) || 0;
  return clamp(
    -(el.getBoundingClientRect().top + pt) /
      Math.max(1, el.offsetHeight - pt - pb - innerHeight),
  );
}

export function initBlueprint(signal) {
  const deck = document.getElementById('deck');
  if (!deck) return () => {};
  deck.replaceChildren();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  HOW.forEach((stage, index) => {
    const card = document.createElement('article');
    card.className = 'hc';
    card.style.zIndex = index + 1;
    const chips = stage.chips.map(([icon, label]) => `<span>${ico(icon)}${label}</span>`).join('');
    card.innerHTML = `<div><div class="k">Stage ${stage.n}</div><h3>${stage.t}</h3><div class="foc">${stage.f}</div><p>${stage.d}</p></div><div class="hic" style="--a:${stage.a};--b:${stage.b}"><i class="o1"></i><i class="o2"></i><div class="hbig">${ico(stage.big)}</div><div class="hch">${chips}</div></div>`;
    deck.appendChild(card);
  });

  const cards = [...deck.querySelectorAll('.hc')];
  const steps = [...document.querySelectorAll('#stepper span')];
  const how = document.getElementById('how');
  if (!how) {
    deck.replaceChildren();
    return () => {};
  }

  const goTimer = setTimeout(() => cards[0]?.classList.add('go'), 350);
  const cleanup = () => {
    clearTimeout(goTimer);
    deck.replaceChildren();
  };

  if (reduce) {
    cards.forEach((card) => card.classList.add('go'));
    steps.forEach((step, index) => step.classList.toggle('on', index === 0));
    return cleanup;
  }

  let ticking = false;
  function update() {
    ticking = false;
    const progress = sectionProgress(how);
    const scaled = clamp((progress - 0.05) / 0.88) * (cards.length - 1);
    const eased = [1];
    for (let i = 1; i < cards.length; i += 1) {
      eased[i] = ease(clamp(scaled - i + 1));
    }
    const step = Math.max(7, innerWidth * 0.0058);

    cards.forEach((card, i) => {
      let depth = 0;
      for (let k = i + 1; k < cards.length; k += 1) depth += eased[k];
      const translateY = i === 0 ? 0 : (1 - eased[i]) * 108;
      card.style.transform = `translate3d(0,calc(${translateY}% - ${depth * step}px),0) scaleX(${1 - 0.022 * depth})`;
      if (i > 0) {
        card.style.visibility = eased[i] <= 0 ? 'hidden' : 'visible';
        card.classList.toggle('go', eased[i] > 0.82);
      }
    });

    const active = Math.min(cards.length - 1, Math.round(scaled));
    steps.forEach((stepEl, index) => stepEl.classList.toggle('on', index === active));
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  addEventListener('scroll', requestUpdate, { passive: true, signal });
  addEventListener('resize', requestUpdate, { signal });
  requestUpdate();

  return cleanup;
}
