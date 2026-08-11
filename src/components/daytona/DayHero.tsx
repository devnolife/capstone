'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { dayHeroLanguages } from '@/components/daytona/code-data';
import { DayCodeLines, DayWindowChrome } from '@/components/daytona/DayCodeWindow';
import { ArrowRightIcon, CheckIcon, CopyIcon } from '@/components/daytona/icons';

const HERO_FILENAMES: Record<string, string> = {
  python: 'submit_capstone.py',
  typescript: 'submit-capstone.ts',
  go: 'main.go',
  java: 'Main.java',
};

interface HeroCopyButtonProps {
  text: string;
  className?: string;
}

function HeroCopyButton({ text, className }: HeroCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = () => {
    void navigator.clipboard.writeText(text).catch(() => undefined);
    setCopied(true);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Tersalin' : 'Salin ke clipboard'}
      className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[#a2a2a2] transition-colors hover:bg-[#252525]${className ? ` ${className}` : ''}`}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-[#2ecc71]" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
    </button>
  );
}

export function DayHero() {
  const [activeId, setActiveId] = useState('python');

  const active =
    dayHeroLanguages.find((lang) => lang.id === activeId) ?? dayHeroLanguages[0];

  const codeText = active.code
    .map((line) => line.map((token) => token.t).join(''))
    .join('\n');

  return (
    <section className="day-container">
      <div className="relative overflow-hidden rounded-[8px] py-[60px] xl:h-[600px] xl:pb-20 xl:pt-[100px]">
        <div aria-hidden="true" className="day-dot-grid absolute inset-0" />
        <div className="relative z-[2] flex flex-col gap-12 xl:flex-row xl:items-center xl:justify-between">
          {/* Left column */}
          <div className="flex w-full flex-col gap-16 xl:w-[618px]">
            <div className="flex flex-col gap-6">
              <h1 className="font-day-sans text-[40px] font-semibold leading-[44px] tracking-[-1.6px] text-white md:text-[64px] md:leading-[64px] md:tracking-[-2.56px]">
                Kumpul. Review. Nilai.
              </h1>
              <p className="font-day-sans text-[16px] leading-[24px] tracking-[-0.2px] text-[#a2a2a2] md:text-[20px] md:leading-[30px]">
                Platform terpadu capstone project Prodi Informatika.
                <br />
                Terintegrasi penuh dengan GitHub.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-[4px] bg-[#0080ff] px-6 py-4 font-day-mono text-[16px] leading-none tracking-[-0.16px] text-white transition-colors duration-250 hover:bg-[#0066dd] sm:w-auto"
              >
                Mulai Sekarang
              </Link>
              <a
                href="#alur"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] border border-[#252525] px-6 py-4 font-day-mono text-[16px] leading-none tracking-[-0.16px] text-white transition-colors hover:border-[#585858] hover:bg-[#161616] sm:w-auto"
              >
                Lihat Alur
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right code panel */}
          <div className="flex w-full flex-col gap-4 xl:w-[630px] xl:shrink-0">
            {/* Block A: stack switcher */}
            <div className="flex flex-col gap-[3px] rounded-[12px] border border-[#252525] bg-[#0a0a0a] p-[3px]">
              <div className="day-no-scrollbar relative flex h-10 gap-[1px] overflow-x-auto">
                {dayHeroLanguages.map((lang, index) => {
                  const isActive = lang.id === active.id;
                  return (
                    <Fragment key={lang.id}>
                      {index > 0 ? (
                        <div
                          aria-hidden="true"
                          className="h-4 w-px shrink-0 self-center bg-[#252525]"
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setActiveId(lang.id)}
                        aria-pressed={isActive}
                        className={`group flex shrink-0 cursor-pointer select-none items-center gap-2 rounded-[10px] px-3.5 py-2 ${isActive ? 'bg-[#161616]' : ''}`}
                      >
                        <img
                          src={lang.icon}
                          alt={lang.label}
                          width={24}
                          height={24}
                          className="h-6 w-6 shrink-0"
                        />
                        <span
                          className={`whitespace-nowrap font-day-sans text-[14px] transition-colors ${isActive ? 'text-white' : 'text-[#a2a2a2] group-hover:text-white'}`}
                        >
                          {lang.label}
                        </span>
                      </button>
                    </Fragment>
                  );
                })}
              </div>
              <div className="flex h-12 items-center justify-between rounded-[10px] bg-[#161616] py-2 pl-3.5 pr-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden="true" className="shrink-0 font-day-code text-[14px] text-[#2ecc71]">
                    $
                  </span>
                  <span className="min-w-0 truncate font-day-code text-[14px] text-white">
                    {active.installCommand}
                  </span>
                </span>
                <HeroCopyButton text={active.installCommand} />
              </div>
            </div>

            {/* Block B: modern editor window */}
            <div className="day-glow-code relative overflow-hidden rounded-[12px] border border-[#252525] bg-[#0d0d0d]">
              <div aria-hidden="true" className="day-accent-top absolute inset-x-8 top-0 h-px" />
              <DayWindowChrome
                filename={HERO_FILENAMES[active.id] ?? 'main.txt'}
                right={<HeroCopyButton text={codeText} />}
              />
              <div
                key={active.id}
                className="day-anim-code-in day-no-scrollbar h-[390px] overflow-x-auto overflow-y-auto py-4"
              >
                <DayCodeLines lines={active.code} showCursor />
              </div>
              <div className="flex h-[30px] items-center justify-between border-t border-[#1c1c1c] px-4">
                <span className="font-day-mono text-[11px] uppercase tracking-[0.22px] text-[#585858]">
                  {active.label}
                </span>
                <span className="flex items-center gap-1.5 font-day-mono text-[11px] text-[#585858]">
                  <span className="size-[6px] rounded-full bg-[#2ecc71]" />
                  siap disubmit
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
