import { randomBytes } from 'node:crypto';
import { z } from 'zod';

/* ------------------------------------------------------------------ *
 * Enrolment input validation and references.
 * Mirrors the shape of src/lib/contact.js so the API routes read the
 * same way and the client can reuse the fieldErrors contract.
 * ------------------------------------------------------------------ */

export const ENROL_PLANS = ['full', 'installment'];

export const enrolSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Please tell us your first name.')
    .max(60, 'That name is a little too long.'),
  lastName: z
    .string()
    .trim()
    .max(60, 'That name is a little too long.')
    .optional()
    .default(''),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.')
    .max(254),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a phone number we can reach you on.')
    .max(30, 'That phone number looks too long.')
    .regex(/^[+()\-\s\d]+$/, 'Please use digits, spaces, + and - only.'),
  plan: z.enum(ENROL_PLANS).optional().default('full'),
  coupon: z.string().trim().max(40).optional().default(''),
  note: z.string().trim().max(500).optional().default(''),
  courseSlug: z
    .string()
    .trim()
    .min(1, 'Please choose a course.')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Unknown course.'),
  // honeypot
  website: z.string().optional().default(''),
});

export function parseEnrolment(input) {
  const result = enrolSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { success: false, fieldErrors };
}

/** "Adaeze Okafor" from the split fields. */
export function fullName({ firstName, lastName }) {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

/**
 * WMA-YYYYMMDD-XXXXXX
 *
 * Unique per attempt rather than per enrolment, so a retry after an
 * abandoned checkout does not collide with the earlier reference.
 */
export function createReference(prefix = 'WMA', now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  return `${prefix}-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

/** Instalment references share the enrolment reference with a suffix. */
export function paymentReference(enrolmentReference, installmentNo) {
  return `${enrolmentReference}-${installmentNo}`;
}

/** Normalise a coupon code for lookup: trimmed, upper case. */
export function normalizeCouponCode(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}
