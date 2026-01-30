import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMahasiswaFromSimak } from '@/lib/simak';

/**
 * GET /api/users/sync-simak/preview?nim=XXX
 * Preview mahasiswa data from SIMAK without checking if user exists
 * Used for updating existing users with SIMAK data
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nim = searchParams.get('nim');

    if (!nim) {
      return NextResponse.json(
        { error: 'NIM diperlukan' },
        { status: 400 }
      );
    }

    // Fetch mahasiswa data from SIMAK
    console.log(`[ADMIN] Preview SIMAK data for edit, NIM: ${nim}`);
    const simakData = await getMahasiswaFromSimak(nim);

    if (!simakData) {
      return NextResponse.json(
        { error: 'NIM tidak ditemukan di SIMAK' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        nim: simakData.nim,
        nama: simakData.nama,
        email: simakData.email,
        phone: simakData.hp,
        prodi: simakData.prodi,
        foto: simakData.foto,
      },
    });
  } catch (error) {
    console.error('Error fetching SIMAK data for preview:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
