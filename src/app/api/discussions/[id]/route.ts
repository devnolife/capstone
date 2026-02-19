import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/discussions/[id] - Edit a discussion
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length < 2) {
      return NextResponse.json(
        { error: 'Pesan minimal 2 karakter' },
        { status: 400 },
      );
    }

    // Find the discussion
    const discussion = await prisma.projectDiscussion.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Diskusi tidak ditemukan' }, { status: 404 });
    }

    // Only author can edit their own message
    if (discussion.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Anda tidak dapat mengedit pesan ini' }, { status: 403 });
    }

    const updated = await prisma.projectDiscussion.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating discussion:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// DELETE /api/discussions/[id] - Delete a discussion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const discussion = await prisma.projectDiscussion.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        replies: { select: { id: true } },
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Diskusi tidak ditemukan' }, { status: 404 });
    }

    // Only author or admin can delete
    if (discussion.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus pesan ini' }, { status: 403 });
    }

    // Delete replies first (cascade), then the discussion itself
    if (discussion.replies.length > 0) {
      await prisma.projectDiscussion.deleteMany({
        where: { parentId: id },
      });
    }

    await prisma.projectDiscussion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
