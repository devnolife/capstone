export const REQUIRED_REQUIREMENT_FIELDS = [
  { key: 'tujuanProyek', label: 'Tujuan Project' },
  { key: 'teknologi', label: 'Teknologi' },
  { key: 'integrasiMatakuliah', label: 'Integrasi Mata Kuliah' },
  { key: 'metodologi', label: 'Metodologi' },
  { key: 'ruangLingkup', label: 'Ruang Lingkup' },
  { key: 'sumberDayaBatasan', label: 'Sumber Daya & Batasan' },
  { key: 'fiturUtama', label: 'Fitur Utama' },
  { key: 'analisisTemuan', label: 'Analisis Temuan' },
  { key: 'presentasiUjian', label: 'Rencana Presentasi' },
  { key: 'stakeholder', label: 'Informasi Stakeholder' },
  { key: 'kepatuhanEtika', label: 'Kepatuhan Etika' },
] as const;

export type RequirementField = (typeof REQUIRED_REQUIREMENT_FIELDS)[number]['key'];

type RequirementValues = Partial<Record<RequirementField, string | null>>;

export type SubmissionBlockerCode =
  | 'missing_requirement'
  | 'github_repository'
  | 'consent_document'
  | 'stakeholder_document'
  | 'submission_deadline'
  | 'invalid_status';

export interface SubmissionBlocker {
  code: SubmissionBlockerCode;
  label: string;
  description: string;
  href: string;
  field?: RequirementField;
}

export interface SubmissionReadinessInput {
  projectId: string;
  status: string;
  githubRepoUrl: string | null;
  requirements: RequirementValues | null;
  documentTypes: string[];
  stakeholderDocumentCount: number;
  submissionDeadline: Date | string | null;
  now?: Date;
}

export interface SubmissionReadiness {
  canSubmit: boolean;
  blockers: SubmissionBlocker[];
  completedChecks: number;
  totalChecks: number;
}

export type JourneyStageStatus =
  | 'complete'
  | 'current'
  | 'blocked'
  | 'waiting'
  | 'upcoming';

export type JourneyStageId =
  | 'account'
  | 'project'
  | 'requirements'
  | 'evidence'
  | 'submission'
  | 'review'
  | 'presentation'
  | 'result';

export interface JourneyStage {
  id: JourneyStageId;
  label: string;
  description: string;
  status: JourneyStageStatus;
}

export interface JourneyAction {
  label: string;
  description: string;
  href: string;
  tone: 'primary' | 'warning' | 'success' | 'neutral';
}

interface JourneyReview {
  status: string;
}

export interface JourneyPresentation {
  scheduledDate: Date | string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  presentationStatus: string;
}

export interface JourneyProjectInput {
  id: string;
  title: string;
  status: string;
  githubRepoUrl: string | null;
  requirements: RequirementValues | null;
  documentTypes: string[];
  stakeholderDocumentCount: number;
  reviews: JourneyReview[];
  presentationSchedule: JourneyPresentation | null;
  memberCount: number;
  isOwner: boolean;
}

export interface BuildStudentJourneyInput {
  hasGitHubConnected: boolean;
  project: JourneyProjectInput | null;
  submissionDeadline: Date | string | null;
  now?: Date;
}

export interface StudentJourney {
  projectId: string | null;
  projectTitle: string | null;
  projectStatus: string | null;
  progress: number;
  stages: JourneyStage[];
  nextAction: JourneyAction;
  readiness: SubmissionReadiness | null;
  reviewProgress: { completed: number; total: number };
  presentation: JourneyPresentation | null;
  deadline: {
    at: string;
    isPast: boolean;
    daysRemaining: number;
  } | null;
}

const isFilled = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim().length > 0;

const isSubmittableStatus = (status: string) =>
  status === 'DRAFT' || status === 'REVISION_NEEDED';

