import { NextResponse } from 'next/server';
import { isAllowedOrigin } from '../../../../lib/contact';
import { getCourseBySlug } from '../../../../lib/academy/courses';
import { findUsableCoupon } from '../../../../lib/academy/coupons';
import { computeTotals } from '../../../../lib/academy/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body, init) {
  return NextResponse.json(body, {
    ...init,
    headers: { 'Cache-Control': 'no-store', ...(init?.headers || {}) },
  });
}

/**
 * Validate a coupon code for a course.
 *
 * Returns the recomputed totals so the client can render the discounted
 * summary, but the client's rendering is cosmetic — /initialize recomputes
 * everything again before a transaction is created.
 */
export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return json({ error: 'Unsupported content type.' }, { status: 415 });
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const slug = typeof input?.slug === 'string' ? input.slug.trim() : '';
  const code = typeof input?.code === 'string' ? input.code.trim() : '';

  if (!code) {
    return json({ valid: false, error: 'Enter a coupon code.' }, { status: 400 });
  }

  const course = await getCourseBySlug(slug);
  if (!course) {
    return json({ valid: false, error: 'Unknown course.' }, { status: 404 });
  }

  // Validate before touching the database so obvious junk is cheap to reject.
  if (!/^[A-Za-z0-9]{3,40}$/.test(code)) {
    return json({ valid: false, error: 'That code does not look right.' });
  }

  const coupon = await findUsableCoupon(code, course.slug);

  if (!coupon) {
    return json({
      valid: false,
      error: 'That code is not valid for this course.',
      totals: computeTotals({ priceKobo: course.priceKobo }),
    });
  }

  const totals = computeTotals({ priceKobo: course.priceKobo, coupon });

  return json({
    valid: true,
    code: coupon.code,
    label: coupon.label,
    percentOff: totals.percentOff,
    discountKobo: totals.discountKobo,
    totalKobo: totals.totalKobo,
    totals,
  });
}
