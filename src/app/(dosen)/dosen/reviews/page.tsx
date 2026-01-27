import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DosenReviewsClient } from './client';

export default async function DosenReviewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch reviews by this dosen
  const reviews = await prisma.review.findMany({
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

  // Fetch pending assignments (projects assigned but not yet reviewed)
  const pendingAssignments = await prisma.projectAssignment.findMany({
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
