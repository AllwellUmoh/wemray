import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }

    const timer = setTimeout(() => {
      const id = decodeURIComponent(hash.slice(1));
      const target = id && id !== 'top' ? document.getElementById(id) : null;
      if (target) target.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
    }, 60);

    return () => clearTimeout(timer);
  }, [pathname, hash, key]);

  return null;
}
