'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Github,
  FileText,
  Users,
  GitBranch,
  Upload,
  MessageSquare,
  CheckCircle,
  Star,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Shield,
  Zap,
  Eye,
  Layers,
  Moon,
  Sun,
} from 'lucide-react';

// Feature Card Component
function FeatureCard({
  title,
  icons,
  delay = 0,
}: {
  title: string;
  icons: { icon: React.ReactNode; color: string }[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
    >
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">{title}</p>
      <div className="grid grid-cols-3 gap-3">
        {icons.map((item, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700/50 flex items-center justify-center ${item.color} hover:scale-110 transition-all duration-200`}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Stats Component
function StatItem({ value, label, icon, color = 'text-emerald-400' }: { value: string; label: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className={color}>{icon}</span>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-500">{label}</p>
    </div>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real-time stats
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalMahasiswa: 0,
    successRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const getDashboardUrl = () => {
    switch (session?.user?.role) {
      case 'MAHASISWA': return '/mahasiswa/dashboard';
      case 'DOSEN_PENGUJI': return '/dosen/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-white dark:bg-black"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div 
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-white dark:from-black to-transparent" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Capstone Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-lg text-zinc-900 dark:text-white">Capstone</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#stats" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Stats
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={toggleTheme}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            )}
            {session ? (
              <Link href={getDashboardUrl()}>
                <Button
                  size="sm"
                  className="font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    size="sm"
                    variant="light"
                    className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="sm"
                    className="font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-zinc-600 dark:text-zinc-400">SISTEM CAPSTONE PROJECT 2026</span>
                  <ArrowRight size={14} className="text-zinc-500" />
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                Semua project capstone,{' '}
                <span className="text-zinc-500">dalam satu platform</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg"
              >
                Platform terintegrasi untuk submit project, review code, track progress, dan dapatkan feedback real-time dari dosen pembimbing.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-3"
              >
                {session ? (
                  <Link href={getDashboardUrl()}>
                    <Button
                      size="lg"
                      className="font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-8"
                      endContent={<ArrowRight size={18} />}
                    >
                      Buka Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        size="lg"
                        className="font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-8"
                        endContent={<ArrowRight size={18} />}
                      >
                        Login Sekarang
                      </Button>
                    </Link>
                    <a href="#features">
                      <Button
                        size="lg"
                        variant="bordered"
                        className="font-semibold border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 px-8"
                      >
                        Lihat Features
                      </Button>
                    </a>
                  </>
                )}
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800"
              >
                <p className="text-xs text-zinc-500 mb-4">TERINTEGRASI DENGAN</p>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Github size={20} className="text-zinc-900 dark:text-white" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={20} className="text-blue-500" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">SIMIKAD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={20} className="text-emerald-500" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">SIMTEKMU</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Feature Cards Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <FeatureCard
                title="PROJECTS"
                delay={0.2}
                icons={[
                  { icon: <GitBranch key="1" size={20} />, color: 'text-blue-400' },
                  { icon: <FileText key="2" size={20} />, color: 'text-emerald-400' },
                  { icon: <Upload key="3" size={20} />, color: 'text-violet-400' },
                  { icon: <Eye key="4" size={20} />, color: 'text-amber-400' },
                  { icon: <Layers key="5" size={20} />, color: 'text-pink-400' },
                  { icon: <Zap key="6" size={20} />, color: 'text-cyan-400' },
                ]}
              />
              <FeatureCard
                title="REVIEWS"
                delay={0.3}
                icons={[
                  { icon: <MessageSquare key="1" size={20} />, color: 'text-orange-400' },
                  { icon: <CheckCircle key="2" size={20} />, color: 'text-green-400' },
                  { icon: <Star key="3" size={20} />, color: 'text-yellow-400' },
                  { icon: <TrendingUp key="4" size={20} />, color: 'text-rose-400' },
                  { icon: <Users key="5" size={20} />, color: 'text-indigo-400' },
                  { icon: <BookOpen key="6" size={20} />, color: 'text-teal-400' },
                ]}
              />
              <FeatureCard
                title="DOCUMENTS"
                delay={0.4}
                icons={[
                  { icon: <FileText key="1" size={20} />, color: 'text-red-400' },
                  { icon: <Upload key="2" size={20} />, color: 'text-sky-400' },
                  { icon: <Eye key="3" size={20} />, color: 'text-lime-400' },
                  { icon: <CheckCircle key="4" size={20} />, color: 'text-fuchsia-400' },
                  { icon: <Layers key="5" size={20} />, color: 'text-orange-400' },
                  { icon: <Shield key="6" size={20} />, color: 'text-emerald-400' },
                ]}
              />
              <FeatureCard
                title="ANALYTICS"
                delay={0.5}
                icons={[
                  { icon: <TrendingUp key="1" size={20} />, color: 'text-purple-400' },
                  { icon: <Star key="2" size={20} />, color: 'text-amber-400' },
                  { icon: <Users key="3" size={20} />, color: 'text-blue-400' },
                  { icon: <Zap key="4" size={20} />, color: 'text-yellow-400' },
                  { icon: <Eye key="5" size={20} />, color: 'text-cyan-400' },
                  { icon: <CheckCircle key="6" size={20} />, color: 'text-green-400' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 px-6 border-y border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-16 md:gap-24">
            <StatItem
              value={`${stats.totalProjects}+`}
              label="Total Projects"
              icon={<FileText size={16} />}
              color="text-blue-400"
            />
            <StatItem
              value={`${stats.totalMahasiswa}+`}
              label="Mahasiswa"
              icon={<Users size={16} />}
              color="text-violet-400"
            />
            <StatItem
              value={`${stats.successRate}%`}
              label="Success Rate"
              icon={<TrendingUp size={16} />}
              color="text-emerald-400"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Platform lengkap untuk capstone project
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola, submit, dan mendapatkan penilaian project capstone dalam satu platform terintegrasi.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <GitBranch size={24} />,
                title: 'GitHub Integration',
                desc: 'Connect repository langsung ke platform. Track commits dan review code secara real-time.',
                color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              },
              {
                icon: <Upload size={24} />,
                title: 'Smart Upload',
                desc: 'Upload dokumen dengan drag & drop. Auto-organize berdasarkan kategori dan validasi format.',
                color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              },
              {
                icon: <MessageSquare size={24} />,
                title: 'Real-time Feedback',
                desc: 'Dapatkan notifikasi instan setiap ada review atau komentar dari dosen pembimbing.',
                color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              },
              {
                icon: <TrendingUp size={24} />,
                title: 'Progress Tracking',
                desc: 'Dashboard visual untuk monitor progress dan status project secara real-time.',
                color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              },
              {
                icon: <Layers size={24} />,
                title: 'Rubrik Penilaian',
                desc: 'Sistem penilaian terstandar dengan rubrik yang jelas dan transparan.',
                color: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
              },
              {
                icon: <Eye size={24} />,
                title: 'Code Review',
                desc: 'Inline comments langsung di code untuk feedback yang spesifik dan actionable.',
                color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} border flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap untuk memulai?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg mx-auto">
              Login sekarang dan mulai perjalanan capstone project Anda. Tim kami siap membantu.
            </p>
            {!session && (
              <Link href="/login">
                <Button
                  size="lg"
                  className="font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-8"
                  endContent={<ArrowRight size={18} />}
                >
                  Login Sekarang
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Capstone Logo"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-sm text-zinc-500">Capstone Project System</span>
          </div>
          <p className="text-sm text-zinc-500">
            &copy; 2026 Program Studi Informatika. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
