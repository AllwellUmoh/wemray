import { verifyWebhookSignature } from '../../../../../lib/academy/paystack';
import {
  getEnrolmentByReference,
  getPaymentByReference,
  markPaymentFailed,
  settlePayment,
} from '../../../../../lib/academy/enrolments';
import { afterSettlement } from '../../../../../lib/academy/settlement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Paystack webhook — the source of truth for payment state.
 *
 * 1. Read the RAW body text (never reserialise it).
 * 2. HMAC-SHA512 it with PAYSTACK_SECRET_KEY and compare to the
 *    x-paystack-signature header in constant time.
 * 3. Only then parse and act.
 *
 * Always answer 200 quickly for events we understand but ignore, so
 * Paystack does not retry them forever.
 */
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('Paystack webhook rejected: bad signature');
    return new Response('Invalid signature', { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const eventType = event?.event;
  const data = event?.data;
  const reference = typeof data?.reference === 'string' ? data.reference : '';

  if (!reference) {
    return new Response('Missing reference', { status: 400 });
  }

  const enrolmentReference = reference.replace(/-\d+$/, '');

  try {
    switch (eventType) {
      case 'charge.success': {
        // Paystack can report a different reference than ours if it re-issued
        // one, so trust the metadata stamp we set at initialize time.
        const metadataReference =
          typeof data?.metadata?.enrolment_reference === 'string'
            ? data.metadata.enrolment_reference
            : enrolmentReference;

        // Never settle for less than the amount we asked Paystack to charge.
        const expected = await getPaymentByReference(reference);
        const charged = Math.round(Number(data?.amount) || 0);

        if (expected && charged < Number(expected.amount_kobo)) {
          console.error('Paystack webhook amount mismatch', {
            reference,
            expected: expected.amount_kobo,
            charged,
          });
          await markPaymentFailed({
            paymentReferenceValue: reference,
            status: 'failed',
            payload: data,
          });
          return new Response('Amount mismatch', { status: 200 });
        }

        const settled = await settlePayment({
          paymentReferenceValue: reference,
          payload: data,
        });

        if (!settled) {
          console.warn('Paystack webhook for unknown payment reference', {
            reference,
            metadataReference,
          });
          return new Response('Unknown reference', { status: 200 });
        }

        if (settled.enrolment) {
          await afterSettlement({ enrolment: settled.enrolment, payment: settled.payment });
        }

        return new Response('OK', { status: 200 });
      }

      case 'charge.failed': {
        await markPaymentFailed({
          paymentReferenceValue: reference,
          status: 'failed',
          payload: data,
        });
        return new Response('OK', { status: 200 });
      }

      case 'transfer.reversed':
      case 'refund.processed': {
        const enrolment = await getEnrolmentByReference(enrolmentReference);
        if (enrolment) {
          console.info('Paystack reversal received — handle manually in admin', {
            reference,
            enrolment: enrolment.reference,
          });
        }
        return new Response('OK', { status: 200 });
      }

      default:
        return new Response('Ignored', { status: 200 });
    }
  } catch (error) {
    console.error('Paystack webhook processing failed', error);
    // 500 tells Paystack to retry — which is correct for transient DB errors.
    return new Response('Processing error', { status: 500 });
  }
}
