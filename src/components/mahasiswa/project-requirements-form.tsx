'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Textarea,
  Progress,
  Chip,
} from '@heroui/react';
import {
  BookOpen,
  Target,
  Layers,
  GitBranch,
  FileCheck,
  Calendar,
  Lightbulb,
  FileText,
  Award,
  Users,
  Shield,
  CheckCircle,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface Requirement {
  id?: string;
  category: string;
  content: string;
  isCompleted: boolean;
}

interface Project {
  id: string;
  title: string;
  githubRepoUrl: string | null;
  requirements: Requirement[];
}

const requirementCategories = [
  {
    key: 'judul',
    title: 'Judul Proyek',
    icon: BookOpen,
    color: 'text-blue-500',
    description: 'Jelaskan judul proyek dan ruang lingkupnya',
    placeholder: 'Contoh: Sistem Manajemen Capstone berbasis Web untuk memudahkan monitoring project mahasiswa...',
  },
  {
    key: 'tujuan',
    title: 'Tujuan dan Manfaat',
    icon: Target,
    color: 'text-green-500',
    description: 'Uraikan tujuan yang ingin dicapai dan manfaat proyek',
    placeholder: 'Tujuan: ...\nManfaat: ...',
  },
  {
    key: 'integrasi',
    title: 'Integrasi Mata Kuliah',
    icon: Layers,
    color: 'text-purple-500',
    description: 'Sebutkan mata kuliah yang diintegrasikan dalam proyek',
    placeholder: 'Contoh: Pemrograman Web (React/Next.js), Basis Data (PostgreSQL), Rekayasa Perangkat Lunak...',
  },
  {
    key: 'metodologi',
    title: 'Metodologi',
    icon: GitBranch,
    color: 'text-orange-500',
    description: 'Jelaskan metodologi pengembangan yang digunakan',
    placeholder: 'Contoh: Menggunakan Agile methodology dengan sprint 2 minggu...',
  },
  {
    key: 'sumber_daya',
    title: 'Sumber Daya dan Batasan',
    icon: FileCheck,
    color: 'text-pink-500',
    description: 'Uraikan sumber daya yang diperlukan dan batasan proyek',
    placeholder: 'Sumber Daya: ...\nBatasan: ...',
  },
  {
    key: 'timeline',
    title: 'Kerangka Waktu',
    icon: Calendar,
    color: 'text-teal-500',
    description: 'Buat timeline pelaksanaan proyek',
    placeholder: 'Minggu 1-4: ...\nMinggu 5-8: ...',
  },
  {
    key: 'analisis',
    title: 'Analisis dan Temuan',
    icon: Lightbulb,
    color: 'text-yellow-500',
    description: 'Jelaskan analisis masalah dan temuan awal',
    placeholder: 'Masalah yang diangkat: ...\nAnalisis: ...',
  },
  {
    key: 'laporan',
    title: 'Rencana Penulisan Laporan',
    icon: FileText,
    color: 'text-indigo-500',
    description: 'Outline struktur laporan yang akan dibuat',
    placeholder: 'BAB I: ...\nBAB II: ...',
  },
  {
    key: 'presentasi',
    title: 'Rencana Presentasi',
    icon: Award,
    color: 'text-red-500',
    description: 'Jelaskan rencana presentasi dan demo',
    placeholder: 'Poin-poin presentasi: ...\nDemo yang akan ditampilkan: ...',
  },
  {
    key: 'stakeholder',
    title: 'Keterlibatan Stakeholder',
    icon: Users,
    color: 'text-cyan-500',
    description: 'Sebutkan stakeholder yang terlibat (jika ada)',
    placeholder: 'Stakeholder: ...\nPeran: ...',
  },
  {
    key: 'etika',
    title: 'Aspek Etika',
    icon: Shield,
    color: 'text-emerald-500',
    description: 'Jelaskan bagaimana aspek etika ditangani',
    placeholder: 'Privasi data: ...\nKeamanan: ...',
  },
];

export function ProjectRequirementsForm({ project }: { project: Project }) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    project.requirements.forEach((req) => {
      initial[req.category] = req.content;
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const completedCount = Object.values(formData).filter((v) => v.trim()).length;
  const progress = (completedCount / requirementCategories.length) * 100;

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/projects/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          requirements: requirementCategories.map((cat) => ({
            category: cat.key,
            content: formData[cat.key] || '',
            isCompleted: !!formData[cat.key]?.trim(),
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success('Persyaratan berhasil disimpan!');
      router.refresh();
    } catch (error) {
      toast.error('Gagal menyimpan persyaratan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="light"
            startContent={<ArrowLeft size={18} />}
            onPress={() => router.back()}
            className="mb-4"
          >
            Kembali
          </Button>

          <Card className="border-none bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10">
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shrink-0">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">
                    Isi Persyaratan Proyek
                  </h1>
                  <p className="text-default-600 mb-4">
                    {project.title}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-default-600">
                        Progress: {completedCount} dari {requirementCategories.length} poin
                      </span>
                      <span className="font-semibold text-primary">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      color="primary"
                      className="max-w-full"
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Requirements Form */}
        <div className="space-y-4">
          {requirementCategories.map((category, index) => {
            const Icon = category.icon;
            const isFilled = !!formData[category.key]?.trim();

            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex gap-3 border-b border-divider">
                    <div className={`p-2 rounded-xl bg-default-100 ${category.color}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {category.title}
                        </h3>
                        {isFilled && (
                          <Chip size="sm" color="success" variant="flat">
                            Terisi
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-default-500">
                        {category.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Textarea
                      placeholder={category.placeholder}
                      value={formData[category.key] || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [category.key]: e.target.value,
                        }))
                      }
                      minRows={4}
                      maxRows={8}
                      variant="bordered"
                      classNames={{
                        input: 'text-sm',
                      }}
                    />
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sticky bottom-4 flex justify-end gap-3"
        >
          <Button
            color="primary"
            size="lg"
            startContent={<Save size={20} />}
            onPress={handleSave}
            isLoading={saving}
            className="shadow-lg font-semibold"
          >
            {saving ? 'Menyimpan...' : 'Simpan Persyaratan'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
