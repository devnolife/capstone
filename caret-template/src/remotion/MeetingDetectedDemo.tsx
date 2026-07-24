import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";

/**
 * "Meeting detected" pill timeline @30fps (period 6s = 180 frames):
 * - frames 0–18:    pill slides in from above (y -24 → 0, opacity 0 → 1, spring)
 * - frames 18+:     green status dot pulse begins (Tailwind `animate-pulse`
 *                   replica: opacity 1 ↔ 0.5, 2s period = 60 frames, sine-based)
 * - frames 55–70:   "Transcribe" button emphasis (scale 1 → 1.06 → 1 + brightness)
 * - frames 70–150:  hold with continuing dot pulse
 * - frames 150–180: pill fades out (opacity → 0, y → -12) for a clean loop restart
 *
 * The composition background stays transparent: the gradient artwork and the
 * dock live in the DOM behind/below the Player, which also keeps the pill's
 * liquid-glass backdrop-filter sampling the real gradient.
 */
const PULSE_START = 18;
const PULSE_PERIOD = 60;
const EMPHASIS_START = 55;
const EMPHASIS_PEAK = 62;
const EMPHASIS_END = 70;
const EXIT_START = 168;
const EXIT_END = 180;

export function MeetingDetectedDemo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const enterY = interpolate(enter, [0, 1], [-24, 0]);
  const enterOpacity = Math.min(1, enter);

  const exitY = interpolate(frame, [EXIT_START, EXIT_END], [0, -12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const exitOpacity = interpolate(frame, [EXIT_START, EXIT_END], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const dotOpacity =
    frame < PULSE_START
      ? 1
      : 0.75 +
        0.25 *
          Math.sin(((frame - PULSE_START) * 2 * Math.PI) / PULSE_PERIOD + Math.PI / 2);

  const emphasis = interpolate(
    frame,
    [EMPHASIS_START, EMPHASIS_PEAK, EMPHASIS_END],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );
  const buttonScale = 1 + 0.06 * emphasis;
  const buttonBrightness = 1 + 0.1 * emphasis;

  return (
    <AbsoluteFill className="items-center justify-center *:select-none">
      <div
        style={{
          opacity: enterOpacity * exitOpacity,
          transform: `translateY(${enterY + exitY}px)`,
        }}
      >
        <div
          className="relative rounded-3xl border-t border-t-white/30 shadow-2xl"
          data-component="liquid-glass-element"
        >
          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "290.625px",
              height: "48px",
              overflow: "hidden",
              backdropFilter: "blur(4px) contrast(1.1) brightness(1.05) saturate(1.1)",
              borderRadius: "24px",
              cursor: "default",
              userSelect: "none",
              boxShadow:
                "rgba(0, 0, 0, 0.2) 0px 3px 7px, rgba(0, 0, 0, 0.15) 0px -8px 17px inset",
            }}
          ></div>
          <div
            data-component="minibar-content"
            className="font-sans-alt relative overflow-hidden rounded-3xl bg-black/15 sm:bg-black/30"
          >
            <div className="overflow-hidden">
              <div className="z-1 flex w-max items-center p-2">
                <div className="flex shrink-0 items-center justify-center mr-2 size-8">
                  <div className="rounded-full shadow-xl">
                    <div
                      className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                      style={{
                        border: "1px solid transparent",
                        background:
                          "linear-gradient(to right, var(--color-emerald-800), var(--color-emerald-800)) padding-box, linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4) 2%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0) 95%, rgba(255, 255, 255, 0.2) 100%) border-box",
                        backgroundClip: "padding-box, border-box",
                        backgroundOrigin: "border-box",
                        boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {/* plain <img>: Remotion's <Img> calls decode(), which throws EncodingError on SVG in Chromium */}
                      <img
                        src={staticFile("images/caret/character-casper.svg")}
                        alt="Caret"
                        className="-mb-1.75 h-6 w-auto"
                      />
                    </div>
                  </div>
                </div>
                <div className="mr-5 shrink-0 grow space-y-1 font-semibold">
                  <p className="text-app-primary-invert flex items-center gap-1 text-sm leading-none">
                    <span>Meeting detected</span>
                    <span
                      className="size-1.5 rounded-full bg-green-500"
                      style={{ opacity: dotOpacity }}
                    ></span>
                  </p>
                  <p className="text-app-secondary-invert text-xs leading-none">
                    Google Meet
                  </p>
                </div>
                <div
                  className="text-accent-foreground flex h-8 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-500 px-3 text-sm font-medium"
                  style={{
                    transform: `scale(${buttonScale})`,
                    filter: `brightness(${buttonBrightness})`,
                  }}
                >
                  <span>Transcribe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default MeetingDetectedDemo;
