import crypto from 'node:crypto';

export const STATUS_COOKIE = 'wemray_academy_status';
export const STATUS_COOKIE_MAX_AGE = 60 * 15;

function secret() {
  return process.env.BETTER_AUTH_SECRET || process.env.PAYSTACK_SECRET_KEY || '';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

/**
 * Short-lived signed cookie that lets the success page load the student's
 * enrolment without asking them to retype their email after checkout.
 */
export function createStatusCookieValue(reference, email) {
  if (!secret() || !reference || !email) return null;

  const payload = Buffer.from(
    JSON.stringify({
      reference,
      email,
      exp: Date.now() + STATUS_COOKIE_MAX_AGE * 1000,
    }),
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

export function readStatusCookieValue(value) {
  if (!secret() || !value) return null;

  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const received = Buffer.from(signature);
  const wanted = Buffer.from(expected);

  if (received.length !== wanted.length || !crypto.timingSafeEqual(received, wanted)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    if (!data?.reference || !data?.email || !data?.exp || data.exp < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
