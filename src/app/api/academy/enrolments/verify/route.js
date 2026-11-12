import { NextResponse } from 'next/server';
import { verifyTransaction } from '../../../../../lib/academy/paystack';
import {
  getEnrolmentByReference,
  getPaymentByReference,
  markPaymentFailed,
  settlePayment,
} from '../../../../../lib/academy/enrolments';
import { afterSettlement } from '../../../../../lib/academy/settlement';
import {
  STATUS_COOKIE,
  STATUS_COOKIE_MAX_AGE,
  createStatusCookieValue,
} from '../../../../../lib/academy/status-cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function siteRoot() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
}

function successRedirect(reference, email, suffix = '') {
  const response = NextResponse.redirect(
    `${siteRoot()}/academy/enrol/success?reference=${encodeURIComponent(reference)}${suffix}`,
    303,
  );

  const value = createStatusCookieValue(reference, email);
  if (value) {
    response.cookies.set(STATUS_COOKIE, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: STATUS_COOKIE_MAX_AGE,
    });
  }

  return response;
}

/**
 * Paystack redirects the browser here with ?reference=...
 *
 * This is a courtesy path: it confirms the outcome for the student and
 * flips the record if the webhook has not arrived yet. The webhook stays
 * the authoritative source, and settlePayment() is idempotent so the two
 * can run in either order.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference') || url.searchParams.get('trxref') || '';

  if (!reference) {
    return NextResponse.redirect(`${siteRoot()}/academy/enrol/success?status=missing`, 303);
  }

  // Our reference is the Paystack reference with the instalment suffix.
  const enrolmentReference = reference.replace(/-\d+$/, '');

  try {
    const enrolment = await getEnrolmentByReference(enrolmentReference);
    if (!enrolment) {
      return NextResponse.redirect(`${siteRoot()}/academy/enrol/success?status=unknown`, 303);
    }

    const transaction = await verifyTransaction(reference);

    if (transaction?.status !== 'success') {
      await markPaymentFailed({
        paymentReferenceValue: reference,
        status: 'failed',
        payload: transaction,
      });
      return successRedirect(enrolmentReference, enrolment.email, '&status=failed');
    }

    // Confirm Paystack charged what we asked for. A mismatch means tampering.
    const expected = await getPaymentByReference(reference);
    const charged = Math.round(Number(transaction.amount) || 0);

    if (expected && charged < Number(expected.amount_kobo)) {
      console.error('Academy payment amount mismatch', {
        reference,
        expected: expected.amount_kobo,
        charged,
      });
      await markPaymentFailed({ paymentReferenceValue: reference, status: 'failed', payload: transaction });
      return successRedirect(enrolmentReference, enrolment.email, '&status=mismatch');
    }

    const settled = await settlePayment({ paymentReferenceValue: reference, payload: transaction });

    if (settled?.enrolment) {
      await afterSettlement({ enrolment: settled.enrolment, payment: settled.payment });
    }

    return successRedirect(enrolmentReference, enrolment.email);
  } catch (error) {
    console.error('Academy payment verify failed', error);
    return NextResponse.redirect(
      `${siteRoot()}/academy/enrol/success?reference=${encodeURIComponent(enrolmentReference)}&status=error`,
      303,
    );
  }
}
