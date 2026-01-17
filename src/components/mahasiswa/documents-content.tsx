'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  FolderOpen,
  HardDrive,
  FileArchive,
  MoreVertical,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { formatDate } from '@/lib/utils';

interface Document {
  id: string;
  type: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  project: {
    id: string;
    title: string;
    status: string;
  };
}

interface Project {
  id: string;
  title: string;
  status: string;
}

interface DocumentsContentProps {
  documents: Document[];
  projects: Project[];
  stats: {
    totalDocuments: number;
    totalSize: number;
    byType: Record<string, number>;
  };
}

const documentTypeLabels: Record<string, string> = {
  PROPOSAL: 'Proposal',
  BAB_1: 'Bab 1',
  BAB_2: 'Bab 2',
  BAB_3: 'Bab 3',
  BAB_4: 'Bab 4',
  BAB_5: 'Bab 5',
  FINAL_REPORT: 'Laporan Akhir',
  PRESENTATION: 'Presentasi',
  SOURCE_CODE: 'Source Code',
  OTHER: 'Lainnya',
};

const documentTypeColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'> = {
  PROPOSAL: 'primary',
  BAB_1: 'secondary',
  BAB_2: 'secondary',
  BAB_3: 'secondary',
  BAB_4: 'secondary',
  BAB_5: 'secondary',
  FINAL_REPORT: 'success',
  PRESENTATION: 'warning',
  SOURCE_CODE: 'danger',
  OTHER: 'default',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

// Mobile Document Card
function MobileDocumentCard({ document }: { document: Document }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <FileText className="text-primary" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{document.fileName}</p>
                  <p className="text-xs text-default-500 truncate">{document.project.title}</p>
                </div>
              </div>
              <Chip
                size="sm"
                color={documentTypeColors[document.type]}
                variant="flat"
                className="h-5 text-[10px] shrink-0"
              >
                {documentTypeLabels[document.type]}
              </Chip>
            </div>

            <div className="flex items-center gap-3 text-xs text-default-500">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>{formatDate(document.uploadedAt)}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                as="a"
                href={document.filePath}
                target="_blank"
                size="sm"
                variant="flat"
                className="flex-1 h-8"
                startContent={<Eye size={14} />}
              >
                Lihat
              </Button>
              <Button
                as="a"
                href={document.filePath}
                download
                size="sm"
                color="primary"
                variant="flat"
                className="flex-1 h-8"
                startContent={<Download size={14} />}
              >
                Unduh
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function MahasiswaDocumentsContent({ documents, projects, stats }: DocumentsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesProject = projectFilter === 'all' || doc.project.id === projectFilter;
    return matchesSearch && matchesType && matchesProject;
  });

  return (
    <motion.div
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Dokumen Saya</h1>
          <p className="text-sm md:text-base text-default-500">
            Kelola semua dokumen project Anda
          </p>
        </div>
        <Button
          as={Link}
          href="/mahasiswa/projects"
          color="primary"
          startContent={<Upload size={18} />}
        >
          Upload Dokumen
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={itemVariants}
        className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible"
      >
        <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 min-w-max md:min-w-0">
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Total Dokumen"
              value={stats.totalDocuments}
              icon={FileText}
              color="primary"
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Total Ukuran"
              value={formatFileSize(stats.totalSize)}
              icon={HardDrive}
              color="secondary"
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Jenis Dokumen"
              value={Object.keys(stats.byType).length}
              icon={FileArchive}
              color="success"
            />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardBody className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="Cari dokumen..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search size={18} className="text-default-400" />}
                className="md:max-w-xs"
                size="sm"
              />
              <Select
                placeholder="Semua Tipe"
                selectedKeys={typeFilter ? [typeFilter] : []}
                onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] as string || 'all')}
                className="md:max-w-[180px]"
                size="sm"
                startContent={<Filter size={16} className="text-default-400" />}
                items={[
                  { key: 'all', label: 'Semua Tipe' },
                  ...Object.entries(documentTypeLabels).map(([key, label]) => ({ key, label })),
                ]}
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
              <Select
                placeholder="Semua Project"
                selectedKeys={projectFilter ? [projectFilter] : []}
                onSelectionChange={(keys) => setProjectFilter(Array.from(keys)[0] as string || 'all')}
                className="md:max-w-[200px]"
                size="sm"
                startContent={<FolderOpen size={16} className="text-default-400" />}
                items={[
                  { key: 'all', label: 'Semua Project' },
                  ...projects.map((project) => ({ key: project.id, label: project.title })),
                ]}
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Documents List */}
      <motion.div variants={itemVariants}>
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <FileText size={48} className="mx-auto text-default-300 mb-4" />
              <p className="text-default-500 mb-4">
                {documents.length === 0
                  ? 'Belum ada dokumen yang diupload'
                  : 'Tidak ada dokumen yang cocok dengan filter'}
              </p>
              <Button as={Link} href="/mahasiswa/projects" color="primary">
                Upload Dokumen
              </Button>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden">
              <motion.div variants={containerVariants}>
                {filteredDocuments.map((doc) => (
                  <MobileDocumentCard key={doc.id} document={doc} />
                ))}
              </motion.div>
            </div>

            {/* Desktop View */}
            <Card className="hidden md:block">
              <CardBody className="p-0">
                <Table aria-label="Documents table" removeWrapper>
                  <TableHeader>
                    <TableColumn>NAMA FILE</TableColumn>
                    <TableColumn>PROJECT</TableColumn>
                    <TableColumn>TIPE</TableColumn>
                    <TableColumn>UKURAN</TableColumn>
                    <TableColumn>TANGGAL UPLOAD</TableColumn>
                    <TableColumn width={80}>AKSI</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-default-400" />
                            <span className="font-medium">{doc.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/mahasiswa/projects/${doc.project.id}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {doc.project.title}
                            <ExternalLink size={12} />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" color={documentTypeColors[doc.type]} variant="flat">
                            {documentTypeLabels[doc.type]}
                          </Chip>
                        </TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Document actions">
                              <DropdownItem
                                key="view"
                                startContent={<Eye size={16} />}
                                href={doc.filePath}
                                target="_blank"
                              >
                                Lihat
                              </DropdownItem>
                              <DropdownItem
                                key="download"
                                startContent={<Download size={16} />}
                                href={doc.filePath}
                                download
                              >
                                Unduh
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                startContent={<Trash2 size={16} />}
                                color="danger"
                                className="text-danger"
                              >
                                Hapus
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
