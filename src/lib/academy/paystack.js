import { createHmac, timingSafeEqual } from 'node:crypto';

/* ------------------------------------------------------------------ *
 * Minimal Paystack client — plain REST, no SDK.
 *
 * We use hosted checkout: the server calls /transaction/initialize and
 * hands the browser an `authorization_url` to redirect to. Card details
 * never touch our code, which keeps PCI scope at SAQ-A.
 *
 * The webhook is the source of truth for payment state. The verify
 * endpoint is a courtesy for the browser redirect, not the record.
 * ------------------------------------------------------------------ */

const BASE_URL = 'https://api.paystack.co';

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not configured');
  return key;
}

async function paystackFetch(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.status) {
    const message = payload?.message || `Paystack request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload.data;
}

/**
 * Start a transaction.
 *
 * @param {object} args
 * @param {string} args.email
 * @param {string} args.reference  our own unique reference
 * @param {number} args.amountKobo integer amount in kobo
 * @param {string} [args.callbackUrl]
 * @param {object} [args.metadata]
 * @param {object} [args.channels]
 */
export async function initializeTransaction({
  email,
  reference,
  amountKobo,
  callbackUrl,
  metadata = {},
  channels,
}) {
  return paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: {
      email,
      reference,
      // Paystack expects the amount in the smallest unit: kobo for NGN.
      amount: Math.round(Number(amountKobo) || 0),
      currency: 'NGN',
      callback_url: callbackUrl,
      metadata,
      ...(channels ? { channels } : {}),
    },
  });
}

export async function verifyTransaction(reference) {
  return paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/**
 * Verify the `x-paystack-signature` header.
 *
 * Paystack signs the raw JSON body with HMAC-SHA512 using the secret key.
 * The body must be the untouched string you received — parsing first and
 * re-serialising will change key order and break the comparison.
 */
export function verifyWebhookSignature(rawBody, signature) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !signature || typeof rawBody !== 'string') return false;

  const expected = createHmac('sha512', key).update(rawBody).digest('hex');

  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(String(signature), 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Where Paystack sends the browser back to after checkout. */
export function callbackUrl() {
  const explicit = process.env.PAYSTACK_CALLBACK_URL;
  if (explicit) return explicit;

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://localhost:3000';

  return `${base.replace(/\/+$/, '')}/api/academy/enrolments/verify`;
}
