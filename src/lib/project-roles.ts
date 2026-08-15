/**
 * Peran anggota tim project.
 *
 * `ProjectMember.role` adalah kolom String bebas (bukan enum Prisma), sehingga
 * nilainya mudah salah ketik. Konstanta ini menjadi satu-satunya sumber
 * kebenaran — sebelumnya beberapa berkas memakai `'OWNER'` yang tidak pernah
 * ada di database, membuat penjaga "jangan hapus ketua" tidak berfungsi dan
 * ketua hilang dari daftar anggota sehingga tidak bisa dinilai dosen.
 */

/** Ketua tim (pemilik project). */
export const PROJECT_ROLE_LEADER = 'leader';
/** Anggota tim selain ketua. */
export const PROJECT_ROLE_MEMBER = 'member';

export type ProjectMemberRole =
  | typeof PROJECT_ROLE_LEADER
  | typeof PROJECT_ROLE_MEMBER;

/** Apakah baris anggota ini adalah ketua tim? */
export function isLeaderRole(role: string | null | undefined): boolean {
  return role === PROJECT_ROLE_LEADER;
}
