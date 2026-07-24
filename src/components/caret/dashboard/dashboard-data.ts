// Mock data for the Capstone dashboard demo (no backend).

export interface Stat {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export interface DayActivity {
  day: string;
  meetings: number;
}

export interface Meeting {
  title: string;
  time: string;
  duration: string;
  platform: "repo" | "online" | "kampus" | "dokumen";
  status: "Rekap siap" | "Tercatat" | "Berlangsung" | "Terjadwal";
}

export interface Suggestion {
  question: string;
  sourceLabel: string;
  answer: string;
  citations: { image: string; title: string; subtitle: string }[];
}

export const STATS: Stat[] = [
  { label: "PROJECT AKTIF", value: "12", delta: "+3 vs pekan lalu", positive: true },
  { label: "REVISI DITANGGAPI", value: "28", delta: "+9 vs pekan lalu", positive: true },
  { label: "COMMIT BARU", value: "47", delta: "+12 vs pekan lalu", positive: true },
  { label: "KELENGKAPAN PERSYARATAN", value: "92%", delta: "+1.4pt vs pekan lalu", positive: true },
];

export const WEEKLY_ACTIVITY: DayActivity[] = [
  { day: "SEN", meetings: 3 },
  { day: "SEL", meetings: 1 },
  { day: "RAB", meetings: 4 },
  { day: "KAM", meetings: 2 },
  { day: "JUM", meetings: 2 },
  { day: "SAB", meetings: 0 },
  { day: "MIN", meetings: 0 },
];

export const UP_NEXT: Meeting = {
  title: "Presentasi · Tim UMKM",
  time: "Hari ini · 09.30 WITA",
  duration: "45m",
  platform: "kampus",
  status: "Terjadwal",
};

export const UP_NEXT_BRIEF = {
  summary:
    "Presentasi akhir Tim UMKM Makassar. Review lalu membahas revisi fungsionalitas — catatan dosen penguji terlampir sebagai konteks.",
  facts: [
    ["Tim", "Tim UMKM"],
    ["Status", "Siap Presentasi"],
    ["Anggota", "Aldi, Nisa +2"],
    ["Fokus", "Deployment, keterlibatan stakeholder"],
  ] as const,
};

export const RECENT_MEETINGS: Meeting[] = [
  { title: "Tim UMKM (Siap Presentasi)", time: "Kemarin · 16.00", duration: "38m", platform: "kampus", status: "Rekap siap" },
  { title: "Review awal Tim Klinik Digital", time: "Kemarin · 11.00", duration: "26m", platform: "online", status: "Rekap siap" },
  { title: "Review kode Marketplace Tani", time: "Sen · 09.00", duration: "52m", platform: "repo", status: "Tercatat" },
  { title: "Verifikasi persyaratan Tim IoT", time: "Sen · 15.30", duration: "41m", platform: "dokumen", status: "Tercatat" },
];

export const SUGGESTIONS: Suggestion[] = [
  {
    question: "Q. Deploy di Vercel dapat bonus poin berapa?",
    sourceLabel: "Jawaban ditemukan dari rubrik dan catatan review",
    answer: "Vercel termasuk auto-managed: bonus 5 poin. Deploy manual di VPS + Nginx dapat 15 poin.",
    citations: [
      {
        image: "/logo.png",
        title: "Rubrik Penilaian Capstone",
        subtitle: "rubrik-capstone.pdf",
      },
      {
        image: "/images/caret/minibar-citation-profile.png",
        title: "Review dari Dosen Penguji",
        subtitle: "Catatan review \u22C5 2 pekan lalu",
      },
    ],
  },
  {
    question: "Q. Bagaimana menanggapi catatan review?",
    sourceLabel: "Jawaban lampau dari Tim UMKM (Disetujui)",
    answer:
      "Tanggapi tiap komentar inline langsung di kodenya dan lampirkan commit perbaikan — tim yang begitu biasanya ACC lebih cepat.",
    citations: [
      {
        image: "/images/caret/minibar-citation-profile2.png",
        title: "Tim UMKM Makassar",
        subtitle: "Riwayat review \u22C5 2 pekan lalu",
      },
    ],
  },
];

export const PLATFORM_LABELS: Record<Meeting["platform"], string> = {
  repo: "Repository",
  online: "Online",
  kampus: "Kampus",
  dokumen: "Dokumen",
};
