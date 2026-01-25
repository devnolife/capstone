'use client';

import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Rocket,
  Lightbulb,
  CheckCircle2,
  FileText,
  Layers,
  GitBranch,
  Box,
  FileCheck,
  ListChecks,
  Sparkles,
  Award,
  Users,
  Shield,
  ArrowRight,
  Info,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

interface RequirementItem {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  tips: string[];
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  bgColor: string;
  iconBg: string;
  requirements: RequirementItem[];
}

const PERSYARATAN_SECTIONS: Section[] = [
  {
    id: 'aspek-akademik',
    title: 'Aspek Akademik',
    subtitle: 'Integrasi pembelajaran dan metodologi pengembangan',
    icon: GraduationCap,
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    requirements: [
      {
        key: 'integrasiMatakuliah',
        label: 'Integrasi Mata Kuliah',
        icon: Layers,
        description: 'Konsep dari mata kuliah yang relevan dengan proyek',
        tips: [
          'Sebutkan minimal 3-4 mata kuliah yang relevan',
          'Jelaskan bagaimana konsep diterapkan',
          'Hubungkan teori dengan implementasi praktis',
        ],
      },
      {
        key: 'metodologi',
        label: 'Metodologi Pengembangan',
        icon: GitBranch,
        description: 'Metode pengembangan, pengumpulan data, dan pengujian',
        tips: [
          'Pilih metodologi yang sesuai (Agile/Scrum, Waterfall, RAD)',
          'Jelaskan teknik pengumpulan data',
          'Sertakan metode pengujian (UAT, Black Box)',
        ],
      },
    ],
  },
  {
    id: 'teknis-implementasi',
    title: 'Teknis & Implementasi',
    subtitle: 'Ruang lingkup, sumber daya, dan fitur sistem',
    icon: Rocket,
    gradient: 'from-orange-500 to-amber-500',
    bgColor: 'bg-gradient-to-br',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    requirements: [
      {
        key: 'ruangLingkup',
        label: 'Ruang Lingkup Proyek',
        icon: Box,
        description: 'Batasan dan cakupan proyek agar fokus dan terukur',
        tips: [
          'Jelaskan fitur yang AKAN dikembangkan',
          'Sebutkan batasan/limitasi sistem',
          'Tentukan platform yang didukung',
        ],
      },
      {
        key: 'sumberDayaBatasan',
        label: 'Sumber Daya dan Batasan',
        icon: FileCheck,
        description: 'Hardware, software, SDM, dan kendala pelaksanaan',
        tips: [
          'List kebutuhan hardware & software',
          'Identifikasi batasan waktu dan anggaran',
          'Jelaskan akses data yang diperlukan',
        ],
      },
      {
        key: 'fiturUtama',
        label: 'Fitur Utama Sistem',
        icon: ListChecks,
        description: 'Fitur-fitur utama beserta deskripsi singkat',
        tips: [
          'Buat daftar fitur dengan prioritas',
          'Jelaskan fungsi setiap fitur',
          'Kategorikan (Core, Nice-to-have)',
        ],
      },
    ],
  },
  {
    id: 'analisis-evaluasi',
    title: 'Analisis & Evaluasi',
    subtitle: 'Temuan, presentasi, stakeholder, dan aspek etika',
    icon: Lightbulb,
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    requirements: [
      {
        key: 'analisisTemuan',
        label: 'Rencana Analisis dan Temuan',
        icon: Sparkles,
        description: 'Analisis mendalam dan kontribusi untuk akademis/industri',
        tips: [
          'Jelaskan data yang akan dikumpulkan',
          'Sebutkan metode analisis',
          'Prediksi temuan yang diharapkan',
        ],
      },
      {
        key: 'presentasiUjian',
        label: 'Rencana Presentasi dan Ujian',
        icon: Award,
        description: 'Strategi presentasi dan persiapan menghadapi ujian',
        tips: [
          'Susun outline presentasi',
          'Siapkan demo sistem',
          'Antisipasi pertanyaan penguji',
        ],
      },
      {
        key: 'stakeholder',
        label: 'Keterlibatan Stakeholder',
        icon: Users,
        description: 'Pihak yang terlibat dalam perencanaan dan evaluasi',
        tips: [
          'Identifikasi stakeholder utama',
          'Rencanakan metode feedback',
          'Jelaskan cara menggunakan masukan',
        ],
      },
      {
        key: 'kepatuhanEtika',
        label: 'Kepatuhan Terhadap Etika',
        icon: Shield,
        description: 'Standar etika, privasi data, dan persetujuan pengguna',
        tips: [
          'Jelaskan standar etika yang dipatuhi',
          'Cara melindungi data sensitif',
          'Proses mendapatkan consent',
        ],
      },
    ],
  },
];

