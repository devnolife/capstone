import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Template types
type TemplateType = 'license' | 'handover' | 'declaration';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const templateType = (searchParams.get('type') || 'license') as TemplateType;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Fetch project with members and requirements
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        mahasiswa: {
          select: {
            name: true,
            nim: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                nim: true,
                email: true,
              },
            },
          },
        },
        requirements: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check authorization (must be owner or member)
    const isMember = project.members.some((m) => m.userId === session.user?.id);
    const isOwner = project.mahasiswaId === session.user?.id;
    
    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all team members including owner
    const teamMembers = [
      {
        name: project.mahasiswa.name,
        nim: project.mahasiswa.nim || '-',
        role: 'Ketua Tim',
      },
      ...project.members
        .filter((m) => m.role !== 'OWNER')
        .map((m) => ({
          name: m.user?.name || m.name || 'Anggota',
          nim: m.user?.nim || '-',
          role: 'Anggota',
        })),
    ];

    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Create project data for templates
    const projectData: ProjectData = {
      id: project.id,
      title: project.title,
      description: project.description,
      semester: project.semester,
      tahunAkademik: project.tahunAkademik,
      githubRepoUrl: project.githubRepoUrl,
      productionUrl: project.productionUrl,
      technologies: null, // Technologies not stored in database, could be added later
      mahasiswa: project.mahasiswa,
    };

    // Generate HTML based on template type
    let htmlContent = '';
    let filename = '';

    switch (templateType) {
      case 'license':
        htmlContent = generateLicenseTemplate(projectData, teamMembers, currentDate);
        filename = `Surat_Pernyataan_Hak_Cipta_${project.title.replace(/\s+/g, '_')}.html`;
        break;
      case 'handover':
        htmlContent = generateHandoverTemplate(projectData, teamMembers, currentDate);
        filename = `Surat_Serah_Terima_${project.title.replace(/\s+/g, '_')}.html`;
        break;
      case 'declaration':
        htmlContent = generateDeclarationTemplate(projectData, teamMembers, currentDate);
        filename = `Surat_Pernyataan_Keaslian_${project.title.replace(/\s+/g, '_')}.html`;
        break;
      default:
        htmlContent = generateLicenseTemplate(projectData, teamMembers, currentDate);
        filename = `Template_${project.title.replace(/\s+/g, '_')}.html`;
    }

    // Return HTML as downloadable file
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  semester: string;
  tahunAkademik: string;
  githubRepoUrl: string | null;
  productionUrl: string | null;
  technologies: string[] | null;
  mahasiswa: {
    name: string;
    nim: string | null;
    email: string | null;
  };
}

interface TeamMember {
  name: string;
  nim: string;
  role: string;
}

