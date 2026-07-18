import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFile, generateObjectName } from '@/lib/minio';
import type { DocumentType } from '@/generated/prisma';

// POST /api/documents - Upload document
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as DocumentType;
    const projectId = formData.get('projectId') as string;

    if (!file || !type || !projectId) {
      return NextResponse.json(
        { error: 'File, tipe, dan projectId diperlukan' },
        { status: 400 },
      );
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 50MB' },
        { status: 400 },
      );
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 },
      );
    }

    const isOwner = project.mahasiswaId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    let isMember = false;
    if (!isOwner && !isAdmin) {
      const memberRecord = await prisma.projectMember.findFirst({
        where: { projectId, userId: session.user.id },
        select: { id: true },
      });
      isMember = !!memberRecord;
    }

    if (!isOwner && !isAdmin && !isMember) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 403 },
      );
    }

    // Upload file to MinIO (object storage). Local disk is not writable in the
    // standalone/containerized runtime, so all uploads go through MinIO.
    const objectName = generateObjectName('documents', file.name, projectId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await uploadFile(buffer, objectName, file.type || 'application/octet-stream', {
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Upload gagal' },
        { status: 500 },
      );
    }

    // Save to database (filePath stores the authenticated proxy URL: /api/minio/<objectName>)
    const document = await prisma.document.create({
      data: {
        projectId,
        type,
        fileName: file.name,
        filePath: uploadResult.url,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json(
      {
        message: 'Dokumen berhasil diupload',
        document,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// GET /api/documents - Get documents (with filters)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId diperlukan' },
        { status: 400 },
      );
    }

    // Verify access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 },
      );
    }

    const isOwner = project.mahasiswaId === session.user.id;
    const isAssignedDosen = project.assignments.some(
      (a) => a.dosenId === session.user.id,
    );
    const isAdmin = session.user.role === 'ADMIN';
    let isMember = false;
    if (!isOwner && !isAssignedDosen && !isAdmin) {
      const memberRecord = await prisma.projectMember.findFirst({
        where: { projectId, userId: session.user.id },
        select: { id: true },
      });
      isMember = !!memberRecord;
    }

    if (!isOwner && !isAssignedDosen && !isAdmin && !isMember) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 403 },
      );
    }

    const whereClause: { projectId: string; type?: DocumentType } = {
      projectId,
    };
    if (type) {
      whereClause.type = type as DocumentType;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
