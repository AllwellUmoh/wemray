import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
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

          <nav className="admin-nav" aria-label="Admin navigation">
            <Link href="/admin" className="active">Enquiries</Link>
            <Link href="/admin/audits">SEO Audits</Link>
            <Link href="/admin?status=new">New enquiries</Link>
          </nav>

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