export function checkSubmissionReadiness(
  input: SubmissionReadinessInput,
): SubmissionReadiness {
  const blockers: SubmissionBlocker[] = [];

  for (const requirement of REQUIRED_REQUIREMENT_FIELDS) {
    if (!isFilled(input.requirements?.[requirement.key])) {
      blockers.push({
        code: 'missing_requirement',
        field: requirement.key,
        label: requirement.label,
        description: `${requirement.label} belum dilengkapi.`,
        href: `/mahasiswa/documents/${input.projectId}`,
      });
    }
  }

  if (!isFilled(input.githubRepoUrl)) {
    blockers.push({
      code: 'github_repository',
      label: 'Repository GitHub',
      description: 'Hubungkan repository GitHub project.',
      href: `/mahasiswa/projects/${input.projectId}/edit`,
    });
  }

  if (!input.documentTypes.includes('CONSENT_AGREEMENT')) {
    blockers.push({
      code: 'consent_document',
      label: 'Surat Persetujuan',
      description: 'Unggah surat persetujuan penggunaan project.',
      href: `/mahasiswa/projects/${input.projectId}/edit`,
    });
  }

  if (input.stakeholderDocumentCount < 1) {
    blockers.push({
      code: 'stakeholder_document',
      label: 'Bukti Stakeholder',
      description: 'Unggah minimal satu bukti atau dokumen stakeholder.',
      href: `/mahasiswa/projects/${input.projectId}`,
    });
  }

  const now = input.now ?? new Date();
  const deadline = input.submissionDeadline
    ? new Date(input.submissionDeadline)
    : null;

  if (deadline && !Number.isNaN(deadline.getTime()) && now > deadline) {
    blockers.unshift({
      code: 'submission_deadline',
      label: 'Batas Waktu Submission',
      description: 'Batas waktu pengiriman project sudah berakhir. Hubungi admin untuk perpanjangan.',
      href: `/mahasiswa/projects/${input.projectId}`,
    });
  }

  if (!isSubmittableStatus(input.status)) {
    blockers.unshift({
      code: 'invalid_status',
      label: 'Status Project',
      description: 'Project pada status ini tidak dapat dikirim untuk review.',
      href: `/mahasiswa/projects/${input.projectId}`,
    });
  }

  const totalChecks = REQUIRED_REQUIREMENT_FIELDS.length + 3;
  const failedContentChecks = blockers.filter(
    (item) => item.code !== 'submission_deadline' && item.code !== 'invalid_status',
  ).length;

  return {
    canSubmit: blockers.length === 0,
    blockers,
    completedChecks: Math.max(0, totalChecks - failedContentChecks),
    totalChecks,
  };
}

const stage = (
  id: JourneyStageId,
  label: string,
  description: string,
  status: JourneyStageStatus,
): JourneyStage => ({ id, label, description, status });

function getDeadline(
  value: Date | string | null,
  now: Date,
): StudentJourney['deadline'] {
  if (!value) return null;
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return null;

  return {
    at: deadline.toISOString(),
    isPast: now > deadline,
    daysRemaining: Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000),
  };
}

function actionFromBlocker(blocker: SubmissionBlocker): JourneyAction {
  return {
    label:
      blocker.code === 'submission_deadline'
        ? 'Batas waktu sudah berakhir'
        : `Lengkapi ${blocker.label}`,
    description: blocker.description,
    href: blocker.href,
    tone: 'warning',
  };
}

