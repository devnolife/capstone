'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, Tab, Chip, Select, SelectItem, Button } from '@heroui/react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FolderCheck,
  Award,
  ArrowRight,
  CheckCircle2,
  Info,
  MessagesSquare,
} from 'lucide-react';
import type { StudentJourney, SubmissionBlocker } from '@/lib/student-journey';
import { OverviewTab } from './overview-tab';
import { CompletenessTab } from './completeness-tab';
import { TeamTab } from './team-tab';
import { EvidenceTab } from './evidence-tab';
import { ResultTab } from './result-tab';
import DiscussionSection from '@/components/shared/discussion-section';
import { CreateProjectPanel } from './create-project-panel';
import type { WorkspaceProject, WorkspaceReview, ReviewStats } from './types';

export const WORKSPACE_TABS = [
  'ringkasan',
  'kelengkapan',
  'tim',
  'bukti',
  'diskusi',
  'hasil',
] as const;

export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

// Alias ?tab= lama (dipakai redirect & notifikasi lama) → tab baru
const TAB_ALIASES: Record<string, WorkspaceTab> = {
  persyaratan: 'kelengkapan',
  repository: 'kelengkapan',
  review: 'hasil',
};

// Peta kode blocker → tab & anchor seksi tempat memperbaikinya
export const BLOCKER_TARGET: Record<
  string,
  { tab: WorkspaceTab; anchor?: string }
> = {
  missing_requirement: { tab: 'kelengkapan', anchor: 'section-persyaratan' },
  github_repository: { tab: 'kelengkapan', anchor: 'section-setup' },
  consent_document: { tab: 'kelengkapan', anchor: 'section-setup' },
  stakeholder_document: { tab: 'bukti', anchor: 'section-stakeholder' },
  work_log: { tab: 'bukti', anchor: 'section-worklog' },
  user_photo: { tab: 'bukti', anchor: 'section-userphoto' },
  submission_deadline: { tab: 'ringkasan' },
  invalid_status: { tab: 'ringkasan' },
};

/**
 * Target navigasi per blocker. Field persyaratan bisa berasal dari form
 * berbeda (Setup Project vs Persyaratan), jadi anchor ditentukan per-field
 * agar mahasiswa diarahkan ke form yang benar.
 */
export function resolveBlockerTarget(blocker: SubmissionBlocker): {
  tab: WorkspaceTab;
  anchor?: string;
} {
  if (blocker.code === 'missing_requirement' && blocker.form === 'setup') {
    return { tab: 'kelengkapan', anchor: 'section-setup' };
  }
  return BLOCKER_TARGET[blocker.code] ?? { tab: 'ringkasan' };
}

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    color: 'default' | 'primary' | 'warning' | 'success' | 'danger' | 'secondary';
    /** Penjelasan singkat untuk mahasiswa: apa arti status ini & langkah berikutnya */
    hint: string;
  }
> = {
  DRAFT: {
    label: 'Draft',
    color: 'default',
    hint: 'Project belum terkirim ke admin. Lengkapi checklist lalu tekan "Submit untuk Review".',
  },
  SUBMITTED: {
    label: 'Disubmit',
    color: 'primary',
    hint: 'Project sudah terkirim dan sedang menunggu admin memulai review.',
  },
  IN_REVIEW: {
    label: 'Sedang Direview',
    color: 'secondary',
    hint: 'Dosen/admin sedang memeriksa project kamu. Pantau tab Diskusi untuk pertanyaan reviewer.',
  },
  REVISION_NEEDED: {
    label: 'Perlu Revisi',
    color: 'warning',
    hint: 'Ada catatan dari reviewer. Perbaiki sesuai komentar, lalu submit ulang.',
  },
  READY_FOR_PRESENTATION: {
    label: 'Siap Presentasi',
    color: 'secondary',
    hint: 'Project lolos review dan menunggu jadwal presentasi dari admin.',
  },
  PRESENTATION_SCHEDULED: {
    label: 'Presentasi Dijadwalkan',
    color: 'secondary',
    hint: 'Jadwal presentasi sudah ditentukan — cek detailnya di tab Ringkasan.',
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'success',
    hint: 'Selamat! Project sudah disetujui dan dinilai selesai.',
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'danger',
    hint: 'Project ditolak. Hubungi admin/dosen untuk langkah selanjutnya.',
  },
};

