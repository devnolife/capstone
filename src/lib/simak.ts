/**
 * SIMAK Integration Service
 * Handles authentication and data sync with SIMAK system via GraphQL
 */

import crypto from 'crypto';
import type { PrismaClient } from '@/generated/prisma';

const SIMAK_GRAPHQL_URL = process.env.SIMAK_GRAPHQL_URL || 'https://sicekcok.if.unismuh.ac.id/graphql';

// GraphQL Queries
const GET_MAHASISWA_USER = `
  query MahasiswaUser($nim: String!) {
    mahasiswaUser(nim: $nim) {
      nim
      nama
      hp
      email
      prodi
      foto
      passwd
    }
  }
`;

// Types
export interface SimakMahasiswa {
  nim: string;
  nama: string;
  hp: string | null;
  email: string | null;
  prodi: string | null;
  foto: string | null;
  passwd: string; // MD5 hash from SIMAK
}

export interface SimakValidationResult {
  success: boolean;
  message: string;
  data?: SimakMahasiswa;
}

/**
 * Hash password to MD5 (SIMAK uses MD5 for password storage)
 */
export function hashMD5(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

/**
 * Fetch mahasiswa data from SIMAK GraphQL API
 */
export async function getMahasiswaFromSimak(nim: string): Promise<SimakMahasiswa | null> {
  try {
    const response = await fetch(SIMAK_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_MAHASISWA_USER,
        variables: { nim },
      }),
    });

    if (!response.ok) {
      console.error('SIMAK API error:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();

    if (result.errors) {
      console.error('SIMAK GraphQL errors:', result.errors);
      return null;
    }

    return result.data?.mahasiswaUser || null;
  } catch (error) {
    console.error('Error fetching from SIMAK:', error);
    return null;
  }
}

/**
 * Validate mahasiswa credentials against SIMAK
 * Compares MD5 hash of provided password with SIMAK's stored hash
 */
export async function validateSimakCredentials(
  nim: string,
  password: string
): Promise<SimakValidationResult> {
  try {
    // Fetch mahasiswa data from SIMAK
    const mahasiswa = await getMahasiswaFromSimak(nim);

    if (!mahasiswa) {
      return {
        success: false,
        message: 'NIM tidak ditemukan di SIMAK',
      };
    }

    // Compare MD5 hash
    const inputHash = hashMD5(password);
    const isValid = inputHash === mahasiswa.passwd;

    if (!isValid) {
      return {
        success: false,
        message: 'Password SIMAK tidak valid',
      };
    }

    return {
      success: true,
      message: 'Validasi berhasil',
      data: mahasiswa,
    };
  } catch (error) {
    console.error('Error validating SIMAK credentials:', error);
    return {
      success: false,
      message: 'Gagal menghubungi server SIMAK',
    };
  }
}

/**
 * Sync mahasiswa data from SIMAK to local database
 * Call this after successful login to update user profile
 */
export async function syncMahasiswaData(
  prisma: PrismaClient,
  userId: string,
  simakData: SimakMahasiswa
): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        nim: simakData.nim,
        name: simakData.nama,
        email: simakData.email || undefined,
        phone: simakData.hp || undefined,
        prodi: simakData.prodi || undefined,
        simakPhoto: simakData.foto || undefined,
        simakValidated: true,
        simakLastSync: new Date(),
        // Update image if SIMAK has photo and user doesn't have one
        image: simakData.foto || undefined,
      },
    });
  } catch (error) {
    console.error('Error syncing mahasiswa data:', error);
    throw error;
  }
}

/**
 * Create or update user from SIMAK data
 * Used when a new user logs in via SIMAK for the first time
 */
export async function upsertUserFromSimak(
  prisma: PrismaClient,
  simakData: SimakMahasiswa,
  passwordHash?: string
): Promise<{ id: string; username: string; name: string; role: string }> {
  try {
    // Check if user exists by NIM (username)
    const existingUser = await prisma.user.findUnique({
      where: { username: simakData.nim },
    });

    if (existingUser) {
      // Update existing user with latest SIMAK data
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          nim: simakData.nim,
          name: simakData.nama,
          email: simakData.email || undefined,
          phone: simakData.hp || undefined,
          prodi: simakData.prodi || undefined,
          simakPhoto: simakData.foto || undefined,
          simakValidated: true,
          simakLastSync: new Date(),
          image: simakData.foto || existingUser.image,
        },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
        },
      });
      return updated;
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username: simakData.nim,
        nim: simakData.nim,
        name: simakData.nama,
        email: simakData.email,
        phone: simakData.hp,
        prodi: simakData.prodi,
        simakPhoto: simakData.foto,
        image: simakData.foto,
        password: passwordHash, // Store bcrypt hash for fallback login
        role: 'MAHASISWA',
        simakValidated: true,
        simakLastSync: new Date(),
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error upserting user from SIMAK:', error);
    throw error;
  }
}
