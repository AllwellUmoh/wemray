'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Enquiries', exact: true },
  { href: '/admin/enrolments', label: 'Enrolments' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/audits', label: 'SEO Audits' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className={active ? 'active' : ''}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