/** Scroll ke anchor & minta seksi terkait membuka diri (custom event). */
export function scrollToWorkspaceAnchor(anchor: string) {
  // Beri waktu tab content ter-render dulu
  setTimeout(() => {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.dispatchEvent(
        new CustomEvent('workspace:expand-section', { detail: { anchor } }),
      );
    }
  }, 250);
}

interface ProjectWorkspaceProps {
  projects: { id: string; title: string; status: string }[];
  project: WorkspaceProject | null;
  journey: StudentJourney;
  reviews: WorkspaceReview[];
  reviewStats: ReviewStats;
  canEdit: boolean;
  isOwner: boolean;
  hasGitHubConnected: boolean;
  currentUserId: string;
}

export function ProjectWorkspace({
  projects,
  project,
  journey,
  reviews,
  reviewStats,
  canEdit,
  isOwner,
  hasGitHubConnected,
  currentUserId,
}: ProjectWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);

  const rawTab = searchParams.get('tab') ?? '';
  const activeTab: WorkspaceTab = WORKSPACE_TABS.includes(rawTab as WorkspaceTab)
    ? (rawTab as WorkspaceTab)
    : (TAB_ALIASES[rawTab] ?? 'ringkasan');

  const setTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'ringkasan') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Aksi cepat / klik blocker: pindah tab lalu scroll ke seksi
  const goToBlocker = useCallback(
    (blocker: SubmissionBlocker) => {
      const target = resolveBlockerTarget(blocker);
      setTab(target.tab);
      if (target.anchor) setPendingAnchor(target.anchor);
    },
    [setTab],
  );

  useEffect(() => {
    if (pendingAnchor) {
      scrollToWorkspaceAnchor(pendingAnchor);
      setPendingAnchor(null);
    }
  }, [pendingAnchor, activeTab]);

  // Jumlah blocker per tab → badge
  const blockerCounts = useMemo(() => {
    const counts: Partial<Record<WorkspaceTab, number>> = {};
    for (const blocker of journey.readiness?.blockers ?? []) {
      const tab = resolveBlockerTarget(blocker).tab;
      counts[tab] = (counts[tab] ?? 0) + 1;
    }
    return counts;
  }, [journey.readiness]);

  const firstBlocker = journey.readiness?.blockers.find(
    (b) => b.code !== 'submission_deadline' && b.code !== 'invalid_status',
  );

  if (!project) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <CreateProjectPanel hasGitHubConnected={hasGitHubConnected} />
      </div>
    );
  }

  const status = STATUS_LABELS[project.status] ?? {
    label: project.status,
    color: 'default' as const,
    hint: '',
  };

  const remainingBlockers =
    journey.readiness?.blockers.filter(
      (b) => b.code !== 'submission_deadline' && b.code !== 'invalid_status',
    ).length ?? 0;

  // Penjelasan status yang kontekstual: saat Draft & semua lengkap,
  // dorong mahasiswa untuk submit; saat masih kurang, sebutkan jumlahnya.
  const statusHint =
    project.status === 'DRAFT' || project.status === 'REVISION_NEEDED'
      ? remainingBlockers > 0
        ? `${status.hint} Masih ada ${remainingBlockers} item checklist yang perlu dilengkapi.`
        : project.status === 'DRAFT'
          ? 'Semua checklist lengkap — tinggal tekan "Submit untuk Review" di tab Ringkasan.'
          : status.hint
      : status.hint;

  const tabTitle = (label: string, tab: WorkspaceTab, icon: React.ReactNode) => {
    const count = blockerCounts[tab] ?? 0;
    return (
      <span className="flex items-center gap-1.5">
        {icon} {label}
        {count > 0 ? (
          <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning-500 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        ) : tab !== 'ringkasan' && tab !== 'tim' && tab !== 'hasil' ? (
          <CheckCircle2 size={13} className="text-success-500" />
        ) : null}
      </span>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold truncate">{project.title}</h1>
            <Chip size="sm" color={status.color} variant="flat">
              {status.label}
            </Chip>
          </div>
          <p className="text-xs text-default-500 mt-0.5">
            {project.semester} {project.tahunAkademik} · Semua kebutuhan project
            dalam satu halaman
          </p>
          {statusHint && (
            <p className="flex items-start gap-1.5 text-xs text-default-600 dark:text-default-400 mt-1.5">
              <Info size={13} className="mt-0.5 shrink-0 text-default-400" />
              <span>
                <span className="font-medium">{status.label}:</span> {statusHint}
              </span>
            </p>
          )}
        </div>
        {projects.length > 1 && (
          <Select
            size="sm"
            aria-label="Pilih project"
            selectedKeys={[project.id]}
            onSelectionChange={(keys) => {
              const id = Array.from(keys)[0];
              if (typeof id === 'string' && id !== project.id) {
                const params = new URLSearchParams(searchParams.toString());
                params.set('project', id);
                router.push(`${pathname}?${params.toString()}`);
              }
            }}
            className="w-full sm:w-64"
          >
            {projects.map((p) => (
              <SelectItem key={p.id} textValue={p.title}>
                {p.title}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>

      {/* Aksi cepat: kerjakan blocker berikutnya dgn 1 klik */}
      {canEdit && firstBlocker && (
        <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-4 bg-background/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Langkah berikutnya
              </p>
              <p className="text-sm font-medium truncate">
                {firstBlocker.label}
                <span className="hidden sm:inline text-default-500 font-normal">
                  {' '}
                  — {firstBlocker.description}
                </span>
              </p>
            </div>
            <Button
              size="sm"
              color="primary"
              endContent={<ArrowRight size={14} />}
              onPress={() => goToBlocker(firstBlocker)}
              className="shrink-0"
            >
              Kerjakan
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        aria-label="Workspace project"
        selectedKey={activeTab}
        onSelectionChange={(key) => setTab(String(key))}
        variant="underlined"
        color="primary"
        classNames={{
          tabList: 'w-full overflow-x-auto gap-2 mb-2',
          tab: 'h-11 px-1',
        }}
      >
        <Tab
          key="ringkasan"
          title={tabTitle('Ringkasan', 'ringkasan', <LayoutDashboard size={15} />)}
        >
          <OverviewTab
            project={project}
            journey={journey}
            isOwner={isOwner}
            onGoToBlocker={goToBlocker}
            onNavigateTab={setTab}
          />
        </Tab>
        <Tab
          key="kelengkapan"
          title={tabTitle('Kelengkapan', 'kelengkapan', <ClipboardList size={15} />)}
        >
          <CompletenessTab projectId={project.id} canEdit={canEdit} />
        </Tab>
        <Tab key="tim" title={tabTitle('Tim', 'tim', <Users size={15} />)}>
          <TeamTab project={project} canEdit={canEdit} isOwner={isOwner} />
        </Tab>
        <Tab
          key="bukti"
          title={tabTitle('Bukti', 'bukti', <FolderCheck size={15} />)}
        >
          <EvidenceTab project={project} canEdit={canEdit} />
        </Tab>
        <Tab
          key="diskusi"
          title={tabTitle('Diskusi', 'diskusi', <MessagesSquare size={15} />)}
        >
          <div className="pt-6">
            <DiscussionSection
              projectId={project.id}
              currentUserId={currentUserId}
            />
          </div>
        </Tab>
        <Tab key="hasil" title={tabTitle('Hasil', 'hasil', <Award size={15} />)}>
          <ResultTab
            reviews={reviews}
            reviewStats={reviewStats}
            presentationSchedule={project.presentationSchedule}
          />
        </Tab>
      </Tabs>
    </div>
  );
}
