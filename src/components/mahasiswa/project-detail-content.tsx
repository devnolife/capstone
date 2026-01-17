'use client';

import Link from 'next/link';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
} from '@heroui/react';
import {
  ArrowLeft,
  FileText,
  Upload,
  Github,
  ExternalLink,
  Edit,
  Trash2,
  Download,
  MessageSquare,
} from 'lucide-react';
import { SubmitProjectButton } from '@/components/projects/submit-button';
import {
  formatDate,
  formatDateTime,
  formatFileSize,
  getStatusColor,
  getStatusLabel,
  getDocumentTypeLabel,
} from '@/lib/utils';

interface Document {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  type: string;
  uploadedAt: Date;
}

interface ReviewComment {
  id: string;
  content: string;
  filePath: string | null;
  lineNumber: number | null;
}

interface ReviewScore {
  id: string;
  score: number;
  rubrik: {
    name: string;
    bobotMax: number;
  };
}

interface Review {
  id: string;
  status: string;
  overallScore: number | null;
  overallComment: string | null;
  updatedAt: Date;
  reviewer: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  comments: ReviewComment[];
  scores: ReviewScore[];
}

interface Assignment {
  id: string;
  dosen: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  semester: string;
  tahunAkademik: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  mahasiswaId: string;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  documents: Document[];
  reviews: Review[];
  assignments: Assignment[];
}

interface ProjectDetailContentProps {
  project: Project;
  canEdit: boolean;
  canSubmit: boolean;
}

