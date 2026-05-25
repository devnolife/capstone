'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import {
  ArrowUpRight,
  Github,
  FileText,
  Users,
  GitBranch,
  Upload,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Layers,
  Moon,
  Sun,
  Eye,
  Asterisk,
  Star,
  Zap,
  ArrowDown,
} from 'lucide-react';
import { ProjectGallery } from '@/components/gallery';

/* ---------- Scroll progress bar ---------- */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return <motion.div className="ae-progress" style={{ scaleX, right: 0 }} />;
}

/* ---------- Magnetic button wrapper ---------- */
function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.6 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: 'inline-flex' }}
    >
      {children}
    </motion.span>
  );
}

/* ---------- Mouse-tracked spotlight ---------- */
function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const handler = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    parent.addEventListener('mousemove', handler);
    return () => parent.removeEventListener('mousemove', handler);
  }, []);
  return <div ref={ref} className="ae-spotlight" />;
}

/* ---------- 3D tilt card (mouse follow) ---------- */
function TiltCard({ children, className = '', maxTilt = 8 }: { children: React.ReactNode; className?: string; maxTilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * maxTilt}deg) rotateX(${-py * maxTilt}deg)`;
    },
    [maxTilt],
  );
  const reset = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`ae-tilt ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Marquee strip ---------- */
