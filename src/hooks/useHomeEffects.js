import { useEffect } from 'react';
import { PROJECTS } from '../components/home/portfolioData';

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const U = (id) => `/images/${id}.jpg`;

const WAYS = [
  {
    h: 'Brand &amp; Digital Presence',
    p: 'Corporate and event branding, website development, and SEO. A presence people recognise, find, and trust.',
    l: 'Explore Brand Services',
  },
  {
    h: 'Product &amp; Custom Engineering',
    p: 'SaaS products, mobile apps, and custom business systems. Ideas become digital services shaped around how you work.',
    l: 'Explore Engineering Services',
  },
  {
    h: 'Intelligence &amp; Efficiency',
    p: 'AI solutions and workflow automation. Less repetitive work, faster response to customers.',
    l: 'Explore Automation Services',
  },
];

const WAY_IMAGES = [
  U('photo-1558655146-9f40138edfeb'),
  U('photo-1517694712202-14dd9538aa97'),
  '/images/three-ways-intelligence.svg',
];

const WAY_GRADIENTS = [
  'linear-gradient(135deg,#7a4dff,#1a0f8c)',
  'linear-gradient(135deg,#2a14a8,#000066)',
  'linear-gradient(135deg,#8b6cff,#3a1fc0)',
];

function initTyping(signal) {
  const heading = document.getElementById('hTitle');
  const root = document.getElementById('top');
  if (!heading || !root) return () => {};

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = new Set();
  const chars = [];
  let last = null;
  let cursor = heading.querySelector('.tcur');

  if (!cursor) {
    cursor = document.createElement('i');
    cursor.className = 'tcur';
    cursor.setAttribute('aria-hidden', 'true');
    heading.appendChild(cursor);
  }

  const wrap = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        if (!child.textContent.trim()) return;
        const fragment = document.createDocumentFragment();
        child.textContent.split('').forEach((character) => {
          if (/\s/.test(character)) {
            fragment.appendChild(document.createTextNode(character));
          } else {
            const span = document.createElement('span');
            span.className = 'ch';
            span.setAttribute('aria-hidden', 'true');
            span.textContent = character;
            fragment.appendChild(span);
            chars.push(span);
          }
        });
        node.replaceChild(fragment, child);
      } else if (
        child.nodeType === 1 &&
        child.tagName.toLowerCase() !== 'svg' &&
        !child.classList.contains('note') &&
        !child.classList.contains('ch')
      ) {
        wrap(child);
      }
    });
  };

  wrap(heading);
  if (!chars.length) heading.querySelectorAll('.ch').forEach((character) => chars.push(character));
  if (!chars.length) {
    cursor.remove();
    return () => {};
  }

  const place = (element, before) => {
    const rect = element.getBoundingClientRect();
    const box = heading.getBoundingClientRect();
    cursor.style.left = `${before ? rect.left - box.left - 5 : rect.right - box.left + 4}px`;
    cursor.style.top = `${rect.top - box.top + rect.height * 0.12}px`;
    cursor.style.height = `${rect.height * 0.76}px`;
  };

  const done = () => {
    if (signal.aborted) return;
    root.classList.add('typed');
  };

  if (reduce) {
    chars.forEach((character) => character.classList.add('on'));
    last = chars[chars.length - 1];
    place(last, false);
    done();
  } else {
    let index = 0;
    const breakAt = heading.querySelector('.ln')?.querySelectorAll('.ch').length || 0;

    const step = () => {
      if (signal.aborted) return;
      if (index >= chars.length) {
        timers.add(setTimeout(done, 250));
        return;
      }
      const character = chars[index];
      index += 1;
      character.classList.add('on');
      last = character;
      place(character, false);
      timers.add(
        setTimeout(
          step,
          62 + Math.random() * 58 + (index === breakAt ? 380 : 0),
        ),
      );
    };

    const start = () => {
      if (signal.aborted) return;
      place(chars[0], true);
      timers.add(setTimeout(step, 650));
    };

    let started = false;
    const go = () => {
      if (started || signal.aborted) return;
      started = true;
      start();
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(go);
      timers.add(setTimeout(go, 1500));
    } else {
      go();
    }
  }

  const resize = () => {
    if (last) place(last, false);
  };
  addEventListener('resize', resize, { signal });

  return () => {
    timers.forEach(clearTimeout);
    cursor.remove();
    chars.forEach((character) => character.classList.remove('on'));
    root.classList.remove('typed');
  };
}

