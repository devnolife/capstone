import { SnapshotIcon } from '@/components/daytona/icons';

type CardHeaderProps = {
  title: string;
  body: string;
};

function CardHeader({ title, body }: CardHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="font-day-sans text-[20px] leading-6 text-white">{title}</h3>
      <p className="font-day-sans text-[16px] leading-[25.6px] tracking-[-0.32px] text-[#a2a2a2]">
        {body}
      </p>
    </div>
  );
}

const TIMELINE_BARS = [
  'h-[14px]',
  'h-[14px]',
  'h-[16px]',
  'h-[16px]',
  'h-[16px]',
  'h-[18px]',
  'h-[20px]',
  'h-[22px]',
  'h-[24px]',
  'h-[22px]',
  'h-[20px]',
  'h-[18px]',
  'h-[16px]',
  'h-[16px]',
  'h-[16px]',
  'h-[14px]',
  'h-[14px]',
];

const ACCESS_CHIPS = [
  { label: 'Kampus Unismuh', position: 'left-[4%] top-[16%]' },
  { label: 'Lab Informatika', position: 'left-[36%] top-[36%]' },
  { label: 'Perpustakaan', position: 'left-[-2%] top-[56%]' },
  { label: 'Rumah', position: 'right-[-6%] top-[50%]' },
  { label: 'Kafe & Warkop', position: 'left-[28%] top-[76%]' },
];

function SubmissionStack() {
  return (
    <div className="flex flex-col items-center">
      <div className="z-[1] h-[90px] w-[154px] rounded-[12px] border border-[#252525] bg-[#0a0a0a] opacity-35" />
      <div className="z-[2] mt-[-80px] h-[90px] w-[154px] rounded-[12px] border border-[#252525] bg-[#0a0a0a] opacity-50" />
      <div className="z-[3] mt-[-80px] h-[90px] w-[196px] rounded-[12px] border border-[#252525] bg-[#0a0a0a] opacity-70" />
      <div className="z-[4] mt-[-80px] flex h-[90px] w-[238px] flex-col gap-2 rounded-[12px] border border-[#252525] bg-[#0a0a0a] px-4 pt-1.5 opacity-85">
        <div className="flex items-center gap-2">
          <SnapshotIcon className="size-6 shrink-0 text-white" />
          <span className="font-day-sans text-[16px] text-white">Submission v2</span>
        </div>
        <span className="font-day-mono text-[12px] uppercase text-[#a2a2a2]">PERLU REVISI</span>
      </div>
      <div className="z-[5] mt-[-80px] flex h-[90px] w-[280px] flex-col gap-2 rounded-[12px] border border-[#252525] bg-[#0a0a0a] p-4 pt-[18px]">
        <div className="flex items-center gap-2">
          <SnapshotIcon className="size-6 shrink-0 text-white" />
          <span className="font-day-sans text-[16px] text-white">Submission v3</span>
        </div>
        <span className="font-day-mono text-[12px] uppercase text-[#2ecc71]">REVISI DITERIMA</span>
      </div>
    </div>
  );
}

function SubmissionTimeline() {
  return (
    <div className="mt-6 flex flex-col">
      <div className="flex items-end justify-center gap-[14px]">
        {TIMELINE_BARS.map((height, index) => (
          <div
            key={index}
            className={`w-[2px] ${height} ${index === 8 ? 'bg-[#2ecc71]' : 'bg-[#252525]'}`}
          />
        ))}
      </div>
      <span className="mt-6 text-center font-day-mono text-[14px] uppercase text-[#a2a2a2]">
        01/12/2025
      </span>
    </div>
  );
}

