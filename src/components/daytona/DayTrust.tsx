import { ArrowUpRightIcon } from '@/components/daytona/icons';

type CardCopyProps = {
  title: string;
  body: string;
};

function CardCopy({ title, body }: CardCopyProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-day-sans text-[20px] leading-[24px] text-white">
        {title}
      </h3>
      <p className="font-day-sans text-[16px] leading-[24px] tracking-[-0.16px] text-[#a2a2a2]">
        {body}
      </p>
    </div>
  );
}

const STANDARD_BADGES = ['OBE', 'SN-DIKTI', 'KKNI'] as const;

export function DayTrust() {
  return (
    <section className="day-container flex flex-col gap-16 py-20">
      {/* Heading row */}
      <div className="flex flex-col items-start gap-6 min-[810px]:flex-row min-[810px]:justify-between">
        <h2 className="font-day-sans text-[32px] font-normal leading-[38.4px]">
          <span className="block text-white">Transparan dan Terpercaya.</span>
          <span className="block text-[#a2a2a2]">
            Rubrik Terbuka. Data Aman. Nilai Objektif.
          </span>
        </h2>
        <a
          href="mailto:informatika@unismuh.ac.id"
          className="flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-[4px] border border-[#252525] px-6 font-day-mono text-[16px] tracking-[-0.64px] text-white transition-colors hover:border-[#585858] hover:bg-[#161616]"
        >
          Hubungi Koordinator
          <ArrowUpRightIcon className="size-4" />
        </a>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-px border-y border-[#252525] bg-[#252525] min-[810px]:grid-cols-3">
        {/* Card 1 — Rubrik terbuka */}
        <article className="flex min-h-[392px] flex-col gap-8 bg-[#0a0a0a] p-8">
          <CardCopy
            title="Rubrik Penilaian Terbuka"
            body="Semua Kriteria dan Bobot Nilai Terlihat Sejak Awal. Tanpa Kejutan."
          />
          <div className="flex flex-1 items-center justify-center">
            <div className="relative h-[131px] w-[128px]">
              {/* solid keyhole outline */}
              <img
                src="/images/daytona/WrTMeuJoS2zIzZ7LlREa5FDO8.svg"
                width={112}
                height={109}
                alt=""
                className="absolute left-2 top-3"
              />
              {/* dashed overlay */}
              <img
                src="/images/daytona/fk4AjbifnauLdNiv1VSVxdkC8I.svg"
                width={112}
                height={109}
                alt=""
                className="absolute left-2 top-3"
              />
              {/* green scan line */}
              <div
                aria-hidden="true"
                className="absolute left-[-4px] right-[-4px] top-[38px] h-px bg-[#2ecc71] drop-shadow-[0_0_8px_rgba(46,204,113,0.8)]"
              />
              {/* glow above the scan line */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[18px] h-[24px] w-[100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(46,204,113,0.18),transparent_70%)]"
              />
            </div>
          </div>
        </article>

        {/* Card 2 — Data di kampus */}
        <article className="flex min-h-[392px] flex-col gap-8 bg-[#0a0a0a] p-8">
          <CardCopy
            title="Data Dikelola Program Studi"
            body="Project, nilai, dan berkas mahasiswa tersimpan di infrastruktur yang dikelola prodi. Tidak dibagikan ke pihak ketiga."
          />
          <div className="flex flex-1 items-center justify-center">
            {/* approximated illustration: green isometric cube + layered planes over glow base */}
            <div className="relative flex flex-col items-center">
              <svg
                viewBox="0 0 220 150"
                width={220}
                height={150}
                aria-hidden="true"
                className="block"
              >
                {/* layered planes behind cube (receding to the right) */}
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={i}
                    d={`M ${118 + i * 18} ${18 - i * 2} L ${170 + i * 18} ${44 - i * 2} L ${170 + i * 18} ${104 - i * 2} L ${118 + i * 18} ${78 - i * 2} Z`}
                    fill="none"
                    stroke="#2ecc71"
                    strokeWidth="0.8"
                    opacity={0.35 - i * 0.07}
                  />
                ))}
                {/* cube: top, left, right faces */}
                <path
                  d="M 60 38 L 118 10 L 162 32 L 104 60 Z"
                  fill="rgba(46,204,113,0.45)"
                  stroke="#2ecc71"
                  strokeWidth="1.2"
                />
                <path
                  d="M 60 38 L 104 60 L 104 116 L 60 94 Z"
                  fill="rgba(46,204,113,0.18)"
                  stroke="#2ecc71"
                  strokeWidth="1.2"
                />
                <path
                  d="M 104 60 L 162 32 L 162 88 L 104 116 Z"
                  fill="rgba(29,107,81,0.35)"
                  stroke="#2ecc71"
                  strokeWidth="1.2"
                />
              </svg>
              <img
                src="/images/daytona/w21VP918izfjjxygWd2ug78tc.png"
                width={200}
                height={85}
                alt=""
                className="-mt-10 h-auto w-[200px]"
              />
            </div>
          </div>
        </article>

        {/* Card 3 — Standar akademik */}
        <article className="flex min-h-[392px] flex-col bg-[#0a0a0a]">
          <div className="flex flex-col gap-2 p-6">
            <h3 className="font-day-mono text-[20px] leading-[28px] tracking-[-0.8px] text-white">
              Standar Akademik
            </h3>
            <p className="font-day-sans text-[16px] leading-6 tracking-[-0.16px] text-[#a2a2a2]">
              Rubrik dan Alur Mengikuti Kurikulum OBE serta Standar Penilaian
              SN-DIKTI.
            </p>
          </div>
          <div className="mt-auto flex items-center gap-6 p-6 pb-8">
            {STANDARD_BADGES.map((badge) => (
              <span
                key={badge}
                className="flex size-[82px] items-center justify-center rounded-full border border-dashed border-[#585858] text-center font-day-mono text-[13px] leading-tight text-[#a2a2a2]"
              >
                {badge}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
