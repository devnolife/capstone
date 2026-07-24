'use client';

import Link from 'next/link';
import { CalendarCheck, ClipboardList, UserPlus, Users } from 'lucide-react';
import { formatDate, getRoleLabel, getStatusLabel } from '@/lib/utils';
import { LabelRow } from '@/components/caret/dashboard/LabelRow';
import { BentoStats } from '@/components/caret/dashboard/BentoStats';
import { BentoChart, type ChartPoint } from '@/components/caret/dashboard/BentoChart';
import { BentoLists, type BentoRow, type BentoUpNext } from '@/components/caret/dashboard/BentoLists';
import { BentoFeed, type BentoFeedItem } from '@/components/caret/dashboard/BentoFeed';
import { DashboardEntrance } from '@/components/caret/dashboard/DashboardEntrance';
import { DashboardGreeting } from '@/components/caret/dashboard/DashboardGreeting';

interface AdminDashboardContentProps {
  userName: string;
  stats: {
    totalUsers: number;
    totalMahasiswa: number;
    totalDosen: number;
    totalProjects: number;
    submittedProjects: number;
    completedReviews: number;
  };
  recentUsers: {
    id: string;
    name: string;
    username: string;
    role: string;
    createdAt: string;
  }[];
  recentProjects: {
    id: string;
    title: string;
    status: string;
    semester: string;
    tahunAkademik: string;
    mahasiswaName: string;
  }[];
  activity: ChartPoint[];
  upcomingPresentation: {
    projectTitle: string;
    mahasiswaName: string;
    scheduledDate: string;
    startTime: string;
    endTime: string | null;
    location: string | null;
    scheduledBy: string;
  } | null;
}

const QUICK_ACTIONS = [
  { label: 'Tambah User', href: '/admin/users?action=add', icon: UserPlus },
  { label: 'Penugasan Dosen', href: '/admin/assignments', icon: Users },
  { label: 'Jadwal Presentasi', href: '/admin/presentations', icon: CalendarCheck },
  { label: 'Rubrik Penilaian', href: '/admin/rubrik', icon: ClipboardList },
];

export function AdminDashboardContent({
  userName,
  stats,
  recentUsers,
  recentProjects,
  activity,
  upcomingPresentation,
}: AdminDashboardContentProps) {
  const upNext: BentoUpNext | null = upcomingPresentation
    ? {
        title: upcomingPresentation.projectTitle,
        time: `${formatDate(upcomingPresentation.scheduledDate)} · ${upcomingPresentation.startTime}${
          upcomingPresentation.endTime ? ` - ${upcomingPresentation.endTime}` : ''
        }`,
        chip: 'Terjadwal',
        icon: 'presentasi',
        facts: [
          ['Mahasiswa', upcomingPresentation.mahasiswaName],
          ['Lokasi', upcomingPresentation.location || 'Menyusul'],
          ['Penjadwal', upcomingPresentation.scheduledBy],
        ] as const,
      }
    : null;

  const projectRows: BentoRow[] = recentProjects.map((p) => ({
    title: p.title,
    subtitle: `${p.mahasiswaName} · ${p.semester} ${p.tahunAkademik}`,
    chip: getStatusLabel(p.status),
    chipLive: p.status === 'IN_REVIEW',
    icon: 'project',
    href: `/admin/projects?id=${p.id}`,
  }));

  const userFeed: BentoFeedItem[] = recentUsers.map((u) => ({
    tag: 'USER BARU',
    title: u.name,
    subtitle: `@${u.username}`,
    meta: formatDate(u.createdAt).toUpperCase(),
    chips: [{ label: getRoleLabel(u.role) }],
    href: `/admin/users?id=${u.id}`,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardEntrance />

      <DashboardGreeting
        userName={userName}
        subtitle="Ini ringkasan aktivitas sistem capstone hari ini."
      />

      <LabelRow left="[SEN] RINGKASAN" right="/ SISTEM" />
      <BentoStats
        stats={[
          {
            label: 'TOTAL USER',
            value: stats.totalUsers,
            hint: `${stats.totalMahasiswa} mahasiswa · ${stats.totalDosen} dosen`,
            href: '/admin/users',
          },
          {
            label: 'TOTAL PROJECT',
            value: stats.totalProjects,
            hint: `${stats.submittedProjects} sudah submit`,
            href: '/admin/projects',
          },
          {
            label: 'MAHASISWA',
            value: stats.totalMahasiswa,
            hint: 'terdaftar di platform',
            href: '/admin/users?role=MAHASISWA',
          },
          {
            label: 'REVIEW SELESAI',
            value: stats.completedReviews,
            hint: 'oleh dosen penguji',
            href: '/admin/projects',
          },
        ]}
      />

      <LabelRow left="[SEL] AKSI CEPAT" right="/ KELOLA" />
      <div
        data-reveal-group
        className="border-zinc-800 grid grid-cols-2 gap-px border bg-zinc-800 lg:grid-cols-4"
      >
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="bg-background hover:bg-app-quinary flex items-center gap-3 px-5 py-4 transition-colors md:px-6 md:py-5"
            >
              <span className="bg-app-primary text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-4" />
              </span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>

      <LabelRow left="[RAB] AKTIVITAS" right="/ PROJECT" />
      <div
        data-reveal
        className="border-zinc-800 grid gap-px border bg-zinc-800 lg:grid-cols-[1.1fr_1fr]"
      >
        <BentoChart
          title="Project baru"
          caption="7 HARI TERAKHIR"
          data={activity}
        />
        <BentoLists
          upNextTitle="Berikutnya"
          upNextTag="JADWAL PRESENTASI"
          upNext={upNext}
          upNextEmptyText="Belum ada presentasi terjadwal."
          rowsTitle="Project terbaru"
          rowsViewAllHref="/admin/projects"
          rows={projectRows}
          rowsEmptyText="Belum ada project."
        />
      </div>

      <LabelRow left="[KAM] USER TERBARU" right="/ FEED" />
      <BentoFeed items={userFeed} emptyText="Belum ada user baru." />
    </div>
  );
}
