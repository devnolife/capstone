import { NextRequest, NextResponse } from 'next/server';
import { getMinioClient, MINIO_BUCKET_NAME } from '@/lib/minio';

// GET /api/minio/[...path] - Serve files from MinIO through Next.js
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const objectPath = path.join('/');

    if (!objectPath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const client = getMinioClient();

    // Get the object from MinIO
    const stream = await client.getObject(MINIO_BUCKET_NAME, objectPath);

    // Get object stats for content-type
    const stat = await client.statObject(MINIO_BUCKET_NAME, objectPath);
    const contentType = stat.metaData['content-type'] || 'application/octet-stream';

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file from MinIO:', error);

    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes('not exist')) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
