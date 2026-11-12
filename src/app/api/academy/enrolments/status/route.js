import { NextResponse } from 'next/server';
import { getEnrolmentByReference, listPayments } from '../../../../../lib/academy/enrolments';
import { formatNaira } from '../../../../../lib/academy/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body, init) {
  return NextResponse.json(body, {
    ...init,
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}

/**
 * Read-only status for the success page.
 *
 * Requires the reference AND the email, so a guessed reference cannot
 * expose someone else's name, phone or payment history.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference') || '';
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();

  if (!reference) {
    return json({ error: 'Missing reference.' }, { status: 400 });
  }

  const enrolment = await getEnrolmentByReference(reference);

  if (!enrolment) {
    return json({ found: false }, { status: 404 });
  }

  // Without a matching email we reveal nothing beyond "this reference exists".
  if (!email || enrolment.email.toLowerCase() !== email) {
    return json({ found: true, verified: false });
  }

  const payments = await listPayments(enrolment.id);
  const balance = Math.max(0, Number(enrolment.total_kobo) - Number(enrolment.amount_paid_kobo));

  return json({
    found: true,
    verified: true,
    reference: enrolment.reference,
    status: enrolment.status,
    plan: enrolment.plan,
    course: { slug: enrolment.course_slug, title: enrolment.course_title },
    student: { name: enrolment.full_name, email: enrolment.email },
    totalKobo: Number(enrolment.total_kobo),
    totalLabel: formatNaira(enrolment.total_kobo),
    paidKobo: Number(enrolment.amount_paid_kobo),
    paidLabel: formatNaira(enrolment.amount_paid_kobo),
    balanceKobo: balance,
    balanceLabel: formatNaira(balance),
    discountLabel: Number(enrolment.discount_kobo) ? formatNaira(enrolment.discount_kobo) : null,
    couponCode: enrolment.coupon_code || null,
    payments: payments.map((payment) => ({
      installmentNo: payment.installment_no,
      amountLabel: formatNaira(payment.amount_kobo),
      status: payment.status,
      channel: payment.channel,
      verifiedAt: payment.verified_at,
    })),
  });
}
