import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/assignments - Get all project assignments
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const dosenId = searchParams.get('dosenId');

    const whereClause: Record<string, string> = {};
    if (projectId) whereClause.projectId = projectId;
    if (dosenId) whereClause.dosenId = dosenId;

    const assignments = await prisma.projectAssignment.findMany({
      where: whereClause,
      include: {
        project: {
          include: {
            mahasiswa: {
              select: {
                id: true,
                name: true,
                email: true,
                nim: true,
              },
            },
          },
        },
        dosen: {
          select: {
            id: true,
            name: true,
            email: true,
            nip: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// POST /api/assignments - Create new assignment
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, dosenId } = body;

    if (!projectId || !dosenId) {
      return NextResponse.json(
        { error: 'Project ID dan Dosen ID diperlukan' },
        { status: 400 },
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check if dosen exists and has the correct role
    const dosen = await prisma.user.findUnique({
      where: { id: dosenId },
    });

    if (!dosen || dosen.role !== 'DOSEN_PENGUJI') {
      return NextResponse.json(
        { error: 'Dosen tidak ditemukan atau bukan dosen penguji' },
        { status: 404 },
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.projectAssignment.findUnique({
      where: {
        projectId_dosenId: {
          projectId,
          dosenId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Penugasan sudah ada' },
        { status: 400 },
      );
    }

    // Create assignment
    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId,
        dosenId,
      },
      include: {
        project: {
          include: {
            mahasiswa: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        dosen: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create a review entry for the dosen
    await prisma.review.create({
      data: {
        projectId,
        reviewerId: dosenId,
        status: 'PENDING',
      },
    });

    // Create notification for dosen
    await prisma.notification.create({
      data: {
        userId: dosenId,
        title: 'Penugasan Baru',
        message: `Anda ditugaskan untuk mereview project "${project.title}"`,
        type: 'assignment',
        link: `/dosen/projects/${projectId}/review`,
      },
    });

    // Create notification for mahasiswa
    await prisma.notification.create({
      data: {
        userId: project.mahasiswaId,
        title: 'Dosen Penguji Ditugaskan',
        message: `${dosen.name} ditugaskan sebagai penguji untuk project Anda`,
        type: 'assignment',
        link: `/mahasiswa/projects/${projectId}`,
      },
    });

    return NextResponse.json(
      {
        message: 'Penugasan berhasil dibuat',
        assignment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// DELETE /api/assignments - Delete assignment
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID diperlukan' },
        { status: 400 },
      );
    }

    // Get the assignment first
    const assignment = await prisma.projectAssignment.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Penugasan tidak ditemukan' },
        { status: 404 },
      );
    }

    // Delete the associated review if exists
    await prisma.review.deleteMany({
      where: {
        projectId: assignment.projectId,
        reviewerId: assignment.dosenId,
      },
    });

    // Delete the assignment
    await prisma.projectAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Penugasan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
