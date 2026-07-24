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
import { PageHeader } from '@/components/caret/PageHeader';
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
      {/* Page Header */}
      <PageHeader
        label="[02] PERSYARATAN"
        labelRight="/ DOKUMEN"
        title="Persyaratan proyek"
        description="Kelola persyaratan dan dokumentasi untuk setiap proyek capstone."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-border bg-card shadow-none">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-primary text-foreground">
                <FolderOpen size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                <p className="text-xs text-app-teritary-invert">Total Proyek</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-border bg-card shadow-none">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.completed}</p>
                <p className="text-xs text-app-teritary-invert">Lengkap</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-border bg-card shadow-none">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Edit3 size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.inProgress}</p>
                <p className="text-xs text-app-teritary-invert">Dalam Proses</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-border bg-card shadow-none">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-quaternary text-app-secondary-invert">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.notStarted}</p>
                <p className="text-xs text-app-teritary-invert">Belum Mulai</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Template Downloads Section */}
      {projects.length > 0 && (
        <Card className="border border-border bg-card shadow-none">
          <CardBody className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-app-primary text-foreground">
                <Download size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-[450] tracking-tight">
                  Download Template Dokumen
                </h3>
                <p className="text-sm text-app-secondary-invert mt-1 mb-4">
                  Template surat pernyataan hak cipta, serah terima, dan keaslian karya untuk project capstone.
                  Project dapat dimodifikasi oleh mahasiswa angkatan selanjutnya dengan ketentuan yang berlaku.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Template Cards */}
                  <div className="p-4 rounded-xl border border-border bg-app-quinary">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-primary text-foreground">
                        <FileSignature size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Surat Hak Cipta & Lisensi</h4>
                        <p className="text-xs text-app-teritary-invert">Izin modifikasi untuk mahasiswa</p>
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

                  <div className="p-4 rounded-xl border border-border bg-app-quinary">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-primary text-foreground">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Berita Acara Serah Terima</h4>
                        <p className="text-xs text-app-teritary-invert">Penyerahan project ke prodi</p>
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

                  <div className="p-4 rounded-xl border border-border bg-app-quinary">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-primary text-foreground">
                        <ScrollText size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Pernyataan Keaslian Karya</h4>
                        <p className="text-xs text-app-teritary-invert">Surat bebas plagiarisme</p>
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

                <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <p className="text-xs text-app-secondary-invert">
                    <strong className="text-warning">ðŸ’¡ Petunjuk:</strong> Setelah download, buka file HTML di browser lalu klik tombol &quot;Cetak / Simpan PDF&quot; untuk menyimpan sebagai PDF. 
                    Pastikan data project sudah lengkap sebelum mencetak dokumen resmi.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search */}
      <Card className="border border-border bg-card shadow-none">
        <CardBody className="py-3">
          <Input
            placeholder="Cari proyek atau judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-app-teritary-invert" />}
            isClearable
            onClear={() => setSearchQuery('')}
            classNames={{
              inputWrapper: 'bg-app-quinary',
            }}
          />
        </CardBody>
      </Card>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <Card className="border border-border bg-card shadow-none">
          <CardBody className="py-12 text-center">
            <FolderOpen size={48} className="mx-auto text-app-teritary-invert mb-4" />
            <p className="text-lg font-medium text-foreground">
              {projects.length === 0 ? 'Belum ada proyek' : 'Proyek tidak ditemukan'}
            </p>
            <p className="text-sm text-app-teritary-invert mt-1">
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
                  className="border border-border bg-card shadow-none transition-colors hover:bg-app-quinary cursor-pointer"
                  isPressable
                >
                  <CardBody className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-app-primary text-foreground">
                            <Target size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                              {project.requirements?.judulProyek || project.title}
                            </h3>
                            {project.requirements?.judulProyek && project.requirements.judulProyek !== project.title && (
                              <p className="text-xs text-app-teritary-invert truncate">{project.title}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <Chip size="sm" variant="flat" color={status.color}>
                                {status.label}
                              </Chip>
                              <span className="text-xs text-app-teritary-invert">{project.semester}</span>
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
                          <span className="text-xs text-app-teritary-invert">Kelengkapan</span>
                          <span className="text-xs font-medium tabular-nums">{progress}%</span>
                        </div>
                        <Progress
                          value={progress}
                          size="sm"
                          color={progress === 100 ? 'success' : progress > 0 ? 'primary' : 'default'}
                          classNames={{ track: 'bg-app-primary' }}
                        />
                        {lastUpdated && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-app-teritary-invert">
                            <Clock size={10} />
                            <span>
                              Diupdate {lastUpdated.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={20} className="text-app-teritary-invert hidden sm:block" />
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
