import SiteShell from '../components/site/SiteShell';
import NotFoundContent from '../components/site/NotFoundContent';

export const metadata = {
  title: 'Page Not Found | Wemray Technology',
  description:
    'The page you are looking for could not be found. Explore Wemray Technology services, portfolio, Ray Academy and contact pages.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
