import 'server-only';

import prisma from '@/lib/prisma';
import { resolveProjectSubmissionDeadline } from '@/lib/semester';
import { checkSubmissionReadiness } from '@/lib/student-journey';

export async function getProjectSubmissionReadiness(projectId: string) {
  const [project, activeSemesters] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        status: true,
        mahasiswaId: true,
        semester: true,
        tahunAkademik: true,
        githubRepoUrl: true,
        mahasiswa: { select: { name: true } },
        members: { select: { userId: true } },
        requirements: {
          select: {
            tujuanProyek: true,
            teknologi: true,
            integrasiMatakuliah: true,
            metodologi: true,
            ruangLingkup: true,
            sumberDayaBatasan: true,
            fiturUtama: true,
            analisisTemuan: true,
            presentasiUjian: true,
            stakeholder: true,
            kepatuhanEtika: true,
          },
        },
        documents: { select: { type: true } },
        _count: { select: { stakeholderDocuments: true } },
      },
    }),
    prisma.semester.findMany({
      where: { isActive: true },
      select: {
        name: true,
        tahunAkademik: true,
        isActive: true,
        submissionDeadline: true,
      },
    }),
  ]);

  if (!project) return null;

  const submissionDeadline = resolveProjectSubmissionDeadline(
    {
      semester: project.semester,
      tahunAkademik: project.tahunAkademik,
    },
    activeSemesters,
  );

  const readiness = checkSubmissionReadiness({
    projectId: project.id,
    status: project.status,
    githubRepoUrl: project.githubRepoUrl,
    requirements: project.requirements,
    documentTypes: project.documents.map((document) => document.type),
    stakeholderDocumentCount: project._count.stakeholderDocuments,
    submissionDeadline,
  });

  return { project, submissionDeadline, readiness };
}
