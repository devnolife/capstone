// Data kode untuk hero & panel API — konten diadaptasi ke alur platform capstone.
// Format token mengikuti tema asli (warna persis dari palet daytona.css).
import type { DayCodeLine, DayCodeToken } from '@/types/daytona';

/* helper token: keyword, func, class, string, punct, comment, number, text */
const kw = (t: string): DayCodeToken => ({ t, color: '#00bbff' });
const fn = (t: string): DayCodeToken => ({ t, color: '#77dddd' });
const cls = (t: string): DayCodeToken => ({ t, color: '#ffcc66' });
const str = (t: string): DayCodeToken => ({ t, color: '#bb88ff' });
const p = (t: string): DayCodeToken => ({ t, color: '#999999' });
const cm = (t: string): DayCodeToken => ({ t, color: '#666666' });
const num = (t: string): DayCodeToken => ({ t, color: '#f3be4e' });
const tx = (t: string): DayCodeToken => ({ t });

export interface DayHeroLangData {
  id: string;
  label: string;
  icon: string;
  installCommand: string;
  code: DayCodeLine[];
}

export const dayHeroLanguages: DayHeroLangData[] = [
  {
    id: 'python',
    label: 'Python',
    icon: '/images/daytona/eHyKWAkdbys01ub7RVylHYsTKAU.png',
    installCommand: 'pip install -r requirements.txt',
    code: [
      [kw('from'), tx(' capstone '), kw('import'), tx(' Platform')],
      [],
      [tx('capstone = '), cls('Platform'), p('('), tx('team'), p('='), str('"tim-alpha"'), p(')')],
      [tx('repo = capstone.'), fn('link_repo'), p('('), str('"github.com/tim-alpha/smart-campus"'), p(')')],
      [],
      [tx('submission = capstone.'), fn('submit'), p('(')],
      [tx('    title'), p('='), str('"Smart Campus IoT"'), p(',')],
      [tx('    semester'), p('='), str('"Ganjil 2025/2026"'), p(',')],
      [p(')')],
      [cls('print'), p('('), tx('submission.'), fn('status'), p(')')],
      [cm('# >> "Menunggu review dosen penguji"')],
    ],
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    icon: '/images/daytona/PpEE7yln9YcKl7brampBvxlEU.png',
    installCommand: 'npx create-next-app@latest proyek-capstone',
    code: [
      [kw('import'), tx(' { Platform } '), kw('from'), tx(' '), str('"@capstone/sdk"'), p(';')],
      [],
      [kw('const'), tx(' capstone = '), kw('new'), tx(' '), cls('Platform'), p('({'), tx(' team: '), str('"tim-alpha"'), tx(' '), p('});')],
      [],
      [kw('const'), tx(' repo = '), kw('await'), tx(' capstone.'), fn('linkRepo'), p('(')],
      [tx('  '), str('"github.com/tim-alpha/smart-campus"'), p(',')],
      [p(');')],
      [],
      [kw('const'), tx(' submission = '), kw('await'), tx(' capstone.'), fn('submit'), p('({')],
      [tx('  title: '), str('"Smart Campus IoT"'), p(',')],
      [tx('  semester: '), str('"Ganjil 2025/2026"'), p(',')],
      [p('});')],
      [],
      [tx('console.'), fn('log'), p('('), tx('submission.status'), p(');')],
      [cm('// => "Menunggu review dosen penguji"')],
    ],
  },
  {
    id: 'go',
    label: 'Go',
    icon: '/images/daytona/KAAbmJXx3yoWFqSOb0mGies.png',
    installCommand: 'go mod init github.com/tim-alpha/capstone',
    code: [
      [kw('package'), tx(' main')],
      [],
      [kw('import'), tx(' '), str('"github.com/prodi-if/capstone-go"')],
      [],
      [kw('func'), tx(' '), fn('main'), p('()'), tx(' '), p('{')],
      [tx('    platform := capstone.'), fn('New'), p('('), str('"tim-alpha"'), p(')')],
      [tx('    platform.'), fn('LinkRepo'), p('('), str('"github.com/tim-alpha/smart-campus"'), p(')')],
      [],
      [tx('    submission, err := platform.'), fn('Submit'), p('('), tx('capstone.'), cls('Project'), p('{')],
      [tx('        Title:    '), str('"Smart Campus IoT"'), p(',')],
      [tx('        Semester: '), str('"Ganjil 2025/2026"'), p(',')],
      [tx('    '), p('})')],
      [tx('    '), kw('if'), tx(' err != '), kw('nil'), tx(' '), p('{')],
      [tx('        log.'), fn('Fatal'), p('('), tx('err'), p(')')],
      [tx('    '), p('}')],
      [tx('    fmt.'), fn('Println'), p('('), tx('submission.Status'), p(')')],
      [p('}')],
    ],
  },
  {
    id: 'java',
    label: 'Java',
    icon: '/images/daytona/ku6EsScYdIgwQD3YLbPdaAWThGo.png',
    installCommand: './gradlew init --type java-application',
    code: [
      [kw('import'), tx(' io.capstone.'), cls('Platform'), p(';')],
      [],
      [kw('public class'), tx(' '), cls('Main'), tx(' '), p('{')],
      [tx('    '), kw('public static void'), tx(' '), fn('main'), p('('), cls('String'), p('[]'), tx(' args'), p(')'), tx(' '), p('{')],
      [tx('        '), cls('Platform'), tx(' capstone = '), kw('new'), tx(' '), cls('Platform'), p('('), str('"tim-alpha"'), p(');')],
      [tx('        capstone.'), fn('linkRepo'), p('('), str('"github.com/tim-alpha/smart-campus"'), p(');')],
      [],
      [tx('        '), cls('Submission'), tx(' submission = capstone.'), fn('submit'), p('(')],
      [tx('            '), kw('new'), tx(' '), cls('Project'), p('('), str('"Smart Campus IoT"'), p(','), tx(' '), str('"Ganjil 2025/2026"'), p(')')],
      [tx('        '), p(');')],
      [tx('        '), cls('System'), p('.'), tx('out.'), fn('println'), p('('), tx('submission.'), fn('getStatus'), p('());')],
      [tx('    '), p('}')],
      [p('}')],
    ],
  },
];

