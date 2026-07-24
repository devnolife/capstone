import { ChevronDownIcon, WindowsIcon } from "@/components/icons";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, staticFile } from "remotion";

/**
 * Minibar expand/collapse timeline @30fps (period 10s = 300 frames):
 * - frames 0–78    (0–2.6s):    collapsed hold
 * - frames 78–88   (2.6–2.95s): expand (~0.35s, ease-out)
 * - frames 88–228  (2.95–7.6s): expanded hold
 * - frames 228–238 (7.6–7.95s): collapse (~0.35s)
 * - frames 238–300 (7.95–10s):  collapsed → loop
 */
const EXPAND_START = 78;
const EXPAND_END = 88;
const COLLAPSE_START = 228;
const COLLAPSE_END = 238;

/** Audio bar keyframes: 1.5s period = 45 frames @30fps. */
const AUDIO_PERIOD = 45;

const BAR_1_STOPS = [0, 9, 18, 27, 36, 45];
const BAR_1_HEIGHTS = [4, 9, 10, 6, 8, 4];
const BAR_2_STOPS = [0, 11.25, 22.5, 33.75, 45];
const BAR_2_HEIGHTS = [12, 14, 16, 14, 12];
const BAR_3_STOPS = [0, 13.5, 27, 40.5, 45];
const BAR_3_HEIGHTS = [6, 8, 3, 8, 6];

function audioBarHeight(
  frame: number,
  phaseOffsetFrames: number,
  stops: number[],
  heights: number[],
): number {
  const local =
    (((frame - phaseOffsetFrames) % AUDIO_PERIOD) + AUDIO_PERIOD) % AUDIO_PERIOD;
  return interpolate(local, stops, heights);
}

export function MinibarDemo() {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [EXPAND_START, EXPAND_END, COLLAPSE_START, COLLAPSE_END],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const expandedStyle: React.CSSProperties = {
    opacity: progress,
    maxHeight: progress * 220,
    filter: `blur(${(1 - progress) * 10}px)`,
  };

  const bar1 = audioBarHeight(frame, 0, BAR_1_STOPS, BAR_1_HEIGHTS);
  const bar2 = audioBarHeight(frame, 6, BAR_2_STOPS, BAR_2_HEIGHTS);
  const bar3 = audioBarHeight(frame, 12, BAR_3_STOPS, BAR_3_HEIGHTS);

  return (
    <AbsoluteFill className="*:select-none">
      {/* plain <img>: Remotion's <Img> decode() gets aborted by StrictMode double-mount in dev */}
      <img
        src={staticFile("images/caret/wallpaper-hero.webp")}
        alt=""
        className="absolute inset-0 size-full"
        style={{ objectFit: "cover" }}
      />
      <div className="absolute top-16 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="font-sans-alt flex items-start">
          <div className="-ml-5 flex size-11 shrink-0 items-center justify-center">
            <div className="rounded-full shadow-xl">
              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-transparent shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]">
                <img
                  alt="Capstone"
                  className="h-5 w-auto"
                  src={staticFile("logo.png")}
                />
              </div>
            </div>
          </div>
          <div className="w-fit space-y-2">
            <div className="relative">
              <div className="relative rounded-3xl border-t border-t-white/30 shadow-2xl">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl select-none [backdrop-filter:blur(4px)_contrast(1.1)_brightness(1.05)_saturate(1.1)] [box-shadow:rgba(0,0,0,0.2)_0px_3px_6px,rgba(0,0,0,0.15)_0px_-7px_15px_inset]"></div>
                <div className="font-sans-alt relative overflow-hidden rounded-3xl bg-black/15 sm:bg-black/30">
                  <div className="overflow-hidden">
                    <div className="flex items-center py-1.5 pr-1 pl-2.5">
                      <span className="bg-muted text-muted-foreground relative flex size-6 shrink-0 overflow-hidden rounded-lg text-xs">
                        <img
                          className="pointer-events-none aspect-square size-full object-cover"
                          src={staticFile("logo.png")}
                          alt="Review"
                        />
                      </span>
                      <div className="max-w-36 space-y-0.5 overflow-hidden pr-3 pl-1.5">
                        <p className="text-foreground truncate text-[13px] leading-none font-semibold tracking-[-0.015em]">
                          Review Tim UMKM
                        </p>
                        <p className="text-app-secondary-invert text-[11px] leading-none font-medium">
                          09:30 &#x2192; 5m lagi
                        </p>
                      </div>
                      <div className="border-app-primary bg-app-primary flex size-7 items-center justify-center rounded-full border shadow-sm">
                        <WindowsIcon className="size-4" />
                      </div>
                      <div className="flex items-center gap-0.5 rounded-full pr-0.5 pl-1">
                        <div className="flex size-6 items-center justify-center gap-0.75">
                          <div
                            className="bg-app-secondary-invert w-0.75 rounded-full"
                            style={{ height: bar1 }}
                          ></div>
                          <div
                            className="bg-app-secondary-invert w-0.75 rounded-full"
                            style={{ height: bar2 }}
                          ></div>
                          <div
                            className="bg-app-secondary-invert w-0.75 rounded-full"
                            style={{ height: bar3 }}
                          ></div>
                        </div>
                        <ChevronDownIcon className="caret-icon caret-icon-chevron-down-icon text-app-teritary-invert size-4" />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden" style={expandedStyle}>
                    <div className="w-max max-w-80 grow space-y-1.5 px-5 py-3 md:max-w-120">
                      <div className="z-1 w-full">
                        <div className="space-y-0.5 py-1">
                          <div className="text-app-primary-invert text-base leading-tight font-semibold tracking-tight">
                            Q. Apa bedanya revisi minor dan mayor?
                          </div>
                          <p className="text-app-secondary-invert text-sm font-medium tracking-tight">
                            Jawaban terbaik dari review lalu
                          </p>
                        </div>
                        <div className="text-accent-foreground text-base font-medium tracking-[-0.015em]">
                          <div className="mb-3">
                            Revisi minor cukup ditanggapi lewat komentar inline, sedangkan revisi
                            mayor butuh persetujuan ulang dosen penguji sebelum presentasi.
                          </div>
                          <div className="-mb-0.5 flex items-center gap-1">
                            <div className="border-app-secondary flex w-44 shrink-0 items-center gap-2 rounded-xl border bg-black/10 py-1.5 pr-3 pl-2 *:[text-box-trim:trim-both]">
                              <img
                                className="size-5 rounded-full"
                                alt="Citation"
                                src={staticFile("logo.png")}
                              />
                              <div className="truncate">
                                <p className="text-app-primary-invert truncate text-xs leading-tight font-medium">
                                  Panduan Revisi Capstone
                                </p>
                                <p className="text-app-secondary-invert truncate text-[10px] leading-none">
                                  panduan-capstone.pdf
                                </p>
                              </div>
                            </div>
                            <div className="border-app-secondary flex w-44 shrink-0 items-center gap-2 rounded-xl border bg-black/10 py-1.5 pr-3 pl-2 *:[text-box-trim:trim-both]">
                              <img
                                className="size-5 rounded-full"
                                alt="Citation"
                                src={staticFile("images/caret/minibar-citation-profile.png")}
                              />
                              <div className="truncate">
                                <p className="text-app-primary-invert truncate text-xs leading-tight font-medium">
                                  Review dari Dosen Penguji
                                </p>
                                <p className="text-app-secondary-invert truncate text-[10px] leading-none">
                                  Catatan review &#x22C5; 2 pekan lalu
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 size-full bg-linear-to-b from-transparent from-75% to-emerald-400/15"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default MinibarDemo;
