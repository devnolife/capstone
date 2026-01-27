'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Progress,
  Chip,
  Spinner,
  addToast,
  Avatar,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  FileText,
  Users,
  Target,
  Box,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  GitBranch,
  FileCheck,
  Sparkles,
  Award,
  Shield,
  ChevronDown,
  Layers,
  Rocket,
  GraduationCap,
  Lightbulb,
  TrendingUp,
  Eye,
  Globe,
  Link2,
  User,
  KeyRound,
  FileQuestion,
  Loader2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface ProjectRequirements {
  id: string;
  projectId: string;
  // Aspek Akademik
  integrasiMatakuliah: string | null;
  metodologi: string | null;
  // Teknis & Implementasi
  ruangLingkup: string | null;
  sumberDayaBatasan: string | null;
  fiturUtama: string | null;
  // Analisis & Evaluasi
  analisisTemuan: string | null;
  presentasiUjian: string | null;
  stakeholder: string | null;
  kepatuhanEtika: string | null;
  // Production & Demo
  productionUrl: string | null;
  productionUrlStatus: string | null;
  testingUsername: string | null;
  testingPassword: string | null;
  testingNotes: string | null;
  completionPercent: number;
  updatedAt: string;
}

interface Project {
  id: string;
  title: string;
  semester: string;
  status: string;
  description?: string;
  mahasiswaId: string;
  mahasiswa?: {
    name: string;
    image: string | null;
  };
}

interface FieldConfig {
  key: string;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  description: string;
  tips?: string[];
  minRows?: number;
  type?: 'textarea' | 'input' | 'url' | 'password';
  optional?: boolean;
}

interface SectionConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  bgColor: string;
  fields: FieldConfig[];
}

