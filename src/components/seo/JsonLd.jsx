import { toGraph } from '../../lib/seo';

export default function JsonLd({ data }) {
  const graph = toGraph(data);
  if (!graph) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  );
}
