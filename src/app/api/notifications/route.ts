import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/notifications - Get user notifications
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: { userId: string; isRead?: boolean } = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// POST /api/notifications - Create notification (Admin/System only)
// Supports:
//   { userId, title, message, type, link }        -> single recipient
//   { userIds: string[], title, ... }             -> explicit list
//   { role: 'MAHASISWA'|'DOSEN_PENGUJI'|'ADMIN'|'all', title, ... }  -> broadcast
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, userIds, role, title, message, type, link } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'title, message, dan type diperlukan' },
        { status: 400 },
      );
    }

    // Resolve recipient ids
    let recipientIds: string[] = [];

    if (Array.isArray(userIds) && userIds.length > 0) {
      recipientIds = userIds.filter((v): v is string => typeof v === 'string');
    } else if (role) {
      const validRoles = ['MAHASISWA', 'DOSEN_PENGUJI', 'ADMIN'] as const;
      type ValidRole = typeof validRoles[number];
      const where: { isActive: boolean; role?: ValidRole } = { isActive: true };
      if (role !== 'all') {
        if (!validRoles.includes(role)) {
          return NextResponse.json(
            { error: 'role tidak valid' },
            { status: 400 },
          );
        }
        where.role = role;
      }
      const users = await prisma.user.findMany({
        where,
        select: { id: true },
      });
      recipientIds = users.map((u) => u.id);
    } else if (typeof userId === 'string') {
      recipientIds = [userId];
    }

    if (recipientIds.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada penerima notifikasi' },
        { status: 400 },
      );
    }

    // Single insert keeps response shape backward-compatible
    if (recipientIds.length === 1) {
      const notification = await prisma.notification.create({
        data: {
          userId: recipientIds[0],
          title,
          message,
          type,
          link,
        },
      });

      return NextResponse.json(
        {
          message: 'Notifikasi berhasil dibuat',
          notification,
        },
        { status: 201 },
      );
    }

    const result = await prisma.notification.createMany({
      data: recipientIds.map((uid) => ({
        userId: uid,
        title,
        message,
        type,
        link,
      })),
    });

    return NextResponse.json(
      {
        message: `Notifikasi terkirim ke ${result.count} pengguna`,
        count: result.count,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// PUT /api/notifications - Mark all as read
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'mark-all-read') {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({ message: 'Semua notifikasi ditandai dibaca' });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// DELETE /api/notifications - Delete all notifications
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deleteRead = searchParams.get('read') === 'true';

    const whereClause: { userId: string; isRead?: boolean } = {
      userId: session.user.id,
    };

    if (deleteRead) {
      whereClause.isRead = true;
    }

    await prisma.notification.deleteMany({
      where: whereClause,
    });

    return NextResponse.json({ message: 'Notifikasi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
