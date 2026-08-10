import type { SVGProps } from 'react';

type CardHeaderProps = {
  title: string;
  body: string;
};

function CardHeader({ title, body }: CardHeaderProps) {
  return (
    <div className="flex flex-col gap-2 px-8 pb-9 pt-8">
      <h3 className="font-day-mono text-[20px] leading-[28px] tracking-[-0.8px] text-white">
        {title}
      </h3>
      <p className="font-day-sans text-[16px] leading-[24px] tracking-[-0.16px] text-[#a2a2a2]">
        {body}
      </p>
    </div>
  );
}

function ForkGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="10"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      aria-hidden="true"
      {...props}
    >
      <circle cx="3.2" cy="2.6" r="1.4" />
      <circle cx="8.8" cy="2.6" r="1.4" />
      <circle cx="6" cy="9.4" r="1.4" />
      <path d="M3.2 4v.6a2 2 0 0 0 2 2h1.6a2 2 0 0 0 2-2V4M6 6.6V8" />
    </svg>
  );
}

const CHIP_ROWS = [
  {
    label: 'SUBMIT',
    chipClass: 'border-[#2ecc71]/70 text-[#2ecc71]',
    withGlyph: true,
  },
  {
    label: 'REVIEW',
    chipClass: 'border-[#2ecc71]/70 text-[#2ecc71]',
    withGlyph: false,
  },
  {
    label: 'REVISI',
    chipClass: 'border-[#2ecc71]/40 text-[#2ecc71]/70',
    withGlyph: false,
  },
  {
    label: 'SIDANG',
    chipClass: 'border-[#2ecc71]/25 text-[#2ecc71]/50',
    withGlyph: false,
  },
  {
    label: 'LULUS',
    chipClass: 'border-[#2ecc71]/40 text-[#2ecc71]/60',
    withGlyph: false,
  },
] as const;

