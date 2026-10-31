import AppLink from '../ui/AppLink';
import Button from '../ui/Button';
import { services } from '../../data/services';

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
];

const tail = [
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Ray Academy', to: '/academy' },
];

export default function MobileMenuMarkup() {
  return (
    <nav className="mmenu" id="mmenu" aria-label="Mobile">
      {links.map((link) => (
        <AppLink key={link.to} to={link.to}>
          {link.label}
        </AppLink>
      ))}
      <details className="mm-sv">
        <summary>
          Services
          <svg className="chv" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div>
          {services.map((service) => (
            <AppLink key={service.slug} to={`/services/${service.slug}`}>
              {service.name}
            </AppLink>
          ))}
          <AppLink to="/academy">Skills Training</AppLink>
        </div>
      </details>
      {tail.map((link) => (
        <AppLink key={link.to} to={link.to}>
          {link.label}
        </AppLink>
      ))}
      <Button to="/contact" variant="pur">
        Start a Conversation
      </Button>
    </nav>
  );
}
