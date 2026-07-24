"use client";

import { MEETING_COMP, MeetingDetectedDemo } from "@/remotion";
import { Player } from "@remotion/player";
import { useEffect, useState } from "react";

/**
 * Animated "Meeting detected → Transcribe" pill for the "Works on any
 * platform" card, rendered as a transparent Remotion Player positioned over
 * the card's DOM gradient (which the pill's liquid-glass backdrop-filter
 * samples) and above-the-dock area.
 *
 * The 400×200 composition keeps the pill centered, so this wrapper places the
 * pill's resting center exactly where the static pill sat (top-10 = 40px top
 * edge → center at 64px: -36px wrapper top + 100px half-height).
 */
export function MeetingDetectedPlayer() {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    const raf = window.requestAnimationFrame(apply);
    mq.addEventListener("change", apply);
    return () => {
      window.cancelAnimationFrame(raf);
      mq.removeEventListener("change", apply);
    };
  }, []);

  return (
    <div className="absolute -top-9 left-1/2 z-1 h-50 w-100 -translate-x-1/2 *:select-none lg:scale-110">
      {reducedMotion !== null && (
        <Player
          acknowledgeRemotionLicense
          key={reducedMotion ? "static" : "animated"}
          component={MeetingDetectedDemo}
          durationInFrames={MEETING_COMP.durationInFrames}
          fps={MEETING_COMP.fps}
          compositionWidth={MEETING_COMP.width}
          compositionHeight={MEETING_COMP.height}
          loop
          autoPlay={!reducedMotion}
          initialFrame={reducedMotion ? 90 : 0}
          controls={false}
          clickToPlay={false}
          initiallyMuted
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
