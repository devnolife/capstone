import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/projects/[id]/discussions - List discussions for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        mahasiswaId: true,
        assignments: { select: { dosenId: true } },
        members: { select: { userId: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    const role = session.user.role;
    const userId = session.user.id;

    // Check access: project owner, assigned dosen, team member, or admin
    const isOwner = project.mahasiswaId === userId;
    const isAssignedDosen = project.assignments.some(a => a.dosenId === userId);
    const isTeamMember = project.members.some(m => m.userId === userId);
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isAssignedDosen && !isTeamMember && !isAdmin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Fetch top-level discussions with replies (2 levels deep)
    const discussions = await prisma.projectDiscussion.findMany({
      where: {
        projectId,
        parentId: null, // Only top-level
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            image: true,
            nim: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                role: true,
                image: true,
                nim: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// POST /api/projects/[id]/discussions - Create a discussion or reply
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length < 2) {
      return NextResponse.json(
        { error: 'Pesan minimal 2 karakter' },
        { status: 400 },
      );
    }

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        mahasiswaId: true,
        assignments: { select: { dosenId: true } },
        members: { select: { userId: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    const role = session.user.role;
    const userId = session.user.id;

    const isOwner = project.mahasiswaId === userId;
    const isAssignedDosen = project.assignments.some(a => a.dosenId === userId);
    const isTeamMember = project.members.some(m => m.userId === userId);
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isAssignedDosen && !isTeamMember && !isAdmin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // If replying, verify parent exists and belongs to same project
    if (parentId) {
      const parent = await prisma.projectDiscussion.findUnique({
        where: { id: parentId },
        select: { projectId: true },
      });

      if (!parent || parent.projectId !== projectId) {
        return NextResponse.json(
          { error: 'Pesan induk tidak ditemukan' },
          { status: 404 },
        );
      }
    }

    const discussion = await prisma.projectDiscussion.create({
      data: {
        projectId,
        authorId: userId,
        parentId: parentId || null,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            image: true,
            nim: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                role: true,
                image: true,
                nim: true,
              },
            },
          },
        },
      },
    });

    // Send notifications to all project participants (except the author)
    const participantIds = new Set<string>();
    participantIds.add(project.mahasiswaId);
    project.assignments.forEach(a => participantIds.add(a.dosenId));
    project.members.forEach(m => {
      if (m.userId) participantIds.add(m.userId);
    });
    participantIds.delete(userId); // Don't notify the author

    const truncatedContent = content.trim().length > 80
      ? content.trim().substring(0, 80) + '...'
      : content.trim();

    const notificationPromises = Array.from(participantIds).map(participantId =>
      createNotification({
        userId: participantId,
        title: parentId ? 'Balasan Diskusi Baru' : 'Diskusi Baru',
        message: `${session.user.name} ${parentId ? 'membalas diskusi' : 'memulai diskusi'} di project "${project.title}": "${truncatedContent}"`,
        type: 'system',
        link: role === 'DOSEN_PENGUJI'
          ? `/dosen/projects/${projectId}`
          : role === 'ADMIN'
            ? `/admin/projects/${projectId}`
            : `/mahasiswa/projects/${projectId}`,
      }),
    );

    await Promise.allSettled(notificationPromises);

    return NextResponse.json(discussion, { status: 201 });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
