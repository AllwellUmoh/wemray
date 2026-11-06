'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initBlueprint } from './blueprint.js';
import { IC, ICO } from './icons.js';

function rnd(seed) {
  let state = seed * 9301 + 49297;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

function paintPixels(el, count, seed) {
  if (!el) return;
  const random = rnd(seed);
  let html = '';
  for (let i = 0; i < count; i += 1) {
    html += `<i style="left:${(random() * 92).toFixed(1)}%;top:${(random() * 92).toFixed(1)}%;width:calc(var(--u)*${1 + Math.floor(random() * 3)});height:calc(var(--u)*${1 + Math.floor(random() * 2)});--t:${(6 + random() * 8).toFixed(1)}s;--dl:-${(random() * 8).toFixed(1)}s"></i>`;
  }
  el.innerHTML = html;
}

function initNav(signal) {
  const nav = document.getElementById('nav');
  if (!nav) return () => {};

  const update = () => {
    const hero = document.getElementById('top');
    const height = hero ? hero.offsetHeight : 600;
    nav.classList.toggle('stuck', scrollY > height - 140);
  };

  update();
  addEventListener('scroll', update, { passive: true, signal });
  addEventListener('resize', update, { signal });

  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mmenu');
  let open = false;

  const setOpen = (value) => {
    open = value;
    nav.classList.toggle('open', open);
    burger?.setAttribute('aria-expanded', String(open));
  };

  const burgerHandler = () => setOpen(!open);
  burger?.addEventListener('click', burgerHandler, { signal });

  const mobileHandler = () => setOpen(false);
  mobile?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', mobileHandler, { signal });
  });

  return () => setOpen(false);
}

function initMenus(signal) {
  const items = document.querySelectorAll('.has-mega');
  if (!items.length) return;

  const controllers = [];

  items.forEach((item) => {
    const trigger = item.querySelector('a');
    if (!trigger) return;
    let timer;

    const open = () => {
      clearTimeout(timer);
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    };

    const shut = () => {
      clearTimeout(timer);
      item.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    item.addEventListener('mouseenter', open, { signal });
    item.addEventListener(
      'mouseleave',
      () => {
        timer = setTimeout(shut, 140);
      },
      { signal },
    );

    trigger.addEventListener(
      'click',
      (event) => {
        if (matchMedia('(hover:none)').matches && !item.classList.contains('open')) {
          event.preventDefault();
          open();
        }
      },
      { signal },
    );

    controllers.push({ item, shut, clear: () => clearTimeout(timer) });
  });

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') controllers.forEach((controller) => controller.shut());
    },
    { signal },
  );

  document.addEventListener(
    'click',
    (event) => {
      controllers.forEach((controller) => {
        if (!controller.item.contains(event.target)) controller.shut();
      });
    },
    { signal },
  );

  addEventListener(
    'scroll',
    () => controllers.forEach((controller) => controller.shut()),
    { passive: true, signal },
  );
  signal.addEventListener('abort', () =>
    controllers.forEach((controller) => controller.clear()),
  );
}

function initActiveNav(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('#nav > ul > li > a').forEach((link) => {
    const href = link.getAttribute('href');
    const active =
      href === normalized ||
      (href === '/services' && normalized.startsWith('/services/')) ||
      (href === '/tools/ray-seo-analyser' && normalized.startsWith('/tools'));
    link.classList.toggle('cur', active);
  });
}

function ico(paths) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function initIcons(pathname) {
  document.querySelectorAll('[data-ico]').forEach((el) => {
    el.innerHTML = ICO[el.getAttribute('data-ico')] || '';
  });
  document.querySelectorAll('[data-ic]').forEach((el) => {
    el.innerHTML = IC[Number(el.getAttribute('data-ic'))] || '';
  });

  const chat = document.getElementById('ci1');
  const grid = document.getElementById('ci2');
  if (chat) chat.innerHTML = ico(ICO.chat);
  if (grid) grid.innerHTML = ico(ICO.grid);

  const core = document.getElementById('cnIc');
  if (core) core.innerHTML = ico(pathname.startsWith('/academy') ? ICO.target : ICO.chat);
}

function initWhyFlow() {
  const flow = document.getElementById('flow');
  if (!flow || flow.querySelector('.fs')) return () => {};

  const principles = [
    ['W', 'Wide-Ranging Expertise', 'Creative and technical skills, working as one.'],
    ['E', 'Every Client Matters', 'Solutions shaped around your actual needs.'],
    ['M', 'Momentum by Design', 'Clear priorities. Structured delivery.'],
    ['R', 'Reliability by Principle', 'Built to be stable and maintainable.'],
    ['A', 'Adaptive Innovation', 'Technology chosen for usefulness, not novelty.'],
    ['Y', 'Your Quality, Our Standard', 'Tested, reviewed, and refined.'],
  ];

  principles.forEach(([letter, title, copy], index) => {
    const item = document.createElement('div');
    item.className = 'fs';
    item.innerHTML = `<div class="fn" style="--c:${index + 1};--i:${index}">${letter}</div><div class="fx ${index % 2 ? 'd' : 'u'}" style="--c:${index + 1};--i:${index}"><h3>${title}</h3><p>${copy}</p></div>`;
    flow.appendChild(item);
  });

  return () => {
    flow.querySelectorAll('.fs').forEach((item) => item.remove());
  };
}

function initReveal() {
  const targets = document.querySelectorAll('.im, #stats, #flow, #fm, #ctv, #ftg, .rv, #apSt');
  if (!targets.length) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in', 'on');
        entry.target.querySelectorAll('[data-to]').forEach((node) => {
          if (node.dataset.done) return;
          node.dataset.done = '1';
          const to = Number(node.dataset.to);
          const start = performance.now();
          const step = (time) => {
            const progress = Math.min(1, (time - start) / 1400);
            node.textContent = Math.round(to * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -5% 0px' },
  );

  targets.forEach((target) => observer.observe(target));
  return () => observer.disconnect();
}

export default function useSiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const cleanupNav = initNav(signal);
    initMenus(signal);
    initActiveNav(pathname);
    initIcons(pathname);

    paintPixels(document.getElementById('pxHero'), 30, 5);
    paintPixels(document.getElementById('pxWhy'), 26, 7);
    paintPixels(document.getElementById('pxOne'), 22, 11);

    const cleanupFlow = initWhyFlow();
    const cleanupBlueprint = initBlueprint(signal);
    const cleanupReveal = initReveal();

    document.body.classList.remove('ast-open');

    return () => {
      controller.abort();
      cleanupNav();
      cleanupFlow();
      cleanupBlueprint();
      cleanupReveal();
      document.body.classList.remove('ast-open');
    };
  }, [pathname]);
}
