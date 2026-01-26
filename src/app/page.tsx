'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Button } from '@heroui/react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
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
  ArrowUpRight,
  Play,
  ChevronRight,
} from 'lucide-react';
import { ProjectGallery } from '@/components/gallery';

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// 3D Tilt Card Component
const TiltCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      className={`${className}`}
    >
      <div style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  );
};

// Animated counter
const AnimatedNumber = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count}</span>;
};

export default function LandingPage() {
  const { data: session } = useSession();
  const heroRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

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
    <div className="min-h-screen bg-[#020617] overflow-x-hidden">
      {/* Animated Gradient Mesh Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0a1628] to-[#020617]" />
        
        {/* Animated mesh gradients */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-transparent rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-to-l from-violet-600/20 via-blue-500/20 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-to-t from-cyan-600/15 via-emerald-500/10 to-transparent rounded-full blur-[120px]"
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 sm:mx-8 mt-4 sm:mt-6">
          <div className="max-w-6xl mx-auto px-6 py-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={36}
                    height={36}
                    className="object-contain relative"
                  />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">
                  capstone
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="relative px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white rounded-xl transition-all group"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <motion.div
                      className="absolute inset-0 bg-white/[0.05] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      layoutId="navHover"
                    />
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                >
                  {mobileMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
                </button>

                {session ? (
                  <Link href={getDashboardUrl()} className="hidden sm:block">
                    <Button
                      size="sm"
                      className="relative font-semibold text-white px-6 h-10 overflow-hidden group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500" />
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative flex items-center gap-2">
                        Dashboard
                        <ArrowUpRight size={16} />
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" className="hidden sm:block">
                    <Button
                      size="sm"
                      className="relative font-semibold text-white px-6 h-10 overflow-hidden group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500" />
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute inset-[1px] bg-[#020617] rounded-[7px] opacity-0 group-hover:opacity-0" />
                      <span className="relative flex items-center gap-2">
                        Masuk
                        <ArrowUpRight size={16} />
                      </span>
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
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-white/[0.08]"
              >
                <div className="flex flex-col gap-2">
                  {navLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="pt-2 mt-2 border-t border-white/[0.08]">
                    <Link href={session ? getDashboardUrl() : '/login'} onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
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
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative pt-40 sm:pt-48 pb-24 sm:pb-32 px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-amber-400/90 text-sm font-medium">Prodi Informatika UNISMUH Makassar</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
          >
            <span className="text-white">Kelola Skripsi</span>
            <br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                Tanpa Ribet
              </span>
              <motion.span
                className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-emerald-500/20 blur-2xl"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Platform all-in-one untuk submission, review, dan penilaian capstone project. 
            Terintegrasi langsung dengan{' '}
            <span className="text-white font-semibold inline-flex items-center gap-1">
              <Github size={18} className="inline" />
              GitHub
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href={session ? getDashboardUrl() : '/login'}>
              <Button
                size="lg"
                className="relative w-full sm:w-auto font-semibold text-white px-8 h-14 text-base overflow-hidden group"
              >
                {/* Animated gradient border */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
                <span className="absolute inset-[2px] rounded-[10px] bg-[#020617]" />
                <span className="absolute inset-[2px] rounded-[10px] bg-gradient-to-r from-blue-600/50 to-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  {session ? 'Buka Dashboard' : 'Mulai Sekarang'}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </span>
              </Button>
            </Link>
            <a href="#github">
              <Button
                size="lg"
                variant="bordered"
                className="w-full sm:w-auto font-semibold border-white/10 hover:border-white/30 hover:bg-white/[0.03] text-white px-8 h-14 text-base transition-all group"
                startContent={<Github size={18} />}
              >
                <span>Lihat Integrasi</span>
                <ChevronRight size={16} className="ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-16"
          >
            {[
              { value: 100, suffix: '+', label: 'Mahasiswa' },
              { value: 50, suffix: '+', label: 'Project' },
              { value: 99, suffix: '%', label: 'Kepuasan' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  <AnimatedNumber value={stat.value} />{stat.suffix}
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-white/50 rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-24 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Zap size={14} />
              Fitur Lengkap
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Semua yang Kamu
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Butuhkan</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Platform lengkap untuk mengelola capstone project dari awal hingga akhir
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Feature 1 - GitHub Integration (Large Card) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-2 lg:col-span-2"
            >
              <TiltCard className="h-full">
                <div className="relative h-full p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-600/20 via-blue-600/10 to-cyan-600/5 border border-blue-500/20 overflow-hidden group">
                  {/* Glow effect */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-colors duration-700" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                  
                  {/* Animated border gradient */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
                      <GitBranch size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">GitHub Integration</h3>
                    <p className="text-white/60 leading-relaxed max-w-lg text-base sm:text-lg mb-6">
                      Connect repository GitHub langsung ke platform. Review code, lihat commits, 
                      dan track progress development secara real-time.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['OAuth Login', 'Code Viewer', 'Inline Comments', 'Fork to Org'].map((tag) => (
                        <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Feature 2 - Form Persyaratan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TiltCard className="h-full">
                <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 overflow-hidden group hover:border-amber-500/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 group-hover:scale-110 transition-all duration-300">
                      <ClipboardCheck size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Form Persyaratan</h3>
                    <p className="text-white/50 leading-relaxed">
                      Isi persyaratan akademik, teknis, dan analisis project secara terstruktur dengan progress tracking.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Feature 3 - Dokumen Pelengkap */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <TiltCard className="h-full">
                <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 overflow-hidden group hover:border-violet-500/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 group-hover:scale-110 transition-all duration-300">
                      <Upload size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Dokumen Pelengkap</h3>
                    <p className="text-white/50 leading-relaxed">
                      Upload dokumen stakeholder seperti tanda tangan, surat persetujuan, dan dokumen pendukung.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Feature 4 - Screenshot Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TiltCard className="h-full">
                <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/20 overflow-hidden group hover:border-rose-500/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/40 group-hover:scale-110 transition-all duration-300">
                      <ImageIcon size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Screenshot Gallery</h3>
                    <p className="text-white/50 leading-relaxed">
                      Upload screenshot aplikasi untuk showcase. Project terbaik ditampilkan di landing page.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Feature 5 - Rubrik Penilaian */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <TiltCard className="h-full">
                <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 overflow-hidden group hover:border-emerald-500/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
                      <Star size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Rubrik Penilaian</h3>
                    <p className="text-white/50 leading-relaxed">
                      Sistem penilaian dengan rubrik terstandar yang transparan dan objektif.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Feature 6 - Kolaborasi Tim */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <TiltCard className="h-full">
                <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-sky-500/5 border border-cyan-500/20 overflow-hidden group hover:border-cyan-500/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:scale-110 transition-all duration-300">
                      <Users size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Kolaborasi Tim</h3>
                    <p className="text-white/50 leading-relaxed">
                      Undang anggota tim via NIM. Sistem invitation untuk kolaborasi project bersama.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GitHub Section */}
      <section id="github" className="py-24 sm:py-32 px-4 relative">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium mb-8">
                <Github size={16} />
                Deep Integration
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="text-white">GitHub</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Terintegrasi Penuh
                </span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                Tidak perlu berpindah platform. Semua aktivitas development bisa di-review 
                langsung dari dalam aplikasi dengan fitur code viewer dan inline commenting.
              </p>

              {/* GitHub Features List */}
              <div className="space-y-5">
                {[
                  { icon: Terminal, text: 'Login dengan GitHub OAuth', delay: 0 },
                  { icon: FolderGit2, text: 'Pilih repository dari akun GitHub', delay: 0.1 },
                  { icon: Code2, text: 'Code viewer dengan syntax highlighting', delay: 0.2 },
                  { icon: MessageSquare, text: 'Inline comments per baris kode', delay: 0.3 },
                  { icon: GitPullRequest, text: 'Fork otomatis ke organization prodi', delay: 0.4 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: item.delay }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-cyan-500/20 group-hover:border-blue-500/30 transition-all duration-300">
                      <item.icon size={22} className="text-white/70 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="text-white/70 font-medium group-hover:text-white transition-colors">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Code Preview Mock */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-[100px] -z-10" />
              
              <TiltCard>
                <div className="rounded-2xl bg-[#0d1117] border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
                  {/* Window Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#161b22]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                      </div>
                      <span className="text-xs text-white/40 font-mono ml-2">src/app/page.tsx</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30 font-mono">TypeScript</span>
                    </div>
                  </div>
                  
                  {/* Code Content */}
                  <div className="p-5 font-mono text-sm overflow-x-auto">
                    <div className="flex">
                      <div className="text-white/20 select-none pr-6 text-right" style={{ minWidth: '3rem' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                          <div key={n} className="leading-6">{n}</div>
                        ))}
                      </div>
                      <div className="text-white/80">
                        <div className="leading-6"><span className="text-pink-400">export default</span> <span className="text-blue-400">function</span> <span className="text-yellow-300">Page</span>() {'{'}</div>
                        <div className="leading-6 pl-4"><span className="text-pink-400">return</span> (</div>
                        <div className="leading-6 pl-8"><span className="text-white/40">{'<'}</span><span className="text-emerald-400">div</span> <span className="text-violet-400">className</span>=<span className="text-amber-300">&quot;container&quot;</span><span className="text-white/40">{'>'}</span></div>
                        <div className="leading-6 pl-12 bg-amber-500/10 -mx-5 px-5 border-l-2 border-amber-400 relative group cursor-pointer">
                          <span className="text-white/40">{'<'}</span><span className="text-emerald-400">h1</span><span className="text-white/40">{'>'}</span>
                          <span className="text-amber-200">Hello World</span>
                          <span className="text-white/40">{'</'}</span><span className="text-emerald-400">h1</span><span className="text-white/40">{'>'}</span>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center cursor-pointer"
                          >
                            <MessageSquare size={12} className="text-white" />
                          </motion.div>
                        </div>
                        <div className="leading-6 pl-8"><span className="text-white/40">{'</'}</span><span className="text-emerald-400">div</span><span className="text-white/40">{'>'}</span></div>
                        <div className="leading-6 pl-4">)</div>
                        <div className="leading-6">{'}'}</div>
                        <div className="leading-6 text-white/20">&nbsp;</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comment */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">DP</div>
                      <div>
                        <span className="text-sm font-semibold text-white">Dosen Penguji</span>
                        <span className="text-xs text-white/40 ml-2">2 jam lalu</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/60">Bagus! Tapi coba tambahkan styling untuk heading ini agar lebih menarik.</p>
                  </motion.div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 sm:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-6">
              <Eye size={14} />
              Showcase
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Karya <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">Mahasiswa</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Project-project capstone terbaik yang telah disetujui dan layak untuk dijadikan inspirasi.
            </p>
          </motion.div>

          <ProjectGallery limit={8} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent" />
        
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <Rocket size={14} />
              Langkah Mudah
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Cara <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Kerjanya</span>
            </h2>
            <p className="text-white/50 text-lg">
              Empat langkah mudah menuju kelulusan
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Daftar', desc: 'Login dengan NIM terdaftar', color: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-500/20 hover:border-blue-500/40' },
              { num: '02', title: 'Buat Project', desc: 'Hubungkan dengan GitHub', color: 'from-violet-500 to-purple-500', borderColor: 'border-violet-500/20 hover:border-violet-500/40' },
              { num: '03', title: 'Lengkapi', desc: 'Isi persyaratan & upload', color: 'from-amber-500 to-orange-500', borderColor: 'border-amber-500/20 hover:border-amber-500/40' },
              { num: '04', title: 'Submit', desc: 'Kirim untuk review dosen', color: 'from-emerald-500 to-teal-500', borderColor: 'border-emerald-500/20 hover:border-emerald-500/40' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TiltCard>
                  <div className={`text-center p-8 rounded-2xl bg-white/[0.02] border ${step.borderColor} transition-colors group`}>
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.num}
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-white/50">{step.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-cyan-500/30 to-blue-600/30 blur-[100px] -z-10" />
            
            <div className="relative p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-blue-600/20 via-blue-600/10 to-cyan-600/5 border border-blue-500/20 text-center overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-3xl">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-30 animate-[spin_8s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, #3b82f6, #06b6d4, #3b82f6)' }} />
              </div>
              
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/30"
                >
                  <GraduationCap size={40} className="text-white" />
                </motion.div>
                
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
                  Siap untuk Memulai?
                </h2>
                <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
                  Bergabung sekarang dan kelola capstone project kamu dengan lebih mudah dan terstruktur.
                </p>
                
                <Link href={session ? getDashboardUrl() : '/login'}>
                  <Button
                    size="lg"
                    className="relative font-semibold text-white px-10 h-14 text-base overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500" />
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                      {session ? 'Buka Dashboard' : 'Mulai Sekarang'}
                      <ArrowRight size={18} />
                    </span>
                  </Button>
                </Link>

                <p className="mt-8 text-sm text-white/40 flex items-center justify-center gap-2">
                  <Shield size={14} />
                  Gratis untuk semua mahasiswa Prodi Informatika
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
              <span className="font-semibold text-white">capstone</span>
            </div>
            
            <p className="text-sm text-white/30 text-center">
              © 2026 Prodi Informatika UNISMUH Makassar
            </p>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm group"
            >
              <Github size={16} />
              <span>GitHub</span>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </footer>

      {/* Custom styles for animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
