import { useParams } from 'react-router-dom';
import { getService } from '../data/services';
import usePageMeta, { absoluteUrl, breadcrumbSchema, SITE, webPageSchema } from '../lib/usePageMeta';
import useServiceDetailEffects from '../hooks/useServiceDetailEffects';
import NotFound from './NotFound';
import ServiceDetailSections from '../components/services/sections/ServiceDetailSections';

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getService(slug);
  const url = absoluteUrl(`/services/${slug}`);
  const title = service
    ? `${service.name} in Port Harcourt | Wemray`
    : 'Service not found | Wemray Technology';
  const description = service
    ? `${service.sub} Wemray serves Port Harcourt and Lagos, Nigeria, the UK and Canada.`
    : 'The service you are looking for could not be found. Explore Wemray Technology services, portfolio and contact options.';

  usePageMeta({
    title,
    description,
    keywords: service
      ? `${service.name} Port Harcourt, ${service.name} Nigeria, ${service.name} Lagos, ${service.name} London UK, ${service.name} Canada, ${service.name} company`
      : undefined,
    robots: service ? undefined : 'noindex, follow',
    jsonLd: service
      ? [
          webPageSchema({ url, title, description, type: 'WebPage' }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
          {
            '@type': 'Service',
            '@id': `${url}#service`,
            name: service.name,
            serviceType: service.name,
            description: service.sub,
            url,
            provider: { '@id': `${SITE.url}/#organization` },
            areaServed: SITE.areasServed.map((name) => ({ '@type': 'Place', name })),
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: `${service.name} capabilities`,
              itemListElement: (service.create?.items || []).map((item) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: item.title,
                  ...(item.desc ? { description: item.desc } : {}),
                },
              })),
            },
          },
        ]
      : undefined,
  });
  useServiceDetailEffects();

  if (!service) return <NotFound />;

  return <ServiceDetailSections service={service} />;
}
