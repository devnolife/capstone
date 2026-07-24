import { GitMergeIcon } from "@/components/icons";
import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";

/**
 * "Gets smarter over time" SSO memory chat timeline @30fps (period 8s = 240 frames):
 * - f0–15:    exchange 1 (avatar + bubble + question) pops in
 * - f12–24:   "From past meeting" source label fades in
 * - f22–42:   answer "No, we're planning to support it." pops in
 * - f50–70:   "Feature released" divider chip pops in (scale spring)
 * - f70–90:   exchange 2 (avatar + bubble + question) pops in
 * - f85–97:   "Based on at-inc/acme repository" label fades in
 * - f100–125: answer "Yes, we support SSO with Okta." pops in
 * - f125–232: fully revealed hold (content stays on screen most of the loop)
 * - f232–240: quick fade → clean loop restart
 */
const SOURCE_1_FADE: readonly [number, number] = [12, 24];
const CHIP_START = 50;
const SOURCE_2_FADE: readonly [number, number] = [85, 97];
const FADE_OUT: readonly [number, number] = [232, 240];

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const SMOOTH_SPRING = { damping: 200 } as const;
const SNAPPY_SPRING = { damping: 20, stiffness: 200 } as const;

function popStyle(progress: number): CSSProperties {
  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * 16}px) scale(${0.97 + 0.03 * progress})`,
  };
}

function CasperAvatar() {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center -mr-2">
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
  );
}

interface MemoryMinibarProps {
  question: string;
  source: string;
  answer: string;
  sourceStyle: CSSProperties;
  answerStyle: CSSProperties;
}

function MemoryMinibar({ question, source, answer, sourceStyle, answerStyle }: MemoryMinibarProps) {
  return (
    <div className="relative">
      <div
        className="relative rounded-3xl border-t border-t-white/30 shadow-2xl transition-all"
        data-component="liquid-glass-element"
        style={{ position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 320,
            height: 104,
            overflow: "hidden",
            backdropFilter: "blur(4px) contrast(1.1) brightness(1.05) saturate(1.1)",
            borderRadius: 24,
            cursor: "default",
            userSelect: "none",
            boxShadow:
              "rgba(0, 0, 0, 0.2) 0px 4px 8px, rgba(0, 0, 0, 0.15) 0px -11px 21px inset",
          }}
        />
        <div
        data-component="minibar-content"
        className="font-sans-alt relative overflow-hidden rounded-3xl bg-black/15 transition-all sm:bg-black/30"
        >
          <div
            className="overflow-hidden"
            style={{ opacity: 1, height: "auto", width: "auto", filter: "blur(0px)" }}
          >
            <div className="max-w-80 grow space-y-1.5 px-5 py-3 md:max-w-120 w-72 md:w-80">
              <div className="z-1 w-full">
                <div className="space-y-0.5 py-1">
                  <div className="text-app-primary-invert text-base leading-tight font-semibold tracking-tight">
                    {question}
                  </div>
                  <p
                    className="text-app-secondary-invert text-sm font-medium tracking-tight"
                    style={sourceStyle}
                  >
                    {source}
                  </p>
                </div>
                <div
                  className="text-accent-foreground text-base font-medium tracking-[-0.015em]"
                  style={answerStyle}
                >
                  {answer}
                </div>
              </div>
              <div
                className="absolute inset-0 size-full bg-linear-to-b from-transparent from-75% to-emerald-400/15"
                data-component="minibar-cheatsheet-effect"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SsoChatDemo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const smoothPop = (start: number, durationInFrames: number): number =>
    spring({
      frame: Math.max(0, frame - start),
      fps,
      config: SMOOTH_SPRING,
      durationInFrames,
    });

  const question1Pop = smoothPop(0, 15);
  const source1Opacity = interpolate(frame, [...SOURCE_1_FADE], [0, 1], CLAMP);
  const answer1Pop = smoothPop(22, 20);

  const chipSpring = spring({
    frame: Math.max(0, frame - CHIP_START),
    fps,
    config: SNAPPY_SPRING,
    durationInFrames: 20,
  });
  const chipOpacity = interpolate(frame, [CHIP_START, CHIP_START + 10], [0, 1], CLAMP);

  const question2Pop = smoothPop(70, 20);
  const source2Opacity = interpolate(frame, [...SOURCE_2_FADE], [0, 1], CLAMP);
  const answer2Pop = smoothPop(100, 25);

  const fadeOut = interpolate(frame, [...FADE_OUT], [1, 0], CLAMP);

  const chipStyle: CSSProperties = {
    opacity: chipOpacity,
    transform: `scale(${0.85 + 0.15 * chipSpring})`,
  };

  return (
    <AbsoluteFill className="*:select-none" style={{ opacity: fadeOut }}>
      <div className="absolute inset-0 z-1 flex flex-col items-center justify-center px-4">
        <div className="mb-3 flex scale-75 items-start gap-2" style={popStyle(question1Pop)}>
          <CasperAvatar />
          <MemoryMinibar
            question="Do you support SSO with Okta?"
            source="From past meeting"
            answer="No, we're planning to support it."
            sourceStyle={{ opacity: source1Opacity }}
            answerStyle={popStyle(answer1Pop)}
          />
        </div>
        <div
          className="border-app-secondary bg-app-secondary text-app-primary-invert mb-6 flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-sm"
          style={chipStyle}
        >
          <GitMergeIcon className="caret-icon caret-icon-git-merge-icon text-app-secondary-invert size-4" />
          <span>Feature released</span>
        </div>
        <div className="flex items-start gap-2" style={popStyle(question2Pop)}>
          <CasperAvatar />
          <MemoryMinibar
            question="Do you support SSO with Okta?"
            source="Based on at-inc/acme repository"
            answer="Yes, we support SSO with Okta."
            sourceStyle={{ opacity: source2Opacity }}
            answerStyle={popStyle(answer2Pop)}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default SsoChatDemo;
