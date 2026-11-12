export function formatEventDate(value, timeZone = 'Africa/Lagos', dateStyle = 'full') {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-NG', { dateStyle, timeZone: 'UTC' }).format(date);
}

export function formatEventTime(startTime, endTime, timeZone = 'Africa/Lagos') {
  const start = startTime ? String(startTime).slice(0, 5) : '';
  const end = endTime ? String(endTime).slice(0, 5) : '';
  const time = start && end ? `${start} – ${end}` : start || end;
  return time ? `${time} · ${timeZone}` : timeZone;
}

function dateTimeWithOffset(event, timeValue) {
  const date = String(event.event_date || '').slice(0, 10);
  const time = String(timeValue || '00:00').slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return undefined;

  const timeZone = event.timezone || 'Africa/Lagos';
  const anchor = new Date(`${date}T${time}:00.000Z`);
  const zoneName = new Intl.DateTimeFormat('en', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(anchor).find((part) => part.type === 'timeZoneName')?.value || 'GMT';
  const match = /^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/.exec(zoneName);
  if (!match) return `${date}T${time}:00`;

  const suffix = match[1]
    ? `${match[1]}${String(match[2]).padStart(2, '0')}:${match[3] || '00'}`
    : '+00:00';
  return `${date}T${time}:00${suffix}`;
}

export function eventJsonLd(event, canonicalUrl, absoluteUrl) {
  const venue = event.venue || '';
  const online = /\bonline\b|\bvirtual\b/i.test(venue);

  return {
    '@type': 'Event',
    '@id': `${canonicalUrl}#event`,
    name: event.title,
    description: event.description,
    url: canonicalUrl,
    startDate: dateTimeWithOffset(event, event.start_time),
    ...(event.end_time ? { endDate: dateTimeWithOffset(event, event.end_time) } : {}),
    eventStatus: event.status === 'cancelled'
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': online ? 'VirtualLocation' : 'Place',
      name: venue,
      ...(online ? { url: event.registration_url || canonicalUrl } : {}),
    },
    organizer: {
      '@type': 'Organization',
      name: 'Wemray Technology',
      url: absoluteUrl('/'),
    },
    ...(event.flyer_url ? { image: absoluteUrl(event.flyer_url) } : {}),
    ...(event.registration_url
      ? {
          offers: {
            '@type': 'Offer',
            url: event.registration_url,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}
