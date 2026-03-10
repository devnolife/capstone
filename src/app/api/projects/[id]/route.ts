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
            nim: true,
            prodi: true,
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
            memberScores: {
              include: {
                member: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        username: true,
                        nim: true,
                        image: true,
                      },
                    },
                  },
                },
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                nim: true,
                prodi: true,
                image: true,
                githubUsername: true,
              },
            },
          },
        },
        invitations: {
          include: {
            inviter: {
              select: {
                id: true,
                name: true,
                username: true,
                nim: true,
                image: true,
              },
            },
            invitee: {
              select: {
                id: true,
                name: true,
                username: true,
                nim: true,
                prodi: true,
                image: true,
                githubUsername: true,
              },
            },
          },
        },
        stakeholderDocuments: {
          orderBy: { uploadedAt: 'desc' },
        },
        presentationSchedule: {
          include: {
            scheduledBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
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
    const isSubmittedProject = [
      'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_NEEDED',
      'READY_FOR_PRESENTATION', 'PRESENTATION_SCHEDULED'
    ].includes(project.status);
    const dosenCanView = isDosen && isSubmittedProject;
    // Team members can also view
    const isTeamMember = project.members.some((m) => m.userId === session.user.id);

    if (!isOwner && !isAssignedDosen && !isAdmin && !dosenCanView && !isTeamMember) {
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

      const validStatuses = [
        'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'REVISION_NEEDED',
        'READY_FOR_PRESENTATION', 'PRESENTATION_SCHEDULED',
        'APPROVED', 'REJECTED'
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 },
        );
      }

      // Validate status transitions
      const currentStatus = existingProject.status;
      const newStatus = body.status;

      // Define allowed transitions per role
      const dosenAllowedTransitions: Record<string, string[]> = {
        'IN_REVIEW': ['READY_FOR_PRESENTATION', 'REVISION_NEEDED'],
        'REVISION_NEEDED': ['IN_REVIEW'],
      };

      const adminAllowedTransitions: Record<string, string[]> = {
        'DRAFT': ['SUBMITTED'],
        'SUBMITTED': ['IN_REVIEW', 'DRAFT', 'APPROVED', 'REJECTED'],
        'IN_REVIEW': ['READY_FOR_PRESENTATION', 'REVISION_NEEDED', 'APPROVED', 'REJECTED', 'DRAFT'],
        'REVISION_NEEDED': ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT'],
        'READY_FOR_PRESENTATION': ['PRESENTATION_SCHEDULED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT'],
        'PRESENTATION_SCHEDULED': ['APPROVED', 'REJECTED', 'READY_FOR_PRESENTATION', 'DRAFT'],
        'APPROVED': ['REJECTED', 'DRAFT'],
        'REJECTED': ['DRAFT', 'SUBMITTED', 'READY_FOR_PRESENTATION'],
      };

      // Check if transition is allowed based on role
      let isTransitionAllowed = false;

      if (session.user.role === 'ADMIN') {
        const allowedNext = adminAllowedTransitions[currentStatus] || [];
        isTransitionAllowed = allowedNext.includes(newStatus);
      } else if (session.user.role === 'DOSEN_PENGUJI') {
        const allowedNext = dosenAllowedTransitions[currentStatus] || [];
        isTransitionAllowed = allowedNext.includes(newStatus);
      }

      if (!isTransitionAllowed) {
        return NextResponse.json(
          {
            error: `Tidak dapat mengubah status dari ${currentStatus} ke ${newStatus}`,
            currentStatus,
            allowedTransitions: session.user.role === 'ADMIN'
              ? adminAllowedTransitions[currentStatus] || []
              : dosenAllowedTransitions[currentStatus] || []
          },
          { status: 400 },
        );
      }

      // Special handling for certain transitions
      const updateData: Record<string, unknown> = {
        status: newStatus,
      };

      // Set approvedAt when approved
      if (newStatus === 'APPROVED') {
        updateData.approvedAt = new Date();
      }

      // Clear approvedAt if rejected or reverted
      if (newStatus === 'REJECTED' || newStatus === 'REVISION_NEEDED') {
        updateData.approvedAt = null;
      }

      const project = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          mahasiswa: {
            select: { id: true, name: true },
          },
        },
      });

      // Create notification for mahasiswa
      let notificationTitle = '';
      let notificationMessage = '';

      switch (newStatus) {
        case 'READY_FOR_PRESENTATION':
          notificationTitle = 'Project Disetujui untuk Presentasi';
          notificationMessage = `Project "${project.title}" telah disetujui dan siap dijadwalkan untuk presentasi.`;
          break;
        case 'REVISION_NEEDED':
          notificationTitle = 'Revisi Diperlukan';
          notificationMessage = `Project "${project.title}" memerlukan revisi. Silakan periksa komentar reviewer.`;
          break;
        case 'APPROVED':
          notificationTitle = 'Project Disetujui';
          notificationMessage = `Selamat! Project "${project.title}" telah disetujui setelah presentasi.`;
          break;
        case 'REJECTED':
          notificationTitle = 'Project Ditolak';
          notificationMessage = `Project "${project.title}" tidak disetujui. Silakan hubungi dosen pembimbing.`;
          break;
      }

      if (notificationTitle) {
        await prisma.notification.create({
          data: {
            userId: project.mahasiswa.id,
            title: notificationTitle,
            message: notificationMessage,
            type: 'status_change',
            link: `/mahasiswa/projects/${id}`,
          },
        });
      }

      return NextResponse.json({
        message: `Status project berhasil diubah ke ${newStatus}`,
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

    // Only allow editing when project is in DRAFT or REVISION_NEEDED status
    if (
      existingProject.status !== 'DRAFT' &&
      existingProject.status !== 'REVISION_NEEDED' &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Project hanya dapat diedit saat status DRAFT atau REVISION_NEEDED' },
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

    // Extract additional fields from body
    const {
      technologies,
      category,
      objectives,
      methodology,
      expectedOutcome,
      isPublic,
      productionUrl,
      testingUsername,
      testingPassword,
      testingNotes,
      consentDocument,
      pendingTeamMembers,
    } = body;

    // Extract GitHub repo name if URL provided
    let githubRepoName = existingProject.githubRepoName;
    if (githubRepoUrl) {
      const match = githubRepoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (match) {
        githubRepoName = match[1];
      }
    }

    // Use transaction to update project and related data
    const project = await prisma.$transaction(async (tx) => {
      // 1. Update the project
      const updatedProject = await tx.project.update({
        where: { id },
        data: {
          title,
          description,
          githubRepoUrl: githubRepoUrl || null,
          githubRepoName,
          semester,
          tahunAkademik,
          productionUrl: productionUrl || null,
        },
      });

      // 2. Update or create project requirements
      await tx.projectRequirements.upsert({
        where: { projectId: id },
        create: {
          projectId: id,
          judulProyek: title,
          tujuanProyek: objectives || null,
          manfaatProyek: expectedOutcome || null,
          metodologi: methodology || null,
          teknologi: technologies ? (Array.isArray(technologies) ? technologies.join(', ') : technologies) : null,
          ruangLingkup: category || null,
          productionUrl: productionUrl || null,
          testingUsername: testingUsername || null,
          testingPassword: testingPassword || null,
          testingNotes: testingNotes || null,
        },
        update: {
          judulProyek: title,
          tujuanProyek: objectives || null,
          manfaatProyek: expectedOutcome || null,
          metodologi: methodology || null,
          teknologi: technologies ? (Array.isArray(technologies) ? technologies.join(', ') : technologies) : null,
          ruangLingkup: category || null,
          productionUrl: productionUrl || null,
          testingUsername: testingUsername || null,
          testingPassword: testingPassword || null,
          testingNotes: testingNotes || null,
        },
      });

      // 3. Handle consent document
      if (consentDocument) {
        // Delete existing consent document if any
        await tx.document.deleteMany({
          where: {
            projectId: id,
            type: 'CONSENT_AGREEMENT',
          },
        });

        // Create new consent document
        if (consentDocument.fileUrl) {
          await tx.document.create({
            data: {
              projectId: id,
              type: 'CONSENT_AGREEMENT',
              fileName: consentDocument.fileName,
              filePath: consentDocument.fileUrl,
              fileSize: consentDocument.fileSize,
              mimeType: consentDocument.mimeType || null,
            },
          });
        }
      }

      // 4. Handle team invitations for pending members
      if (pendingTeamMembers && Array.isArray(pendingTeamMembers) && pendingTeamMembers.length > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Get existing project members to skip them
        const existingMembers = await tx.projectMember.findMany({
          where: { projectId: id },
          select: { userId: true },
        });
        const existingMemberUserIds = new Set(
          existingMembers.map(m => m.userId).filter(Boolean)
        );

        for (const member of pendingTeamMembers) {
          // Skip if member.id is missing or not a valid user
          if (!member.id) continue;

          // Skip if already a project member
          if (existingMemberUserIds.has(member.id)) continue;

          // Validate that the user actually exists
          const userExists = await tx.user.findUnique({
            where: { id: member.id },
            select: { id: true },
          });
          if (!userExists) continue;

          // Check if invitation already exists
          const existingInvitation = await tx.teamInvitation.findUnique({
            where: {
              projectId_inviteeId: {
                projectId: id,
                inviteeId: member.id,
              },
            },
          });

          if (!existingInvitation) {
            await tx.teamInvitation.create({
              data: {
                projectId: id,
                inviterId: session.user.id,
                inviteeId: member.id,
                status: 'pending',
                expiresAt,
              },
            });

            // Create notification
            await tx.notification.create({
              data: {
                userId: member.id,
                title: 'Undangan Tim Project',
                message: `${session.user.name} mengundang Anda untuk bergabung dalam project "${title}"`,
                type: 'invitation',
                link: `/mahasiswa/invitations`,
              },
            });
          }
        }
      }

      return updatedProject;
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
