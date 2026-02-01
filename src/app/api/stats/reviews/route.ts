import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/stats/reviews - Get review statistics for dosen
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // For admin, get all stats. For dosen, get their own stats
    const isAdmin = userRole === 'ADMIN';
    const dosenFilter = isAdmin ? {} : { reviewerId: userId };
    const assignmentFilter = isAdmin ? {} : { dosenId: userId };

    // Fetch all review data for the user
    const [
      reviews,
      assignments,
      rubriks,
      allReviewScores,
      allMemberScores,
      projectsBySemester,
    ] = await Promise.all([
      // All reviews
      prisma.review.findMany({
        where: dosenFilter,
        include: {
          project: {
            select: {
              id: true,
              title: true,
              semester: true,
              tahunAkademik: true,
              status: true,
              mahasiswa: {
                select: { name: true },
              },
            },
          },
          scores: {
            include: {
              rubrik: true,
            },
          },
          memberScores: {
            include: {
              rubrik: true,
              member: {
                include: {
                  user: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Assignments count
      prisma.projectAssignment.count({
        where: assignmentFilter,
      }),

      // Active rubriks
      prisma.rubrikPenilaian.findMany({
        where: { isActive: true },
        orderBy: { urutan: 'asc' },
      }),

      // All review scores for statistics
      prisma.reviewScore.findMany({
        where: {
          review: dosenFilter,
        },
        include: {
          rubrik: true,
          review: {
            select: { status: true },
          },
        },
      }),

      // All member scores for individual statistics
      prisma.memberReviewScore.findMany({
        where: {
          review: dosenFilter,
        },
        include: {
          rubrik: true,
          review: {
            select: { status: true },
          },
        },
      }),

      // Projects grouped by semester
      prisma.project.groupBy({
        by: ['semester', 'tahunAkademik'],
        where: isAdmin
          ? {}
          : {
              assignments: {
                some: { dosenId: userId },
              },
            },
        _count: {
          id: true,
        },
      }),
    ]);

    // Calculate statistics
    const totalReviews = reviews.length;
    const completedReviews = reviews.filter((r) => r.status === 'COMPLETED').length;
    const inProgressReviews = reviews.filter((r) => r.status === 'IN_PROGRESS').length;
    const pendingReviews = reviews.filter((r) => r.status === 'PENDING').length;

    // Average score calculation (only for completed reviews)
    const completedReviewsWithScores = reviews.filter(
      (r) => r.status === 'COMPLETED' && r.overallScore !== null
    );
    const averageScore =
      completedReviewsWithScores.length > 0
        ? completedReviewsWithScores.reduce((sum, r) => sum + (r.overallScore || 0), 0) /
          completedReviewsWithScores.length
        : 0;

    // Score distribution (grouped by ranges)
    const scoreDistribution = {
      excellent: 0, // 90-100
      good: 0, // 75-89
      average: 0, // 60-74
      belowAverage: 0, // 40-59
      poor: 0, // 0-39
    };

    completedReviewsWithScores.forEach((r) => {
      const score = r.overallScore || 0;
      if (score >= 90) scoreDistribution.excellent++;
      else if (score >= 75) scoreDistribution.good++;
      else if (score >= 60) scoreDistribution.average++;
      else if (score >= 40) scoreDistribution.belowAverage++;
      else scoreDistribution.poor++;
    });

    // Calculate average score per rubrik (only from completed reviews)
    const completedScores = allReviewScores.filter((s) => s.review.status === 'COMPLETED');
    const rubrikScoresMap = new Map<string, { total: number; count: number; name: string; kategori: string; maxScore: number }>();

    completedScores.forEach((score) => {
      const key = score.rubrikId;
      if (!rubrikScoresMap.has(key)) {
        rubrikScoresMap.set(key, {
          total: 0,
          count: 0,
          name: score.rubrik.name,
          kategori: score.rubrik.kategori,
          maxScore: score.rubrik.bobotMax,
        });
      }
      const current = rubrikScoresMap.get(key)!;
      current.total += score.score;
      current.count++;
    });

    const rubrikAverages = Array.from(rubrikScoresMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      kategori: data.kategori,
      maxScore: data.maxScore,
      averageScore: data.count > 0 ? data.total / data.count : 0,
      averagePercentage: data.count > 0 ? ((data.total / data.count) / data.maxScore) * 100 : 0,
      totalReviews: data.count,
    }));

    // Group by kategori
    const kategoriStats = rubriks.reduce((acc, rubrik) => {
      if (!acc[rubrik.kategori]) {
        acc[rubrik.kategori] = {
          kategori: rubrik.kategori,
          totalMaxScore: 0,
          totalScore: 0,
          count: 0,
        };
      }
      return acc;
    }, {} as Record<string, { kategori: string; totalMaxScore: number; totalScore: number; count: number }>);

    completedScores.forEach((score) => {
      const kategori = score.rubrik.kategori;
      if (kategoriStats[kategori]) {
        kategoriStats[kategori].totalScore += score.score;
        kategoriStats[kategori].totalMaxScore += score.maxScore;
        kategoriStats[kategori].count++;
      }
    });

    const kategoriAverages = Object.values(kategoriStats).map((stat) => ({
      kategori: stat.kategori,
      averagePercentage: stat.count > 0 ? (stat.totalScore / stat.totalMaxScore) * 100 : 0,
      totalReviews: stat.count,
    }));

    // Recent reviews timeline (last 10)
    const recentReviews = reviews.slice(0, 10).map((r) => ({
      id: r.id,
      projectTitle: r.project.title,
      mahasiswaName: r.project.mahasiswa.name,
      status: r.status,
      overallScore: r.overallScore,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    }));

    // Monthly statistics (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlyStats: Array<{
      month: string;
      year: number;
      completed: number;
      averageScore: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthReviews = reviews.filter((r) => {
        const completedDate = r.completedAt ? new Date(r.completedAt) : null;
        return (
          completedDate &&
          completedDate >= monthDate &&
          completedDate <= monthEnd &&
          r.status === 'COMPLETED'
        );
      });

      const avgScore =
        monthReviews.length > 0
          ? monthReviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / monthReviews.length
          : 0;

      monthlyStats.push({
        month: monthDate.toLocaleString('id-ID', { month: 'short' }),
        year: monthDate.getFullYear(),
        completed: monthReviews.length,
        averageScore: Math.round(avgScore * 10) / 10,
      });
    }

    // Project status breakdown (for assigned projects)
    const assignedProjects = await prisma.project.findMany({
      where: isAdmin
        ? {}
        : {
            assignments: {
              some: { dosenId: userId },
            },
          },
      select: {
        status: true,
      },
    });

    const projectStatusCounts = assignedProjects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Individual member performance (top performers)
    const completedMemberScores = allMemberScores.filter((s) => s.review.status === 'COMPLETED');
    const memberPerformance = new Map<string, { totalScore: number; maxScore: number; count: number }>();

    completedMemberScores.forEach((score) => {
      const key = score.memberId;
      if (!memberPerformance.has(key)) {
        memberPerformance.set(key, { totalScore: 0, maxScore: 0, count: 0 });
      }
      const current = memberPerformance.get(key)!;
      current.totalScore += score.score;
      current.maxScore += score.maxScore;
      current.count++;
    });

    return NextResponse.json({
      summary: {
        totalReviews,
        completedReviews,
        inProgressReviews,
        pendingReviews,
        totalAssignments: assignments,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0,
      },
      scoreDistribution,
      rubrikAverages: rubrikAverages.sort((a, b) => b.averagePercentage - a.averagePercentage),
      kategoriAverages: kategoriAverages.sort((a, b) => b.averagePercentage - a.averagePercentage),
      recentReviews,
      monthlyStats,
      projectStatusCounts,
      projectsBySemester: projectsBySemester.map((p) => ({
        semester: p.semester,
        tahunAkademik: p.tahunAkademik,
        count: p._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
