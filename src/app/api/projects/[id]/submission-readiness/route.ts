import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getProjectSubmissionReadiness } from '@/lib/submission-readiness';

// GET /api/projects/[id]/submission-readiness - Check the latest submission gate
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
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

    const isOwner = result.project.mahasiswaId === session.user.id;
    const isMember = result.project.members.some(
      (member) => member.userId === session.user.id,
    );
    const canInspect = isOwner || isMember || session.user.role === 'ADMIN';

    if (!canInspect) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      ...result.readiness,
      isOwner,
      submissionDeadline: result.submissionDeadline,
    });
  } catch (error) {
    console.error('Error checking project submission readiness:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
