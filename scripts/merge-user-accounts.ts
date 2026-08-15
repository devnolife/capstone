/**
 * Gabungkan dua akun user menjadi satu.
 *
 * Dipakai saat seseorang yang sudah punya akun lokal lama (dibuat manual /
 * seed) login lewat SSO Unismuh dan mendapat akun baru terpisah. Seluruh
 * referensi milik akun lama dipindahkan ke akun SSO, lalu akun lama dihapus.
 *
 * Pemakaian:
 *   npx tsx scripts/merge-user-accounts.ts <sourceUserId> <targetUserId> [--apply]
 *
 * Tanpa `--apply` skrip hanya menampilkan rencana (dry run).
 */

import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL belum diset.');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

/**
 * Semua kolom foreign key yang menunjuk ke `users`.
 *
 * `conflictKeys` diisi bila tabel punya unique constraint yang melibatkan kolom
 * user — baris sumber yang akan bentrok dengan milik target dihapus lebih dulu
 * supaya skrip aman dijalankan ulang.
 */
const USER_REFERENCES: {
  table: string;
  column: string;
  conflictKeys?: string[];
}[] = [
  { table: 'project_assignments', column: 'dosenId', conflictKeys: ['projectId'] },
  { table: 'reviews', column: 'reviewerId', conflictKeys: ['projectId'] },
  { table: 'notifications', column: 'userId' },
  { table: 'presentation_schedules', column: 'scheduledById' },
  { table: 'project_discussions', column: 'authorId' },
  { table: 'project_members', column: 'userId', conflictKeys: ['projectId'] },
  { table: 'projects', column: 'mahasiswaId' },
  { table: 'project_work_logs', column: 'authorId' },
  { table: 'project_user_photos', column: 'uploadedById' },
  { table: 'team_invitations', column: 'inviterId' },
  { table: 'team_invitations', column: 'inviteeId', conflictKeys: ['projectId'] },
  { table: 'accounts', column: 'userId' },
];

async function countRows(table: string, column: string, userId: string) {
  const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) FROM "${table}" WHERE "${column}" = $1`,
    userId,
  );
  return Number(rows[0]?.count ?? 0);
}

async function main() {
  const [sourceId, targetId] = process.argv.slice(2);
  const apply = process.argv.includes('--apply');

  if (!sourceId || !targetId) {
    console.error(
      'Pemakaian: npx tsx scripts/merge-user-accounts.ts <sourceUserId> <targetUserId> [--apply]',
    );
    process.exit(1);
  }
  if (sourceId === targetId) {
    console.error('sourceUserId dan targetUserId tidak boleh sama.');
    process.exit(1);
  }

  const [source, target] = await Promise.all([
    prisma.user.findUnique({ where: { id: sourceId } }),
    prisma.user.findUnique({ where: { id: targetId } }),
  ]);

  if (!source) {
    console.error(`Akun sumber ${sourceId} tidak ditemukan.`);
    process.exit(1);
  }
  if (!target) {
    console.error(`Akun tujuan ${targetId} tidak ditemukan.`);
    process.exit(1);
  }

  console.log(`Sumber : ${source.username} (${source.name}) — role ${source.role}`);
  console.log(`Tujuan : ${target.username} (${target.name}) — role ${target.role}`);
  console.log('');

  for (const ref of USER_REFERENCES) {
    const count = await countRows(ref.table, ref.column, sourceId);
    if (count > 0) {
      console.log(`  ${ref.table}.${ref.column}: ${count} baris akan dipindahkan`);
    }
  }

  if (!apply) {
    console.log('\nDry run selesai. Jalankan ulang dengan --apply untuk mengeksekusi.');
    return;
  }

  console.log('\nMengeksekusi migrasi...');

  await prisma.$transaction(async (tx) => {
    for (const ref of USER_REFERENCES) {
      // Buang baris sumber yang akan melanggar unique constraint di akun tujuan
      if (ref.conflictKeys?.length) {
        const matchKeys = ref.conflictKeys
          .map((key) => `dst."${key}" = src."${key}"`)
          .join(' AND ');
        const deleted = await tx.$executeRawUnsafe(
          `DELETE FROM "${ref.table}" src
             WHERE src."${ref.column}" = $1
               AND EXISTS (
                 SELECT 1 FROM "${ref.table}" dst
                  WHERE dst."${ref.column}" = $2
                    AND ${matchKeys}
               )`,
          sourceId,
          targetId,
        );
        if (deleted > 0) {
          console.log(`  ${ref.table}.${ref.column}: ${deleted} baris duplikat dihapus`);
        }
      }

      const moved = await tx.$executeRawUnsafe(
        `UPDATE "${ref.table}" SET "${ref.column}" = $1 WHERE "${ref.column}" = $2`,
        targetId,
        sourceId,
      );
      if (moved > 0) {
        console.log(`  ${ref.table}.${ref.column}: ${moved} baris dipindahkan`);
      }
    }

    await tx.user.delete({ where: { id: sourceId } });
    console.log(`  Akun sumber ${source.username} dihapus`);
  });

  console.log('\nMigrasi selesai.');
}

main()
  .catch((error) => {
    console.error('Migrasi gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
