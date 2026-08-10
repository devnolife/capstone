"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface DayRevealProps {
  children: ReactNode;
  /** transition delay in ms (stagger) */
  delay?: number;
  className?: string;
}

/**
 * Fade-up reveal when the wrapper enters the viewport.
 * Uses the .day-reveal / .is-visible classes defined in daytona.css.
 */
export function DayReveal({ children, delay = 0, className }: DayRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // ancient environment: reveal immediately without state (no cascading render)
      el.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // reveal when entering the viewport, or if already scrolled past (jump navigation)
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`day-reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
