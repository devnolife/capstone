'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  Eye,
  FileCheck2,
  FolderGit2,
  Github,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  UsersRound,
  Workflow,
  Layers,
  Terminal,
  ArrowRight,
  Sparkle,
  Zap,
  Plus,
  Send,
  Check,
  Clock,
  AlertCircle,
  FolderDot
} from 'lucide-react';
import { ProjectGallery } from '@/components/gallery';

type RoleId = 'mahasiswa' | 'dosen' | 'admin';

type Stats = {
  totalProjects: number;
  totalMahasiswa: number;
  successRate: number;
  approvedProjects: number;
};

type PreviewView = 'overview' | 'projects' | 'reviews' | 'sidang';

const navItems = [
  { label: 'Platform', href: '#platform', hasMenu: true },
  { label: 'Showcase', href: '#showcase' },
  { label: 'Resources', href: '#resources', hasMenu: true },
  { label: 'FAQ', href: '#faq' },
];

const featureCards = [
  {
    icon: LayoutDashboard,
    title: 'Satu Dashboard Pantau Semua',
    text: 'Pantau status proposal, repository, catatan bimbingan, revisi, dan jadwal sidang dari satu layar yang rapi dan mudah dipahami.',
    badge: 'Utama',
  },
  {
    icon: Github,
    title: 'Terhubung Langsung ke GitHub',
    text: 'Sinkronisasi repository, pantau branch aktif, commits, dan link rilis video demo tim langsung secara otomatis.',
    tag: 'Sinkronisasi Live',
  },
  {
    icon: MessageSquareText,
    title: 'Diskusi & Feedback Presisi',
    text: 'Pemberian catatan dosen tersimpan per modul berkas atau revisi, mudah ditanggapi, dan tidak tenggelam di chat personal.',
    tag: 'Bimbingan Terarah',
  },
  {
    icon: FileCheck2,
    title: 'Pemeriksaan Berkas Mandiri',
    text: 'Unggah berkas proposal, laporan akhir, and lampiran lewat cloud storage terpadu untuk divalidasi pembimbing.',
  },
  {
    icon: CalendarCheck,
    title: 'Plotting Sidang Tanpa Stress',
    text: 'Penyusunan jadwal sidang komparatif, plotting dosen penguji, dan kesiapan presentasi dalam alur transparan.',
  },
  {
    icon: ShieldCheck,
    title: 'Ruang Kerja Khusus Peran',
    text: 'Setiap peran (Mahasiswa, Dosen, Admin) memiliki fokus dashboard tersendiri dengan akses sistem terlindungi.',
  },
  {
    icon: BarChart3,
    title: 'Rubrik Penilaian Terbuka',
    text: 'Proses evaluasi dan perhitungan nilai ujian didasarkan pada poin-poin rubrik program studi yang adil.',
  },
  {
    icon: Database,
    title: 'Arsip Digital Pintar',
    text: 'Semua draf skripsi, riwayat pengerjaan, log revisi, dan biodata kelompok tersimpan aman dalam berkas program studi.',
  },
  {
    icon: Sparkles,
    title: 'Mulai Portofolio Alumnimu',
    text: 'Hasil project yang telah disetujui ditampilkan dalam galeri pameran karya visual untuk pencapaian prodi.',
  },
];

const roleContent: Record<
  RoleId,
  {
    label: string;
    title: string;
    eyebrow: string;
    description: string;
    cta: string;
    href: string;
    metrics: { label: string; value: string; trend: string }[];
    rows: { label: string; status: string; value: string; width: string; color: string }[];
  }
> = {
  mahasiswa: {
    label: 'Mahasiswa',
    title: 'Kelola pengerjaan skripsi tanpa kehilangan arah.',
    eyebrow: 'ruang kerja mahasiswa',
    description:
      'Dari pengisian proposal awal, menautkan repository aktif kelompok, memantau log revisi pembimbing, hingga kesiapan berkas pendaftaran sidang dalam satu alur visual yang menyenangkan.',
    cta: 'Ke Workspace Mahasiswa',
    href: '/login',
    metrics: [
      { label: 'Tugas Selesai', value: '4/5', trend: 'Sedang Berjalan' },
      { label: 'Revisi Aktif', value: '2', trend: 'Perlu Tanggapan' },
      { label: 'Status Web', value: 'Live', trend: 'Demo Tervalidasi' },
    ],
    rows: [
      { label: 'Draft Proposal Bab 1-3', status: 'Revisi Minor', value: '85%', width: '85%', color: 'from-[#3ba6f1] to-sky-400' },
      { label: 'Repositori GitHub Kelompok', status: 'Terhubung', value: '100%', width: '100%', color: 'from-emerald-500 to-green-400' },
      { label: 'Dokumen Laporan & Demo', status: 'Kurang Berkas', value: '60%', width: '60%', color: 'from-[#ea580c] to-orange-400' },
    ],
  },
  dosen: {
    label: 'Dosen',
    title: 'Bimbingan terprogres, evaluasi terukur.',
    eyebrow: 'panel review dosen',
    description:
      'Akses antrean bimbingan mahasiswa, periksa kesiapan draf, tinggalkan feedback pada baris tugas, serta isi lembar rubrik penilaian sidang kelulusan dengan hitungan otomatis.',
    cta: 'Ke Konsol Dosen',
    href: '/login',
    metrics: [
      { label: 'Siap Review', value: '12', trend: '4 Mendesak' },
      { label: 'Total Bimbingan', value: '08', trend: 'Mahasiswa Aktif' },
      { label: 'ACC Sidang', value: '05', trend: 'Siap Diuji' },
    ],
    rows: [
      { label: 'Review Desain DB Klinik', status: 'Selesai', value: '100%', width: '100%', color: 'from-emerald-500 to-green-400' },
      { label: 'Validasi Deployment UMKM', status: 'Dalam Proses', value: '70%', width: '70%', color: 'from-[#3ba6f1] to-sky-400' },
      { label: 'Evaluasi Rubrik Proposal', status: 'Drafting', value: '45%', width: '45%', color: 'from-amber-500 to-orange-400' },
    ],
  },
  admin: {
    label: 'Admin',
    title: 'Kemudahan kontrol demi tata kelola unggul.',
    eyebrow: 'pusat manajerial prodi',
    description:
      'Kelola periode semester akademik, plotting dosen pembimbing & penguji, susun jadwal ujian sidang komparatif, serta pantau statistik kelulusan tahunan cohort tanpa rekap manual.',
    cta: 'Ke Dashboard Admin',
    href: '/login',
    metrics: [
      { label: 'Total Kelompok', value: '64', trend: 'Semester Ini' },
      { label: 'Sidang Aktif', value: '14', trend: 'Pekan Ini' },
      { label: 'Arsip Project', value: '128', trend: 'Aman Tersimpan' },
    ],
    rows: [
      { label: 'Plotting Dosen Pembimbing', status: 'Selesai', value: '100%', width: '100%', color: 'from-emerald-500 to-green-400' },
      { label: 'Susun Jadwal Sidang', status: 'Dalam Proses', value: '80%', width: '80%', color: 'from-[#3ba6f1] to-sky-400' },
      { label: 'Integrasi Arsip Nilai', status: 'Dalam Antrean', value: '35%', width: '35%', color: 'from-amber-500 to-orange-400' },
    ],
  },
};

