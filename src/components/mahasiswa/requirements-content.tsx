'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Accordion,
  AccordionItem,
} from '@heroui/react';
import {
  BookOpen,
  Target,
  FileText,
  Code,
  Calendar,
  Users,
  CheckCircle,
  Lightbulb,
  FileCheck,
  Presentation,
  Shield,
  Layers,
} from 'lucide-react';

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
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface Requirement {
  icon: React.ElementType;
  title: string;
  description: string[];
  color: string;
}

const requirements: Requirement[] = [
  {
    icon: BookOpen,
    title: 'Judul Proyek',
    description: [
      'Judul proyek harus mencerminkan topik utama yang relevan dengan bidang studi dan masalah yang akan diselesaikan atau dianalisis.',
      'Judul harus spesifik, jelas, dan mudah dipahami, serta menunjukkan tujuan dan ruang lingkup proyek.',
    ],
    color: 'text-blue-500',
  },
  {
    icon: Target,
    title: 'Tujuan dan Manfaat Proyek',
    description: [
      'Proyek harus memiliki tujuan yang jelas dan terukur.',
      'Harus ada penjelasan tentang manfaat atau kontribusi proyek terhadap ilmu pengetahuan, masyarakat, atau industri terkait.',
      'Manfaat proyek dapat mencakup pengembangan produk, solusi bisnis, atau temuan penelitian yang aplikatif.',
    ],
    color: 'text-green-500',
  },
  {
    icon: Layers,
    title: 'Integrasi Mata Kuliah',
    description: [
      'Proyek harus mengintegrasikan konsep, teori, dan keterampilan yang diperoleh dari beberapa mata kuliah yang telah diambil selama masa studi.',
      'Harus ada penjelasan tentang bagaimana mata kuliah tertentu diterapkan dalam pengembangan dan pelaksanaan proyek.',
    ],
    color: 'text-purple-500',
  },
  {
    icon: Code,
    title: 'Metodologi',
    description: [
      'Proyek harus menggunakan metodologi yang tepat dan sesuai dengan bidang studi.',
      'Jika proyek berbasis penelitian, harus mencantumkan jenis penelitian (kualitatif, kuantitatif, campuran) serta teknik pengumpulan dan analisis data.',
      'Jika proyek berbasis pengembangan produk atau aplikasi, harus mencakup metodologi pengembangan, pengujian, dan evaluasi.',
    ],
    color: 'text-orange-500',
  },
  {
    icon: FileCheck,
    title: 'Sumber Daya dan Batasan',
    description: [
      'Proyek harus mencakup penjelasan mengenai sumber daya yang diperlukan, seperti perangkat lunak, data, dana, atau sumber daya manusia.',
      'Harus ada pemahaman yang jelas tentang batasan atau kendala yang mungkin dihadapi selama pelaksanaan proyek, seperti keterbatasan waktu, anggaran, atau akses data.',
    ],
    color: 'text-pink-500',
  },
  {
    icon: Calendar,
    title: 'Kerangka Waktu',
    description: [
      'Proyek harus memiliki jadwal pelaksanaan yang terstruktur dengan baik, yang mencakup waktu untuk penelitian, pengembangan, analisis, dan penyusunan laporan akhir.',
      'Setiap tahapan dalam proyek harus dilengkapi dengan tenggat waktu yang realistis.',
    ],
    color: 'text-teal-500',
  },
  {
    icon: Lightbulb,
    title: 'Analisis dan Temuan',
    description: [
      'Proyek harus menghasilkan analisis mendalam tentang masalah yang diangkat, disertai dengan temuan yang didukung oleh data dan bukti yang relevan.',
      'Harus ada penjelasan tentang bagaimana temuan proyek dapat diaplikasikan dalam konteks nyata, baik dalam dunia akademis, industri, atau masyarakat.',
    ],
    color: 'text-yellow-500',
  },
  {
    icon: FileText,
    title: 'Penulisan Laporan',
    description: [
      'Laporan akhir proyek harus disusun dengan jelas, terstruktur, dan mengikuti format akademik yang telah ditentukan (misalnya, APA, MLA, atau format yang relevan dengan jurusan).',
      'Laporan harus mencakup pendahuluan, tinjauan pustaka, metodologi, analisis, hasil, kesimpulan, serta rekomendasi.',
      'Laporan harus mencantumkan referensi yang relevan dan mutakhir, termasuk artikel ilmiah, buku, dan sumber lainnya.',
    ],
    color: 'text-indigo-500',
  },
  {
    icon: Presentation,
    title: 'Presentasi dan Ujian',
    description: [
      'Mahasiswa harus mempersiapkan presentasi lisan yang mengkomunikasikan temuan dan solusi yang dihasilkan dari proyek.',
      'Presentasi harus mencakup tujuan, metodologi, temuan, kesimpulan, serta rekomendasi yang relevan.',
      'Proyek akan dievaluasi melalui presentasi di depan penguji atau panel, yang bisa terdiri dari dosen atau profesional di bidang terkait.',
    ],
    color: 'text-red-500',
  },
  {
    icon: Users,
    title: 'Keterlibatan Stakeholder (Jika Ada)',
    description: [
      'Jika proyek berhubungan dengan industri atau komunitas, mahasiswa diharapkan untuk melibatkan stakeholder terkait (misalnya, klien, pengguna, atau komunitas) dalam perencanaan, pelaksanaan, atau evaluasi proyek.',
      'Harus ada penjelasan mengenai bagaimana feedback atau kontribusi dari stakeholder digunakan dalam proyek.',
    ],
    color: 'text-cyan-500',
  },
  {
    icon: Shield,
    title: 'Kepatuhan Terhadap Etika',
    description: [
      'Semua proyek harus mematuhi standar etika yang berlaku, terutama jika melibatkan penelitian manusia, data sensitif, atau informasi pribadi.',
      'Mahasiswa harus menjelaskan bagaimana isu-isu etika, seperti privasi dan persetujuan, ditangani dalam proyek.',
    ],
    color: 'text-emerald-500',
  },
];

