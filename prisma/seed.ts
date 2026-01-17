import { PrismaClient, Role } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ==================== CLEAR EXISTING DATA (optional) ====================
  console.log('🗑️  Clearing existing data...');
  
  // Delete in correct order due to foreign key constraints
  await prisma.reviewComment.deleteMany();
  await prisma.reviewScore.deleteMany();
  await prisma.review.deleteMany();
  await prisma.document.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rubrikPenilaian.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Existing data cleared\n');

  // ==================== CREATE ADMIN USERS ====================
  console.log('👤 Creating Admin users...');
  
  const adminPassword = await hashPassword('admin123');
  
  const admin = await prisma.user.create({
    data: {
      username: 'admin001',
      name: 'Administrator Sistem',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      username: 'admin002',
      name: 'Koordinator Capstone',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`  ✅ Admin: ${admin.username} (password: admin123)`);
  console.log(`  ✅ Admin: ${admin2.username} (password: admin123)\n`);

  // ==================== CREATE DOSEN USERS ====================
  console.log('👨‍🏫 Creating Dosen users...');
  
  const dosenPassword = await hashPassword('dosen123');
  
  // Username untuk dosen adalah NIP
  const dosenList = [
    {
      username: '197801011999031001',
      name: 'Dr. Ahmad Susanto, M.Kom',
    },
    {
      username: '196905152000122001',
      name: 'Prof. Dr. Siti Rahayu, M.T.',
    },
    {
      username: '198203032006041001',
      name: 'Budi Santoso, S.Kom., M.Cs.',
    },
    {
      username: '198507072012122001',
      name: 'Dr. Rina Wulandari, M.Kom',
    },
    {
      username: '198909092015041001',
      name: 'Eko Prasetyo, S.T., M.Eng.',
    },
  ];

  const dosens = [];
  for (const dosenData of dosenList) {
    const dosen = await prisma.user.create({
      data: {
        ...dosenData,
        password: dosenPassword,
        role: Role.DOSEN_PENGUJI,
        isActive: true,
      },
    });
    dosens.push(dosen);
    console.log(`  ✅ Dosen: ${dosen.username} - ${dosen.name} (password: dosen123)`);
  }
  console.log();

  // ==================== CREATE MAHASISWA USERS ====================
  console.log('👨‍🎓 Creating Mahasiswa users...');
  
  const mahasiswaPassword = await hashPassword('mahasiswa123');
  
  // Username untuk mahasiswa adalah NIM
  const mahasiswaList = [
    {
      username: '4523210001',
      name: 'Andi Pratama',
    },
    {
      username: '4523210002',
      name: 'Dewi Lestari',
    },
    {
      username: '4523210003',
      name: 'Farhan Ramadhan',
    },
    {
      username: '4523210004',
      name: 'Gita Permata Sari',
    },
    {
      username: '4523210005',
      name: 'Hendra Wijaya',
    },
    {
      username: '4523210006',
      name: 'Indah Cahyani',
    },
    {
      username: '4523210007',
      name: 'Joko Susilo',
    },
    {
      username: '4523210008',
      name: 'Kartika Dewi',
    },
    {
      username: '4523210009',
      name: 'Lutfi Hakim',
    },
    {
      username: '4523210010',
      name: 'Maya Sari',
    },
  ];

  const mahasiswas = [];
  for (const mhsData of mahasiswaList) {
    const mahasiswa = await prisma.user.create({
      data: {
        ...mhsData,
        password: mahasiswaPassword,
        role: Role.MAHASISWA,
        isActive: true,
      },
    });
    mahasiswas.push(mahasiswa);
    console.log(`  ✅ Mahasiswa: ${mahasiswa.username} - ${mahasiswa.name} (password: mahasiswa123)`);
  }
  console.log();

  // ==================== CREATE SEMESTERS ====================
  console.log('📅 Creating Semesters...');
  
  const activeSemester = await prisma.semester.create({
    data: {
      name: 'Ganjil 2025/2026',
      tahunAkademik: '2025/2026',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-01-31'),
      isActive: true,
    },
  });

  await prisma.semester.create({
    data: {
      name: 'Genap 2024/2025',
      tahunAkademik: '2024/2025',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-07-31'),
      isActive: false,
    },
  });

  console.log(`  ✅ Active Semester: ${activeSemester.name}\n`);

  // ==================== CREATE RUBRIK PENILAIAN ====================
  console.log('📋 Creating Rubrik Penilaian...');
  
  const rubrikList = [
    {
      name: 'Kualitas Kode',
      description: 'Penilaian terhadap kualitas kode program, meliputi struktur, keterbacaan, dan best practices.',
      kategori: 'Teknis',
      bobotMax: 20,
      urutan: 1,
    },
    {
      name: 'Fungsionalitas',
      description: 'Penilaian terhadap kelengkapan dan kebenaran fitur yang diimplementasikan.',
      kategori: 'Teknis',
      bobotMax: 25,
      urutan: 2,
    },
    {
      name: 'Dokumentasi',
      description: 'Penilaian terhadap kelengkapan dan kualitas dokumentasi proyek.',
      kategori: 'Dokumentasi',
      bobotMax: 20,
      urutan: 3,
    },
    {
      name: 'Inovasi & Kreativitas',
      description: 'Penilaian terhadap keunikan solusi dan kreativitas dalam menyelesaikan masalah.',
      kategori: 'Umum',
      bobotMax: 15,
      urutan: 4,
    },
    {
      name: 'Presentasi',
      description: 'Penilaian terhadap kemampuan mempresentasikan dan menjelaskan proyek.',
      kategori: 'Presentasi',
      bobotMax: 20,
      urutan: 5,
    },
  ];

  for (const rubrik of rubrikList) {
    await prisma.rubrikPenilaian.create({ data: rubrik });
    console.log(`  ✅ Rubrik: ${rubrik.name} (max: ${rubrik.bobotMax})`);
  }
  console.log();

  // ==================== CREATE SAMPLE PROJECTS ====================
  console.log('📁 Creating Sample Projects...');
  
  const projectsData = [
    {
      title: 'Sistem Informasi Perpustakaan Digital',
      description: 'Aplikasi web untuk manajemen perpustakaan digital dengan fitur peminjaman buku online, katalog digital, dan notifikasi otomatis.',
      githubRepoUrl: 'https://github.com/andi-pratama/perpustakaan-digital',
      githubRepoName: 'perpustakaan-digital',
      status: 'SUBMITTED' as const,
      mahasiswaIndex: 0,
    },
    {
      title: 'Platform E-Learning Interaktif',
      description: 'Platform pembelajaran online dengan fitur video conference, quiz interaktif, dan tracking progress belajar.',
      githubRepoUrl: 'https://github.com/dewi-lestari/e-learning-platform',
      githubRepoName: 'e-learning-platform',
      status: 'IN_REVIEW' as const,
      mahasiswaIndex: 1,
    },
    {
      title: 'Aplikasi Monitoring Kesehatan IoT',
      description: 'Sistem monitoring kesehatan berbasis IoT yang terintegrasi dengan wearable device untuk memantau detak jantung dan aktivitas fisik.',
      githubRepoUrl: 'https://github.com/farhan-r/health-monitoring',
      githubRepoName: 'health-monitoring',
      status: 'DRAFT' as const,
      mahasiswaIndex: 2,
    },
    {
      title: 'Chatbot Customer Service AI',
      description: 'Chatbot berbasis AI untuk layanan pelanggan dengan natural language processing dan integrasi multi-platform.',
      githubRepoUrl: 'https://github.com/gita-permata/ai-chatbot',
      githubRepoName: 'ai-chatbot',
      status: 'APPROVED' as const,
      mahasiswaIndex: 3,
    },
    {
      title: 'Sistem Manajemen Inventaris',
      description: 'Aplikasi manajemen inventaris dengan fitur barcode scanning, laporan otomatis, dan prediksi stok.',
      status: 'DRAFT' as const,
      mahasiswaIndex: 4,
    },
  ];

  const projects = [];
  for (const projectData of projectsData) {
    const { mahasiswaIndex, ...data } = projectData;
    const project = await prisma.project.create({
      data: {
        ...data,
        semester: activeSemester.name,
        tahunAkademik: activeSemester.tahunAkademik,
        mahasiswaId: mahasiswas[mahasiswaIndex].id,
        submittedAt: data.status !== 'DRAFT' ? new Date() : null,
      },
    });
    projects.push(project);
    console.log(`  ✅ Project: ${project.title} (${project.status})`);
  }
  console.log();

  // ==================== CREATE PROJECT ASSIGNMENTS ====================
  console.log('🔗 Creating Project Assignments...');
  
  // Assign dosen to submitted/in_review projects
  const projectsToAssign = projects.filter(p => 
    ['SUBMITTED', 'IN_REVIEW', 'APPROVED'].includes(p.status)
  );

  for (let i = 0; i < projectsToAssign.length; i++) {
    const project = projectsToAssign[i];
    // Assign 2 dosen per project
    const dosen1 = dosens[i % dosens.length];
    const dosen2 = dosens[(i + 1) % dosens.length];

    await prisma.projectAssignment.create({
      data: {
        projectId: project.id,
        dosenId: dosen1.id,
      },
    });

    await prisma.projectAssignment.create({
      data: {
        projectId: project.id,
        dosenId: dosen2.id,
      },
    });

    console.log(`  ✅ Project "${project.title}" assigned to ${dosen1.name} & ${dosen2.name}`);
  }
  console.log();

  // ==================== CREATE SAMPLE REVIEWS ====================
  console.log('📝 Creating Sample Reviews...');
  
  // Create review for approved project
  const approvedProject = projects.find(p => p.status === 'APPROVED');
  if (approvedProject) {
    const review = await prisma.review.create({
      data: {
        projectId: approvedProject.id,
        reviewerId: dosens[0].id,
        status: 'COMPLETED',
        overallScore: 85,
        overallComment: 'Proyek sangat baik dengan implementasi yang solid. Dokumentasi lengkap dan presentasi sangat jelas. Rekomendasi: tingkatkan unit testing.',
        completedAt: new Date(),
      },
    });

    // Add rubrik scores
    const rubriks = await prisma.rubrikPenilaian.findMany();
    const scores = [18, 22, 17, 13, 15]; // Total: 85
    
    for (let i = 0; i < rubriks.length; i++) {
      await prisma.reviewScore.create({
        data: {
          reviewId: review.id,
          rubrikId: rubriks[i].id,
          score: scores[i],
          feedback: `Penilaian untuk ${rubriks[i].name}`,
        },
      });
    }

    console.log(`  ✅ Review created for "${approvedProject.title}" with score ${review.overallScore}`);
  }
  console.log();

  // ==================== CREATE NOTIFICATIONS ====================
  console.log('🔔 Creating Sample Notifications...');
  
  await prisma.notification.create({
    data: {
      userId: mahasiswas[0].id,
      title: 'Selamat Datang!',
      message: 'Selamat datang di platform Capstone Project. Mulai dengan membuat project baru.',
      type: 'system',
      link: '/mahasiswa/projects/new',
    },
  });

  await prisma.notification.create({
    data: {
      userId: mahasiswas[1].id,
      title: 'Project Sedang Di-review',
      message: 'Project Anda sedang dalam proses review oleh dosen penguji.',
      type: 'review',
      link: '/mahasiswa/projects',
    },
  });

  await prisma.notification.create({
    data: {
      userId: dosens[0].id,
      title: 'Assignment Baru',
      message: 'Anda ditugaskan untuk me-review project baru.',
      type: 'assignment',
      link: '/dosen/projects',
    },
  });

  console.log('  ✅ Sample notifications created\n');

  // ==================== SUMMARY ====================
  console.log('═'.repeat(60));
  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • Admin users:      2`);
  console.log(`   • Dosen users:      ${dosens.length}`);
  console.log(`   • Mahasiswa users:  ${mahasiswas.length}`);
  console.log(`   • Semesters:        2`);
  console.log(`   • Rubrik Penilaian: ${rubrikList.length}`);
  console.log(`   • Projects:         ${projects.length}`);
  console.log('═'.repeat(60));
  console.log('\n🔐 Login Credentials:\n');
  console.log('   ┌─────────────┬──────────────────────┬──────────────┐');
  console.log('   │ Role        │ Username             │ Password     │');
  console.log('   ├─────────────┼──────────────────────┼──────────────┤');
  console.log('   │ Admin       │ admin001             │ admin123     │');
  console.log('   │ Dosen       │ 197801011999031001   │ dosen123     │');
  console.log('   │ Mahasiswa   │ 4523210001           │ mahasiswa123 │');
  console.log('   └─────────────┴──────────────────────┴──────────────┘');
  console.log('\n   Note: Username untuk Dosen adalah NIP, untuk Mahasiswa adalah NIM');
  console.log('═'.repeat(60));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
