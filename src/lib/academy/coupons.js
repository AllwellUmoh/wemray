import { query } from '../db';
import { normalizeCouponCode } from './enrolment';

/* ------------------------------------------------------------------ *
 * Coupon lookup. The browser may ask "is this code valid?", but the
 * discount is always recomputed server-side from the row we return here.
 * ------------------------------------------------------------------ */

/**
 * Find a usable coupon for a course.
 * Returns the row, or null when the code is unknown/expired/exhausted.
 */
export async function findUsableCoupon(code, courseSlug = null) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;

  const result = await query(
    `select id, code, label, percent_off, max_redemptions, redemptions, course_slug,
            starts_at, expires_at, is_active
     from academy_coupons
     where upper(code) = $1
       and is_active
       and (starts_at is null or starts_at <= now())
       and (expires_at is null or expires_at > now())
       and (max_redemptions is null or redemptions < max_redemptions)
       and (course_slug is null or course_slug = $2)`,
    [normalized, courseSlug],
  );

  const coupon = result.rows[0];
  if (!coupon) return null;

  // A code scoped to a course must never apply to a different one.
  if (courseSlug === null && coupon.course_slug !== null) return null;

  return coupon;
}

/** Record a redemption. Called only after a successful payment. */
export async function recordCouponRedemption(code) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return;

  await query(
    `update academy_coupons
     set redemptions = redemptions + 1
     where upper(code) = $1`,
    [normalized],
  );
}
