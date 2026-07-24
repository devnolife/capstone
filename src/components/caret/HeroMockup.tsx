"use client";

import { PlaySolidIcon } from "@/components/icons";
import { MINIBAR_COMP, MinibarDemo } from "@/remotion";
import { Player } from "@remotion/player";
import { useEffect, useState } from "react";

function formatMenubarClock(date: Date): string {
  const dayPart = date.toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timePart = date.toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dayPart.replace(/,/g, "")} ${timePart}`;
}

/**
 * Desktop workspace mockup shown in the hero: an animated Remotion Player
 * demo of the Capstone minibar Q&A cycle (wallpaper + minibar composition),
 * with a neutral app topbar (live clock) and a play overlay linking to /demo.
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
      <div className="font-sans-alt absolute top-0 left-0 z-10 flex h-9 w-full items-center px-4 text-sm font-medium text-black">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Capstone" className="h-4 w-auto rounded-[2px]" />
          <span className="font-bold">Capstone</span>
          <span className="opacity-60 max-md:hidden">Workspace</span>
        </div>
        <div className="grow"></div>
        <div className="flex items-center gap-3 max-md:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-2.5 py-0.5 text-xs">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-600" />
            Semester aktif
          </span>
          <span>{clock}</span>
        </div>
      </div>
      <a
        className="group absolute inset-0 z-20 flex size-full items-center justify-center transition-colors hover:bg-black/20 max-md:bg-black/20"
        href="/demo"
      >
        <PlaySolidIcon className="caret-icon caret-icon-play-solid-icon z-1 size-12 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 max-md:opacity-100! md:size-16" />
      </a>
    </div>
  );
}
