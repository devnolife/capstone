import Link from 'next/link';
import { ArrowRightIcon } from '@/components/daytona/icons';

type CtaLink = {
  label: string;
  href: string;
};

const CTA_LINKS: CtaLink[] = [
  { label: 'Hubungi Koordinator', href: 'mailto:informatika@unismuh.ac.id' },
  { label: 'Lihat FAQ', href: '#faq' },
];

export function DayCta() {
  return (
    <section className="day-container py-16">
      <div className="grid grid-cols-1 gap-px min-[810px]:grid-cols-[416px_1fr]">
        <div className="flex flex-col">
          {CTA_LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={`group flex h-[100px] items-center justify-between border border-dashed border-[#252525] bg-[#0a0a0a] px-10 transition-colors hover:bg-[#161616] ${
                index > 0 ? 'border-t-0' : ''
              }`}
            >
              <span className="font-day-mono text-[16px] leading-none tracking-[-0.16px] text-white">
                {link.label}
              </span>
              <ArrowRightIcon className="size-4 text-white transition-transform group-hover:translate-x-1" />
            </a>
          ))}
        </div>
        <Link
          href="/login"
          className="group flex h-[120px] items-center justify-between rounded-[24px] border border-dashed border-[#252525] bg-[#0a0a0a] px-8 min-[810px]:h-[200px] min-[810px]:rounded-[48px] min-[810px]:px-16"
        >
          <span className="font-day-sans text-[24px] leading-tight text-white transition-all duration-300 group-hover:[text-shadow:2px_0_rgba(255,0,80,0.6),-2px_0_rgba(0,128,255,0.6)] min-[810px]:text-[48px] min-[810px]:leading-[57.6px]">
            Mulai Capstone Project
          </span>
          <ArrowRightIcon className="size-6 shrink-0 text-white transition-transform duration-300 group-hover:translate-x-2 min-[810px]:size-12" />
        </Link>
      </div>
    </section>
  );
}
