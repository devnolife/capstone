'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DayWindowChrome } from '@/components/daytona/DayCodeWindow';
import { ArrowRightIcon } from '@/components/daytona/icons';

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

const AUTH_LOG = [
  { prompt: '$', cmd: 'capstone auth --sso simak', out: null },
  { prompt: null, cmd: null, out: '✓ terhubung ke SIMAK Unismuh' },
  { prompt: null, cmd: null, out: '✓ sinkron data mahasiswa & dosen' },
  { prompt: null, cmd: null, out: '✓ sesi terenkripsi' },
] as const;

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const callbackError = searchParams.get('error');

  return (
    <div className="w-full max-w-[440px]">
      <div className="day-glow-code relative overflow-hidden rounded-[12px] border border-[#252525] bg-[#0d0d0d]">
        <div aria-hidden="true" className="day-accent-top absolute inset-x-8 top-0 h-px" />
        <DayWindowChrome filename="masuk.sh" />

        <div className="px-6 py-7 sm:px-8">
          <h1 className="font-day-sans text-[28px] font-semibold leading-[32px] tracking-[-1px] text-white">
            Masuk<span className="text-[#0080ff]">.</span>
          </h1>
          <p className="mt-2 font-day-sans text-[14px] leading-[21px] text-[#a2a2a2]">
            Login hanya melalui SSO Unismuh — tidak ada lagi username &amp; password.
          </p>

          {callbackError ? (
            <div
              role="alert"
              className="mt-5 rounded-[4px] border border-[#4d1f1f] bg-[#1a0d0d] px-3.5 py-2.5 font-day-code text-[12px] leading-[18px] text-[#ff6b6b]"
            >
              <span className="text-[#585858]">error:</span> Terjadi kesalahan saat login.
            </div>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              void signIn('sso-unismuh', { callbackUrl: '/dashboard' });
            }}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#0080ff] px-6 font-day-mono text-[16px] leading-none tracking-[-0.16px] text-white transition-colors duration-250 hover:bg-[#0066dd] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <span className="day-anim-cursor inline-block h-[14px] w-[7px] bg-white" />
                Mengalihkan...
              </>
            ) : (
              <>
                Masuk via SSO Unismuh
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-4 font-day-sans text-[13px] leading-5 text-[#585858]">
            Akun mahasiswa &amp; dosen tersinkron otomatis dari SIMAK saat pertama kali masuk.
          </p>
        </div>

        <div className="flex h-[30px] items-center justify-between border-t border-[#1c1c1c] px-4">
          <span className="font-day-mono text-[11px] uppercase tracking-[0.22px] text-[#585858]">
            auth · sso
          </span>
          <span className="flex items-center gap-1.5 font-day-mono text-[11px] text-[#585858]">
            <span className="size-[6px] rounded-full bg-[#2ecc71]" />
            koneksi aman
          </span>
        </div>
      </div>

      <p className="mt-6 text-center font-day-sans text-[13px] leading-5 text-[#585858]">
        Ada kendala akun? Hubungi{' '}
        <span className="text-[#a2a2a2] underline decoration-[#252525] underline-offset-2">
          administrator prodi
        </span>
        .
      </p>
    </div>
  );
}

export function LoginView() {
  return (
    <div className="day-root flex min-h-screen flex-col">
      {/* top bar */}
      <header className="day-hairline-b">
        <div className="day-container flex items-center justify-between py-3">
          <Link href="/" aria-label="Beranda Capstone Informatika">
            <CapstoneLogo />
          </Link>
          <Link
            href="/"
            className="inline-flex h-8 items-center justify-center rounded-[4px] bg-[#252525] px-4 font-day-mono text-[14px] leading-[16px] tracking-[-0.56px] text-white transition-colors duration-200 hover:bg-[#3c3c3c]"
          >
            Beranda
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-stretch">
        <div className="day-container flex flex-1 flex-col lg:flex-row">
          {/* left: pitch panel */}
          <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-[#252525] py-14 pr-14 lg:flex">
            <div aria-hidden="true" className="day-dot-grid absolute inset-0 opacity-60" />

            <div className="relative z-[2]">
              <span className="day-mono-label">[AUTH] · PRODI INFORMATIKA · UNISMUH MAKASSAR</span>
              <h2 className="day-h2 mt-6 max-w-[420px]">
                Satu akun untuk
                <br />
                <span className="day-h2-muted">seluruh siklus capstone.</span>
              </h2>
              <p className="mt-5 max-w-[400px] font-day-sans text-[16px] leading-[24px] tracking-[-0.2px] text-[#a2a2a2]">
                Submit project, hubungkan GitHub, ikuti milestone, dan terima
                penilaian dosen penguji — semua dari satu tempat.
              </p>
            </div>

            {/* terminal log */}
            <div className="relative z-[2] mt-12 max-w-[400px] rounded-[8px] border border-[#252525] bg-[#0d0d0d] p-4">
              {AUTH_LOG.map((line, i) => (
                <p
                  key={i}
                  className="font-day-code text-[13px] leading-[22px]"
                >
                  {line.prompt ? (
                    <>
                      <span className="text-[#2ecc71]">{line.prompt}</span>{' '}
                      <span className="text-white">{line.cmd}</span>
                    </>
                  ) : (
                    <span className="text-[#585858]">{line.out}</span>
                  )}
                </p>
              ))}
            </div>

            <div className="relative z-[2] mt-12 flex items-center justify-between font-day-mono text-[12px] tracking-[-0.24px] text-[#585858]">
              <span>Platform Capstone Project</span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 animate-pulse rounded-full bg-[#2ecc71]" />
                semester aktif
              </span>
            </div>
          </aside>

          {/* right: form */}
          <section className="flex flex-1 items-center justify-center py-12 lg:py-14 lg:pl-14">
            <Suspense
              fallback={
                <span className="font-day-mono text-[13px] text-[#585858]">memuat…</span>
              }
            >
              <LoginForm />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}
