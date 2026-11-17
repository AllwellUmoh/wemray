import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { applicationBoolean, parseRaynovationApplication } from '../../../../lib/raynovation/application';
import { RAYNOVATION_TRACKS } from '../../../../data/raynovation-tracks';
import { clientIp, hashIp, isAllowedOrigin } from '../../../../lib/contact';
import {
  sendRaynovationApplicationConfirmation,
  sendRaynovationApplicationNotification,
} from '../../../../lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_WINDOW_MINUTES = 60;
const RATE_LIMIT = 5;

function json(body, init) {
  return NextResponse.json(body, {
    ...init,
    headers: { 'Cache-Control': 'no-store', ...(init?.headers || {}) },
  });
}

function createApplicationReference(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  return `RAY-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 20_000) {
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
    return json({ ok: true, reference: createApplicationReference() });
  }

  const parsed = parseRaynovationApplication(input);
  if (!parsed.success) {
    return json(
      { error: 'Please check the highlighted fields.', fieldErrors: parsed.fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const track = RAYNOVATION_TRACKS.find((item) => item.key === data.trackKey);
  if (!track) {
    return json(
      { error: 'Please choose a current training track.', fieldErrors: { trackKey: 'Choose a track.' } },
      { status: 422 },
    );
  }

  const ipHash = hashIp(`raynovation:${clientIp(request)}`);

  try {
    const recent = await query(
      `select count(*)::int as count
       from raynovation_applications
       where ip_hash = $1 and created_at > now() - ($2 || ' minutes')::interval`,
      [ipHash, RATE_WINDOW_MINUTES],
    );

    if (recent.rows[0]?.count >= RATE_LIMIT) {
      return json(
        { error: 'Too many applications from this connection. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '3600' } },
      );
    }

    const reference = createApplicationReference();
    const inserted = await query(
      `insert into raynovation_applications
        (reference, first_name, last_name, email, phone, whatsapp_phone,
         whatsapp_same_as_phone, date_of_birth, sex, has_disability, address,
         city, state, country, occupation, qualification, work_experience,
         computer_knowledge, track_key, track_label, has_laptop, has_smartphone,
         available_for_sessions, has_guarantor, motivation, consent, ip_hash, user_agent)
       values
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
         $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
       returning id, reference, created_at`,
      [
        reference,
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.whatsappSameAsPhone ? data.phone : data.whatsappNumber,
        data.whatsappSameAsPhone,
        data.dateOfBirth,
        data.sex,
        applicationBoolean(data.hasDisability),
        data.address,
        data.city,
        data.state,
        data.country,
        data.occupation,
        data.qualification,
        data.workExperience,
        applicationBoolean(data.computerKnowledge),
        data.trackKey,
        track.label,
        applicationBoolean(data.hasLaptop),
        applicationBoolean(data.hasSmartphone),
        applicationBoolean(data.availableForSessions),
        applicationBoolean(data.hasGuarantor),
        data.motivation,
        data.consent,
        ipHash,
        request.headers.get('user-agent') || '',
      ],
    );

    const application = {
      ...data,
      id: inserted.rows[0].id,
      reference: inserted.rows[0].reference,
      trackLabel: track.label,
    };
    const [confirmation, notification] = await Promise.allSettled([
      sendRaynovationApplicationConfirmation({ application }),
      sendRaynovationApplicationNotification({ application }),
    ]);

    if (confirmation.status === 'rejected') {
      console.error('Raynovation applicant confirmation email failed', confirmation.reason);
    }
    if (notification.status === 'rejected') {
      console.error('Raynovation admin notification email failed', notification.reason);
    }

    const confirmationSent =
      confirmation.status === 'fulfilled' && !confirmation.value?.skipped;
    const notificationSent =
      notification.status === 'fulfilled' && !notification.value?.skipped;

    try {
      await query(
        `update raynovation_applications
         set confirmation_sent_at = case when $2 then now() else confirmation_sent_at end,
             notification_sent_at = case when $3 then now() else notification_sent_at end
         where id = $1`,
        [
          application.id,
          confirmationSent,
          notificationSent,
        ],
      );
    } catch (error) {
      console.error('Raynovation application email status could not be saved', error);
    }

    return json({ ok: true, reference: application.reference, confirmationSent });
  } catch (error) {
    console.error('Raynovation application submission failed', error);
    return json(
      { error: 'We could not save your application. Please try again or email hello@wemray.com.' },
      { status: 500 },
    );
  }
}
