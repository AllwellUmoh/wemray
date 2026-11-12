'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { pool } from '@/lib/db';
import { slugify } from '@/lib/slugify';

const ALLOWED_FORMATS = new Set(['Hybrid', 'Online', 'Onsite']);
const ALLOWED_DELIVERY = new Set(['Weekday', 'Weekend']);

function readText(formData, name, maxLength = 5000) {
  return String(formData.get(name) || '').trim().slice(0, maxLength);
}

function parsePriceKobo(value) {
  const match = /^(\d{1,10})(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  return (BigInt(match[1]) * 100n + BigInt((match[2] || '').padEnd(2, '0') || '0')).toString();
}

function validateImageUrl(value) {
  if (!value) return '';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseModules(value) {
  let rows;
  try {
    rows = JSON.parse(value || '[]');
  } catch {
    return { error: 'The module list could not be read.' };
  }

  if (!Array.isArray(rows) || rows.length > 60) {
    return { error: 'A course can have up to 60 modules.' };
  }

  const modules = rows.map((row, index) => {
    const number = String(row?.number || String(index + 1).padStart(2, '0')).trim().slice(0, 20);
    const title = String(row?.title || '').trim().slice(0, 200);
    const summary = String(row?.summary || '').trim().slice(0, 2000);
    const topicsText = String(row?.topicsText || '');
    const topics = topicsText
      .split(/\r?\n/)
      .map((topic) => topic.trim().slice(0, 250))
      .filter(Boolean)
      .slice(0, 40);

    return { number, title, summary, topics, sortOrder: index + 1 };
  });

  if (modules.some((module) => !module.title)) {
    return { error: 'Add a title to each module or remove the empty module.' };
  }

  const numbers = modules.map((module) => module.number.toLowerCase());
  if (new Set(numbers).size !== numbers.length) {
    return { error: 'Each module needs a unique number.' };
  }

  return { modules };
}

async function uniqueCourseSlug(client, title, currentId) {
  const base = slugify(title, 'course');
  for (let suffix = 1; suffix <= 1000; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const result = await client.query(
      `select
         exists (select 1 from academy_courses where slug = $1 and ($2::bigint is null or id <> $2))
         or exists (select 1 from academy_course_slug_history where slug = $1 and ($2::bigint is null or course_id <> $2))
         as used`,
      [candidate, currentId],
    );
    if (!result.rows[0]?.used) return candidate;
  }
  throw new Error('Unable to generate a unique course URL.');
}

export async function saveCourseAction(_previousState, formData) {
  await requireAdmin();

  const id = readText(formData, 'course_id', 20);
  const numericId = id ? Number(id) : null;
  const title = readText(formData, 'title', 200);
  const trackKey = readText(formData, 'track_key', 80);
  const formats = formData.getAll('formats').map(String).filter((value) => ALLOWED_FORMATS.has(value));
  const delivery = formData.getAll('delivery').map(String).filter((value) => ALLOWED_DELIVERY.has(value));
  const duration = readText(formData, 'duration', 120);
  const classes = readText(formData, 'classes', 160);
  const certificate = readText(formData, 'certificate', 200);
  const description = readText(formData, 'description', 5000);
  const outcome = readText(formData, 'outcome', 5000);
  const priceKobo = parsePriceKobo(readText(formData, 'price_naira', 20));
  const icon = readText(formData, 'icon', 60) || 'monitor';
  const imageUrl = validateImageUrl(readText(formData, 'image_url', 2000));
  const isActive = formData.get('is_active') === 'on';
  const parsedModules = parseModules(readText(formData, 'modules_json', 200000));

  if (id && (!Number.isSafeInteger(numericId) || numericId <= 0)) {
    return { error: 'That course could not be found.' };
  }
  if (!title || !slugify(title)) {
    return { error: 'Add a course title with at least one letter or number.' };
  }
  if (!trackKey || !formats.length || !delivery.length || !duration || !classes || !certificate) {
    return { error: 'Choose a track, at least one format and schedule, and complete the course details.' };
  }
  if (priceKobo === null) return { error: 'Enter a valid course fee in naira, such as 180000 or 180000.50.' };
  if (imageUrl === null) return { error: 'The image must be a public http(s) URL or a site path starting with /.' };
  if (parsedModules.error) return { error: parsedModules.error };

  const client = await pool.connect();
  let savedCourse;
  let previousSlug = '';
  let number = '';
  try {
    await client.query('begin');
    if (numericId) {
      const existing = await client.query(
        'select id, slug, number from academy_courses where id = $1 for update',
        [numericId],
      );
      if (!existing.rows[0]) {
        await client.query('rollback');
        return { error: 'That course could not be found.' };
      }
      previousSlug = existing.rows[0].slug;
      number = existing.rows[0].number;
    } else {
      await client.query('select pg_advisory_xact_lock(7411290137::bigint)');
      const nextNumber = await client.query(
        `select coalesce(max(number::bigint), 0) + 1 as value
         from academy_courses
         where number ~ '^[0-9]+$'`,
      );
      number = String(nextNumber.rows[0].value).padStart(2, '0');
    }
    const slug = await uniqueCourseSlug(client, title, numericId);

    if (numericId) {
      if (previousSlug !== slug) {
        await client.query(
          `insert into academy_course_slug_history (slug, course_id)
           values ($1, $2) on conflict (slug) do nothing`,
          [previousSlug, numericId],
        );
        await client.query(
          'delete from academy_course_slug_history where slug = $1 and course_id = $2',
          [slug, numericId],
        );
        await client.query(
          'update academy_coupons set course_slug = $2 where course_slug = $1',
          [previousSlug, slug],
        );
      }

      const result = await client.query(
        `update academy_courses
         set slug = $2, number = $3, title = $4, track_key = $5, formats = $6, delivery = $7,
             duration = $8, classes = $9, certificate = $10, description = $11,
             outcome = $12, price_kobo = $13, icon = $14, image_url = $15,
             is_active = $16, updated_at = now()
         where id = $1
         returning id, slug`,
        [numericId, slug, number, title, trackKey, formats, delivery, duration, classes, certificate,
          description, outcome, priceKobo, icon, imageUrl, isActive],
      );
      savedCourse = result.rows[0];
    } else {
      const result = await client.query(
        `insert into academy_courses
          (slug, number, title, track_key, formats, delivery, duration, classes, certificate,
           description, outcome, price_kobo, icon, image_url, is_active)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         returning id, slug`,
        [slug, number, title, trackKey, formats, delivery, duration, classes, certificate,
          description, outcome, priceKobo, icon, imageUrl, isActive],
      );
      savedCourse = result.rows[0];
    }

    await client.query('delete from academy_course_modules where course_id = $1', [savedCourse.id]);
    for (const courseModule of parsedModules.modules) {
      await client.query(
        `insert into academy_course_modules (course_id, number, title, summary, topics, sort_order)
         values ($1, $2, $3, $4, $5::jsonb, $6)`,
        [savedCourse.id, courseModule.number, courseModule.title, courseModule.summary, JSON.stringify(courseModule.topics), courseModule.sortOrder],
      );
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    console.error('Unable to save academy course', error);
    if (error.code === '23505') return { error: 'That course URL or module number is already in use.' };
    if (error.code === '23503') return { error: 'Choose a valid academy track.' };
    return { error: 'The course could not be saved. Please check the fields and try again.' };
  } finally {
    client.release();
  }

  revalidatePath('/academy');
  if (previousSlug && previousSlug !== savedCourse.slug) revalidatePath(`/academy/courses/${previousSlug}`);
  revalidatePath(`/academy/courses/${savedCourse.slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${savedCourse.id}`);
  redirect(`/admin/courses/${savedCourse.id}?saved=1`);
}
