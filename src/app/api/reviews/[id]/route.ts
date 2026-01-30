import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { ReviewStatus } from '@/generated/prisma';

// GET /api/reviews/[id] - Get single review
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
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
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    nim: true,
                    image: true,
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
        comments: true,
        scores: {
          include: {
            rubrik: true,
          },
        },
        memberScores: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    nim: true,
                    image: true,
                  },
                },
              },
            },
            rubrik: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check access
    const isReviewer = review.reviewerId === session.user.id;
    const isProjectOwner = review.project.mahasiswaId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isReviewer && !isProjectOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 403 },
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// PUT /api/reviews/[id] - Update review
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { overallComment, overallScore, scores, comments, status, memberScores } = body;

    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check ownership
    if (
      existingReview.reviewerId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 403 },
      );
    }

    // Update review
    const review = await prisma.review.update({
      where: { id },
      data: {
        overallComment,
        overallScore,
        status: (status as ReviewStatus) || existingReview.status,
        completedAt:
          status === 'COMPLETED' ? new Date() : existingReview.completedAt,
      },
    });

    // Update scores
    if (scores && scores.length > 0) {
      // Delete existing scores and recreate
      await prisma.reviewScore.deleteMany({
        where: { reviewId: id },
      });

      await prisma.reviewScore.createMany({
        data: scores.map(
          (s: { rubrikId: string; score: number; feedback?: string }) => ({
            reviewId: id,
            rubrikId: s.rubrikId,
            score: s.score,
            feedback: s.feedback,
          }),
        ),
      });
    }

    // Update comments
    if (comments && comments.length > 0) {
      // Delete existing comments and recreate
      await prisma.reviewComment.deleteMany({
        where: { reviewId: id },
      });

      await prisma.reviewComment.createMany({
        data: comments.map(
          (c: { content: string; filePath?: string; lineStart?: number; lineEnd?: number }) => ({
            reviewId: id,
            content: c.content,
            filePath: c.filePath,
            lineStart: c.lineStart,
            lineEnd: c.lineEnd,
          }),
        ),
      });
    }

    // Update member scores (individual assessment)
    if (memberScores && memberScores.length > 0) {
      // Delete existing member scores and recreate
      await prisma.memberReviewScore.deleteMany({
        where: { reviewId: id },
      });

      const memberScoreData = memberScores.flatMap(
        (ms: {
          memberId: string;
          scores: Array<{ rubrikId: string; score: number; maxScore: number; feedback?: string }>;
        }) =>
          ms.scores.map((s) => ({
            reviewId: id,
            memberId: ms.memberId,
            rubrikId: s.rubrikId,
            score: s.score,
            maxScore: s.maxScore,
            feedback: s.feedback,
          })),
      );

      if (memberScoreData.length > 0) {
        await prisma.memberReviewScore.createMany({
          data: memberScoreData,
        });
      }
    }

    // Update project status if review is completed
    if (status === 'COMPLETED') {
      await prisma.project.update({
        where: { id: existingReview.projectId },
        data: { status: 'IN_REVIEW' },
      });
    }

    // Fetch updated review
    const updatedReview = await prisma.review.findUnique({
      where: { id },
      include: {
        scores: {
          include: { rubrik: true },
        },
        comments: true,
        memberScores: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    nim: true,
                    image: true,
                  },
                },
              },
            },
            rubrik: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Review berhasil diperbarui',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review tidak ditemukan' },
        { status: 404 },
      );
    }

    // Only admin can delete reviews
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya admin yang dapat menghapus review' },
        { status: 403 },
      );
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Review berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
