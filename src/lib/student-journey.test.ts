import { describe, expect, it } from 'vitest';
import {
  buildStudentJourney,
  checkSubmissionReadiness,
} from './student-journey';

const completeRequirements = {
  tujuanProyek: 'Menyederhanakan proses capstone',
  teknologi: 'Next.js, PostgreSQL',
  integrasiMatakuliah: 'Integrasi RPL dan basis data',
  metodologi: 'Agile',
  ruangLingkup: 'Aplikasi web',
  sumberDayaBatasan: 'Satu semester',
  fiturUtama: 'Manajemen project',
  analisisTemuan: 'Hasil pengujian',
  presentasiUjian: 'Skenario demonstrasi',
  stakeholder: 'Program studi',
  kepatuhanEtika: 'Persetujuan data',
};

const readyDraft = {
  projectId: 'project-1',
  status: 'DRAFT',
  githubRepoUrl: 'https://github.com/example/capstone',
  requirements: completeRequirements,
  documentTypes: ['CONSENT_AGREEMENT'],
  stakeholderDocumentCount: 1,
  submissionDeadline: '2026-07-20T15:59:59.999Z',
  now: new Date('2026-07-18T00:00:00.000Z'),
};

describe('checkSubmissionReadiness', () => {
  it('returns actionable blockers for every missing mandatory submission item', () => {
    const result = checkSubmissionReadiness({
      projectId: 'project-1',
      status: 'DRAFT',
      githubRepoUrl: null,
      requirements: null,
      documentTypes: [],
      stakeholderDocumentCount: 0,
      submissionDeadline: null,
      now: new Date('2026-07-18T00:00:00.000Z'),
    });

    expect(result.canSubmit).toBe(false);
    expect(result.blockers.filter((item) => item.code === 'missing_requirement')).toHaveLength(11);
    expect(result.blockers.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        'github_repository',
        'consent_document',
        'stakeholder_document',
      ]),
    );
  });

  it('allows a complete draft before the semester deadline', () => {
    const result = checkSubmissionReadiness(readyDraft);

    expect(result.canSubmit).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it('blocks submission after the semester deadline', () => {
    const result = checkSubmissionReadiness({
      ...readyDraft,
      submissionDeadline: '2026-07-17T15:59:59.999Z',
    });

    expect(result.canSubmit).toBe(false);
    expect(result.blockers).toContainEqual(
      expect.objectContaining({ code: 'submission_deadline' }),
    );
  });

  it('allows resubmission while a project needs revision', () => {
    const result = checkSubmissionReadiness({
      ...readyDraft,
      status: 'REVISION_NEEDED',
    });

    expect(result.canSubmit).toBe(true);
  });
});

describe('buildStudentJourney', () => {
  it('guides a student without a project to create one', () => {
    const result = buildStudentJourney({
      hasGitHubConnected: false,
      project: null,
      submissionDeadline: null,
      now: new Date('2026-07-18T00:00:00.000Z'),
    });

    expect(result.nextAction).toEqual(
      expect.objectContaining({
        label: 'Buat project pertama',
        href: '/mahasiswa/projects/new',
      }),
    );
    expect(result.stages.find((stage) => stage.id === 'project')?.status).toBe('current');
  });

  it('shows the first missing requirement as the next action for a draft', () => {
    const result = buildStudentJourney({
      hasGitHubConnected: true,
      project: {
        id: 'project-1',
        title: 'Sistem Capstone',
        status: 'DRAFT',
        githubRepoUrl: 'https://github.com/example/capstone',
        requirements: { ...completeRequirements, metodologi: null },
        documentTypes: ['CONSENT_AGREEMENT'],
        stakeholderDocumentCount: 1,
        reviews: [],
        presentationSchedule: null,
        memberCount: 2,
        isOwner: true,
      },
      submissionDeadline: readyDraft.submissionDeadline,
      now: readyDraft.now,
    });

    expect(result.nextAction.label).toBe('Lengkapi Metodologi');
    expect(result.nextAction.href).toBe('/mahasiswa/documents/project-1');
    expect(result.stages.find((stage) => stage.id === 'requirements')?.status).toBe('blocked');
  });

  it('shows review progress while a submitted project is being reviewed', () => {
    const result = buildStudentJourney({
      hasGitHubConnected: true,
      project: {
        id: 'project-1',
        title: 'Sistem Capstone',
        status: 'IN_REVIEW',
        githubRepoUrl: readyDraft.githubRepoUrl,
        requirements: completeRequirements,
        documentTypes: ['CONSENT_AGREEMENT'],
        stakeholderDocumentCount: 1,
        reviews: [{ status: 'COMPLETED' }, { status: 'IN_PROGRESS' }],
        presentationSchedule: null,
        memberCount: 2,
        isOwner: true,
      },
      submissionDeadline: readyDraft.submissionDeadline,
      now: readyDraft.now,
    });

    expect(result.reviewProgress).toEqual({ completed: 1, total: 2 });
    expect(result.nextAction.label).toBe('Pantau proses review');
    expect(result.stages.find((stage) => stage.id === 'review')?.status).toBe('current');
  });

  it('tells a team member to wait for the project owner when submission is ready', () => {
    const result = buildStudentJourney({
      hasGitHubConnected: true,
      project: {
        id: 'project-1',
        title: 'Sistem Capstone',
        status: 'DRAFT',
        githubRepoUrl: readyDraft.githubRepoUrl,
        requirements: completeRequirements,
        documentTypes: ['CONSENT_AGREEMENT'],
        stakeholderDocumentCount: 1,
        reviews: [],
        presentationSchedule: null,
        memberCount: 2,
        isOwner: false,
      },
      submissionDeadline: readyDraft.submissionDeadline,
      now: readyDraft.now,
    });

    expect(result.nextAction.label).toBe('Menunggu ketua tim mengirim project');
    expect(result.nextAction.href).toBe('/mahasiswa/projects/project-1');
  });

  it('surfaces the latest presentation schedule', () => {
    const result = buildStudentJourney({
      hasGitHubConnected: true,
      project: {
        id: 'project-1',
        title: 'Sistem Capstone',
        status: 'PRESENTATION_SCHEDULED',
        githubRepoUrl: readyDraft.githubRepoUrl,
        requirements: completeRequirements,
        documentTypes: ['CONSENT_AGREEMENT'],
        stakeholderDocumentCount: 1,
        reviews: [{ status: 'COMPLETED' }, { status: 'COMPLETED' }],
        presentationSchedule: {
          scheduledDate: '2026-07-25T00:00:00.000Z',
          startTime: '09:00',
          endTime: '10:00',
          location: 'Lab Informatika',
          presentationStatus: 'scheduled',
        },
        memberCount: 2,
        isOwner: true,
      },
      submissionDeadline: readyDraft.submissionDeadline,
      now: readyDraft.now,
    });

    expect(result.nextAction.label).toBe('Lihat jadwal presentasi');
    expect(result.presentation?.location).toBe('Lab Informatika');
    expect(result.stages.find((stage) => stage.id === 'presentation')?.status).toBe('current');
  });
});
