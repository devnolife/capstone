import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DocumentsListContent } from '@/components/mahasiswa/documents-list-content';

export default async function MahasiswaDocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's projects with requirements
  const projects = await prisma.project.findMany({
    where: { mahasiswaId: session.user.id },
    include: {
      requirements: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

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
