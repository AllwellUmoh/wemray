import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl, breadcrumbSchema, buildMetadata, webPageSchema } from '@/lib/seo';
import { eventJsonLd, formatEventDate, formatEventTime } from '@/lib/events-format';
import { listPublishedEvents } from '@/lib/events';

const title = 'Wemray Events | Workshops, Talks & Community';
const description = 'Explore upcoming Wemray workshops, talks, and community events in Port Harcourt and online.';

export const metadata = buildMetadata({ title, description, path: '/events' });
export const revalidate = 60;

function localDateIn(timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  return `${parts.find((part) => part.type === 'year')?.value}-${parts.find((part) => part.type === 'month')?.value}-${parts.find((part) => part.type === 'day')?.value}`;
}

function isUpcoming(event) {
  const date = String(event.event_date).slice(0, 10);
  const timeZone = event.timezone || 'Africa/Lagos';
  const today = localDateIn(timeZone);
  if (date > today) return true;
  if (date < today) return false;
  if (!event.start_time) return true;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const now = `${parts.find((part) => part.type === 'hour')?.value}:${parts.find((part) => part.type === 'minute')?.value}`;
  return String(event.end_time || event.start_time).slice(0, 5) >= now;
}

function EventCard({ event, past = false }) {
  return (
    <article className={`event-card${event.featured ? ' event-card-featured' : ''}`}>
      <Link className="event-card-image" href={`/events/${event.slug}`} aria-label={`View ${event.title}`}>
        {event.flyer_url ? (
          <Image
            unoptimized
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
            src={event.flyer_url}
            alt={`${event.title} event flyer`}
          />
        ) : <span className="event-card-art">W<span>EVENTS</span></span>}
        {event.event_type ? <span className="event-type-pill">{event.event_type}</span> : null}
      </Link>
      <div className="event-card-body">
        <div className="event-card-date">
          <span>{formatEventDate(event.event_date, event.timezone, 'medium')}</span>
          <small>{formatEventTime(event.start_time, event.end_time, event.timezone)}</small>
        </div>
        <h3><Link href={`/events/${event.slug}`}>{event.title}</Link></h3>
        <p>{event.description}</p>
        <div className="event-card-footer">
          <span>{event.venue}</span>
          <Link href={`/events/${event.slug}`}>{past ? 'Event details' : 'Explore event'} <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  let events = [];
  try {
    events = await listPublishedEvents();
  } catch (error) {
    console.error('Events page could not load published events', error);
  }

  const upcoming = events.filter(isUpcoming);
  const past = events.filter((event) => !isUpcoming(event));

  return (
    <main className="events-page">
      <JsonLd
        data={[
          webPageSchema({ url: absoluteUrl('/events'), title, description, type: 'CollectionPage' }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Events', path: '/events' },
          ]),
          ...(events.length
            ? [{
                '@type': 'ItemList',
                '@id': `${absoluteUrl('/events')}#event-list`,
                name: 'Wemray events',
                itemListElement: events.map((event, index) => {
                  const eventUrl = absoluteUrl(`/events/${event.slug}`);
                  return {
                    '@type': 'ListItem',
                    position: index + 1,
                    url: eventUrl,
                    item: eventJsonLd(event, eventUrl, absoluteUrl),
                  };
                }),
              }]
            : []),
        ]}
      />

      <section className="events-hero">
        <div className="events-hero-orbit events-hero-orbit-one" />
        <div className="events-hero-orbit events-hero-orbit-two" />
        <div className="events-hero-inner">
          <h1>Ideas move<br /><em>when we meet.</em></h1>
          <p>Workshops, conversations, and practical sessions for people building what comes next.</p>
          <a className="events-scroll-link" href="#upcoming">Explore upcoming events <span aria-hidden="true">↓</span></a>
        </div>
        <div className="events-hero-stamp" aria-hidden="true"><span>LEARN</span><b>·</b><span>SHARE</span><b>·</b><span>BUILD</span></div>
      </section>

      <section className="events-content" id="upcoming">
        <div className="events-heading-row">
          <div>
            <span className="events-section-kicker">Make room for a new idea</span>
            <h2>Upcoming events</h2>
          </div>
          <span className="events-count">{upcoming.length.toString().padStart(2, '0')} events</span>
        </div>

        {upcoming.length ? (
          <div className="events-grid">
            {upcoming.map((event) => <EventCard event={event} key={event.id} />)}
          </div>
        ) : (
          <div className="events-empty">
            <span className="events-empty-mark">W</span>
            <div>
              <h3>New dates are on the way.</h3>
              <p>There are no upcoming events published right now. Check back soon or get in touch to hear about the next session.</p>
              <Link href="/contact">Talk to the team <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        )}
      </section>

      {past.length ? (
        <section className="events-past">
          <div className="events-content">
            <div className="events-heading-row">
              <div><span className="events-section-kicker">From our community</span><h2>Past events</h2></div>
            </div>
            <div className="events-grid">
              {past.slice(0, 6).map((event) => <EventCard event={event} key={event.id} past />)}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