export function DayInfraCards() {
  return (
    <section id="fitur" className="day-container flex flex-col gap-16 py-20 scroll-mt-16">
      <h2 className="font-day-sans text-[32px] font-normal leading-[38.4px]">
        <span className="block text-white">Cepat, Terstruktur, Transparan.</span>
        <span className="block text-[#a2a2a2]">
          Platform Capstone untuk Informatika.
        </span>
      </h2>

      <div className="grid grid-cols-1 border-y border-[#252525] md:grid-cols-3">
        {/* Card 1 — Submit cepat */}
        <article className="flex flex-col border-b border-dashed border-[#252525] md:border-b-0 md:border-r">
          <CardHeader
            title="Submit Project dalam Hitungan Menit"
            body="Hubungkan repository GitHub, isi detail project, langsung terkumpul."
          />
          <div className="relative h-[320px] overflow-hidden md:h-[360px]">
            {/* giant circle, top arc visible */}
            <div className="absolute left-1/2 top-[60px] h-[584px] w-[584px] -translate-x-1/2 rounded-full border border-[#252525]" />
            {/* green arc hugging the upper-left rim, ending just left of 12 o'clock */}
            <svg
              className="absolute left-1/2 top-[60px] h-[584px] w-[584px] -translate-x-1/2"
              viewBox="0 0 584 584"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="292"
                cy="292"
                r="291"
                stroke="#2ecc71"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="300 1528"
                transform="rotate(-152 292 292)"
              />
            </svg>
            {/* green tick crossing the rim at 12 o'clock */}
            <div className="absolute left-1/2 top-[57px] h-[30px] w-[3px] -translate-x-1/2 rounded-[30px] bg-[#2ecc71]" />
            {/* label inside the circle */}
            <span className="absolute left-1/2 top-[150px] -translate-x-1/2 font-day-mono text-[24px] text-[#a2a2a2]">
              5 menit
            </span>
            {/* code chip with blinking cursor */}
            <div className="absolute bottom-[28px] left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[8px] bg-[#161616] px-4 py-3">
              <span className="whitespace-nowrap font-day-mono text-[14px] leading-[19.6px] text-[#a2a2a2]">
                capstone.submit(repo)
              </span>
              <span
                className="day-anim-cursor h-[18px] w-[8px] bg-white/50"
                aria-hidden="true"
              />
            </div>
          </div>
        </article>

        {/* Card 2 — Integrasi GitHub */}
        <article className="flex flex-col border-b border-dashed border-[#252525] md:border-b-0 md:border-r">
          <CardHeader
            title="Integrasi GitHub Native"
            body="Commit, kontribusi, dan riwayat pengembangan tim tersinkron otomatis."
          />
          <div className="relative h-[320px] overflow-hidden md:h-[360px]">
            <img
              src="/images/daytona/gJJaGMw4BfYNO4iLpSKn8LgulT0.webp"
              width={170}
              height={284}
              alt=""
              className="absolute left-[-34px] top-[36px] z-0"
            />
            <img
              src="/images/daytona/zU4iuVEil49bEpHGVithjCcmwdE.webp"
              width={141}
              height={235}
              alt=""
              className="absolute right-[54px] top-[14px] z-0"
            />
            <img
              src="/images/daytona/ncDbtVOfabJI03Cq37pyEauzGg.webp"
              width={141}
              height={303}
              alt=""
              className="absolute right-[-20px] top-[120px] z-0"
            />
            <img
              src="/images/daytona/4pDxkjFmwEyIs3O1TYKDJhjK2fk.webp"
              width={91}
              height={151}
              alt=""
              className="absolute bottom-[-30px] left-[80px] z-0"
            />
            <img
              src="/images/daytona/Ex0ktX4meptouk7YvOHwnXICvY.webp"
              width={91}
              height={151}
              alt=""
              className="absolute bottom-[-60px] left-[190px] z-0"
            />
            <div className="absolute left-1/2 top-[50px] z-10 -translate-x-1/2">
              <img
                src="/images/daytona/TOD8wkJmVz4cFYW4HKFFqbfF4.webp"
                width={227}
                height={259}
                alt="Kubus wireframe biru melayang di atas pilar gelap"
                className="day-anim-float"
              />
            </div>
          </div>
        </article>

        {/* Card 3 — Penilaian paralel */}
        <article className="flex flex-col">
          <CardHeader
            title="Penilaian Paralel Multi-Penguji"
            body="Beberapa dosen menilai bersamaan dengan rubrik terstandar."
          />
          <div className="relative h-[320px] overflow-hidden px-8 md:h-[360px]">
            {/* top chip, aligned above column 1 */}
            <span className="absolute left-[62px] top-[8px] inline-block rounded-[6px] bg-[#2ecc71] px-3 py-1.5 font-day-mono text-[12px] text-[#0a0a0a]">
              DINILAI
            </span>
            {/* connectors fanning from chip to the 4 columns */}
            <svg
              className="absolute left-[62px] top-[40px] opacity-50"
              width="290"
              height="58"
              viewBox="0 0 290 58"
              fill="none"
              aria-hidden="true"
            >
              <path d="M20 0C20 20 35 34 35 57" stroke="#2ecc71" />
              <path d="M28 0C36 26 104 28 109 57" stroke="#2ecc71" />
              <path d="M36 0C52 30 176 24 183 57" stroke="#2ecc71" />
              <path d="M44 0C66 34 248 20 257 57" stroke="#2ecc71" />
            </svg>
            {/* 4 columns x 5 rows of chips */}
            <div className="absolute left-[62px] right-[62px] top-[98px] grid grid-cols-4 gap-1">
              {CHIP_ROWS.flatMap((row) =>
                Array.from({ length: 4 }, (_, col) => (
                  <div
                    key={`${row.label}-${col}`}
                    className={`flex h-[26px] items-center justify-center gap-1 rounded-[6px] border font-day-mono text-[11px] uppercase ${row.chipClass}`}
                  >
                    {row.withGlyph ? <ForkGlyph /> : null}
                    {row.label}
                  </div>
                )),
              )}
            </div>
            {/* short connector stem into bottom chip */}
            <div className="absolute right-[96px] top-[244px] h-[8px] w-px bg-[#2ecc71]" />
            {/* bottom chip under the last column */}
            <span className="absolute right-[62px] top-[252px] inline-block rounded-[6px] bg-[#2ecc71] px-3 py-1.5 font-day-mono text-[12px] text-[#0a0a0a]">
              LULUS
            </span>
            {/* bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
          </div>
        </article>
      </div>
    </section>
  );
}
