'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button, Accordion, AccordionItem } from '@heroui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles,
  GitBranch,
  FileText,
  Users,
  CheckCircle,
  ArrowRight,
  Github,
  BookOpen,
  Zap,
  Shield,
  Star,
  Rocket,
  MessageCircle,
  TrendingUp,
  Upload,
  Eye,
  GraduationCap,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileCheck,
  Calendar,
  Award,
  Target,
  Layers,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

// Animated Counter Component
function AnimatedCounter({ value, duration = 2000 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
  const hasPlus = value.includes('+');
  const hasPercent = value.includes('%');
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const steps = 60;
    const stepValue = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isVisible, numericValue, duration]);

  if (value === '24/7') return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{count}{hasPlus && '+'}{hasPercent && '%'}</span>;
}

// Bento Card Component
function BentoCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.02 }}
      className={`bento-card card-shine group ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Timeline Item Component
function TimelineItem({
  week,
  title,
  description,
  isActive = false,
  delay = 0,
}: {
  week: string;
  title: string;
  description: string;
  isActive?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isActive
          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
          : 'bg-default-100 text-default-500'
          }`}>
          {week}
        </div>
        <div className="w-px h-full bg-default-200 my-2" />
      </div>
      <div className="pb-8">
        <h4 className={`font-bold ${isActive ? 'text-foreground' : 'text-default-500'}`}>{title}</h4>
        <p className="text-sm text-default-500 mt-1">{description}</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const getDashboardUrl = () => {
    switch (session?.user?.role) {
      case 'MAHASISWA': return '/mahasiswa/dashboard';
      case 'DOSEN_PENGUJI': return '/dosen/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  const stats = [
    { value: '500+', label: 'Projects', icon: <FileText size={16} /> },
    { value: '50+', label: 'Dosen', icon: <Users size={16} /> },
    { value: '98%', label: 'Success Rate', icon: <TrendingUp size={16} /> },
  ];

  const requirements = [
    {
      icon: BookOpen,
      title: 'Judul Proyek',
      gradient: 'from-blue-500 to-cyan-500',
      items: [
        'Mencerminkan topik utama yang relevan dengan bidang studi',
        'Spesifik, jelas, dan mudah dipahami',
        'Menunjukkan tujuan dan ruang lingkup proyek',
      ],
    },
    {
      icon: Target,
      title: 'Tujuan dan Manfaat Proyek',
      gradient: 'from-green-500 to-emerald-500',
      items: [
        'Memiliki tujuan yang jelas dan terukur',
        'Kontribusi terhadap ilmu pengetahuan atau industri',
        'Manfaat aplikatif untuk pengembangan produk/solusi',
      ],
    },
    {
      icon: Layers,
      title: 'Integrasi Mata Kuliah',
      gradient: 'from-purple-500 to-pink-500',
      items: [
        'Mengintegrasikan konsep dari beberapa mata kuliah',
        'Penerapan teori dan keterampilan masa studi',
        'Penjelasan relevansi mata kuliah dengan proyek',
      ],
    },
    {
      icon: GitBranch,
      title: 'Metodologi',
      gradient: 'from-orange-500 to-amber-500',
      items: [
        'Metodologi yang tepat sesuai bidang studi',
        'Teknik pengumpulan dan analisis data yang jelas',
        'Metodologi pengembangan, pengujian, dan evaluasi',
      ],
    },
    {
      icon: FileCheck,
      title: 'Sumber Daya dan Batasan',
      gradient: 'from-pink-500 to-rose-500',
      items: [
        'Penjelasan sumber daya yang diperlukan',
        'Identifikasi batasan waktu, anggaran, akses data',
        'Pemahaman kendala pelaksanaan proyek',
      ],
    },
    {
      icon: Calendar,
      title: 'Kerangka Waktu',
      gradient: 'from-teal-500 to-cyan-500',
      items: [
        'Jadwal pelaksanaan yang terstruktur',
        'Tenggat waktu realistis setiap tahapan',
        'Waktu untuk penelitian, pengembangan, dan laporan',
      ],
    },
    {
      icon: Sparkles,
      title: 'Analisis dan Temuan',
      gradient: 'from-yellow-500 to-orange-500',
      items: [
        'Analisis mendalam dengan data dan bukti relevan',
        'Temuan yang dapat diaplikasikan dalam konteks nyata',
        'Kontribusi untuk akademis, industri, atau masyarakat',
      ],
    },
    {
      icon: FileText,
      title: 'Penulisan Laporan',
      gradient: 'from-indigo-500 to-purple-500',
      items: [
        'Format akademik yang telah ditentukan (APA/MLA)',
        'Struktur: pendahuluan, metodologi, analisis, kesimpulan',
        'Referensi relevan dan mutakhir',
      ],
    },
    {
      icon: Award,
      title: 'Presentasi dan Ujian',
      gradient: 'from-red-500 to-pink-500',
      items: [
        'Presentasi lisan yang komunikatif',
        'Mencakup tujuan, metodologi, temuan, dan rekomendasi',
        'Evaluasi di depan penguji atau panel',
      ],
    },
    {
      icon: Users,
      title: 'Keterlibatan Stakeholder',
      gradient: 'from-cyan-500 to-blue-500',
      items: [
        'Melibatkan stakeholder dalam perencanaan/evaluasi',
        'Feedback dari klien, pengguna, atau komunitas',
        'Penjelasan kontribusi stakeholder dalam proyek',
      ],
    },
    {
      icon: Shield,
      title: 'Kepatuhan Terhadap Etika',
      gradient: 'from-emerald-500 to-green-500',
      items: [
        'Mematuhi standar etika yang berlaku',
        'Penanganan data sensitif dan informasi pribadi',
        'Penjelasan isu privasi dan persetujuan',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Apa saja teknologi yang direkomendasikan?',
      answer: 'Kami merekomendasikan penggunaan teknologi modern seperti React/Next.js untuk frontend, Node.js/Python untuk backend, dan PostgreSQL/MongoDB untuk database. Namun, Anda bebas memilih stack teknologi sesuai kebutuhan project selama dapat dipertanggungjawabkan.',
    },
    {
      question: 'Berapa minimal SKS yang harus ditempuh?',
      answer: 'Mahasiswa harus sudah menyelesaikan minimal 120 SKS dan telah lulus mata kuliah prasyarat seperti Pemrograman Web, Basis Data, dan Rekayasa Perangkat Lunak.',
    },
    {
      question: 'Apakah bisa mengerjakan project secara tim?',
      answer: 'Ya, project dapat dikerjakan secara tim dengan maksimal 3 orang. Setiap anggota tim harus memiliki kontribusi yang jelas dan terdokumentasi di GitHub.',
    },
    {
      question: 'Bagaimana jika project ditolak?',
      answer: 'Jika project ditolak, Anda akan mendapat feedback detail dari dosen penguji. Anda memiliki kesempatan untuk merevisi dan submit ulang maksimal 2 kali dalam periode yang sama.',
    },
    {
      question: 'Apakah harus menggunakan GitHub?',
      answer: 'Ya, penggunaan GitHub wajib untuk tracking progress development, code review, dan dokumentasi. Pastikan repository bersifat public atau berikan akses ke dosen penguji.',
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
        <div className="dot-grid" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="max-w-6xl mx-auto px-6 py-3 rounded-2xl glass">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 group">
                <motion.div
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <GraduationCap className="text-white" size={18} />
                </motion.div>
                <span className="font-bold text-lg tracking-tight">
                  Cap<span className="gradient-text">stone</span>
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Persyaratan', href: '#requirements' },
                  { label: 'Alur', href: '#how-it-works' },
                  { label: 'FAQ', href: '#faq' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-default-500 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {session ? (
                  <Link href={getDashboardUrl()}>
                    <Button
                      size="sm"
                      className="font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      endContent={<ArrowRight size={14} />}
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button
                      size="sm"
                      className="font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    >
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative pt-32 pb-8 px-4"
      >
        <div className="max-w-6xl mx-auto">
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 badge-modern badge-glow">
                <Star className="text-amber-400" size={14} />
                <span className="text-default-600 text-sm">Platform Resmi Informatika 2026</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4"
            >
              Submit. Review.{' '}
              <span className="gradient-text">Graduate.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-default-500 max-w-2xl mx-auto mb-8"
            >
              Platform all-in-one untuk pengumpulan dan penilaian capstone project.{' '}
              <span className="text-foreground font-medium">Terintegrasi dengan GitHub. Feedback real-time.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {session ? (
                <Link href={getDashboardUrl()}>
                  <Button
                    size="lg"
                    className="font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all px-8"
                    endContent={<Rocket size={18} />}
                  >
                    Buka Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all px-8"
                      endContent={<ArrowRight size={18} />}
                    >
                      Login Sekarang
                    </Button>
                  </Link>
                  <a href="#requirements">
                    <Button
                      size="lg"
                      variant="bordered"
                      className="font-semibold border-default-200 hover:bg-default-100 px-8"
                      startContent={<FileText size={18} />}
                    >
                      Lihat Persyaratan
                    </Button>
                  </a>
                </>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-8 mt-12"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-blue-500">{stat.icon}</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-black gradient-text">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-xs text-default-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Bento Grid Section */}
          <section id="features" className="mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="badge-modern inline-flex items-center gap-2 mb-4">
                <Sparkles className="text-blue-400" size={14} />
                <span className="text-sm">Platform Features</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-black">
                Semua yang kamu butuhkan,{' '}
                <span className="gradient-text">dalam satu platform</span>
              </h2>
            </motion.div>

            <div className="bento-grid">
              {/* Large Card - GitHub Integration */}
              <BentoCard className="bento-span-2 bento-span-2-row min-h-[320px]" delay={0}>
                <div className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <GitBranch className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">GitHub Integration</h3>
                  <p className="text-default-500 text-sm mb-4 flex-grow">
                    Connect repository langsung ke platform. Review code, lihat commits, dan track progress development secara real-time.
                  </p>
                  {/* Code Preview */}
                  <div className="code-preview mt-auto">
                    <div className="code-line">
                      <span className="code-line-number">1</span>
                      <span className="code-line-content">
                        <span className="code-keyword">const</span> <span className="code-function">project</span> = <span className="code-keyword">await</span> connect(
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="code-line-number">2</span>
                      <span className="code-line-content">
                        {'  '}<span className="code-string">&quot;github.com/user/capstone&quot;</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="code-line-number">3</span>
                      <span className="code-line-content">);</span>
                    </div>
                  </div>
                </div>
              </BentoCard>

              {/* Smart Upload Card */}
              <BentoCard className="min-h-[150px]" delay={0.1}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Upload className="text-white" size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">Smart Upload</h3>
                <p className="text-default-500 text-sm">
                  Drag & drop dokumen. Auto-organize per BAB dengan validasi format otomatis.
                </p>
              </BentoCard>

              {/* Real-time Review Card */}
              <BentoCard className="min-h-[150px]" delay={0.15}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Zap className="text-white" size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">Real-time Feedback</h3>
                <p className="text-default-500 text-sm">
                  Notifikasi instan setiap ada review atau komentar dari dosen.
                </p>
              </BentoCard>

              {/* Progress Tracking Card */}
              <BentoCard className="min-h-[150px]" delay={0.2}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">Progress Tracking</h3>
                <p className="text-default-500 text-sm">
                  Dashboard visual untuk monitor progress dan status project.
                </p>
              </BentoCard>

              {/* Rubrik Penilaian Card */}
              <BentoCard className="bento-span-2 min-h-[150px]" delay={0.25}>
                <div className="h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Layers className="text-white" size={20} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Rubrik Penilaian Terstandar</h3>
                  <p className="text-default-500 text-sm mb-3">
                    Penilaian objektif dengan rubrik yang jelas dan transparan.
                  </p>
                  <div className="grid grid-cols-5 gap-2 mt-auto">
                    {['Kode', 'Fungsi', 'Docs', 'Inovasi', 'Demo'].map((item, i) => (
                      <div key={i} className="text-center p-2 rounded-lg bg-default-100">
                        <p className="text-xs text-default-500">{item}</p>
                        <p className="text-sm font-bold text-default-700">{[20, 25, 20, 15, 20][i]}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </BentoCard>

              {/* Code Review Card */}
              <BentoCard className="min-h-[150px]" delay={0.3}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Eye className="text-white" size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">Code Review</h3>
                <p className="text-default-500 text-sm">
                  Inline comments langsung di code untuk feedback yang spesifik.
                </p>
              </BentoCard>
            </div>
          </section>
        </div>
      </motion.section>

      {/* Requirements Section */}
      <section id="requirements" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-modern inline-flex items-center gap-2 mb-4">
              <FileCheck className="text-emerald-400" size={14} />
              <span className="text-sm">Persyaratan Umum</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Persyaratan{' '}
              <span className="gradient-text">Capstone Project</span>
            </h2>
            <p className="text-default-500 max-w-2xl mx-auto">
              Panduan lengkap persyaratan yang harus dipenuhi dalam pelaksanaan Capstone Project. Pastikan setiap aspek dipahami dan diterapkan dengan baik.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Accordion
              variant="splitted"
              selectionMode="multiple"
              className="gap-4"
              itemClasses={{
                base: "px-0 rounded-2xl border border-default-200 bg-white dark:bg-content1 shadow-sm hover:shadow-md transition-shadow",
                title: "font-semibold text-base",
                trigger: "px-6 py-4 data-[hover=true]:bg-default-50",
                content: "px-6 pb-6 pt-0",
                indicator: "text-primary"
              }}
            >
              {requirements.map((req, i) => {
                const Icon = req.icon;
                return (
                  <AccordionItem
                    key={i}
                    aria-label={req.title}
                    title={
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${req.gradient} flex items-center justify-center shrink-0`}>
                          <Icon className="text-white" size={20} />
                        </div>
                        <span>{req.title}</span>
                      </div>
                    }
                  >
                    <div className="space-y-3 pt-4">
                      {req.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-default-50 dark:bg-default-100/50"
                        >
                          <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                          <span className="text-sm text-default-700 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-amber-500" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2">Catatan Penting</h4>
                <p className="text-sm text-default-600">
                  Persyaratan ini bersifat wajib dan akan menjadi acuan dalam penilaian Capstone Project.
                  Diskusikan dengan dosen pembimbing jika ada hal yang belum jelas atau memerlukan klarifikasi lebih lanjut.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-modern inline-flex items-center gap-2 mb-4">
              <Rocket className="text-blue-400" size={14} />
              <span className="text-sm">Alur Capstone</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black">
              Dari proposal sampai{' '}
              <span className="gradient-text">lulus sidang</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Timeline */}
            <div>
              <TimelineItem
                week="1-4"
                title="Fase Proposal"
                description="Submit proposal, review oleh dosen pembimbing, dan revisi hingga disetujui."
                isActive
                delay={0}
              />
              <TimelineItem
                week="5-10"
                title="Fase Development"
                description="Implementasi project sesuai proposal. Push code ke GitHub secara berkala."
                delay={0.1}
              />
              <TimelineItem
                week="11-12"
                title="Testing & Dokumentasi"
                description="Testing menyeluruh, bug fixing, dan melengkapi dokumentasi."
                delay={0.2}
              />
              <TimelineItem
                week="13-14"
                title="Review & Revisi"
                description="Submit untuk review dosen penguji. Revisi berdasarkan feedback."
                delay={0.3}
              />
              <TimelineItem
                week="15-16"
                title="Presentasi Final"
                description="Demo project dan sidang akhir di depan tim penguji."
                delay={0.4}
              />
            </div>

            {/* Steps Cards */}
            <div className="space-y-4">
              {[
                { step: '01', title: 'Login', desc: 'Masuk dengan NIM yang terdaftar di sistem', icon: <Users size={20} />, color: 'from-blue-500 to-cyan-500' },
                { step: '02', title: 'Buat Project', desc: 'Isi detail project dan connect GitHub repo', icon: <GitBranch size={20} />, color: 'from-violet-500 to-purple-500' },
                { step: '03', title: 'Upload Dokumen', desc: 'Upload proposal, laporan, dan dokumen pendukung', icon: <FileText size={20} />, color: 'from-amber-500 to-orange-500' },
                { step: '04', title: 'Submit & Review', desc: 'Submit untuk review dan tunggu feedback dosen', icon: <MessageCircle size={20} />, color: 'from-emerald-500 to-teal-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-default-200 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-default-400">{item.step}</span>
                      <h4 className="font-bold">{item.title}</h4>
                    </div>
                    <p className="text-sm text-default-500">{item.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-default-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-modern inline-flex items-center gap-2 mb-4">
              <Users className="text-cyan-400" size={14} />
              <span className="text-sm">User Roles</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black">
              Didesain untuk{' '}
              <span className="gradient-text">semua peran</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Mahasiswa',
                subtitle: 'Submit & track progress',
                gradient: 'from-blue-500 to-cyan-500',
                features: ['Buat & kelola project', 'Connect GitHub repo', 'Upload dokumen', 'Lihat feedback & nilai'],
                icon: <GraduationCap size={28} />,
              },
              {
                title: 'Dosen Penguji',
                subtitle: 'Review & beri penilaian',
                gradient: 'from-violet-500 to-purple-500',
                features: ['Review code di GitHub', 'Beri skor per rubrik', 'Tulis komentar', 'Track progress mahasiswa'],
                icon: <BookOpen size={28} />,
              },
              {
                title: 'Admin',
                subtitle: 'Kelola sistem',
                gradient: 'from-emerald-500 to-teal-500',
                features: ['Kelola user', 'Assign dosen penguji', 'Konfigurasi rubrik', 'Monitor seluruh sistem'],
                icon: <Shield size={28} />,
              },
            ].map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`rounded-2xl bg-gradient-to-br ${role.gradient} p-6 text-white relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    {role.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{role.title}</h3>
                  <p className="text-white/70 text-sm mb-4">{role.subtitle}</p>
                  <ul className="space-y-2">
                    {role.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-white/90">
                        <CheckCircle size={14} className="text-white/60" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="badge-modern inline-flex items-center gap-2 mb-4">
              <HelpCircle className="text-amber-400" size={14} />
              <span className="text-sm">FAQ</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black">
              Pertanyaan yang{' '}
              <span className="gradient-text">sering diajukan</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion variant="bordered" className="gap-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  aria-label={faq.question}
                  title={<span className="font-semibold text-sm">{faq.question}</span>}
                  className="px-4"
                >
                  <p className="text-default-500 text-sm pb-4">{faq.answer}</p>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative gradient-bg rounded-3xl p-10 md:p-14 text-center text-white overflow-hidden">
            <div className="absolute inset-0 noise" />
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6"
              >
                <Rocket size={32} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Siap untuk memulai?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
                Login sekarang dan mulai perjalanan capstone project kamu. Tim kami siap membantu!
              </p>
              {!session && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="font-bold bg-white text-blue-600 hover:bg-white/90 px-8"
                      endContent={<ArrowRight size={18} />}
                    >
                      Login Sekarang
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-default-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <span className="font-bold text-lg">Capstone</span>
              </div>
              <p className="text-default-500 text-sm max-w-sm">
                Platform manajemen capstone project untuk Program Studi Informatika.
                Terintegrasi dengan GitHub untuk pengalaman development yang lebih baik.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-default-500">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#requirements" className="hover:text-foreground transition-colors">Persyaratan</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">Alur Capstone</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm text-default-500">
                <li>Gedung Informatika Lt. 3</li>
                <li>capstone@informatika.ac.id</li>
                <li>+62 21 1234 5678</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-default-100">
            <p className="text-default-500 text-sm">
              &copy; 2026 Program Studi Informatika. All rights reserved.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-default-500 hover:text-foreground transition-colors text-sm"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
