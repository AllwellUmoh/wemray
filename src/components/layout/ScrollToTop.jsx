'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;

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
  }, [pathname]);

  return null;
}
