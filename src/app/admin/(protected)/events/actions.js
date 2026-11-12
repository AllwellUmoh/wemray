'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { pool } from '@/lib/db';

const EVENT_STATUSES = new Set(['draft', 'published', 'cancelled', 'archived']);

function text(formData, key, maxLength = 2000) {
  return String(formData.get(key) || '').trim().slice(0, maxLength);
}

function publicImageUrl(value) {
  if (!value) return '';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function httpUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function eventProperties(value) {
  let rows;
  try {
    rows = JSON.parse(value || '[]');
  } catch {
    return { error: 'The additional event details could not be read.' };
  }
  if (!Array.isArray(rows) || rows.length > 30) {
    return { error: 'Add up to 30 additional event details.' };
  }

  const properties = [];
  for (const row of rows) {
    const label = String(row?.label || '').trim().slice(0, 80);
    const detail = String(row?.value || '').trim().slice(0, 500);
    if (!label && !detail) continue;
    if (!label || !detail) return { error: 'Complete or remove each additional event detail.' };
    properties.push({ label, value: detail });
  }
  return { properties };
}

export async function saveEventAction(_previousState, formData) {
  await requireAdmin();

  const id = text(formData, 'event_id', 20);
  const numericId = id ? Number(id) : null;
  const title = text(formData, 'title', 200);
  const slug = text(formData, 'slug', 120).toLowerCase();
  const description = text(formData, 'description', 10000);
  const flyerUrl = publicImageUrl(text(formData, 'flyer_url', 2000));
  const eventDate = text(formData, 'event_date', 10);
  const startTime = text(formData, 'start_time', 5);
  const endTime = text(formData, 'end_time', 5);
  const timezone = text(formData, 'timezone', 80) || 'Africa/Lagos';
  const venue = text(formData, 'venue', 500);
  const registrationUrl = httpUrl(text(formData, 'registration_url', 2000));
  const eventType = text(formData, 'event_type', 100);
  const status = text(formData, 'status', 20);
  const featured = formData.get('featured') === 'on';
  const parsedProperties = eventProperties(text(formData, 'properties_json', 30000));

  if (id && (!Number.isSafeInteger(numericId) || numericId <= 0)) return { error: 'That event could not be found.' };
  if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: 'Add an event title and a URL slug using lowercase letters, numbers and hyphens.' };
  }
  if (!description || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || !/^\d{2}:\d{2}$/.test(startTime)) {
    return { error: 'Add the event description, date, and start time.' };
  }
  if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) return { error: 'Enter a valid event end time.' };
  if (endTime && endTime < startTime) return { error: 'The end time must be after the start time on the event date.' };
  if (!venue) return { error: 'Add the venue or enter “Online”.' };
  if (!EVENT_STATUSES.has(status)) return { error: 'Choose a valid event status.' };
  if (flyerUrl === null) return { error: 'The flyer must be a public http(s) URL or a site path starting with /.' };
  if (registrationUrl === null) return { error: 'The registration link must start with http:// or https://.' };
  if (parsedProperties.error) return { error: parsedProperties.error };

  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone });
  } catch {
    return { error: 'Choose a valid time zone.' };
  }

  const client = await pool.connect();
  let savedEvent;
  let previousSlug = '';
  try {
    await client.query('begin');
    if (numericId) {
      const existing = await client.query(
        'select id, slug from academy_events where id = $1 for update',
        [numericId],
      );
      if (!existing.rows[0]) {
        await client.query('rollback');
        return { error: 'That event could not be found.' };
      }
      previousSlug = existing.rows[0].slug;
      const result = await client.query(
        `update academy_events
         set slug = $2, title = $3, description = $4, flyer_url = $5,
             event_date = $6::date, start_time = nullif($7, '')::time,
             end_time = nullif($8, '')::time, timezone = $9, venue = $10,
             registration_url = $11, event_type = $12, status = $13,
             featured = $14, properties = $15::jsonb, updated_at = now()
         where id = $1
         returning id, slug`,
        [numericId, slug, title, description, flyerUrl, eventDate, startTime, endTime, timezone,
          venue, registrationUrl, eventType, status, featured, JSON.stringify(parsedProperties.properties)],
      );
      savedEvent = result.rows[0];
    } else {
      const result = await client.query(
        `insert into academy_events
          (slug, title, description, flyer_url, event_date, start_time, end_time,
           timezone, venue, registration_url, event_type, status, featured, properties)
         values ($1, $2, $3, $4, $5::date, nullif($6, '')::time, nullif($7, '')::time,
                 $8, $9, $10, $11, $12, $13, $14::jsonb)
         returning id, slug`,
        [slug, title, description, flyerUrl, eventDate, startTime, endTime, timezone, venue,
          registrationUrl, eventType, status, featured, JSON.stringify(parsedProperties.properties)],
      );
      savedEvent = result.rows[0];
    }
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    console.error('Unable to save academy event', error);
    if (error.code === '23505') return { error: 'That event URL is already in use.' };
    if (error.code === '22007' || error.code === '22008') return { error: 'Enter a valid event date or time.' };
    return { error: 'The event could not be saved. Please check the fields and try again.' };
  } finally {
    client.release();
  }

  revalidatePath('/events');
  revalidatePath(`/events/${previousSlug}`);
  revalidatePath(`/events/${savedEvent.slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/events');
  revalidatePath(`/admin/events/${savedEvent.id}`);
  redirect(`/admin/events/${savedEvent.id}?saved=1`);
}
