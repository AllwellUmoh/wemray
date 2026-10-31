import PortfolioSections from '../components/portfolio/sections';
import usePageMeta, { absoluteUrl, SITE } from '../lib/usePageMeta';
import { projects } from '../data/projects';

export default function Portfolio() {
  usePageMeta({
    title: 'Portfolio | Web Design & Development Projects | Wemray',
    description:
      'See website design and development projects by Wemray for corporate, e-commerce, oil & gas, construction and consulting clients in Nigeria, the UK and Canada.',
    keywords:
      'web design portfolio Nigeria, website development projects Port Harcourt, corporate website design Lagos, ecommerce website development Nigeria, web design agency London UK, software portfolio Canada, oil and gas website design',
    schemaType: 'CollectionPage',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Portfolio', path: '/portfolio' },
    ],
    extraSchema: {
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
  });
  return <PortfolioSections />;
}
