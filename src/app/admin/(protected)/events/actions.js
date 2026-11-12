'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { pool } from '@/lib/db';
import { slugify } from '@/lib/slugify';

const EVENT_STATUSES = new Set(['draft', 'published', 'cancelled', 'archived']);
const MAX_FLYER_BYTES = 3 * 1024 * 1024;
const ALLOWED_FLYER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

async function uniqueEventSlug(client, title, currentId) {
  const base = slugify(title, 'event');
  for (let suffix = 1; suffix <= 1000; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const result = await client.query(
      `select
         exists (select 1 from academy_events where slug = $1 and ($2::bigint is null or id <> $2))
         or exists (select 1 from academy_event_slug_history where slug = $1 and ($2::bigint is null or event_id <> $2))
         as used`,
      [candidate, currentId],
    );
    if (!result.rows[0]?.used) return candidate;
  }
  throw new Error('Unable to generate a unique event URL.');
}

function matchesImageSignature(data, type) {
  if (type === 'image/jpeg') return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (type === 'image/png') return data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === 'image/webp') return data.length >= 12 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

async function readFlyerUpload(value) {
  if (!value || typeof value !== 'object' || typeof value.arrayBuffer !== 'function' || Number(value.size) === 0) return { file: null };
  if (Number(value.size) > MAX_FLYER_BYTES) return { error: 'Choose an image up to 3 MB.' };

  const type = String(value.type || '').toLowerCase();
  if (!ALLOWED_FLYER_TYPES.has(type)) return { error: 'Upload a JPG, PNG, or WebP image.' };

  const data = Buffer.from(await value.arrayBuffer());
  if (!matchesImageSignature(data, type)) return { error: 'The selected file does not appear to be a valid image.' };
  return { file: { data, type } };
}

export async function saveEventAction(_previousState, formData) {
  await requireAdmin();

  const id = text(formData, 'event_id', 20);
  const numericId = id ? Number(id) : null;
  const title = text(formData, 'title', 200);
  const description = text(formData, 'description', 10000);
  const flyerUrl = publicImageUrl(text(formData, 'flyer_url', 2000));
  const flyerUpload = await readFlyerUpload(formData.get('flyer_file'));
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
  if (!title || !slugify(title)) {
    return { error: 'Add an event title with at least one letter or number.' };
  }
  if (!description || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || !/^\d{2}:\d{2}$/.test(startTime)) {
    return { error: 'Add the event description, date, and start time.' };
  }
  if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) return { error: 'Enter a valid event end time.' };
  if (endTime && endTime < startTime) return { error: 'The end time must be after the start time on the event date.' };
  if (!venue) return { error: 'Add the venue or enter “Online”.' };
  if (!EVENT_STATUSES.has(status)) return { error: 'Choose a valid event status.' };
  if (flyerUrl === null) return { error: 'The flyer must be a public http(s) URL or a site path starting with /.' };
  if (flyerUpload.error) return { error: flyerUpload.error };
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
    }
    const slug = await uniqueEventSlug(client, title, numericId);

    if (numericId) {
      if (previousSlug !== slug) {
        await client.query(
          `insert into academy_event_slug_history (slug, event_id)
           values ($1, $2) on conflict (slug) do nothing`,
          [previousSlug, numericId],
        );
        await client.query(
          'delete from academy_event_slug_history where slug = $1 and event_id = $2',
          [slug, numericId],
        );
      }
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
    if (flyerUpload.file) {
      const uploadedUrl = `/api/events/flyers/${savedEvent.id}?v=${Date.now()}`;
      await client.query(
        `insert into academy_event_flyers (event_id, content_type, file_data, updated_at)
         values ($1, $2, $3, now())
         on conflict (event_id) do update
         set content_type = excluded.content_type, file_data = excluded.file_data, updated_at = now()`,
        [savedEvent.id, flyerUpload.file.type, flyerUpload.file.data],
      );
      await client.query('update academy_events set flyer_url = $2 where id = $1', [savedEvent.id, uploadedUrl]);
      savedEvent.flyer_url = uploadedUrl;
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
  if (savedEvent.flyer_url.startsWith('/api/events/flyers/')) {
    revalidatePath(savedEvent.flyer_url.split('?')[0]);
  }
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/events');
  revalidatePath(`/admin/events/${savedEvent.id}`);
  redirect(`/admin/events/${savedEvent.id}?saved=1`);
}
