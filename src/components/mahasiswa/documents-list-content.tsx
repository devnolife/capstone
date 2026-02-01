'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Progress,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Plus,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Edit3,
  Calendar,
  Target,
  Download,
  FileSignature,
  FileCheck,
  ScrollText,
  ChevronDown,
  Loader2,
} from 'lucide-react';

interface ProjectWithRequirements {
  id: string;
  title: string;
  status: string;
  semester: string;
  updatedAt: string;
  requirements: {
    completionPercent: number;
    updatedAt: string;
    judulProyek: string | null;
    deadlineDate: string | null;
  } | null;
}

interface Props {
  projects: ProjectWithRequirements[];
}

const statusConfig: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }> = {
  DRAFT: { label: 'Draft', color: 'default' },
  SUBMITTED: { label: 'Diajukan', color: 'primary' },
  IN_REVIEW: { label: 'Sedang Direview', color: 'warning' },
  REVISION_NEEDED: { label: 'Perlu Revisi', color: 'danger' },
  APPROVED: { label: 'Disetujui', color: 'success' },
  REJECTED: { label: 'Ditolak', color: 'danger' },
};

export function DocumentsListContent({ projects }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingTemplate, setDownloadingTemplate] = useState<string | null>(null);

  // Download template function
  const handleDownloadTemplate = async (projectId: string, templateType: 'license' | 'handover' | 'declaration') => {
    setDownloadingTemplate(`${projectId}-${templateType}`);
    try {
      const response = await fetch(`/api/documents/template?projectId=${projectId}&type=${templateType}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengunduh template');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `template_${templateType}.html`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast({
        title: 'Berhasil',
        description: 'Template berhasil diunduh. Buka file dan klik "Cetak" untuk menyimpan sebagai PDF.',
        color: 'success',
      });
    } catch (error) {
      console.error('Download error:', error);
      addToast({
        title: 'Gagal',
        description: 'Gagal mengunduh template. Silakan coba lagi.',
        color: 'danger',
      });
    } finally {
      setDownloadingTemplate(null);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.requirements?.judulProyek?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate overall stats
  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.requirements?.completionPercent === 100).length,
    inProgress: projects.filter((p) => p.requirements && p.requirements.completionPercent > 0 && p.requirements.completionPercent < 100).length,
    notStarted: projects.filter((p) => !p.requirements || p.requirements.completionPercent === 0).length,
  };

  // Format deadline date
  const formatDeadline = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    if (diffDays < 0) {
      return { text: formattedDate, status: 'overdue', label: 'Lewat deadline' };
    } else if (diffDays <= 7) {
      return { text: formattedDate, status: 'soon', label: `${diffDays} hari lagi` };
    }
    return { text: formattedDate, status: 'normal', label: null };
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Soft Colored */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/40 dark:via-sky-950/30 dark:to-blue-950/40 border border-cyan-200/50 dark:border-cyan-800/30 p-6 md:p-8">
        {/* Subtle Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-sky-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/25">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Persyaratan Proyek</h1>
            <p className="text-sm text-cyan-600/70 dark:text-cyan-400/60 mt-1">
              Kelola persyaratan dan dokumentasi untuk setiap proyek capstone
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FolderOpen size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-default-500">Total Proyek</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-default-500">Lengkap</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning/10">
                <Edit3 size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-default-500">Dalam Proses</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-default/10">
                <AlertCircle size={20} className="text-default-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.notStarted}</p>
                <p className="text-xs text-default-500">Belum Mulai</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Template Downloads Section */}
      {projects.length > 0 && (
        <Card className="shadow-sm border border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
          <CardBody className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                <Download size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100">
                  Download Template Dokumen
                </h3>
                <p className="text-sm text-amber-700/70 dark:text-amber-300/60 mt-1 mb-4">
                  Template surat pernyataan hak cipta, serah terima, dan keaslian karya untuk project capstone.
                  Project dapat dimodifikasi oleh mahasiswa angkatan selanjutnya dengan ketentuan yang berlaku.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Template Cards */}
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <FileSignature size={18} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Surat Hak Cipta & Lisensi</h4>
                        <p className="text-xs text-default-400">Izin modifikasi untuk mahasiswa</p>
                      </div>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button 
                          size="sm" 
                          color="secondary" 
                          variant="flat" 
                          className="w-full"
                          endContent={<ChevronDown size={14} />}
                        >
                          Pilih Proyek
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu 
                        aria-label="Pilih proyek untuk template hak cipta"
                        onAction={(key) => handleDownloadTemplate(key as string, 'license')}
                      >
                        {projects.map((p) => (
                          <DropdownItem 
                            key={p.id}
                            description={p.semester}
                            startContent={
                              downloadingTemplate === `${p.id}-license` ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <FileText size={14} />
                              )
                            }
                          >
                            {p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <FileCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Berita Acara Serah Terima</h4>
                        <p className="text-xs text-default-400">Penyerahan project ke prodi</p>
                      </div>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button 
                          size="sm" 
                          color="success" 
                          variant="flat" 
                          className="w-full"
                          endContent={<ChevronDown size={14} />}
                        >
                          Pilih Proyek
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu 
                        aria-label="Pilih proyek untuk template serah terima"
                        onAction={(key) => handleDownloadTemplate(key as string, 'handover')}
                      >
                        {projects.map((p) => (
                          <DropdownItem 
                            key={p.id}
                            description={p.semester}
                            startContent={
                              downloadingTemplate === `${p.id}-handover` ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <FileText size={14} />
                              )
                            }
                          >
                            {p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <ScrollText size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Pernyataan Keaslian Karya</h4>
                        <p className="text-xs text-default-400">Surat bebas plagiarisme</p>
                      </div>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button 
                          size="sm" 
                          color="primary" 
                          variant="flat" 
                          className="w-full"
                          endContent={<ChevronDown size={14} />}
                        >
                          Pilih Proyek
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu 
                        aria-label="Pilih proyek untuk template keaslian"
                        onAction={(key) => handleDownloadTemplate(key as string, 'declaration')}
                      >
                        {projects.map((p) => (
                          <DropdownItem 
                            key={p.id}
                            description={p.semester}
                            startContent={
                              downloadingTemplate === `${p.id}-declaration` ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <FileText size={14} />
                              )
                            }
                          >
                            {p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    <strong>💡 Petunjuk:</strong> Setelah download, buka file HTML di browser lalu klik tombol &quot;Cetak / Simpan PDF&quot; untuk menyimpan sebagai PDF. 
                    Pastikan data project sudah lengkap sebelum mencetak dokumen resmi.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search */}
      <Card className="shadow-sm">
        <CardBody className="py-3">
          <Input
            placeholder="Cari proyek atau judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-default-400" />}
            isClearable
            onClear={() => setSearchQuery('')}
            classNames={{
              inputWrapper: 'bg-default-100',
            }}
          />
        </CardBody>
      </Card>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <Card className="shadow-sm">
          <CardBody className="py-12 text-center">
            <FolderOpen size={48} className="mx-auto text-default-300 mb-4" />
            <p className="text-lg font-medium text-default-600">
              {projects.length === 0 ? 'Belum ada proyek' : 'Proyek tidak ditemukan'}
            </p>
            <p className="text-sm text-default-400 mt-1">
              {projects.length === 0
                ? 'Buat proyek terlebih dahulu untuk mengisi persyaratan'
                : 'Coba kata kunci lain'}
            </p>
            {projects.length === 0 && (
              <Button
                as={Link}
                href="/mahasiswa/projects/new"
                color="primary"
                className="mt-4"
                startContent={<Plus size={18} />}
              >
                Buat Proyek
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project, index) => {
            const progress = project.requirements?.completionPercent || 0;
            const status = statusConfig[project.status] || statusConfig.DRAFT;
            const lastUpdated = project.requirements?.updatedAt
              ? new Date(project.requirements.updatedAt)
              : null;
            const deadline = formatDeadline(project.requirements?.deadlineDate || null);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  as={Link}
                  href={`/mahasiswa/documents/${project.id}`}
                  className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  isPressable
                >
                  <CardBody className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                            <Target size={22} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                              {project.requirements?.judulProyek || project.title}
                            </h3>
                            {project.requirements?.judulProyek && project.requirements.judulProyek !== project.title && (
                              <p className="text-xs text-default-400 truncate">{project.title}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <Chip size="sm" variant="flat" color={status.color}>
                                {status.label}
                              </Chip>
                              <span className="text-xs text-default-400">{project.semester}</span>
                              {deadline && (
                                <Chip 
                                  size="sm" 
                                  variant="flat" 
                                  color={deadline.status === 'overdue' ? 'danger' : deadline.status === 'soon' ? 'warning' : 'default'}
                                  startContent={<Calendar size={10} />}
                                >
                                  {deadline.label || deadline.text}
                                </Chip>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="sm:w-48">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-default-500">Kelengkapan</span>
                          <span className="text-xs font-medium">{progress}%</span>
                        </div>
                        <Progress
                          value={progress}
                          size="sm"
                          color={progress === 100 ? 'success' : progress > 0 ? 'primary' : 'default'}
                        />
                        {lastUpdated && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-default-400">
                            <Clock size={10} />
                            <span>
                              Diupdate {lastUpdated.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={20} className="text-default-300 hidden sm:block" />
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