function generateLicenseTemplate(
  project: ProjectData,
  teamMembers: TeamMember[],
  currentDate: string
): string {
  const membersRows = teamMembers
    .map(
      (m, i) => `
        <tr>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${i + 1}</td>
          <td style="border: 1px solid #000; padding: 8px;">${m.name}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${m.nim}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${m.role}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;"></td>
        </tr>
      `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Pernyataan Hak Cipta dan Lisensi Project</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 10px;
    }
    .institution {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .faculty {
      font-size: 12pt;
      margin-bottom: 5px;
    }
    .title {
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 30px 0 20px;
      text-align: center;
    }
    .content {
      text-align: justify;
      margin-bottom: 20px;
    }
    .project-info {
      margin: 20px 0;
      padding: 15px;
      background: #f9f9f9;
      border-left: 4px solid #333;
    }
    .project-info p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .signature-section {
      margin-top: 50px;
    }
    .signature-box {
      display: inline-block;
      width: 45%;
      text-align: center;
      vertical-align: top;
    }
    .signature-line {
      margin-top: 80px;
      border-top: 1px solid #000;
      padding-top: 5px;
    }
    .checkbox-item {
      margin: 10px 0;
      padding-left: 30px;
      position: relative;
    }
    .checkbox-item::before {
      content: "☐";
      position: absolute;
      left: 0;
      font-size: 16pt;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover {
      background: #0051a8;
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
  
  <div class="header">
    <div class="institution">UNIVERSITAS ISLAM MAKASSAR</div>
    <div class="faculty">FAKULTAS TEKNIK</div>
    <div class="faculty">PROGRAM STUDI TEKNIK INFORMATIKA</div>
    <div style="margin-top: 10px; font-size: 10pt;">
      Jl. Perintis Kemerdekaan Km. 9 No. 29 Makassar<br>
      Telp: (0411) 588-xxx | Email: ft@uim-makassar.ac.id
    </div>
  </div>

  <div class="title">
    SURAT PERNYATAAN HAK CIPTA DAN LISENSI PROJECT
  </div>

  <div class="content">
    <p>Yang bertanda tangan di bawah ini, kami selaku pengembang project capstone:</p>
    
    <div class="project-info">
      <p><strong>Judul Project:</strong> ${project.title}</p>
      <p><strong>Semester:</strong> ${project.semester}</p>
      <p><strong>Tahun Akademik:</strong> ${project.tahunAkademik}</p>
      ${project.githubRepoUrl ? `<p><strong>Repository:</strong> ${project.githubRepoUrl}</p>` : ''}
      ${project.productionUrl ? `<p><strong>URL Production:</strong> ${project.productionUrl}</p>` : ''}
      ${project.technologies && project.technologies.length > 0 ? `<p><strong>Teknologi:</strong> ${project.technologies.join(', ')}</p>` : ''}
    </div>

    <p><strong>Tim Pengembang:</strong></p>
    <table>
      <thead>
        <tr>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">No</th>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">Nama</th>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">NIM</th>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">Jabatan</th>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">Tanda Tangan</th>
        </tr>
      </thead>
      <tbody>
        ${membersRows}
      </tbody>
    </table>

    <p>Dengan ini menyatakan bahwa:</p>

    <ol style="margin-left: 20px;">
      <li style="margin-bottom: 15px;">
        <strong>Hak Cipta:</strong> Kami menyatakan bahwa project ini merupakan hasil karya asli kami dan tidak menjiplak karya orang lain. Seluruh referensi dan sumber yang digunakan telah dicantumkan dengan benar.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Lisensi Penggunaan:</strong> Kami memberikan izin kepada:
        <div class="checkbox-item">Universitas Islam Makassar untuk menyimpan, mengarsipkan, dan mempublikasikan project ini untuk kepentingan akademik.</div>
        <div class="checkbox-item">Mahasiswa angkatan selanjutnya untuk mempelajari, memodifikasi, dan mengembangkan project ini sebagai bahan pembelajaran dengan ketentuan mencantumkan kredit kepada pengembang asli.</div>
        <div class="checkbox-item">Dosen dan tenaga pengajar untuk menggunakan project ini sebagai contoh pembelajaran.</div>
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Ketentuan Modifikasi:</strong> Project ini dapat dimodifikasi dan dikembangkan lebih lanjut oleh pihak yang berwenang dengan ketentuan:
        <ul style="margin-left: 20px; margin-top: 10px;">
          <li>Mencantumkan kredit kepada pengembang asli (attribution)</li>
          <li>Tidak mengklaim project asli sebagai karya sendiri</li>
          <li>Menggunakan untuk tujuan pendidikan dan non-komersial</li>
          <li>Melaporkan hasil modifikasi kepada Program Studi</li>
        </ul>
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Pertanggungjawaban:</strong> Kami bertanggung jawab penuh atas isi dan keaslian project ini. Jika di kemudian hari ditemukan pelanggaran hak cipta atau ketidaksesuaian dengan pernyataan ini, kami bersedia menerima sanksi akademik sesuai ketentuan yang berlaku.
      </li>
    </ol>

    <p>Demikian surat pernyataan ini kami buat dengan sebenar-benarnya tanpa ada paksaan dari pihak manapun.</p>
  </div>

  <div class="signature-section">
    <p style="text-align: right;">Makassar, ${currentDate}</p>
    
    <div style="margin-top: 30px;">
      <div class="signature-box">
        <p>Mengetahui,<br>Koordinator Program Studi</p>
        <div class="signature-line">
          <p>(____________________________)</p>
          <p>NIP: </p>
        </div>
      </div>
      <div class="signature-box" style="float: right;">
        <p>Ketua Tim Pengembang,</p>
        <div class="signature-line">
          <p>(${project.mahasiswa.name})</p>
          <p>NIM: ${project.mahasiswa.nim || '_______________'}</p>
        </div>
      </div>
    </div>
  </div>

  <div style="clear: both; margin-top: 100px; font-size: 10pt; color: #666; text-align: center;" class="no-print">
    <hr style="border: none; border-top: 1px dashed #ccc; margin: 20px 0;">
    <p>Dokumen ini di-generate secara otomatis oleh Sistem Capstone UIM</p>
    <p>Project ID: ${project.id}</p>
    <p>Tanggal Generate: ${currentDate}</p>
  </div>
</body>
</html>
  `;
}

function generateHandoverTemplate(
  project: ProjectData,
  teamMembers: TeamMember[],
  currentDate: string
): string {
  const membersRows = teamMembers
    .map(
      (m, i) => `
        <tr>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${i + 1}</td>
          <td style="border: 1px solid #000; padding: 8px;">${m.name}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${m.nim}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${m.role}</td>
        </tr>
      `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Berita Acara Serah Terima Project</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .institution {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .faculty {
      font-size: 12pt;
      margin-bottom: 5px;
    }
    .title {
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 30px 0 20px;
      text-align: center;
    }
    .content {
      text-align: justify;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .signature-section {
      margin-top: 50px;
    }
    .signature-box {
      display: inline-block;
      width: 45%;
      text-align: center;
      vertical-align: top;
    }
    .signature-line {
      margin-top: 80px;
      border-top: 1px solid #000;
      padding-top: 5px;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
  
  <div class="header">
    <div class="institution">UNIVERSITAS ISLAM MAKASSAR</div>
    <div class="faculty">FAKULTAS TEKNIK</div>
    <div class="faculty">PROGRAM STUDI TEKNIK INFORMATIKA</div>
  </div>

  <div class="title">
    BERITA ACARA SERAH TERIMA PROJECT CAPSTONE
  </div>

  <div class="content">
    <p>Pada hari ini, ______________________ tanggal ${currentDate}, telah dilakukan serah terima project capstone dengan rincian sebagai berikut:</p>

    <h4 style="margin-top: 20px;">A. DATA PROJECT</h4>
    <table>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; width: 30%; background: #f0f0f0;"><strong>Judul Project</strong></td>
        <td style="border: 1px solid #000; padding: 8px;">${project.title}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; background: #f0f0f0;"><strong>Semester</strong></td>
        <td style="border: 1px solid #000; padding: 8px;">${project.semester}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; background: #f0f0f0;"><strong>Tahun Akademik</strong></td>
        <td style="border: 1px solid #000; padding: 8px;">${project.tahunAkademik}</td>
      </tr>
      ${project.githubRepoUrl ? `
      <tr>
        <td style="border: 1px solid #000; padding: 8px; background: #f0f0f0;"><strong>Repository GitHub</strong></td>
        <td style="border: 1px solid #000; padding: 8px;">${project.githubRepoUrl}</td>
      </tr>
      ` : ''}
      ${project.productionUrl ? `
      <tr>
        <td style="border: 1px solid #000; padding: 8px; background: #f0f0f0;"><strong>URL Production</strong></td>
        <td style="border: 1px solid #000; padding: 8px;">${project.productionUrl}</td>
      </tr>
      ` : ''}
    </table>

    <h4 style="margin-top: 20px;">B. TIM PENGEMBANG</h4>
    <table>
      <thead>
        <tr>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">No</th>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">Nama</th>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">NIM</th>
          <th style="border: 1px solid #000; padding: 8px; background: #f0f0f0;">Jabatan</th>
        </tr>
      </thead>
      <tbody>
        ${membersRows}
      </tbody>
    </table>

    <h4 style="margin-top: 20px;">C. ITEM YANG DISERAHKAN</h4>
    <table>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">☐</td>
        <td style="border: 1px solid #000; padding: 8px;">Source code lengkap (via GitHub/Repository)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">☐</td>
        <td style="border: 1px solid #000; padding: 8px;">Dokumentasi teknis (README, API docs, dll)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">☐</td>
        <td style="border: 1px solid #000; padding: 8px;">Database schema dan migration files</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">☐</td>
        <td style="border: 1px solid #000; padding: 8px;">Kredensial testing (username & password)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">☐</td>
        <td style="border: 1px solid #000; padding: 8px;">Akses deployment (jika ada)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">☐</td>
        <td style="border: 1px solid #000; padding: 8px;">Laporan akhir project</td>
      </tr>
    </table>

    <h4 style="margin-top: 20px;">D. KETENTUAN PENGGUNAAN</h4>
    <ol style="margin-left: 20px;">
      <li>Project ini dapat digunakan sebagai bahan pembelajaran bagi mahasiswa selanjutnya</li>
      <li>Modifikasi dan pengembangan diperbolehkan dengan mencantumkan kredit kepada pengembang asli</li>
      <li>Penggunaan untuk tujuan komersial memerlukan izin tertulis dari pengembang asli</li>
      <li>Program Studi berhak menyimpan dan mengarsipkan project ini</li>
    </ol>
  </div>

  <div class="signature-section">
    <div style="margin-top: 30px;">
      <div class="signature-box">
        <p><strong>PIHAK PERTAMA</strong><br>(Yang Menyerahkan)</p>
        <div class="signature-line">
          <p>(${project.mahasiswa.name})</p>
          <p>NIM: ${project.mahasiswa.nim || '_______________'}</p>
        </div>
      </div>
      <div class="signature-box" style="float: right;">
        <p><strong>PIHAK KEDUA</strong><br>(Yang Menerima)</p>
        <div class="signature-line">
          <p>(____________________________)</p>
          <p>Koordinator Program Studi</p>
        </div>
      </div>
    </div>
  </div>

  <div style="clear: both; margin-top: 100px; font-size: 10pt; color: #666; text-align: center;" class="no-print">
    <hr style="border: none; border-top: 1px dashed #ccc; margin: 20px 0;">
    <p>Dokumen ini di-generate secara otomatis oleh Sistem Capstone UIM</p>
  </div>
</body>
</html>
  `;
}

function generateDeclarationTemplate(
  project: ProjectData,
  teamMembers: TeamMember[],
  currentDate: string
): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Pernyataan Keaslian Karya</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .institution {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .title {
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 30px 0 20px;
      text-align: center;
    }
    .content {
      text-align: justify;
      margin-bottom: 20px;
    }
    .data-table td {
      padding: 5px 10px;
      vertical-align: top;
    }
    .signature-section {
      margin-top: 50px;
      text-align: right;
    }
    .signature-line {
      margin-top: 80px;
      display: inline-block;
      text-align: center;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
  
  <div class="header">
    <div class="institution">UNIVERSITAS ISLAM MAKASSAR</div>
    <div class="faculty">FAKULTAS TEKNIK</div>
    <div class="faculty">PROGRAM STUDI TEKNIK INFORMATIKA</div>
  </div>

  <div class="title">
    SURAT PERNYATAAN KEASLIAN KARYA
  </div>

  <div class="content">
    <p>Yang bertanda tangan di bawah ini:</p>
    
    <table class="data-table" style="margin: 20px 0 20px 30px;">
      <tr>
        <td>Nama</td>
        <td>:</td>
        <td><strong>${project.mahasiswa.name}</strong></td>
      </tr>
      <tr>
        <td>NIM</td>
        <td>:</td>
        <td><strong>${project.mahasiswa.nim || '_______________'}</strong></td>
      </tr>
      <tr>
        <td>Program Studi</td>
        <td>:</td>
        <td>Teknik Informatika</td>
      </tr>
      <tr>
        <td>Judul Project</td>
        <td>:</td>
        <td><strong>${project.title}</strong></td>
      </tr>
    </table>

    <p>Dengan ini menyatakan bahwa:</p>

    <ol style="margin-left: 20px;">
      <li style="margin-bottom: 15px;">
        Project capstone yang saya kerjakan ini adalah hasil karya saya sendiri dan bukan jiplakan dari karya orang lain kecuali yang telah disebutkan sumbernya.
      </li>
      <li style="margin-bottom: 15px;">
        Apabila di kemudian hari terbukti bahwa project ini merupakan hasil jiplakan atau plagiarisme, maka saya bersedia menerima sanksi akademik sesuai dengan ketentuan yang berlaku di Universitas Islam Makassar.
      </li>
      <li style="margin-bottom: 15px;">
        Saya memberikan izin kepada Universitas Islam Makassar untuk menyimpan, mengalihkan bentuk, mengelola dalam bentuk pangkalan data (database), mendistribusikan, dan mempublikasikan project ini untuk kepentingan akademis.
      </li>
      <li style="margin-bottom: 15px;">
        Saya memberikan izin kepada mahasiswa angkatan selanjutnya untuk mempelajari, memodifikasi, dan mengembangkan project ini dengan ketentuan wajib mencantumkan kredit kepada pengembang asli.
      </li>
    </ol>

    <p>Demikian pernyataan ini saya buat dengan sebenar-benarnya.</p>
  </div>

  <div class="signature-section">
    <p>Makassar, ${currentDate}</p>
    <p>Yang membuat pernyataan,</p>
    
    <div class="signature-line">
      <p style="margin-top: 70px;">Materai Rp10.000</p>
      <br><br>
      <p style="border-top: 1px solid #000; padding-top: 5px;">
        <strong>(${project.mahasiswa.name})</strong><br>
        NIM: ${project.mahasiswa.nim || '_______________'}
      </p>
    </div>
  </div>

  ${teamMembers.length > 1 ? `
  <div style="margin-top: 50px; page-break-before: auto;">
    <p><strong>Anggota Tim (turut menyatakan):</strong></p>
    ${teamMembers.slice(1).map((m, i) => `
      <div style="display: inline-block; width: 45%; text-align: center; margin-top: 30px; ${i % 2 === 1 ? 'float: right;' : ''}">
        <div style="margin-top: 60px; border-top: 1px solid #000; display: inline-block; padding-top: 5px;">
          <p>(${m.name})<br>NIM: ${m.nim}</p>
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div style="clear: both; margin-top: 100px; font-size: 10pt; color: #666; text-align: center;" class="no-print">
    <hr style="border: none; border-top: 1px dashed #ccc; margin: 20px 0;">
    <p>Dokumen ini di-generate secara otomatis oleh Sistem Capstone UIM</p>
  </div>
</body>
</html>
  `;
}
