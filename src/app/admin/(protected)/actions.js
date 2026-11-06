'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '../../../lib/admin-auth';
import { updateEnquiry } from '../../../lib/admin';

export async function updateEnquiryAction(formData) {
  await requireAdmin();

  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  const adminNotes = String(formData.get('admin_notes') || '').slice(0, 10000);

  const updated = await updateEnquiry(id, { status, adminNotes });

  if (!updated) {
    redirect(`/admin/enquiries/${id}?error=invalid`);
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/enquiries/${id}`);
  redirect(`/admin/enquiries/${id}?saved=1`);
}
