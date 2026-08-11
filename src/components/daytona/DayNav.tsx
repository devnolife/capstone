'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MenuIcon } from '@/components/daytona/icons';

const NAV_LINKS = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Alur', href: '#alur' },
  { label: 'Status', href: '#status' },
  { label: 'Penilaian', href: '#penilaian' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
] as const;

const navLinkClass =
  'font-day-mono text-[14px] leading-[19.32px] tracking-[-0.56px] uppercase text-white transition-colors duration-200 hover:text-day-muted';

const signInClass =
  'inline-flex h-8 items-center justify-center rounded-[4px] bg-[rgba(0,127,255,0.2)] px-4 py-2 font-day-mono text-[14px] leading-[16px] tracking-[-0.56px] text-day-blue transition-colors duration-200 hover:bg-[rgba(0,127,255,0.3)]';

const contactClass =
  'inline-flex h-8 items-center justify-center rounded-[4px] bg-day-surface-2 px-4 py-2 font-day-mono text-[14px] leading-[16px] tracking-[-0.56px] text-white transition-colors duration-200 hover:bg-[#3c3c3c]';

function CapstoneLogo() {
  return (
    <span className="flex items-baseline font-day-mono text-[18px] leading-none tracking-[-0.36px]">
      <span className="text-white">capstone</span>
      <span className="text-[#0080ff]">.if</span>
      <span
        aria-hidden="true"
        className="day-anim-cursor ml-[3px] inline-block h-[14px] w-[7px] self-center bg-[#2ecc71]"
      />
    </span>
  );
}

export function DayNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="relative w-full">
      <div className="day-container flex items-center gap-5 py-3">
        <Link href="/" className="shrink-0" aria-label="Beranda Capstone Informatika">
          <CapstoneLogo />
        </Link>

        <nav className="ml-5 hidden flex-1 items-center gap-4 md:flex">
          <span className="font-day-mono text-[14px] leading-[19.32px] tracking-[-0.56px] text-day-muted">
            /
          </span>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={navLinkClass}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link href="/dashboard" className={contactClass}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className={signInClass}>
              Masuk
            </Link>
          )}
        </div>

        <button
          type="button"
          className="ml-auto text-[24px] text-white md:hidden"
          aria-label="Buka menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon />
        </button>
      </div>

      {menuOpen ? (
        <div className="absolute inset-x-0 top-full z-50 w-full border-b border-day-border bg-day-bg md:hidden">
          <nav className="day-container flex flex-col">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-3 ${navLinkClass}`}
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="block py-3 font-day-mono text-[14px] leading-[19.32px] tracking-[-0.56px] text-white transition-colors duration-200 hover:text-day-muted"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="block py-3 font-day-mono text-[14px] leading-[19.32px] tracking-[-0.56px] text-day-blue transition-colors duration-200 hover:text-day-blue-light"
              >
                Masuk
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
