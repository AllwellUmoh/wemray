import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { sendContactConfirmation, sendContactNotification } from '../../../lib/email';
import {
  clientIp,
  createReference,
  hashIp,
  isAllowedOrigin,
  parseContact,
} from '../../../lib/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_WINDOW_MINUTES = 10;
const RATE_LIMIT = 5;

function json(body, init) {
  return NextResponse.json(body, {
    ...init,
    headers: { 'Cache-Control': 'no-store', ...(init?.headers || {}) },
  });
}

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return json({ error: 'Invalid request origin.' }, { status: 403 });
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

  if (input?.website) {
    return json({ ok: true, reference: createReference() });
  }

  const parsed = parseContact(input);
  if (!parsed.success) {
    return json(
      {
        error: 'Please check the highlighted fields.',
        fieldErrors: parsed.fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const ipHash = hashIp(clientIp(request));

  try {
    const recent = await query(
      `select count(*)::int as count
       from contact_enquiries
       where ip_hash = $1 and created_at > now() - ($2 || ' minutes')::interval`,
      [ipHash, RATE_WINDOW_MINUTES],
    );

    if (recent.rows[0]?.count >= RATE_LIMIT) {
      return json(
        { error: 'Too many messages. Please try again later or email hello@wemray.com.' },
        { status: 429, headers: { 'Retry-After': '600' } },
      );
    }

    const reference = createReference();
    const inserted = await query(
      `insert into contact_enquiries
        (reference, name, email, organisation, budget, service, details, intent, ip_hash, user_agent)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning id, reference`,
      [
        reference,
        data.name,
        data.email.toLowerCase(),
        data.organisation || '',
        data.budget || '',
        data.service,
        data.details || '',
        data.intent,
        ipHash,
        request.headers.get('user-agent') || '',
      ],
    );

    const enquiry = {
      ...data,
      id: inserted.rows[0].id,
      reference: inserted.rows[0].reference,
    };

    const [confirmation, notification] = await Promise.allSettled([
      sendContactConfirmation({ enquiry }),
      sendContactNotification({ enquiry }),
    ]);

    if (confirmation.status === 'rejected') {
      console.error('Contact confirmation email failed', confirmation.reason);
    }
    if (notification.status === 'rejected') {
      console.error('Contact notification email failed', notification.reason);
    }

    await query(
      `update contact_enquiries
       set confirmation_sent_at = case when $2 then now() else confirmation_sent_at end,
           notification_sent_at = case when $3 then now() else notification_sent_at end
       where id = $1`,
      [
        enquiry.id,
        confirmation.status === 'fulfilled',
        notification.status === 'fulfilled',
      ],
    );

    return json({ ok: true, reference: enquiry.reference });
  } catch (error) {
    console.error('Contact submission failed', error);
    return json(
      { error: 'We could not save your message. Please try again or email hello@wemray.com.' },
      { status: 500 },
    );
  }
}
