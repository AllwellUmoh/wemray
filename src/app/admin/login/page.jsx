import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Admin Sign In | Wemray',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect('/admin');

  return (
    <div className="admin-body admin-login-page">
      <LoginForm />
    </div>
  );
}
