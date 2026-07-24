import { MeetingDetectedPlayer } from "@/components/caret/MeetingDetectedPlayer";
import { SectionLabelBar } from "@/components/caret/SectionLabelBar";
import {
  DotsHorizontalIcon,
  HubSpotIcon,
  LinkedInIcon,
  MailIcon,
  SalesforceCloudIcon,
} from "@/components/icons";

function QuickBriefsCard() {
  return (
    <div data-reveal className="-my-px border border-zinc-800 lg:grid lg:h-96 lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-8">
        <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
          Quick briefs before every call
        </h5>
        <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
          <p>
            Caret pulls relevant info from your calendar, email, and CRM into
            one view.
          </p>
        </div>
        <div className="grow"></div>
        <div className="flex items-center gap-4 pt-8">
          <div>
            <LinkedInIcon className="text-app-teritary-invert [&_path]:fill-app-teritary-invert size-4.5 md:size-5" />
          </div>
          <div>
            <MailIcon className="caret-icon caret-icon-mail-2-solid-icon text-app-teritary-invert [&_path]:fill-app-teritary-invert size-5 md:size-6" />
          </div>
          <div>
            <HubSpotIcon className="text-app-teritary-invert [&_path]:fill-app-teritary-invert size-5 md:size-6" />
          </div>
          <div>
            <SalesforceCloudIcon className="text-app-teritary-invert [&_path]:fill-app-teritary-invert size-5 md:size-6" />
          </div>
          <div>
            <DotsHorizontalIcon className="caret-icon caret-icon-dots-horizontal-icon text-app-teritary-invert [&_path]:fill-app-teritary-invert size-5 md:size-6" />
          </div>
        </div>
      </div>
      <div className="bg-app-primary relative shrink-0 overflow-hidden *:select-none font-sans-alt border-l border-zinc-800 max-lg:aspect-5/4">
        <img
          alt="Call feedback"
          loading="lazy"
          width="1791"
          height="1032"
          decoding="async"
          className="w-fill absolute bottom-0 left-0 z-1 h-4/5 object-cover object-left md:h-full"
          style={{ color: "transparent" }}
          src="/images/caret/illust-before-meeting-2.png"
        />
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
  { alt: "Icon 1", src: "/images/caret/zoom.webp", active: false },
  { alt: "Icon 2", src: "/images/caret/google-meet.webp", active: true },
  { alt: "Icon 3", src: "/images/caret/slack.webp", active: false },
  { alt: "Icon 4", src: "/images/caret/teams.webp", active: false },
  { alt: "Icon 5", src: "/images/caret/webex.webp", active: false },
];

function AnyPlatformCard() {
  return (
    <div data-reveal className="-my-px border border-zinc-800 lg:grid lg:h-96 lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-8">
        <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight md:mb-2 lg:max-w-2/3 lg:text-2xl">
          Works on any platform
        </h5>
        <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
          <p>Zoom, Google Meet, Teams, or any app. Caret records locally without bots.</p>
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
            {DOCK_ICONS.map((icon) => (
              <div key={icon.src} className="shrink-0">
                <img
                  alt={icon.alt}
                  loading="lazy"
                  width="460"
                  height="460"
                  decoding="async"
                  className="size-10 overflow-hidden rounded-lg lg:size-12 lg:rounded-xl"
                  style={{ color: "transparent" }}
                  src={icon.src}
                />
                <div className="mt-1">
                  <div
                    className={
                      icon.active
                        ? "mx-auto -mb-1 size-1 rounded-full bg-app-primary-invert"
                        : "mx-auto -mb-1 size-1 rounded-full"
                    }
                  ></div>
                </div>
              </div>
            ))}
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
    <section className="md:px-8 -my-px md:border-y md:border-zinc-800">
      <SectionLabelBar left="[02] BEFORE THE CALL" right="/ PREPARE" />
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 bg-repeat bg-[url(/images/caret/bg-pattern-dot.svg)]">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <QuickBriefsCard />
          <AnyPlatformCard />
        </div>
      </div>
    </section>
  );
}
