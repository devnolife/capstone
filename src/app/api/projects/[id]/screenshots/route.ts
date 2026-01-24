import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { minioClient, MINIO_BUCKET } from '@/lib/minio';

// GET /api/projects/[id]/screenshots - Get all screenshots for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { mahasiswaId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get screenshots ordered by orderIndex
    const screenshots = await prisma.projectScreenshot.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({ screenshots });
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/screenshots - Upload a new screenshot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Verify project exists and user is owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { mahasiswaId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.mahasiswaId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files are allowed (PNG, JPG, GIF, WEBP)' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate unique file key for MinIO
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `screenshots/${projectId}/${timestamp}_${sanitizedFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to MinIO
    await minioClient.putObject(MINIO_BUCKET, fileKey, buffer, file.size, {
      'Content-Type': file.type,
    });

    // Generate public URL
    const publicUrl = `${process.env.MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${fileKey}`;

    // Get current max orderIndex
    const lastScreenshot = await prisma.projectScreenshot.findFirst({
      where: { projectId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const orderIndex = (lastScreenshot?.orderIndex ?? -1) + 1;

    // Save to database
    const screenshot = await prisma.projectScreenshot.create({
      data: {
        projectId,
        title,
        description,
        category,
        orderIndex,
        fileName: file.name,
        fileKey,
        fileUrl: publicUrl,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({ screenshot }, { status: 201 });
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/screenshots?screenshotId=xxx - Delete a screenshot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const screenshotId = searchParams.get('screenshotId');

    if (!screenshotId) {
      return NextResponse.json(
        { error: 'Screenshot ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists and user is owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { mahasiswaId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.mahasiswaId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get screenshot
    const screenshot = await prisma.projectScreenshot.findUnique({
      where: { id: screenshotId },
    });

    if (!screenshot || screenshot.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    // Delete from MinIO
    try {
      await minioClient.removeObject(MINIO_BUCKET, screenshot.fileKey);
    } catch (minioError) {
      console.error('Error deleting from MinIO:', minioError);
      // Continue to delete from database even if MinIO fails
    }

    // Delete from database
    await prisma.projectScreenshot.delete({
      where: { id: screenshotId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
