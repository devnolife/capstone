import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('reviewId');
    const projectId = searchParams.get('projectId');
    const exportAll = searchParams.get('all') === 'true';

    // Fetch user's reviews based on parameters
    let reviews;
    
    if (reviewId) {
      // Single review export
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              semester: true,
              tahunAkademik: true,
              mahasiswaId: true,
              members: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      nim: true,
                    },
                  },
                },
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          scores: {
            include: {
              rubrik: true,
            },
          },
          memberScores: {
            include: {
              member: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      nim: true,
                    },
                  },
                },
              },
              rubrik: {
                select: {
                  id: true,
                  name: true,
                  kategori: true,
                  bobotMax: true,
                  tipe: true,
                },
              },
            },
          },
        },
      });

      if (!review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      // Check authorization
      if (review.project.mahasiswaId !== session.user.id) {
        const isMember = review.project.members.some((m) => m.user?.id === session.user?.id);
        if (!isMember) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      reviews = [review];
    } else if (projectId) {
      // Export all reviews for a specific project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { mahasiswaId: true, members: { select: { userId: true } } },
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Check authorization
      if (project.mahasiswaId !== session.user.id) {
        const isMember = project.members.some((m) => m.userId === session.user?.id);
        if (!isMember) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      reviews = await prisma.review.findMany({
        where: { projectId },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              semester: true,
              tahunAkademik: true,
              mahasiswaId: true,
              members: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      nim: true,
                    },
                  },
                },
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          scores: {
            include: {
              rubrik: true,
            },
          },
          memberScores: {
            include: {
              member: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      nim: true,
                    },
                  },
                },
              },
              rubrik: {
                select: {
                  id: true,
                  name: true,
                  kategori: true,
                  bobotMax: true,
                  tipe: true,
                },
              },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      });
    } else if (exportAll) {
      // Export all user's reviews
      reviews = await prisma.review.findMany({
        where: {
          project: { mahasiswaId: session.user.id },
          status: 'COMPLETED',
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              semester: true,
              tahunAkademik: true,
              mahasiswaId: true,
              members: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      nim: true,
                    },
                  },
                },
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          scores: {
            include: {
              rubrik: true,
            },
          },
          memberScores: {
            include: {
              member: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      nim: true,
                    },
                  },
                },
              },
              rubrik: {
                select: {
                  id: true,
                  name: true,
                  kategori: true,
                  bobotMax: true,
                  tipe: true,
                },
              },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      });
    } else {
      return NextResponse.json(
        { error: 'Please provide reviewId, projectId, or all=true parameter' },
        { status: 400 }
      );
    }

    if (reviews.length === 0) {
      return NextResponse.json({ error: 'No completed reviews found' }, { status: 404 });
    }

    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Generate HTML report
    const htmlContent = generateReviewReportHTML(reviews, currentDate);
    const filename = reviews.length === 1 
      ? `Laporan_Review_${reviews[0].project.title.replace(/\s+/g, '_')}.html`
      : `Laporan_Review_Semua_Project.html`;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating review report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface ReviewData {
  id: string;
  status: string;
  overallScore: number | null;
  overallComment: string | null;
  createdAt: Date;
  completedAt: Date | null;
  project: {
    id: string;
    title: string;
    semester: string;
    tahunAkademik: string;
    members: {
      id: string;
      name: string | null;
      role: string;
      user: {
        id: string;
        name: string | null;
        username: string;
        nim: string | null;
      } | null;
    }[];
  };
  reviewer: {
    id: string;
    name: string | null;
    username: string;
  };
  scores: {
    id: string;
    score: number;
    maxScore: number;
    feedback: string | null;
    rubrik: {
      id: string;
      name: string;
      kategori: string;
      bobotMax: number;
    };
  }[];
  memberScores: {
    id: string;
    score: number;
    maxScore: number;
    feedback: string | null;
    member: {
      id: string;
      name: string | null;
      role: string;
      user: {
        id: string;
        name: string | null;
        username: string;
        nim: string | null;
      } | null;
    };
    rubrik: {
      id: string;
      name: string;
      kategori: string;
      bobotMax: number;
      tipe: string;
    };
  }[];
}

