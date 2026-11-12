import { Resend } from 'resend';

const DEFAULT_FROM = 'Wemray Technology <no-reply@mail.wemray.com>';
const ADMIN_EMAIL = (process.env.CONTACT_NOTIFICATION_EMAIL || 'hello@wemray.com').trim();

let resendClient;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function sendEmail({ to, subject, html, text, replyTo }) {
  const resend = getResend();

  if (!resend) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not configured');
    }
    console.info(`[email:dev] ${subject} -> ${to}`);
    console.info(text);
    return { skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) throw new Error(error.message || 'Resend rejected the email');
  return data;
}

export async function sendAdminMagicLink({ email, url }) {
  const safeUrl = escapeHtml(url);
  const subject = 'Sign in to Wemray Admin';

  return sendEmail({
    to: email,
    subject,
    replyTo: ADMIN_EMAIL,
    text: [
      'Use the link below to sign in to the Wemray admin area.',
      '',
      url,
      '',
      'This link expires in 10 minutes and can only be used once.',
      'If you did not request it, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="background:#f7f6fd;padding:32px 16px;font-family:Raleway,Arial,sans-serif;color:#0a0a3a">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3def7;border-radius:18px;padding:32px">
          <p style="margin:0 0 8px;color:#5125d2;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Wemray Admin</p>
          <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#000066">Sign in to Wemray Admin</h1>
          <p style="margin:0 0 24px;line-height:1.6;color:#656590">Use the button below to open the admin area. This link expires in 10 minutes and can only be used once.</p>
          <p style="margin:0 0 24px"><a href="${safeUrl}" style="display:inline-block;background:#5125d2;color:#fff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700">Sign in</a></p>
          <p style="margin:0 0 8px;font-size:13px;color:#656590">If the button does not work, copy this link into your browser:</p>
          <p style="margin:0;font-size:12px;line-height:1.6;word-break:break-all;color:#5125d2">${safeUrl}</p>
          <hr style="border:0;border-top:1px solid #e3def7;margin:24px 0" />
          <p style="margin:0;font-size:12px;color:#8a8aae">If you did not request this link, you can ignore this email.</p>
        </div>
      </div>
    `,
  });
}

export async function sendContactConfirmation({ enquiry }) {
  const name = escapeHtml(enquiry.name);
  const reference = escapeHtml(enquiry.reference);
  const service = escapeHtml(enquiry.service);

  return sendEmail({
    to: enquiry.email,
    subject: `We received your enquiry — ${enquiry.reference}`,
    replyTo: ADMIN_EMAIL,
    text: [
      `Hi ${enquiry.name},`,
      '',
      `Thank you for contacting Wemray Technology. We received your enquiry about ${enquiry.service}.`,
      `Your reference is ${enquiry.reference}.`,
      '',
      'We will review your message and reply to this email address as soon as possible.',
      '',
      'Wemray Technology',
    ].join('\n'),
    html: `
      <div style="background:#f7f6fd;padding:32px 16px;font-family:Raleway,Arial,sans-serif;color:#0a0a3a">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3def7;border-radius:18px;padding:32px">
          <p style="margin:0 0 8px;color:#5125d2;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Wemray Technology</p>
          <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#000066">We received your enquiry.</h1>
          <p style="margin:0 0 16px;line-height:1.6;color:#656590">Hi ${name},</p>
          <p style="margin:0 0 16px;line-height:1.6;color:#656590">Thank you for contacting Wemray Technology. We received your enquiry about <strong>${service}</strong>.</p>
          <p style="margin:0 0 24px;line-height:1.6;color:#656590">Your reference is <strong>${reference}</strong>.</p>
          <p style="margin:0;line-height:1.6;color:#656590">We will review your message and reply to this email address as soon as possible.</p>
          <hr style="border:0;border-top:1px solid #e3def7;margin:24px 0" />
          <p style="margin:0;font-size:12px;color:#8a8aae">Wemray Technology · Port Harcourt, Nigeria</p>
        </div>
      </div>
    `,
  });
}

export async function sendContactNotification({ enquiry }) {
  const adminLink = `${siteUrl()}/admin/enquiries/${enquiry.id}`;
  const rows = [
    ['Reference', enquiry.reference],
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Organisation', enquiry.organisation || '—'],
    ['Budget', enquiry.budget || '—'],
    ['Service', enquiry.service],
    ['Intent', enquiry.intent],
    ['Details', enquiry.details || '—'],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e3def7;color:#656590;font-size:13px;vertical-align:top">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e3def7;color:#0a0a3a;font-size:14px;vertical-align:top">${escapeHtml(value).replaceAll('\n', '<br />')}</td>
        </tr>`,
    )
    .join('');

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New enquiry: ${enquiry.service} — ${enquiry.name}`,
    replyTo: enquiry.email,
    text: [
      'New enquiry received from the Wemray website.',
      '',
      text,
      '',
      `Open in admin: ${adminLink}`,
    ].join('\n'),
    html: `
      <div style="background:#f7f6fd;padding:32px 16px;font-family:Raleway,Arial,sans-serif;color:#0a0a3a">
        <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e3def7;border-radius:18px;padding:32px">
          <p style="margin:0 0 8px;color:#5125d2;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">New Website Enquiry</p>
          <h1 style="margin:0 0 20px;font-size:26px;line-height:1.2;color:#000066">${escapeHtml(enquiry.name)}</h1>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px">${htmlRows}</table>
          <p style="margin:0 0 8px"><a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#5125d2;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">Open in admin</a></p>
          <p style="margin:16px 0 0;font-size:12px;color:#8a8aae">Reply directly to this email to respond to the enquirer.</p>
        </div>
      </div>
    `,
  });
}


/* ================================================================== *
 * Ray Academy enrolment emails
 * ================================================================== */

/** Naira amounts. The currency mark is an entity so encoding never bites. */
function naira(kobo) {
  const value = Math.round((Number(kobo) || 0) / 100).toLocaleString('en-NG');
  return `&#8358;${value}`;
}

function plainNaira(kobo) {
  const value = Math.round((Number(kobo) || 0) / 100).toLocaleString('en-NG');
  return `NGN ${value}`;
}

function emailShell(eyebrow, heading, bodyHtml) {
  return `
    <div style="background:#f7f6fd;padding:32px 16px;font-family:Raleway,Arial,sans-serif;color:#0a0a3a">
      <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e3def7;border-radius:18px;padding:32px">
        <p style="margin:0 0 8px;color:#5125d2;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${escapeHtml(eyebrow)}</p>
        <h1 style="margin:0 0 20px;font-size:26px;line-height:1.2;color:#000066">${heading}</h1>
        ${bodyHtml}
        <hr style="border:0;border-top:1px solid #e3def7;margin:24px 0" />
        <p style="margin:0;font-size:12px;color:#8a8aae">Wemray Technology &middot; Ray Academy &middot; Port Harcourt, Nigeria</p>
      </div>
    </div>
  `;
}

function summaryTable(rows) {
  const html = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#656590;font-size:13px;vertical-align:top">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#0a0a3a;font-size:14px;text-align:right;vertical-align:top">${escapeHtml(String(value))}</td>
        </tr>`,
    )
    .join('');

  return `<table style="width:100%;border-collapse:collapse;margin:0 0 24px">${html}</table>`;
}

/**
 * Sent once the first payment lands. Covers both the full-payment case
 * and instalment 1 of 2, so the student always knows what happens next.
 */
export async function sendEnrolmentWelcome({ enrolment, course, balanceKobo = 0, dueDate = '' }) {
  const firstName = escapeHtml(String(enrolment.full_name || '').split(' ')[0] || 'there');
  const title = escapeHtml(course?.title || enrolment.course_title);
  const total = naira(enrolment.total_kobo);
  const paid = naira(enrolment.amount_paid_kobo);

  const rows = [
    ['Course', course?.title || enrolment.course_title],
    ['Reference', enrolment.reference],
    ['Plan', enrolment.plan === 'installment' ? '2 instalments' : 'Full payment'],
    ['Total', `&#8358;${Math.round(Number(enrolment.total_kobo) / 100).toLocaleString('en-NG')}`],
    ['Paid so far', `&#8358;${Math.round(Number(enrolment.amount_paid_kobo) / 100).toLocaleString('en-NG')}`],
  ];

  if (balanceKobo > 0) rows.push(['Balance', `&#8358;${Math.round(Number(balanceKobo) / 100).toLocaleString('en-NG')}`]);
  if (dueDate) rows.push(['Next payment due', dueDate]);
  if (course?.duration) rows.push(['Duration', course.duration]);
  if (course?.classes) rows.push(['Classes', course.classes]);

  const balanceUrl = `${siteUrl()}/academy/enrol/balance?reference=${encodeURIComponent(enrolment.reference)}`;

  const nextSteps =
    balanceKobo > 0
      ? `<p style="margin:0 0 16px;line-height:1.6;color:#656590">Your place is reserved. The remaining <strong>${naira(balanceKobo)}</strong> is due ${dueDate ? `on <strong>${escapeHtml(dueDate)}</strong>` : 'in 30 days'}. <a href="${escapeHtml(balanceUrl)}" style="color:#5125d2;font-weight:700">Pay the balance</a> whenever you are ready.</p>`
      : '<p style="margin:0 0 16px;line-height:1.6;color:#656590">Your place is confirmed and fully paid. Your cohort coordinator will email the class link and schedule before your start date.</p>';

  return sendEmail({
    to: enrolment.email,
    subject: balanceKobo > 0
      ? `You are enrolled in ${course?.title || enrolment.course_title} - ${enrolment.reference}`
      : `Enrolment confirmed - ${course?.title || enrolment.course_title}`,
    replyTo: ADMIN_EMAIL,
    text: [
      `Hi ${firstName},`,
      '',
      `You are enrolled in ${course?.title || enrolment.course_title} with Ray Academy.`,
      `Reference: ${enrolment.reference}`,
      `Total: ${plainNaira(enrolment.total_kobo)}`,
      `Paid: ${plainNaira(enrolment.amount_paid_kobo)}`,
      balanceKobo > 0 ? `Balance: ${plainNaira(balanceKobo)} due ${dueDate || 'in 30 days'}` : '',
      balanceKobo > 0 ? `Pay balance: ${balanceUrl}` : '',
      '',
      'Wemray Technology - Ray Academy',
    ]
      .filter(Boolean)
      .join('\n'),
    html: emailShell(
      'Ray Academy',
      `You&rsquo;re enrolled, ${firstName}.`,
      `
        <p style="margin:0 0 16px;line-height:1.6;color:#656590">
          Thank you for enrolling in <strong>${title}</strong>. Here is everything on record.
        </p>
        ${summaryTable(rows)}
        ${nextSteps}
        <p style="margin:0;line-height:1.6;color:#656590">
          Questions in the meantime? Reply to this email or write to
          <a href="mailto:${escapeHtml(ADMIN_EMAIL)}" style="color:#5125d2">${escapeHtml(ADMIN_EMAIL)}</a>.
        </p>
      `,
    ),
  });
}

/** Payment receipt for a single transaction. */
export async function sendEnrolmentReceipt({ enrolment, course, payment }) {
  const amount = naira(payment.amount_kobo);
  const instalmentLabel = `${payment.installment_no} of ${enrolment.plan === 'installment' ? 2 : 1}`;

  return sendEmail({
    to: enrolment.email,
    subject: `Payment received - ${plainNaira(payment.amount_kobo)} - ${enrolment.reference}`,
    replyTo: ADMIN_EMAIL,
    text: [
      `Payment received: ${plainNaira(payment.amount_kobo)}`,
      `Course: ${course?.title || enrolment.course_title}`,
      `Reference: ${enrolment.reference}`,
      `Instalment: ${instalmentLabel}`,
      `Paystack reference: ${payment.paystack_reference || payment.reference}`,
    ].join('\n'),
    html: emailShell(
      'Payment received',
      `${amount} received.`,
      `
        <p style="margin:0 0 16px;line-height:1.6;color:#656590">
          This is your receipt for <strong>${escapeHtml(course?.title || enrolment.course_title)}</strong>.
        </p>
        ${summaryTable([
          ['Amount', amount],
          ['Instalment', instalmentLabel],
          ['Course reference', enrolment.reference],
          ['Paystack reference', payment.paystack_reference || payment.reference],
          ['Paid to date', naira(enrolment.amount_paid_kobo)],
          ['Course total', naira(enrolment.total_kobo)],
        ])}
        <p style="margin:0;line-height:1.6;color:#656590">
          ${payment.installment_no === 1 ? 'Keep this for your records.' : 'This settles your course fee in full. Thank you.'}
        </p>
      `,
    ),
  });
}

/** Admin notification for a new paid enrolment. */
export async function sendEnrolmentNotification({ enrolment, course, balanceKobo = 0 }) {
  const adminLink = `${siteUrl()}/admin/enrolments/${enrolment.id}`;

  const rows = [
    ['Student', enrolment.full_name],
    ['Email', enrolment.email],
    ['Phone', enrolment.phone],
    ['Course', course?.title || enrolment.course_title],
    ['Plan', enrolment.plan === 'installment' ? '2 instalments' : 'Full payment'],
    ['Base price', naira(enrolment.base_price_kobo)],
    ['Discount', enrolment.discount_kobo ? `${naira(enrolment.discount_kobo)} (${enrolment.coupon_code})` : '-'],
    ['Total', naira(enrolment.total_kobo)],
    ['Paid', naira(enrolment.amount_paid_kobo)],
    ['Balance', balanceKobo ? naira(balanceKobo) : '-'],
    ['Reference', enrolment.reference],
  ];

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New enrolment: ${course?.title || enrolment.course_title} - ${enrolment.full_name}`,
    replyTo: enrolment.email,
    text: [
      'New paid enrolment from the website.',
      '',
      ...rows.map(([label, value]) => `${label}: ${String(value).replace(/&#8358;/g, 'NGN ')}`),
      '',
      `Open in admin: ${adminLink}`,
    ].join('\n'),
    html: emailShell(
      'New Enrolment',
      escapeHtml(enrolment.full_name),
      `
        ${summaryTable(rows)}
        <p style="margin:0"><a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#5125d2;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">Open in admin</a></p>
      `,
    ),
  });
}

