import { NextResponse } from 'next/server';
import { clientIp, hashIp, isAllowedOrigin } from '../../../../../lib/contact';
import { getCourseBySlug } from '../../../../../lib/academy/courses';
import { findUsableCoupon } from '../../../../../lib/academy/coupons';
import { computeTotals, computeInstalments } from '../../../../../lib/academy/pricing';
import { callbackUrl, initializeTransaction, paystackConfigured } from '../../../../../lib/academy/paystack';
import {
  createEnrolment,
  createPayment,
  countRecentEnrolments,
} from '../../../../../lib/academy/enrolments';
import {
  createReference,
  fullName,
  parseEnrolment,
  paymentReference,
} from '../../../../../lib/academy/enrolment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_WINDOW_MINUTES = 15;
const RATE_LIMIT = 8;

function json(body, init) {
  return NextResponse.json(body, {
    ...init,
    headers: { 'Cache-Control': 'no-store', ...(init?.headers || {}) },
  });
}

/**
 * Create an enrolment and open a Paystack transaction.
 *
 * Security notes:
 *  - The course price and coupon discount are read from the database here.
 *    Any amount sent by the browser is ignored entirely.
 *  - The reference is generated server-side, so a caller cannot create a
 *    transaction against somebody else's enrolment.
 *  - The request body is capped and origin-checked before parsing.
 */
export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  if (!paystackConfigured()) {
    console.error('Academy initialize called without PAYSTACK_SECRET_KEY');
    return json(
      { error: 'Payments are temporarily unavailable. Please contact the academy team.' },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 16_000) {
    return json({ error: 'Request body is too large.' }, { status: 413 });
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

  // Honeypot — silently succeed so bots do not learn anything.
  if (input?.website) {
    return json({ ok: true, reference: createReference(), authorizationUrl: null });
  }

  const parsed = parseEnrolment(input);
  if (!parsed.success) {
    return json(
      { error: 'Please check the highlighted fields.', fieldErrors: parsed.fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const ipHash = hashIp(`academy:${clientIp(request)}`);

  try {
    const recent = await countRecentEnrolments(ipHash, RATE_WINDOW_MINUTES);
    if (recent >= RATE_LIMIT) {
      return json(
        { error: 'Too many attempts. Please try again in a few minutes or email hello@wemray.com.' },
        { status: 429, headers: { 'Retry-After': '900' } },
      );
    }

    const course = await getCourseBySlug(data.courseSlug);
    if (!course) {
      return json({ error: 'That course is no longer available.' }, { status: 404 });
    }

    if (course.priceKobo <= 0) {
      return json(
        { error: 'This course is not open for payment yet. Please contact the academy team.' },
        { status: 409 },
      );
    }

    // Coupon is re-validated here — never trusted from the client.
    let coupon = null;
    if (data.coupon) {
      coupon = await findUsableCoupon(data.coupon, course.slug);
      if (!coupon) {
        return json(
          {
            error: 'That coupon code is no longer valid for this course.',
            fieldErrors: { coupon: 'Invalid or expired code.' },
          },
          { status: 422 },
        );
      }
    }

    const totals = computeTotals({
      priceKobo: course.priceKobo,
      coupon,
      plan: data.plan,
    });

    const reference = createReference('WMA');
    const email = data.email;
    const name = fullName(data);

    const enrolment = await createEnrolment({
      reference,
      course,
      fullName: name,
      email,
      phone: data.phone,
      plan: totals.plan,
      basePriceKobo: totals.baseKobo,
      discountKobo: totals.discountKobo,
      couponCode: coupon?.code || null,
      totalKobo: totals.totalKobo,
      ipHash,
      userAgent: request.headers.get('user-agent') || '',
      note: data.note,
    });

    // First payment: either the full amount, or instalment 1 of 2.
    const payableNow = totals.plan === 'installment' ? computeInstalments(totals.totalKobo)[0] : totals.totalKobo;
    const firstReference = paymentReference(reference, 1);

    if (payableNow <= 0) {
      return json(
        { error: 'This course has no payable amount. Please contact the academy team.' },
        { status: 409 },
      );
    }

    await createPayment({
      enrolmentId: enrolment.id,
      reference: firstReference,
      installmentNo: 1,
      amountKobo: payableNow,
    });

    const transaction = await initializeTransaction({
      email,
      reference: firstReference,
      amountKobo: payableNow,
      callbackUrl: callbackUrl(),
      metadata: {
        purpose: 'ray-academy-enrolment',
        enrolment_reference: reference,
        enrolment_id: String(enrolment.id),
        course_slug: course.slug,
        course_title: course.title,
        plan: totals.plan,
        installment_no: 1,
        base_price_kobo: totals.baseKobo,
        discount_kobo: totals.discountKobo,
        coupon_code: coupon?.code || '',
        total_kobo: totals.totalKobo,
        student_name: name,
        student_phone: data.phone,
        custom_fields: [
          { display_name: 'Course', variable_name: 'course', value: course.title },
          {
            display_name: 'Plan',
            variable_name: 'plan',
            value: totals.plan === 'installment' ? '2 instalments' : 'Full payment',
          },
          { display_name: 'Reference', variable_name: 'reference', value: reference },
        ],
      },
    });

    return json({
      ok: true,
      reference,
      paystackReference: transaction?.reference || firstReference,
      authorizationUrl: transaction?.authorization_url || null,
      accessCode: transaction?.access_code || null,
      plan: totals.plan,
      payableNowKobo: payableNow,
      balanceKobo: totals.totalKobo - payableNow,
      checkoutUrl: `/academy/enrol/success?reference=${encodeURIComponent(reference)}`,
    });
  } catch (error) {
    console.error('Academy enrolment initialize failed', error);
    return json(
      {
        error:
          'We could not start your payment. No money has been taken — please try again or email hello@wemray.com.',
      },
      { status: 500 },
    );
  }
}
