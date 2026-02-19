import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/presentations - Get all presentation schedules
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "scheduled", "completed", "cancelled"
    const projectStatus = searchParams.get("projectStatus"); // Filter by project status
    const upcoming = searchParams.get("upcoming"); // "true" for upcoming only

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.presentationStatus = status;
    }

    if (projectStatus) {
      where.project = { status: projectStatus };
    }

    if (upcoming === "true") {
      where.scheduledDate = { gte: new Date() };
      where.presentationStatus = "scheduled";
    }

    // Different access levels based on role
    if (session.user.role === "MAHASISWA") {
      // Mahasiswa can only see their own project's presentation
      where.project = {
        ...((where.project as object) || {}),
        mahasiswaId: session.user.id,
      };
    }

    const presentations = await prisma.presentationSchedule.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            mahasiswa: {
              select: {
                id: true,
                name: true,
                nim: true,
                username: true,
              },
            },
            members: {
              select: {
                id: true,
                name: true,
                user: {
                  select: {
                    name: true,
                    nim: true,
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
      orderBy: [
        { scheduledDate: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({ presentations });
  } catch (error) {
    console.error("Error fetching presentations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/presentations - Create presentation schedule (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can schedule presentations
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat menjadwalkan presentasi" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, scheduledDate, startTime, endTime, location, notes } = body;

    // Validate required fields
    if (!projectId || !scheduledDate || !startTime) {
      return NextResponse.json(
        { error: "Project ID, tanggal, dan jam mulai wajib diisi" },
        { status: 400 }
      );
    }

    // Check if project exists and is ready for presentation
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        presentationSchedule: true,
        mahasiswa: {
          select: { id: true, name: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    if (project.status !== "READY_FOR_PRESENTATION") {
      return NextResponse.json(
        { error: "Project belum siap untuk dijadwalkan presentasi. Status harus READY_FOR_PRESENTATION." },
        { status: 400 }
      );
    }

    if (project.presentationSchedule) {
      return NextResponse.json(
        { error: "Project sudah memiliki jadwal presentasi" },
        { status: 400 }
      );
    }

    // Create presentation schedule and update project status
    const [presentation] = await prisma.$transaction([
      prisma.presentationSchedule.create({
        data: {
          projectId,
          scheduledDate: new Date(scheduledDate),
          startTime,
          endTime: endTime || null,
          location: location || null,
          notes: notes || null,
          scheduledById: session.user.id,
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              mahasiswa: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: { status: "PRESENTATION_SCHEDULED" },
      }),
      // Notify mahasiswa about scheduled presentation
      prisma.notification.create({
        data: {
          userId: project.mahasiswa.id,
          title: "Jadwal Presentasi",
          message: `Presentasi project "${project.title}" telah dijadwalkan pada ${new Date(scheduledDate).toLocaleDateString("id-ID")} pukul ${startTime}${location ? ` di ${location}` : ""}.`,
          type: "presentation",
          link: `/mahasiswa/projects/${projectId}`,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Jadwal presentasi berhasil dibuat",
      presentation,
    });
  } catch (error) {
    console.error("Error creating presentation schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
