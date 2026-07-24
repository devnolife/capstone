"use client";

import { PlaySolidIcon } from "@/components/icons";
import { MINIBAR_COMP, MinibarDemo } from "@/remotion";
import { Player } from "@remotion/player";
import { useEffect, useState } from "react";

function formatMenubarClock(date: Date): string {
  const dayPart = date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timePart = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dayPart.replace(/,/g, "")} ${timePart}`;
}

/**
 * macOS desktop mockup shown in the hero: an animated Remotion Player demo of
 * the Caret "minibar" Q&A cycle (wallpaper + minibar composition), with the
 * macOS menubar (live clock) and YouTube play overlay as DOM layers on top.
 */
export function HeroMockup() {
  const [clock, setClock] = useState("");
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setClock(formatMenubarClock(new Date()));
    const raf = window.requestAnimationFrame(update);
    const interval = window.setInterval(update, 30_000);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearInterval(interval);
    };
  }, []);

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
    <div data-hero-mockup className="relative h-96 overflow-hidden *:select-none md:rounded-xs">
      {reducedMotion !== null && (
        <Player
          acknowledgeRemotionLicense
          key={reducedMotion ? "static" : "animated"}
          component={MinibarDemo}
          durationInFrames={MINIBAR_COMP.durationInFrames}
          fps={MINIBAR_COMP.fps}
          compositionWidth={MINIBAR_COMP.width}
          compositionHeight={MINIBAR_COMP.height}
          loop
          autoPlay={!reducedMotion}
          initialFrame={reducedMotion ? 150 : 0}
          controls={false}
          clickToPlay={false}
          initiallyMuted
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}
      <div className="font-sans-alt absolute top-0 left-0 z-10 flex h-9 w-full items-center px-2 text-sm font-medium text-black">
        <div className="flex items-center *:px-3">
          <span>
            <img src="/images/caret/menubar-apple.svg" alt="Mac" />
          </span>
          <span className="font-bold">Caret</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </div>
        <div className="grow"></div>
        <div className="flex items-center *:px-3 max-md:hidden">
          <span>
            <img src="/images/caret/menubar-wifi.svg" alt="Wifi" />
          </span>
          <span>
            <img src="/images/caret/menubar-spotlight.svg" alt="Spotlight" />
          </span>
          <span>
            <img src="/images/caret/menubar-share.svg" alt="Share" />
          </span>
          <span>
            <img src="/images/caret/menubar-control-center.svg" alt="Control Center" />
          </span>
          <span>{clock}</span>
        </div>
      </div>
      <a
        className="group absolute inset-0 z-20 flex size-full items-center justify-center transition-colors hover:bg-black/20 max-md:bg-black/20"
        target="_blank"
        rel="noreferrer"
        href="https://www.youtube.com/watch?v=ZZVn6w0o8jQ"
      >
        <PlaySolidIcon className="caret-icon caret-icon-play-solid-icon z-1 size-12 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 max-md:opacity-100! md:size-16" />
      </a>
    </div>
  );
}
