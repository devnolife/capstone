import * as Minio from 'minio';

// MinIO Configuration from environment variables
const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
};

// Public URL for accessing files
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || `http://${minioConfig.endPoint}:${minioConfig.port}`;
export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'capstone';

// Create MinIO client singleton
let minioClient: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!minioClient) {
    if (!minioConfig.accessKey || !minioConfig.secretKey) {
      throw new Error('MinIO credentials not configured. Please set MINIO_ACCESS_KEY and MINIO_SECRET_KEY environment variables.');
    }

    minioClient = new Minio.Client(minioConfig);
  }
  return minioClient;
}

// Ensure bucket exists
export async function ensureBucket(): Promise<void> {
  const client = getMinioClient();
  const bucketExists = await client.bucketExists(MINIO_BUCKET_NAME);

  if (!bucketExists) {
    await client.makeBucket(MINIO_BUCKET_NAME);
    console.log(`Bucket '${MINIO_BUCKET_NAME}' created successfully`);

    // Set bucket policy to allow public read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${MINIO_BUCKET_NAME}/*`],
        },
      ],
    };

    await client.setBucketPolicy(MINIO_BUCKET_NAME, JSON.stringify(policy));
  }
}

// Upload file to MinIO
export interface UploadResult {
  success: boolean;
  objectName: string;
  url: string;
  etag?: string;
  error?: string;
}

export async function uploadFile(
  buffer: Buffer,
  objectName: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  try {
    const client = getMinioClient();
    await ensureBucket();

    const result = await client.putObject(
      MINIO_BUCKET_NAME,
      objectName,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
        ...metadata,
      }
    );

    const url = `${MINIO_PUBLIC_URL}/${MINIO_BUCKET_NAME}/${objectName}`;

    return {
      success: true,
      objectName,
      url,
      etag: result.etag,
    };
  } catch (error) {
    console.error('MinIO upload error:', error);
    return {
      success: false,
      objectName,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Delete file from MinIO
export async function deleteFile(objectName: string): Promise<boolean> {
  try {
    const client = getMinioClient();
    await client.removeObject(MINIO_BUCKET_NAME, objectName);
    return true;
  } catch (error) {
    console.error('MinIO delete error:', error);
    return false;
  }
}

// Generate unique object name for uploads
export function generateObjectName(
  prefix: string,
  fileName: string,
  projectId?: string
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

  if (projectId) {
    return `${prefix}/${projectId}/${timestamp}-${randomStr}-${sanitizedFileName}`;
  }

  return `${prefix}/${timestamp}-${randomStr}-${sanitizedFileName}`;
}

// Get file URL from object name
export function getFileUrl(objectName: string): string {
  return `${MINIO_PUBLIC_URL}/${MINIO_BUCKET_NAME}/${objectName}`;
}

// Allowed file types for stakeholder documents
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Max file sizes
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Validate file
export function validateFile(
  file: { size: number; type: string },
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipe file tidak didukung. Tipe yang diizinkan: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}
