'use client';

import { useState } from 'react';
import type { ComponentType, ReactNode, SVGProps } from 'react';

import {
  ComputeIcon,
  GpuIcon,
  MemoryIcon,
  StorageIcon,
} from '@/components/daytona/icons';

type ViewMode = 'bobot' | 'deadline';

type ViewOption = {
  value: ViewMode;
  label: string;
};

type StageRow = {
  label: string;
  bobot: string;
  deadline: string;
};

type StageGroup = {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>> | null;
  rows: StageRow[];
  footnote?: Record<ViewMode, ReactNode>;
};

type PositionedLabel = {
  label: string;
  className: string;
};

const VIEW_OPTIONS: ViewOption[] = [
  { value: 'bobot', label: 'Bobot Nilai' },
  { value: 'deadline', label: 'Deadline' },
];

const STAGE_GROUPS: StageGroup[] = [
  {
    title: 'Proposal',
    icon: ComputeIcon,
    rows: [{ label: 'Pengajuan tema', bobot: '10%', deadline: 'Pekan 2' }],
  },
  {
    title: 'Pengembangan',
    icon: GpuIcon,
    rows: [
      { label: 'Milestone 1', bobot: '15%', deadline: 'Pekan 5' },
      { label: 'Milestone 2', bobot: '15%', deadline: 'Pekan 9' },
      { label: 'Milestone 3', bobot: '10%', deadline: 'Pekan 12' },
      { label: 'Review kode', bobot: '10%', deadline: 'Pekan 13' },
    ],
  },
  {
    title: 'Laporan',
    icon: MemoryIcon,
    rows: [{ label: 'Dokumen akhir', bobot: '15%', deadline: 'Pekan 14' }],
  },
  {
    title: 'Sidang',
    icon: StorageIcon,
    rows: [{ label: 'Presentasi & demo', bobot: '25%', deadline: 'Pekan 16' }],
    footnote: {
      bobot: (
        <>
          *Bobot dapat disesuaikan <span className="text-white">koordinator</span>{' '}
          tiap semester
        </>
      ),
      deadline: '*Jadwal mengikuti kalender akademik berjalan',
    },
  },
];

const CHIP_CARDS: PositionedLabel[] = [
  { label: '16-CORE', className: 'left-0 top-0' },
  { label: '32-CORE', className: 'left-[88px] top-0' },
  { label: '16-CORE', className: 'left-0 top-[96px]' },
  { label: '8-CORE', className: 'left-[88px] top-[96px]' },
];

const RAM_STICKS: PositionedLabel[] = [
  { label: '32GB DDR5', className: 'left-[184px] top-0' },
  { label: '32GB DDR5', className: 'left-[242px] top-0' },
];

const SCATTER_RECTS: string[] = [
  'left-[470px] top-0 h-[36px] w-[170px]',
  'left-[470px] top-[48px] h-[36px] w-[170px]',
  'left-[660px] top-0 h-[70px] w-[70px]',
  'left-[470px] top-[100px] h-[75px] w-[80px]',
  'left-[562px] top-[100px] h-[75px] w-[78px]',
  'left-[660px] top-[110px] h-[60px] w-[70px]',
  'left-[470px] top-[192px] h-[30px] w-[170px]',
  'left-[470px] top-[238px] h-[30px] w-[170px]',
  'left-[470px] top-[290px] h-[80px] w-[80px]',
  'left-[562px] top-[290px] h-[80px] w-[78px]',
  'left-0 top-[344px] h-[42px] w-[210px]',
  'left-[232px] top-[344px] h-[42px] w-[210px]',
  'left-0 top-[416px] h-[70px] w-[120px]',
  'left-[232px] top-[416px] h-[70px] w-[160px]',
];

