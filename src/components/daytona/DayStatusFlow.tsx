// Lifecycle status project — mengikuti enum ProjectStatus di prisma/schema.prisma
// (DRAFT → SUBMITTED → IN_REVIEW → REVISION_NEEDED → READY_FOR_PRESENTATION
//  → PRESENTATION_SCHEDULED → APPROVED)

type StatusStep = {
  index: string;
  label: string;
  body: string;
  chipClass: string;
};

const STEPS: StatusStep[] = [
  {
    index: '01',
    label: 'DRAFT',
    body: 'Project dibuat. Tim, tema, dan repository disiapkan.',
    chipClass: 'border-[#585858] text-[#a2a2a2]',
  },
  {
    index: '02',
    label: 'TERKUMPUL',
    body: 'Submission masuk, validasi repository berjalan otomatis.',
    chipClass: 'border-[#0080ff]/60 text-[#59acff]',
  },
  {
    index: '03',
    label: 'DIREVIEW',
    body: 'Dosen penguji memeriksa kode dan dokumen tim.',
    chipClass: 'border-[#0080ff]/60 text-[#59acff]',
  },
  {
    index: '04',
    label: 'PERLU REVISI',
    body: 'Catatan perbaikan dikirim. Perbaiki lalu submit ulang.',
    chipClass: 'border-[#f3be4e]/60 text-[#f3be4e]',
  },
  {
    index: '05',
    label: 'SIAP SIDANG',
    body: 'Dosen ACC. Project menunggu penjadwalan sidang.',
    chipClass: 'border-[#2ecc71]/50 text-[#2ecc71]/80',
  },
  {
    index: '06',
    label: 'SIDANG TERJADWAL',
    body: 'Admin menetapkan jadwal, ruangan, dan penguji sidang.',
    chipClass: 'border-[#2ecc71]/50 text-[#2ecc71]/80',
  },
  {
    index: '07',
    label: 'LULUS',
    body: 'Nilai final terbit. Repo di-fork ke organisasi prodi.',
    chipClass: 'border-[#2ecc71] text-[#2ecc71]',
  },
];

export function DayStatusFlow() {
  return (
    <section id="status" className="day-container py-[60px] scroll-mt-16">
      <p className="flex flex-wrap items-center justify-between gap-2 border-y border-[#252525] px-6 py-[18px] font-day-mono text-[14px] leading-[16.8px] tracking-[-0.28px] text-[#a2a2a2]">
        <span>Lifecycle project, dari draft sampai lulus</span>
        <span className="hidden text-[#585858] min-[810px]:block">
          status realtime di dashboard
        </span>
      </p>
      <div className="grid grid-cols-1 gap-px border-b border-[#252525] bg-[#252525] min-[810px]:grid-cols-7">
        {STEPS.map((step) => (
          <div
            key={step.label}
            className="group flex min-h-[104px] flex-col gap-3 bg-[#0a0a0a] p-5 min-[810px]:min-h-[190px]"
          >
            <span className="font-day-mono text-[12px] leading-3 text-[#585858]">
              {step.index}
            </span>
            <span
              className={`inline-flex w-fit items-center rounded-[6px] border px-2.5 py-1.5 font-day-mono text-[11px] uppercase leading-none tracking-[0.22px] ${step.chipClass}`}
            >
              {step.label}
            </span>
            <p className="font-day-sans text-[13px] leading-[19px] tracking-[-0.13px] text-[#a2a2a2]">
              {step.body}
            </p>
          </div>
        ))}
      </div>
      <p className="px-6 py-4 font-day-mono text-[12px] leading-[18px] text-[#585858]">
        <span className="text-[#f3be4e]">↺</span> Perlu revisi? Alur kembali ke
        step 02, dan riwayat setiap versi submission tetap tersimpan.
      </p>
    </section>
  );
}