const integrationItems = ['Next.js', 'PostgreSQL', 'Prisma DB', 'GitHub Sync', 'MinIO S3', 'NextAuth'];

const journeyEvents = [
  { icon: Sparkles, title: 'proposal: submitted', meta: '3 files', tone: 'text-[#ea580c]', detailLog: 'Draft PROPOSAL_BAB1_3_REVISE_FINAL.pdf uploaded securely using MinIO S3 cluster storage. Form status updated to SUBMITTED.' },
  { icon: Eye, title: '/repository/capstone-os', meta: '12 commits', tone: 'text-[#3ba6f1]', detailLog: 'Connecting github.com/devnolife/capstone-os. Webhook active. Found dev & main branches. Main branch is stable matching build rules.' },
  { icon: MessageSquareText, title: 'review: dosen memberi catatan', meta: '8 notes', tone: 'text-[#3ba6f1]', detailLog: 'Prof. Dr. Andi: "Pastikan fungsionalitas OAuth callback menghandle state state-mismatch dengan aman di middleware. Link repository divalidasi."' },
  { icon: CheckCircle2, title: 'sidang: approved', meta: 'ready', tone: 'text-[#16a34a]', detailLog: 'Rubrik review matches requirements (overall score: 94.2%). Scheduling slots for comprehensive presentation in Lab IF-301.' },
];

const faqItems = [
  {
    question: 'Apakah mahasiswa harus punya GitHub?',
    answer:
      'Ya, untuk project berbasis kode mahasiswa dapat menautkan akun GitHub agar proses review repository, commit, dan deployment lebih mudah dilacak.',
  },
  {
    question: 'Apakah dosen bisa memberi komentar tanpa membuka banyak aplikasi?',
    answer:
      'Bisa. Landing ini mengarah ke workflow review terpusat: project, berkas, catatan, dan rubrik berada di satu dashboard sesuai peran.',
  },
  {
    question: 'Apa bedanya dengan folder drive biasa?',
    answer:
      'Sistem ini tidak hanya menyimpan file. Ia mengikat file, status, repository, komentar, rubrik, dan jadwal menjadi journey akademik yang bisa dipantau.',
  },
  {
    question: 'Apakah admin bisa memantau kesiapan sidang?',
    answer:
      'Admin dapat melihat status pengajuan, ACC, dosen penguji, jadwal, dan arsip sehingga koordinasi sidang lebih rapi.',
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getRoleDashboardUrl(role?: string | null) {
  switch (role) {
    case 'MAHASISWA':
      return '/mahasiswa/dashboard';
    case 'DOSEN_PENGUJI':
      return '/dosen/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
}

function ButtonLink({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative overflow-hidden inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3ba6f1] active:translate-y-0.5',
        variant === 'primary'
          ? 'border border-[#3ba6f1] bg-[#3ba6f1] text-white shadow-[0_4px_20px_rgba(59,166,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,166,241,0.45)] dark:bg-[#3ba6f1] dark:text-[#0c0a09] dark:hover:bg-[#5bb8ff]'
          : 'border border-[#e5e7eb] bg-white text-[#78716c] hover:border-[#d6d3d1] hover:text-[#0c0a09] hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-[#1a1917] dark:hover:border-white/20',
      )}
    >
      {children}
    </Link>
  );
}

function ThemeToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle theme"
      suppressHydrationWarning
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#78716c] transition hover:border-[#d6d3d1] hover:text-[#0c0a09] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ba6f1] dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-[#1a1917]"
    >
      <Moon size={15} className="dark:hidden" />
      <Sun size={15} className="hidden dark:block" />
    </button>
  );
}

