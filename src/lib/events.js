import { query } from './db';

const EVENT_COLUMNS = `
  id, slug, title, description, flyer_url, event_date, start_time, end_time,
  timezone, venue, registration_url, event_type, status, featured, properties,
  created_at, updated_at`;

export async function listEventsAdmin() {
  const result = await query(
    `select ${EVENT_COLUMNS}
     from academy_events
     order by event_date desc, start_time desc nulls last, id desc`,
  );
  return result.rows;
}

export async function getEventForAdmin(id) {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;

  const result = await query(
    `select ${EVENT_COLUMNS}
     from academy_events
     where id = $1`,
    [numericId],
  );
  return result.rows[0] || null;
}

export async function listPublishedEvents() {
  const result = await query(
    `select ${EVENT_COLUMNS}
     from academy_events
     where status = 'published'
     order by (event_date >= current_date) desc,
              case when event_date >= current_date then featured end desc nulls last,
              case when event_date >= current_date then event_date end asc,
              event_date desc,
              start_time asc nulls last`,
  );
  return result.rows;
}

export async function getPublishedEventBySlug(slug) {
  if (!slug) return null;

  const result = await query(
    `select ${EVENT_COLUMNS}
     from academy_events
     where (slug = $1 or exists (
       select 1 from academy_event_slug_history h
       where h.slug = $1 and h.event_id = academy_events.id
     )) and status = 'published'
     order by (slug = $1) desc
     limit 1`,
    [slug],
  );
  return result.rows[0] || null;
}

export async function listEventSitemapEntries() {
  const result = await query(
    `select slug, updated_at, flyer_url
     from academy_events
     where status = 'published'
     order by event_date desc, id desc`,
  );
  return result.rows;
}
