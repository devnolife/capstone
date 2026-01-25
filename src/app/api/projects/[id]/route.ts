import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';

// GET /api/projects/[id] - Get single project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        mahasiswa: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true, // username is used as NIM for mahasiswa
            image: true,
            githubUsername: true,
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            comments: {
              orderBy: { createdAt: 'desc' },
            },
            scores: {
              include: {
                rubrik: true,
              },
            },
          },
        },
        assignments: {
          include: {
            dosen: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        requirements: true,
        members: {
          select: {
            id: true,
            githubUsername: true,
            githubAvatarUrl: true,
            name: true,
            role: true,
          },
        },
        stakeholderDocuments: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check access permission
    const isOwner = project.mahasiswaId === session.user.id;
    const isAssignedDosen = project.assignments.some(
      (a) => a.dosenId === session.user.id,
    );
    const isAdmin = session.user.role === 'ADMIN';
    // Dosen can view all submitted projects (not just assigned ones)
    const isDosen = session.user.role === 'DOSEN_PENGUJI';
    const isSubmittedProject = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_NEEDED'].includes(project.status);
    const dosenCanView = isDosen && isSubmittedProject;

    if (!isOwner && !isAssignedDosen && !isAdmin && !dosenCanView) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 403 },
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get existing project
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check if this is a status-only update (for Admin/Dosen)
    if (body.status && Object.keys(body).length === 1) {
      // Only Admin or Dosen can change status
      if (session.user.role !== 'ADMIN' && session.user.role !== 'DOSEN_PENGUJI') {
        return NextResponse.json(
          { error: 'Hanya Admin atau Dosen yang dapat mengubah status' },
          { status: 403 },
        );
      }

      const validStatuses = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'REVISION_NEEDED', 'APPROVED', 'REJECTED'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 },
        );
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          status: body.status,
          ...(body.status === 'APPROVED' && { approvedAt: new Date() }),
          ...(body.status === 'REJECTED' && { approvedAt: null }),
        },
      });

      return NextResponse.json({
        message: `Status project berhasil diubah ke ${body.status}`,
        project,
      });
    }

    // Regular project update - Check ownership
    if (
      existingProject.mahasiswaId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 403 },
      );
    }

    // Validate input
    const validatedData = projectSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 },
      );
    }

    const { title, description, githubRepoUrl, semester, tahunAkademik } =
      validatedData.data;

    // Extract GitHub repo name if URL provided
    let githubRepoName = existingProject.githubRepoName;
    if (githubRepoUrl) {
      const match = githubRepoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (match) {
        githubRepoName = match[1];
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        githubRepoUrl: githubRepoUrl || null,
        githubRepoName,
        semester,
        tahunAkademik,
      },
    });

    return NextResponse.json({
      message: 'Project berhasil diperbarui',
      project,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
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

    // Only allow deletion of DRAFT projects
    if (existingProject.status !== 'DRAFT' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya project DRAFT yang dapat dihapus' },
        { status: 400 },
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Project berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