export function buildStudentJourney(
  input: BuildStudentJourneyInput,
): StudentJourney {
  const now = input.now ?? new Date();

  if (!input.project) {
    return {
      projectId: null,
      projectTitle: null,
      projectStatus: null,
      progress: input.hasGitHubConnected ? 13 : 0,
      stages: [
        stage(
          'account',
          'Akun & GitHub',
          input.hasGitHubConnected
            ? 'Akun GitHub sudah terhubung.'
            : 'Hubungkan akun GitHub untuk memulai.',
          input.hasGitHubConnected ? 'complete' : 'upcoming',
        ),
        stage('project', 'Project & Tim', 'Buat project capstone pertama Anda.', 'current'),
        stage('requirements', 'Persyaratan', 'Lengkapi informasi akademik dan teknis.', 'upcoming'),
        stage('evidence', 'Dokumen & Bukti', 'Siapkan repository dan bukti stakeholder.', 'upcoming'),
        stage('submission', 'Submission', 'Kirim project untuk direview.', 'upcoming'),
        stage('review', 'Review & Revisi', 'Pantau penilaian dosen.', 'upcoming'),
        stage('presentation', 'Presentasi', 'Ikuti ujian presentasi.', 'upcoming'),
        stage('result', 'Hasil Akhir', 'Lihat hasil akhir project.', 'upcoming'),
      ],
      nextAction: {
        label: 'Buat project pertama',
        description: 'Mulai perjalanan capstone dengan membuat project dan tim.',
        href: '/mahasiswa/projects/new',
        tone: 'primary',
      },
      readiness: null,
      reviewProgress: { completed: 0, total: 0 },
      presentation: null,
      deadline: getDeadline(input.submissionDeadline, now),
    };
  }

  const project = input.project;
  const readiness = checkSubmissionReadiness({
    projectId: project.id,
    status: project.status,
    githubRepoUrl: project.githubRepoUrl,
    requirements: project.requirements,
    documentTypes: project.documentTypes,
    stakeholderDocumentCount: project.stakeholderDocumentCount,
    submissionDeadline: input.submissionDeadline,
    now,
  });
  const missingRequirements = readiness.blockers.filter(
    (item) => item.code === 'missing_requirement',
  );
  const missingEvidence = readiness.blockers.filter((item) =>
    ['github_repository', 'consent_document', 'stakeholder_document'].includes(item.code),
  );
  const reviewProgress = {
    completed: project.reviews.filter((review) => review.status === 'COMPLETED').length,
    total: project.reviews.length,
  };
  const afterReview = [
    'READY_FOR_PRESENTATION',
    'PRESENTATION_SCHEDULED',
    'APPROVED',
    'REJECTED',
  ].includes(project.status);
  const final = project.status === 'APPROVED' || project.status === 'REJECTED';
  const submitted = !isSubmittableStatus(project.status);

  const stages: JourneyStage[] = [
    stage(
      'account',
      'Akun & GitHub',
      input.hasGitHubConnected
        ? 'Akun GitHub sudah terhubung.'
        : 'Hubungkan akun GitHub Anda.',
      input.hasGitHubConnected ? 'complete' : 'blocked',
    ),
    stage(
      'project',
      'Project & Tim',
      `${project.title} · ${project.memberCount} anggota tim`,
      'complete',
    ),
    stage(
      'requirements',
      'Persyaratan',
      missingRequirements.length === 0
        ? 'Semua persyaratan wajib sudah lengkap.'
        : `${missingRequirements.length} persyaratan wajib belum lengkap.`,
      missingRequirements.length === 0 ? 'complete' : 'blocked',
    ),
    stage(
      'evidence',
      'Dokumen & Bukti',
      missingEvidence.length === 0
        ? 'Repository, persetujuan, dan bukti stakeholder tersedia.'
        : `${missingEvidence.length} bukti wajib belum tersedia.`,
      missingEvidence.length === 0 ? 'complete' : 'blocked',
    ),
    stage(
      'submission',
      'Submission',
      submitted
        ? 'Project sudah dikirim untuk review.'
        : readiness.canSubmit
          ? 'Project siap dikirim untuk review.'
          : 'Lengkapi semua syarat sebelum mengirim.',
      submitted
        ? 'complete'
        : readiness.canSubmit
          ? project.isOwner
            ? 'current'
            : 'waiting'
          : 'blocked',
    ),
    stage(
      'review',
      'Review & Revisi',
      afterReview
        ? 'Tahap review sudah diselesaikan.'
        : project.status === 'REVISION_NEEDED'
          ? 'Project memerlukan revisi.'
          : `${reviewProgress.completed}/${reviewProgress.total} review selesai.`,
      afterReview
        ? 'complete'
        : ['SUBMITTED', 'IN_REVIEW', 'REVISION_NEEDED'].includes(project.status)
          ? 'current'
          : 'upcoming',
    ),
    stage(
      'presentation',
      'Presentasi',
      project.presentationSchedule
        ? `${project.presentationSchedule.startTime}${project.presentationSchedule.location ? ` · ${project.presentationSchedule.location}` : ''}`
        : 'Menunggu jadwal presentasi.',
      final || project.presentationSchedule?.presentationStatus === 'completed'
        ? 'complete'
        : ['READY_FOR_PRESENTATION', 'PRESENTATION_SCHEDULED'].includes(project.status)
          ? 'current'
          : 'upcoming',
    ),
    stage(
      'result',
      'Hasil Akhir',
      project.status === 'APPROVED'
        ? 'Project dinyatakan disetujui.'
        : project.status === 'REJECTED'
          ? 'Project dinyatakan belum disetujui.'
          : 'Hasil tersedia setelah seluruh proses selesai.',
      final ? 'complete' : 'upcoming',
    ),
  ];

  let nextAction: JourneyAction;

  if (isSubmittableStatus(project.status)) {
    if (!readiness.canSubmit) {
      nextAction = actionFromBlocker(readiness.blockers[0]);
    } else if (!project.isOwner) {
      nextAction = {
        label: 'Menunggu ketua tim mengirim project',
        description: 'Semua persyaratan sudah lengkap. Hanya ketua project yang dapat mengirim.',
        href: `/mahasiswa/projects/${project.id}`,
        tone: 'neutral',
      };
    } else {
      nextAction = {
        label:
          project.status === 'REVISION_NEEDED'
            ? 'Kirim ulang setelah revisi'
            : 'Kirim project untuk review',
        description: 'Semua persyaratan wajib sudah lengkap.',
        href: `/mahasiswa/projects/${project.id}`,
        tone: 'primary',
      };
    }
  } else if (project.status === 'SUBMITTED') {
    nextAction = {
      label: 'Menunggu penugasan dosen',
      description: 'Project sudah diterima dan menunggu proses administrasi.',
      href: `/mahasiswa/projects/${project.id}`,
      tone: 'neutral',
    };
  } else if (project.status === 'IN_REVIEW') {
    nextAction = {
      label: 'Pantau proses review',
      description: `${reviewProgress.completed} dari ${reviewProgress.total} review selesai.`,
      href: `/mahasiswa/projects/${project.id}`,
      tone: 'primary',
    };
  } else if (project.status === 'READY_FOR_PRESENTATION') {
    nextAction = {
      label: 'Menunggu jadwal presentasi',
      description: 'Project sudah di-ACC dan menunggu penjadwalan.',
      href: '/mahasiswa/presentations',
      tone: 'neutral',
    };
  } else if (project.status === 'PRESENTATION_SCHEDULED') {
    nextAction = {
      label: 'Lihat jadwal presentasi',
      description: 'Periksa tanggal, waktu, lokasi, dan catatan ujian.',
      href: '/mahasiswa/presentations',
      tone: 'primary',
    };
  } else if (project.status === 'APPROVED') {
    nextAction = {
      label: 'Lihat hasil akhir',
      description: 'Project telah disetujui. Lihat nilai dan feedback dosen.',
      href: '/mahasiswa/reviews',
      tone: 'success',
    };
  } else {
    nextAction = {
      label: 'Lihat feedback penilaian',
      description: 'Periksa hasil penilaian dan arahan dosen.',
      href: '/mahasiswa/reviews',
      tone: 'warning',
    };
  }

  const completedStages = stages.filter((item) => item.status === 'complete').length;

  return {
    projectId: project.id,
    projectTitle: project.title,
    projectStatus: project.status,
    progress: Math.round((completedStages / stages.length) * 100),
    stages,
    nextAction,
    readiness,
    reviewProgress,
    presentation: project.presentationSchedule,
    deadline: getDeadline(input.submissionDeadline, now),
  };
}
