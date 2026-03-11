import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/presentations/[id] - Get single presentation schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const presentation = await prisma.presentationSchedule.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            githubRepoUrl: true,
            productionUrl: true,
            mahasiswa: {
              select: {
                id: true,
                name: true,
                nim: true,
                username: true,
                email: true,
              },
            },
            members: {
              select: {
                id: true,
                name: true,
                role: true,
                user: {
                  select: {
                    name: true,
                    nim: true,
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
                  },
                },
              },
            },
          },
        },
        scheduledBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!presentation) {
      return NextResponse.json(
        { error: "Jadwal presentasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Access control: mahasiswa can only see their own
    if (
      session.user.role === "MAHASISWA" &&
      presentation.project.mahasiswa.id !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke jadwal ini" },
        { status: 403 }
      );
    }

    return NextResponse.json({ presentation });
  } catch (error) {
    console.error("Error fetching presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/presentations/[id] - Update presentation schedule (Admin or Dosen)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin or Dosen can update presentations
    if (session.user.role !== "ADMIN" && session.user.role !== "DOSEN_PENGUJI") {
      return NextResponse.json(
        { error: "Hanya admin atau dosen yang dapat mengubah jadwal presentasi" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { scheduledDate, startTime, endTime, location, notes, presentationStatus } = body;

    // Check if presentation exists
    const existing = await prisma.presentationSchedule.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            mahasiswa: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Jadwal presentasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (startTime) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime || null;
    if (location !== undefined) updateData.location = location || null;
    if (notes !== undefined) updateData.notes = notes || null;

    // Handle status changes
    if (presentationStatus && presentationStatus !== existing.presentationStatus) {
      updateData.presentationStatus = presentationStatus;

      if (presentationStatus === "completed") {
        updateData.completedAt = new Date();
      } else if (presentationStatus === "cancelled") {
        // If cancelled, revert project status to READY_FOR_PRESENTATION
        await prisma.project.update({
          where: { id: existing.project.id },
          data: { status: "READY_FOR_PRESENTATION" },
        });
      }
    }

    const presentation = await prisma.presentationSchedule.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Notify mahasiswa about schedule change
    if (scheduledDate || startTime || location || presentationStatus) {
      await prisma.notification.create({
        data: {
          userId: existing.project.mahasiswa.id,
          title: presentationStatus === "cancelled" 
            ? "Jadwal Presentasi Dibatalkan" 
            : "Jadwal Presentasi Diubah",
          message: presentationStatus === "cancelled"
            ? `Jadwal presentasi untuk project "${existing.project.title}" telah dibatalkan.`
            : `Jadwal presentasi untuk project "${existing.project.title}" telah diubah. Silakan cek detail terbaru.`,
          type: "presentation",
          link: `/mahasiswa/projects/${existing.project.id}`,
        },
      });
    }

    return NextResponse.json({
      message: "Jadwal presentasi berhasil diubah",
      presentation,
    });
  } catch (error) {
    console.error("Error updating presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/presentations/[id] - Delete presentation schedule (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can delete presentations
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat menghapus jadwal presentasi" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if presentation exists
    const existing = await prisma.presentationSchedule.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            mahasiswa: { select: { id: true } },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Jadwal presentasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete presentation and revert project status
    await prisma.$transaction([
      prisma.presentationSchedule.delete({
        where: { id },
      }),
      prisma.project.update({
        where: { id: existing.project.id },
        data: { status: "READY_FOR_PRESENTATION" },
      }),
      prisma.notification.create({
        data: {
          userId: existing.project.mahasiswa.id,
          title: "Jadwal Presentasi Dihapus",
          message: `Jadwal presentasi untuk project "${existing.project.title}" telah dihapus. Admin akan menjadwalkan ulang.`,
          type: "presentation",
          link: `/mahasiswa/projects/${existing.project.id}`,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Jadwal presentasi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
