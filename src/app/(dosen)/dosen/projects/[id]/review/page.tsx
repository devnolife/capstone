'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Progress,
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
  ClipboardCheck,
  Award,
  TrendingUp,
  Calendar,
  User,
  Mail,
  ExternalLink,
  FolderGit2,
  Plus,
  Trash2,
  Image as ImageIcon,
  FileSignature,
  Camera,
  IdCard,
  File,
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
      lineStart: number | null;
      lineEnd: number | null;
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

interface StakeholderDocument {
  id: string;
  projectId: string;
  stakeholderName: string;
  stakeholderRole: string | null;
  organization: string | null;
  type: "SIGNATURE" | "PHOTO" | "AGREEMENT_LETTER" | "ID_CARD" | "SCREENSHOT" | "SUPPORTING_DOCUMENT" | "OTHER";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  description: string | null;
  uploadedAt: string;
}

interface ProjectScreenshot {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  category: string | null;
  orderIndex: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

const getStakeholderTypeConfig = (type: string) => {
  const config: Record<string, { color: "success" | "primary" | "warning" | "secondary" | "danger" | "default"; icon: React.ElementType; label: string }> = {
    SIGNATURE: { color: "success", icon: FileSignature, label: "Tanda Tangan" },
    PHOTO: { color: "primary", icon: Camera, label: "Foto" },
    AGREEMENT_LETTER: { color: "warning", icon: FileText, label: "Surat Persetujuan" },
    ID_CARD: { color: "secondary", icon: IdCard, label: "Kartu Identitas" },
    SCREENSHOT: { color: "primary", icon: ImageIcon, label: "Screenshot" },
    SUPPORTING_DOCUMENT: { color: "warning", icon: FileText, label: "Dokumen Pelengkap" },
    OTHER: { color: "danger", icon: File, label: "Lainnya" },
  };
  return config[type] || config.OTHER;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Get score color based on percentage
const getScoreColor = (score: number, max: number) => {
  const percentage = (score / max) * 100;
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'primary';
  if (percentage >= 40) return 'warning';
  return 'danger';
};

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
    Array<{ content: string; filePath?: string; lineStart?: number; lineEnd?: number }>
  >([]);
  const [stakeholderDocs, setStakeholderDocs] = useState<StakeholderDocument[]>([]);
  const [screenshots, setScreenshots] = useState<ProjectScreenshot[]>([]);

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
                  lineStart: number | null;
                  lineEnd: number | null;
                }) => ({
                  content: c.content,
                  filePath: c.filePath || undefined,
                  lineStart: c.lineStart || undefined,
                  lineEnd: c.lineEnd || undefined,
                }),
              ),
            );
          }
        }

        // Fetch stakeholder documents
        const stakeholderRes = await fetch(`/api/stakeholder-documents?projectId=${projectId}`);
        if (stakeholderRes.ok) {
          const stakeholderData = await stakeholderRes.json();
          setStakeholderDocs(stakeholderData.data || []);
        }

        // Fetch project screenshots
        const screenshotsRes = await fetch(`/api/projects/${projectId}/screenshots`);
        if (screenshotsRes.ok) {
          const screenshotsData = await screenshotsRes.json();
          setScreenshots(screenshotsData.screenshots || []);
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
          lineStart: c.lineStart,
          lineEnd: c.lineEnd,
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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Memuat data review...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 flex items-center justify-center">
          <FolderGit2 size={36} className="text-red-500" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Project Tidak Ditemukan</h3>
        <p className="text-danger mb-4">{error || 'Project tidak ditemukan'}</p>
        <Button as={Link} href="/dosen/projects" color="primary">
          Kembali ke Daftar Project
        </Button>
      </div>
    );
  }

  const totalScore = calculateTotalScore();

  return (
    <motion.div
      className="w-full space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Header */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <CardBody className="p-6 md:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  as={Link}
                  href="/dosen/projects"
                  variant="flat"
                  isIconOnly
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <ClipboardCheck size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">Review Project</h1>
                    <Chip
                      color={getStatusColor(project.status)}
                      variant="solid"
                      className="bg-white/20 text-white"
                    >
                      {getStatusLabel(project.status)}
                    </Chip>
                  </div>
                  <p className="text-white/70 text-sm md:text-base">
                    {project.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="flat"
                  className="bg-white/20 text-white hover:bg-white/30"
                  startContent={<Save size={18} />}
                  onPress={() => handleSaveReview(false)}
                  isLoading={isSaving}
                >
                  Simpan Draft
                </Button>
                <Button
                  className="bg-white text-emerald-600 font-semibold hover:bg-white/90"
                  startContent={<Send size={18} />}
                  onPress={() => handleSaveReview(true)}
                  isLoading={isSaving}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="bg-danger-50 text-danger border border-danger-200 rounded-xl p-4 text-sm flex items-center gap-2">
          <div className="p-2 rounded-lg bg-danger-100">
            <MessageSquare size={16} />
          </div>
          {error}
        </motion.div>
      )}

      {/* Mahasiswa Info Card */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <User size={20} />
              </div>
              <h2 className="font-bold text-lg">Informasi Mahasiswa</h2>
            </div>
          </div>
          <CardBody className="p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Avatar
                name={project.mahasiswa.name}
                src={project.mahasiswa.image || undefined}
                className="w-16 h-16 ring-4 ring-violet-100 dark:ring-violet-900/30"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-semibold text-lg">{project.mahasiswa.name}</p>
                  <p className="text-default-500">@{project.mahasiswa.username}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {project.mahasiswa.email && (
                    <div className="flex items-center gap-1.5 text-default-500">
                      <Mail size={14} />
                      {project.mahasiswa.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-default-500">
                    <Calendar size={14} />
                    {project.semester} {project.tahunAkademik}
                  </div>
                </div>
              </div>
              {project.githubRepoUrl && (
                <Button
                  as="a"
                  href={project.githubRepoUrl}
                  target="_blank"
                  variant="flat"
                  color="default"
                  startContent={<Github size={16} />}
                  endContent={<ExternalLink size={14} />}
                >
                  Repository
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Review Form */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <Tabs
              aria-label="Review sections"
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "px-4 pt-4 gap-4",
                cursor: "bg-primary",
                tab: "px-0 h-10",
                tabContent: "group-data-[selected=true]:text-primary font-medium"
              }}
            >
              <Tab
                key="scoring"
                title={
                  <div className="flex items-center gap-2">
                    <Star size={16} />
                    <span>Penilaian</span>
                  </div>
                }
              >
                <CardBody className="space-y-6 pt-4">
                  {rubriks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                        <Star size={28} className="text-amber-500" />
                      </div>
                      <p className="text-default-500">
                        Belum ada rubrik penilaian yang tersedia
                      </p>
                    </div>
                  ) : (
                    rubriks.map((rubrik, index) => (
                      <motion.div
                        key={rubrik.id}
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4 hover:border-primary/50 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                {index + 1}
                              </span>
                              <p className="font-semibold">{rubrik.name}</p>
                            </div>
                            <Chip size="sm" variant="flat" color="secondary" className="mb-2">
                              {rubrik.kategori}
                            </Chip>
                            {rubrik.description && (
                              <p className="text-xs text-default-400 mt-1">
                                {rubrik.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {scores[rubrik.id]?.score || 0}
                            </div>
                            <div className="text-xs text-default-500">
                              dari {rubrik.bobotMax}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-default-500">
                            <span>0</span>
                            <span>{rubrik.bobotMax}</span>
                          </div>
                          <Slider
                            size="md"
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
                            color={getScoreColor(scores[rubrik.id]?.score || 0, rubrik.bobotMax)}
                            className="max-w-full"
                            showTooltip
                          />
                        </div>

                        <Textarea
                          placeholder="Berikan feedback untuk kategori ini..."
                          variant="bordered"
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
                          classNames={{
                            inputWrapper: "border-zinc-200 dark:border-zinc-700"
                          }}
                        />
                      </motion.div>
                    ))
                  )}

                  {/* Total Score Card */}
                  <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white">
                          <Award size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Total Nilai</p>
                          <p className="text-xs text-default-500">Nilai keseluruhan project</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-primary">
                          {totalScore}
                        </span>
                        <span className="text-lg text-default-500">/100</span>
                      </div>
                    </div>
                    <Progress
                      value={totalScore}
                      color={getScoreColor(totalScore, 100)}
                      className="mt-4"
                      size="md"
                    />
                  </div>
                </CardBody>
              </Tab>

              <Tab
                key="comments"
                title={
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>Komentar</span>
                    {comments.length > 0 && (
                      <Chip size="sm" variant="flat" color="primary">{comments.length}</Chip>
                    )}
                  </div>
                }
              >
                <CardBody className="space-y-6 pt-4">
                  {/* Overall Comment */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <MessageSquare size={16} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <p className="font-semibold">Komentar Keseluruhan</p>
                    </div>
                    <Textarea
                      placeholder="Tulis komentar umum tentang project ini..."
                      variant="bordered"
                      value={overallComment}
                      onChange={(e) => setOverallComment(e.target.value)}
                      minRows={4}
                      classNames={{
                        inputWrapper: "border-zinc-200 dark:border-zinc-700"
                      }}
                    />
                  </div>

                  <Divider />

                  {/* Additional Comments */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <Plus size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="font-semibold">Komentar Tambahan</p>
                      </div>
                      <Chip size="sm" variant="flat">{comments.length} komentar</Chip>
                    </div>

                    {comments.length > 0 && (
                      <div className="space-y-2">
                        {comments.map((comment, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1">
                                <p className="text-sm">{comment.content}</p>
                                {comment.filePath && (
                                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                                    <Code size={12} />
                                    {comment.filePath}
                                    {comment.lineStart && (
                                      <span className="text-default-500">:{comment.lineStart}{comment.lineEnd && comment.lineEnd !== comment.lineStart ? `-${comment.lineEnd}` : ''}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                isIconOnly
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onPress={() => {
                                  setComments(comments.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Tambah komentar baru..."
                        variant="bordered"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        minRows={2}
                        className="flex-1"
                        classNames={{
                          inputWrapper: "border-zinc-200 dark:border-zinc-700"
                        }}
                      />
                      <Button
                        color="primary"
                        onPress={addComment}
                        isDisabled={!newComment.trim()}
                        className="self-end"
                        startContent={<Plus size={16} />}
                      >
                        Tambah
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Tab>

              <Tab
                key="documents"
                title={
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Dokumen</span>
                    {(project.documents.length + stakeholderDocs.length) > 0 && (
                      <Chip size="sm" variant="flat" color="secondary">{project.documents.length + stakeholderDocs.length}</Chip>
                    )}
                  </div>
                }
              >
                <CardBody className="pt-4 space-y-6">
                  {/* Project Documents Section */}
                  {project.documents.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                        Dokumen Project ({project.documents.length})
                      </h4>
                      <div className="space-y-3">
                        {project.documents.map((doc, index) => (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 hover:border-primary/30 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="font-medium">{doc.fileName}</p>
                                <p className="text-xs text-default-500">
                                  {getDocumentTypeLabel(doc.type)} • {formatDate(doc.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <Button
                              as="a"
                              href={doc.filePath}
                              target="_blank"
                              size="sm"
                              variant="flat"
                              color="primary"
                              endContent={<ExternalLink size={14} />}
                            >
                              Lihat
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stakeholder Documents Section */}
                  {stakeholderDocs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <FileSignature size={16} className="text-success" />
                        Dokumen Stakeholder ({stakeholderDocs.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stakeholderDocs.map((doc, index) => {
                          const typeConfig = getStakeholderTypeConfig(doc.type);
                          const TypeIcon = typeConfig.icon;
                          // Check if file is image based on extension
                          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
                          const isImage = imageExtensions.some(ext => doc.fileName.toLowerCase().endsWith(ext));

                          return (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:border-primary/50 transition-colors group"
                            >
                              {/* Preview Thumbnail */}
                              {isImage ? (
                                <div className="relative h-40 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                  <img
                                    src={doc.fileUrl}
                                    alt={doc.fileName}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      as="a"
                                      href={doc.fileUrl}
                                      target="_blank"
                                      size="sm"
                                      variant="flat"
                                      className="bg-white/20 backdrop-blur-sm text-white"
                                      endContent={<ExternalLink size={14} />}
                                    >
                                      Lihat Full
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative h-40 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
                                  <FileText size={48} className="text-zinc-400" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      as="a"
                                      href={doc.fileUrl}
                                      target="_blank"
                                      size="sm"
                                      variant="flat"
                                      className="bg-white/20 backdrop-blur-sm text-white"
                                      endContent={<ExternalLink size={14} />}
                                    >
                                      Buka File
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Document Info */}
                              <div className="p-4 space-y-3">
                                <Chip
                                  size="sm"
                                  color={typeConfig.color}
                                  variant="flat"
                                  startContent={<TypeIcon size={12} />}
                                >
                                  {typeConfig.label}
                                </Chip>

                                <div className="space-y-1">
                                  <p className="font-medium text-sm">{doc.stakeholderName}</p>
                                  {doc.stakeholderRole && (
                                    <p className="text-xs text-default-500">{doc.stakeholderRole}</p>
                                  )}
                                  {doc.organization && (
                                    <p className="text-xs text-default-400">{doc.organization}</p>
                                  )}
                                </div>

                                {doc.description && (
                                  <p className="text-xs text-default-500 line-clamp-2">{doc.description}</p>
                                )}

                                <div className="flex items-center justify-between text-xs text-default-400 pt-2 border-t border-zinc-100 dark:border-zinc-700">
                                  <span className="truncate max-w-[60%]">{doc.fileName}</span>
                                  <span>{formatDate(doc.uploadedAt)}</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {project.documents.length === 0 && stakeholderDocs.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <FileText size={28} className="text-zinc-400" />
                      </div>
                      <p className="text-default-500">
                        Belum ada dokumen yang diupload
                      </p>
                    </div>
                  )}
                </CardBody>
              </Tab>

              <Tab
                key="screenshots"
                title={
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    <span>Screenshot</span>
                    {screenshots.length > 0 && (
                      <Chip size="sm" variant="flat" color="primary">{screenshots.length}</Chip>
                    )}
                  </div>
                }
              >
                <CardBody className="pt-4">
                  {screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {screenshots.map((screenshot, index) => (
                        <motion.div
                          key={screenshot.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:border-primary/50 transition-colors group"
                        >
                          <div className="relative h-40 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <img
                              src={screenshot.fileUrl}
                              alt={screenshot.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                as="a"
                                href={screenshot.fileUrl}
                                target="_blank"
                                size="sm"
                                variant="flat"
                                className="bg-white/20 backdrop-blur-sm text-white"
                                endContent={<ExternalLink size={14} />}
                              >
                                Lihat Full
                              </Button>
                            </div>
                          </div>
                          <div className="p-3 space-y-1">
                            <p className="font-medium text-sm truncate">{screenshot.title}</p>
                            {screenshot.description && (
                              <p className="text-xs text-default-500 line-clamp-2">{screenshot.description}</p>
                            )}
                            {screenshot.category && (
                              <Chip size="sm" variant="flat" color="secondary">{screenshot.category}</Chip>
                            )}
                            <p className="text-xs text-default-400">{formatDate(screenshot.createdAt)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <ImageIcon size={28} className="text-zinc-400" />
                      </div>
                      <p className="text-default-500">
                        Belum ada screenshot aplikasi
                      </p>
                    </div>
                  )}
                </CardBody>
              </Tab>

              {project.githubRepoUrl && (
                <Tab
                  key="code"
                  title={
                    <div className="flex items-center gap-2">
                      <Code size={16} />
                      <span>Kode</span>
                    </div>
                  }
                >
                  <CardBody className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700">
                            <Code size={16} className="text-zinc-600 dark:text-zinc-400" />
                          </div>
                          <p className="text-sm text-default-500">
                            Klik pada nomor baris untuk menambahkan komentar pada kode
                          </p>
                        </div>
                        <Button
                          as="a"
                          href={project.githubRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          variant="flat"
                          startContent={<Github size={14} />}
                          endContent={<ExternalLink size={12} />}
                        >
                          Buka di GitHub
                        </Button>
                      </div>
                      {(() => {
                        const parsed = parseGitHubUrl(project.githubRepoUrl!);
                        if (!parsed)
                          return (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                <Github size={28} className="text-red-500" />
                              </div>
                              <p className="text-danger">URL GitHub tidak valid</p>
                            </div>
                          );
                        return (
                          <GitHubCodeViewer
                            owner={parsed.owner}
                            repo={parsed.repo}
                            comments={comments
                              .filter((c) => c.filePath)
                              .map((c) => ({
                                filePath: c.filePath!,
                                lineStart: c.lineStart || 0,
                                content: c.content,
                              }))}
                            onAddComment={(filePath, lineStart, content) => {
                              setComments([
                                ...comments,
                                { content, filePath, lineStart },
                              ]);
                            }}
                          />
                        );
                      })()}
                    </div>
                  </CardBody>
                </Tab>
              )}
            </Tabs>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Project Info */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FolderGit2 size={18} className="text-primary" />
                <h3 className="font-semibold">Info Project</h3>
              </div>
            </div>
            <CardBody className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-default-500 uppercase tracking-wide">Judul</p>
                <p className="font-medium">{project.title}</p>
              </div>
              <Divider />
              <div className="space-y-1">
                <p className="text-xs text-default-500 uppercase tracking-wide">Semester</p>
                <p className="font-medium">{project.semester} {project.tahunAkademik}</p>
              </div>
              {project.githubRepoUrl && (
                <>
                  <Divider />
                  <div className="space-y-1">
                    <p className="text-xs text-default-500 uppercase tracking-wide">Repository</p>
                    <a
                      href={project.githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Github size={14} />
                      GitHub
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </>
              )}
              {project.description && (
                <>
                  <Divider />
                  <div className="space-y-1">
                    <p className="text-xs text-default-500 uppercase tracking-wide">Deskripsi</p>
                    <p className="text-xs text-default-600">{project.description}</p>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold">Statistik Review</h3>
              </div>
            </div>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm">Dokumen</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {project.documents.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-sm">Komentar</span>
                </div>
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {comments.length}
                </span>
              </div>
              <Divider />
              {/* Score Circle */}
              <div className="text-center py-4">
                <div className="relative w-28 h-28 mx-auto">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-zinc-200 dark:text-zinc-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={251}
                      strokeDashoffset={251 - (251 * totalScore) / 100}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{totalScore}</span>
                    <span className="text-[10px] text-default-500">Total Nilai</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons - Mobile */}
          <div className="md:hidden space-y-2">
            <Button
              fullWidth
              variant="flat"
              startContent={<Save size={18} />}
              onPress={() => handleSaveReview(false)}
              isLoading={isSaving}
            >
              Simpan Draft
            </Button>
            <Button
              fullWidth
              color="primary"
              startContent={<Send size={18} />}
              onPress={() => handleSaveReview(true)}
              isLoading={isSaving}
            >
              Submit Review
            </Button>
          </div>
        </motion.div>
      </div >
    </motion.div >
  );
}
