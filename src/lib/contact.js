import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { CONTACT_INTENTS, SERVICE_OPTIONS } from './contact-options';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  organisation: z.string().trim().max(160).optional().default(''),
  budget: z.string().trim().max(80).optional().default(''),
  service: z.enum(SERVICE_OPTIONS),
  details: z.string().trim().max(5000).optional().default(''),
  intent: z.enum(CONTACT_INTENTS).optional().default('conversation'),
  website: z.string().optional().default(''),
});

export function parseContact(input) {
  const result = contactSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }

  return { success: false, fieldErrors };
}

export function createReference(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  return `WM-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export function hashIp(ip) {
  const salt = process.env.CONTACT_IP_SALT || 'wemray-development-salt';
  return createHash('sha256').update(`${salt}:${ip || 'unknown'}`).digest('hex');
}

export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'unknown';
}

export function isAllowedOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'https://wemray.com',
    'https://www.wemray.com',
  ]
    .filter(Boolean)
    .map((value) => value.replace(/\/+$/, ''));

  return origin === requestOrigin || allowed.includes(origin);
}
