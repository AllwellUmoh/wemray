'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { pool } from '@/lib/db';

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

function parseInteger(value, fallback = 0) {
  if (!/^\d+$/.test(value)) return fallback;
  const number = Number(value);
  return Number.isSafeInteger(number) && number <= 1000000 ? number : fallback;
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

export async function saveCourseAction(_previousState, formData) {
  await requireAdmin();

  const id = readText(formData, 'course_id', 20);
  const numericId = id ? Number(id) : null;
  const title = readText(formData, 'title', 200);
  const slug = readText(formData, 'slug', 100).toLowerCase();
  const number = readText(formData, 'number', 20);
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
  const sortOrder = parseInteger(readText(formData, 'sort_order', 12));
  const parsedModules = parseModules(readText(formData, 'modules_json', 200000));

  if (id && (!Number.isSafeInteger(numericId) || numericId <= 0)) {
    return { error: 'That course could not be found.' };
  }
  if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: 'Add a course title and a URL slug using lowercase letters, numbers and hyphens.' };
  }
  if (!trackKey || !formats.length || !delivery.length || !duration || !classes || !certificate) {
    return { error: 'Choose a track, at least one format and schedule, and complete the course details.' };
  }
  if (priceKobo === null) return { error: 'Enter a valid course fee in naira, such as 180000 or 180000.50.' };
  if (imageUrl === null) return { error: 'The image must be a public http(s) URL or a site path starting with /.' };
  if (parsedModules.error) return { error: parsedModules.error };

  const client = await pool.connect();
  let savedCourse;
  try {
    await client.query('begin');

    if (numericId) {
      const existing = await client.query(
        'select id, slug from academy_courses where id = $1 for update',
        [numericId],
      );
      if (!existing.rows[0]) {
        await client.query('rollback');
        return { error: 'That course could not be found.' };
      }
      if (existing.rows[0].slug !== slug) {
        await client.query('rollback');
        return { error: 'The course URL is fixed after creation so enrolment and search links stay valid.' };
      }

      const result = await client.query(
        `update academy_courses
         set number = $2, title = $3, track_key = $4, formats = $5, delivery = $6,
             duration = $7, classes = $8, certificate = $9, description = $10,
             outcome = $11, price_kobo = $12, icon = $13, image_url = $14,
             is_active = $15, sort_order = $16, updated_at = now()
         where id = $1
         returning id, slug`,
        [numericId, number, title, trackKey, formats, delivery, duration, classes, certificate,
          description, outcome, priceKobo, icon, imageUrl, isActive, sortOrder],
      );
      savedCourse = result.rows[0];
    } else {
      const result = await client.query(
        `insert into academy_courses
          (slug, number, title, track_key, formats, delivery, duration, classes, certificate,
           description, outcome, price_kobo, icon, image_url, is_active, sort_order)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         returning id, slug`,
        [slug, number, title, trackKey, formats, delivery, duration, classes, certificate,
          description, outcome, priceKobo, icon, imageUrl, isActive, sortOrder],
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
  revalidatePath(`/academy/courses/${savedCourse.slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${savedCourse.id}`);
  redirect(`/admin/courses/${savedCourse.id}?saved=1`);
}
