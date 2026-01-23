'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Textarea,
  Slider,
  Divider,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Spinner,
} from '@heroui/react';
import {
  ArrowLeft,
  Save,
  Send,
  MessageSquare,
  FileText,
  Github,
  Star,
  Code,
} from 'lucide-react';
import Link from 'next/link';
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getDocumentTypeLabel,
} from '@/lib/utils';
import { GitHubCodeViewer } from '@/components/github/code-viewer';
import { parseGitHubUrl } from '@/lib/github';

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  semester: string;
  tahunAkademik: string;
  mahasiswa: {
    id: string;
    name: string;
    email: string | null;
    username: string; // username is NIM for mahasiswa
    image: string | null;
  };
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  reviews: Array<{
    id: string;
    status: string;
    overallScore: number | null;
    overallComment: string | null;
    reviewer: {
      id: string;
      name: string;
    };
    comments: Array<{
      id: string;
      content: string;
      filePath: string | null;
      lineNumber: number | null;
    }>;
    scores: Array<{
      id: string;
      score: number;
      feedback: string | null;
      rubrik: {
        id: string;
        name: string;
        kategori: string;
        bobotMax: number;
      };
    }>;
  }>;
}

interface Rubrik {
  id: string;
  name: string;
  description: string | null;
  kategori: string;
  bobotMax: number;
  urutan: number;
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [rubriks, setRubriks] = useState<Rubrik[]>([]);
  const [error, setError] = useState('');

  // Review form state
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [overallComment, setOverallComment] = useState('');
  const [scores, setScores] = useState<
    Record<string, { score: number; feedback: string }>
  >({});
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<
    Array<{ content: string; filePath?: string; lineNumber?: number }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project
        const projectRes = await fetch(`/api/projects/${projectId}`);
        if (!projectRes.ok) throw new Error('Failed to fetch project');
        const projectData = await projectRes.json();
        setProject(projectData);

        // Fetch rubriks
        const rubrikRes = await fetch('/api/rubrik');
        if (rubrikRes.ok) {
          const rubrikData = await rubrikRes.json();
          setRubriks(rubrikData);

          // Initialize scores
          const initialScores: Record<
            string,
            { score: number; feedback: string }
          > = {};
          rubrikData.forEach((r: Rubrik) => {
            initialScores[r.id] = { score: 0, feedback: '' };
          });
          setScores(initialScores);
        }

