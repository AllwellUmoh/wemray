'use client';

import Assistant from '../layout/Assistant';
import FooterMarkup from '../layout/FooterMarkup';
import HeaderMarkup from '../layout/HeaderMarkup';
import MobileMenuMarkup from '../layout/MobileMenuMarkup';
import ScrollToTop from '../layout/ScrollToTop';
import useSiteEffects from '../../lib/useSiteEffects';

export default function SiteShell({ children }) {
  useSiteEffects();

  return (
    <>
      <HeaderMarkup />
      <MobileMenuMarkup />
      <ScrollToTop />
      {children}
      <FooterMarkup />
      <Assistant />
    </>
  );
}
