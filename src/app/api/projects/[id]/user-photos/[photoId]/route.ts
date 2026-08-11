import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { deleteFile } from '@/lib/minio';

// PATCH /api/projects/[id]/user-photos/[photoId] - Update caption / verification
export async function PATCH(
  request: NextRequest,
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
      include: { project: { select: { mahasiswaId: true } } },
    });
    if (!photo) {
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 });
    }

    const isUploader = photo.uploadedById === session.user.id;
    const isOwner = photo.project.mahasiswaId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    const isDosen = session.user.role === 'DOSEN_PENGUJI';

    const body = await request.json();
    const data: {
      caption?: string | null;
      verificationStatus?: string;
      verificationResult?: object;
      verifiedAt?: Date;
    } = {};

    if (body.caption !== undefined) {
      if (!isUploader && !isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      data.caption =
        typeof body.caption === 'string' ? body.caption.trim() || null : null;
    }

    // Hasil verifikasi wajah (face recognition) — hanya admin/dosen
    // (atau service backend) yang boleh menetapkan status verifikasi.
    if (body.verificationStatus !== undefined) {
      if (!isAdmin && !isDosen) {
        return NextResponse.json(
          { error: 'Hanya admin/dosen yang dapat memverifikasi foto' },
          { status: 403 },
        );
      }
      const validStatuses = ['PENDING', 'VERIFIED', 'REJECTED'];
      if (!validStatuses.includes(body.verificationStatus)) {
        return NextResponse.json(
          { error: 'verificationStatus tidak valid' },
          { status: 400 },
        );
      }
      data.verificationStatus = body.verificationStatus;
      data.verifiedAt = new Date();
      if (body.verificationResult !== undefined) {
        data.verificationResult = body.verificationResult;
      }
    }

    const updated = await prisma.projectUserPhoto.update({
      where: { id: photoId },
      data,
      include: {
        uploadedBy: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update user photo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/user-photos/[photoId] - Delete a photo
export async function DELETE(
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
      include: { project: { select: { mahasiswaId: true } } },
    });
    if (!photo) {
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 });
    }

    const isUploader = photo.uploadedById === session.user.id;
    const isOwner = photo.project.mahasiswaId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isUploader && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      await deleteFile(photo.fileKey);
    } catch (storageError) {
      console.warn('Gagal menghapus file dari storage:', storageError);
    }

    await prisma.projectUserPhoto.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user photo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
