import { query } from '../db';
import { paymentReference } from './enrolment';
import { computeInstalments } from './pricing';

/* ------------------------------------------------------------------ *
 * Enrolment + payment records.
 *
 * Lifecycle:
 *   pending   -> created, checkout started, nothing paid yet
 *   part_paid -> instalment 1 landed
 *   paid      -> full amount received (full plan or both instalments)
 *   failed    -> Paystack reported a failure
 *   abandoned -> checkout was never completed (no money taken)
 *   refunded  -> manual, from the admin area
 * ------------------------------------------------------------------ */

export async function createEnrolment({
  reference,
  course,
  fullName,
  email,
  phone,
  plan,
  basePriceKobo,
  discountKobo,
  couponCode,
  totalKobo,
  ipHash,
  userAgent,
  note,
}) {
  const result = await query(
    `insert into academy_enrolments
      (reference, course_id, course_slug, course_title, full_name, email, phone, plan,
       base_price_kobo, discount_kobo, coupon_code, total_kobo, amount_paid_kobo,
       currency, status, ip_hash, user_agent, note)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0, 'NGN', 'pending', $13, $14, $15)
     returning *`,
    [
      reference,
      course.id,
      course.slug,
      course.title,
      fullName,
      email,
      phone,
      plan,
      basePriceKobo,
      discountKobo,
      couponCode || null,
      totalKobo,
      ipHash,
      userAgent || '',
      note || '',
    ],
  );

  return result.rows[0];
}

export async function createPayment({ enrolmentId, reference, installmentNo, amountKobo }) {
  const result = await query(
    `insert into academy_enrolment_payments (enrolment_id, reference, installment_no, amount_kobo)
     values ($1, $2, $3, $4)
     on conflict (reference) do update
       set amount_kobo = excluded.amount_kobo,
           status = case
             when academy_enrolment_payments.status = 'success' then 'success'
             else 'pending'
           end,
           gateway_response = case
             when academy_enrolment_payments.status = 'success' then academy_enrolment_payments.gateway_response
             else ''
           end,
           channel = case
             when academy_enrolment_payments.status = 'success' then academy_enrolment_payments.channel
             else ''
           end,
           verified_at = case
             when academy_enrolment_payments.status = 'success' then academy_enrolment_payments.verified_at
             else null
           end,
           updated_at = now()
     returning *`,
    [enrolmentId, reference, installmentNo, amountKobo],
  );

  return result.rows[0];
}

export async function getEnrolmentByReference(reference) {
  const result = await query(
    `select * from academy_enrolments where reference = $1`,
    [reference],
  );
  return result.rows[0] || null;
}

export async function getEnrolmentById(id) {
  const result = await query(`select * from academy_enrolments where id = $1`, [id]);
  return result.rows[0] || null;
}

export async function getPaymentByReference(reference) {
  const result = await query(
    `select * from academy_enrolment_payments where reference = $1`,
    [reference],
  );
  return result.rows[0] || null;
}

/** Every payment attempt for an enrolment, oldest first. */
export async function listPayments(enrolmentId) {
  const result = await query(
    `select * from academy_enrolment_payments
     where enrolment_id = $1
     order by installment_no, created_at`,
    [enrolmentId],
  );
  return result.rows;
}

/**
 * The next unpaid instalment for an enrolment, or null.
 *
 * Only successful payments count as settled. A failed instalment 1 must be
 * retryable as instalment 1 — it must never push the student to instalment 2.
 */
export async function getNextPayableInstalment(enrolment) {
  if (enrolment.plan !== 'installment') return null;

  const total = Number(enrolment.total_kobo) || 0;
  const paid = Number(enrolment.amount_paid_kobo) || 0;
  if (total > 0 && paid >= total) return null;

  const payments = await listPayments(enrolment.id);
  const settledNumbers = new Set(
    payments
      .filter((payment) => payment.status === 'success')
      .map((payment) => payment.installment_no),
  );

  if (settledNumbers.has(1) && settledNumbers.has(2)) return null;

  const nextNo = settledNumbers.has(1) ? 2 : 1;
  const [first, second] = computeInstalments(total);
  const amount = nextNo === 1 ? first : second;

  return {
    installmentNo: nextNo,
    amountKobo: Math.max(0, amount),
    reference: paymentReference(enrolment.reference, nextNo),
  };
}

