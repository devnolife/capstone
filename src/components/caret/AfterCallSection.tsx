import { SectionLabelBar } from "@/components/caret/SectionLabelBar";
import { SsoChatPlayer } from "@/components/caret/SsoChatPlayer";
import { ReviewSummaryMock } from "@/components/caret/illustrations";
import {
  BarChart3,
  CalendarCheck,
  FileCheck2,
  Github,
  GraduationCap,
  MessageSquareText,
} from "lucide-react";

const marqueeItems = [
  { alt: "Repository", icon: Github },
  { alt: "Berkas", icon: FileCheck2 },
  { alt: "Jadwal Presentasi", icon: CalendarCheck },
  { alt: "Diskusi", icon: MessageSquareText },
  { alt: "Penilaian", icon: BarChart3 },
  { alt: "Kelulusan", icon: GraduationCap },
];

function MarqueeRow() {
  return (
    <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row">
      {marqueeItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.alt}
            aria-label={item.alt}
            className="border-app-secondary relative mx-3 flex size-32 items-center justify-center overflow-hidden rounded-4xl border bg-zinc-800 shadow-2xl transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.03]"
          >
            <Icon className="size-14 text-zinc-200" />
          </div>
        );
      })}
    </div>
  );
}

export function AfterCallSection() {
  return (
    <section className="md:px-8 border-b border-zinc-800">
      <SectionLabelBar left="[03] SETELAH REVIEW" right="/ RIWAYAT" />
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 bg-repeat bg-[url(/images/caret/bg-pattern-arrow.svg)]">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <div
            data-reveal-group
            className="-my-px border border-zinc-800 grid gap-px bg-zinc-800 md:grid-cols-2"
          >
            <div className="bg-background flex flex-col">
              <div className="flex grow flex-col px-8 py-7">
                <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
                  Tinjau yang penting
                </h5>
                <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
                  <p>Lihat apa yang berjalan baik, apa yang terlewat, dan apa yang perlu ditindaklanjuti.</p>
                </div>
              </div>
              <div className="relative overflow-hidden *:select-none aspect-5/4 shrink-0 bg-background">
                <ReviewSummaryMock />
                <div className="absolute bottom-0 left-0 size-full bg-linear-to-b from-amber-400/0 from-50% to-amber-400/20" />
              </div>
            </div>
            <div className="bg-background flex flex-col">
              <div className="flex grow flex-col px-8 py-7">
                <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
                  Otomatiskan pekerjaan rutin
                </h5>
                <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
                  <p>Rekap review, pengingat revisi, dan status persyaratan terbarui otomatis.</p>
                </div>
              </div>
              <div className="relative overflow-hidden *:select-none aspect-5/4 shrink-0 bg-background">
                <div className="group flex [gap:var(--gap)] overflow-hidden p-2 [--duration:40s] [--gap:1rem] flex-row absolute top-1/2 left-0 z-1 w-full -translate-y-1/2 [&:hover_.animate-marquee]:[animation-play-state:paused]">
                  <MarqueeRow />
                  <MarqueeRow />
                  <MarqueeRow />
                  <MarqueeRow />
                </div>
                <div className="absolute bottom-0 left-0 size-full bg-linear-to-b from-sky-400/0 from-50% to-sky-400/20" />
              </div>
            </div>
          </div>
          <div
            data-reveal-group
            className="-my-px border border-zinc-800 grid gap-px bg-zinc-800 md:grid-cols-2"
          >
            <div className="bg-background flex flex-col">
              <div className="flex grow flex-col px-8 py-7">
                <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
                  Makin pintar seiring waktu
                </h5>
                <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
                  <p>Capstone belajar dari tiap review, jadi pengetahuan prodi tumbuh bersama.</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden *:select-none aspect-5/4 shrink-0 bg-background">
              <SsoChatPlayer />
              <img
                alt="gradient"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover object-center"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/caret/bg-gradient-4.webp"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
