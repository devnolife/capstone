'use client';

import { useState } from 'react';

import { PlusIcon } from '@/components/daytona/icons';

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Apa itu platform Capstone Informatika?',
    answer:
      'Platform ini adalah sistem terpadu untuk mengelola seluruh siklus capstone project mahasiswa Prodi Informatika: mulai dari pengajuan tema, pengumpulan project, review kode oleh dosen, hingga penilaian akhir. Semua proses terhubung langsung dengan repository GitHub tim, sehingga progress pengembangan terpantau secara real-time.',
  },
  {
    question: 'Bagaimana cara mengumpulkan project?',
    answer:
      'Hubungkan repository GitHub tim ke platform, lengkapi detail project (judul, deskripsi, anggota tim), lalu submit. Platform otomatis memvalidasi struktur repository, README, dan menjalankan build check. Setelah terkumpul, dosen penguji langsung mendapat notifikasi untuk mulai mereview.',
  },
  {
    question: 'Apakah wajib menggunakan GitHub?',
    answer:
      'Ya. GitHub adalah tulang punggung platform ini: riwayat commit, kontribusi anggota tim, dan review kode semuanya bersumber dari repository. Ini sekaligus melatih kalian bekerja dengan workflow yang sama seperti engineer profesional: branch, pull request, dan code review.',
  },
  {
    question: 'Berapa anggota per tim capstone?',
    answer:
      'Ketentuan jumlah anggota tim mengikuti kebijakan koordinator capstone tiap semester (umumnya 3-5 mahasiswa). Kontribusi setiap anggota terlihat dari statistik commit dan aktivitas di repository, sehingga pembagian kerja dalam tim tetap adil dan terukur.',
  },
  {
    question: 'Bagaimana sistem penilaiannya?',
    answer:
      'Penilaian menggunakan rubrik terstandar dengan bobot yang terlihat sejak awal semester: proposal, milestone pengembangan, kualitas kode, laporan akhir, dan sidang. Beberapa dosen penguji menilai secara paralel, lalu nilai akhir dihitung otomatis sesuai bobot masing-masing kriteria.',
  },
  {
    question: 'Bagaimana jika project diminta revisi?',
    answer:
      'Dosen meninggalkan catatan revisi langsung di platform, termasuk komentar inline pada baris kode tertentu. Perbaiki sesuai catatan, push perubahan ke repository, lalu submit ulang. Riwayat semua versi submission tersimpan, sehingga perkembangan revisi bisa dilacak dan dibandingkan.',
  },
  {
    question: 'Dokumen apa saja yang harus diunggah?',
    answer:
      'Selain repository kode, tiap tim mengunggah proposal, dokumen BAB 1-5, laporan akhir, slide presentasi, dan dokumen stakeholder (surat persetujuan, foto kegiatan) bila project bermitra. Semua berkas tersimpan terpusat per project, sehingga dosen dan admin mengaksesnya dari tempat yang sama tanpa kirim ulang via email.',
  },
  {
    question: 'Apa yang terjadi setelah project lulus?',
    answer:
      'Setelah dinyatakan lulus sidang, repository project di-fork ke organisasi GitHub prodi sebagai arsip resmi dan portofolio. Project terbaik dapat dipamerkan ke angkatan berikutnya sebagai referensi, dan kamu tetap memegang repository asli di akun pribadimu.',
  },
];

export function DayFaq() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems((previous) => {
      const next = new Set(previous);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section id="faq" className="day-container py-16 scroll-mt-16">
      <div className="grid grid-cols-1 min-[810px]:grid-cols-[416px_1fr]">
        <div className="mb-8 pt-6 pr-10 min-[810px]:mb-0">
          <h2 className="font-day-sans text-[32px] leading-[38.4px] text-white">
            FAQ
          </h2>
          <p className="mt-4 font-day-sans text-[14px] leading-[22.4px] tracking-[-0.14px] text-[#a2a2a2]">
            Masih ada pertanyaan lain?
            <br />
            Hubungi koordinator capstone atau admin prodi. Dengan senang hati
            kami bantu.
          </p>
        </div>
        <div className="border-b border-[#252525]">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openItems.has(index);
            return (
              <div key={item.question} className="border-t border-[#252525]">
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  className="group flex w-full cursor-pointer items-center gap-6 py-6 pr-8 text-left"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-[4px] border border-[#252525]">
                    <PlusIcon
                      className={`size-3.5 text-[#a2a2a2] transition-transform duration-300 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    />
                  </span>
                  <span className="font-day-mono text-[16px] leading-[22px] text-white">
                    {item.question}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pr-12 pb-6 font-day-sans text-[16px] leading-[25.6px] text-[#a2a2a2]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