export function DayMoreThanSandbox() {
  return (
    <section className="day-container flex flex-col gap-16 py-20">
      <h2 className="font-day-sans text-[32px] font-medium leading-[38.4px]">
        <span className="block text-[#a2a2a2]">Lebih dari Kumpul Tugas.</span>
        <span className="block text-white">Platform yang Capstone Benar-Benar Butuhkan.</span>
      </h2>

      <div className="grid gap-px border-y border-[#252525] bg-[#252525] md:grid-cols-3">
        {/* Card 1 — Riwayat submission */}
        <div className="flex min-h-[560px] flex-col gap-8 bg-[#0a0a0a] p-8">
          <div className="flex flex-1 flex-col items-center justify-center">
            <SubmissionStack />
            <SubmissionTimeline />
          </div>
          <CardHeader
            title="Riwayat Versi Submission"
            body="Setiap Pengumpulan Tersimpan, Bisa Dilacak, dan Bisa Dibandingkan"
          />
        </div>

        {/* Card 2 — Akses dari mana saja */}
        <div className="flex min-h-[560px] flex-col gap-8 bg-[#0a0a0a] p-8">
          <div className="flex flex-1 items-center justify-center">
            <div className="relative h-[315px] w-[315px]">
              <img
                src="/images/daytona/pKSLIE77SwYCPlLJgKl0kn4fjQ.png"
                width={315}
                height={315}
                alt=""
              />
              {/* radar ping rings over the baked-in pins */}
              {[
                { left: '26%', top: '29%', delay: '0s', size: 26 },
                { left: '46%', top: '45%', delay: '0.5s', size: 34 },
                { left: '26%', top: '51%', delay: '1s', size: 24 },
                { left: '74%', top: '57%', delay: '1.4s', size: 30 },
                { left: '58%', top: '61%', delay: '0.8s', size: 22 },
              ].map((pin, i) => (
                <span
                  key={i}
                  className="day-anim-ping pointer-events-none absolute rounded-full border border-[#2ecc71]"
                  style={{
                    left: pin.left,
                    top: pin.top,
                    width: pin.size,
                    height: pin.size,
                    marginLeft: -pin.size / 2,
                    marginTop: -pin.size / 2,
                    animationDelay: pin.delay,
                  }}
                />
              ))}
              {ACCESS_CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className={`absolute ${chip.position} whitespace-nowrap rounded-[4px] border border-[#252525] bg-[#0a0a0a] px-2 py-1.5 font-day-mono text-[11px] text-[#a2a2a2]`}
                >
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
          <CardHeader
            title="Akses dari Mana Saja"
            body="Web-Based Tanpa Instalasi. Buka dari Laptop, Lab, atau HP."
          />
        </div>

        {/* Column 3 — two stacked short cards */}
        <div className="flex flex-col gap-px bg-[#252525]">
          {/* Card 3 — Progress tersimpan */}
          <div className="flex h-[280px] flex-col gap-8 bg-[#0a0a0a] p-8">
            <div className="flex h-[105px] items-center justify-center">
              {/* approximated illustration */}
              <div className="relative flex">
                <div className="size-[92px] rounded-full border border-dashed border-[#585858]" />
                <div className="-ml-6 size-[92px] rounded-full border border-dashed border-[#585858]" />
                <svg
                  viewBox="0 0 92 92"
                  width={92}
                  height={92}
                  fill="none"
                  aria-hidden="true"
                  className="absolute left-0 top-0 size-[92px] drop-shadow-[0_0_6px_rgba(46,204,113,0.6)]"
                >
                  <path
                    d="M 12 74 A 44 44 0 0 0 80 74"
                    stroke="#2ecc71"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <CardHeader
              title="Progress Tersimpan Otomatis"
              body="Draft, Komentar, dan Nilai Tersimpan Real-Time. Tidak Ada yang Hilang."
            />
          </div>

          {/* Card 4 — Dokumen terpusat */}
          <div className="flex h-[280px] flex-col gap-8 bg-[#0a0a0a] p-8">
            <div className="flex h-[105px] flex-col items-center justify-center">
              <img
                src="/images/daytona/uSfNnJgLeb4VNwqVNr2jb72CIBI.svg"
                width={125}
                height={40}
                alt=""
                className="relative z-[3]"
              />
              <img
                src="/images/daytona/AT3AzjWBVe8VUDZufqHvZttzwa4.svg"
                width={125}
                height={40}
                alt=""
                className="relative z-[2] mt-[-14px]"
              />
              <img
                src="/images/daytona/XFIYOlT3XeotWH8GzAgRNnJODto.svg"
                width={125}
                height={40}
                alt=""
                className="relative z-[1] mt-[-14px]"
              />
            </div>
            <CardHeader
              title="Dokumen Terpusat"
              body="Proposal, Laporan, dan Berkas Sidang Satu Tempat untuk Semua Tim"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
