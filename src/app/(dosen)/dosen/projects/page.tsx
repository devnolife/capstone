import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DosenProjectsClient } from './client';

export default async function DosenProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch all projects assigned to this dosen
  const projects = await prisma.project.findMany({
    where: {
      assignments: {
        some: { dosenId: userId },
      },
    },
    include: {
      mahasiswa: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          profilePhoto: true,
        },
      },
      reviews: {
        where: { reviewerId: userId },
        select: { id: true, status: true },
      },
      _count: {
        select: {
          documents: true,
          reviews: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Transform data for client
  const projectsData = projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    semester: project.semester,
    tahunAkademik: project.tahunAkademik,
    githubRepoUrl: project.githubRepoUrl,
    submittedAt: project.submittedAt?.toISOString() || null,
    mahasiswa: {
      id: project.mahasiswa.id,
      name: project.mahasiswa.name,
      username: project.mahasiswa.username,
      image: project.mahasiswa.image,
      profilePhoto: project.mahasiswa.profilePhoto,
    },
    _count: project._count,
    hasMyReview: project.reviews.length > 0,
    myReviewStatus: project.reviews[0]?.status || null,
  }));

  return <DosenProjectsClient projects={projectsData} />;
}
