import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DocumentsListContent } from '@/components/mahasiswa/documents-list-content';

async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: { mahasiswaId: userId },
    include: {
      requirements: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export default async function MahasiswaDocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fallback kosong bila DB down / sesi fake
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  if (!session.user.id.startsWith('dev-')) {
    try {
      projects = await getProjects(session.user.id);
    } catch (error) {
      console.warn(
        '[mahasiswa/documents] DB tidak tersedia — daftar kosong:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Transform projects for the component
  const projectsWithProgress = projects.map((project) => ({
    id: project.id,
    title: project.title,
    status: project.status,
    semester: project.semester,
    updatedAt: project.updatedAt.toISOString(),
    requirements: project.requirements
      ? {
          completionPercent: project.requirements.completionPercent,
          updatedAt: project.requirements.updatedAt.toISOString(),
          judulProyek: project.requirements.judulProyek,
          deadlineDate: project.requirements.deadlineDate?.toISOString() || null,
        }
      : null,
  }));

  return <DocumentsListContent projects={projectsWithProgress} />;
}
