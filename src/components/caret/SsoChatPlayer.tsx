"use client";

import { SSO_CHAT_COMP, SsoChatDemo } from "@/remotion";
import { Player } from "@remotion/player";
import { useEffect, useState } from "react";

/**
 * Animated "Gets smarter over time" SSO chat exchange, rendered as a
 * transparent Remotion Player overlay above the DOM gradient background in
 * AfterCallSection. With reduced motion, shows the fully-revealed hold frame.
 */
export function SsoChatPlayer() {
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

  if (reducedMotion === null) {
    return null;
  }

  return (
    <Player
      acknowledgeRemotionLicense
      key={reducedMotion ? "static" : "animated"}
      component={SsoChatDemo}
      durationInFrames={SSO_CHAT_COMP.durationInFrames}
      fps={SSO_CHAT_COMP.fps}
      compositionWidth={SSO_CHAT_COMP.width}
      compositionHeight={SSO_CHAT_COMP.height}
      loop
      autoPlay={!reducedMotion}
      initialFrame={reducedMotion ? 200 : 0}
      controls={false}
      clickToPlay={false}
      initiallyMuted
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
    />
  );
}