        // Check if review exists
        const myReview = projectData.reviews?.[0];
        if (myReview) {
          setReviewId(myReview.id);
          setOverallComment(myReview.overallComment || '');

          // Populate existing scores
          if (myReview.scores) {
            const existingScores: Record<
              string,
              { score: number; feedback: string }
            > = {};
            myReview.scores.forEach(
              (s: {
                rubrik: { id: string };
                score: number;
                feedback: string | null;
              }) => {
                existingScores[s.rubrik.id] = {
                  score: s.score,
                  feedback: s.feedback || '',
                };
              },
            );
            setScores((prev) => ({ ...prev, ...existingScores }));
          }

          // Populate existing comments
          if (myReview.comments) {
            setComments(
              myReview.comments.map(
                (c: {
                  content: string;
                  filePath: string | null;
                  lineNumber: number | null;
                }) => ({
                  content: c.content,
                  filePath: c.filePath || undefined,
                  lineNumber: c.lineNumber || undefined,
                }),
              ),
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const calculateTotalScore = () => {
    let total = 0;
    let maxTotal = 0;

    rubriks.forEach((rubrik) => {
      total += scores[rubrik.id]?.score || 0;
      maxTotal += rubrik.bobotMax;
    });

    return maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  };

  const handleSaveReview = async (submit = false) => {
    setIsSaving(true);
    setError('');

    try {
      // Create or update review
      const reviewPayload = {
        projectId,
        overallComment,
        overallScore: calculateTotalScore(),
        scores: Object.entries(scores).map(([rubrikId, data]) => ({
          rubrikId,
          score: data.score,
          feedback: data.feedback,
        })),
        comments: comments.map((c) => ({
          content: c.content,
          filePath: c.filePath,
          lineNumber: c.lineNumber,
        })),
        status: submit ? 'COMPLETED' : 'IN_PROGRESS',
      };

      const method = reviewId ? 'PUT' : 'POST';
      const url = reviewId ? `/api/reviews/${reviewId}` : '/api/reviews';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save review');
      }

      const data = await response.json();
      setReviewId(data.review?.id || reviewId);

      if (submit) {
        router.push('/dosen/projects');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving review');
    } finally {
      setIsSaving(false);
    }
  };

  const addComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { content: newComment.trim() }]);
      setNewComment('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-danger">{error || 'Project tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          as={Link}
          href="/dosen/projects"
          variant="light"
          isIconOnly
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Review Project</h1>
            <Chip color={getStatusColor(project.status)} variant="flat">
              {getStatusLabel(project.status)}
            </Chip>
          </div>
          <p className="text-default-500">{project.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            startContent={<Save size={18} />}
            onPress={() => handleSaveReview(false)}
            isLoading={isSaving}
          >
            Simpan Draft
          </Button>
          <Button
            color="primary"
            startContent={<Send size={18} />}
            onPress={() => handleSaveReview(true)}
            isLoading={isSaving}
          >
            Submit Review
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Mahasiswa Info */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Avatar
              name={project.mahasiswa.name}
              src={project.mahasiswa.image || undefined}
              size="lg"
            />
            <div>
              <p className="font-semibold text-lg">{project.mahasiswa.name}</p>
              <p className="text-default-500">{project.mahasiswa.username}</p>
              <p className="text-sm text-default-400">
                {project.mahasiswa.email}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Review Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs aria-label="Review sections">
            <Tab key="scoring" title="Penilaian">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Star size={20} />
                    Penilaian per Kategori
                  </h2>
                </CardHeader>
                <CardBody className="space-y-6">
                  {rubriks.length === 0 ? (
                    <p className="text-default-500 text-center py-4">
                      Belum ada rubrik penilaian yang tersedia
                    </p>
                  ) : (
                    rubriks.map((rubrik) => (
                      <div key={rubrik.id} className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{rubrik.name}</p>
                            <p className="text-sm text-default-500">
                              {rubrik.kategori}
                            </p>
                            {rubrik.description && (
                              <p className="text-xs text-default-400 mt-1">
                                {rubrik.description}
                              </p>
                            )}
                          </div>
                          <Chip size="sm" variant="flat">
                            {scores[rubrik.id]?.score || 0} / {rubrik.bobotMax}
                          </Chip>
                        </div>
                        <Slider
                          size="sm"
                          step={1}
                          maxValue={rubrik.bobotMax}
                          minValue={0}
                          value={scores[rubrik.id]?.score || 0}
                          onChange={(value) =>
                            setScores((prev) => ({
                              ...prev,
                              [rubrik.id]: {
                                ...prev[rubrik.id],
                                score: value as number,
                              },
                            }))
                          }
                          className="max-w-full"
                        />
                        <Textarea
                          placeholder="Feedback untuk kategori ini..."
                          size="sm"
                          value={scores[rubrik.id]?.feedback || ''}
                          onChange={(e) =>
                            setScores((prev) => ({
                              ...prev,
                              [rubrik.id]: {
                                ...prev[rubrik.id],
                                feedback: e.target.value,
                              },
                            }))
                          }
                          minRows={2}
                        />
                        <Divider />
                      </div>
                    ))
                  )}

                  {/* Total Score */}
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <span className="font-semibold">Total Nilai</span>
                    <span className="text-2xl font-bold text-primary">
                      {calculateTotalScore()}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="comments" title="Komentar">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare size={20} />
                    Komentar & Feedback
                  </h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  {/* Overall Comment */}
                  <div>
                    <p className="font-medium mb-2">Komentar Keseluruhan</p>
                    <Textarea
                      placeholder="Tulis komentar umum tentang project ini..."
                      value={overallComment}
                      onChange={(e) => setOverallComment(e.target.value)}
                      minRows={4}
                    />
                  </div>

                  <Divider />

                  {/* Additional Comments */}
                  <div>
                    <p className="font-medium mb-2">
                      Komentar Tambahan ({comments.length})
                    </p>

                    {comments.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-default-100 rounded-lg p-3 mb-2"
                      >
                        <p className="text-sm">{comment.content}</p>
                        {comment.filePath && (
                          <p className="text-xs text-default-500 mt-1">
                            {comment.filePath}
                            {comment.lineNumber && `:${comment.lineNumber}`}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Tambah komentar..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        minRows={2}
                        className="flex-1"
                      />
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={addComment}
                        isDisabled={!newComment.trim()}
                      >
                        Tambah
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="documents" title="Dokumen">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText size={20} />
                    Dokumen Project
                  </h2>
                </CardHeader>
                <CardBody>
                  {project.documents.length === 0 ? (
                    <p className="text-default-500 text-center py-4">
                      Belum ada dokumen yang diupload
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {project.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-default-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-default-400" />
                            <div>
                              <p className="font-medium">{doc.fileName}</p>
                              <p className="text-xs text-default-500">
                                {getDocumentTypeLabel(doc.type)} -{' '}
                                {formatDate(doc.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <Button
                            as="a"
                            href={doc.filePath}
                            target="_blank"
                            size="sm"
                            variant="flat"
                          >
                            Lihat
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Tab>

            {project.githubRepoUrl && (
              <Tab
                key="code"
                title={
                  <span className="flex items-center gap-1">
                    <Code size={16} /> Kode
                  </span>
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-default-500">
                      Klik pada nomor baris untuk menambahkan komentar pada kode
                    </p>
                    <a
                      href={project.githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Github size={14} />
                      Buka di GitHub
                    </a>
                  </div>
                  {(() => {
                    const parsed = parseGitHubUrl(project.githubRepoUrl!);
                    if (!parsed)
                      return (
                        <p className="text-danger">URL GitHub tidak valid</p>
                      );
                    return (
                      <GitHubCodeViewer
                        owner={parsed.owner}
                        repo={parsed.repo}
                        comments={comments
                          .filter((c) => c.filePath)
                          .map((c) => ({
                            filePath: c.filePath!,
                            lineNumber: c.lineNumber || 0,
                            content: c.content,
                          }))}
                        onAddComment={(filePath, lineNumber, content) => {
                          setComments([
                            ...comments,
                            { content, filePath, lineNumber },
                          ]);
                        }}
                      />
                    );
                  })()}
                </div>
              </Tab>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Info Project</h3>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div>
                <p className="text-default-500">Judul</p>
                <p className="font-medium">{project.title}</p>
              </div>
              <div>
                <p className="text-default-500">Semester</p>
                <p className="font-medium">{project.semester}</p>
              </div>
              {project.githubRepoUrl && (
                <div>
                  <p className="text-default-500">Repository</p>
                  <a
                    href={project.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Github size={14} />
                    GitHub
                  </a>
                </div>
              )}
              {project.description && (
                <div>
                  <p className="text-default-500">Deskripsi</p>
                  <p className="text-xs">{project.description}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Statistik Review</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-default-500">Dokumen</span>
                <span className="font-medium">{project.documents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Komentar</span>
                <span className="font-medium">{comments.length}</span>
              </div>
              <Divider />
              <div className="flex justify-between">
                <span className="text-default-500">Total Nilai</span>
                <span className="font-bold text-primary text-xl">
                  {calculateTotalScore()}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
