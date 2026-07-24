'use client';

import Link from 'next/link';
import { Github, ArrowUpRight } from 'lucide-react';
import { formatDate, getStatusLabel } from '@/lib/utils';
import { LabelRow } from '@/components/caret/dashboard/LabelRow';
import { BentoStats } from '@/components/caret/dashboard/BentoStats';
import { BentoChart, type ChartPoint } from '@/components/caret/dashboard/BentoChart';
import { BentoLists, type BentoRow, type BentoUpNext } from '@/components/caret/dashboard/BentoLists';
import { BentoFeed, type BentoFeedItem } from '@/components/caret/dashboard/BentoFeed';
import { DashboardEntrance } from '@/components/caret/dashboard/DashboardEntrance';
import { DashboardGreeting } from '@/components/caret/dashboard/DashboardGreeting';

interface MahasiswaDashboardContentProps {
  userName: string;
  hasGitHubConnected: boolean;
  githubUsername: string | null;
  stats: {
    totalProjects: number;
    submittedProjects: number;
    reviewedProjects: number;
    pendingReviews: number;
    totalDocuments: number;
  };
  projects: {
    id: string;
    title: string;
    status: string;
    semester: string;
    tahunAkademik: string;
    documents: number;
    reviews: number;
  }[];
  activity: ChartPoint[];
  upcomingPresentation: {
    projectTitle: string;
    scheduledDate: string;
    startTime: string;
    endTime: string | null;
    location: string | null;
    scheduledBy: string;
    notes: string | null;
  } | null;
  reviews: {
    id: string;
    status: string;
    overallComment: string | null;
    updatedAt: string;
    reviewerName: string;
    projectId: string;
    projectTitle: string;
    commentCount: number;
  }[];
}

function GitHubBanner({
  connected,
  username,
}: {
  connected: boolean;
  username: string | null;
}) {
  if (connected && username) {
    return (
      <div data-reveal className="border-border bg-background mb-2 flex items-center gap-3 border px-5 py-3">
        <span className="bg-app-primary text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Github className="size-4" />
        </span>
        <p className="text-app-secondary-invert grow text-sm">
          GitHub terhubung sebagai{' '}
          <span className="text-app-primary-invert font-medium">@{username}</span>
        </p>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="text-app-teritary-invert hover:text-app-primary-invert inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-mono text-[10px] tracking-wider transition-colors md:text-xs"
        >
          LIHAT PROFIL
          <ArrowUpRight className="size-3" />
        </a>
      </div>
    );
  }

  return (
    <div data-reveal className="border-border bg-background mb-2 flex flex-wrap items-center gap-3 border px-5 py-3">
      <span className="bg-app-primary text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Github className="size-4" />
      </span>
      <p className="text-app-secondary-invert grow text-sm">
        Hubungkan akun GitHub untuk sinkronisasi repository project.
      </p>
      <Link
        href="/mahasiswa/settings"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-xs font-medium transition-all"
      >
        Hubungkan GitHub
      </Link>
    </div>
  );
}

export function MahasiswaDashboardContent({
  userName,
  hasGitHubConnected,
  githubUsername,
  stats,
  projects,
  activity,
  upcomingPresentation,
  reviews,
}: MahasiswaDashboardContentProps) {
  const upNext: BentoUpNext | null = upcomingPresentation
    ? {
        title: upcomingPresentation.projectTitle,
        time: `${formatDate(upcomingPresentation.scheduledDate)} · ${upcomingPresentation.startTime}${
          upcomingPresentation.endTime ? ` - ${upcomingPresentation.endTime}` : ''
        }`,
        chip: 'Terjadwal',
        icon: 'presentasi',
        summary: upcomingPresentation.notes || undefined,
        facts: [
          ['Lokasi', upcomingPresentation.location || 'Menyusul'],
          ['Penjadwal', upcomingPresentation.scheduledBy],
        ] as const,
      }
    : null;

  const projectRows: BentoRow[] = projects.map((p) => ({
    title: p.title,
    subtitle: `${p.semester} ${p.tahunAkademik} · ${p.documents} dok · ${p.reviews} review`,
    chip: getStatusLabel(p.status),
    chipLive: p.status === 'IN_REVIEW',
    icon: 'project',
    href: `/mahasiswa/projects/${p.id}`,
  }));

  const feedItems: BentoFeedItem[] = reviews.map((r) => ({
    tag: 'REVIEW MASUK',
    title: r.projectTitle,
    subtitle: `Reviewer: ${r.reviewerName}`,
    body: r.overallComment || undefined,
    meta: formatDate(r.updatedAt).toUpperCase(),
    chips: [
      {
        label: getStatusLabel(r.status),
        sub: `${r.commentCount} komentar inline`,
      },
    ],
    href: `/mahasiswa/projects/${r.projectId}`,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardEntrance />

      <DashboardGreeting userName={userName} />

      <GitHubBanner connected={hasGitHubConnected} username={githubUsername} />

      <LabelRow left="[SEN] RINGKASAN" right="/ SEMESTER INI" />
      <BentoStats
        stats={[
          {
            label: 'TOTAL PROJECT',
            value: stats.totalProjects,
            hint: `${stats.submittedProjects} sudah submit`,
            href: '/mahasiswa/projects',
          },
          {
            label: 'MENUNGGU REVIEW',
            value: stats.pendingReviews,
            hint: 'disubmit / dalam review',
          },
          {
            label: 'REVIEW SELESAI',
            value: stats.reviewedProjects,
            hint: 'disetujui / ditolak',
          },
          {
            label: 'DOKUMEN',
            value: stats.totalDocuments,
            hint: 'terunggah di semua project',
            href: '/mahasiswa/documents',
          },
        ]}
      />

      <LabelRow left="[SEL] AKTIVITAS" right="/ PROJECT" />
      <div
        data-reveal
        className="border-border grid gap-px border bg-border lg:grid-cols-[1.1fr_1fr]"
      >
        <BentoChart
          title="Aktivitas notifikasi"
          caption="7 HARI TERAKHIR"
          data={activity}
        />
        <BentoLists
          upNextTitle="Berikutnya"
          upNextTag="JADWAL PRESENTASI"
          upNext={upNext}
          upNextEmptyText="Belum ada jadwal presentasi. Lengkapi persyaratan dan submit projectmu."
          rowsTitle="Project terakhir"
          rowsViewAllHref="/mahasiswa/projects"
          rows={projectRows}
          rowsEmptyText="Belum ada project. Buat project pertamamu."
        />
      </div>

      <LabelRow left="[RAB] REVIEW TERBARU" right="/ FEED" />
      <BentoFeed
        items={feedItems}
        emptyText="Belum ada review dari dosen penguji."
      />
    </div>
  );
}
