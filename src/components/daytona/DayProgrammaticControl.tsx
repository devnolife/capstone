'use client';

import { useEffect, useRef, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { dayApiCode } from '@/components/daytona/code-data';
import { DayCodeLines, DayWindowChrome } from '@/components/daytona/DayCodeWindow';
import {
  CheckIcon,
  CopyIcon,
  FileSystemIcon,
  GitIcon,
  LspIcon,
  ProcessIcon,
} from '@/components/daytona/icons';
import type { DayCodeLine } from '@/types/daytona';

type TabId = 'process' | 'git' | 'fs' | 'lsp';

const TAB_FILES: Record<TabId, string> = {
  process: 'submit.log',
  git: 'review_komentar.py',
  fs: 'progress_tim.py',
  lsp: 'nilai_rubrik.py',
};

const TAB_STATUS: Record<TabId, string> = {
  process: 'validasi lolos',
  git: '2 komentar baru',
  fs: 'milestone 3/4',
  lsp: 'nilai final: A',
};

interface TabDef {
  id: TabId;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const tabs: TabDef[] = [
  {
    id: 'process',
    icon: ProcessIcon,
    title: 'Pengumpulan Project',
    description:
      'Kumpulkan project langsung dari repository GitHub dengan validasi otomatis.',
  },
  {
    id: 'git',
    icon: GitIcon,
    title: 'Review Kode Dosen',
    description:
      'Dosen memeriksa kode, memberi komentar inline, dan meminta revisi terarah.',
  },
  {
    id: 'fs',
    icon: FileSystemIcon,
    title: 'Progress & Kontribusi',
    description:
      'Pantau milestone, aktivitas commit, dan kontribusi setiap anggota tim.',
  },
  {
    id: 'lsp',
    icon: LspIcon,
    title: 'Penilaian Rubrik',
    description:
      'Nilai transparan berdasarkan rubrik dengan bobot yang jelas sejak awal.',
  },
];

export function DayProgrammaticControl() {
  const [activeTab, setActiveTab] = useState<TabId>('process');
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const lines: DayCodeLine[] = dayApiCode[activeTab] ?? [];

  const handleCopy = () => {
    const text = lines
      .map((line) => line.map((token) => token.t).join(''))
      .join('\n');
    void navigator.clipboard.writeText(text);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id="alur" className="day-container flex flex-col gap-16 py-20 scroll-mt-16">
      <h2 className="font-day-sans text-[32px] leading-[38.4px]">
        <span className="block text-white">Alur Kerja Jelas.</span>
        <span className="block text-[#a2a2a2]">
          Submit, Review, Revisi, dan Penilaian.
        </span>
      </h2>

      <div className="flex flex-col gap-6 xl:flex-row xl:gap-0">
        {/* Desktop sidebar tabs */}
        <div className="hidden w-[416px] flex-col py-2 xl:flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-[148px] cursor-pointer flex-col gap-2 border-b border-[#252525] p-8 text-left transition-colors last:border-b-0 ${
                  isActive ? 'bg-[#161616]' : 'bg-transparent hover:bg-[#161616]/50'
                }`}
              >
                <span className="flex items-center gap-4">
                  <Icon className="size-4 text-white" />
                  <span className="font-day-mono text-[20px] leading-[28px] tracking-[-0.8px] text-white">
                    {tab.title}
                  </span>
                </span>
                <span className="font-day-sans text-[16px] leading-6 tracking-[-0.16px] text-[#a2a2a2]">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile pill tabs */}
        <div className="flex gap-2 overflow-x-auto xl:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center gap-2 whitespace-nowrap px-4 py-3 font-day-mono text-[14px] transition-colors ${
                  isActive
                    ? 'rounded-[8px] bg-[#161616] text-white'
                    : 'text-[#a2a2a2] hover:text-white'
                }`}
              >
                <Icon className="size-4" />
                {tab.title}
              </button>
            );
          })}
        </div>

        {/* IDE window */}
        <div className="day-glow-code relative flex h-[500px] w-full flex-col overflow-hidden rounded-[10px] border border-[#252525] bg-[#0d0d0d] xl:h-[608px] xl:w-auto xl:flex-1 xl:rounded-r-none xl:border-r-0">
          <div aria-hidden="true" className="day-accent-top absolute inset-x-10 top-0 h-px" />
          <DayWindowChrome
            filename={TAB_FILES[activeTab]}
            right={
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Salin kode"
                className="flex size-8 items-center justify-center rounded-[8px] text-[#a2a2a2] transition-colors hover:bg-[#252525]"
              >
                {copied ? (
                  <CheckIcon className="size-4 text-[#2ecc71]" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </button>
            }
          />

          <div
            key={activeTab}
            className="day-anim-code-in relative flex-1 overflow-hidden py-3"
          >
            <DayCodeLines lines={lines} defaultTokenClass="text-[#8b8b8b]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
          </div>

          <div className="flex h-[30px] shrink-0 items-center justify-between border-t border-[#1c1c1c] px-4">
            <span className="font-day-mono text-[11px] uppercase tracking-[0.22px] text-[#585858]">
              capstone.if
            </span>
            <span className="flex items-center gap-1.5 font-day-mono text-[11px] text-[#585858]">
              <span className="size-[6px] rounded-full bg-[#2ecc71]" />
              {TAB_STATUS[activeTab]}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
