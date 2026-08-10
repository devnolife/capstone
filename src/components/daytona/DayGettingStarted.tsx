import type { ReactNode, SVGProps } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/daytona/icons';

/* Ikon peran 64px — line-art mengikuti palet tema */
function MahasiswaGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} fill="none" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="62" height="62" rx="8" stroke="#252525" />
      <path d="M32 18 12 27l20 9 20-9-20-9Z" stroke="#2ecc71" strokeWidth="2" strokeLinejoin="round" />
      <path d="M21 31v9c0 3 5 6 11 6s11-3 11-6v-9" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 27v10" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="40" r="2" fill="#2ecc71" />
    </svg>
  );
}

function DosenGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} fill="none" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="62" height="62" rx="8" stroke="#252525" />
      <rect x="17" y="14" width="30" height="36" rx="3" stroke="#0080ff" strokeWidth="2" />
      <path d="M24 24h16M24 31h16M24 38h9" stroke="#0080ff" strokeWidth="2" strokeLinecap="round" />
      <path d="m36 42 4 4 8-8" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdminGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} fill="none" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="62" height="62" rx="8" stroke="#252525" />
      <path
        d="M32 14c6 4 12 5 16 5v13c0 9-6 15-16 18-10-3-16-9-16-18V19c4 0 10-1 16-5Z"
        stroke="#33cccc"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="31" r="5" stroke="#33cccc" strokeWidth="2" />
      <path d="M24 43c2-4 5-6 8-6s6 2 8 6" stroke="#33cccc" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type RoleGuide = {
  glyph: ReactNode;
  title: string;
  intro: string;
  steps: string[];
  cta: string;
};

const ROLE_GUIDES: RoleGuide[] = [
  {
    glyph: <MahasiswaGlyph />,
    title: 'Mahasiswa',
    intro: 'Yang perlu kamu lakukan di awal semester:',
    steps: [
      'Masuk dengan NIM dan password yang dibagikan prodi',
      'Hubungkan akun GitHub-mu di halaman profil',
      'Buat project, undang anggota tim, dan ajukan tema',
      'Ikuti milestone dan submit sebelum tenggat',
    ],
    cta: 'Masuk sebagai Mahasiswa',
  },
  {
    glyph: <DosenGlyph />,
    title: 'Dosen Penguji',
    intro: 'Setelah ditugaskan koordinator:',
    steps: [
      'Masuk dengan NIP, project yang ditugaskan muncul di dashboard',
      'Buka kode langsung dari repository tim',
      'Tinggalkan komentar inline atau minta revisi',
      'Isi nilai lewat rubrik saat project siap sidang',
    ],
    cta: 'Masuk sebagai Dosen',
  },
  {
    glyph: <AdminGlyph />,
    title: 'Admin Prodi',
    intro: 'Untuk menjalankan satu periode capstone:',
    steps: [
      'Buka periode semester dan atur tenggat milestone',
      'Kelola akun mahasiswa dan dosen penguji',
      'Tugaskan penguji ke setiap project',
      'Jadwalkan sidang dan pantau rekap nilai',
    ],
    cta: 'Masuk sebagai Admin',
  },
];

export function DayGettingStarted() {
  return (
    <section id="mulai" className="day-container flex flex-col gap-16 py-20 scroll-mt-16">
      <h2 className="font-day-sans text-[32px] font-normal leading-[38.4px]">
        <span className="block text-white">Baru di Platform?</span>
        <span className="block text-[#a2a2a2]">Mulai dari Langkah Ini.</span>
      </h2>

      <div className="grid grid-cols-1 gap-px border-y border-[#252525] bg-[#252525] md:grid-cols-3">
        {ROLE_GUIDES.map((role) => (
          <article
            key={role.title}
            className="flex flex-col justify-between bg-[#0a0a0a]"
          >
            <div className="flex flex-col gap-6 p-6">
              <div className="flex items-center gap-5">
                <span className="size-16 shrink-0">{role.glyph}</span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-day-sans text-[20px] leading-6 text-white">
                    {role.title}
                  </h3>
                  <p className="font-day-sans text-[14px] leading-5 tracking-[-0.14px] text-[#585858]">
                    {role.intro}
                  </p>
                </div>
              </div>
              <ol className="flex flex-col">
                {role.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-4 border-t border-dashed border-[#1c1c1c] py-3 first:border-t-0"
                  >
                    <span className="shrink-0 pt-[2px] font-day-mono text-[12px] leading-5 text-[#2ecc71]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-day-sans text-[15px] leading-[22px] tracking-[-0.15px] text-[#a2a2a2]">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <Link
              href="/login"
              className="group flex h-16 items-center justify-between bg-[#06131f] px-6 transition-colors hover:bg-[#091c2f]"
            >
              <span className="font-day-mono text-[16px] text-[#0080ff]">
                {role.cta}
              </span>
              <ArrowRightIcon className="size-4 text-[#0080ff] transition-transform group-hover:translate-x-1" />
            </Link>
          </article>
        ))}
      </div>

      <p className="border-t border-[#252525] px-2 pt-5 font-day-mono text-[13px] leading-[20px] tracking-[-0.26px] text-[#585858]">
        Akun dibuat oleh admin prodi, tidak ada registrasi mandiri. Lupa
        password atau belum punya akun? Hubungi koordinator capstone.
      </p>
    </section>
  );
}
