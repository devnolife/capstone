import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProjectDetailContent } from '@/components/mahasiswa/project-detail-content';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      mahasiswa: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      requirements: true,
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          comments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          scores: {
            include: {
              rubrik: true,
            },
          },
        },
      },
      assignments: {
        include: {
          dosen: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
      stakeholderDocuments: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Check access
  if (
    project.mahasiswaId !== session.user.id &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/mahasiswa/dashboard');
  }

  const canEdit =
    project.status === 'DRAFT' || project.status === 'REVISION_NEEDED';

  return (
    <ProjectDetailContent
      project={project}
      canEdit={canEdit}
    />
  );
}
