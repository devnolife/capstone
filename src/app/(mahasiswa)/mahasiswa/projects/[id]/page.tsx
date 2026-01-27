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
          nim: true,
          prodi: true,
          image: true,
          githubUsername: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              nim: true,
              prodi: true,
              image: true,
              githubUsername: true,
            },
          },
        },
        orderBy: { addedAt: 'asc' },
      },
      invitations: {
        include: {
          invitee: {
            select: {
              id: true,
              name: true,
              username: true,
              nim: true,
              prodi: true,
              image: true,
              githubUsername: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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

  // Check access - owner or team member
  const isOwner = project.mahasiswaId === session.user.id;
  const isTeamMember = project.members.some((m) => m.userId === session.user.id);
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isTeamMember && !isAdmin) {
    redirect('/mahasiswa/dashboard');
  }

  const canEdit =
    (project.status === 'DRAFT' || project.status === 'REVISION_NEEDED') && isOwner;

  return (
    <ProjectDetailContent
      project={project}
      canEdit={canEdit}
      isOwner={isOwner}
    />
  );
}
