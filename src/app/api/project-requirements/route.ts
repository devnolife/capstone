import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getDeploymentBonusPoints } from "@/lib/utils";
import { encryptNullable, decryptNullable } from "@/lib/crypto";
import { calculateRequirementsCompletion } from "@/lib/student-journey";

// Calculate completion percentage based on filled required fields
const calculateCompletion = calculateRequirementsCompletion;

// Text fields that can be updated through this endpoint. Only fields that are
// actually present in the request body will be written, so partial saves from
// different forms don't erase each other's data.
const UPDATABLE_TEXT_FIELDS = [
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
  // Production & Demo
  "productionUrl",
  "productionUrlStatus",
  "testingUsername",
  "testingNotes",
  // Deployment Setup
  "deploymentPlatform",
  "deploymentDescription",
  "deploymentEvidence",
  "deploymentTools",
] as const;

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
      select: {
        id: true,
        title: true,
        semester: true,
        status: true,
        description: true,
        mahasiswaId: true,
        mahasiswa: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Check access for MAHASISWA role
    if (user?.role === "MAHASISWA" && project.mahasiswaId !== session.user.id) {
      // Check if user is a team member
      const isMember = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: session.user.id,
        },
      });

      if (!isMember) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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

    // Return requirements with project info for efficiency
    // Decrypt sensitive credentials before sending to authorized clients.
    return NextResponse.json({
      ...requirements,
      testingPassword: decryptNullable(requirements.testingPassword),
      project: {
        id: project.id,
        title: project.title,
        semester: project.semester,
        status: project.status,
        description: project.description,
        mahasiswaId: project.mahasiswaId,
        mahasiswa: project.mahasiswa,
      },
    });
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

    // Owner, team member, or admin can edit requirements
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    const isOwner = project.mahasiswaId === session.user.id;
    const isAdmin = userRecord?.role === 'ADMIN';
    let isMember = false;
    if (!isOwner && !isAdmin) {
      const memberRecord = await prisma.projectMember.findFirst({
        where: { projectId, userId: session.user.id },
        select: { id: true },
      });
      isMember = !!memberRecord;
    }

    if (!isOwner && !isAdmin && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build a partial update containing ONLY the fields present in the request.
    // This prevents one form (e.g. form persyaratan) from wiping fields managed
    // by another form (e.g. setup project: tujuanProyek, teknologi, dll).
    const updateData: Record<string, unknown> = {};
    for (const field of UPDATABLE_TEXT_FIELDS) {
      if (data[field] !== undefined) {
        updateData[field] = data[field] || null;
      }
    }
    if (data.deadlineDate !== undefined) {
      updateData.deadlineDate = data.deadlineDate
        ? new Date(data.deadlineDate)
        : null;
    }
    if (data.productionUrlCheckedAt !== undefined) {
      updateData.productionUrlCheckedAt = data.productionUrlCheckedAt
        ? new Date(data.productionUrlCheckedAt)
        : null;
    }
    if (data.testingPassword !== undefined) {
      // Encrypt sensitive testing credentials at-rest
      updateData.testingPassword = encryptNullable(data.testingPassword);
    }
    if (data.deploymentPlatform !== undefined) {
      // Calculate deployment bonus points based on platform
      updateData.deploymentBonusPoints = getDeploymentBonusPoints(
        data.deploymentPlatform,
      );
    }

    // Calculate completion percentage from the merged record (existing values
    // + incoming changes) so fields saved via form lain tetap dihitung.
    const existingRequirements = await prisma.projectRequirements.findUnique({
      where: { projectId },
    });
    const mergedData: Record<string, unknown> = {
      ...(existingRequirements ?? {}),
      ...updateData,
    };
    const completionPercent = calculateCompletion(mergedData);
    updateData.completionPercent = completionPercent;

    // Upsert requirements
    const requirements = await prisma.projectRequirements.upsert({
      where: { projectId },
      create: {
        projectId,
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      requirements: {
        ...requirements,
        testingPassword: decryptNullable(requirements.testingPassword),
      },
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
