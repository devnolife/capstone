"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Shimmer overlay for the serif "live suggestions" words.
 * Matches live-site behavior: the gradient sweep replays every time the
 * heading enters the viewport (class toggle observed via IntersectionObserver).
 */
export function ShimmerText({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="group/elements relative font-serif font-light italic">
      {children}
      <span
        className={cn(
          "bg-primary absolute inset-0 z-1 mt-0 bg-clip-text leading-none text-transparent transition-opacity duration-200",
          inView
            ? "animate-[shimmer_0.3s_ease-in_forwards_0.2s] opacity-100 delay-200"
            : "opacity-0"
        )}
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent calc(50% - 40px), rgb(18, 165, 148), rgb(233, 61, 130), rgb(255, 178, 36), transparent calc(50% + 40px))",
          backgroundSize: "200% 100%",
          backgroundPosition: "-50% center",
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}
