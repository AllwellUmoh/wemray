import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) {
    return new Response('Not found', { status: 404 });
  }

  const result = await query(
    `select content_type, file_data
     from academy_event_flyers where event_id = $1`,
    [numericId],
  );
  const flyer = result.rows[0];
  if (!flyer) return new Response('Not found', { status: 404 });

  return new Response(flyer.file_data, {
    headers: {
      'Content-Type': flyer.content_type,
      'Content-Length': String(flyer.file_data.length),
      'Content-Disposition': 'inline; filename="event-flyer"',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