function StageIllustration() {
  /* approximated illustration — faint hardware line-art (dipertahankan dari tema) */
  return (
    <div
      aria-hidden="true"
      className="relative mt-16 hidden h-[500px] overflow-hidden opacity-80 min-[810px]:block"
    >
      {CHIP_CARDS.map((chip, index) => (
        <div
          key={`chip-${chip.label}-${index}`}
          className={`absolute flex h-[80px] w-[68px] flex-col justify-between rounded-[2px] border border-[#1e1e1e] p-2 ${chip.className}`}
        >
          <div className="h-[24px] w-[36px] rounded-[2px] border border-[#1e1e1e]" />
          <span className="font-day-mono text-[8px] text-[#585858]">
            {chip.label}
          </span>
        </div>
      ))}
      {RAM_STICKS.map((stick, index) => (
        <div
          key={`stick-${index}`}
          className={`absolute flex h-[170px] w-[24px] items-end justify-center rounded-[2px] border border-[#1e1e1e] pb-2 ${stick.className}`}
        >
          <span className="font-day-mono text-[7px] text-[#585858] [writing-mode:vertical-rl]">
            {stick.label}
          </span>
        </div>
      ))}
      <div className="absolute left-[300px] top-0 h-[300px] w-[135px] rounded-[2px] border border-[#1e1e1e]">
        <div className="absolute left-1/2 top-[40px] flex size-[70px] -translate-x-1/2 items-center justify-center rounded-full border border-[#1e1e1e]">
          <div className="size-[22px] rounded-full border border-[#1e1e1e]" />
        </div>
        <div className="absolute left-1/2 top-[150px] flex size-[70px] -translate-x-1/2 items-center justify-center rounded-full border border-[#1e1e1e]">
          <div className="size-[22px] rounded-full border border-[#1e1e1e]" />
        </div>
        <span className="absolute bottom-3 left-2 font-day-mono text-[7px] text-[#585858] [writing-mode:vertical-rl]">
          12GB GDDR6
        </span>
      </div>
      <div className="absolute left-0 top-[200px] h-[120px] w-[280px] rounded-[2px] border border-[#1e1e1e]">
        <span className="absolute left-2 top-2 font-day-mono text-[8px] text-[#585858]">
          12GB GDDR6
        </span>
        <div className="absolute left-[100px] top-1/2 flex size-[60px] -translate-y-1/2 items-center justify-center rounded-full border border-[#1e1e1e]">
          <div className="size-[20px] rounded-full border border-[#1e1e1e]" />
        </div>
        <div className="absolute left-[180px] top-1/2 flex size-[60px] -translate-y-1/2 items-center justify-center rounded-full border border-[#1e1e1e]">
          <div className="size-[20px] rounded-full border border-[#1e1e1e]" />
        </div>
      </div>
      {SCATTER_RECTS.map((rectClass, index) => (
        <div
          key={`rect-${index}`}
          className={`absolute rounded-[2px] border border-[#1e1e1e] opacity-60 ${rectClass}`}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_60%,#0a0a0a_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#0a0a0a_100%)]" />
    </div>
  );
}

export function DayPricing() {
  const [mode, setMode] = useState<ViewMode>('bobot');

  return (
    <section id="penilaian" className="day-container py-20 scroll-mt-16">
      <div className="flex flex-col gap-12 xl:flex-row xl:gap-0">
        <div className="w-full border border-[#252525] xl:w-[416px] xl:shrink-0">
          <div className="px-8 pb-4 pt-5">
            <div className="inline-flex gap-1 rounded-[10px] border border-[#252525] p-1">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={mode === option.value}
                  onClick={() => setMode(option.value)}
                  className={`rounded-[8px] px-4 py-2 font-day-sans text-[14px] transition-colors ${
                    mode === option.value
                      ? 'bg-[#161616] text-white'
                      : 'text-[#a2a2a2] hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {STAGE_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.title}
                className="border-t border-dashed border-[#252525] px-8 py-5"
              >
                <div className="mb-2 flex items-center gap-3">
                  {Icon ? <Icon className="size-5 text-white" /> : null}
                  <h3 className="font-day-sans text-[16px] font-medium leading-6 text-white">
                    {group.title}
                  </h3>
                </div>
                {group.rows.map((row) => (
                  <div key={row.label} className="flex justify-between py-1">
                    <span className="font-day-sans text-[16px] text-[#a2a2a2]">
                      {row.label}
                    </span>
                    <span className="font-day-mono text-[16px] text-white">
                      {mode === 'bobot' ? row.bobot : row.deadline}
                    </span>
                  </div>
                ))}
                {group.footnote ? (
                  <p className="py-1 font-day-sans text-[14px] text-[#a2a2a2]">
                    {group.footnote[mode]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="flex-1 xl:pl-8">
          <div className="flex flex-col gap-4 pr-10 pt-8">
            <h2 className="font-day-sans text-[32px] leading-[38.4px] text-white">
              Penilaian Transparan. Terjadwal Jelas.
            </h2>
            <p className="font-day-sans text-[16px] leading-6 tracking-[-0.16px] text-[#a2a2a2]">
              Setiap tahapan punya bobot dan tenggat yang diketahui sejak awal
              semester.
              <br />
              Nilai akhir dihitung otomatis dari semua penguji.{' '}
              <span className="text-white">Tidak ada nilai misterius.</span>
            </p>
          </div>
          <StageIllustration />
        </div>
      </div>
    </section>
  );
}
