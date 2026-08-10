import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/daytona/icons';

type FooterLink = {
  label: string;
  href: string;
};

type SocialLink = FooterLink & {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const platformLinks: FooterLink[] = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Alur Kerja', href: '#alur' },
  { label: 'Status Project', href: '#status' },
  { label: 'Penilaian', href: '#penilaian' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Masuk', href: '/login' },
  { label: 'Dashboard', href: '/dashboard' },
];

const bantuanLinks: FooterLink[] = [
  { label: 'Kontak Koordinator', href: 'mailto:informatika@unismuh.ac.id' },
  { label: 'Prodi Informatika', href: 'https://unismuh.ac.id' },
  { label: 'Fakultas Teknik', href: 'https://unismuh.ac.id' },
  { label: 'Kalender Akademik', href: 'https://unismuh.ac.id' },
];

const socialLinks: SocialLink[] = [
  {
    label: 'Github',
    href: 'https://github.com/devnolife/capstone',
    Icon: GithubIcon,
  },
  {
    label: 'Youtube',
    href: 'https://www.youtube.com/@unismuhmakassartv',
    Icon: YoutubeIcon,
  },
  { label: 'Twitter', href: 'https://x.com/unismuh', Icon: TwitterIcon },
  {
    label: 'Linkedin',
    href: 'https://www.linkedin.com/school/unismuh',
    Icon: LinkedinIcon,
  },
];

const popularTopicsColumns: string[][] = [
  [
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'Internet of Things',
    'Data Science',
  ],
  ['Computer Vision', 'Sistem Informasi', 'Game Development', 'Cyber Security'],
];

const legalLinks: FooterLink[] = [
  { label: 'Kebijakan Privasi', href: '#' },
  { label: 'Syarat Penggunaan', href: '#' },
];

const columnHeadingClass =
  'mb-4 font-day-mono text-[12px] uppercase leading-3 tracking-[-0.12px] text-[#a2a2a2]';
const footerLinkClass =
  'font-day-sans text-[16px] leading-[26px] text-white transition-colors hover:text-[#a2a2a2]';

function LinkColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className={columnHeadingClass}>{heading}</h3>
      <ul className="flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className={footerLinkClass}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DayFooter() {
  return (
    <footer className="day-container grid grid-cols-1 gap-y-[60px] pb-[60px] pt-[60px] min-[810px]:grid-cols-[416px_1fr] min-[810px]:gap-y-0">
      {/* Left branding column */}
      <div className="flex min-h-full flex-col justify-between">
        <span className="flex items-baseline font-day-mono text-[24px] leading-none tracking-[-0.48px]">
          <span className="text-white">capstone</span>
          <span className="text-[#0080ff]">.if</span>
          <span
            aria-hidden="true"
            className="day-anim-cursor ml-1 inline-block h-[18px] w-[9px] self-center bg-[#2ecc71]"
          />
        </span>
        <div className="mt-16 flex flex-col gap-1 min-[810px]:mt-0">
          <span className="font-day-mono text-[12px] uppercase leading-[18px] text-[#a2a2a2]">
            Program Studi Informatika
          </span>
          <span className="font-day-mono text-[12px] uppercase leading-[18px] text-[#585858]">
            Fakultas Teknik
          </span>
          <span className="font-day-mono text-[12px] uppercase leading-[18px] text-[#585858]">
            Universitas Muhammadiyah Makassar
          </span>
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-[60px]">
        {/* Periode strip */}
        <div className="flex items-center justify-between border-y border-[#252525] py-4">
          <div className="flex items-center gap-4">
            <span className="rounded-[4px] bg-[rgba(0,127,255,0.2)] p-1 font-day-mono text-[12px] leading-3 text-[#0080ff]">
              BARU
            </span>
            <span className="font-day-mono text-[16px] leading-[19.2px] text-white">
              Periode Ganjil 2025/2026 Dibuka
            </span>
          </div>
          <Link
            href="/login"
            className="group flex items-center gap-2 font-day-mono text-[14px] leading-4 tracking-[-0.56px] text-white transition-colors hover:text-[#a2a2a2]"
          >
            Masuk Sekarang
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-12 min-[810px]:grid-cols-3">
          <LinkColumn heading="Platform" links={platformLinks} />
          <LinkColumn heading="Bantuan" links={bantuanLinks} />
          <div>
            <h3 className={columnHeadingClass}>Ikuti Kami</h3>
            <ul className="flex flex-col gap-1">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={`flex items-center gap-2.5 ${footerLinkClass}`}
                  >
                    <Icon className="size-4 text-white" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#252525]" />

        {/* Topik populer */}
        <div>
          <h3 className="mb-4 font-day-mono text-[12px] uppercase text-[#a2a2a2]">
            Topik Capstone Populer
          </h3>
          <div className="grid grid-cols-1 gap-x-24 gap-y-1 min-[810px]:grid-cols-2">
            {popularTopicsColumns.map((column) => (
              <ul key={column[0]} className="flex flex-col gap-1">
                {column.map((topic) => (
                  <li key={topic}>
                    <span className={footerLinkClass}>{topic}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#252525] pt-6">
          <span className="font-day-sans text-[14px] text-[#585858]">
            &copy; 2026 Prodi Informatika, Universitas Muhammadiyah Makassar
          </span>
          <nav className="flex gap-6">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-day-sans text-[14px] text-[#585858] transition-colors hover:text-[#a2a2a2]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
