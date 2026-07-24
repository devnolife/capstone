'use client';

import {
  Card,
  CardBody,
  Button,
  Chip,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
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
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/caret/PageHeader';

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
  requirements: RequirementItem[];
}

const PERSYARATAN_SECTIONS: Section[] = [
  {
    id: 'aspek-akademik',
    title: 'Aspek Akademik',
    subtitle: 'Integrasi pembelajaran dan metodologi pengembangan',
    icon: GraduationCap,
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
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-8">
      <PageHeader
        label="[02] PERSYARATAN"
        labelRight="/ PANDUAN"
        title="Persyaratan capstone"
        description={`${totalRequirements} persyaratan dalam ${PERSYARATAN_SECTIONS.length} kategori yang harus dipenuhi sebelum review.`}
        actions={
          <Link
            href="/mahasiswa/projects"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-xs transition-all active:scale-[0.98]"
          >
            Lihat Project Saya <ArrowRight size={15} />
          </Link>
        }
      />

      {/* Info */}
      <div className="flex items-start gap-3 border border-border bg-card p-4">
        <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Info size={16} />
        </span>
        <div>
          <h4 className="text-sm font-semibold">Tentang persyaratan dokumen</h4>
          <p className="text-app-secondary-invert mt-1 text-xs leading-relaxed">
            Setiap project capstone harus memenuhi{' '}
            <strong className="text-foreground">{totalRequirements} persyaratan</strong> yang
            terbagi dalam {PERSYARATAN_SECTIONS.length} kategori. Semua persyaratan harus
            dilengkapi sebelum project dapat diajukan untuk review oleh dosen penguji.
          </p>
        </div>
      </div>

      {/* Summary bento */}
      <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
        {PERSYARATAN_SECTIONS.map((section, index) => {
          const SectionIcon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background p-4 transition-colors hover:bg-app-quinary"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="bg-app-primary text-foreground flex size-9 items-center justify-center rounded-lg">
                  <SectionIcon size={18} />
                </span>
                <div>
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">
                    {section.requirements.length} persyaratan
                  </p>
                </div>
              </div>
              <p className="text-app-secondary-invert text-sm">{section.subtitle}</p>
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
              <Card className="overflow-hidden border border-border bg-card shadow-none">
                {/* Section Header */}
                <div className="border-b border-border bg-app-quinary p-5">
                  <div className="flex items-center gap-4">
                    <span className="bg-app-primary text-foreground flex size-11 items-center justify-center rounded-xl">
                      <SectionIcon size={20} />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-[450] tracking-tight">
                        {section.title}
                      </h2>
                      <p className="text-app-secondary-invert text-sm">{section.subtitle}</p>
                    </div>
                    <span className="text-app-teritary-invert ml-auto rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider">
                      {section.requirements.length} item
                    </span>
                  </div>
                </div>

                {/* Requirements List */}
                <CardBody className="p-0">
                  <div className="divide-y divide-border">
                    {section.requirements.map((req, reqIndex) => {
                      const ReqIcon = req.icon;
                      return (
                        <div
                          key={req.key}
                          className="p-5 transition-colors hover:bg-app-quinary"
                        >
                          <div className="flex items-start gap-4">
                            <span className="bg-app-primary text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                              <ReqIcon size={18} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <h3 className="font-semibold">{req.label}</h3>
                                <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider tabular-nums">
                                  #{sectionIndex + 1}.{reqIndex + 1}
                                </span>
                              </div>
                              <p className="text-app-secondary-invert mb-3 text-sm">
                                {req.description}
                              </p>

                              {/* Tips */}
                              <div className="rounded-xl border border-border bg-app-quinary p-3">
                                <p className="text-app-teritary-invert mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                                  <Lightbulb size={12} />
                                  Tips pengisian
                                </p>
                                <ul className="space-y-1">
                                  {req.tips.map((tip, tipIndex) => (
                                    <li
                                      key={tipIndex}
                                      className="text-app-secondary-invert flex items-start gap-2 text-xs"
                                    >
                                      <CheckCircle2
                                        size={12}
                                        className="text-success mt-0.5 shrink-0"
                                      />
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

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 border border-border bg-app-primary p-6 text-center sm:flex-row sm:text-left">
        <span className="bg-background text-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
          <FileText size={22} />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-[450] tracking-tight">
            Siap mengisi persyaratan?
          </h3>
          <p className="text-app-secondary-invert mt-1 text-sm">
            Pilih projectmu dan mulai lengkapi semua persyaratan dokumen capstone.
          </p>
        </div>
        <Button
          as={Link}
          href="/mahasiswa/projects"
          color="primary"
          radius="full"
          endContent={<ArrowRight size={16} />}
        >
          Pilih Project
        </Button>
      </div>
    </div>
  );
}
