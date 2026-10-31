import ServiceCard from './ServiceCard';
import { capabilities } from '../../data/services';

export default function ServiceGrid({ items = capabilities, className = 'svg9' }) {
  return (
    <div className={className}>
      {items.map((service, index) => (
        <ServiceCard key={service.slug} service={service} index={index} />
      ))}
    </div>
  );
}
