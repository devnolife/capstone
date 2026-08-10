import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { deleteFile } from '@/lib/minio';

// GET /api/documents/[id] - Get single document
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            mahasiswaId: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check access - only project owner or admin/dosen can view
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isOwner = document.project.mahasiswaId === session.user.id;
    const isAdmin = user?.role === 'ADMIN';
    const isDosen = user?.role === 'DOSEN_PENGUJI';
    let isMember = false;
    if (!isOwner && !isAdmin && !isDosen) {
      const memberRecord = await prisma.projectMember.findFirst({
        where: { projectId: document.project.id, userId: session.user.id },
        select: { id: true },
      });
      isMember = !!memberRecord;
    }

    if (!isOwner && !isAdmin && !isDosen && !isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get document with project info
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            mahasiswaId: true,
            status: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check access - only project owner can delete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isOwner = document.project.mahasiswaId === session.user.id;
    const isAdmin = user?.role === 'ADMIN';
    let isMember = false;
    if (!isOwner && !isAdmin) {
      const memberRecord = await prisma.projectMember.findFirst({
        where: { projectId: document.project.id, userId: session.user.id },
        select: { id: true },
      });
      isMember = !!memberRecord;
    }

    if (!isOwner && !isAdmin && !isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can't delete documents from approved/rejected projects (unless admin)
    if (
      !isAdmin &&
      (document.project.status === 'APPROVED' ||
        document.project.status === 'REJECTED')
    ) {
      return NextResponse.json(
        {
          error: 'Tidak dapat menghapus dokumen dari project yang sudah final',
        },
        { status: 400 },
      );
    }

    // Delete file from MinIO. filePath is stored as the proxy URL `/api/minio/<objectName>`;
    // legacy records may still hold local `/uploads/...` paths which are simply skipped.
    try {
      if (document.filePath.startsWith('/api/minio/')) {
        const objectName = document.filePath.replace('/api/minio/', '');
        await deleteFile(objectName);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