function initDeck(signal) {
  const deck = document.getElementById('dk');
  if (!deck) return () => {};

  const cards = [...deck.querySelectorAll('.dk-card')];
  const backgrounds = [...document.querySelectorAll('.hero-bg .bl')];
  const dots = [...document.querySelectorAll('#dkD span')];
  const order = [0, 1, 2];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = new Set();
  let busy = false;
  let autoTimer;
  let drag = null;
  let startX = 0;
  let startY = 0;

  const render = () => {
    cards.forEach((card, index) => {
      const position = order.indexOf(index);
      card.style.setProperty('--p', position);
      card.dataset.p = String(position);
      card.setAttribute('aria-hidden', position ? 'true' : 'false');
    });
    backgrounds.forEach((background, index) => {
      background.classList.toggle('on', index === order[0]);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('on', index === order[0]);
    });
  };

  const reset = (card) => {
    card.style.setProperty('--dx', '0px');
    card.style.setProperty('--dy', '0px');
    card.style.setProperty('--rot', '0deg');
  };

  const auto = () => {
    clearInterval(autoTimer);
    if (reduce) return;
    autoTimer = setInterval(() => next(1), 5200);
  };

  const next = (direction = 1) => {
    if (busy) return;
    busy = true;
    const card = cards[order[0]];
    card.classList.add('fly');
    card.style.setProperty('--dx', `${direction * deck.offsetWidth * 1.3}px`);
    card.style.setProperty('--rot', `${direction * 18}deg`);

    timers.add(
      setTimeout(() => {
        card.classList.add('snap');
        card.classList.remove('fly', 'drag');
        reset(card);
        order.push(order.shift());
        render();
        void card.offsetWidth;
        card.classList.remove('snap');
        busy = false;
      }, 380),
    );
  };

  const prev = () => {
    if (busy) return;
    busy = true;
    const card = cards[order[order.length - 1]];
    card.classList.add('snap');
    card.style.setProperty('--dx', '-120%');
    card.style.setProperty('--rot', '-14deg');
    order.unshift(order.pop());
    render();
    void card.offsetWidth;
    card.classList.remove('snap');
    reset(card);
    timers.add(
      setTimeout(() => {
        busy = false;
      }, 600),
    );
  };

  const pointerDown = (event) => {
    const card = event.target.closest('.dk-card');
    if (!card || card.dataset.p !== '0' || busy) return;
    drag = card;
    startX = event.clientX;
    startY = event.clientY;
    card.classList.add('drag');
    try {
      card.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is optional.
    }
    clearInterval(autoTimer);
  };

  const pointerMove = (event) => {
    if (!drag) return;
    const dx = event.clientX - startX;
    const dy = (event.clientY - startY) * 0.35;
    drag.style.setProperty('--dx', `${dx}px`);
    drag.style.setProperty('--dy', `${dy}px`);
    drag.style.setProperty('--rot', `${dx / 16}deg`);
  };

  const pointerEnd = (event) => {
    if (!drag) return;
    const dx = event.clientX - startX;
    const card = drag;
    drag = null;
    card.classList.remove('drag');
    if (Math.abs(dx) > 70) next(dx > 0 ? 1 : -1);
    else reset(card);
    auto();
  };

  const keyDown = (event) => {
    if (event.key === 'ArrowRight') {
      next(1);
      auto();
    }
    if (event.key === 'ArrowLeft') {
      prev();
      auto();
    }
  };

  deck.addEventListener('pointerdown', pointerDown, { signal });
  deck.addEventListener('pointermove', pointerMove, { signal });
  deck.addEventListener('pointerup', pointerEnd, { signal });
  deck.addEventListener('pointercancel', pointerEnd, { signal });
  deck.addEventListener('keydown', keyDown, { signal });

  const hero = document.getElementById('top');
  const visual = deck.parentNode;
  const parallax = (event) => {
    if (reduce || !hero) return;
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    visual.style.transform = `translate3d(${x * -14}px,${y * -10}px,0)`;
  };
  if (hero) hero.addEventListener('mousemove', parallax, { signal });

  render();
  auto();

  return () => {
    clearInterval(autoTimer);
    timers.forEach(clearTimeout);
    cards.forEach((card) => {
      card.classList.remove('fly', 'snap', 'drag');
      reset(card);
    });
    visual.style.transform = '';
  };
}

