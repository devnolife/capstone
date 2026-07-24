"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationHatIcon, HelpCircleIcon, Star7Icon } from "@/components/icons";

type PillId = "context" | "deeper" | "intent";
type Keyword = "perlu revisi" | "deployment";

const ACTIVE_PILL_CLASS =
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-primary text-background hover:bg-primary/90 shadow-xs h-8 gap-1.5 px-3 has-[>svg]:px-2.5 rounded-full";

const INACTIVE_PILL_CLASS =
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-background hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 border shadow-xs h-8 gap-1.5 px-3 has-[>svg]:px-2.5 rounded-full";

const QUESTION_PREFIX = "Fitur selesai 80%. Tapi deployment masih ";
const QUESTION_EMPHASIS = "perlu revisi";
const QUESTION_SUFFIX = ".";
const QUESTION_LENGTH =
  QUESTION_PREFIX.length + QUESTION_EMPHASIS.length + QUESTION_SUFFIX.length;

const CHIP_SHOW_AT_MS = 500;
const CHIP_HIDE_AT_MS = 1400;
const SEQUENCE_END_MS = 1700;
const TYPE_DURATION_MS = 700;

export function RightQuestionCard() {
  const prefersReducedMotion = useReducedMotion();

  const [activePill, setActivePill] = useState<PillId>("context");
  const [keyword, setKeyword] = useState<Keyword>("perlu revisi");
  const [typedCount, setTypedCount] = useState(QUESTION_LENGTH);
  const [suggestionVisible, setSuggestionVisible] = useState(true);
  const [chipVisible, setChipVisible] = useState(false);

  const runningRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    for (const id of timeoutsRef.current) clearTimeout(id);
    timeoutsRef.current = [];
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const handlePillClick = useCallback(
    (pill: PillId) => {
      // Ignore clicks while a sequence is running.
      if (runningRef.current) return;

      setActivePill(pill);
      setKeyword((prev) => (prev === "perlu revisi" ? "deployment" : "perlu revisi"));

      if (prefersReducedMotion) {
        // Instant swap: content stays visible, chip stays hidden.
        setTypedCount(QUESTION_LENGTH);
        setSuggestionVisible(true);
        setChipVisible(false);
        return;
      }

      runningRef.current = true;

      // t=0: clear the Signal card content.
      setTypedCount(0);
      setSuggestionVisible(false);

      // t≈500ms: chip pops in, typewriter starts.
      schedule(() => {
        setChipVisible(true);
        const stepMs = TYPE_DURATION_MS / QUESTION_LENGTH;
        let count = 0;
        intervalRef.current = setInterval(() => {
          count += 1;
          setTypedCount(count);
          if (count >= QUESTION_LENGTH) {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            // Suggestion fades in after typing finishes.
            setSuggestionVisible(true);
          }
        }, stepMs);
      }, CHIP_SHOW_AT_MS);

      // t≈1500ms: chip animates back out.
      schedule(() => {
        setChipVisible(false);
      }, CHIP_HIDE_AT_MS);

      // Sequence done — accept clicks again.
      schedule(() => {
        runningRef.current = false;
      }, SEQUENCE_END_MS);
    },
    [prefersReducedMotion, schedule],
  );

  const prefixTyped = QUESTION_PREFIX.slice(0, Math.min(typedCount, QUESTION_PREFIX.length));
  const emphasisTyped = QUESTION_EMPHASIS.slice(
    0,
    Math.min(Math.max(typedCount - QUESTION_PREFIX.length, 0), QUESTION_EMPHASIS.length),
  );
  const suffixTyped = QUESTION_SUFFIX.slice(
    0,
    Math.max(typedCount - QUESTION_PREFIX.length - QUESTION_EMPHASIS.length, 0),
  );

  return (
    <>
      <div className="bg-background flex flex-col">
      <div className="flex grow flex-col px-8 py-7">
        <h5 className="font-display mb-2 text-xl leading-tight font-medium tracking-tight text-balance md:mb-2 lg:max-w-2/3 lg:text-2xl">
          Tahu pertanyaan yang tepat saat presentasi
        </h5>
        <div className="text-app-secondary-invert grow text-base text-pretty md:text-lg md:leading-snug">
          <div className="flex h-full flex-col">
            <p>Capstone menangkap konteks project dan menyarankan pertanyaan lanjutan untuk dosen penguji.</p>
            <div className="grow"></div>
            <div className="flex flex-wrap gap-x-1 gap-y-2">
              <button
                className={activePill === "context" ? ACTIVE_PILL_CLASS : INACTIVE_PILL_CLASS}
                type="button"
                onClick={() => handlePillClick("context")}
              >
                <GraduationHatIcon className="caret-icon caret-icon-graduation-hat-solid-icon" />
                <span>Konteks</span>
              </button>
              <button
                className={activePill === "deeper" ? ACTIVE_PILL_CLASS : INACTIVE_PILL_CLASS}
                type="button"
                onClick={() => handlePillClick("deeper")}
              >
                <HelpCircleIcon className="caret-icon caret-icon-help-circle-solid-icon" />
                <span>Lebih dalam</span>
              </button>
              <button
                className={activePill === "intent" ? ACTIVE_PILL_CLASS : INACTIVE_PILL_CLASS}
                type="button"
                onClick={() => handlePillClick("intent")}
              >
                <Star7Icon className="caret-icon caret-icon-star-7-solid-icon" />
                <span>Tujuan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div className="bg-app-primary relative overflow-hidden *:select-none shrink-0 aspect-square bg-[url('/images/caret/wallpaper.webp')] bg-cover bg-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 md:gap-4 md:p-8">
          <div className="w-full max-w-md rounded-xl bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-sm md:rounded-2xl md:p-6">
            <div className="mb-3 flex items-start gap-2 md:mb-4 md:gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400 md:size-6 md:text-sm">?</div>
              <div className="text-xs text-zinc-400 md:text-sm">Sinyal</div>
            </div>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-start gap-2 text-base leading-relaxed md:gap-3 md:text-lg">
                <span className="shrink-0 font-medium text-zinc-300">Q.</span>
                <div className="text-zinc-100">
                  {prefixTyped}
                  {emphasisTyped.length > 0 && (
                    <span className="font-semibold text-white">{emphasisTyped}</span>
                  )}
                  {suffixTyped}
                </div>
              </div>
              <motion.div
                className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300 md:gap-3 md:text-base"
                initial={false}
                animate={{ opacity: suggestionVisible ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <span className="text-green-400">&#x21B3; &#x2728;</span>
                <p>Kendala apa yang tim temui saat deploy, dan bagaimana mengatasinya?</p>
              </motion.div>
            </div>
          </div>
          <motion.button
            className="group relative flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl md:gap-2 md:px-6 md:py-3 md:text-base"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={
              chipVisible
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: -20, scale: 0.95 }
            }
            transition={
              chipVisible
                ? {
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                    opacity: { duration: 0.15, ease: "easeOut" },
                  }
                : { duration: 0.2, ease: "easeOut" }
            }
          >
            <div className="flex size-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white md:size-5 md:text-xs">?</div>
            <span>Tanya lebih dalam soal</span>
            <span className="font-semibold text-green-600">{keyword}</span>
            <span className="ml-0.5 size-1.5 animate-pulse rounded-full bg-green-500 md:ml-1 md:size-2"></span>
            {chipVisible && <span className="ml-0.5 text-xs md:text-sm">&#x1F446;</span>}
          </motion.button>
        </div>
      </div>
    </>
  );
}
