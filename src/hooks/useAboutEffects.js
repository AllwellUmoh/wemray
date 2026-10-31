import { useEffect } from 'react';

export default function useAboutEffects() {
  useEffect(() => {
    const visual = document.getElementById('vn');
    const hero = document.getElementById('top');
    if (!visual || !hero) return undefined;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || matchMedia('(hover:none)').matches) return undefined;

    const move = (event) => {
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

    const leave = () => {
      visual.style.setProperty('--mx', 0);
      visual.style.setProperty('--my', 0);
    };

    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);

    return () => {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      leave();
    };
  }, []);
}
