'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { sendRaynovationAcceptance } from '@/lib/email';

function applicationDetailPath(id, notice) {
  return `/admin/raynovation-applications/${id}?notice=${encodeURIComponent(notice)}`;
}

export async function acceptRaynovationApplicant(formData) {
  await requireAdmin();

  const id = String(formData.get('id') || '');
  if (!/^\d+$/.test(id)) redirect('/admin/raynovation-applications?notice=invalid');

  let application;
  try {
    const claimed = await query(
      `update raynovation_applications
       set status = 'accepted', acceptance_email_claimed_at = now()
       where id = $1
         and accepted_email_sent_at is null
         and (acceptance_email_claimed_at is null
              or acceptance_email_claimed_at < now() - interval '10 minutes')
       returning id, reference, first_name, last_name, email, track_label`,
      [id],
    );

    const row = claimed.rows[0];
    application = row
      ? {
          id: row.id,
          reference: row.reference,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          trackLabel: row.track_label,
        }
      : null;
  } catch (error) {
    console.error('Unable to approve Raynovation applicant', error);
    redirect(applicationDetailPath(id, 'error'));
  }

  if (!application) {
    let current;
    try {
      const result = await query(
        `select status, accepted_email_sent_at, acceptance_email_claimed_at
         from raynovation_applications where id = $1`,
        [id],
      );
      current = result.rows[0] || null;
    } catch (error) {
      console.error('Unable to check Raynovation applicant status', error);
      redirect(applicationDetailPath(id, 'error'));
    }

    const notice = !current
      ? 'missing'
      : current.accepted_email_sent_at
        ? 'already-sent'
        : 'sending';
    redirect(applicationDetailPath(id, notice));
  }

  let emailStatus = 'failed';
  try {
    const result = await sendRaynovationAcceptance({ application });
    emailStatus = result?.skipped ? 'unconfigured' : 'sent';
  } catch (error) {
    console.error('Raynovation acceptance email failed', error);
  }

  try {
    if (emailStatus === 'sent') {
      await query(
        `update raynovation_applications
         set accepted_email_sent_at = now(), acceptance_email_claimed_at = null
         where id = $1`,
        [id],
      );
    } else {
      await query(
        `update raynovation_applications
         set acceptance_email_claimed_at = null
         where id = $1 and accepted_email_sent_at is null`,
        [id],
      );
    }
  } catch (error) {
    console.error('Raynovation acceptance email status could not be saved', error);
    emailStatus = 'failed';
  }

  revalidatePath('/admin/raynovation-applications');
  revalidatePath(`/admin/raynovation-applications/${id}`);
  redirect(applicationDetailPath(id, `accepted-${emailStatus}`));
}
