// Tipe data workspace — mengikuti bentuk hasil query Prisma di
// src/app/(mahasiswa)/mahasiswa/project/page.tsx (serialized ke client).

export interface WorkspaceMember {
  id: string;
  projectId: string;
  userId: string | null;
  githubUsername: string | null;
  githubId: string | null;
  githubAvatarUrl: string | null;
  name: string | null;
  role: string;
  joinedAt: Date | string;
  user: {
    id: string;
    name: string;
    username: string;
    nim: string | null;
    prodi: string | null;
    image: string | null;
    githubUsername: string | null;
  } | null;
}

export interface WorkspaceStakeholderDocument {
  id: string;
  projectId: string;
  stakeholderName: string;
  stakeholderRole: string | null;
  organization: string | null;
  type: string;
  fileName: string;
  fileKey: string | null;
  fileUrl: string;
  fileSize: number;
  mimeType: string | null;
  description: string | null;
  uploadedAt: Date | string;
}

export interface WorkspacePresentation {
  id: string;
  scheduledDate: Date | string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  notes: string | null;
  presentationStatus: string;
  scheduledBy: { id: string; name: string };
}

export interface WorkspaceProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  productionUrl: string | null;
  semester: string;
  tahunAkademik: string;
  mahasiswaId: string;
  submittedAt: Date | string | null;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    nim: string | null;
    prodi: string | null;
    image: string | null;
    githubUsername: string | null;
  };
  members: WorkspaceMember[];
  requirements: { completionPercent: number } | null;
  documents: {
    id: string;
    type: string;
    fileName: string;
    uploadedAt: Date | string;
  }[];
  stakeholderDocuments: WorkspaceStakeholderDocument[];
  presentationSchedule: WorkspacePresentation | null;
  assignments: {
    id: string;
    dosen: { id: string; name: string; username: string; image: string | null };
  }[];
  _count: { workLogs: number; userPhotos: number };
}

// Review mengikuti bentuk props MahasiswaReviewsContent (reviews-content.tsx)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WorkspaceReview = any;

export interface ReviewStats {
  totalReviews: number;
  completedReviews: number;
  pendingReviews: number;
  averageScore: number | null;
}