export function ProjectDetailContent({
  project,
  canEdit,
  canSubmit,
}: ProjectDetailContentProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            as={Link}
            href="/mahasiswa/projects"
            variant="light"
            isIconOnly
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <Chip color={getStatusColor(project.status)} variant="flat">
                {getStatusLabel(project.status)}
              </Chip>
            </div>
            <p className="text-default-500">
              {project.semester} - {project.tahunAkademik}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <Button
              as={Link}
              href={`/mahasiswa/projects/${project.id}/edit`}
              variant="flat"
              startContent={<Edit size={18} />}
            >
              Edit
            </Button>
          )}
          <SubmitProjectButton
            projectId={project.id}
            canSubmit={canSubmit}
            hasDocuments={project.documents.length > 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Informasi Project</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {project.description && (
                <div>
                  <h4 className="text-sm font-medium text-default-500 mb-1">
                    Deskripsi
                  </h4>
                  <p className="text-default-700">{project.description}</p>
                </div>
              )}

              {project.githubRepoUrl && (
                <div>
                  <h4 className="text-sm font-medium text-default-500 mb-1">
                    Repository GitHub
                  </h4>
                  <a
                    href={project.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Github size={18} />
                    <span>
                      {project.githubRepoName || project.githubRepoUrl}
                    </span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <Divider />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-default-500">Dibuat</p>
                  <p className="font-medium">
                    {formatDateTime(project.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Terakhir Diperbarui</p>
                  <p className="font-medium">
                    {formatDateTime(project.updatedAt)}
                  </p>
                </div>
                {project.submittedAt && (
                  <div>
                    <p className="text-default-500">Disubmit</p>
                    <p className="font-medium">
                      {formatDateTime(project.submittedAt)}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Dokumen ({project.documents.length})
              </h2>
              <Button
                as={Link}
                href={`/mahasiswa/projects/${project.id}/upload`}
                size="sm"
                color="primary"
                startContent={<Upload size={16} />}
              >
                Upload Dokumen
              </Button>
            </CardHeader>
            <CardBody>
              {project.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText
                    size={48}
                    className="mx-auto text-default-300 mb-4"
                  />
                  <p className="text-default-500 mb-4">
                    Belum ada dokumen. Upload dokumen pertama Anda.
                  </p>
                  <Button
                    as={Link}
                    href={`/mahasiswa/projects/${project.id}/upload`}
                    color="primary"
                    startContent={<Upload size={18} />}
                  >
                    Upload Dokumen
                  </Button>
                </div>
              ) : (
                <Table aria-label="Documents table" removeWrapper>
                  <TableHeader>
                    <TableColumn>NAMA FILE</TableColumn>
                    <TableColumn>TIPE</TableColumn>
                    <TableColumn>UKURAN</TableColumn>
                    <TableColumn>TANGGAL</TableColumn>
                    <TableColumn>AKSI</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {project.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-default-400" />
                            <span className="truncate max-w-[200px]">
                              {doc.fileName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat">
                            {getDocumentTypeLabel(doc.type)}
                          </Chip>
                        </TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              as="a"
                              href={doc.filePath}
                              target="_blank"
                            >
                              <Download size={16} />
                            </Button>
                            {canEdit && (
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>

          {/* Reviews */}
          {project.reviews.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">
                  Review & Feedback ({project.reviews.length})
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {project.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-divider rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={review.reviewer.name}
                          src={review.reviewer.avatarUrl || undefined}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium">{review.reviewer.name}</p>
                          <p className="text-xs text-default-500">
                            {formatDateTime(review.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          color={getStatusColor(review.status)}
                          variant="flat"
                        >
                          {getStatusLabel(review.status)}
                        </Chip>
                        {review.overallScore !== null && (
                          <Chip size="sm" color="primary" variant="solid">
                            Nilai: {review.overallScore}
                          </Chip>
                        )}
                      </div>
                    </div>

                    {review.overallComment && (
                      <div className="bg-default-100 rounded-lg p-3 mb-3">
                        <p className="text-sm">{review.overallComment}</p>
                      </div>
                    )}

                    {review.comments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare size={16} />
                          Komentar ({review.comments.length})
                        </p>
                        {review.comments.slice(0, 3).map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-default-50 rounded-lg p-2 text-sm"
                          >
                            {comment.filePath && (
                              <p className="text-xs text-default-500 mb-1">
                                {comment.filePath}
                                {comment.lineNumber && `:${comment.lineNumber}`}
                              </p>
                            )}
                            <p>{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {review.scores.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">Skor per Kategori</p>
                        {review.scores.map((score) => (
                          <div key={score.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{score.rubrik.name}</span>
                              <span>
                                {score.score}/{score.rubrik.bobotMax}
                              </span>
                            </div>
                            <Progress
                              value={
                                (score.score / score.rubrik.bobotMax) * 100
                              }
                              color="primary"
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Progress Project</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Progress
                value={
                  project.status === 'APPROVED'
                    ? 100
                    : project.status === 'REJECTED'
                      ? 100
                      : project.status === 'IN_REVIEW'
                        ? 70
                        : project.status === 'SUBMITTED'
                          ? 50
                          : project.status === 'REVISION_NEEDED'
                            ? 40
                            : 20
                }
                color={getStatusColor(project.status)}
                showValueLabel
              />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      project.status !== 'DRAFT'
                        ? 'bg-success'
                        : 'bg-default-300'
                    }`}
                  />
                  <span>Project dibuat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      project.documents.length > 0
                        ? 'bg-success'
                        : 'bg-default-300'
                    }`}
                  />
                  <span>Dokumen diupload</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      project.status !== 'DRAFT'
                        ? 'bg-success'
                        : 'bg-default-300'
                    }`}
                  />
                  <span>Disubmit untuk review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      project.reviews.length > 0
                        ? 'bg-success'
                        : 'bg-default-300'
                    }`}
                  />
                  <span>Dalam proses review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      project.status === 'APPROVED'
                        ? 'bg-success'
                        : 'bg-default-300'
                    }`}
                  />
                  <span>Disetujui</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Assigned Reviewers */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Dosen Penguji</h3>
            </CardHeader>
            <CardBody>
              {project.assignments.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-4">
                  Belum ada dosen yang ditugaskan
                </p>
              ) : (
                <div className="space-y-3">
                  {project.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3"
                    >
                      <Avatar
                        name={assignment.dosen.name}
                        src={assignment.dosen.avatarUrl || undefined}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {assignment.dosen.name}
                        </p>
                        <p className="text-xs text-default-500">
                          {assignment.dosen.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