function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="Capstone home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-transform duration-505 group-hover:rotate-[8deg] dark:border-white/10 dark:bg-white/10">
        <Image src="/logo.png" alt="Capstone" width={20} height={22} className="rounded-[3px]" priority />
      </span>
      <span className="text-[14px] font-sans font-bold tracking-tight text-[#0c0a09] dark:text-white">
        Capstone<span className="text-[#3ba6f1]">.</span>
      </span>
    </Link>
  );
}

function StatCard({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: ReactNode }) {
  return (
    <div className="group relative rounded-2xl border border-stone-200 bg-gradient-to-b from-white to-[#fafaf9] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-lg hover:border-stone-300 dark:border-stone-800/80 dark:from-stone-900 dark:to-stone-900/60">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium tracking-wide text-[#78716c] dark:text-stone-400 capitalize">{label}</p>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          {Icon}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl font-bold tracking-tight text-[#0c0a09] dark:text-white">{value}</p>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          {trend}
        </span>
      </div>
    </div>
  );
}

function MiniBarChart() {
  const bars = [32, 45, 38, 62, 70, 58, 82, 65, 90, 78, 62, 85, 75, 80];

  return (
    <div className="relative rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] dark:border-stone-800/80 dark:bg-[#1a1917]/80">
      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#3ba6f1]" />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#0c0a09] dark:text-white">Aktivitas Mahasiswa &amp; Dosen</p>
          <p className="text-[11px] text-[#78716c] dark:text-stone-400">Grafik interaksi mingguan prodi</p>
        </div>
        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-medium text-[#78716c] dark:bg-white/10 dark:text-stone-300">UP +12.5%</span>
      </div>
      <div className="flex h-28 items-end gap-2 border-b border-stone-100 pb-1.5 dark:border-stone-800/60">
        {bars.map((height, index) => (
          <div key={`${height}-${index}`} className="flex flex-1 items-end h-full group/bar relative">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 1, delay: index * 0.02, ease: 'easeOut' }}
              className="w-full rounded-full bg-gradient-to-t from-[#3ba6f1] to-sky-400 opacity-60 hover:opacity-100 transition-opacity duration-200"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceRow({ label, value, width, icon }: { label: string; value: string; width: string; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 group/row py-1">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-[#11100f] dark:text-stone-400">
          {icon}
        </span>
        <span className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
          <div className="h-full bg-gradient-to-r from-[#3ba6f1] to-sky-400" style={{ width }} />
        </div>
        <span className="text-xs font-semibold text-[#0c0a09] dark:text-white tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function DashboardPreview({ stats, activeView, setActiveView }: { stats: Stats; activeView: PreviewView; setActiveView: (view: PreviewView) => void }) {
  const totalProjects = stats.totalProjects || 48;
  const totalStudents = stats.totalMahasiswa || 215;
  const approvedProjects = stats.approvedProjects || 32;

  const tabsInfo = [
    { id: 'overview' as PreviewView, label: 'Overview', icon: LayoutDashboard },
    { id: 'projects' as PreviewView, label: 'Projects', icon: FolderDot },
    { id: 'reviews' as PreviewView, label: 'Reviews', icon: MessageSquareText },
    { id: 'sidang' as PreviewView, label: 'Sidang', icon: GraduationCap },
  ];

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="rounded-2xl border border-stone-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:border-stone-800/80 dark:bg-[#1c1917]/90 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200/60 px-5 py-3 dark:border-stone-800/60">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 tracking-tight">Workspace Platform</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-stone-200 dark:bg-stone-800" />
            <span className="h-2 w-2 rounded-full bg-stone-200 dark:bg-stone-800" />
            <span className="h-2 w-2 rounded-full bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[180px_1fr]">
          <aside className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Menu Workspace</div>
            {tabsInfo.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200',
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-md font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5'
                  )}
                >
                  <Icon size={14} className={isSelected ? 'text-[#3ba6f1] dark:text-[#ea580c]' : 'text-stone-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          <main className="min-h-[240px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeView === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4 w-full"
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Total Project" value={String(totalProjects)} trend="+12.5%" icon={<Layers size={13} />} />
                    <StatCard label="Mahasiswa Aktif" value={String(totalStudents)} trend="+4.3%" icon={<UsersRound size={13} />} />
                    <StatCard label="Approved ACC" value={String(approvedProjects)} trend="92% Lolos" icon={<CheckCircle2 size={13} />} />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.3fr_0.85fr]">
                    <MiniBarChart />
                    <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800/80 dark:bg-[#1a1917]/80 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#0c0a09] dark:text-white">Sumber Berkas Digital</p>
                        <p className="text-[11px] text-[#78716c] dark:text-stone-400 mb-4">Total rincian lampiran tervalidasi</p>
                      </div>
                      <div className="space-y-3">
                        <SourceRow label="GitHub Repositories" value="159" width="88%" icon={<Github size={13} className="text-stone-600 dark:text-stone-400" />} />
                        <SourceRow label="Proposal File S3" value="155" width="80%" icon={<FileCheck2 size={13} className="text-[#3ba6f1]" />} />
                        <SourceRow label="Dosen Review Comments" value="139" width="70%" icon={<MessageSquareText size={13} className="text-[#3ba6f1]" />} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4 shadow-xs"
                >
                  <div className="rounded-2xl border border-stone-200 bg-gradient-to-b from-stone-50/50 to-stone-50 p-5 dark:border-stone-800/40 dark:from-stone-900/50 dark:to-stone-900/40">
                    <p className="text-xs font-bold text-[#0c0a09] dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                      <span>Kelompok Utama Berjalan</span>
                      <span className="text-[10px] text-stone-400">Total 03 Tim Aktif</span>
                    </p>
                    <div className="space-y-3">
                      {[
                        { title: 'Sistem Rekomendasi UMKM Makassar', branch: 'main-prod', rate: '92%', status: 'ACC SIDANG', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                        { title: 'Monitoring Klinik Digital & EHR', branch: 'dev-stream', rate: '75%', status: 'REVIEW ACTIVE', color: 'bg-[#3ba6f1]/10 text-sky-600 dark:text-[#3ba6f1]' },
                        { title: 'Marketplace Hasil Tani Terintegrasi', branch: 'beta-ver', rate: '60%', status: 'REVISI MINOR', color: 'bg-[#ea580c]/10 text-orange-600 dark:text-orange-400' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-white rounded-xl border border-stone-100 hover:shadow-sm transition dark:bg-stone-900 dark:border-stone-800/50">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 font-semibold text-xs">{idx + 1}</span>
                            <div>
                              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100">{item.title}</h4>
                              <p className="text-[10px] text-stone-400 mt-0.5 inline-flex items-center gap-1">
                                <Github size={10} /> {item.branch}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-12 bg-stone-100 rounded-full overflow-hidden dark:bg-stone-800">
                                <div className="h-full bg-emerald-500" style={{ width: item.rate }} />
                              </div>
                              <span className="text-[10px] font-bold text-stone-500">{item.rate}</span>
                            </div>
                            <span className={cn('text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider', item.color)}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-stone-200 bg-[#fafaf9] p-5 dark:border-stone-800/40 dark:bg-[#151413]">
                    <p className="text-xs font-bold text-[#0c0a09] dark:text-white uppercase tracking-wider mb-4">Interaksi Feedback &amp; Revisi</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-4 bg-white rounded-xl border border-stone-200/60 shadow-xs dark:bg-stone-900 dark:border-stone-800/60">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f4fd] text-[#3ba6f1] font-sans text-[9px] font-bold">PA</span>
                          <div>
                            <span className="text-[11px] font-bold text-stone-800 dark:text-stone-300">Prof. Andi (Pembimbing I)</span>
                            <p className="text-[9px] text-stone-400">2 jam yang lalu</p>
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 dark:text-stone-300 italic leading-relaxed">
                          &quot;Validasi draf dan deployment di platform cloud MinIO sudah divalidasi. Hubungkan token auth callback sesuai draf.&quot;
                        </p>
                        <div className="mt-3.5 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex justify-between items-center text-[10px]">
                          <span className="text-[#3ba6f1] font-semibold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#3ba6f1]" /> Draf Disetujui
                          </span>
                          <span className="bg-stone-50 text-stone-500 px-2 py-0.5 rounded-md dark:bg-stone-800">Review Bab II</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-stone-200/60 shadow-xs dark:bg-stone-900 dark:border-stone-800/60">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fdf2e9] text-[#ea580c] font-sans text-[9px] font-bold">DL</span>
                          <div>
                            <span className="text-[11px] font-bold text-stone-800 dark:text-stone-300">Dr. Lisa (Pembimbing II)</span>
                            <p className="text-[9px] text-stone-400">1 hari yang lalu</p>
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 dark:text-stone-300 italic leading-relaxed">
                          &quot;Rapikan penataan spasial grid visual bento pada demo hasil web Anda agar telihat premium untuk disidangkan.&quot;
                        </p>
                        <div className="mt-3.5 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex justify-between items-center text-[10px]">
                          <span className="text-orange-500 font-semibold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Perlu Revisi Minor
                          </span>
                          <span className="bg-stone-50 text-stone-500 px-2 py-0.5 rounded-md dark:bg-stone-800">Review Bab III</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'sidang' && (
                <motion.div
                  key="sidang"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-stone-200 bg-[#fafaf9] p-5 dark:border-stone-800/40 dark:bg-[#151413]">
                    <p className="text-xs font-bold text-[#0c0a09] dark:text-white uppercase tracking-wider mb-4">Penjadwalan &amp; Plotting Sidang</p>
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/50 hover:shadow-xs transition">
                        <div>
                          <p className="text-xs font-bold text-[#0c0a09] dark:text-white">Ujian Sidang Komprehensif Batch #01</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Ruang IF-301 (Lab Hardware) · Pukul 10.00 WITA</p>
                        </div>
                        <span className="text-emerald-600 text-[10px] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg mt-2 sm:mt-0">
                          ACC PENJADWALAN
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/50 hover:shadow-xs transition">
                        <div>
                          <p className="text-xs font-bold text-[#0c0a09] dark:text-white">Pra-Evaluasi Kelayakan (Mock Review)</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Virtual Meet (Zoom Room) · Pukul 14.30 WITA</p>
                        </div>
                        <span className="text-stone-500 text-[10px] font-bold bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg mt-2 sm:mt-0">
                          SIAP EVALUASI
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileDashboardPreview({ stats }: { stats: Stats }) {
  const totalProjects = stats.totalProjects || 48;
  const totalStudents = stats.totalMahasiswa || 215;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-[#1c1917]">
      <div className="mb-3.5 flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0c0a09] dark:text-white uppercase tracking-tight">
          <LayoutDashboard size={14} className="text-[#3ba6f1]" />
          Platform Live Snapshot
        </div>
        <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 text-[9px] font-bold uppercase">online</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-900/60">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#78716c] dark:text-stone-400">Total Project</p>
          <p className="mt-1 text-2xl font-bold text-[#0c0a09] dark:text-white">{totalProjects}</p>
        </div>
        <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-900/60">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#78716c] dark:text-stone-400">Mahasiswa</p>
          <p className="mt-1 text-2xl font-bold text-[#0c0a09] dark:text-white">{totalStudents}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3ba6f1] dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-300">
        <span className="h-1.5 w-1.5 rounded-full bg-[#3ba6f1]" />
        {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl font-bold leading-tight text-[#0c0a09] sm:text-4xl dark:text-white tracking-tight uppercase">{title}</h2>
      {text ? <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-stone-600 dark:text-stone-300">{text}</p> : null}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text, badge, tag }: (typeof featureCards)[number]) {
  return (
    <article className="group relative rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-800/80 dark:bg-[#1a1917]/80 overflow-hidden">
      {badge && (
        <span className="absolute top-5 right-5 bg-orange-500/10 text-orange-600 font-bold uppercase text-[9px] px-2.5 py-0.5 rounded-lg dark:text-orange-400">
          {badge}
        </span>
      )}
      {tag && !badge && (
        <span className="absolute top-5 right-5 text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase">
          {tag}
        </span>
      )}

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 border border-stone-200/50 text-[#3ba6f1] group-hover:scale-105 group-hover:bg-[#3ba6f1] group-hover:text-white transition duration-300 dark:bg-stone-900 dark:border-stone-800/60">
        <Icon size={18} />
      </div>
      <h3 className="mt-5 text-sm font-bold text-[#0c0a09] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
        {title}
        <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#a8a29e]" />
      </h3>
      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-500 dark:text-stone-300">{text}</p>
    </article>
  );
}

function JourneyCard({ activeEvent, setActiveEvent }: { activeEvent: number; setActiveEvent: (ev: number) => void }) {
  return (
    <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#1c1917] grid gap-6 md:grid-cols-[1fr_1.2fr]">
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 h-[calc(100%-20px)] w-px border-l border-dashed border-[#e5e7eb] dark:border-white/10" />
        <div className="space-y-2.5">
          {journeyEvents.map((event, index) => {
            const Icon = event.icon;
            const isSelected = activeEvent === index;
            return (
              <button
                key={event.title}
                onClick={() => setActiveEvent(index)}
                className={cn(
                  'w-full text-left relative rounded-[8px] border px-4 py-2.5 transition-all text-xs outline-none',
                  isSelected
                    ? 'border-[#3ba6f1] bg-[#e8f4fd]/50 shadow-[0_4px_12px_rgba(59,166,241,0.08)] dark:bg-[#123044]/30'
                    : 'border-[#e5e7eb] bg-[#fafaf9] hover:bg-white dark:border-white/5 dark:bg-white/5 dark:hover:bg-[#1a1917]'
                )}
              >
                <span className={cn(
                  'absolute -left-[23px] top-4.5 h-2 w-2 rounded-full border border-white transition',
                  isSelected ? 'bg-[#3ba6f1] scale-125 shadow-[0_0_8px_rgba(59,166,241,0.8)]' : 'bg-[#e5e7eb] dark:bg-stone-700'
                )} />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon size={14} className={event.tone} />
                    <p className="truncate font-mono uppercase font-bold text-[#0c0a09] dark:text-white">{event.title}</p>
                  </div>
                  <p className="shrink-0 font-mono text-[10px] text-[#a8a29e] tracking-wider">{event.meta}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-[#e5e7eb] bg-[#0c0a09] p-4 text-[11px] font-mono text-[#a8a29e] min-h-[170px] flex flex-col justify-between dark:border-white/5 dark:bg-[#080706]">
        <div>
          <div className="flex items-center gap-2 text-white/50 mb-3 uppercase text-[9px] border-b border-white/10 pb-2">
            <Terminal size={12} className="text-[#3ba6f1]" />
            <span>capstone_sys_daemon v2.0</span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            {journeyEvents[activeEvent].detailLog}
          </p>
        </div>
        <div className="mt-4 pt-2 border-t border-white/5 text-[9px] text-[#78716c] flex items-center justify-between">
          <span>{"// STATUS: [STABLE]"}</span>
          <span>ACC_VERIFIED</span>
        </div>
      </div>
    </div>
  );
}

function RolePanel({ activeRole, setActiveRole }: { activeRole: RoleId; setActiveRole: (role: RoleId) => void }) {
  const role = roleContent[activeRole];

  return (
    <div className="rounded-[10px] border border-[#e5e7eb] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#1a1917] overflow-hidden">
      <div className="border-b border-[#e5e7eb] p-2 dark:border-white/10 bg-[#fafaf9] dark:bg-black/20">
        <div className="grid grid-cols-3 gap-1 rounded-sm bg-[#fafaf9] p-1 border border-zinc-200 dark:border-white/5 dark:bg-white/5">
          {(Object.keys(roleContent) as RoleId[]).map((roleId) => (
            <button
              key={roleId}
              type="button"
              onClick={() => setActiveRole(roleId)}
              className={cn(
                'rounded-sm px-3 py-2 text-xs uppercase tracking-widest font-mono font-medium transition focus-visible:outline focus-visible:outline-2',
                activeRole === roleId
                  ? 'bg-[#0c0a09] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:bg-white dark:text-[#0c0a09]'
                  : 'text-[#78716c] hover:text-[#0c0a09] dark:text-stone-300 dark:hover:text-white',
              )}
            >
              {roleContent[roleId].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8 relative">
        <span className="absolute left-[30px] top-[14px] text-[10px] text-zinc-300 dark:text-zinc-800 font-mono">{"// WORKSPACE_ENV"}</span>
        <div className="flex flex-col justify-between gap-8 pt-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-[10px] font-mono uppercase text-[#3ba6f1] dark:border-transparent dark:bg-white/10 dark:text-stone-300">
              {role.eyebrow}
            </span>
            <h3 className="mt-4 text-2xl sm:text-3xl font-semibold leading-tight text-[#0c0a09] dark:text-white tracking-tight">
              {role.title}
            </h3>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#78716c] dark:text-stone-300">
              {role.description}
            </p>
          </div>
          <ButtonLink href={role.href} variant="secondary">
            {role.cta} <ArrowUpRight size={15} />
          </ButtonLink>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {role.metrics.map((metric) => (
              <div key={metric.label} className="relative rounded-[10px] border border-[#e5e7eb] bg-[#fafaf9] p-4 dark:border-white/5 dark:bg-white/5">
                <span className="absolute -left-[1px] -top-[1px] text-[6px] font-mono text-zinc-300 dark:text-zinc-700">+</span>
                <p className="text-[9px] uppercase font-mono tracking-wider text-[#78716c] dark:text-stone-400">{metric.label}</p>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#0c0a09] dark:text-white">{metric.value}</p>
                <p className="mt-0.5 text-[9px] font-mono text-[#16a34a]">{metric.trend}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[10px] border border-[#e5e7eb] bg-[#fafaf9] p-4 dark:border-white/5 dark:bg-white/5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-[#0c0a09] dark:text-white">Active Milestone Flow</p>
              <Workflow size={15} className="text-[#3ba6f1]" />
            </div>
            <div className="space-y-3">
              {role.rows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-[#0c0a09] dark:text-stone-200">{row.label}</span>
                    <span className="text-[10px] font-mono text-[#78716c] dark:text-stone-400">{row.value}</span>
                  </div>
                  <div className="h-6 overflow-hidden rounded-md bg-[#e8f4fd] dark:bg-[#123044]">
                    <div className="flex h-full items-center justify-end rounded-md bg-[#d7f0df] pr-3 text-[9px] font-mono uppercase font-bold text-[#166534] dark:bg-[#1f5131] dark:text-green-100 transition-all duration-700" style={{ width: row.width }}>
                      {row.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcasePreview() {
  const previews = [
    { title: 'Sistem rekomendasi UMKM', tag: 'AI App', score: '92%', icon: Code2 },
    { title: 'Monitoring klinik digital', tag: 'Health Tech', score: '88%', icon: Activity },
    { title: 'Marketplace hasil tani', tag: 'Commerce', score: '95%', icon: FolderGit2 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {previews.map((preview) => {
        const Icon = preview.icon;
        return (
          <article key={preview.title} className="group relative rounded-[10px] border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition hover:shadow-lg dark:border-white/10 dark:bg-[#1c1917]">
            <span className="absolute -left-[1px] -top-[1px] select-none text-[8px] font-mono text-zinc-300 dark:text-zinc-700">+</span>
            <span className="absolute -right-[1px] -bottom-[1px] select-none text-[8px] font-mono text-zinc-300 dark:text-zinc-700">+</span>
            <div className="mb-8 flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#fafaf9] border border-[#e5e7eb] text-[#3ba6f1] group-hover:scale-105 transition dark:bg-white/5 dark:border-white/5">
                <Icon size={16} />
              </span>
              <span className="rounded-full bg-[#f5f5f4] px-2.5 py-0.5 text-[10px] font-mono uppercase text-[#78716c] dark:bg-white/10 dark:text-stone-300">{preview.tag}</span>
            </div>
            <h3 className="text-base font-bold text-[#0c0a09] dark:text-white uppercase tracking-wide group-hover:text-[#3ba6f1] transition">{preview.title}</h3>
            <div className="mt-5 flex items-center justify-between border-t border-[#e5e7eb] pt-4 dark:border-white/10">
              <span className="text-xs text-[#78716c] dark:text-stone-400 font-mono">Rubrik Kelayakan</span>
              <span className="text-lg font-bold tracking-tight text-[#16a34a]">{preview.score}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [activeRole, setActiveRole] = useState<RoleId>('mahasiswa');
  const [activePreviewView, setActivePreviewView] = useState<PreviewView>('overview');
  const [activeJourney, setActiveJourney] = useState<number>(0);

  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalMahasiswa: 0,
    successRate: 0,
    approvedProjects: 0,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      try {
        const response = await fetch('/api/stats', { signal: controller.signal });
        if (response.ok) {
          setStats(await response.json());
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('stats error', error);
        }
      }
    }

    fetchStats();
    return () => controller.abort();
  }, []);

  const dashboardUrl = useMemo(() => getRoleDashboardUrl(session?.user?.role), [session?.user?.role]);
  const isDark = resolvedTheme === 'dark';

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fafaf9] text-[#0c0a09] dark:bg-[#0c0a09] dark:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.22] dark:opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(rgba(255,255,255,0.45)_1px,transparent_1px)]" />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#e5e7eb]/80 bg-[#fafaf9]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c0a09]/85">
        <nav className="mx-auto flex h-[58px] max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main navigation">
          <AppLogo />

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-[#78716c] transition hover:bg-white hover:text-[#0c0a09] dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-white">
                {item.label}
                {item.hasMenu ? <ChevronDown size={12} className="text-[#a8a29e]" /> : null}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle onToggle={() => setTheme(isDark ? 'light' : 'dark')} />
            {session ? (
              <ButtonLink href={dashboardUrl}>Dashboard</ButtonLink>
            ) : (
              <>
                <Link href="/login" className="hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#78716c] transition hover:bg-white hover:text-[#0c0a09] sm:inline-flex dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-white">
                  Masuk
                </Link>
                <ButtonLink href="/register">Mulai</ButtonLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="relative border-b border-[#e5e7eb] px-4 pb-8 pt-24 dark:border-white/10 dark:bg-none sm:px-6">
        <span className="absolute left-4 top-20 select-none text-[9px] font-mono text-zinc-300 dark:text-zinc-800">+</span>
        <span className="absolute right-4 top-20 select-none text-[9px] font-mono text-zinc-300 dark:text-zinc-800">+</span>

        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-mono uppercase text-[#3ba6f1] shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
              <Sparkles size={14} className="text-[#3ba6f1]" />
              <span>{"// current_version: V4.1_ACC ✦"}</span>
            </div>

            <h1 className="text-[2.25rem] font-bold leading-[1.05] tracking-tight text-[#0c0a09] sm:text-5xl sm:leading-none lg:text-[54px] lg:leading-[1.1] dark:text-white uppercase">
              Platform capstone yang <span className="font-serif italic text-[#3ba6f1] capitalize">actionable</span> &amp; <span className="font-serif italic text-[#ea580c] capitalize">mindful</span>.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-[#78716c] dark:text-stone-300 sm:text-base">
              Kumpulkan project, hubungkan repository GitHub, tumpas catatan revisi, dan monitor rubrik kelulusan tanpa rekap spreadsheet yang melelahkan.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href={session ? dashboardUrl : '/register'}>
                {session ? 'Buka dashboard' : 'Ajukan project sekarang'} <ArrowUpRight size={15} />
              </ButtonLink>
              <ButtonLink href="#platform" variant="secondary">
                Lihat cara kerja <Play size={13} className="fill-current text-[#78716c] dark:text-stone-300" />
              </ButtonLink>
            </div>
          </div>

          <div className="mt-8 sm:mt-10">
            <div className="relative max-h-44 overflow-hidden rounded-[10px] sm:hidden">
              <MobileDashboardPreview stats={stats} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#fafaf9] to-transparent dark:from-[#0c0a09]" />
            </div>
            <div className="relative hidden max-h-[360px] overflow-hidden rounded-[10px] pb-6 sm:block">
              <DashboardPreview stats={stats} activeView={activePreviewView} setActiveView={setActivePreviewView} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fafaf9] to-transparent dark:from-[#0c0a09]" />
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="px-4 py-20 sm:px-6 relative">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#3ba6f1]">
              {"// 01 / WORKFLOW"}
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#0c0a09] sm:text-4xl dark:text-white uppercase tracking-tight">
              Tuntas dalam 3 langkah terarah.
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#78716c] dark:text-stone-300">
              Selesai dengan tumpukan tumpukan file ZIP yang sulit dilacak. Sistem mengikat data pendaftaran, update repository, evaluasi, hingga penjadwalan sidang secara real-time.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: UsersRound, title: 'Daftar & Lengkapi profil kelompok', text: 'Mahasiswa mengisi identitas lengkap, NIM, tim pelaksana, topik utama, serta menunjuk dosen pendamping.' },
              { icon: Github, title: 'Hubungkan repository aktif', text: 'Hubungkan repository GitHub Anda untuk menyinkronkan feed rilis commits, branch, issue tracker, dan link video demo.' },
              { icon: GraduationCap, title: 'ACC sidang & monitoring nilai', text: 'Dosen dan penguji memvalidasi revisi, memberi komentar langsung, serta membubuhkan skor sesuai rubrik kelulusan.' },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="relative grid gap-4 rounded-[10px] border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:grid-cols-[56px_1fr_auto] sm:items-center dark:border-white/10 dark:bg-[#1c1917] hover:border-[#3ba6f1] transition duration-300">
                  <span className="absolute -left-[1px] -top-[1px] select-none text-[8px] font-mono text-zinc-300 dark:text-zinc-700">+</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#fafaf9] border border-[#e5e7eb] text-[#3ba6f1] dark:bg-white/5 dark:border-white/5">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#0c0a09] dark:text-white uppercase tracking-wide">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#78716c] dark:text-stone-300">{step.text}</p>
                  </div>
                  <span className="w-fit rounded-full bg-[#f5f5f4] px-3 py-1 text-[11px] font-mono text-[#78716c] dark:bg-white/10 dark:text-stone-300">
                    S_0{index + 1}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5e7eb] bg-white px-4 py-20 dark:border-white/10 dark:bg-[#11100f] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Capabilities Suite"
            title="Premium dashboard built with developer discipline."
            text="Fitur andalan disajikan dalam antarmuka grid bento yang tenang, minimalis, dan mudah dipetakan dalam sekali pandang."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#3ba6f1]">
              {"// 02 / TRACKING_DAEMON"}
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#0c0a09] sm:text-4xl dark:text-white uppercase tracking-tight">
              Real-time activity logs.
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#78716c] dark:text-stone-300">
              Setiap tahapan pengajuan memproduksi log digital terpadu. Klik status di bawah untuk mensimulasikan debug log sistem yang dikompilasi langsung oleh daemon.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase">
              {['proposal', 'repository', 'review', 'rubrik', 'sidang'].map((item) => (
                <span key={item} className="rounded-full border border-[#e5e7eb] bg-[#fafaf9] px-3 py-1 text-[#78716c] dark:border-white/5 dark:bg-white/5 dark:text-stone-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <JourneyCard activeEvent={activeJourney} setActiveEvent={setActiveJourney} />
        </div>
      </section>

      <section id="roles" className="border-y border-[#e5e7eb] bg-white px-4 py-20 dark:border-white/10 dark:bg-[#11100f] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Multi-role workspace"
            title="Sederhana di luar, lengkap di dalam."
            text="Setiap user mendapat dashboard panel yang fokus pada perannya masing-masing tanpa distraksi."
          />
          <div className="mt-12">
            <RolePanel activeRole={activeRole} setActiveRole={setActiveRole} />
          </div>
        </div>
      </section>

      <section id="showcase" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#3ba6f1]">
                {"// 03 / GALLERY"}
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#0c0a09] sm:text-4xl dark:text-white uppercase tracking-tight">
                Galeri karya terbaik angkatan.
              </h2>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#78716c] dark:text-stone-300">
                Apresiasi tertinggi untuk project mahasiswa yang paling inovatif, lengkap dengan live preview screenshot interaktif.
              </p>
            </div>
            <ButtonLink href="/login" variant="secondary">
              Upload project <ArrowUpRight size={15} />
            </ButtonLink>
          </div>
          <ShowcasePreview />
          <div className="mt-10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-4 flex items-center gap-2">
              <Layers size={12} className="text-[#3ba6f1]" />
              <span>{"Verified Screenshots from active database //"}</span>
            </div>
            <ProjectGallery limit={8} />
          </div>
        </div>
      </section>

      <section id="resources" className="border-y border-[#e5e7eb] bg-white px-4 py-20 dark:border-white/10 dark:bg-[#11100f] sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <SectionHeader
            eyebrow="Academic Environment integrations"
            title="Satu lingkungan kerja terintegrasi."
            text="Stack utama dan protokol didesain untuk menyatu beriringan guna menjamin keandalan validasi data."
          />
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 font-mono text-xs">
            {integrationItems.map((item) => (
              <div key={item} className="relative rounded-[6px] border border-[#e5e7eb] bg-[#fafaf9] px-4 py-3 text-center text-[#78716c] uppercase tracking-widest font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#3ba6f1] transition dark:border-white/5 dark:bg-white/5 dark:text-stone-300">
                <span className="absolute -left-[1px] -top-[1px] select-none text-[6px] text-zinc-300 dark:text-zinc-700">+</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#3ba6f1]">
              {"// FAQ_SYS"}
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#0c0a09] sm:text-4xl dark:text-white uppercase tracking-tight">Hal yang sering ditanyakan.</h2>
          </div>
          <div className="divide-y divide-[#e5e7eb] border-y border-[#e5e7eb] dark:divide-white/10 dark:border-white/10">
            {faqItems.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-[#0c0a09] dark:text-white uppercase tracking-wider">
                  {item.question}
                  <ChevronDown size={17} className="shrink-0 text-[#3ba6f1] transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#78716c] dark:text-stone-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="relative mx-auto max-w-6xl rounded-[10px] border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#1a1917] md:p-8 overflow-hidden">
          <span className="absolute -left-[1px] top-6 select-none text-[8px] font-mono text-zinc-300 dark:text-zinc-700">+</span>
          <span className="absolute right-6 -bottom-[1px] select-none text-[8px] font-mono text-zinc-300 dark:text-zinc-700">+</span>

          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center relative z-10">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#3ba6f1] mb-2">
                {"// GETTING_STARTED"}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0c0a09] dark:text-white uppercase tracking-tight">Optimalkan pengelolaan capstone prodi sekarang.</h2>
              <p className="mt-1.5 text-xs text-[#78716c] dark:text-stone-300">Setiap project pengerjaan skripsi terekam dengan aman, terdokumentasi rapi, serta dinilai murni.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={session ? dashboardUrl : '/register'}>
                {session ? 'Buka dashboard' : 'Daftar sekarang'} <ArrowUpRight size={15} />
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Masuk
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-12 dark:border-white/10 dark:bg-[#11100f] sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_2fr]">
          <div>
            <AppLogo />
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#78716c] dark:text-stone-300">
              Dashboard pencatatan dan evaluasi komprehensif capstone project mahasiswa program studi Informatika Universitas Muhammadiyah Makassar.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { title: 'Platform', links: ['Dashboard', 'Reviews', 'Rubrik'] },
              { title: 'Resources', links: ['Showcase', 'FAQ', 'Integrations'] },
              { title: 'Access', links: ['Mahasiswa', 'Dosen', 'Admin'] },
            ].map((group) => (
              <div key={group.title}>
                <p className="text-xs uppercase font-mono tracking-wider font-bold text-[#0c0a09] dark:text-white">{group.title}</p>
                <div className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <p key={link} className="text-xs text-[#78716c] dark:text-stone-400 hover:text-[#3ba6f1] transition cursor-pointer">{link}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-[#e5e7eb] pt-6 text-[11px] font-mono text-[#a8a29e] dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} — Prodi Informatika. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5"><LockKeyhole size={12} /> {"// SECURE_WORKSPACE"}</p>
        </div>
      </footer>
    </main>
  );
}
