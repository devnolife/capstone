import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/invitations/[id] - Get single invitation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            semester: true,
            tahunAkademik: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            username: true,
            nim: true,
            image: true,
            prodi: true,
          },
        },
        invitee: {
          select: {
            id: true,
            name: true,
            username: true,
            nim: true,
            image: true,
            prodi: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Undangan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Only inviter or invitee can view
    if (
      invitation.inviterId !== session.user.id &&
      invitation.inviteeId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Anda tidak berwenang melihat undangan ini' },
        { status: 403 }
      );
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/invitations/[id] - Accept or reject invitation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json(); // "accept" | "reject"

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action harus "accept" atau "reject"' },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            mahasiswaId: true,
            semester: true,
          },
        },
        inviter: { select: { id: true, name: true } },
        invitee: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            simakPhoto: true,
            githubUsername: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Undangan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify user is the invitee
    if (invitation.inviteeId !== session.user.id) {
      return NextResponse.json(
        { error: 'Anda tidak berwenang merespon undangan ini' },
        { status: 403 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Undangan sudah direspon sebelumnya' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      // Check if user is already a member of another project this semester
      const existingMembership = await prisma.projectMember.findFirst({
        where: {
          userId: session.user.id,
          project: {
            semester: invitation.project.semester,
          },
        },
        include: {
          project: { select: { title: true } },
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          {
            error: `Anda sudah menjadi anggota tim di project "${existingMembership.project.title}" untuk semester ini`,
          },
          { status: 400 }
        );
      }

      // Check if user is a project owner this semester
      const ownedProject = await prisma.project.findFirst({
        where: {
          mahasiswaId: session.user.id,
          semester: invitation.project.semester,
        },
      });

      if (ownedProject) {
        return NextResponse.json(
          {
            error: `Anda sudah menjadi ketua tim di project lain untuk semester ini`,
          },
          { status: 400 }
        );
      }

      // Accept invitation - create member and update invitation
      await prisma.$transaction([
        prisma.teamInvitation.update({
          where: { id },
          data: {
            status: 'accepted',
            respondedAt: new Date(),
          },
        }),
        prisma.projectMember.create({
          data: {
            projectId: invitation.projectId,
            userId: session.user.id,
            name: invitation.invitee.name,
            githubUsername: invitation.invitee.githubUsername,
            githubAvatarUrl:
              invitation.invitee.image || invitation.invitee.simakPhoto,
            role: 'member',
          },
        }),
        prisma.notification.create({
          data: {
            userId: invitation.inviterId,
            title: 'Undangan Diterima',
            message: `${invitation.invitee.name} menerima undangan bergabung ke project "${invitation.project.title}"`,
            type: 'invitation',
            link: `/mahasiswa/projects/${invitation.projectId}`,
          },
        }),
      ]);

      return NextResponse.json({
        message: 'Undangan diterima. Anda sekarang menjadi anggota tim.',
        status: 'accepted',
      });
    } else {
      // Reject invitation
      await prisma.$transaction([
        prisma.teamInvitation.update({
          where: { id },
          data: {
            status: 'rejected',
            respondedAt: new Date(),
          },
        }),
        prisma.notification.create({
          data: {
            userId: invitation.inviterId,
            title: 'Undangan Ditolak',
            message: `${invitation.invitee.name} menolak undangan bergabung ke project "${invitation.project.title}"`,
            type: 'invitation',
            link: `/mahasiswa/projects/${invitation.projectId}`,
          },
        }),
      ]);

      return NextResponse.json({
        message: 'Undangan ditolak.',
        status: 'rejected',
      });
    }
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[id] - Cancel invitation (by inviter)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id },
      include: {
        invitee: { select: { name: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Undangan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Only inviter can cancel
    if (invitation.inviterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Hanya pengirim yang dapat membatalkan undangan' },
        { status: 403 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Undangan sudah direspon dan tidak dapat dibatalkan' },
        { status: 400 }
      );
    }

    await prisma.teamInvitation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Undangan untuk ${invitation.invitee.name} dibatalkan`,
    });
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
