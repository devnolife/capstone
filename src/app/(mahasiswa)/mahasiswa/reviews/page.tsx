import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { MahasiswaReviewsContent } from '@/components/mahasiswa/reviews-content';

export default async function MahasiswaReviewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch reviews for user's projects
  const reviews = await prisma.review.findMany({
    where: {
      project: { mahasiswaId: session.user.id },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          username: true,
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

  // Calculate stats
  const stats = {
    totalReviews: reviews.length,
    completedReviews: reviews.filter((r) => r.status === 'COMPLETED').length,
    pendingReviews: reviews.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length,
    averageScore: reviews.filter((r) => r.overallScore !== null).length > 0
      ? Math.round(
          reviews.filter((r) => r.overallScore !== null)
            .reduce((acc, r) => acc + (r.overallScore || 0), 0) /
          reviews.filter((r) => r.overallScore !== null).length
        )
      : null,
  };

  return (
    <MahasiswaReviewsContent
      reviews={reviews}
      stats={stats}
    />
  );
}
