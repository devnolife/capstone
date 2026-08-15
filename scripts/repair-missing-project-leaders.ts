/**
 * Pulihkan baris anggota "ketua" yang hilang.
 *
 * Dosen menilai anggota dengan menelusuri `project.members`, sehingga ketua
 * yang tidak punya baris di `project_members` sama sekali tidak bisa dinilai.
 * Baris tersebut sempat terhapus karena penjaga penghapusan memakai role
 * `'OWNER'` yang tidak pernah ada di database (nilai sebenarnya `'leader'`).
 *
 * Pemakaian:
 *   npx tsx scripts/repair-missing-project-leaders.ts [--apply]
 *
 * Tanpa `--apply` skrip hanya menampilkan rencana (dry run).
 */

import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PROJECT_ROLE_LEADER } from '../src/lib/project-roles';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL belum diset.');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

async function main() {
  const apply = process.argv.includes('--apply');

  const projects = await prisma.project.findMany({
    include: {
      mahasiswa: { select: { id: true, name: true, githubUsername: true } },
      members: { select: { userId: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const broken = projects.filter(
    (project) => !project.members.some((m) => m.userId === project.mahasiswaId),
  );

  if (broken.length === 0) {
    console.log('Semua project sudah punya baris ketua. Tidak ada yang perlu diperbaiki.');
    return;
  }

  console.log(`${broken.length} project tanpa baris ketua:\n`);
  for (const project of broken) {
    console.log(`  ${project.id}  ${project.title} — ketua: ${project.mahasiswa.name}`);
  }

  if (!apply) {
    console.log('\nDry run selesai. Jalankan ulang dengan --apply untuk memperbaiki.');
    return;
  }

  console.log('\nMemperbaiki...');
  let repaired = 0;

  for (const project of broken) {
    // Upsert agar aman dijalankan ulang (unique: projectId + userId)
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: project.mahasiswaId,
        },
      },
      create: {
        projectId: project.id,
        userId: project.mahasiswaId,
        role: PROJECT_ROLE_LEADER,
        name: project.mahasiswa.name,
        githubUsername: project.mahasiswa.githubUsername,
      },
      update: { role: PROJECT_ROLE_LEADER },
    });
    repaired += 1;
    console.log(`  ✓ ${project.title}`);
  }

  console.log(`\nSelesai — ${repaired} baris ketua dipulihkan.`);
}

main()
  .catch((error) => {
    console.error('Perbaikan gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
