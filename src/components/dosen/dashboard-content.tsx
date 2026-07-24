'use client';

import { getStatusLabel, formatDate } from '@/lib/utils';
import { LabelRow } from '@/components/caret/dashboard/LabelRow';
import { BentoStats } from '@/components/caret/dashboard/BentoStats';
import { BentoChart, type ChartPoint } from '@/components/caret/dashboard/BentoChart';
import { BentoLists, type BentoRow, type BentoUpNext } from '@/components/caret/dashboard/BentoLists';
import { BentoFeed, type BentoFeedItem } from '@/components/caret/dashboard/BentoFeed';
import { DashboardEntrance } from '@/components/caret/dashboard/DashboardEntrance';
import { DashboardGreeting } from '@/components/caret/dashboard/DashboardGreeting';

interface DosenDashboardContentProps {
  userName: string;
  stats: {
    totalAssigned: number;
    pendingReview: number;
    completedReview: number;
    totalMahasiswa: number;
  };
  projects: {
    id: string;
    title: string;
    status: string;
    mahasiswaName: string;
    semester: string;
    tahunAkademik: string;
    documents: number;
    reviews: number;
  }[];
  activity: ChartPoint[];
  upcomingPresentation: {
    projectTitle: string;
    mahasiswaName: string;
    scheduledDate: string;
    startTime: string;
    endTime: string | null;
    location: string | null;
  } | null;
  reviewFeed: {
    id: string;
    status: string;
    overallComment: string | null;
    updatedAt: string;
    projectId: string;
    projectTitle: string;
    mahasiswaName: string;
    commentCount: number;
  }[];
}

export function DosenDashboardContent({
  userName,
  stats,
  projects,
  activity,
  upcomingPresentation,
  reviewFeed,
}: DosenDashboardContentProps) {
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
        ] as const,
      }
    : null;

  const projectRows: BentoRow[] = projects.map((p) => ({
    title: p.title,
    subtitle: `${p.mahasiswaName} · ${p.semester} ${p.tahunAkademik} · ${p.documents} dok`,
    chip: getStatusLabel(p.status),
    chipLive: p.status === 'IN_REVIEW',
    icon: 'project',
    href: `/dosen/projects/${p.id}`,
  }));

  const feedItems: BentoFeedItem[] = reviewFeed.map((r) => ({
    tag: 'REVIEW SAYA',
    title: r.projectTitle,
    subtitle: `Mahasiswa: ${r.mahasiswaName}`,
    body: r.overallComment || undefined,
    meta: formatDate(r.updatedAt).toUpperCase(),
    chips: [
      {
        label: getStatusLabel(r.status),
        sub: `${r.commentCount} komentar inline`,
      },
    ],
    href: `/dosen/projects/${r.projectId}/review`,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardEntrance />

      <DashboardGreeting
        userName={userName}
        subtitle="Ini ringkasan antrian review dan project yang kamu nilai."
      />

      <LabelRow left="[SEN] RINGKASAN" right="/ PENILAIAN" />
      <BentoStats
        stats={[
          {
            label: 'PROJECT DITUGASKAN',
            value: stats.totalAssigned,
            hint: `${stats.totalMahasiswa} mahasiswa dinilai`,
            href: '/dosen/projects',
          },
          {
            label: 'PERLU DIREVIEW',
            value: stats.pendingReview,
            hint: 'menunggu / sedang berjalan',
            href: '/dosen/reviews',
          },
          {
            label: 'SELESAI REVIEW',
            value: stats.completedReview,
            hint: 'review rampung',
            href: '/dosen/reviews',
          },
          {
            label: 'MAHASISWA',
            value: stats.totalMahasiswa,
            hint: 'dari project yang ditugaskan',
          },
        ]}
      />

      <LabelRow left="[SEL] AKTIVITAS" right="/ REVIEW" />
      <div
        data-reveal
        className="border-zinc-800 grid gap-px border bg-zinc-800 lg:grid-cols-[1.1fr_1fr]"
      >
        <BentoChart
          title="Aktivitas review"
          caption="7 HARI TERAKHIR"
          data={activity}
        />
        <BentoLists
          upNextTitle="Berikutnya"
          upNextTag="JADWAL PRESENTASI"
          upNext={upNext}
          upNextEmptyText="Belum ada presentasi terjadwal untuk project yang kamu nilai."
          rowsTitle="Project ditugaskan"
          rowsViewAllHref="/dosen/projects"
          rows={projectRows}
          rowsEmptyText="Belum ada project yang ditugaskan."
        />
      </div>

      <LabelRow left="[RAB] REVIEW TERBARU" right="/ FEED" />
      <BentoFeed
        items={feedItems}
        emptyText="Belum ada aktivitas review."
      />
    </div>
  );
}
