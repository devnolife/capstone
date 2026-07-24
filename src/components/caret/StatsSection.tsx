"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabelBar } from "@/components/caret/SectionLabelBar";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Stats {
  totalProjects: number;
  totalMahasiswa: number;
  successRate: number;
  approvedProjects: number;
}

const FALLBACK: Stats = {
  totalProjects: 128,
  totalMahasiswa: 215,
  successRate: 92,
  approvedProjects: 87,
};

/**
 * Landing stats in the Caret dashboard visual language:
 * bento cells with gap-px borders, display numerals, mono labels.
 * Data comes from /api/stats (public endpoint), with fallbacks.
 * Numbers count up once when scrolled into view (reduced-motion safe).
 */
export function StatsSection() {
  const [stats, setStats] = useState<Stats>(FALLBACK);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      try {
        const response = await fetch("/api/stats", { signal: controller.signal });
        if (response.ok) {
          const data: Stats = await response.json();
          setStats({
            totalProjects: data.totalProjects || FALLBACK.totalProjects,
            totalMahasiswa: data.totalMahasiswa || FALLBACK.totalMahasiswa,
            successRate: data.successRate || FALLBACK.successRate,
            approvedProjects: data.approvedProjects || FALLBACK.approvedProjects,
          });
        }
      } catch {
        // keep fallback values
      }
    }

    fetchStats();
    return () => controller.abort();
  }, []);

  const items = [
    {
      label: "PROJECT CAPSTONE",
      value: stats.totalProjects,
      suffix: "+",
      note: "terdokumentasi dari berbagai angkatan",
    },
    {
      label: "MAHASISWA AKTIF",
      value: stats.totalMahasiswa,
      suffix: "+",
      note: "memakai platform setiap semester",
    },
    {
      label: "PROJECT DISETUJUI",
      value: stats.approvedProjects,
      suffix: "",
      note: "diarsipkan ke GitHub Organization prodi",
    },
    {
      label: "TINGKAT KELULUSAN",
      value: stats.successRate,
      suffix: "%",
      note: "lolos review dan presentasi",
    },
  ];

  // Count-up once when the grid scrolls into view.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils
          .toArray<HTMLElement>("[data-count-to]")
          .forEach((el) => {
            const target = parseFloat(el.dataset.countTo || "0");
            const counter = { value: 0 };
            gsap.to(counter, {
              value: target,
              duration: 1.4,
              ease: "power2.out",
              snap: { value: 1 },
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
              onUpdate: () => {
                el.textContent = String(Math.round(counter.value));
              },
            });
          });
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [stats] }
  );

  return (
    <section
      ref={rootRef}
      id="statistik"
      className="md:px-8 -my-px md:border-y md:border-zinc-800"
    >
      <SectionLabelBar left="[04] STATISTIK" right="/ PRODI" />
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 bg-repeat bg-[url(/images/caret/bg-pattern-dot.svg)]">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <div
            data-reveal-group
            className="-my-px border border-zinc-800 grid grid-cols-2 gap-px bg-zinc-800 lg:grid-cols-4"
          >
            {items.map((item) => (
              <div
                key={item.label}
                className="bg-background flex flex-col gap-3 px-5 py-6 md:px-6 md:py-8"
              >
                <span className="text-app-teritary-invert font-dm-mono text-[10px] tracking-wider md:text-xs">
                  {item.label}
                </span>
                <span className="font-display text-3xl leading-none font-[450] tracking-tight tabular-nums md:text-4xl">
                  <span data-count-to={item.value}>{item.value}</span>
                  {item.suffix}
                </span>
                <span className="text-app-secondary-invert text-xs font-medium leading-snug">
                  {item.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
