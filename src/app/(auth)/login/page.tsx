'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Spinner } from '@heroui/react';
import {
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  ArrowRight,
  Shield,
  BookOpen,
  UserRound,
  Github,
  GraduationCap,
  Layers,
} from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-input bg-input/30 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-app-teritary-invert outline-none transition-all focus:border-ring focus:ring-[3px] focus:ring-ring/50';

const labelClass =
  'mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-app-teritary-invert';

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '' });

  const callbackError = searchParams.get('error');
  const isDev = process.env.NODE_ENV === 'development';

  const devAccounts = [
    { label: 'Admin', username: 'devnolife', password: 'hanyaAdmin@25', icon: Shield },
    { label: 'Dosen', username: 'dosen', password: 'password123', icon: BookOpen },
    { label: 'Mahasiswa', username: 'mahasiswa', password: 'password123', icon: UserRound },
  ];

  const handleDevLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', { username, password, redirect: false });
      if (result?.error) setError(`Dev login gagal: ${result.error}`);
      else window.location.href = '/dashboard';
    } catch {
      setError('Terjadi kesalahan saat dev login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        if (result.error.includes('SIMAK')) setError(result.error);
        else setError('Username atau password salah.');
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      {/* Top meta */}
      <div className="mb-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-app-teritary-invert">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <ArrowLeft size={12} /> Beranda
        </Link>
        <span>[AUTH] MASUK</span>
      </div>

      <h1 className="font-display text-4xl leading-none font-[450] tracking-tight text-balance sm:text-5xl">
        Masuk ke{' '}
        <span className="font-editorial tracking-tight">capstone</span>
      </h1>
      <p className="mt-4 text-app-secondary-invert">
        Pakai akun kampus kamu. Auto-sync dengan SIMAK.
      </p>

      {(error || callbackError) && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error || 'Terjadi kesalahan saat login.'}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className={labelClass}>Username / NIM</label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-app-teritary-invert"
            />
            <input
              type="text"
              placeholder="ex: 123456789"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              autoComplete="username"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-app-teritary-invert"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-app-teritary-invert transition-colors hover:bg-app-quaternary hover:text-foreground"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" color="current" /> Memproses...
            </>
          ) : (
            <>
              Masuk <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Dev quick logins */}
      {isDev && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-app-teritary-invert">
            <span className="h-px flex-1 bg-zinc-800" />
            <span className="rounded-full border border-zinc-800 px-2.5 py-0.5">Dev mode</span>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {devAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDevLogin(acc.username, acc.password)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-zinc-800 bg-app-quinary py-3 transition-colors hover:bg-app-quaternary disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-app-primary text-foreground">
                    <Icon size={13} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-app-secondary-invert group-hover:text-foreground">
                    {acc.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      <p className="mt-8 text-center text-xs text-app-teritary-invert">
        Ada kendala? Hubungi{' '}
        <span className="underline decoration-border underline-offset-2">administrator prodi</span>.
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ============ LEFT — Branding ============ */}
      <aside className="relative hidden flex-col justify-between border-r border-zinc-800 p-10 lg:flex lg:w-[52%]">
        {/* Top row */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-app-teritary-invert">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Capstone" width={26} height={26} className="rounded-md" />
            <span className="font-editorial text-xl normal-case leading-none tracking-tight text-foreground">
              capstone
            </span>
          </Link>
          <span className="flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-green-500" /> Semester aktif
          </span>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-app-secondary px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-app-primary-invert">
            Prodi Informatika · Unismuh Makassar
          </span>

          <h1 className="font-display text-[clamp(2.6rem,5vw,4.2rem)] leading-[0.95] font-[450] tracking-tight">
            Bangun, rilis,
            <br />
            <span className="font-editorial italic">presentasikan</span> capstone
            <br />
            <span className="text-app-secondary-invert">tanpa drama.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-app-secondary-invert">
            Workspace satu pintu — submit project, hubungkan GitHub, dan dapatkan
            review real-time dari dosen penguji.
          </p>

          {/* Mini feature row */}
          <div className="mt-10 grid max-w-md grid-cols-3 gap-px border border-zinc-800 bg-zinc-800">
            {[
              { icon: Github, label: 'GitHub sync' },
              { icon: GraduationCap, label: 'SIMAK' },
              { icon: Layers, label: 'Rubrik' },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-start gap-2 bg-background px-3 py-3"
              >
                <f.icon size={16} className="text-app-primary-invert" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-app-teritary-invert">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="relative z-10 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-app-teritary-invert">
          <p>Platform Capstone Project</p>
          <p>[01] AUTH</p>
        </div>

        {/* Watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-8 right-4 select-none font-editorial text-[9vw] leading-none tracking-tight text-app-quaternary"
        >
          capstone
        </span>
      </aside>

      {/* ============ RIGHT — Form ============ */}
      <main className="relative flex w-full items-center justify-center p-6 md:p-12 lg:w-[48%]">
        {/* Mobile logo */}
        <Link href="/" className="absolute left-6 top-6 flex items-center gap-2.5 lg:hidden">
          <Image src="/logo.png" alt="Capstone" width={24} height={24} className="rounded-md" />
          <span className="font-editorial text-lg leading-none tracking-tight">capstone</span>
        </Link>

        <Suspense fallback={<Spinner size="lg" />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
