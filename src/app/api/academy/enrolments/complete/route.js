import { NextResponse } from 'next/server';
import { isAllowedOrigin } from '../../../../../lib/contact';
import { getCourseBySlug } from '../../../../../lib/academy/courses';
import { callbackUrl, initializeTransaction, paystackConfigured } from '../../../../../lib/academy/paystack';
import {
  createPayment,
  getEnrolmentByReference,
  getNextPayableInstalment,
} from '../../../../../lib/academy/enrolments';
import { formatNaira } from '../../../../../lib/academy/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body, init) {
  return NextResponse.json(body, {
    ...init,
    headers: { 'Cache-Control': 'no-store', ...(init?.headers || {}) },
  });
}

/**
 * Start the second instalment payment for an existing enrolment.
 *
 * The student proves ownership with the enrolment reference plus the email
 * on that enrolment. The amount is read from the enrolment row — never
 * from the request.
 */
export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  if (!paystackConfigured()) {
    return json({ error: 'Payments are temporarily unavailable.' }, { status: 503 });
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

  const reference = typeof input?.reference === 'string' ? input.reference.trim() : '';
  const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';

  if (!reference || !email) {
    return json({ error: 'We need your reference and email to find the enrolment.' }, { status: 422 });
  }

  try {
    const enrolment = await getEnrolmentByReference(reference);

    if (!enrolment || enrolment.email.toLowerCase() !== email) {
      return json({ error: 'We could not find that enrolment.' }, { status: 404 });
    }

    if (enrolment.status === 'refunded') {
      return json({ error: 'This enrolment has been refunded. Please contact the academy team.' }, { status: 409 });
    }

    const next = await getNextPayableInstalment(enrolment);

    if (!next) {
      return json(
        { ok: true, nothingDue: true, message: 'Nothing outstanding — this enrolment is settled.' },
        { status: 200 },
      );
    }

    if (next.amountKobo <= 0) {
      return json({ ok: true, nothingDue: true, message: 'Nothing outstanding.' }, { status: 200 });
    }

    const course = await getCourseBySlug(enrolment.course_slug);

    await createPayment({
      enrolmentId: enrolment.id,
      reference: next.reference,
      installmentNo: next.installmentNo,
      amountKobo: next.amountKobo,
    });

    const transaction = await initializeTransaction({
      email: enrolment.email,
      reference: next.reference,
      amountKobo: next.amountKobo,
      callbackUrl: callbackUrl(),
      metadata: {
        purpose: 'ray-academy-balance',
        enrolment_reference: enrolment.reference,
        enrolment_id: String(enrolment.id),
        course_slug: enrolment.course_slug,
        course_title: enrolment.course_title,
        plan: 'installment',
        installment_no: next.installmentNo,
        student_name: enrolment.full_name,
        student_phone: enrolment.phone,
        custom_fields: [
          { display_name: 'Course', variable_name: 'course', value: enrolment.course_title },
          {
            display_name: 'Instalment',
            variable_name: 'installment',
            value: `${next.installmentNo} of 2`,
          },
          { display_name: 'Reference', variable_name: 'reference', value: enrolment.reference },
        ],
      },
    });

    return json({
      ok: true,
      reference: enrolment.reference,
      authorizationUrl: transaction?.authorization_url || null,
      amountKobo: next.amountKobo,
      amountLabel: formatNaira(next.amountKobo),
      installmentNo: next.installmentNo,
      course: course?.title || enrolment.course_title,
    });
  } catch (error) {
    console.error('Academy balance initialize failed', error);
    return json({ error: 'We could not start the payment. Please try again.' }, { status: 500 });
  }
}
