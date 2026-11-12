'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { updateEnrolmentStatus } from '@/lib/academy/admin-queries';

export async function updateEnrolmentStatusAction(formData) {
  await requireAdmin();

  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');

  const updated = await updateEnrolmentStatus(id, status);

  if (!updated) redirect(`/admin/enrolments/${id}?error=invalid`);

  revalidatePath('/admin/enrolments');
  revalidatePath(`/admin/enrolments/${id}`);
  redirect(`/admin/enrolments/${id}?saved=1`);
}