function getMemberName(member: ReviewData['memberScores'][0]['member']): string {
  if (member.user?.name) return member.user.name;
  if (member.name) return member.name;
  if (member.user?.username) return member.user.username;
  return 'Anggota';
}

function getMemberNim(member: ReviewData['memberScores'][0]['member']): string {
  return member.user?.nim || '-';
}

function getScoreColor(percentage: number): string {
  if (percentage >= 85) return '#10b981'; // emerald
  if (percentage >= 70) return '#3b82f6'; // blue
  if (percentage >= 55) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

function getScoreLabel(percentage: number): string {
  if (percentage >= 85) return 'Excellent';
  if (percentage >= 70) return 'Good';
  if (percentage >= 55) return 'Fair';
  return 'Needs Improvement';
}

function groupMemberScores(memberScores: ReviewData['memberScores']) {
  const grouped = new Map<string, { 
    member: ReviewData['memberScores'][0]['member']; 
    scores: ReviewData['memberScores']; 
    totalScore: number; 
    maxScore: number 
  }>();
  
  memberScores.forEach((ms) => {
    const existing = grouped.get(ms.member.id);
    if (existing) {
      existing.scores.push(ms);
      existing.totalScore += ms.score;
      existing.maxScore += ms.maxScore;
    } else {
      grouped.set(ms.member.id, {
        member: ms.member,
        scores: [ms],
        totalScore: ms.score,
        maxScore: ms.maxScore,
      });
    }
  });
  
  return Array.from(grouped.values());
}

function generateReviewReportHTML(reviews: ReviewData[], currentDate: string): string {
  const multipleReviews = reviews.length > 1;
  
  // Calculate overall statistics
  const completedReviews = reviews.filter(r => r.status === 'COMPLETED');
  const avgScore = completedReviews.length > 0
    ? Math.round(completedReviews.reduce((acc, r) => acc + (r.overallScore || 0), 0) / completedReviews.length)
    : null;

  const reviewsHTML = reviews.map((review, index) => {
    const groupedMemberScores = groupMemberScores(review.memberScores);
    
    // Group scores by kategori
    const scoresByKategori = review.scores.reduce((acc, s) => {
      if (!acc[s.rubrik.kategori]) acc[s.rubrik.kategori] = [];
      acc[s.rubrik.kategori].push(s);
      return acc;
    }, {} as Record<string, typeof review.scores>);

    const scoreColor = review.overallScore ? getScoreColor(review.overallScore) : '#888';
    const scoreLabel = review.overallScore ? getScoreLabel(review.overallScore) : '-';

    return `
      <div class="review-section ${index > 0 ? 'page-break' : ''}">
        ${multipleReviews ? `<h2 style="color: #333; border-bottom: 2px solid ${scoreColor}; padding-bottom: 10px;">Review #${index + 1}: ${review.project.title}</h2>` : ''}
        
        <!-- Review Header -->
        <div class="info-box" style="border-left-color: ${scoreColor};">
          <div class="info-grid">
            <div>
              <p><strong>Dosen Penguji:</strong> ${review.reviewer.name || review.reviewer.username}</p>
              <p><strong>Status:</strong> <span class="status-badge status-${review.status.toLowerCase()}">${review.status === 'COMPLETED' ? 'Selesai' : review.status === 'IN_PROGRESS' ? 'Sedang Direview' : 'Menunggu'}</span></p>
              ${review.completedAt ? `<p><strong>Tanggal Selesai:</strong> ${new Date(review.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
            </div>
            <div class="score-box" style="background: ${scoreColor}15; border-color: ${scoreColor};">
              <div class="score-value" style="color: ${scoreColor};">${review.overallScore ?? '-'}</div>
              <div class="score-label">/100</div>
              <div class="score-grade" style="color: ${scoreColor};">${scoreLabel}</div>
            </div>
          </div>
        </div>

        ${review.overallComment ? `
        <div class="comment-box">
          <h4>Komentar Umum dari Dosen:</h4>
          <p class="comment-text">"${review.overallComment}"</p>
        </div>
        ` : ''}

        <!-- Group Scores -->
        ${review.scores.length > 0 ? `
        <h3>Nilai Kelompok per Kriteria</h3>
        ${Object.entries(scoresByKategori).map(([kategori, scores]) => `
          <div class="kategori-section">
            <h4 class="kategori-header">${kategori}</h4>
            <table class="scores-table">
              <thead>
                <tr>
                  <th style="width: 40%;">Kriteria</th>
                  <th style="width: 15%;">Nilai</th>
                  <th style="width: 15%;">Max</th>
                  <th style="width: 30%;">Feedback</th>
                </tr>
              </thead>
              <tbody>
                ${scores.map(s => {
                  const pct = (s.score / s.maxScore) * 100;
                  return `
                  <tr>
                    <td>${s.rubrik.name}</td>
                    <td class="score-cell" style="color: ${getScoreColor(pct)};">${s.score}</td>
                    <td class="score-cell">${s.maxScore}</td>
                    <td class="feedback-cell">${s.feedback || '-'}</td>
                  </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
        ` : ''}

        <!-- Individual Member Scores -->
        ${groupedMemberScores.length > 0 ? `
        <h3>Nilai Individu per Anggota</h3>
        <div class="members-grid">
          ${groupedMemberScores.map(({ member, scores, totalScore, maxScore }) => {
            const memberPct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
            const memberColor = getScoreColor(memberPct);
            return `
            <div class="member-card">
              <div class="member-header" style="border-color: ${memberColor};">
                <div class="member-info">
                  <span class="member-name">${getMemberName(member)}</span>
                  <span class="member-role ${member.role === 'leader' ? 'role-leader' : ''}">${member.role === 'leader' ? 'Ketua' : 'Anggota'}</span>
                  <span class="member-nim">NIM: ${getMemberNim(member)}</span>
                </div>
                <div class="member-score" style="background: ${memberColor}15; color: ${memberColor};">
                  ${totalScore.toFixed(1)}/${maxScore.toFixed(1)}
                  <span class="member-pct">(${memberPct}%)</span>
                </div>
              </div>
              <div class="member-scores">
                ${scores.map(s => {
                  const sPct = (s.score / s.maxScore) * 100;
                  return `
                  <div class="individual-score">
                    <span class="score-name">${s.rubrik.name}</span>
                    <span class="score-value-small" style="color: ${getScoreColor(sPct)};">${s.score}/${s.maxScore}</span>
                    ${s.feedback ? `<div class="score-feedback">"${s.feedback}"</div>` : ''}
                  </div>
                  `;
                }).join('')}
              </div>
            </div>
            `;
          }).join('')}
        </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Hasil Review - ${reviews[0]?.project.title || 'All Projects'}</title>
  <style>
    @media print {
      body { margin: 0; padding: 15px; font-size: 10pt; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      .member-card { break-inside: avoid; }
    }
    
    * { box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      max-width: 900px;
      margin: 0 auto;
      padding: 30px;
      background: #f9fafb;
      color: #333;
    }
    
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }
    .print-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    
    .report-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    .header .institution {
      font-size: 16pt;
      font-weight: 700;
      color: #1f2937;
    }
    .header .faculty {
      font-size: 12pt;
      color: #4b5563;
    }
    .header .title {
      font-size: 18pt;
      font-weight: 700;
      color: #667eea;
      margin-top: 20px;
    }
    
    .project-info {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .project-info h3 {
      margin: 0 0 15px 0;
      color: #374151;
    }
    .project-info p {
      margin: 5px 0;
      color: #4b5563;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .stat-value {
      font-size: 28pt;
      font-weight: 700;
      color: #667eea;
    }
    .stat-label {
      font-size: 10pt;
      color: #6b7280;
      margin-top: 5px;
    }
    
    .info-box {
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #667eea;
    }
    .info-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .score-box {
      text-align: center;
      padding: 15px 25px;
      border-radius: 12px;
      border: 2px solid;
    }
    .score-value {
      font-size: 36pt;
      font-weight: 700;
      line-height: 1;
    }
    .score-label {
      font-size: 14pt;
      color: #6b7280;
    }
    .score-grade {
      font-size: 12pt;
      font-weight: 600;
      margin-top: 5px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10pt;
      font-weight: 600;
    }
    .status-completed { background: #d1fae5; color: #065f46; }
    .status-in_progress { background: #dbeafe; color: #1e40af; }
    .status-pending { background: #fef3c7; color: #92400e; }
    
    .comment-box {
      background: #fefce8;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #eab308;
    }
    .comment-box h4 {
      margin: 0 0 10px 0;
      color: #854d0e;
    }
    .comment-text {
      color: #713f12;
      font-style: italic;
      margin: 0;
    }
    
    h3 {
      color: #374151;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .kategori-section {
      margin-bottom: 20px;
    }
    .kategori-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      margin: 0 0 10px 0;
      font-size: 11pt;
    }
    
    .scores-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 10pt;
    }
    .scores-table th {
      background: #f3f4f6;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    .scores-table td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .score-cell {
      font-weight: 700;
      text-align: center;
    }
    .feedback-cell {
      font-size: 9pt;
      color: #6b7280;
      font-style: italic;
    }
    
    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .member-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }
    .member-header {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid;
      background: #f9fafb;
    }
    .member-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .member-name {
      font-weight: 700;
      color: #1f2937;
    }
    .member-role {
      font-size: 9pt;
      padding: 2px 8px;
      border-radius: 10px;
      background: #e5e7eb;
      color: #4b5563;
      display: inline-block;
      width: fit-content;
    }
    .role-leader {
      background: #dbeafe;
      color: #1e40af;
    }
    .member-nim {
      font-size: 9pt;
      color: #6b7280;
    }
    .member-score {
      text-align: center;
      padding: 10px 15px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 12pt;
    }
    .member-pct {
      display: block;
      font-size: 9pt;
      font-weight: 600;
    }
    .member-scores {
      padding: 15px;
    }
    .individual-score {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      padding: 8px 0;
      border-bottom: 1px dashed #e5e7eb;
    }
    .individual-score:last-child {
      border-bottom: none;
    }
    .score-name {
      font-size: 10pt;
      color: #4b5563;
    }
    .score-value-small {
      font-weight: 700;
      font-size: 10pt;
    }
    .score-feedback {
      width: 100%;
      font-size: 9pt;
      color: #6b7280;
      font-style: italic;
      margin-top: 4px;
      padding-left: 10px;
      border-left: 2px solid #e5e7eb;
    }
    
    .review-section {
      margin-bottom: 40px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 9pt;
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Cetak / Simpan PDF</button>
  
  <div class="report-container">
    <div class="header">
      <div class="institution">UNIVERSITAS ISLAM MAKASSAR</div>
      <div class="faculty">FAKULTAS TEKNIK - PROGRAM STUDI TEKNIK INFORMATIKA</div>
      <div class="title">LAPORAN HASIL REVIEW PROJECT CAPSTONE</div>
    </div>

    ${!multipleReviews ? `
    <div class="project-info">
      <h3>Informasi Project</h3>
      <p><strong>Judul:</strong> ${reviews[0].project.title}</p>
      <p><strong>Semester:</strong> ${reviews[0].project.semester}</p>
      <p><strong>Tahun Akademik:</strong> ${reviews[0].project.tahunAkademik}</p>
      <p><strong>Anggota Tim:</strong> ${reviews[0].project.members.map(m => getMemberName(m as unknown as ReviewData['memberScores'][0]['member'])).join(', ')}</p>
    </div>
    ` : `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${reviews.length}</div>
        <div class="stat-label">Total Review</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${completedReviews.length}</div>
        <div class="stat-label">Selesai</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: ${avgScore ? getScoreColor(avgScore) : '#888'};">${avgScore ?? '-'}</div>
        <div class="stat-label">Rata-rata Nilai</div>
      </div>
    </div>
    `}

    ${reviewsHTML}

    <div class="footer no-print">
      <p>Dokumen ini di-generate secara otomatis oleh Sistem Capstone UIM</p>
      <p>Tanggal Generate: ${currentDate}</p>
    </div>
  </div>
</body>
</html>
  `;
}
