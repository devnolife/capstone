import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MOCK_LANDING_STATS } from '@/lib/mock-dashboard';

// GET /api/stats - Get public stats for landing page
export async function GET() {
  try {
    // Count total projects
    const totalProjects = await prisma.project.count();

    // Count approved projects
    const approvedProjects = await prisma.project.count({
      where: { status: 'APPROVED' },
    });

    // Count mahasiswa (users with role MAHASISWA)
    const totalMahasiswa = await prisma.user.count({
      where: { role: 'MAHASISWA' },
    });

    // Calculate success rate (approved / total submitted projects)
    const submittedProjects = await prisma.project.count({
      where: {
        status: {
          in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
        },
      },
    });

    const successRate = submittedProjects > 0 
      ? Math.round((approvedProjects / submittedProjects) * 100) 
      : 0;

    return NextResponse.json({
      totalProjects,
      approvedProjects,
      totalMahasiswa,
      successRate,
    });
  } catch (error) {
    console.error('Error fetching stats (fallback to mock):', error);
    // Database tidak tersedia — kirim data mock agar landing tetap hidup
    return NextResponse.json(MOCK_LANDING_STATS);
  }
}
