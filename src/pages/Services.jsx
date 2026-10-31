import ServicesSections from '../components/services/sections/index.jsx';
import useServicesEffects from '../hooks/useServicesEffects';
import usePageMeta, { absoluteUrl } from '../lib/usePageMeta';
import { services } from '../data/services';

export default function Services() {
  usePageMeta({
    title: 'Digital Services | Web Design, Software & AI | Wemray',
    description:
      "Explore Wemray's branding, web design, software, mobile app, AI automation and SEO services for businesses in Nigeria, the UK and Canada.",
    keywords:
      'branding services Nigeria, website design Port Harcourt, software development Nigeria, mobile app development Nigeria, AI automation company Nigeria, SEO services Port Harcourt, digital agency UK Canada, SaaS development Nigeria',
    schemaType: 'CollectionPage',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ],
    extraSchema: {
      '@type': 'ItemList',
      name: 'Wemray Technology digital services',
      itemListElement: services.map((service, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Service',
          name: service.name,
          description: service.sub,
          url: absoluteUrl(`/services/${service.slug}`),
        },
      })),
    },
  });
  useServicesEffects();
  return <ServicesSections />;
}
