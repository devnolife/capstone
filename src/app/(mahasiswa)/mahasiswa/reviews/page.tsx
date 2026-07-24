import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { MahasiswaReviewsContent } from '@/components/mahasiswa/reviews-content';

async function getReviews(userId: string) {
  return prisma.review.findMany({
    where: {
      project: { mahasiswaId: userId },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
          members: {
            select: {
              id: true,
              name: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
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
      memberScores: {
        include: {
          member: {
            select: {
              id: true,
              name: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
          rubrik: {
            select: {
              id: true,
              name: true,
              kategori: true,
              bobotMax: true,
              tipe: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export default async function MahasiswaReviewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fallback kosong bila DB down / sesi fake
  let reviews: Awaited<ReturnType<typeof getReviews>> = [];
  if (!session.user.id.startsWith('dev-')) {
    try {
      reviews = await getReviews(session.user.id);
    } catch (error) {
      console.warn(
        '[mahasiswa/reviews] DB tidak tersedia — daftar kosong:',
        error instanceof Error ? error.message : error,
      );
    }
  }

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
