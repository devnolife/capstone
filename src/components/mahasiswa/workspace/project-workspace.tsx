'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, Tab, Chip, Select, SelectItem } from '@heroui/react';
import {
  LayoutDashboard,
  FileText,
  Users,
  GitBranch,
  FolderCheck,
  MessageSquare,
} from 'lucide-react';
import type { StudentJourney } from '@/lib/student-journey';
import { OverviewTab } from './overview-tab';
import { RequirementsTab } from './requirements-tab';
import { TeamTab } from './team-tab';
import { RepositoryTab } from './repository-tab';
import { EvidenceTab } from './evidence-tab';
import { ReviewTab } from './review-tab';
import { CreateProjectPanel } from './create-project-panel';
import type { WorkspaceProject, WorkspaceReview, ReviewStats } from './types';

export const WORKSPACE_TABS = [
  'ringkasan',
  'persyaratan',
  'tim',
  'repository',
  'bukti',
  'review',
] as const;

export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

const STATUS_LABELS: Record<string, { label: string; color: 'default' | 'primary' | 'warning' | 'success' | 'danger' | 'secondary' }> = {
  DRAFT: { label: 'Draft', color: 'default' },
  SUBMITTED: { label: 'Disubmit', color: 'primary' },
  IN_REVIEW: { label: 'Sedang Direview', color: 'secondary' },
  REVISION_NEEDED: { label: 'Perlu Revisi', color: 'warning' },
  PRESENTATION_SCHEDULED: { label: 'Presentasi Dijadwalkan', color: 'secondary' },
  APPROVED: { label: 'Disetujui', color: 'success' },
  REJECTED: { label: 'Ditolak', color: 'danger' },
};

interface ProjectWorkspaceProps {
  projects: { id: string; title: string; status: string }[];
  project: WorkspaceProject | null;
  journey: StudentJourney;
  reviews: WorkspaceReview[];
  reviewStats: ReviewStats;
  canEdit: boolean;
  isOwner: boolean;
  hasGitHubConnected: boolean;
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
}: ProjectWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab: WorkspaceTab = WORKSPACE_TABS.includes(rawTab as WorkspaceTab)
    ? (rawTab as WorkspaceTab)
    : 'ringkasan';

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

  const switchProject = useCallback(
    (projectId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('project', projectId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
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
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold truncate">{project.title}</h1>
            <Chip size="sm" color={status.color} variant="flat">
              {status.label}
            </Chip>
          </div>
          <p className="text-xs text-default-500 mt-0.5">
            {project.semester} {project.tahunAkademik} · Semua kebutuhan project dalam
            satu halaman
          </p>
        </div>
        {projects.length > 1 && (
          <Select
            size="sm"
            aria-label="Pilih project"
            selectedKeys={[project.id]}
            onSelectionChange={(keys) => {
              const id = Array.from(keys)[0];
              if (typeof id === 'string' && id !== project.id) switchProject(id);
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
          title={
            <span className="flex items-center gap-1.5">
              <LayoutDashboard size={15} /> Ringkasan
            </span>
          }
        >
          <OverviewTab
            project={project}
            journey={journey}
            isOwner={isOwner}
            onNavigateTab={setTab}
          />
        </Tab>
        <Tab
          key="persyaratan"
          title={
            <span className="flex items-center gap-1.5">
              <FileText size={15} /> Persyaratan
            </span>
          }
        >
          <RequirementsTab projectId={project.id} readOnly={!canEdit} />
        </Tab>
        <Tab
          key="tim"
          title={
            <span className="flex items-center gap-1.5">
              <Users size={15} /> Tim
            </span>
          }
        >
          <TeamTab project={project} canEdit={canEdit} isOwner={isOwner} />
        </Tab>
        <Tab
          key="repository"
          title={
            <span className="flex items-center gap-1.5">
              <GitBranch size={15} /> Repository
            </span>
          }
        >
          <RepositoryTab projectId={project.id} canEdit={canEdit} />
        </Tab>
        <Tab
          key="bukti"
          title={
            <span className="flex items-center gap-1.5">
              <FolderCheck size={15} /> Bukti & Laporan
            </span>
          }
        >
          <EvidenceTab project={project} canEdit={canEdit} />
        </Tab>
        <Tab
          key="review"
          title={
            <span className="flex items-center gap-1.5">
              <MessageSquare size={15} /> Review & Hasil
            </span>
          }
        >
          <ReviewTab
            reviews={reviews}
            reviewStats={reviewStats}
            presentationSchedule={project.presentationSchedule}
          />
        </Tab>
      </Tabs>
    </div>
  );
}
