import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function findWorkLog(projectId: string, logId: string) {
  return prisma.projectWorkLog.findFirst({
    where: { id: logId, projectId },
    include: {
      project: { select: { mahasiswaId: true } },
    },
  });
}

// PUT /api/projects/[id]/work-logs/[logId] - Update a work log entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, logId } = await params;
    const workLog = await findWorkLog(id, logId);
    if (!workLog) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const isAuthor = workLog.authorId === session.user.id;
    const isOwner = workLog.project.mahasiswaId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isAuthor && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data: { dayNumber?: number; workDate?: Date; activity?: string } = {};

    if (body.dayNumber !== undefined) {
      const parsedDay = Number(body.dayNumber);
      if (!Number.isInteger(parsedDay) || parsedDay < 1) {
        return NextResponse.json(
          { error: 'dayNumber harus berupa angka hari ke-N (minimal 1)' },
          { status: 400 },
        );
      }
      data.dayNumber = parsedDay;
    }

    if (body.workDate !== undefined) {
      const parsedDate = new Date(body.workDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'workDate tidak valid' }, { status: 400 });
      }
      data.workDate = parsedDate;
    }

    if (body.activity !== undefined) {
      if (typeof body.activity !== 'string' || body.activity.trim().length < 10) {
        return NextResponse.json(
          { error: 'Deskripsi pekerjaan minimal 10 karakter' },
          { status: 400 },
        );
      }
      data.activity = body.activity.trim();
    }

    const updated = await prisma.projectWorkLog.update({
      where: { id: logId },
      data,
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update work log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/work-logs/[logId] - Delete a work log entry
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, logId } = await params;
    const workLog = await findWorkLog(id, logId);
    if (!workLog) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const isAuthor = workLog.authorId === session.user.id;
    const isOwner = workLog.project.mahasiswaId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isAuthor && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.projectWorkLog.delete({ where: { id: logId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete work log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
