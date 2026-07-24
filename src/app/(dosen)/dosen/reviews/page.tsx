import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DosenReviewsClient } from './client';

async function getReviews(userId: string) {
  return prisma.review.findMany({
    where: { reviewerId: userId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
          mahasiswa: {
            select: {
              name: true,
              username: true,
              image: true,
              profilePhoto: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

async function getPendingAssignments(userId: string) {
  return prisma.projectAssignment.findMany({
    where: {
      dosenId: userId,
      project: {
        reviews: {
          none: { reviewerId: userId },
        },
        status: {
          in: ['SUBMITTED', 'IN_REVIEW'],
        },
      },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
          submittedAt: true,
          mahasiswa: {
            select: {
              name: true,
              username: true,
              image: true,
              profilePhoto: true,
            },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });
}

export default async function DosenReviewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fallback kosong bila DB down / sesi fake
  let reviews: Awaited<ReturnType<typeof getReviews>> = [];
  let pendingAssignments: Awaited<ReturnType<typeof getPendingAssignments>> = [];
  if (!userId.startsWith('dev-')) {
    try {
      [reviews, pendingAssignments] = await Promise.all([
        getReviews(userId),
        getPendingAssignments(userId),
      ]);
    } catch (error) {
      console.warn(
        '[dosen/reviews] DB tidak tersedia — daftar kosong:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Transform data for client
  const reviewsData = reviews.map((review) => ({
    id: review.id,
    status: review.status,
    overallScore: review.overallScore,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    project: {
      id: review.project.id,
      title: review.project.title,
      status: review.project.status,
      mahasiswa: {
        name: review.project.mahasiswa.name,
        username: review.project.mahasiswa.username,
        image: review.project.mahasiswa.image,
        profilePhoto: review.project.mahasiswa.profilePhoto,
      },
    },
  }));

  const pendingData = pendingAssignments.map((assignment) => ({
    id: assignment.id,
    project: {
      id: assignment.project.id,
      title: assignment.project.title,
      status: assignment.project.status,
      submittedAt: assignment.project.submittedAt?.toISOString() || null,
      mahasiswa: {
        name: assignment.project.mahasiswa.name,
        username: assignment.project.mahasiswa.username,
        image: assignment.project.mahasiswa.image,
        profilePhoto: assignment.project.mahasiswa.profilePhoto,
      },
    },
  }));

  return <DosenReviewsClient reviews={reviewsData} pendingAssignments={pendingData} />;
}
