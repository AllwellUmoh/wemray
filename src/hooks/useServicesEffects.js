import { useEffect } from 'react';

export default function useServicesEffects() {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const box = document.getElementById('oneNet');
    if (!box) return undefined;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const buttons = [...document.querySelectorAll('.one-sw button')];
    const paragraphs = [...document.querySelectorAll('.one-t p')];
    const nodes = [...box.querySelectorAll('.nd')];
    let current = 4;
    let timer;

    const select = (index) => {
      current = index;
      nodes.forEach((node, key) => node.classList.toggle('sel', key === index));
    };

    const mode = (value) => {
      box.dataset.m = value;
      if (value === 'many') select(-1);
      else if (current < 0) select(4);

      buttons.forEach((button) => {
        const active = button.dataset.m === value;
        button.classList.toggle('on', active);
        button.setAttribute('aria-selected', String(active));
      });
      paragraphs.forEach((paragraph) => {
        paragraph.classList.toggle('on', paragraph.dataset.m === value);
      });

      clearInterval(timer);
      if (value === 'one' && !reduce) {
        timer = setInterval(() => select((current + 4) % 9), 2200);
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => mode(button.dataset.m), { signal });
    });

    nodes.forEach((node, index) => {
      node.addEventListener(
        'click',
        (event) => {
          if (box.dataset.m === 'one') {
            event.preventDefault();
            select(index);
            clearInterval(timer);
          }
        },
        { signal },
      );
    });

    select(4);
    mode('one');

    return () => {
      controller.abort();
      clearInterval(timer);
      nodes.forEach((node) => node.classList.remove('sel'));
      buttons.forEach((button) => {
        button.classList.remove('on');
        button.setAttribute('aria-selected', 'false');
      });
      paragraphs.forEach((paragraph) => paragraph.classList.remove('on'));
    };
  }, []);
}