function MarqueeStrip() {
  const items = [
    'CAPSTONE 2026',
    'PRODI INFORMATIKA',
    'UNIVERSITAS MUHAMMADIYAH MAKASSAR',
    'BUILD · SHIP · DEFEND',
    'GITHUB INTEGRATED',
    'REAL-TIME REVIEW',
  ];
  return (
    <div className="ae-marquee py-4 border-y-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] bg-[var(--ae-lime)] text-[var(--ae-ink)]">
      {[0, 1].map((dup) => (
        <div key={dup} className="ae-marquee-track" aria-hidden={dup === 1}>
          {items.map((t, i) => (
            <span key={`${dup}-${i}`} className="flex items-center gap-12 text-sm font-mono-display font-semibold tracking-widest">
              {t}
              <Asterisk size={18} strokeWidth={2.4} className="ae-spin-slow" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Counter animation ---------- */
function Counter({ value, suffix = '+' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (value === 0) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const dur = 1400;
            const start = performance.now();
            let raf = 0;
            const tick = (t: number) => {
              const p = Math.min((t - start) / dur, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setN(Math.round(value * eased));
              if (p < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            return () => cancelAnimationFrame(raf);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // hero parallax
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0.4]);
  const decoRotate = useTransform(heroProgress, [0, 1], [0, 90]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalMahasiswa: 0,
    successRate: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) setStats(await res.json());
      } catch (e) {
        console.error('stats error', e);
      }
    })();
  }, []);

  const getDashboardUrl = () => {
    switch (session?.user?.role) {
      case 'MAHASISWA':
        return '/mahasiswa/dashboard';
      case 'DOSEN_PENGUJI':
        return '/dosen/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen ae-bg-cream dark:ae-bg-ink ae-text-ink dark:ae-text-cream overflow-x-hidden ae-noise">
      <ScrollProgress />

      {/* Atmospheric blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="ae-blob" style={{ top: '-10%', left: '-8%', width: '40rem', height: '40rem', background: 'radial-gradient(circle, var(--ae-lime), transparent 65%)' }} />
        <div className="ae-blob" style={{ top: '30%', right: '-12%', width: '36rem', height: '36rem', background: 'radial-gradient(circle, var(--ae-coral), transparent 65%)' }} />
        <div className="ae-blob" style={{ bottom: '-20%', left: '20%', width: '46rem', height: '46rem', background: 'radial-gradient(circle, var(--ae-cobalt), transparent 70%)', opacity: 0.35 }} />
      </div>

      {/* ============ NAV ============ */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(92%,1180px)]"
      >
        <div className="flex items-center justify-between px-3 py-2 rounded-full border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] bg-[var(--ae-cream)]/85 dark:bg-[var(--ae-ink-2)]/85 backdrop-blur-xl shadow-[4px_4px_0_0_var(--ae-ink)] dark:shadow-[4px_4px_0_0_var(--ae-cream)]">
          <Link href="/" className="flex items-center gap-2.5 pl-3 group">
            <div className="relative">
              <Image src="/logo.png" alt="Capstone" width={30} height={30} className="rounded-md transition-transform group-hover:rotate-[12deg]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--ae-lime)] border border-[var(--ae-ink)] animate-pulse" />
            </div>
            <span className="font-serif-display italic text-xl">capstone<span className="text-[var(--ae-coral)]">.</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1 font-mono-display text-[11px] tracking-widest uppercase">
            {[
              { h: '#stats', l: 'Stats' },
              { h: '#showcase', l: 'Showcase' },
              { h: '#features', l: 'Tools' },
              { h: '#integrations', l: 'Stack' },
            ].map((it) => (
              <a
                key={it.h}
                href={it.h}
                className="px-3 py-2 rounded-full hover:bg-[var(--ae-lime)] hover:text-[var(--ae-ink)] transition-colors"
              >
                {it.l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="w-9 h-9 rounded-full border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] flex items-center justify-center hover:bg-[var(--ae-lime)] hover:text-[var(--ae-ink)] hover:rotate-180 transition-all duration-500"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}
            <Magnetic>
              {session ? (
                <Link href={getDashboardUrl()} className="ae-btn ae-btn-lime !py-2 !px-4 !text-sm">
                  Dashboard <ArrowUpRight size={15} />
                </Link>
              ) : (
                <Link href="/login" className="ae-btn ae-btn-lime !py-2 !px-4 !text-sm">
                  Masuk <ArrowUpRight size={15} />
                </Link>
              )}
            </Magnetic>
          </div>
        </div>
      </motion.nav>

      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative pt-36 pb-16 px-6 min-h-[100svh]">
        <Spotlight />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-[1180px] mx-auto relative z-10">
          {/* meta row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-10 font-mono-display text-[11px] uppercase tracking-[0.18em] opacity-70"
          >
            <span className="flex items-center gap-2">
              <motion.span style={{ rotate: decoRotate }} className="inline-block">
                <Asterisk size={12} />
              </motion.span>
              EST. 2026 · Makassar, ID
            </span>
            <span className="hidden sm:inline">Vol. 01 — Skripsi &amp; Capstone Edition</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live · {mounted && new Date().getFullYear()}
            </span>
          </motion.div>

          {/* Sticker badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-block mb-8"
          >
            <span className="ae-sticker ae-pulse-hover">
              <Sparkles size={13} /> New · Capstone OS v3
            </span>
          </motion.div>

          {/* Headline with staggered char reveal */}
          <h1 className="font-sans-display font-semibold leading-[0.92] tracking-[-0.04em] text-[clamp(2.6rem,8.5vw,7.5rem)]">
            <span className="block ae-reveal" style={{ animationDelay: '0.1s' }}>
              Submit. Review.
            </span>
            <span className="block ae-reveal" style={{ animationDelay: '0.25s' }}>
              <span className="font-serif-display italic text-[var(--ae-coral)]">ship</span>{' '}
              <span className="ae-underline-scribble">capstone</span>{' '}
              <span className="inline-flex items-baseline gap-2">
                project
                <motion.span
                  aria-hidden
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-[0.55em] h-[0.55em] rounded-full bg-[var(--ae-lime)] border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] translate-y-[-0.05em]"
                />
              </span>
            </span>
            <span className="block font-serif-display italic opacity-80 ae-reveal" style={{ animationDelay: '0.4s' }}>
              tanpa drama.
            </span>
          </h1>

          {/* Description + CTA + side card */}
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="lg:col-span-7"
            >
              <p className="text-lg sm:text-xl leading-relaxed max-w-xl opacity-80">
                Satu workspace untuk mahasiswa, dosen, dan admin — upload dokumen,
                hubungkan repo GitHub, dapatkan review yang specific &amp; on-time.
                Built for the next-gen of <em className="font-serif-display">builders</em>.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Magnetic>
                  {session ? (
                    <Link href={getDashboardUrl()} className="ae-btn ae-btn-lime ae-shine">
                      Buka Dashboard <ArrowUpRight size={18} />
                    </Link>
                  ) : (
                    <Link href="/login" className="ae-btn ae-btn-lime ae-shine">
                      Start Submitting <ArrowUpRight size={18} />
                    </Link>
                  )}
                </Magnetic>
                <Magnetic strength={0.2}>
                  <a href="#showcase" className="ae-btn ae-btn-ghost">
                    <Eye size={17} /> Lihat showcase
                  </a>
                </Magnetic>
              </div>

              <div className="mt-10 flex items-center gap-4 font-mono-display text-xs uppercase tracking-widest opacity-70">
                <div className="flex -space-x-2">
                  {['#d4ff3a', '#ff5b3a', '#2541ff', '#ffd4b0'].map((c, i) => (
                    <motion.span
                      key={c}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8 + i * 0.08, type: 'spring' }}
                      className="w-7 h-7 rounded-full border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)]"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <span>
                  Joined by <b className="font-sans-display">{stats.totalMahasiswa || '200'}+</b> mahasiswa aktif
                </span>
              </div>
            </motion.div>

            {/* Side editorial card with tilt */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 2 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="lg:col-span-5"
            >
              <TiltCard>
                <div className="ae-card p-6 relative">
                  <span
                    className="ae-sticker absolute -top-4 -left-3 !bg-[var(--ae-coral)] !text-white ae-float"
                    style={{ transform: 'rotate(-6deg)' }}
                  >
                    <Zap size={12} /> Workflow
                  </span>
                  <div className="font-mono-display text-[10px] uppercase tracking-widest opacity-60 mb-4">
                    // bagaimana ini bekerja
                  </div>
                  <ol className="space-y-4">
                    {[
                      { n: '01', t: 'Connect GitHub repo', d: 'Auto-sync commit & branch ke project.' },
                      { n: '02', t: 'Upload dokumen', d: 'Proposal, BAB, hasil — semua terorganisir.' },
                      { n: '03', t: 'Review real-time', d: 'Inline comment dari dosen pembimbing.' },
                      { n: '04', t: 'Sidang & publish', d: 'Nilai keluar, project tampil di gallery.' },
                    ].map((s) => (
                      <li key={s.n} className="flex gap-4 group cursor-default">
                        <span className="font-serif-display italic text-2xl opacity-50 w-8 group-hover:text-[var(--ae-coral)] group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                          {s.n}
                        </span>
                        <div className="flex-1 border-b border-dashed border-current/20 pb-3 group-hover:border-current/40 transition-colors">
                          <p className="font-semibold tracking-tight">{s.t}</p>
                          <p className="text-sm opacity-70">{s.d}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </TiltCard>
            </motion.div>
          </div>

          {/* Scroll cue */}
          <motion.a
            href="#stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 flex-col items-center gap-2 font-mono-display text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition"
          >
            <span>Scroll</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowDown size={14} />
            </motion.span>
          </motion.a>
        </motion.div>
      </section>

      {/* ============ MARQUEE ============ */}
      <MarqueeStrip />

      {/* ============ STATS ============ */}
      <section id="stats" className="relative py-24 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
            <div>
              <span className="ae-section-num">§01</span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                className="font-sans-display text-3xl sm:text-5xl font-semibold tracking-[-0.03em] mt-1"
              >
                The <span className="font-serif-display italic text-[var(--ae-cobalt)] dark:text-[var(--ae-lime)]">numbers</span>, untuk yang skeptis.
              </motion.h2>
            </div>
            <p className="max-w-sm opacity-70">
              Data live dari database, di-refresh setiap kali kamu buka halaman ini.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { label: 'Total Projects', value: stats.totalProjects || 48, icon: <FileText size={22} />, accent: 'var(--ae-lime)' },
              { label: 'Mahasiswa Aktif', value: stats.totalMahasiswa || 215, icon: <Users size={22} />, accent: 'var(--ae-coral)' },
              { label: 'Success Rate', value: stats.successRate || 96, icon: <TrendingUp size={22} />, accent: 'var(--ae-cobalt)', suffix: '%' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <TiltCard maxTilt={6}>
                  <div className="ae-card p-7 relative overflow-hidden ae-shine">
                    <motion.div
                      className="absolute -top-12 -right-12 w-40 h-40 rounded-full"
                      style={{ background: s.accent, opacity: 0.35 }}
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ duration: 5, repeat: Infinity, delay: i * 0.4 }}
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6 font-mono-display text-[10px] uppercase tracking-widest opacity-60">
                        <span>0{i + 1} / 03</span>
                        {s.icon}
                      </div>
                      <p className="ae-num-display text-6xl">
                        <Counter value={s.value} suffix={s.suffix ?? '+'} />
                      </p>
                      <p className="mt-2 font-serif-display italic text-lg">{s.label}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SHOWCASE ============ */}
      <section id="showcase" className="relative py-24 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
            <div>
              <span className="ae-section-num">§02</span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-sans-display text-3xl sm:text-5xl font-semibold tracking-[-0.03em] mt-1"
              >
                Karya yang <span className="font-serif-display italic">benar-benar</span> jadi.
              </motion.h2>
              <p className="mt-3 max-w-md opacity-70">
                Project mahasiswa yang sudah lulus sidang — open for inspiration.
              </p>
            </div>
            <Link href="/login" className="hidden sm:inline-flex ae-link font-mono-display text-xs uppercase tracking-widest">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="ae-card p-4 sm:p-6"
          >
            <ProjectGallery limit={9} />
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES (asymmetric bento) ============ */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className="mb-12">
            <span className="ae-section-num">§03</span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-sans-display text-3xl sm:text-5xl font-semibold tracking-[-0.03em] mt-1 max-w-3xl"
            >
              Tools yang bikin capstone <span className="font-serif-display italic text-[var(--ae-coral)]">terasa ringan</span> — bukan ribet.
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-6 gap-5">
            {/* Big feature */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="md:col-span-4 md:row-span-2"
            >
              <TiltCard maxTilt={5}>
                <div className="ae-card p-8 flex flex-col justify-between min-h-[360px] relative overflow-hidden ae-shine">
                  <div className="absolute top-6 right-6 ae-sticker !bg-[var(--ae-cobalt)] !text-white">
                    <Star size={12} /> Flagship
                  </div>
                  <motion.div
                    className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[var(--ae-cobalt)] opacity-20 blur-2xl"
                    animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                  <div className="relative">
                    <GitBranch size={36} strokeWidth={1.8} />
                    <h3 className="font-sans-display text-3xl sm:text-4xl font-semibold tracking-tight mt-6 max-w-md">
                      GitHub-native review.{' '}
                      <span className="font-serif-display italic opacity-70">No more zip files.</span>
                    </h3>
                    <p className="mt-3 opacity-70 max-w-md">
                      Connect repo → commit auto-tracked → dosen kasih inline comment langsung di kode.
                      Workflow professional, sejak hari pertama.
                    </p>
                  </div>
                  <div className="relative mt-8 font-mono-display text-xs uppercase tracking-widest flex items-center gap-3 opacity-70">
                    <span className="w-8 h-px bg-current" />
                    Integrated · Webhooks · Branch tracking
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {[
              { icon: <Upload size={26} />, t: 'Smart Upload', d: 'Drag, drop, done. Auto-validation file BAB.' },
              { icon: <MessageSquare size={26} />, t: 'Inline Feedback', d: 'Komentar dosen jadi actionable to-do.' },
              { icon: <Layers size={26} />, t: 'Rubrik Transparan', d: 'Tau persis dinilai dari aspek apa.' },
              { icon: <CheckCircle2 size={26} />, t: 'Track Progress', d: 'Dashboard visual untuk monitor status.' },
            ].map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: 0.05 * i, duration: 0.5 }}
                className="md:col-span-2"
              >
                <TiltCard maxTilt={7}>
                  <div className="ae-card p-6 h-full ae-shine">
                    <div className="flex items-start justify-between">
                      {f.icon}
                      <span className="font-mono-display text-[10px] uppercase tracking-widest opacity-50">0{i + 2}</span>
                    </div>
                    <h3 className="mt-6 font-sans-display text-xl font-semibold tracking-tight">{f.t}</h3>
                    <p className="mt-1.5 text-sm opacity-70">{f.d}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INTEGRATIONS ============ */}
      <section id="integrations" className="relative py-24 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className="ae-grid-asym">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="ae-card p-8"
            >
              <span className="font-mono-display text-[10px] uppercase tracking-widest opacity-60">// stack</span>
              <h3 className="font-sans-display text-3xl font-semibold tracking-tight mt-2">
                Terintegrasi dengan tools <span className="font-serif-display italic">yang penting</span>.
              </h3>
              <p className="mt-3 opacity-70">Tidak ada login berulang, tidak ada data duplikat.</p>
            </motion.div>

            {[
              { icon: <Github size={28} />, n: 'GitHub', d: 'Repo, commit, branch sync.' },
              { icon: <GraduationCap size={28} />, n: 'SIMIKAD', d: 'Data akademik mahasiswa.' },
            ].map((it, i) => (
              <motion.div
                key={it.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <TiltCard maxTilt={8}>
                  <div className="ae-card p-8 flex flex-col justify-between h-full ae-shine">
                    <div className="w-14 h-14 rounded-2xl border-[1.5px] ae-border-ink dark:border-[var(--ae-cream)] flex items-center justify-center bg-[var(--ae-cream-2)] dark:bg-[var(--ae-ink)]">
                      {it.icon}
                    </div>
                    <div className="mt-6">
                      <p className="font-sans-display text-xl font-semibold tracking-tight">{it.n}</p>
                      <p className="text-sm opacity-70">{it.d}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-5 ae-card p-6 flex items-center justify-between gap-4 flex-wrap ae-shine"
          >
            <div className="flex items-center gap-4">
              <Layers size={26} />
              <div>
                <p className="font-sans-display text-lg font-semibold">SIMTEKMU</p>
                <p className="text-sm opacity-70">Sinkronisasi prodi & data dosen pembimbing.</p>
              </div>
            </div>
            <span className="ae-sticker">Active</span>
          </motion.div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-28 px-6">
        <div className="max-w-[1180px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative ae-card p-10 sm:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 -z-0 opacity-80">
              <motion.div
                className="ae-blob"
                style={{ top: '-30%', left: '50%', width: '30rem', height: '30rem', background: 'radial-gradient(circle, var(--ae-lime), transparent 60%)' }}
                animate={{ x: ['-50%', '-40%', '-50%'], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>

            <span className="ae-sticker mb-6 !bg-[var(--ae-coral)] !text-white ae-float">
              <Sparkles size={12} /> Ready when you are
            </span>

            <h2 className="relative font-sans-display text-4xl sm:text-6xl font-semibold leading-[1] tracking-[-0.03em]">
              Capstone-mu <span className="font-serif-display italic">deserve</span>
              <br />
              workflow yang serius.
            </h2>

            <p className="relative mt-6 max-w-xl mx-auto opacity-75">
              Login dengan akun kampus. Tim kami siap kalau ada masalah teknis,
              biar fokus kamu cuma satu: build sesuatu yang keren.
            </p>

            <div className="relative mt-10 flex justify-center gap-3 flex-wrap">
              <Magnetic>
                {session ? (
                  <Link href={getDashboardUrl()} className="ae-btn ae-btn-lime ae-shine">
                    Buka Dashboard <ArrowUpRight size={18} />
                  </Link>
                ) : (
                  <Link href="/login" className="ae-btn ae-btn-lime ae-shine">
                    Login sekarang <ArrowUpRight size={18} />
                  </Link>
                )}
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link href="/register" className="ae-btn ae-btn-ghost">
                  Daftar dulu
                </Link>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative pt-12 pb-10 px-6 border-t-[1.5px] ae-border-ink dark:border-[var(--ae-cream)]">
        <div className="max-w-[1180px] mx-auto">
          {/* Giant wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-sans-display font-semibold tracking-[-0.06em] leading-[0.85] text-[clamp(4rem,18vw,15rem)] select-none"
          >
            capstone<span className="font-serif-display italic text-[var(--ae-coral)]">.</span>
          </motion.div>

          <div className="mt-10 grid sm:grid-cols-3 gap-6 font-mono-display text-xs uppercase tracking-widest opacity-80">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="" width={28} height={28} className="rounded" />
              <span>Prodi Informatika · Unismuh Makassar</span>
            </div>
            <div>
              <p className="opacity-60 mb-2">Made with</p>
              <p>Next.js · Prisma · GitHub API</p>
            </div>
            <div className="sm:text-right">
              <p>&copy; 2026 — All rights reserved.</p>
              <p className="opacity-60 mt-1">v3.0 · Acid Edition</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
