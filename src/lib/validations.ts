import { z } from 'zod';

// Auth Validations
export const loginSchema = z.object({
  username: z.string().min(1, 'NIM/NIP/Username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Registration disabled - users are created by admin
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    username: z.string().min(1, 'Username (NIM/NIP) wajib diisi'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
    role: z.enum(['MAHASISWA', 'DOSEN_PENGUJI', 'ADMIN']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

// Project Validations
export const projectSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  description: z.string().optional(),
  githubRepoUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  semester: z.string().min(1, 'Semester wajib dipilih'),
  tahunAkademik: z.string().min(1, 'Tahun akademik wajib dipilih'),
});

export const projectSubmitSchema = z.object({
  projectId: z.string(),
});

// Document Validations
export const documentUploadSchema = z.object({
  projectId: z.string(),
  type: z.enum([
    'PROPOSAL',
    'BAB_1',
    'BAB_2',
    'BAB_3',
    'BAB_4',
    'BAB_5',
    'FINAL_REPORT',
    'PRESENTATION',
    'SOURCE_CODE',
    'OTHER',
  ]),
  file: z.any(),
});

// Review Validations
export const reviewCommentSchema = z.object({
  reviewId: z.string(),
  content: z.string().min(1, 'Komentar tidak boleh kosong'),
  filePath: z.string().optional(),
  lineNumber: z.number().optional(),
});

export const reviewScoreSchema = z.object({
  reviewId: z.string(),
  rubrikId: z.string(),
  score: z.number().min(0, 'Skor minimal 0'),
  feedback: z.string().optional(),
});

export const completeReviewSchema = z.object({
  reviewId: z.string(),
  overallScore: z.number().min(0).max(100),
  overallComment: z.string().optional(),
});

// User Management Validations
export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  username: z.string().min(1, 'Username (NIM/NIP) wajib diisi'),
  role: z.enum(['MAHASISWA', 'DOSEN_PENGUJI', 'ADMIN']),
  isActive: z.boolean(),
});

// Assignment Validations
export const assignmentSchema = z.object({
  projectId: z.string(),
  dosenId: z.string(),
});

// Rubrik Validations
export const rubrikSchema = z.object({
  name: z.string().min(2, 'Nama rubrik minimal 2 karakter'),
  description: z.string().optional(),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  bobotMax: z.number().min(1, 'Bobot maksimal minimal 1'),
  urutan: z.number().min(0),
  isActive: z.boolean(),
});

// Semester Validations
export const semesterSchema = z.object({
  name: z.string().min(5, 'Nama semester minimal 5 karakter'),
  tahunAkademik: z.string().min(1, 'Tahun akademik wajib diisi'),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
});

// Types from validations
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type ReviewCommentInput = z.infer<typeof reviewCommentSchema>;
export type ReviewScoreInput = z.infer<typeof reviewScoreSchema>;
export type CompleteReviewInput = z.infer<typeof completeReviewSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type RubrikInput = z.infer<typeof rubrikSchema>;
export type SemesterInput = z.infer<typeof semesterSchema>;
