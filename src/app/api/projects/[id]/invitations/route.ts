import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/projects/[id]/invitations - Get project invitations
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

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { mahasiswaId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 }
      );
    }

    // Only project owner can see invitations
    if (project.mahasiswaId !== session.user.id) {
      return NextResponse.json(
        { error: 'Anda tidak berwenang melihat undangan project ini' },
        { status: 403 }
      );
    }

    const invitations = await prisma.teamInvitation.findMany({
      where: { projectId },
      include: {
        invitee: {
          select: {
            id: true,
            name: true,
            username: true,
            nim: true,
            image: true,
            simakPhoto: true,
            prodi: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching project invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/invitations - Send invitation
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
    const { inviteeId, message } = await request.json();

    if (!inviteeId) {
      return NextResponse.json(
        { error: 'ID pengguna diperlukan' },
        { status: 400 }
      );
    }

    // Verify project exists and user is owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
        invitations: { where: { status: 'pending' } },
        mahasiswa: { select: { name: true } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project tidak ditemukan' },
        { status: 404 }
      );
    }

    if (project.mahasiswaId !== session.user.id) {
      return NextResponse.json(
        { error: 'Hanya ketua tim yang dapat mengundang anggota' },
        { status: 403 }
      );
    }

    // Check if inviting self
    if (inviteeId === session.user.id) {
      return NextResponse.json(
        { error: 'Tidak dapat mengundang diri sendiri' },
        { status: 400 }
      );
    }

    // Check max members (3 members + 1 ketua = 4 total)
    const totalMembers = project.members.length + project.invitations.length;
    if (totalMembers >= 3) {
      return NextResponse.json(
        { error: 'Maksimal 3 anggota tim (tidak termasuk ketua)' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = project.members.find((m) => m.userId === inviteeId);
    if (existingMember) {
      return NextResponse.json(
        { error: 'Pengguna sudah menjadi anggota tim' },
        { status: 400 }
      );
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.teamInvitation.findUnique({
      where: {
        projectId_inviteeId: { projectId, inviteeId },
      },
    });

    if (existingInvitation) {
      if (existingInvitation.status === 'pending') {
        return NextResponse.json(
          { error: 'Undangan sudah dikirim dan menunggu respon' },
          { status: 400 }
        );
      } else if (existingInvitation.status === 'rejected') {
        // Allow re-inviting if previously rejected - delete old invitation
        await prisma.teamInvitation.delete({
          where: { id: existingInvitation.id },
        });
      }
    }

    // Get invitee data for notification
    const invitee = await prisma.user.findUnique({
      where: { id: inviteeId },
      select: { id: true, name: true, role: true },
    });

    if (!invitee) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    if (invitee.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Hanya mahasiswa yang dapat diundang ke tim' },
        { status: 400 }
      );
    }

    // Create invitation and notification in transaction
    // Default expiration: 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invitation] = await prisma.$transaction([
      prisma.teamInvitation.create({
        data: {
          projectId,
          inviterId: session.user.id,
          inviteeId,
          message,
          expiresAt,
        },
        include: {
          invitee: {
            select: {
              id: true,
              name: true,
              username: true,
              nim: true,
              image: true,
              simakPhoto: true,
              prodi: true,
            },
          },
        },
      }),
      prisma.notification.create({
        data: {
          userId: inviteeId,
          title: 'Undangan Tim Capstone',
          message: `${session.user.name} mengundang Anda bergabung ke project "${project.title}"`,
          type: 'invitation',
          link: '/mahasiswa/invitations',
        },
      }),
    ]);

    return NextResponse.json(
      { message: 'Undangan berhasil dikirim', invitation },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