/** Reminder for an outstanding second instalment. */
export async function sendInstalmentDue({ enrolment, course, amountKobo, dueDate, payUrl }) {
  const amount = naira(amountKobo);

  return sendEmail({
    to: enrolment.email,
    subject: `Balance due for ${course?.title || enrolment.course_title} - ${plainNaira(amountKobo)}`,
    replyTo: ADMIN_EMAIL,
    text: [
      `Your second instalment for ${course?.title || enrolment.course_title} is due.`,
      `Amount: ${plainNaira(amountKobo)}`,
      `Due date: ${dueDate}`,
      payUrl ? `Pay here: ${payUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    html: emailShell(
      'Ray Academy',
      `Your balance is due ${escapeHtml(dueDate)}.`,
      `
        <p style="margin:0 0 16px;line-height:1.6;color:#656590">
          Hi ${escapeHtml(String(enrolment.full_name || '').split(' ')[0] || 'there')}, the second instalment for
          <strong>${escapeHtml(course?.title || enrolment.course_title)}</strong> is now due.
        </p>
        ${summaryTable([
          ['Amount due', amount],
          ['Due date', dueDate],
          ['Course', course?.title || enrolment.course_title],
          ['Reference', enrolment.reference],
        ])}
        ${payUrl ? `<p style="margin:0 0 16px"><a href="${escapeHtml(payUrl)}" style="display:inline-block;background:#5125d2;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">Pay ${amount}</a></p>` : ''}
        <p style="margin:0;line-height:1.6;color:#656590">If you have already paid, please ignore this email.</p>
      `,
    ),
  });
}