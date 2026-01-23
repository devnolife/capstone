import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { deleteFile } from "@/lib/minio";
import { StakeholderDocumentType } from "@/generated/prisma";

// GET /api/stakeholder-documents - Get stakeholder documents for a project
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        mahasiswaId: true,
        assignments: {
          select: { dosenId: true }
        }
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check access - owner, assigned dosen, or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isOwner = project.mahasiswaId === session.user.id;
    const isAssignedDosen = project.assignments.some(a => a.dosenId === session.user.id);
    const isAdmin = user?.role === "ADMIN";
    const isDosen = user?.role === "DOSEN_PENGUJI";

    if (!isOwner && !isAssignedDosen && !isAdmin && !isDosen) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const documents = await prisma.stakeholderDocument.findMany({
      where: { projectId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error("Get stakeholder documents error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/stakeholder-documents - Create a new stakeholder document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      projectId,
      stakeholderName,
      stakeholderRole,
      organization,
      type,
      fileName,
      fileKey,
      fileUrl,
      fileSize,
      mimeType,
      description,
    } = body;

    // Validate required fields
    if (!projectId || !stakeholderName || !type || !fileName || !fileKey || !fileUrl || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes: StakeholderDocumentType[] = ["SIGNATURE", "PHOTO", "AGREEMENT_LETTER", "ID_CARD", "SCREENSHOT", "SUPPORTING_DOCUMENT", "OTHER"];
    if (!validTypes.includes(type as StakeholderDocumentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // Check if user owns this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { mahasiswaId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Only owner or admin can add stakeholder documents
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (project.mahasiswaId !== session.user.id && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only project owner can add stakeholder documents" },
        { status: 403 }
      );
    }

    // Create the document record
    const document = await prisma.stakeholderDocument.create({
      data: {
        projectId,
        stakeholderName,
        stakeholderRole: stakeholderRole || null,
        organization: organization || null,
        type: type as StakeholderDocumentType,
        fileName,
        fileKey,
        fileUrl,
        fileSize,
        mimeType,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: document
    }, { status: 201 });
  } catch (error) {
    console.error("Create stakeholder document error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/stakeholder-documents?id=xxx - Delete a stakeholder document
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get the document
    const document = await prisma.stakeholderDocument.findUnique({
      where: { id: documentId },
      include: {
        project: {
          select: { mahasiswaId: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check authorization - only owner or admin can delete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (document.project.mahasiswaId !== session.user.id && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only project owner can delete stakeholder documents" },
        { status: 403 }
      );
    }

    // Delete from MinIO
    await deleteFile(document.fileKey);

    // Delete from database
    await prisma.stakeholderDocument.delete({
      where: { id: documentId },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Delete stakeholder document error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
