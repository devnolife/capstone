import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function getProjectAccess(projectId: string, userId: string) {
  const [project, user] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        status: true,
        mahasiswaId: true,
        members: { select: { userId: true } },
        assignments: { select: { dosenId: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
  ]);

  if (!project) return null;

  const isOwner = project.mahasiswaId === userId;
  const isMember = project.members.some((m) => m.userId === userId);
  const isAssignedDosen = project.assignments.some((a) => a.dosenId === userId);
  const isAdmin = user?.role === 'ADMIN';
  const isDosen = user?.role === 'DOSEN_PENGUJI';

  return {
    project,
    canRead: isOwner || isMember || isAssignedDosen || isAdmin || isDosen,
    canWrite: isOwner || isMember || isAdmin,
  };
}

// GET /api/projects/[id]/work-logs - List work logs for a project
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const access = await getProjectAccess(id, session.user.id);

    if (!access) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }
    if (!access.canRead) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const workLogs = await prisma.projectWorkLog.findMany({
      where: { projectId: id },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy: [{ dayNumber: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ data: workLogs });
  } catch (error) {
    console.error('Get work logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects/[id]/work-logs - Add a work log entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const access = await getProjectAccess(id, session.user.id);

    if (!access) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }
    if (!access.canWrite) {
      return NextResponse.json(
        { error: 'Hanya pemilik atau anggota tim yang dapat menambah laporan pengerjaan' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { dayNumber, workDate, activity } = body;

    const parsedDay = Number(dayNumber);
    if (!Number.isInteger(parsedDay) || parsedDay < 1) {
      return NextResponse.json(
        { error: 'dayNumber harus berupa angka hari ke-N (minimal 1)' },
        { status: 400 },
      );
    }

    const parsedDate = workDate ? new Date(workDate) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'workDate tidak valid' },
        { status: 400 },
      );
    }

    if (typeof activity !== 'string' || activity.trim().length < 10) {
      return NextResponse.json(
        { error: 'Deskripsi pekerjaan minimal 10 karakter' },
        { status: 400 },
      );
    }

    const workLog = await prisma.projectWorkLog.create({
      data: {
        projectId: id,
        authorId: session.user.id,
        dayNumber: parsedDay,
        workDate: parsedDate,
        activity: activity.trim(),
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: workLog }, { status: 201 });
  } catch (error) {
    console.error('Create work log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
