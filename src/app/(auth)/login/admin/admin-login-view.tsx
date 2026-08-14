'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { DayWindowChrome } from '@/components/daytona/DayCodeWindow';
import { ArrowRightIcon } from '@/components/daytona/icons';

const inputClass =
  'h-11 w-full rounded-[4px] border border-[#252525] bg-[#111111] px-3.5 font-day-code text-[14px] text-white placeholder:text-[#585858] outline-none transition-colors focus:border-[#0080ff]';

const labelClass =
  'mb-2 block font-day-mono text-[11px] uppercase tracking-[0.22px] text-[#a2a2a2]';

export function AdminLoginView() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const gate = await fetch('/api/auth/admin-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      });

      if (!gate.ok) {
        const data = await gate.json().catch(() => null);
        setError(data?.message || 'Kode akses tidak valid.');
        return;
      }

      const result = await signIn('credentials', { accessCode, redirect: false });
      if (result?.error) {
        setError(result.code || 'Kode akses tidak valid.');
      } else {
        window.location.href = '/admin/dashboard';
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="day-root flex min-h-screen flex-col">
      <header className="day-hairline-b">
        <div className="day-container flex items-center justify-between py-3">
          <Link href="/" aria-label="Beranda Capstone Informatika">
            <span className="flex items-baseline font-day-mono text-[18px] leading-none tracking-[-0.36px]">
              <span className="text-white">capstone</span>
              <span className="text-[#0080ff]">.if</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex h-8 items-center justify-center rounded-[4px] bg-[#252525] px-4 font-day-mono text-[14px] leading-[16px] tracking-[-0.56px] text-white transition-colors duration-200 hover:bg-[#3c3c3c]"
          >
            Login SSO
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="day-glow-code relative overflow-hidden rounded-[12px] border border-[#252525] bg-[#0d0d0d]">
            <div aria-hidden="true" className="day-accent-top absolute inset-x-8 top-0 h-px" />
            <DayWindowChrome filename="admin.sh" />

            <div className="px-6 py-7 sm:px-8">
              <span className="day-mono-label">[RESTRICTED] · AREA ADMIN</span>
              <h1 className="mt-3 font-day-sans text-[26px] font-semibold leading-[32px] tracking-[-1px] text-white">
                Kode Akses<span className="text-[#0080ff]">.</span>
              </h1>
              <p className="mt-2 font-day-sans text-[14px] leading-[21px] text-[#a2a2a2]">
                Masukkan kode akses admin untuk masuk. Tidak ada username atau password.
              </p>

              {error ? (
                <div
                  role="alert"
                  className="mt-5 rounded-[4px] border border-[#4d1f1f] bg-[#1a0d0d] px-3.5 py-2.5 font-day-code text-[12px] leading-[18px] text-[#ff6b6b]"
                >
                  <span className="text-[#585858]">error:</span> {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label htmlFor="admin-code" className={labelClass}>
                    Kode Akses
                  </label>
                  <input
                    id="admin-code"
                    type="password"
                    autoComplete="off"
                    placeholder="••••••••"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    autoFocus
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#0080ff] px-6 font-day-mono text-[16px] leading-none tracking-[-0.16px] text-white transition-colors duration-250 hover:bg-[#0066dd] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Memproses...' : 'Masuk sebagai Admin'}
                  {!isLoading ? <ArrowRightIcon className="h-4 w-4" /> : null}
                </button>
              </form>
            </div>

            <div className="flex h-[30px] items-center justify-between border-t border-[#1c1c1c] px-4">
              <span className="font-day-mono text-[11px] uppercase tracking-[0.22px] text-[#585858]">
                auth · admin
              </span>
              <span className="flex items-center gap-1.5 font-day-mono text-[11px] text-[#585858]">
                <span className="size-[6px] rounded-full bg-[#2ecc71]" />
                koneksi aman
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