function initThreeWays(signal) {
  const visual = document.getElementById('vis');
  const text = document.getElementById('wt');
  const number = document.getElementById('wno');
  const section = document.getElementById('ww');
  if (!visual || !text || !number || !section) return () => {};

  visual.innerHTML = `${WAY_IMAGES.map(
    (image, index) => `<div class="vi" style="background-image:url(${image}),${WAY_GRADIENTS[index]}"></div>`,
  ).join('')}<div class="vsh"></div>`;

  const images = [...visual.querySelectorAll('.vi')];
  let current = -1;
  let timer;

  const setWay = (index) => {
    if (index === current) return;
    current = index;
    text.style.opacity = 0;
    text.style.transform = 'translateY(12px)';
    images.forEach((image, key) => image.classList.toggle('on', key === index));

    clearTimeout(timer);
    timer = setTimeout(() => {
      if (signal.aborted) return;
      const way = WAYS[index];
      text.innerHTML = `<h3>${way.h}</h3><p>${way.p}</p><a class="lnk" href="/services">${way.l} <svg class="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7"/></svg></a>`;
      number.textContent = `0${index + 1}`;
      text.style.opacity = 1;
      text.style.transform = 'none';
    }, 250);
  };

  const progress = (element) => {
    const style = getComputedStyle(element);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    return clamp(
      -(element.getBoundingClientRect().top + paddingTop) /
        Math.max(1, element.offsetHeight - paddingTop - paddingBottom - innerHeight),
    );
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    setWay(Math.min(2, Math.floor(progress(section) * 3)));
  };
  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  addEventListener('scroll', requestUpdate, { passive: true, signal });
  addEventListener('resize', requestUpdate, { signal });
  setWay(0);
  requestUpdate();

  return () => {
    clearTimeout(timer);
    visual.innerHTML = '';
    text.innerHTML = '';
    number.textContent = '01';
  };
}

function initCapabilities(signal) {
  const track = document.getElementById('track');
  const previous = document.getElementById('cPrev');
  const next = document.getElementById('cNext');
  if (!track || !previous || !next) return () => {};

  const step = () => {
    const card = track.querySelector('.mc');
    return card ? card.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 14) : 300;
  };

  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth - 3;
    previous.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft >= max;
  };

  const goNext = () => track.scrollBy({ left: step(), behavior: 'smooth' });
  const goPrevious = () => track.scrollBy({ left: -step(), behavior: 'smooth' });

  next.addEventListener('click', goNext, { signal });
  previous.addEventListener('click', goPrevious, { signal });
  track.addEventListener('scroll', updateButtons, { passive: true, signal });
  addEventListener('resize', updateButtons, { signal });

  let down = false;
  let startX = 0;
  let startLeft = 0;
  let moved = 0;

  const pointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button) return;
    down = true;
    moved = 0;
    startX = event.clientX;
    startLeft = track.scrollLeft;
    track.classList.add('grab');
  };
  const pointerMove = (event) => {
    if (!down) return;
    const dx = event.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    track.scrollLeft = startLeft - dx;
  };
  const pointerUp = () => {
    if (!down) return;
    down = false;
    track.classList.remove('grab');
  };
  const clickCapture = (event) => {
    if (moved > 6) {
      event.preventDefault();
      event.stopPropagation();
      moved = 0;
    }
  };

  track.addEventListener('pointerdown', pointerDown, { signal });
  addEventListener('pointermove', pointerMove, { signal });
  addEventListener('pointerup', pointerUp, { signal });
  track.addEventListener('click', clickCapture, { capture: true, signal });
  track.addEventListener('dragstart', (event) => event.preventDefault(), { signal });

  updateButtons();

  return () => {
    track.scrollLeft = 0;
    track.classList.remove('grab');
    previous.disabled = false;
    next.disabled = false;
  };
}