// Requirements fields grouped by section - UPDATED without removed sections
const REQUIREMENT_SECTIONS: SectionConfig[] = [
  {
    id: 'aspek-akademik',
    title: 'Aspek Akademik',
    subtitle: 'Integrasi pembelajaran dan metodologi',
    icon: GraduationCap,
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br',
    fields: [
      {
        key: 'integrasiMatakuliah',
        label: 'Integrasi Mata Kuliah',
        icon: Layers,
        placeholder: 'Jelaskan mata kuliah yang terintegrasi dan penerapannya...',
        description: 'Konsep dari mata kuliah yang relevan dengan proyek',
        tips: [
          'Sebutkan minimal 3-4 mata kuliah yang relevan',
          'Jelaskan bagaimana konsep diterapkan',
          'Hubungkan teori dengan implementasi praktis',
        ],
        minRows: 5,
      },
      {
        key: 'metodologi',
        label: 'Metodologi Pengembangan',
        icon: GitBranch,
        placeholder: 'Jelaskan metodologi yang digunakan (Agile, Waterfall, dll)...',
        description: 'Metode pengembangan, pengumpulan data, dan pengujian',
        tips: [
          'Pilih metodologi yang sesuai (Agile/Scrum, Waterfall, RAD)',
          'Jelaskan teknik pengumpulan data',
          'Sertakan metode pengujian (UAT, Black Box)',
        ],
        minRows: 5,
      },
    ],
  },
  {
    id: 'teknis-implementasi',
    title: 'Teknis & Implementasi',
    subtitle: 'Ruang lingkup dan fitur sistem',
    icon: Rocket,
    gradient: 'from-orange-500 to-amber-500',
    bgColor: 'bg-gradient-to-br',
    fields: [
      {
        key: 'ruangLingkup',
        label: 'Ruang Lingkup Proyek',
        icon: Box,
        placeholder: 'Definisikan apa yang termasuk dan tidak termasuk dalam proyek...',
        description: 'Batasan dan cakupan proyek agar fokus dan terukur',
        tips: [
          'Jelaskan fitur yang AKAN dikembangkan',
          'Sebutkan batasan/limitasi sistem',
          'Tentukan platform yang didukung',
        ],
        minRows: 5,
      },
      {
        key: 'sumberDayaBatasan',
        label: 'Sumber Daya dan Batasan',
        icon: FileCheck,
        placeholder: 'Identifikasi sumber daya yang diperlukan dan kendala yang dihadapi...',
        description: 'Hardware, software, SDM, dan kendala pelaksanaan',
        tips: [
          'List kebutuhan hardware & software',
          'Identifikasi batasan waktu dan anggaran',
          'Jelaskan akses data yang diperlukan',
        ],
        minRows: 5,
      },
      {
        key: 'fiturUtama',
        label: 'Fitur Utama Sistem',
        icon: ListChecks,
        placeholder: 'Daftar fitur utama yang akan dikembangkan...',
        description: 'Fitur-fitur utama beserta deskripsi singkat',
        tips: [
          'Buat daftar fitur dengan prioritas',
          'Jelaskan fungsi setiap fitur',
          'Kategorikan (Core, Nice-to-have)',
        ],
        minRows: 6,
      },
    ],
  },
  {
    id: 'analisis-evaluasi',
    title: 'Analisis & Evaluasi',
    subtitle: 'Temuan, presentasi, dan aspek etika',
    icon: Lightbulb,
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br',
    fields: [
      {
        key: 'analisisTemuan',
        label: 'Rencana Analisis dan Temuan',
        icon: Sparkles,
        placeholder: 'Jelaskan data yang akan dianalisis dan temuan yang diharapkan...',
        description: 'Analisis mendalam dan kontribusi untuk akademis/industri',
        tips: [
          'Jelaskan data yang akan dikumpulkan',
          'Sebutkan metode analisis',
          'Prediksi temuan yang diharapkan',
        ],
        minRows: 5,
      },
      {
        key: 'presentasiUjian',
        label: 'Rencana Presentasi dan Ujian',
        icon: Award,
        placeholder: 'Persiapan materi presentasi dan ujian...',
        description: 'Strategi presentasi dan persiapan menghadapi ujian',
        tips: [
          'Susun outline presentasi',
          'Siapkan demo sistem',
          'Antisipasi pertanyaan penguji',
        ],
        minRows: 4,
      },
      {
        key: 'stakeholder',
        label: 'Keterlibatan Stakeholder',
        icon: Users,
        placeholder: 'Identifikasi stakeholder dan rencana feedback...',
        description: 'Pihak yang terlibat dalam perencanaan dan evaluasi',
        tips: [
          'Identifikasi stakeholder utama',
          'Rencanakan metode feedback',
          'Jelaskan cara menggunakan masukan',
        ],
        minRows: 4,
      },
      {
        key: 'kepatuhanEtika',
        label: 'Kepatuhan Terhadap Etika',
        icon: Shield,
        placeholder: 'Aspek etika dan penanganan data sensitif...',
        description: 'Standar etika, privasi data, dan persetujuan pengguna',
        tips: [
          'Jelaskan standar etika yang dipatuhi',
          'Cara melindungi data sensitif',
          'Proses mendapatkan consent',
        ],
        minRows: 4,
      },
    ],
  },
  {
    id: 'production-demo',
    title: 'Production & Demo',
    subtitle: 'URL aplikasi dan akun testing',
    icon: Globe,
    gradient: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-gradient-to-br',
    fields: [
      {
        key: 'productionUrl',
        label: 'URL Production/Demo',
        icon: Link2,
        placeholder: 'https://your-app.vercel.app atau https://your-domain.com',
        description: 'URL aplikasi yang sudah di-deploy dan bisa diakses',
        tips: [
          'Pastikan URL bisa diakses publik',
          'Gunakan HTTPS untuk keamanan',
          'Pastikan server aktif saat review',
        ],
        type: 'url',
        optional: true,
      },
      {
        key: 'testingUsername',
        label: 'Username Testing',
        icon: User,
        placeholder: 'admin@example.com atau username',
        description: 'Username/email untuk akun testing (opsional)',
        type: 'input',
        optional: true,
      },
      {
        key: 'testingPassword',
        label: 'Password Testing',
        icon: KeyRound,
        placeholder: 'Password untuk akun testing',
        description: 'Password untuk login ke akun testing (opsional)',
        type: 'password',
        optional: true,
      },
      {
        key: 'testingNotes',
        label: 'Catatan Testing',
        icon: FileQuestion,
        placeholder: 'Contoh: Login sebagai admin untuk melihat semua fitur. Flow utama: Dashboard > Manage Users > Reports',
        description: 'Instruksi atau catatan tambahan untuk reviewer',
        tips: [
          'Jelaskan role/level akses akun testing',
          'Sebutkan flow utama yang perlu ditest',
          'Tambahkan catatan khusus jika ada',
        ],
        minRows: 3,
        optional: true,
      },
    ],
  },
];

