/* ------------------------------------------------------------------ *
 * Ray Academy pricing.
 *
 * Every figure the browser sees is recomputed on the server from the
 * database. Nothing the client submits about money is trusted.
 * Amounts are integers in kobo (1 NGN = 100 kobo), which is what
 * Paystack expects.
 * ------------------------------------------------------------------ */

export const CURRENCY = 'NGN';
export const COUPON_PERCENT = 25;
export const INSTALMENT_GAP_DAYS = Number(process.env.ACADEMY_INSTALMENT_DAYS || 30) || 30;

/** Round to the nearest whole naira so instalments never show kobo dust. */
function roundToNaira(kobo) {
  return Math.round(kobo / 100) * 100;
}

/**
 * Split a total into two instalments (50/50), rounded up to the nearest
 * ₦100 on the first payment so the two halves always sum to the total.
 */
export function computeInstalments(totalKobo) {
  const total = Math.max(0, Math.round(Number(totalKobo) || 0));
  const half = roundToNaira(Math.ceil(total / 2 / 100) * 100);
  const first = Math.min(half, total);
  const second = total - first;
  return [first, second];
}

/**
 * Work out the money for an enrolment.
 *
 * @param {object} args
 * @param {number} args.priceKobo   base course price in kobo
 * @param {object|null} args.coupon a validated coupon row, or null
 * @param {'full'|'installment'} [args.plan]
 */
export function computeTotals({ priceKobo, coupon = null, plan = 'full' }) {
  const base = Math.max(0, Math.round(Number(priceKobo) || 0));

  const percentOff = coupon ? Math.min(100, Math.max(0, Number(coupon.percent_off) || 0)) : 0;
  const discount = coupon ? roundToNaira(Math.floor((base * percentOff) / 100)) : 0;
  const total = Math.max(0, base - discount);

  const instalments = plan === 'installment' ? computeInstalments(total) : [total];

  return {
    baseKobo: base,
    discountKobo: discount,
    totalKobo: total,
    percentOff,
    currency: CURRENCY,
    plan,
    instalments,
  };
}

/** ₦250,000 — used in emails and the admin area. */
export function formatNaira(kobo) {
  const amount = Math.round((Number(kobo) || 0) / 100);
  return `₦${amount.toLocaleString('en-NG')}`;
}

/** 250000.00 — the format Paystack expects on the wire. */
export function toPaystackAmount(kobo) {
  return (Math.round(Number(kobo) || 0) / 100).toFixed(2);
}

/** ISO date N days from now, for the second instalment due date. */
export function instalmentDueDate(days = INSTALMENT_GAP_DAYS, from = new Date()) {
  const date = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

export function formatDueDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