function initPortfolio(signal) {
  const stage = document.getElementById('pstage');
  const carousel = document.getElementById('pf');
  const dots = document.getElementById('pdots');
  const previous = document.getElementById('pPrev');
  const next = document.getElementById('pNext');
  if (!stage || !carousel || !dots || !previous || !next) return () => {};

  stage.innerHTML = PROJECTS.map(
    (project) => `<article class="pcard"><div class="pa"><img src="${project.image}" alt="" loading="lazy" decoding="async" /></div><div class="pt"><span class="pk">${project.c}</span><h3>${project.n}</h3><p>${project.d}</p><span class="pm">Challenge · Approach · Deliverables · Verified outcome</span></div></article>`,
  ).join('');

  dots.innerHTML = PROJECTS.map(
    (project, index) => `<button type="button" aria-label="Project ${index + 1}"></button>`,
  ).join('');

  const cards = [...stage.querySelectorAll('.pcard')];
  const dotButtons = [...dots.querySelectorAll('button')];
  let current = 0;
  let dragX = 0;
  let moved = 0;
  let startX = null;

  const render = () => {
    const count = PROJECTS.length;
    cards.forEach((card, index) => {
      let offset = index - current;
      if (offset > count / 2) offset -= count;
      if (offset < -count / 2) offset += count;
      const distance = Math.abs(offset);
      const cardWidth = card.offsetWidth || 1;
      const shift = offset * cardWidth * 0.74 + dragX;
      card.style.transform = `translateX(calc(-50% + ${shift}px)) scale(${distance === 0 ? 1 : distance === 1 ? 0.78 : 0.6})`;
      card.style.opacity = distance > 1 ? 0 : distance === 1 ? 0.55 : 1;
      card.style.zIndex = 10 - distance;
      card.style.pointerEvents = distance > 1 ? 'none' : 'auto';
      card.classList.toggle('side', distance !== 0);
      card.setAttribute('aria-hidden', distance !== 0 ? 'true' : 'false');
    });
    dotButtons.forEach((dot, index) => dot.classList.toggle('on', index === current));
  };

  const go = (index) => {
    current = (index + PROJECTS.length) % PROJECTS.length;
    dragX = 0;
    render();
  };

  const cardClick = (index) => {
    if (moved > 8) return;
    if (index !== current) go(index);
  };

  const prevHandler = () => go(current - 1);
  const nextHandler = () => go(current + 1);

  previous.addEventListener('click', prevHandler, { signal });
  next.addEventListener('click', nextHandler, { signal });
  cards.forEach((card, index) => card.addEventListener('click', () => cardClick(index), { signal }));
  dotButtons.forEach((dot, index) => dot.addEventListener('click', () => go(index), { signal }));

  const pointerDown = (event) => {
    if (event.button > 0) return;
    startX = event.clientX;
    moved = 0;
    dragX = 0;
  };
  const pointerMove = (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 8) {
      carousel.classList.add('drag');
      dragX = dx;
      render();
    }
  };
  const pointerUp = (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    carousel.classList.remove('drag');
    if (dx < -50) go(current + 1);
    else if (dx > 50) go(current - 1);
    else {
      dragX = 0;
      render();
    }
    setTimeout(() => {
      moved = 0;
    }, 30);
  };
  const keyDown = (event) => {
    if (event.key === 'ArrowLeft') go(current - 1);
    if (event.key === 'ArrowRight') go(current + 1);
  };
  const dragStart = (event) => event.preventDefault();

  carousel.addEventListener('pointerdown', pointerDown, { signal });
  addEventListener('pointermove', pointerMove, { signal });
  addEventListener('pointerup', pointerUp, { signal });
  addEventListener('pointercancel', pointerUp, { signal });
  carousel.addEventListener('keydown', keyDown, { signal });
  carousel.addEventListener('dragstart', dragStart, { signal });
  addEventListener('resize', render, { signal });
  carousel.tabIndex = 0;

  render();

  return () => {
    stage.innerHTML = '';
    dots.innerHTML = '';
    carousel.classList.remove('drag');
    carousel.removeAttribute('tabindex');
  };
}

export default function useHomeEffects() {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const cleanups = [
      initTyping(signal),
      initDeck(signal),
      initThreeWays(signal),
      initCapabilities(signal),
      initPortfolio(signal),
    ];

    return () => {
      controller.abort();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);
}
