import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Fields that count towards completion percentage (grouped by section)
const REQUIREMENT_FIELDS = [
  // Informasi Dasar
  "judulProyek",
  "targetPengguna",
  "latarBelakangMasalah",
  "tujuanProyek",
  "manfaatProyek",
  // Aspek Akademik
  "integrasiMatakuliah",
  "metodologi",
  "penulisanLaporan",
  // Teknis & Implementasi
  "ruangLingkup",
  "sumberDayaBatasan",
  "teknologi",
  "fiturUtama",
  // Analisis & Evaluasi
  "analisisTemuan",
  "presentasiUjian",
  "stakeholder",
  "kepatuhanEtika",
  // Timeline
  "timeline",
  "kerangkaWaktu",
] as const;

// Calculate completion percentage based on filled fields
function calculateCompletion(data: Record<string, unknown>): number {
  const filledFields = REQUIREMENT_FIELDS.filter((field) => {
    const value = data[field];
    return value !== null && value !== undefined && String(value).trim() !== "";
  });
  return Math.round((filledFields.length / REQUIREMENT_FIELDS.length) * 100);
}

// GET - Fetch project requirements
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns this project or is admin/dosen
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { mahasiswaId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (
      project.mahasiswaId !== session.user.id &&
      user?.role === "MAHASISWA"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get or create requirements
    let requirements = await prisma.projectRequirements.findUnique({
      where: { projectId },
    });

    if (!requirements) {
      // Create empty requirements for this project
      requirements = await prisma.projectRequirements.create({
        data: {
          projectId,
          completionPercent: 0,
        },
      });
    }

    return NextResponse.json(requirements);
  } catch (error) {
    console.error("Error fetching project requirements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Save/update project requirements
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, ...data } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { mahasiswaId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.mahasiswaId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate completion percentage
    const completionPercent = calculateCompletion(data);

    // Parse deadlineDate if provided
    const deadlineDate = data.deadlineDate
      ? new Date(data.deadlineDate)
      : null;

    // Upsert requirements
    const requirements = await prisma.projectRequirements.upsert({
      where: { projectId },
      create: {
        projectId,
        // Informasi Dasar
        judulProyek: data.judulProyek || null,
        targetPengguna: data.targetPengguna || null,
        latarBelakangMasalah: data.latarBelakangMasalah || null,
        tujuanProyek: data.tujuanProyek || null,
        manfaatProyek: data.manfaatProyek || null,
        // Aspek Akademik
        integrasiMatakuliah: data.integrasiMatakuliah || null,
        metodologi: data.metodologi || null,
        penulisanLaporan: data.penulisanLaporan || null,
        // Teknis & Implementasi
        ruangLingkup: data.ruangLingkup || null,
        sumberDayaBatasan: data.sumberDayaBatasan || null,
        teknologi: data.teknologi || null,
        fiturUtama: data.fiturUtama || null,
        // Analisis & Evaluasi
        analisisTemuan: data.analisisTemuan || null,
        presentasiUjian: data.presentasiUjian || null,
        stakeholder: data.stakeholder || null,
        kepatuhanEtika: data.kepatuhanEtika || null,
        // Timeline
        timeline: data.timeline || null,
        kerangkaWaktu: data.kerangkaWaktu || null,
        deadlineDate,
        completionPercent,
      },
      update: {
        // Informasi Dasar
        judulProyek: data.judulProyek || null,
        targetPengguna: data.targetPengguna || null,
        latarBelakangMasalah: data.latarBelakangMasalah || null,
        tujuanProyek: data.tujuanProyek || null,
        manfaatProyek: data.manfaatProyek || null,
        // Aspek Akademik
        integrasiMatakuliah: data.integrasiMatakuliah || null,
        metodologi: data.metodologi || null,
        penulisanLaporan: data.penulisanLaporan || null,
        // Teknis & Implementasi
        ruangLingkup: data.ruangLingkup || null,
        sumberDayaBatasan: data.sumberDayaBatasan || null,
        teknologi: data.teknologi || null,
        fiturUtama: data.fiturUtama || null,
        // Analisis & Evaluasi
        analisisTemuan: data.analisisTemuan || null,
        presentasiUjian: data.presentasiUjian || null,
        stakeholder: data.stakeholder || null,
        kepatuhanEtika: data.kepatuhanEtika || null,
        // Timeline
        timeline: data.timeline || null,
        kerangkaWaktu: data.kerangkaWaktu || null,
        deadlineDate,
        completionPercent,
      },
    });

    return NextResponse.json({
      success: true,
      requirements,
      message: "Persyaratan proyek berhasil disimpan",
    });
  } catch (error) {
    console.error("Error saving project requirements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
