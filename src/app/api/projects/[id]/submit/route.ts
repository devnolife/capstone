import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/projects/[id]/submit - Submit project for review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get existing project
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        documents: true,
        mahasiswa: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check ownership
    if (
      existingProject.mahasiswaId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 403 },
      );
    }

    // Check if project can be submitted
    if (
      existingProject.status !== 'DRAFT' &&
      existingProject.status !== 'REVISION_NEEDED'
    ) {
      return NextResponse.json(
        { error: 'Project sudah disubmit atau tidak dapat disubmit' },
        { status: 400 },
      );
    }

    // Check if project has at least one document
    if (existingProject.documents.length === 0) {
      return NextResponse.json(
        { error: 'Project harus memiliki minimal satu dokumen untuk disubmit' },
        { status: 400 },
      );
    }

    // Update project status to SUBMITTED
    const project = await prisma.project.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // Create notification for admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: 'Project Baru Disubmit',
          message: `${existingProject.mahasiswa.name} telah mengsubmit project "${existingProject.title}" untuk direview.`,
          type: 'submission',
          link: `/dashboard/admin/projects?id=${project.id}`,
        })),
      });
    }

    return NextResponse.json({
      message: 'Project berhasil disubmit untuk review',
      project,
    });
  } catch (error) {
    console.error('Error submitting project:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
