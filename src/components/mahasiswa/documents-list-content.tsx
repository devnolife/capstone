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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-primary" size={28} />
            Persyaratan Proyek
          </h1>
          <p className="text-sm text-default-500 mt-1">
            Kelola persyaratan dan dokumentasi untuk setiap proyek capstone
          </p>
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
