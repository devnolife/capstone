import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  uploadFile,
  generateObjectName,
  validateFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from '@/lib/minio';

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

// GET /api/projects/[id]/user-photos - List foto bersama pengguna
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

    const photos = await prisma.projectUserPhoto.findMany({
      where: { projectId: id },
      include: {
        uploadedBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: photos });
  } catch (error) {
    console.error('Get user photos error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects/[id]/user-photos - Upload foto bersama pengguna (multipart)
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
        { error: 'Hanya pemilik atau anggota tim yang dapat mengunggah foto' },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const caption = (formData.get('caption') as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ error: 'File foto wajib diunggah' }, { status: 400 });
    }

    const validation = validateFile(
      { size: file.size, type: file.type },
      ALLOWED_IMAGE_TYPES,
      MAX_IMAGE_SIZE,
    );
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const objectName = generateObjectName('user-photos', file.name, id);

    const result = await uploadFile(buffer, objectName, file.type, {
      originalName: file.name,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload gagal' },
        { status: 500 },
      );
    }

    const photo = await prisma.projectUserPhoto.create({
      data: {
        projectId: id,
        uploadedById: session.user.id,
        caption,
        fileName: file.name,
        fileKey: result.objectName,
        fileUrl: result.url,
        fileSize: file.size,
        mimeType: file.type,
        // verificationStatus default PENDING — nanti diverifikasi model
        // face recognition (LLM/HuggingFace) untuk mencocokkan wajah
        // mahasiswa dengan pengguna di foto.
      },
      include: {
        uploadedBy: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: photo }, { status: 201 });
  } catch (error) {
    console.error('Upload user photo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
