'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Button } from '@heroui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Github,
  GitBranch,
  GitPullRequest,
  Code2,
  MessageSquare,
  Users,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  Star,
  Zap,
  Shield,
  Terminal,
  FolderGit2,
  Eye,
  ClipboardCheck,
  Rocket,
  GraduationCap,
} from 'lucide-react';
import { ProjectGallery } from '@/components/gallery';

export default function LandingPage() {
  const { data: session } = useSession();
  const heroRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const getDashboardUrl = () => {
    switch (session?.user?.role) {
      case 'MAHASISWA': return '/mahasiswa/dashboard';
      case 'DOSEN_PENGUJI': return '/dosen/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  const navLinks = [
    { label: 'Fitur', href: '#features' },
    { label: 'GitHub', href: '#github' },
    { label: 'Gallery', href: '#gallery' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] overflow-x-hidden">
      {/* Colorful Background Gradient */}
      <div className="fixed inset-0 -z-10">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/30 to-cyan-400/30 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-sky-400/30 to-indigo-400/30 dark:from-sky-600/20 dark:to-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-gradient-to-r from-cyan-400/20 to-teal-400/20 dark:from-cyan-600/10 dark:to-teal-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-3 sm:mx-6 mt-3 sm:mt-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg shadow-neutral-200/20 dark:shadow-neutral-900/20">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
                  capstone
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {session ? (
                  <Link href={getDashboardUrl()} className="hidden sm:block">
                    <Button
                      size="sm"
                      className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" className="hidden sm:block">
                    <Button
                      size="sm"
                      className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                    >
                      Masuk
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="md:hidden mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex flex-col gap-1">
                  {navLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <Link href={session ? getDashboardUrl() : '/login'} onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                        {session ? 'Dashboard' : 'Masuk'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200/50 dark:border-amber-700/30">
              <Sparkles size={14} className="text-amber-500" />
              Prodi Informatika UNISMUH Makassar
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            <span className="text-neutral-900 dark:text-white">Kelola Skripsi</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">
              Tanpa Ribet
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Platform all-in-one untuk submission, review, dan penilaian capstone project. 
            Terintegrasi langsung dengan <span className="text-neutral-900 dark:text-white font-semibold">GitHub</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href={session ? getDashboardUrl() : '/login'}>
              <Button
                size="lg"
                className="w-full sm:w-auto font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 h-12 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all"
                endContent={<ArrowRight size={18} />}
              >
                {session ? 'Buka Dashboard' : 'Mulai Sekarang'}
              </Button>
            </Link>
            <a href="#github">
              <Button
                size="lg"
                variant="bordered"
                className="w-full sm:w-auto font-semibold border-2 border-neutral-300 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-8 h-12 transition-all"
                startContent={<Github size={18} />}
              >
                Lihat Integrasi
              </Button>
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm"
          >
            <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              Gratis
            </span>
            <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CheckCircle2 size={12} className="text-blue-600 dark:text-blue-400" />
              </div>
              GitHub Connected
            </span>
            <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <CheckCircle2 size={12} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              Real-time Review
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-200/50 dark:border-blue-700/30 mb-4">
              <Zap size={14} className="text-blue-500" />
              Fitur Lengkap
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Semua yang Kamu Butuhkan
            </h2>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 - GitHub Integration (Large Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-2 lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white relative overflow-hidden group"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <GitBranch size={28} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">GitHub Integration</h3>
                <p className="text-white/80 leading-relaxed max-w-lg text-base">
                  Connect repository GitHub langsung ke platform. Review code, lihat commits, 
                  dan track progress development secara real-time dengan inline comments.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  {['OAuth Login', 'Code Viewer', 'Inline Comments', 'Fork to Org'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Feature 2 - Form Persyaratan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/50 dark:border-amber-800/30 group hover:shadow-lg hover:shadow-amber-500/10 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
                <ClipboardCheck size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Form Persyaratan</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Isi persyaratan akademik, teknis, dan analisis project secara terstruktur dengan progress tracking.
              </p>
            </motion.div>

            {/* Feature 3 - Dokumen Pelengkap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30 group hover:shadow-lg hover:shadow-blue-500/10 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                <Upload size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Dokumen Pelengkap</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Upload dokumen stakeholder seperti tanda tangan, surat persetujuan, dan dokumen pendukung lainnya.
              </p>
            </motion.div>

            {/* Feature 4 - Screenshot Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-200/50 dark:border-rose-800/30 group hover:shadow-lg hover:shadow-rose-500/10 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/30">
                <ImageIcon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Screenshot Gallery</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Upload screenshot aplikasi untuk showcase. Project terbaik akan ditampilkan di landing page.
              </p>
            </motion.div>

            {/* Feature 5 - Rubrik Penilaian */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/50 dark:border-emerald-800/30 group hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                <Star size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Rubrik Penilaian</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Sistem penilaian dengan rubrik terstandar yang transparan dan objektif dari dosen penguji.
              </p>
            </motion.div>

            {/* Feature 6 - Kolaborasi Tim */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border border-cyan-200/50 dark:border-cyan-800/30 group hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Kolaborasi Tim</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Undang anggota tim via NIM. Sistem invitation untuk kolaborasi project bersama.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GitHub Section */}
      <section id="github" className="py-20 sm:py-28 px-4 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900/50 dark:to-neutral-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold mb-6">
                <Github size={14} />
                Deep Integration
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                <span className="text-neutral-900 dark:text-white">GitHub</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Terintegrasi Penuh
                </span>
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
                Tidak perlu berpindah platform. Semua aktivitas development bisa di-review 
                langsung dari dalam aplikasi dengan fitur code viewer dan inline commenting.
              </p>

              {/* GitHub Features List */}
              <div className="space-y-4">
                {[
                  { icon: Terminal, text: 'Login dengan GitHub OAuth', color: 'from-blue-500 to-cyan-600' },
                  { icon: FolderGit2, text: 'Pilih repository dari akun GitHub', color: 'from-sky-500 to-blue-600' },
                  { icon: Code2, text: 'Code viewer dengan syntax highlighting', color: 'from-emerald-500 to-teal-600' },
                  { icon: MessageSquare, text: 'Inline comments per baris kode', color: 'from-amber-500 to-orange-600' },
                  { icon: GitPullRequest, text: 'Fork otomatis ke organization prodi', color: 'from-cyan-500 to-blue-600' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon size={20} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Code Preview Mock */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-3xl -z-10" />
              <div className="rounded-2xl bg-[#1e1e1e] border border-neutral-700 overflow-hidden shadow-2xl">
                {/* Window Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-700 bg-[#252526]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-neutral-400 ml-2 font-mono">src/app/page.tsx</span>
                </div>
                {/* Code Content */}
                <div className="p-4 font-mono text-sm overflow-x-auto">
                  <div className="flex">
                    <div className="text-neutral-600 select-none pr-4 text-right" style={{ minWidth: '2.5rem' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <div key={n}>{n}</div>
                      ))}
                    </div>
                    <div className="text-neutral-300">
                      <div><span className="text-pink-400">export default</span> <span className="text-blue-400">function</span> <span className="text-yellow-400">Page</span>() {'{'}</div>
                      <div className="pl-4"><span className="text-pink-400">return</span> (</div>
                      <div className="pl-8"><span className="text-neutral-500">{'<'}</span><span className="text-emerald-400">div</span><span className="text-neutral-500">{'>'}</span></div>
                      <div className="pl-12 bg-amber-500/10 -mx-4 px-4 border-l-2 border-amber-400">
                        <span className="text-neutral-500">{'<'}</span><span className="text-emerald-400">h1</span><span className="text-neutral-500">{'>'}</span>
                        <span className="text-amber-300">Hello World</span>
                        <span className="text-neutral-500">{'</'}</span><span className="text-emerald-400">h1</span><span className="text-neutral-500">{'>'}</span>
                      </div>
                      <div className="pl-8"><span className="text-neutral-500">{'</'}</span><span className="text-emerald-400">div</span><span className="text-neutral-500">{'>'}</span></div>
                      <div className="pl-4">)</div>
                      <div>{'}'}</div>
                      <div className="text-neutral-600">&nbsp;</div>
                    </div>
                  </div>
                </div>
                {/* Comment */}
                <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border border-blue-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-[10px] font-bold text-white">D</div>
                    <span className="text-xs font-semibold text-blue-300">Dosen Penguji</span>
                    <span className="text-xs text-neutral-500">2 jam lalu</span>
                  </div>
                  <p className="text-xs text-neutral-300">Bagus! Tapi coba tambahkan styling untuk heading ini.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-200/50 dark:border-rose-700/30 mb-4">
              <Eye size={14} className="text-rose-500" />
              Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
              Karya Mahasiswa
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
              Project-project capstone terbaik yang telah disetujui dan layak untuk dijadikan inspirasi.
            </p>
          </motion.div>

          <ProjectGallery limit={8} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900/50 dark:to-neutral-950/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/50 dark:border-emerald-700/30 mb-4">
              <Rocket size={14} className="text-emerald-500" />
              Langkah Mudah
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
              Cara Kerjanya
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Empat langkah mudah menuju kelulusan
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Daftar', desc: 'Login dengan NIM terdaftar', color: 'from-blue-500 to-cyan-600' },
              { num: '02', title: 'Buat Project', desc: 'Hubungkan dengan GitHub', color: 'from-sky-500 to-blue-600' },
              { num: '03', title: 'Lengkapi', desc: 'Isi persyaratan & upload dokumen', color: 'from-amber-500 to-orange-600' },
              { num: '04', title: 'Submit', desc: 'Kirim untuk direview dosen', color: 'from-emerald-500 to-teal-600' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {step.num}
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{step.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white text-center overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <GraduationCap size={32} />
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Siap untuk Memulai?
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Bergabung sekarang dan kelola capstone project kamu dengan lebih mudah.
              </p>
              
              <Link href={session ? getDashboardUrl() : '/login'}>
                <Button
                  size="lg"
                  className="font-semibold bg-white text-blue-700 hover:bg-neutral-100 px-8 h-12 shadow-xl"
                  endContent={<ArrowRight size={18} />}
                >
                  {session ? 'Buka Dashboard' : 'Mulai Sekarang'}
                </Button>
              </Link>

              <p className="mt-6 text-sm text-white/60 flex items-center justify-center gap-2">
                <Shield size={14} />
                Gratis untuk semua mahasiswa Prodi Informatika
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
              <span className="font-semibold text-neutral-900 dark:text-white">capstone</span>
            </div>
            
            <p className="text-sm text-neutral-500 text-center">
              © 2026 Prodi Informatika UNISMUH Makassar
            </p>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
