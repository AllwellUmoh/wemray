'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { pool } from '@/lib/db';
import { slugify } from '@/lib/slugify';

function readText(formData, name, maxLength = 3000) {
  return String(formData.get(name) || '').trim().slice(0, maxLength);
}

function sortOrder(formData) {
  const raw = readText(formData, 'sort_order', 12);
  if (!/^\d+$/.test(raw)) return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value <= 1000000 ? value : 0;
}

async function uniqueTrackKey(client, label) {
  const base = slugify(label, 'track');
  for (let suffix = 1; suffix <= 1000; suffix += 1) {
    const key = suffix === 1 ? base : `${base}-${suffix}`;
    const result = await client.query('select exists (select 1 from academy_tracks where key = $1) as used', [key]);
    if (!result.rows[0]?.used) return key;
  }
  throw new Error('Unable to generate a unique track key.');
}

async function saveTrack(formData, { inline = false } = {}) {
  await requireAdmin();

  const key = readText(formData, 'track_key', 80);
  const label = readText(formData, 'label', 160);
  const description = readText(formData, 'description', 3000);
  const order = sortOrder(formData);
  if (!label || !slugify(label)) return { error: 'Add a track name with at least one letter or number.' };

  const client = await pool.connect();
  let track;
  try {
    if (key) {
      const result = await client.query(
        `update academy_tracks
         set label = $2, description = $3, sort_order = $4
         where key = $1
         returning key, label, description, sort_order`,
        [key, label, description, order],
      );
      track = result.rows[0];
      if (!track) return { error: 'That track could not be found.' };
    } else {
      const newKey = await uniqueTrackKey(client, label);
      const result = await client.query(
        `insert into academy_tracks (key, label, description, sort_order)
         values ($1, $2, $3, $4)
         returning key, label, description, sort_order`,
        [newKey, label, description, order],
      );
      track = result.rows[0];
    }
  } catch (error) {
    console.error('Unable to save academy track', error);
    if (error.code === '23505') return { error: 'A track with that generated URL key already exists.' };
    return { error: 'The track could not be saved. Please try again.' };
  } finally {
    client.release();
  }

  revalidatePath('/academy');
  revalidatePath('/admin/tracks');
  revalidatePath('/admin/courses');
  revalidatePath('/admin/courses/new');
  if (key) revalidatePath(`/admin/tracks/${key}`);

  if (inline) return { track };
  redirect(`/admin/tracks/${track.key}?saved=1`);
}

export async function createTrackInlineAction(formData) {
  return saveTrack(formData, { inline: true });
}

export async function saveTrackAction(_previousState, formData) {
  return saveTrack(formData);
}
