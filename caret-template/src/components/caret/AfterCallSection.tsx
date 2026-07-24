import { SectionLabelBar } from "@/components/caret/SectionLabelBar";
import { SsoChatPlayer } from "@/components/caret/SsoChatPlayer";

interface MarqueeLogo {
  alt: string;
  src: string;
  width: number;
  height: number;
  className: string;
}

const marqueeLogos: MarqueeLogo[] = [
  {
    alt: "Slack",
    src: "/images/caret/slack.svg",
    width: 20,
    height: 20,
    className: "size-20 object-contain",
  },
  {
    alt: "Salesforce",
    src: "/images/caret/salesforce.svg",
    width: 92,
    height: 64,
    className: "size-20 object-contain",
  },
  {
    alt: "HubSpot",
    src: "/images/caret/hubspot.svg",
    width: 2500,
    height: 2500,
    className: "size-20 object-contain",
  },
  {
    alt: "Attio",
    src: "/images/caret/attio.svg",
    width: 54,
    height: 54,
    className: "size-20 object-contain",
  },
  {
    alt: "Pipedrive",
    src: "/images/caret/pipedrive.svg",
    width: 304,
    height: 304,
    className: "object-contain size-32",
  },
  {
    alt: "Notion",
    src: "/images/caret/notion.svg",
    width: 100,
    height: 100,
    className: "size-20 object-contain -mr-1 -mb-1",
  },
];

function MarqueeRow() {
  return (
    <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row">
      {marqueeLogos.map((logo) => (
        <div
          key={logo.alt}
          className="border-app-secondary relative mx-3 flex size-32 items-center justify-center overflow-hidden rounded-4xl border bg-zinc-800 shadow-2xl"
        >
          <img
            alt={logo.alt}
            loading="lazy"
            width={logo.width}
            height={logo.height}
            decoding="async"
            className={logo.className}
            style={{ color: "transparent" }}
            src={logo.src}
          />
        </div>
      ))}
    </div>
  );
}

export function AfterCallSection() {
  return (
    <section className="md:px-8 border-b border-zinc-800">
      <SectionLabelBar left="[03] AFTER THE CALL" right="/ MEMORY" />
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 bg-repeat bg-[url(/images/caret/bg-pattern-arrow.svg)]">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <div
            data-reveal-group
            className="-my-px border border-zinc-800 grid gap-px bg-zinc-800 md:grid-cols-2"
          >
            <div className="bg-background flex flex-col">
              <div className="flex grow flex-col px-8 py-7">
                <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
                  Review what matters
                </h5>
                <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
                  <p>See what went well, what got missed, and what to follow up on.</p>
                </div>
              </div>
              <div className="relative overflow-hidden *:select-none aspect-5/4 shrink-0 bg-background">
                <img
                  alt="Call feedback"
                  loading="lazy"
                  width={1791}
                  height={1032}
                  decoding="async"
                  className="w-fill absolute bottom-0 left-0 z-1 h-4/5 object-cover object-left md:h-full"
                  style={{ color: "transparent" }}
                  src="/images/caret/illust-after-meeting-1.png"
                />
                <div className="absolute bottom-0 left-0 size-full bg-linear-to-b from-amber-400/0 from-50% to-amber-400/20" />
              </div>
            </div>
            <div className="bg-background flex flex-col">
              <div className="flex grow flex-col px-8 py-7">
                <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
                  Automate the busywork
                </h5>
                <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
                  <p>Draft follow-ups, create tasks, and update notes automatically.</p>
                </div>
              </div>
              <div className="relative overflow-hidden *:select-none aspect-5/4 shrink-0 bg-background">
                <div className="group flex [gap:var(--gap)] overflow-hidden p-2 [--duration:40s] [--gap:1rem] flex-row absolute top-1/2 left-0 z-1 w-full -translate-y-1/2">
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
                  Gets smarter over time
                </h5>
                <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
                  <p>Caret learns from every meeting, so your team&apos;s knowledge grows together.</p>
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
