import { PrismaClient, Role } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ==================== CLEAR ALL DATA ====================
  console.log('🗑️  Clearing ALL existing data...');
  
  // Delete all data in correct order due to foreign key constraints
  await prisma.reviewComment.deleteMany();
  await prisma.reviewScore.deleteMany();
  await prisma.review.deleteMany();
  await prisma.document.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rubrikPenilaian.deleteMany();
  await prisma.semester.deleteMany();

  console.log('✅ All data cleared\n');

  // ==================== CREATE ADMIN USER ====================
  console.log('👤 Creating Admin user...');
  
  const adminPassword = await hashPassword('hanyaAdmin@25');
  
  const admin = await prisma.user.create({
    data: {
      username: 'devnolife',
      name: 'Administrator',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  
  console.log(`  ✅ Admin: ${admin.username} (password: hanyaAdmin@25)\n`);

  // ==================== CREATE DOSEN USER ====================
  console.log('👨‍🏫 Creating Dosen user...');
  
  const dosenPassword = await hashPassword('password123');
  
  const dosen = await prisma.user.create({
    data: {
      username: 'dosen',
      name: 'Dosen Penguji',
      password: dosenPassword,
      role: Role.DOSEN_PENGUJI,
      isActive: true,
    },
  });
  
  console.log(`  ✅ Dosen: ${dosen.username} (password: password123)\n`);

  // ==================== CREATE MAHASISWA USER (DEV) ====================
  console.log('🎓 Creating Mahasiswa user (dev mode)...');
  
  const mahasiswaPassword = await hashPassword('password123');
  
  const mahasiswa = await prisma.user.create({
    data: {
      username: 'mahasiswa',
      name: 'Mahasiswa Dev',
      password: mahasiswaPassword,
      role: Role.MAHASISWA,
      isActive: true,
    },
  });
  
  console.log(`  ✅ Mahasiswa: ${mahasiswa.username} (password: password123)\n`);

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

  // ==================== SUMMARY ====================
  console.log('═'.repeat(60));
  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • Users:            3 (admin, dosen, mahasiswa)`);
  console.log(`   • Semesters:        2`);
  console.log(`   • Rubrik Penilaian: ${rubrikList.length}`);
  console.log('═'.repeat(60));
  console.log('\n🔐 Login Credentials:\n');
  console.log('   ┌─────────────┬──────────────┬──────────────┬─────────────────┐');
  console.log('   │ Role        │ Username     │ Password     │ Login Method    │');
  console.log('   ├─────────────┼──────────────┼──────────────┼─────────────────┤');
   console.log('   │ Admin       │ devnolife    │ hanyaAdmin@25│ Form (NIM/User) │');
  console.log('   │ Dosen       │ dosen        │ password123  │ Form (NIM/User) │');
  console.log('   │ Mahasiswa   │ mahasiswa    │ password123  │ Form (NIM/User) │');
  console.log('   └─────────────┴──────────────┴──────────────┴─────────────────┘');
  console.log('\n   Note: Mahasiswa juga bisa login via GitHub OAuth (otomatis role MAHASISWA)');
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
