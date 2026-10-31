import { Link } from 'react-router-dom';

const serviceRoutes = {
  'service-ai.html': '/services/ai',
  'service-automation.html': '/services/automation',
  'service-branding.html': '/services/branding',
  'service-mobile.html': '/services/mobile',
  'service-saas.html': '/services/saas',
  'service-seo.html': '/services/seo',
  'service-software.html': '/services/software',
  'service-website.html': '/services/website',
};

const pageRoutes = {
  'index.html': '/',
  'about.html': '/about',
  'about (1).html': '/about',
  'services.html': '/services',
  'services (1).html': '/services',
  'academy.html': '/academy',
  'academy (1).html': '/academy',
  'contact.html': '/contact',
  'portfolio.html': '/portfolio',
  'work.html': '/portfolio',
  'privacy.html': '/privacy',
  'terms.html': '/terms',
};

function resolveRoute(href) {
  if (!href) return null;
  if (/^(?:[a-z]+:|\/\/|#)/i.test(href)) return null;

  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
  const file = (queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash)
    .replace(/^\.?\//, '')
    .replace(/^.*\//, '');

  if (!file) return `/${hash}`;
  const route = serviceRoutes[file] || pageRoutes[file];
  if (!route) return null;
  return `${route}${query}${hash}`.replace(/\/#/, '/#');
}

export default function AppLink({ href, to, children, ...rest }) {
  const target = to || href;

  if (target && target.startsWith('/') && !target.startsWith('//')) {
    return (
      <Link to={target} {...rest}>
        {children}
      </Link>
    );
  }

  const route = resolveRoute(target);

  if (route) {
    return (
      <Link to={route} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={target} {...rest}>
      {children}
    </a>
  );
}
