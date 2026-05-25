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
  ArrowUpRight,
  Sparkles,
  User,
  ArrowLeft,
  Shield,
  BookOpen,
  UserRound,
  Asterisk,
  Github,
  GraduationCap,
  Layers,
} from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '' });

  const callbackError = searchParams.get('error');
  const isDev = process.env.NODE_ENV === 'development';

  const devAccounts = [
    { label: 'Admin', username: 'devnolife', password: 'hanyaAdmin@25', icon: Shield, color: 'var(--ae-coral)' },
    { label: 'Dosen', username: 'dosen', password: 'password123', icon: BookOpen, color: 'var(--ae-cobalt)' },
    { label: 'Mahasiswa', username: 'mahasiswa', password: 'password123', icon: UserRound, color: 'var(--ae-lime)' },
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Top meta */}
      <div className="flex items-center justify-between mb-10 font-mono-display text-[10px] uppercase tracking-[0.2em] opacity-70">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[var(--ae-coral)] transition-colors">
          <ArrowLeft size={12} /> Beranda
        </Link>
        <span>auth · v3</span>
      </div>

      {/* Sticker */}
      <motion.span
        initial={{ scale: 0.9, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: -3, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="ae-sticker inline-flex mb-6"
      >
        <Sparkles size={12} /> Welcome back
      </motion.span>

      <h1 className="font-sans-display font-semibold leading-[0.95] tracking-[-0.035em] text-5xl sm:text-6xl">
        Masuk
        <br />
        <span className="font-serif-display italic text-[var(--ae-coral)]">capstone</span>
        <span aria-hidden className="inline-block w-3 h-3 rounded-full bg-[var(--ae-lime)] border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] translate-y-[-0.4em] ml-1" />
      </h1>
      <p className="mt-4 opacity-75">
        Pakai akun kampus kamu. Auto-sync dengan{' '}
        <em className="font-serif-display">SIMIKAD</em>.
      </p>

      {(error || callbackError) && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 px-4 py-3 border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] rounded-2xl bg-[var(--ae-coral)] text-white text-sm font-medium shadow-[3px_3px_0_0_var(--ae-ink)] dark:shadow-[3px_3px_0_0_var(--ae-cream)]"
        >
          {error || 'Terjadi kesalahan saat login.'}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block font-mono-display text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2">
            Username / NIM
          </label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              placeholder="ex: 123456789"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              autoComplete="username"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] bg-[var(--ae-cream)] dark:bg-[var(--ae-ink-2)] text-current placeholder:opacity-40 focus:outline-none focus:shadow-[4px_4px_0_0_var(--ae-ink)] dark:focus:shadow-[4px_4px_0_0_var(--ae-cream)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono-display text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] bg-[var(--ae-cream)] dark:bg-[var(--ae-ink-2)] text-current placeholder:opacity-40 focus:outline-none focus:shadow-[4px_4px_0_0_var(--ae-ink)] dark:focus:shadow-[4px_4px_0_0_var(--ae-cream)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--ae-lime)] hover:text-[var(--ae-ink)] transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="ae-btn ae-btn-lime w-full justify-center !py-4 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" color="current" /> Memproses...
            </>
          ) : (
            <>
              Masuk <ArrowUpRight size={18} />
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
          <div className="flex items-center gap-3 mb-3 font-mono-display text-[10px] uppercase tracking-[0.2em] opacity-60">
            <span className="h-px flex-1 bg-current" />
            <span className="px-2 py-0.5 rounded-full border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] bg-[var(--ae-peach)] text-[var(--ae-ink)]">
              Dev mode
            </span>
            <span className="h-px flex-1 bg-current" />
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
                  className="group flex flex-col items-center gap-1.5 py-3 rounded-2xl border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] bg-[var(--ae-cream)] dark:bg-[var(--ae-ink-2)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--ae-ink)] dark:hover:shadow-[3px_3px_0_0_var(--ae-cream)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)]"
                    style={{ background: acc.color }}
                  >
                    <Icon size={13} color="#0e0e10" />
                  </span>
                  <span className="font-mono-display text-[10px] uppercase tracking-widest">{acc.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      <p className="mt-8 text-center text-xs opacity-60">
        Ada kendala? Hubungi <span className="underline decoration-dashed">administrator prodi</span>.
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex ae-bg-cream dark:ae-bg-ink ae-text-ink dark:ae-text-cream overflow-hidden">
      {/* Atmospheric blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="ae-blob" style={{ top: '-15%', left: '-10%', width: '38rem', height: '38rem', background: 'radial-gradient(circle, var(--ae-lime), transparent 65%)' }} />
        <div className="ae-blob" style={{ bottom: '-20%', right: '-10%', width: '42rem', height: '42rem', background: 'radial-gradient(circle, var(--ae-coral), transparent 65%)' }} />
      </div>

      {/* ============ LEFT — Editorial Branding ============ */}
      <aside className="hidden lg:flex lg:w-[52%] relative p-10 flex-col justify-between border-r-[1.5px] ae-border-ink dark:border-[var(--ae-cream)]">
        {/* Top row */}
        <div className="flex items-center justify-between font-mono-display text-[11px] uppercase tracking-[0.2em] opacity-80">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Capstone" width={32} height={32} className="rounded-md" />
            <span className="font-serif-display italic text-lg normal-case tracking-normal">
              capstone<span className="text-[var(--ae-coral)]">.</span>
            </span>
          </Link>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> live
          </span>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <motion.span
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: -4, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.7 }}
            className="ae-sticker mb-6"
          >
            <Asterisk size={12} /> Capstone OS · 2026
          </motion.span>

          <h1 className="font-sans-display font-semibold tracking-[-0.04em] leading-[0.92] text-[clamp(2.8rem,5.5vw,4.5rem)]">
            Build, ship,
            <br />
            <span className="font-serif-display italic">defend</span>{' '}
            <span className="ae-underline-scribble">capstone</span>
            <br />
            tanpa <span className="font-serif-display italic opacity-80">drama</span>.
          </h1>

          <p className="mt-6 max-w-md opacity-75 text-lg">
            Workspace satu pintu — submit dokumen, hubungkan GitHub,
            dan dapatkan review real-time dari dosen pembimbing.
          </p>

          {/* Mini feature row */}
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: Github, label: 'GitHub sync' },
              { icon: GraduationCap, label: 'SIMIKAD' },
              { icon: Layers, label: 'SIMTEKMU' },
            ].map((f) => (
              <div
                key={f.label}
                className="px-3 py-3 rounded-2xl border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] bg-[var(--ae-cream-2)] dark:bg-[var(--ae-ink-2)] flex flex-col items-start gap-2"
              >
                <f.icon size={16} />
                <span className="font-mono-display text-[10px] uppercase tracking-widest">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between font-mono-display text-[10px] uppercase tracking-[0.2em] opacity-60">
          <p>Prodi Informatika · Unismuh Makassar</p>
          <p>v3 — Acid Edition</p>
        </div>
      </aside>

      {/* ============ RIGHT — Form ============ */}
      <main className="w-full lg:w-[48%] flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2.5">
          <Image src="/logo.png" alt="Capstone" width={30} height={30} className="rounded-md" />
          <span className="font-serif-display italic text-lg">
            capstone<span className="text-[var(--ae-coral)]">.</span>
          </span>
        </Link>

        <Suspense fallback={<Spinner size="lg" />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
