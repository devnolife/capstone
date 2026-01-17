import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DosenReviewsContent } from '@/components/dosen/reviews-content';

export default async function DosenReviewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch reviews by this dosen
  const reviews = await prisma.review.findMany({
    where: {
      reviewerId: session.user.id,
    },
    include: {
      project: {
        include: {
          mahasiswa: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
      scores: {
        include: {
          rubrik: true,
        },
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Fetch pending assignments (projects assigned but not yet reviewed)
  const pendingAssignments = await prisma.projectAssignment.findMany({
    where: {
      dosenId: session.user.id,
      project: {
        reviews: {
          none: {
            reviewerId: session.user.id,
          },
        },
        status: {
          in: ['SUBMITTED', 'IN_REVIEW'],
        },
      },
    },
    include: {
      project: {
        include: {
          mahasiswa: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          documents: {
            take: 3,
          },
          _count: {
            select: {
              documents: true,
            },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  // Calculate stats
  const stats = {
    totalReviews: reviews.length,
    completedReviews: reviews.filter((r) => r.status === 'COMPLETED').length,
    inProgressReviews: reviews.filter((r) => r.status === 'IN_PROGRESS').length,
    pendingAssignments: pendingAssignments.length,
  };

  return (
    <DosenReviewsContent
      reviews={reviews}
      pendingAssignments={pendingAssignments}
      stats={stats}
    />
  );
}
