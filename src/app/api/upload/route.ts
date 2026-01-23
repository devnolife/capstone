import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  uploadFile,
  generateObjectName,
  validateFile,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from "@/lib/minio";

// POST /api/upload - Upload file to MinIO
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const prefix = (formData.get("prefix") as string) || "uploads";
    const projectId = formData.get("projectId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(
      { size: file.size, type: file.type },
      ALLOWED_DOCUMENT_TYPES,
      MAX_DOCUMENT_SIZE
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique object name
    const objectName = generateObjectName(prefix, file.name, projectId || undefined);

    // Upload to MinIO
    const result = await uploadFile(buffer, objectName, file.type, {
      originalName: file.name,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileKey: result.objectName,
        fileUrl: result.url,
        fileSize: file.size,
        mimeType: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
