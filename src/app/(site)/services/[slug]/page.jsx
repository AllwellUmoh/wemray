import { notFound } from 'next/navigation';
import ServiceDetailSections from '../../../../components/services/sections/ServiceDetailSections';
import { ServiceDetailEffects } from '../../../../components/site/PageEffects';
import JsonLd from '../../../../components/seo/JsonLd';
import {
  absoluteUrl,
  breadcrumbSchema,
  buildMetadata,
  SITE,
  webPageSchema,
} from '../../../../lib/seo';
import { getService, services } from '../../../../data/services';

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return buildMetadata({
      title: 'Service not found | Wemray Technology',
      description:
        'The service you are looking for could not be found. Explore Wemray Technology services, portfolio and contact options.',
      path: `/services/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${service.name} in Port Harcourt | Wemray`,
    description: `${service.sub} Wemray serves Port Harcourt and Lagos, Nigeria, the UK and Canada.`,
    keywords: `${service.name} Port Harcourt, ${service.name} Nigeria, ${service.name} Lagos, ${service.name} London UK, ${service.name} Canada, ${service.name} company`,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) notFound();

  const url = absoluteUrl(`/services/${service.slug}`);
  const title = `${service.name} in Port Harcourt | Wemray`;
  const description = `${service.sub} Wemray serves Port Harcourt and Lagos, Nigeria, the UK and Canada.`;

  return (
    <>
      <ServiceDetailEffects />
      <ServiceDetailSections service={service} />
      <JsonLd
        data={[
          webPageSchema({ url, title, description }),
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
        ]}
      />
    </>
  );
}