export default function PersyaratanPage() {
  const totalRequirements = PERSYARATAN_SECTIONS.reduce(
    (acc, section) => acc + section.requirements.length,
    0
  );

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Header Card - Soft Colored */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/40 border border-blue-200/50 dark:border-blue-800/30 p-6 sm:p-8">
        {/* Subtle Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-400/15 to-blue-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <ClipboardList size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100">Persyaratan Capstone</h1>
              <p className="text-blue-600/70 dark:text-blue-400/60 mt-1">
                Panduan lengkap persyaratan dokumen yang harus dipenuhi
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Chip className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" size="sm">
                  {PERSYARATAN_SECTIONS.length} Kategori
                </Chip>
                <Chip className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" size="sm">
                  {totalRequirements} Persyaratan
                </Chip>
              </div>
            </div>
          </div>
          <Button
            as={Link}
            href="/mahasiswa/projects"
            color="primary"
            endContent={<ArrowRight size={18} />}
          >
            Lihat Proyek Saya
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Info size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                Tentang Persyaratan Dokumen
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Setiap proyek capstone harus memenuhi <strong>{totalRequirements} persyaratan</strong> yang
                terbagi dalam {PERSYARATAN_SECTIONS.length} kategori. Semua persyaratan harus dilengkapi
                sebelum proyek dapat diajukan untuk review oleh dosen penguji.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PERSYARATAN_SECTIONS.map((section, index) => {
          const SectionIcon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm h-full">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${section.bgColor} ${section.gradient} text-white`}>
                      <SectionIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold">{section.title}</h3>
                      <p className="text-xs text-default-500">{section.requirements.length} persyaratan</p>
                    </div>
                  </div>
                  <p className="text-sm text-default-600">{section.subtitle}</p>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Sections */}
      <div className="space-y-6">
        {PERSYARATAN_SECTIONS.map((section, sectionIndex) => {
          const SectionIcon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + sectionIndex * 0.1 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className={`p-5 ${section.bgColor} ${section.gradient} text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                      <SectionIcon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{section.title}</h2>
                      <p className="text-white/80 text-sm">{section.subtitle}</p>
                    </div>
                    <Chip className="ml-auto bg-white/20 text-white" size="sm">
                      {section.requirements.length} Item
                    </Chip>
                  </div>
                </div>

                {/* Requirements List */}
                <CardBody className="p-0">
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {section.requirements.map((req, reqIndex) => {
                      const ReqIcon = req.icon;
                      return (
                        <div key={req.key} className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-xl ${section.iconBg} shrink-0`}>
                              <ReqIcon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{req.label}</h3>
                                <Chip size="sm" variant="flat" color="default">
                                  #{sectionIndex + 1}.{reqIndex + 1}
                                </Chip>
                              </div>
                              <p className="text-sm text-default-600 mb-3">{req.description}</p>

                              {/* Tips */}
                              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                                  <Lightbulb size={12} />
                                  Tips Pengisian:
                                </p>
                                <ul className="space-y-1">
                                  {req.tips.map((tip, tipIndex) => (
                                    <li
                                      key={tipIndex}
                                      className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2"
                                    >
                                      <CheckCircle2 size={12} className="shrink-0 mt-0.5 text-amber-600" />
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Card */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50">
              <FileText size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Siap Mengisi Persyaratan?</h3>
              <p className="text-sm text-default-600 mt-1">
                Pilih proyek Anda dan mulai lengkapi semua persyaratan dokumen capstone.
              </p>
            </div>
            <Button
              as={Link}
              href="/mahasiswa/projects"
              color="primary"
              size="lg"
              endContent={<ArrowRight size={18} />}
            >
              Pilih Proyek
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
