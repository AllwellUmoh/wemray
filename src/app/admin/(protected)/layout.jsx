import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import AdminNav from './AdminNav';
import LogoutButton from './LogoutButton';

export default async function AdminProtectedLayout({ children }) {
  const session = await requireAdmin();

  return (
    <div className="admin-body">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <img src="/logo.png" alt="" />
            <span>
              WEMRAY
              <small>Admin</small>
            </span>
          </div>

          <AdminNav />

          <div className="admin-sidebar-footer">
            <Link href="/">View website</Link>
            <LogoutButton />
          </div>
        </aside>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
