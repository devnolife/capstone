'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

// Map URL segments to human-readable labels (Bahasa Indonesia)
const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  dosen: 'Dosen',
  mahasiswa: 'Mahasiswa',
  dashboard: 'Dashboard',
  projects: 'Project',
  presentations: 'Jadwal Presentasi',
  users: 'Manajemen User',
  assignments: 'Penugasan Dosen',
  rubrik: 'Rubrik Penilaian',
  semesters: 'Semester',
  reviews: 'Review',
  statistics: 'Statistik',
  'auto-review': 'Auto Review',
  invitations: 'Undangan Tim',
  persyaratan: 'Persyaratan',
  notifications: 'Notifikasi',
  profile: 'Profil',
  settings: 'Pengaturan',
  documents: 'Dokumen',
  'link-github': 'Hubungkan GitHub',
};

interface Crumb {
  label: string;
  href: string;
  isLast: boolean;
}

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  // Detect role root segment
  const roleRoots = new Set(['admin', 'dosen', 'mahasiswa']);
  const crumbs: Crumb[] = [];
  let acc = '';
  segments.forEach((seg, idx) => {
    acc += `/${seg}`;
    // Skip role root by itself; first crumb should be "Dashboard"
    if (idx === 0 && roleRoots.has(seg)) {
      return;
    }
    // Skip dynamic id-looking segments (cuid/uuid-ish)
    const looksLikeId =
      /^c[a-z0-9]{20,}$/i.test(seg) || // cuid
      /^[0-9a-f-]{20,}$/i.test(seg); // uuid-ish

    const label = looksLikeId
      ? 'Detail'
      : SEGMENT_LABELS[seg] ||
      seg
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    crumbs.push({
      label,
      href: acc,
      isLast: idx === segments.length - 1,
    });
  });

  return crumbs;
}

function homeHref(pathname: string): string {
  if (pathname.startsWith('/admin')) return '/admin/dashboard';
  if (pathname.startsWith('/dosen')) return '/dosen/dashboard';
  if (pathname.startsWith('/mahasiswa')) return '/mahasiswa/dashboard';
  return '/';
}

export function Breadcrumbs() {
  const pathname = usePathname() || '/';
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length === 0) return null;

  const home = homeHref(pathname);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm text-default-500 min-w-0"
    >
      <Link
        href={home}
        className="flex items-center gap-1 hover:text-default-800 transition-colors shrink-0"
      >
        <Home size={14} />
      </Link>
      {crumbs.map((c) => (
        <span key={c.href} className="flex items-center gap-1 min-w-0">
          <ChevronRight size={14} className="text-default-300 shrink-0" />
          {c.isLast ? (
            <span className="font-medium text-default-800 truncate">{c.label}</span>
          ) : (
            <Link
              href={c.href}
              className="hover:text-default-800 transition-colors truncate"
            >
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
