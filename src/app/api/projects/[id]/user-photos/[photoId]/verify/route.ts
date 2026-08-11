import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { downloadFile } from '@/lib/minio';
import { verifyUserPhoto } from '@/lib/face-verification';

// POST /api/projects/[id]/user-photos/[photoId]/verify
// Jalankan ulang verifikasi wajah (HuggingFace) untuk foto yang PENDING/gagal.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, photoId } = await params;
    const photo = await prisma.projectUserPhoto.findFirst({
      where: { id: photoId, projectId: id },
      include: {
        project: {
          select: {
            mahasiswaId: true,
            members: { select: { userId: true } },
          },
        },
      },
    });
    if (!photo) {
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 });
    }

    const isUploader = photo.uploadedById === session.user.id;
    const isOwner = photo.project.mahasiswaId === session.user.id;
    const isMember = photo.project.members.some(
      (m) => m.userId === session.user.id,
    );
    const isAdmin = session.user.role === 'ADMIN';
    const isDosen = session.user.role === 'DOSEN_PENGUJI';
    if (!isUploader && !isOwner && !isMember && !isAdmin && !isDosen) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const buffer = await downloadFile(photo.fileKey);
    if (!buffer) {
      return NextResponse.json(
        { error: 'File foto tidak ditemukan di storage' },
        { status: 404 },
      );
    }

    const verification = await verifyUserPhoto(buffer, photo.mimeType);

    const updated = await prisma.projectUserPhoto.update({
      where: { id: photoId },
      data: {
        verificationStatus: verification.status,
        verificationResult: verification.result,
        verifiedAt: verification.status === 'PENDING' ? null : new Date(),
      },
      include: {
        uploadedBy: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Re-verify user photo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
