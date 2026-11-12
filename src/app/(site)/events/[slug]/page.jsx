import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl, breadcrumbSchema, buildMetadata, webPageSchema } from '@/lib/seo';
import { eventJsonLd, formatEventDate, formatEventTime } from '@/lib/events-format';
import { getPublishedEventBySlug } from '@/lib/events';

export const revalidate = 60;

async function loadEvent(slug) {
  try {
    return await getPublishedEventBySlug(slug);
  } catch (error) {
    console.error('Event page could not load event', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) {
    return buildMetadata({
      title: 'Event not found | Wemray',
      description: 'This event may have ended or is no longer available.',
      path: `/events/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${event.title} | Wemray Events`,
    description: event.description,
    path: `/events/${event.slug}`,
    image: event.flyer_url || undefined,
  });
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  if (event.slug !== slug) permanentRedirect(`/events/${event.slug}`);

  const url = absoluteUrl(`/events/${event.slug}`);
  const title = `${event.title} | Wemray Events`;
  const description = event.description;
  const eventInfo = [
    { label: 'Date', value: formatEventDate(event.event_date, event.timezone) },
    { label: 'Time', value: formatEventTime(event.start_time, event.end_time, event.timezone) },
    { label: 'Venue', value: event.venue },
    ...(event.event_type ? [{ label: 'Event type', value: event.event_type }] : []),
    ...(Array.isArray(event.properties) ? event.properties : []),
  ];

  return (
    <main className="event-detail-page">
      <JsonLd
        data={[
          webPageSchema({ url, title, description, type: 'WebPage' }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Events', path: '/events' },
            { name: event.title, path: `/events/${event.slug}` },
          ]),
          eventJsonLd(event, url, absoluteUrl),
        ]}
      />

      <section className="event-detail-hero">
        <div className="event-detail-topline">
          <Link href="/events">← All events</Link>
          {event.event_type ? <span>{event.event_type}</span> : null}
        </div>
        <div className="event-detail-layout">
          <div className="event-detail-copy">
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            <div className="event-detail-cta">
              {event.registration_url ? (
                <a className="btn lav" href={event.registration_url} target="_blank" rel="noreferrer">
                  Register for this event <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="event-registration-note">Registration details will be shared soon.</span>
              )}
            </div>
          </div>
          <div className="event-detail-art">
            {event.flyer_url
              ? <Image unoptimized fill sizes="(max-width: 700px) 100vw, 45vw" src={event.flyer_url} alt={`${event.title} event flyer`} />
              : <div className="event-detail-placeholder"><span>W</span><small>WEMRAY EVENTS</small></div>}
          </div>
        </div>
      </section>

      <section className="event-detail-information">
        <div className="event-info-heading">
          <span className="events-section-kicker">Save your place</span>
          <h2>Event information</h2>
        </div>
        <dl className="event-info-grid">
          {eventInfo.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
