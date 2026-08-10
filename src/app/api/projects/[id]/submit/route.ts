import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getProjectSubmissionReadiness } from '@/lib/submission-readiness';

// POST /api/projects/[id]/submit - Submit project for review
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await getProjectSubmissionReadiness(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 },
      );
    }

    const { project: existingProject, readiness } = result;

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

    // The server is authoritative: re-check all mandatory fields and deadline
    // at the exact moment of submission.
    if (!readiness.canSubmit) {
      return NextResponse.json(
        {
          error: 'Project belum siap disubmit. Lengkapi persyaratan yang masih kurang.',
          code: 'SUBMISSION_NOT_READY',
          blockers: readiness.blockers,
        },
        { status: 400 },
      );
    }

    // Create notification for admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    const project = await prisma.$transaction(async (tx) => {
      const submittedProject = await tx.project.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });

      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: 'Project Baru Disubmit',
            message: `${existingProject.mahasiswa.name} telah mengsubmit project "${existingProject.title}" untuk direview.`,
            type: 'submission',
            link: `/admin/assignments?projectId=${submittedProject.id}`,
          })),
        });
      }

      return submittedProject;
    });

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
