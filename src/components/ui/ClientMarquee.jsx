import { clients } from '../../data/clients';

export default function ClientMarquee() {
  return (
    <section className="clients" id="clients" aria-label="Our clients">
      <div className="cl-wrap">
        <div className="cl-track" id="clTrack">
          {[...clients, ...clients].map((client, index) => (
            <div className="cl" key={`${client.name}-${index}`} aria-hidden={index >= clients.length || undefined}>
              <img
                src={client.logo}
                alt={index >= clients.length ? '' : client.name}
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
