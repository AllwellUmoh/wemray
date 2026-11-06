import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionCookie } from 'better-auth/cookies';
import { auth } from './auth';

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'hello@wemray.com').trim().toLowerCase();

export async function getAdminSession() {
  const requestHeaders = await headers();
  if (!getSessionCookie(requestHeaders)) return null;

  try {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session?.user?.email) return null;
    if (session.user.email.trim().toLowerCase() !== ADMIN_EMAIL) return null;
    return session;
  } catch (error) {
    console.error('Admin session check failed', error);
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}
