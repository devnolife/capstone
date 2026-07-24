import { MeetingDetectedPlayer } from "@/components/caret/MeetingDetectedPlayer";
import { SectionLabelBar } from "@/components/caret/SectionLabelBar";
import { ProjectBriefMock } from "@/components/caret/illustrations";
import {
  BarChart3,
  CalendarCheck,
  FileText,
  Github,
  MessageSquareText,
} from "lucide-react";
import { DotsHorizontalIcon } from "@/components/icons";

function QuickBriefsCard() {
  return (
    <div data-reveal className="-my-px border border-zinc-800 lg:grid lg:h-96 lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-8">
        <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
          Ringkasan cepat sebelum tiap review
        </h5>
        <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
          <p>
            Capstone menarik info dari persyaratan, repository, dan catatan review ke
            satu tampilan.
          </p>
        </div>
        <div className="grow"></div>
        <div className="flex items-center gap-4 pt-8">
          <div>
            <Github className="text-app-teritary-invert size-4.5 md:size-5" />
          </div>
          <div>
            <FileText className="text-app-teritary-invert size-5 md:size-6" />
          </div>
          <div>
            <MessageSquareText className="text-app-teritary-invert size-5 md:size-6" />
          </div>
          <div>
            <CalendarCheck className="text-app-teritary-invert size-5 md:size-6" />
          </div>
          <div>
            <DotsHorizontalIcon className="caret-icon caret-icon-dots-horizontal-icon text-app-teritary-invert [&_path]:fill-app-teritary-invert size-5 md:size-6" />
          </div>
        </div>
      </div>
      <div className="bg-app-primary relative shrink-0 overflow-hidden *:select-none font-sans-alt border-l border-zinc-800 max-lg:aspect-5/4">
        <ProjectBriefMock />
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
          src="/images/caret/bg-gradient-2.webp"
        />
      </div>
    </div>
  );
}

const DOCK_ICONS = [
  { alt: "GitHub", icon: Github, active: true },
  { alt: "Dokumen", icon: FileText, active: false },
  { alt: "Jadwal", icon: CalendarCheck, active: false },
  { alt: "Diskusi", icon: MessageSquareText, active: false },
  { alt: "Penilaian", icon: BarChart3, active: false },
];

function AnyPlatformCard() {
  return (
    <div data-reveal className="-my-px border border-zinc-800 lg:grid lg:h-96 lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-8">
        <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
          Terhubung dengan tools kalian
        </h5>
        <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
          <p>GitHub, production URL, dan jadwal presentasi. Semua tersinkron otomatis tanpa rekap manual.</p>
        </div>
      </div>
      <div className="bg-app-primary relative shrink-0 overflow-hidden *:select-none font-sans-alt border-l border-zinc-800 max-lg:aspect-5/4">
        <MeetingDetectedPlayer />
        <div className="absolute bottom-6 left-1/2 z-1 -translate-x-1/2">
          <div
            className="flex w-max items-center justify-center gap-3 rounded-[calc(var(--spacing)*5)] px-4 py-2 backdrop-blur-xs"
            style={{
              border: "1px solid transparent",
              background:
                "linear-gradient(to right, rgba(0,0,0,0.01), rgba(0,0,0,0.01)) padding-box, linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2) 5%, rgba(255, 255, 255, 0.05) 15%, rgba(255, 255, 255, 0.05) 85%, rgba(255, 255, 255, 0.2) 95%, rgba(255, 255, 255, 0.5) 100%) border-box",
              backgroundClip: "padding-box, border-box",
              backgroundOrigin: "border-box",
              boxShadow:
                "inset 0 10px 3px rgba(255, 255, 255, 0.1), 0 5px 10px rgba(0, 0, 0, 0.08)",
            }}
          >
            {DOCK_ICONS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.alt} className="shrink-0">
                  <div
                    aria-label={item.alt}
                    className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-zinc-900/90 text-zinc-100 shadow-lg transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-110 lg:size-12 lg:rounded-xl"
                  >
                    <Icon className="size-5 lg:size-6" />
                  </div>
                  <div className="mt-1">
                    <div
                      className={
                        item.active
                          ? "mx-auto -mb-1 size-1 rounded-full bg-app-primary-invert"
                          : "mx-auto -mb-1 size-1 rounded-full"
                      }
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
          src="/images/caret/bg-gradient-1.webp"
        />
      </div>
    </div>
  );
}

export function BeforeCallSection() {
  return (
    <section id="alur" className="md:px-8 -my-px md:border-y md:border-zinc-800">
      <SectionLabelBar left="[02] SEBELUM REVIEW" right="/ PERSIAPAN" />
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 bg-repeat bg-[url(/images/caret/bg-pattern-dot.svg)]">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <QuickBriefsCard />
          <AnyPlatformCard />
        </div>
      </div>
    </section>
  );
}