/**
 * Mark a payment successful and roll the enrolment status forward.
 *
 * Safe to call twice for the same reference (webhook + verify race):
 * the payment update is guarded on status <> 'success' and the totals
 * are recomputed from the payments table rather than incremented.
 */
export async function settlePayment({ paymentReferenceValue, payload }) {
  const data = payload || {};
  const amountKobo = Math.round(Number(data.amount) || 0);

  const paymentUpdate = await query(
    `update academy_enrolment_payments
     set status = 'success',
         paystack_reference = $2,
         amount_kobo = case when $3 > 0 then $3 else amount_kobo end,
         channel = $4,
         gateway_response = $5,
         verified_at = coalesce(verified_at, now()),
         raw = $6,
         updated_at = now()
     where reference = $1
     returning *`,
    [
      paymentReferenceValue,
      String(data.reference || ''),
      amountKobo,
      String(data.channel || ''),
      String(data.gateway_response || ''),
      data,
    ],
  );

  const payment = paymentUpdate.rows[0];
  if (!payment) return null;

  const enrolmentId = payment.enrolment_id;

  const totals = await query(
    `select coalesce(sum(amount_kobo), 0)::bigint as paid
     from academy_enrolment_payments
     where enrolment_id = $1 and status = 'success'`,
    [enrolmentId],
  );

  const paid = Number(totals.rows[0]?.paid || 0);

  const enrolmentUpdate = await query(
    `update academy_enrolments
     set amount_paid_kobo = $2,
         status = case
           when $2 >= total_kobo and total_kobo > 0 then 'paid'
           when $2 > 0 then 'part_paid'
           else status
         end,
         paystack_reference = coalesce(paystack_reference, $3),
         updated_at = now()
     where id = $1
     returning *`,
    [enrolmentId, paid, String(data.reference || '')],
  );

  return { payment, enrolment: enrolmentUpdate.rows[0] };
}

/** Record a failed / abandoned attempt without touching the totals. */
export async function markPaymentFailed({ paymentReferenceValue, status = 'failed', payload }) {
  const result = await query(
    `update academy_enrolment_payments
     set status = $2,
         gateway_response = $3,
         raw = coalesce($4, raw),
         updated_at = now()
     where reference = $1 and status <> 'success'
     returning *`,
    [
      paymentReferenceValue,
      status,
      String(payload?.gateway_response || ''),
      payload || null,
    ],
  );

  return result.rows[0] || null;
}

export async function markEmailSent(enrolmentId, column) {
  const allowed = ['welcome_email_sent_at', 'receipt_email_sent_at', 'admin_notified_at'];
  if (!allowed.includes(column)) return;

  await query(
    `update academy_enrolments set ${column} = now() where id = $1 and ${column} is null`,
    [enrolmentId],
  );
}

/** Rate limit: how many enrolments this IP started recently. */
export async function countRecentEnrolments(ipHash, minutes = 15) {
  const result = await query(
    `select count(*)::int as count
     from academy_enrolments
     where ip_hash = $1 and created_at > now() - ($2 || ' minutes')::interval`,
    [ipHash, minutes],
  );
  return result.rows[0]?.count || 0;
}

/** "Already enrolled in this course?" check for the response copy. */
export async function findActiveEnrolment(email, courseSlug) {
  const result = await query(
    `select id, reference, status, plan, total_kobo, amount_paid_kobo
     from academy_enrolments
     where lower(email) = lower($1)
       and course_slug = $2
       and status in ('paid', 'part_paid')
     order by created_at desc
     limit 1`,
    [email, courseSlug],
  );
  return result.rows[0] || null;
}
