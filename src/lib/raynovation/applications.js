import { query } from '../db';

export async function listRaynovationApplications(limit = 100) {
  const result = await query(
    `select id, reference, first_name, last_name, email, track_label, status,
            accepted_email_sent_at, created_at
     from raynovation_applications
     order by created_at desc, id desc
     limit $1`,
    [limit],
  );
  return result.rows;
}

export async function getRaynovationApplication(id) {
  const result = await query(
    `select id, reference, first_name, last_name, email, phone, whatsapp_phone,
            whatsapp_same_as_phone, date_of_birth, sex, has_disability, address,
            city, state, country, occupation, qualification, work_experience,
            computer_knowledge, track_key, track_label, has_laptop, has_smartphone,
            available_for_sessions, has_guarantor, motivation, consent, status,
            accepted_email_sent_at, created_at
     from raynovation_applications
     where id = $1`,
    [id],
  );
  return result.rows[0] || null;
}
