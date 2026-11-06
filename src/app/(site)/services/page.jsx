import ServicesSections from '../../../components/services/sections';
import { ServicesEffects } from '../../../components/site/PageEffects';
import JsonLd from '../../../components/seo/JsonLd';
import {
  absoluteUrl,
  breadcrumbSchema,
  buildMetadata,
  webPageSchema,
} from '../../../lib/seo';
import { services } from '../../../data/services';

const title = 'Digital Services | Web Design, Software & AI | Wemray';
const description =
  "Explore Wemray's branding, web design, software, mobile app, AI automation and SEO services for businesses in Nigeria, the UK and Canada.";

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'branding services Nigeria, website design Port Harcourt, software development Nigeria, mobile app development Nigeria, AI automation company Nigeria, SEO services Port Harcourt, digital agency UK Canada, SaaS development Nigeria',
  path: '/services',
});

export default function ServicesPage() {
  return (
    <>
      <ServicesEffects />
      <ServicesSections />
      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/services'),
            title,
            description,
            type: 'CollectionPage',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
          ]),
          {
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
        ]}
      />
    </>
  );
}
