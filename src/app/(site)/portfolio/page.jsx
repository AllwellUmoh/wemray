import PortfolioSections from '../../../components/portfolio/sections';
import JsonLd from '../../../components/seo/JsonLd';
import {
  absoluteUrl,
  breadcrumbSchema,
  buildMetadata,
  SITE,
  webPageSchema,
} from '../../../lib/seo';
import { projects } from '../../../data/projects';

const title = 'Portfolio | Web Design & Development Projects | Wemray';
const description =
  'See website design and development projects by Wemray for corporate, e-commerce, oil & gas, construction and consulting clients in Nigeria, the UK and Canada.';

export const metadata = buildMetadata({
  title,
  description,
  keywords:
    'web design portfolio Nigeria, website development projects Port Harcourt, corporate website design Lagos, ecommerce website development Nigeria, web design agency London UK, software portfolio Canada, oil and gas website design',
  path: '/portfolio',
});

export default function PortfolioPage() {
  return (
    <>
      <PortfolioSections />
      <JsonLd
        data={[
          webPageSchema({
            url: absoluteUrl('/portfolio'),
            title,
            description,
            type: 'CollectionPage',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Portfolio', path: '/portfolio' },
          ]),
          {
            '@type': 'ItemList',
            name: 'Selected web design and development projects',
            itemListElement: projects.map((project, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'CreativeWork',
                name: project.title,
                description: project.summary,
                url: project.url,
                image: absoluteUrl(project.image),
                creator: { '@id': `${SITE.url}/#organization` },
              },
            })),
          },
        ]}
      />
    </>
  );
}
