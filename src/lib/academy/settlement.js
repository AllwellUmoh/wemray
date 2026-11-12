import { getCourseBySlug } from './courses';
import { recordCouponRedemption } from './coupons';
import { markEmailSent } from './enrolments';
import { formatDueDate, instalmentDueDate } from './pricing';
import {
  sendEnrolmentNotification,
  sendEnrolmentReceipt,
  sendEnrolmentWelcome,
} from '../email';

/* ------------------------------------------------------------------ *
 * Post-payment side effects.
 *
 * Shared by the browser verify redirect and the Paystack webhook. The
 * *_sent_at columns guard against duplicate mail when both fire for the
 * same payment.
 * ------------------------------------------------------------------ */
export async function afterSettlement({ enrolment, payment }) {
  const course = await getCourseBySlug(enrolment.course_slug);
  const isInstallment = enrolment.plan === 'installment';
  const balanceKobo = Math.max(0, Number(enrolment.total_kobo) - Number(enrolment.amount_paid_kobo));

  const dueDate = isInstallment ? formatDueDate(instalmentDueDate()) : '';

  const tasks = [];

  if (!enrolment.receipt_email_sent_at) {
    tasks.push(
      sendEnrolmentReceipt({ enrolment, course, payment })
        .then(() => markEmailSent(enrolment.id, 'receipt_email_sent_at'))
        .catch((error) => console.error('Enrolment receipt email failed', error)),
    );
  }

  if (!enrolment.welcome_email_sent_at) {
    tasks.push(
      sendEnrolmentWelcome({ enrolment, course, balanceKobo, dueDate })
        .then(() => markEmailSent(enrolment.id, 'welcome_email_sent_at'))
        .catch((error) => console.error('Enrolment welcome email failed', error)),
    );
  }

  if (!enrolment.admin_notified_at) {
    tasks.push(
      sendEnrolmentNotification({ enrolment, course, balanceKobo })
        .then(() => markEmailSent(enrolment.id, 'admin_notified_at'))
        .catch((error) => console.error('Enrolment admin notification failed', error)),
    );
  }

  // Only count a coupon once, on the first successful payment.
  if (payment?.installment_no === 1 && enrolment.coupon_code) {
    tasks.push(
      recordCouponRedemption(enrolment.coupon_code).catch((error) =>
        console.error('Coupon redemption update failed', error),
      ),
    );
  }

  await Promise.allSettled(tasks);
}
