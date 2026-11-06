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
