import { useEffect } from 'react';

export default function useServiceDetailEffects() {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stage = document.getElementById('sxStage');
    const items = [...document.querySelectorAll('.sx-i')];
    const slides = [...document.querySelectorAll('.sx-s')];
    const bar = document.getElementById('sxBar');
    const counter = document.getElementById('sxC');
    let timer;
    let paused = false;
    let visible = false;
    let current = 0;

    const restart = () => {
      clearTimeout(timer);
      bar?.classList.remove('run');
      if (bar) void bar.offsetWidth;
      if (reduce || paused || !visible) return;
      bar?.classList.add('run');
      timer = setTimeout(() => go(current + 1), 5000);
    };

    const go = (index) => {
      const count = items.length;
      if (!count) return;
      current = (index + count) % count;
      items.forEach((item, key) => {
        item.classList.toggle('on', key === current);
        item.setAttribute('aria-selected', String(key === current));
      });
      slides.forEach((slide, key) => slide.classList.toggle('on', key === current));
      if (counter) counter.textContent = `0${current + 1} / 0${count}`;
      restart();
    };

    items.forEach((item, index) => {
      item.addEventListener('click', () => go(index), { signal });
      item.addEventListener(
        'mouseenter',
        () => {
          paused = true;
          clearTimeout(timer);
          bar?.classList.remove('run');
          if (index !== current) go(index);
        },
        { signal },
      );
      item.addEventListener(
        'mouseleave',
        () => {
          paused = false;
          restart();
        },
        { signal },
      );
    });

    if (stage) {
      stage.addEventListener(
        'mouseenter',
        () => {
          paused = true;
          clearTimeout(timer);
          if (bar) bar.style.animationPlayState = 'paused';
        },
        { signal },
      );
      stage.addEventListener(
        'mouseleave',
        () => {
          paused = false;
          if (bar) bar.style.animationPlayState = '';
          restart();
        },
        { signal },
      );
    }

    let observer;
    if (stage && items.length) {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
          restart();
        },
        { threshold: 0.35 },
      );
      observer.observe(stage);
      go(0);
    }

    const visual = document.getElementById('spv');
    const hero = document.getElementById('top');
    let move;
    let leave;
    if (visual && hero && !reduce && !matchMedia('(hover:none)').matches) {
      move = (event) => {
        const rect = visual.getBoundingClientRect();
        visual.style.setProperty(
          '--mx',
          ((event.clientX - (rect.left + rect.width / 2)) / innerWidth * 2).toFixed(3),
        );
        visual.style.setProperty(
          '--my',
          ((event.clientY - (rect.top + rect.height / 2)) / innerHeight * 2).toFixed(3),
        );
      };
      leave = () => {
        visual.style.setProperty('--mx', 0);
        visual.style.setProperty('--my', 0);
      };
      hero.addEventListener('pointermove', move, { signal });
      hero.addEventListener('pointerleave', leave, { signal });
    }

    return () => {
      controller.abort();
      clearTimeout(timer);
      observer?.disconnect();
      bar?.classList.remove('run');
      if (bar) bar.style.animationPlayState = '';
      items.forEach((item) => item.classList.remove('on'));
      slides.forEach((slide) => slide.classList.remove('on'));
      if (visual) {
        visual.style.setProperty('--mx', 0);
        visual.style.setProperty('--my', 0);
      }
    };
  }, []);
}