/* Panel "Alur Kerja" — 4 tab: submit / review / progress / nilai */
export const dayApiCode: Record<string, DayCodeLine[]> = {
  process: [
    [cm('# Kumpulkan project langsung dari repository GitHub')],
    [tx('$ git push capstone main')],
    [],
    [tx('> Memvalidasi struktur repository...      '), fn('OK')],
    [tx('> Memeriksa README & dokumentasi...       '), fn('OK')],
    [tx('> Menjalankan build check...              '), fn('OK')],
    [],
    [tx('submission = capstone.'), fn('submit'), p('(')],
    [tx('    repo'), p('='), str('"tim-alpha/smart-campus"'), p(',')],
    [tx('    milestone'), p('='), num('3'), p(',')],
    [p(')')],
    [],
    [cls('print'), p('('), tx('submission.'), fn('id'), p(')'), tx('       '), cm('# CPS-2025-042')],
    [cls('print'), p('('), tx('submission.'), fn('status'), p(')'), tx('   '), cm('# "Menunggu review"')],
    [],
    [cm('# Notifikasi otomatis terkirim ke dosen penguji')],
    [tx('> Dosen penguji: '), str('"Dr. Lukman, M.Kom"')],
    [tx('> Estimasi review: '), num('2'), tx(' hari kerja')],
  ],
  git: [
    [cm('# Review kode langsung pada baris yang dimaksud')],
    [tx('review = submission.'), fn('request_review'), p('()')],
    [],
    [kw('for'), tx(' komentar '), kw('in'), tx(' review.'), fn('comments'), p('('), p(')'), p(':')],
    [tx('    '), cls('print'), p('('), tx('komentar.'), fn('format'), p('()'), p(')')],
    [],
    [cm('# src/services/sensor.py - baris 42')],
    [tx('> '), str('"Pisahkan logika kalibrasi ke modul sendiri"')],
    [tx('>   - Dr. Lukman '), p('·'), tx(' '), num('2'), tx(' jam lalu')],
    [],
    [cm('# src/api/routes.py - baris 118')],
    [tx('> '), str('"Tambahkan validasi input di endpoint ini"')],
    [tx('>   - Ir. Hasanuddin '), p('·'), tx(' '), num('5'), tx(' jam lalu')],
    [],
    [tx('review.'), fn('reply'), p('('), str('"Siap, segera diperbaiki"'), p(')')],
    [tx('submission.'), fn('resubmit'), p('('), tx('after_revision'), p('='), kw('True'), p(')')],
  ],
  fs: [
    [cm('# Pantau progress dan kontribusi setiap anggota tim')],
    [tx('progress = project.'), fn('progress'), p('()')],
    [],
    [cls('print'), p('('), tx('progress.'), fn('summary'), p('()'), p(')')],
    [],
    [tx('> Milestone       : '), num('3'), tx('/'), num('4'), tx('  '), p('['), fn('███████░░'), p(']'), tx(' '), num('78'), tx('%')],
    [tx('> Total commit    : '), num('247')],
    [tx('> Pull request    : '), num('31'), tx(' merged, '), num('2'), tx(' open')],
    [],
    [cm('# Kontribusi per anggota (30 hari terakhir)')],
    [tx('> andi.pratama    '), num('96'), tx(' commit  '), p('['), fn('█████████'), p(']')],
    [tx('> nurul.hikmah    '), num('84'), tx(' commit  '), p('['), fn('████████░'), p(']')],
    [tx('> muh.fadel       '), num('67'), tx(' commit  '), p('['), fn('██████░░░'), p(']')],
    [],
    [tx('project.'), fn('notify_team'), p('('), str('"Milestone 4 tenggat pekan depan"'), p(')')],
  ],
  lsp: [
    [cm('# Penilaian berbasis rubrik, transparan sejak awal')],
    [tx('nilai = submission.'), fn('grade_report'), p('()')],
    [],
    [kw('for'), tx(' kriteria '), kw('in'), tx(' nilai.'), fn('rubric'), p('()'), p(':')],
    [tx('    '), cls('print'), p('('), tx('kriteria'), p(')')],
    [],
    [tx('> Proposal & tema        '), num('10'), tx('%   '), fn('88')],
    [tx('> Milestone 1-3          '), num('40'), tx('%   '), fn('85')],
    [tx('> Kualitas kode          '), num('10'), tx('%   '), fn('90')],
    [tx('> Laporan akhir          '), num('15'), tx('%   '), fn('87')],
    [tx('> Sidang & demo          '), num('25'), tx('%   '), fn('89')],
    [],
    [cls('print'), p('('), tx('nilai.'), fn('final'), p(')'), tx('    '), cm('# 87.4 (A)')],
    [],
    [cm('# Nilai individual per anggota (kontribusi + sidang)')],
    [tx('> andi.pratama    '), fn('89'), tx('   nurul.hikmah   '), fn('88')],
    [tx('> muh.fadel       '), fn('85')],
    [],
    [tx('> Status: '), str('"LULUS"'), tx('  (repo di-fork ke org prodi)')],
  ],
};
