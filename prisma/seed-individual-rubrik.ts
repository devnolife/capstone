import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Rubrik Penilaian Individu...\n');

  // ==================== RUBRIK PENILAIAN INDIVIDU ====================
  // Rubrik untuk menilai setiap anggota kelompok secara individual
  
  const rubrikIndividuList = [
    // === KATEGORI: PEMAHAMAN AKADEMIK ===
    {
      name: 'Pemahaman Konsep & Teori',
      description: 'Kemampuan memahami dan menjelaskan konsep teori yang mendasari project, termasuk algoritma, arsitektur sistem, dan metodologi yang digunakan.',
      kategori: 'Pemahaman Akademik',
      bobotMax: 15,
      urutan: 1,
      tipe: 'individu',
    },
    {
      name: 'Penguasaan Teknologi',
      description: 'Kemampuan menguasai dan menjelaskan teknologi/tools yang digunakan dalam project (framework, library, database, deployment, dll).',
      kategori: 'Pemahaman Akademik',
      bobotMax: 15,
      urutan: 2,
      tipe: 'individu',
    },
    {
      name: 'Analisis & Problem Solving',
      description: 'Kemampuan menganalisis masalah dan memberikan solusi yang tepat. Termasuk kemampuan debugging dan troubleshooting.',
      kategori: 'Pemahaman Akademik',
      bobotMax: 10,
      urutan: 3,
      tipe: 'individu',
    },

    // === KATEGORI: KONTRIBUSI PENGEMBANGAN ===
    {
      name: 'Kontribusi Kode/Development',
      description: 'Seberapa besar kontribusi dalam penulisan kode, implementasi fitur, dan pengembangan sistem. Dapat dilihat dari commit history dan code review.',
      kategori: 'Kontribusi Pengembangan',
      bobotMax: 20,
      urutan: 4,
      tipe: 'individu',
    },
    {
      name: 'Kualitas Kode Individual',
      description: 'Kualitas kode yang ditulis oleh anggota: clean code, best practices, dokumentasi inline, dan standar coding.',
      kategori: 'Kontribusi Pengembangan',
      bobotMax: 10,
      urutan: 5,
      tipe: 'individu',
    },
    {
      name: 'Inisiatif & Proaktivitas',
      description: 'Tingkat inisiatif dalam mengambil tugas, mengusulkan perbaikan, dan proaktif menyelesaikan masalah tanpa menunggu instruksi.',
      kategori: 'Kontribusi Pengembangan',
      bobotMax: 10,
      urutan: 6,
      tipe: 'individu',
    },

    // === KATEGORI: KEMAMPUAN KOMUNIKASI ===
    {
      name: 'Kemampuan Presentasi',
      description: 'Kemampuan mempresentasikan bagian project yang dikerjakan dengan jelas, sistematis, dan meyakinkan.',
      kategori: 'Komunikasi',
      bobotMax: 10,
      urutan: 7,
      tipe: 'individu',
    },
    {
      name: 'Kemampuan Menjawab Pertanyaan',
      description: 'Kemampuan menjawab pertanyaan dari penguji dengan tepat, logis, dan menunjukkan pemahaman mendalam.',
      kategori: 'Komunikasi',
      bobotMax: 10,
      urutan: 8,
      tipe: 'individu',
    },
  ];

  console.log('📋 Creating Rubrik Penilaian Individu...\n');

  // Check existing individual rubriks
  const existingRubriks = await prisma.rubrikPenilaian.findMany({
    where: { tipe: 'individu' },
  });

  if (existingRubriks.length > 0) {
    console.log(`⚠️  Found ${existingRubriks.length} existing individual rubriks.`);
    console.log('   Skipping creation to preserve existing data.\n');
    console.log('   Existing rubriks:');
    existingRubriks.forEach((r) => {
      console.log(`   • ${r.name} (${r.kategori}) - Max: ${r.bobotMax}`);
    });
    console.log('\n   To recreate, delete existing individual rubriks first.\n');
  } else {
    // Create individual rubriks
    for (const rubrik of rubrikIndividuList) {
      await prisma.rubrikPenilaian.create({ data: rubrik });
      console.log(`  ✅ ${rubrik.name}`);
      console.log(`     Kategori: ${rubrik.kategori} | Max: ${rubrik.bobotMax}`);
    }

    // Calculate total
    const totalBobot = rubrikIndividuList.reduce((sum, r) => sum + r.bobotMax, 0);
    
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 Rubrik Penilaian Individu berhasil dibuat!\n');
    console.log('📊 Summary:');
    console.log(`   • Total Rubrik: ${rubrikIndividuList.length}`);
    console.log(`   • Total Bobot:  ${totalBobot}/100`);
    console.log('\n📋 Kategori Penilaian:');
    
    // Group by category
    const categories = [...new Set(rubrikIndividuList.map(r => r.kategori))];
    categories.forEach(cat => {
      const catRubriks = rubrikIndividuList.filter(r => r.kategori === cat);
      const catTotal = catRubriks.reduce((sum, r) => sum + r.bobotMax, 0);
      console.log(`\n   ${cat} (${catTotal} poin):`);
      catRubriks.forEach(r => {
        console.log(`   • ${r.name} (${r.bobotMax})`);
      });
    });
    
    console.log('\n' + '═'.repeat(60));
  }

  // Show all rubriks summary
  console.log('\n📈 Status Rubrik Keseluruhan:\n');
  
  const allKelompok = await prisma.rubrikPenilaian.findMany({
    where: { tipe: 'kelompok', isActive: true },
    orderBy: { urutan: 'asc' },
  });
  
  const allIndividu = await prisma.rubrikPenilaian.findMany({
    where: { tipe: 'individu', isActive: true },
    orderBy: { urutan: 'asc' },
  });
  
  const totalKelompok = allKelompok.reduce((sum, r) => sum + r.bobotMax, 0);
  const totalIndividu = allIndividu.reduce((sum, r) => sum + r.bobotMax, 0);
  
  console.log('   ┌──────────────────┬────────────┬─────────────┐');
  console.log('   │ Tipe             │ Jumlah     │ Total Bobot │');
  console.log('   ├──────────────────┼────────────┼─────────────┤');
  console.log(`   │ Kelompok         │ ${String(allKelompok.length).padEnd(10)} │ ${String(totalKelompok).padEnd(11)} │`);
  console.log(`   │ Individu         │ ${String(allIndividu.length).padEnd(10)} │ ${String(totalIndividu).padEnd(11)} │`);
  console.log('   └──────────────────┴────────────┴─────────────┘');
  
  if (totalKelompok !== 100) {
    console.log(`\n   ⚠️  Rubrik Kelompok: ${totalKelompok}/100 (${totalKelompok < 100 ? 'kurang ' + (100 - totalKelompok) : 'lebih ' + (totalKelompok - 100)})`);
  } else {
    console.log(`\n   ✅ Rubrik Kelompok: 100/100`);
  }
  
  if (totalIndividu !== 100) {
    console.log(`   ⚠️  Rubrik Individu: ${totalIndividu}/100 (${totalIndividu < 100 ? 'kurang ' + (100 - totalIndividu) : 'lebih ' + (totalIndividu - 100)})`);
  } else {
    console.log(`   ✅ Rubrik Individu: 100/100`);
  }
  
  console.log('\n' + '═'.repeat(60));
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
