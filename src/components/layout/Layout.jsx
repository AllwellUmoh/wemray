import { Outlet } from 'react-router-dom';
import Assistant from './Assistant';
import FooterMarkup from './FooterMarkup';
import HeaderMarkup from './HeaderMarkup';
import MobileMenuMarkup from './MobileMenuMarkup';
import ScrollToTop from './ScrollToTop';
import useSiteEffects from '../../lib/useSiteEffects';

export default function Layout() {
  useSiteEffects();

  return (
    <>
      <HeaderMarkup />
      <MobileMenuMarkup />
      <ScrollToTop />
      <Outlet />
      <FooterMarkup />
      <Assistant />
    </>
  );
}