export function RequirementsContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="border-none bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm">
          <CardBody className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Persyaratan Umum Capstone Project
                </h1>
                <p className="text-default-600">
                  Panduan lengkap persyaratan yang harus dipenuhi dalam
                  pelaksanaan Capstone Project. Pastikan setiap poin dipahami
                  dan diterapkan dengan baik.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Desktop View - Cards Grid */}
      <motion.div
        variants={itemVariants}
        className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {requirements.map((req, index) => {
          const Icon = req.icon;
          return (
            <Card
              key={index}
              className="border-none bg-content1 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex gap-3 pb-3">
                <div className={`p-2 rounded-xl bg-default-100 ${req.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">{req.title}</h3>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="pt-4">
                <ul className="space-y-3">
                  {req.description.map((desc, descIndex) => (
                    <li key={descIndex} className="flex gap-2 text-sm">
                      <span className="text-success mt-0.5 shrink-0">
                        •
                      </span>
                      <span className="text-default-700">{desc}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          );
        })}
      </motion.div>

      {/* Mobile View - Accordion */}
      <motion.div variants={itemVariants} className="md:hidden">
        <Card className="border-none bg-content1 shadow-sm">
          <CardBody className="p-0">
            <Accordion
              variant="splitted"
              className="px-0"
              itemClasses={{
                base: 'border-b border-divider last:border-b-0',
                title: 'font-semibold text-base',
                trigger: 'py-4 px-4',
                content: 'px-4 pb-4',
              }}
            >
              {requirements.map((req, index) => {
                const Icon = req.icon;
                return (
                  <AccordionItem
                    key={index}
                    aria-label={req.title}
                    title={
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-lg bg-default-100 ${req.color}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span>{req.title}</span>
                      </div>
                    }
                  >
                    <ul className="space-y-3">
                      {req.description.map((desc, descIndex) => (
                        <li key={descIndex} className="flex gap-2 text-sm">
                          <span className="text-success mt-0.5 shrink-0">
                            •
                          </span>
                          <span className="text-default-700">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardBody>
        </Card>
      </motion.div>

      {/* Info Footer */}
      <motion.div variants={itemVariants}>
        <Card className="border-none bg-warning-50 dark:bg-warning-50/10">
          <CardBody className="p-4">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-warning-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-warning-800 dark:text-warning-600">
                  <span className="font-semibold">Catatan Penting:</span>{' '}
                  Persyaratan ini bersifat wajib dan akan menjadi acuan dalam
                  penilaian Capstone Project. Diskusikan dengan dosen pembimbing
                  jika ada hal yang belum jelas.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
