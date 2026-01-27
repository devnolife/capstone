import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { ReviewStatus } from '@/generated/prisma';

// GET /api/reviews - Get reviews
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let whereClause = {};

    if (session.user.role === 'DOSEN_PENGUJI') {
      whereClause = { reviewerId: session.user.id };
    } else if (session.user.role === 'MAHASISWA') {
      whereClause = {
        project: { mahasiswaId: session.user.id },
      };
    }

    if (projectId) {
      whereClause = { ...whereClause, projectId };
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
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
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// POST /api/reviews - Create review
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      session.user.role !== 'DOSEN_PENGUJI' &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Hanya dosen yang dapat membuat review' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      projectId,
      overallComment,
      overallScore,
      scores,
      comments,
      status,
    } = body;

    // Check if project exists and is assigned to this dosen
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check if project is ready for review (has been submitted)
    const reviewableStatuses = ['SUBMITTED', 'IN_REVIEW', 'REVISION_NEEDED', 'APPROVED'];
    if (!reviewableStatuses.includes(project.status)) {
      return NextResponse.json(
        { error: 'Project belum siap untuk direview' },
        { status: 400 },
      );
    }

    // For dosen, either they are assigned OR they can review any submitted project
    // Admin can always review
    const isAssigned = project.assignments.some(
      (a) => a.dosenId === session.user.id,
    );
    const isAdmin = session.user.role === 'ADMIN';
    const isDosen = session.user.role === 'DOSEN_PENGUJI';

    // Allow dosen to review any submitted project (auto-assign if needed)
    if (!isAssigned && !isAdmin && !isDosen) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk mereview project ini' },
        { status: 403 },
      );
    }

    // Auto-assign dosen to project if not already assigned
    if (isDosen && !isAssigned) {
      await prisma.projectAssignment.create({
        data: {
          projectId,
          dosenId: session.user.id,
        },
      });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        projectId_reviewerId: {
          projectId,
          reviewerId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review sudah ada. Gunakan PUT untuk update.' },
        { status: 400 },
      );
    }

    // Create review with scores and comments
    const review = await prisma.review.create({
      data: {
        projectId,
        reviewerId: session.user.id,
        overallComment,
        overallScore,
        status: (status as ReviewStatus) || 'IN_PROGRESS',
        completedAt: status === 'COMPLETED' ? new Date() : null,
        scores: {
          create:
            scores?.map(
              (s: { rubrikId: string; score: number; feedback?: string }) => ({
                rubrikId: s.rubrikId,
                score: s.score,
                feedback: s.feedback,
              }),
            ) || [],
        },
        comments: {
          create:
            comments?.map(
              (c: {
                content: string;
                filePath?: string;
                lineStart?: number;
                lineEnd?: number;
              }) => ({
                content: c.content,
                filePath: c.filePath,
                lineStart: c.lineStart,
                lineEnd: c.lineEnd,
              }),
            ) || [],
        },
      },
      include: {
        scores: {
          include: { rubrik: true },
        },
        comments: true,
      },
    });

    // Update project status
    if (status === 'COMPLETED') {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'IN_REVIEW' },
      });
    }

    return NextResponse.json(
      {
        message: 'Review berhasil dibuat',
        review,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