// Get all field keys for completion calculation
const ALL_FIELD_KEYS = REQUIREMENT_SECTIONS.flatMap((section) =>
  section.fields.map((field) => field.key)
);

export default function ProjectRequirementsFormPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'aspek-akademik': true,
    'teknis-implementasi': false,
    'analisis-evaluasi': false,
    'production-demo': false,
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [urlValidation, setUrlValidation] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message?: string;
    title?: string;
  }>({ status: 'idle' });

  // Determine if current user is the project owner
  const isOwner = useMemo(() => {
    if (!project || !session?.user?.id) return false;
    return project.mahasiswaId === session.user.id;
  }, [project, session?.user?.id]);

  // Calculate completion
  const completion = useMemo(() => {
    const filledFields = ALL_FIELD_KEYS.filter((key) => {
      const value = formData[key];
      return value !== null && value !== undefined && value.trim() !== '';
    });
    const percent = Math.round((filledFields.length / ALL_FIELD_KEYS.length) * 100);
    return { percent, filled: filledFields.length, total: ALL_FIELD_KEYS.length };
  }, [formData]);

  // Calculate section completion
  const getSectionCompletion = (section: SectionConfig) => {
    const filledFields = section.fields.filter((field) => {
      const value = formData[field.key];
      return value !== null && value !== undefined && value.trim() !== '';
    });
    return {
      filled: filledFields.length,
      total: section.fields.length,
      percent: Math.round((filledFields.length / section.fields.length) * 100),
    };
  };

  // Toggle section
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Fetch project and requirements (single API call for efficiency)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Single API call - project-requirements now includes project info
        const reqRes = await fetch(`/api/project-requirements?projectId=${projectId}`);

        if (!reqRes.ok) throw new Error('Data not found');

        const reqData = await reqRes.json();

        // Extract project from response
        if (reqData.project) {
          setProject(reqData.project);
        }

        // Set form data from requirements
        const initialData: Record<string, string> = {};
        ALL_FIELD_KEYS.forEach((key) => {
          initialData[key] = (reqData[key as keyof ProjectRequirements] as string) || '';
        });
        setFormData(initialData);

        if (reqData.updatedAt) {
          setLastSaved(new Date(reqData.updatedAt));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        addToast({
          title: 'Error',
          description: 'Gagal memuat data persyaratan proyek',
          color: 'danger',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  // Save function
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/project-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setLastSaved(new Date());
      addToast({
        title: 'Tersimpan!',
        description: 'Persyaratan proyek berhasil disimpan',
        color: 'success',
      });
    } catch (error) {
      console.error('Error saving:', error);
      addToast({
        title: 'Error',
        description: 'Gagal menyimpan persyaratan proyek',
        color: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    
    // Reset URL validation when URL changes
    if (key === 'productionUrl') {
      setUrlValidation({ status: 'idle' });
    }
  };

  // Validate production URL
  const validateProductionUrl = async () => {
    const url = formData.productionUrl;
    if (!url || url.trim() === '') {
      setUrlValidation({ status: 'idle' });
      return;
    }

    setUrlValidation({ status: 'checking' });

    try {
      const response = await fetch('/api/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.valid) {
        setUrlValidation({
          status: 'valid',
          message: `URL aktif (${result.responseTime}ms)`,
          title: result.title,
        });
      } else {
        setUrlValidation({
          status: 'invalid',
          message: result.error || 'URL tidak dapat diakses',
        });
      }
    } catch {
      setUrlValidation({
        status: 'invalid',
        message: 'Gagal memvalidasi URL',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500">Memuat persyaratan...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-danger-100">
          <AlertCircle size={48} className="text-danger" />
        </div>
        <p className="text-lg font-medium">Project tidak ditemukan</p>
        <Button as={Link} href="/mahasiswa/documents" color="primary" variant="flat">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full pb-24 sm:pb-8">
      {/* Header Card */}
      <Card className="mb-6 border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")" }} />
        <CardBody className="p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button
                as={Link}
                href={`/mahasiswa/projects/${projectId}`}
                variant="flat"
                isIconOnly
                radius="full"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <ArrowLeft size={18} />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={20} />
                  <span className="text-sm font-medium text-white/80">Dokumen Persyaratan</span>
                </div>
                <h1 className="text-xl font-bold mb-2">{project.title}</h1>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span>{project.semester}</span>
                  <span>•</span>
                  <Chip size="sm" variant="flat" className="bg-white/20 text-white">
                    {project.status}
                  </Chip>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Read-only Banner for non-owners */}
      {!isOwner && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Eye size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">Mode Lihat Saja</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">Anda adalah anggota tim. Hanya ketua tim yang dapat mengedit persyaratan ini.</p>
          </div>
        </div>
      )}

      {/* Progress Card */}
      <Card className="mb-6 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <CardBody className="p-0">
          <div className="p-4 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${completion.percent === 100 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  {completion.percent === 100 ? (
                    <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Progress Kelengkapan</h3>
                  <p className="text-xs text-default-500">{completion.filled} dari {completion.total} field terisi</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-bold ${completion.percent === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {completion.percent}%
                </span>
              </div>
            </div>
            <Progress
              value={completion.percent}
              size="md"
              classNames={{
                track: 'h-3 bg-zinc-200 dark:bg-zinc-700',
                indicator: completion.percent === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400',
              }}
            />
            {completion.percent === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
              >
                <CheckCircle2 size={16} />
                <span>Semua persyaratan telah dilengkapi!</span>
              </motion.div>
            )}
          </div>

          {/* Section Quick Status */}
          <div className="grid grid-cols-4 divide-x divide-zinc-200 dark:divide-zinc-700 border-t border-zinc-200 dark:border-zinc-700">
            {REQUIREMENT_SECTIONS.map((section) => {
              const sectionCompletion = getSectionCompletion(section);
              const SectionIcon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setExpandedSections((prev) => ({
                      'aspek-akademik': section.id === 'aspek-akademik',
                      'teknis-implementasi': section.id === 'teknis-implementasi',
                      'analisis-evaluasi': section.id === 'analisis-evaluasi',
                      'production-demo': section.id === 'production-demo',
                    }));
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-center"
                >
                  <div className={`inline-flex p-1.5 rounded-lg bg-gradient-to-br ${section.gradient} text-white mb-2`}>
                    <SectionIcon size={14} />
                  </div>
                  <p className="text-xs font-medium truncate">{section.title.split(' ')[0]}</p>
                  <p className={`text-xs ${sectionCompletion.percent === 100 ? 'text-emerald-600' : 'text-default-400'}`}>
                    {sectionCompletion.filled}/{sectionCompletion.total}
                  </p>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Requirement Sections */}
      <div className="space-y-4">
        {REQUIREMENT_SECTIONS.map((section) => {
          const sectionCompletion = getSectionCompletion(section);
          const isExpanded = expandedSections[section.id];
          const SectionIcon = section.icon;

          return (
            <Card
              key={section.id}
              id={section.id}
              className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden scroll-mt-4"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${section.bgColor} ${section.gradient} text-white shadow-lg`}>
                    <SectionIcon size={22} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold text-lg">{section.title}</h2>
                    <p className="text-sm text-default-500">{section.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress Ring */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-zinc-200 dark:text-zinc-700"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={138}
                          strokeDashoffset={138 - (138 * sectionCompletion.percent) / 100}
                          className={`transition-all duration-500 ${sectionCompletion.percent === 100 ? 'text-emerald-500' : 'text-blue-500'
                            }`}
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center font-bold ${sectionCompletion.percent === 100 ? 'text-[11px]' : 'text-xs'
                        }`}>
                        {sectionCompletion.percent}%
                      </span>
                    </div>
                  </div>

                  {sectionCompletion.percent === 100 && (
                    <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle2 size={12} />}>
                      Lengkap
                    </Chip>
                  )}

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800"
                  >
                    <ChevronDown size={18} className="text-default-500" />
                  </motion.div>
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-6 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="grid gap-6">
                        {section.fields.map((field, fieldIndex) => {
                          const FieldIcon = field.icon;
                          const isFilled = formData[field.key]?.trim().length > 0;
                          const isActive = activeField === field.key;

                          return (
                            <motion.div
                              key={field.key}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: fieldIndex * 0.08 }}
                              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${isActive
                                ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                : isFilled
                                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10'
                                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                }`}
                            >
                              {/* Field Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-xl ${isFilled
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                    }`}>
                                    <FieldIcon size={18} />
                                  </div>
                                  <div>
                                    <label className="font-semibold text-base">{field.label}</label>
                                    <p className="text-xs text-default-500 mt-0.5">{field.description}</p>
                                  </div>
                                </div>
                                {isFilled && (
                                  <Chip
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    startContent={<CheckCircle2 size={12} />}
                                  >
                                    Terisi
                                  </Chip>
                                )}
                              </div>

                              {/* Tips */}
                              {field.tips && !isFilled && (
                                <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                                    <Lightbulb size={12} />
                                    Tips pengisian:
                                  </p>
                                  <ul className="text-xs text-amber-600 dark:text-amber-500 space-y-1">
                                    {field.tips.map((tip, i) => (
                                      <li key={i} className="flex items-start gap-1.5">
                                        <span className="text-amber-400 mt-0.5">•</span>
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Field Input - Different types */}
                              {field.type === 'url' ? (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      type="url"
                                      placeholder={field.placeholder}
                                      value={formData[field.key] || ''}
                                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                      onFocus={() => setActiveField(field.key)}
                                      onBlur={() => setActiveField(null)}
                                      variant="bordered"
                                      isReadOnly={!isOwner}
                                      startContent={<Globe size={16} className="text-default-400" />}
                                      classNames={{
                                        inputWrapper: `border-zinc-300 dark:border-zinc-600 hover:border-blue-400 
                                          focus-within:!border-blue-500 bg-white dark:bg-zinc-800/50 shadow-sm ${!isOwner ? 'opacity-80' : ''}`,
                                        input: 'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                                      }}
                                    />
                                    {isOwner && (
                                      <Button
                                        color={urlValidation.status === 'valid' ? 'success' : urlValidation.status === 'invalid' ? 'danger' : 'primary'}
                                        variant="flat"
                                        isLoading={urlValidation.status === 'checking'}
                                        onPress={validateProductionUrl}
                                        isDisabled={!formData.productionUrl?.trim()}
                                        className="min-w-[100px]"
                                      >
                                        {urlValidation.status === 'checking' ? (
                                          'Mengecek...'
                                        ) : urlValidation.status === 'valid' ? (
                                          <>
                                            <CheckCircle2 size={16} />
                                            Valid
                                          </>
                                        ) : urlValidation.status === 'invalid' ? (
                                          <>
                                            <XCircle size={16} />
                                            Invalid
                                          </>
                                        ) : (
                                          'Cek URL'
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                  {/* URL Validation Result */}
                                  {urlValidation.status !== 'idle' && urlValidation.status !== 'checking' && (
                                    <div className={`p-3 rounded-xl text-sm ${
                                      urlValidation.status === 'valid' 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                    }`}>
                                      <div className="flex items-center gap-2">
                                        {urlValidation.status === 'valid' ? (
                                          <CheckCircle2 size={16} className="text-emerald-600" />
                                        ) : (
                                          <XCircle size={16} className="text-red-600" />
                                        )}
                                        <span className={urlValidation.status === 'valid' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>
                                          {urlValidation.message}
                                        </span>
                                      </div>
                                      {urlValidation.title && (
                                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
                                          Judul halaman: {urlValidation.title}
                                        </p>
                                      )}
                                      {urlValidation.status === 'valid' && formData.productionUrl && (
                                        <Button
                                          as="a"
                                          href={formData.productionUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          size="sm"
                                          variant="flat"
                                          color="success"
                                          className="mt-2"
                                          startContent={<ExternalLink size={14} />}
                                        >
                                          Buka URL
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : field.type === 'input' ? (
                                <Input
                                  placeholder={field.placeholder}
                                  value={formData[field.key] || ''}
                                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  onFocus={() => setActiveField(field.key)}
                                  onBlur={() => setActiveField(null)}
                                  variant="bordered"
                                  isReadOnly={!isOwner}
                                  classNames={{
                                    inputWrapper: `border-zinc-300 dark:border-zinc-600 hover:border-blue-400 
                                      focus-within:!border-blue-500 bg-white dark:bg-zinc-800/50 shadow-sm ${!isOwner ? 'opacity-80' : ''}`,
                                    input: 'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                                  }}
                                />
                              ) : field.type === 'password' ? (
                                <Input
                                  type="password"
                                  placeholder={field.placeholder}
                                  value={formData[field.key] || ''}
                                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  onFocus={() => setActiveField(field.key)}
                                  onBlur={() => setActiveField(null)}
                                  variant="bordered"
                                  isReadOnly={!isOwner}
                                  classNames={{
                                    inputWrapper: `border-zinc-300 dark:border-zinc-600 hover:border-blue-400 
                                      focus-within:!border-blue-500 bg-white dark:bg-zinc-800/50 shadow-sm ${!isOwner ? 'opacity-80' : ''}`,
                                    input: 'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                                  }}
                                />
                              ) : (
                                <Textarea
                                  placeholder={field.placeholder}
                                  value={formData[field.key] || ''}
                                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  onFocus={() => setActiveField(field.key)}
                                  onBlur={() => setActiveField(null)}
                                  minRows={field.minRows || 4}
                                  maxRows={12}
                                  variant="bordered"
                                  isReadOnly={!isOwner}
                                  classNames={{
                                    inputWrapper: `border-zinc-300 dark:border-zinc-600 hover:border-blue-400 
                                      focus-within:!border-blue-500 bg-white dark:bg-zinc-800/50 shadow-sm ${!isOwner ? 'opacity-80' : ''}`,
                                    input: 'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                                  }}
                                />
                              )}

                              {/* Character count - only for textarea */}
                              {(!field.type || field.type === 'textarea') && (
                                <div className="flex justify-end mt-2">
                                  <span className="text-xs text-default-400">
                                    {(formData[field.key] || '').length} karakter
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Floating Save Button (Desktop) - Only for owners */}
      {isOwner && (
        <div className="hidden sm:block fixed bottom-6 right-6 z-50">
          <Button
            color="primary"
            size="lg"
            startContent={!isSaving && <Save size={18} />}
            isLoading={isSaving}
            onPress={handleSave}
            className="font-semibold px-6 rounded-full shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
          >
            Simpan Perubahan
          </Button>
        </div>
      )}

      {/* Bottom Save Bar (Mobile) - Only for owners */}
      {isOwner ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 sm:hidden z-50">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-default-500">Progress</span>
                <span className={`font-bold ${completion.percent === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {completion.percent}%
                </span>
              </div>
              <Progress
                value={completion.percent}
                size="sm"
                classNames={{
                  indicator: completion.percent === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400',
                }}
              />
            </div>
            <Button
              color="primary"
              startContent={!isSaving && <Save size={16} />}
              isLoading={isSaving}
              onPress={handleSave}
              className="font-semibold rounded-full px-6"
            >
              Simpan
            </Button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-amber-50/95 dark:bg-amber-900/30 backdrop-blur-xl border-t border-amber-200 dark:border-amber-800 sm:hidden z-50">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <Eye size={16} />
            <span>Mode Lihat Saja - Hanya ketua tim yang dapat mengedit</span>
          </div>
        </div>
      )}
    </div>
  );
}
