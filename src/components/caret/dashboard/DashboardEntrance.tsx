"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * On-mount entrance animations for internal dashboards.
 *
 * The role layouts scroll inside an `overflow-y-auto` container, so
 * window-based ScrollTrigger (used by ScrollAnimations on the landing)
 * would never fire. Instead this component plays one entrance timeline
 * on mount, reusing the same data attributes as the /demo dashboard:
 *
 * - `data-label-left` / `data-label-right`  label bar slide-in
 * - `data-reveal`                            fade-up
 * - `data-reveal-group`                      stagger direct children
 * - `data-chart-bars` > `data-bar`           bars grow from the baseline
 *
 * Runs only for `prefers-reduced-motion: no-preference`.
 */
export function DashboardEntrance() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      const labelsLeft = gsap.utils.toArray<HTMLElement>("[data-label-left]");
      if (labelsLeft.length) {
        tl.from(labelsLeft, { x: -24, opacity: 0, duration: 0.55, stagger: 0.08 }, 0);
      }
      const labelsRight = gsap.utils.toArray<HTMLElement>("[data-label-right]");
      if (labelsRight.length) {
        tl.from(labelsRight, { x: 24, opacity: 0, duration: 0.55, stagger: 0.08 }, 0);
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el, index) => {
        tl.from(el, { y: 24, opacity: 0, duration: 0.6 }, 0.1 + index * 0.08);
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group, index) => {
        const items = Array.from(group.children);
        if (!items.length) return;
        tl.from(
          items,
          { y: 24, opacity: 0, duration: 0.55, stagger: 0.07 },
          0.15 + index * 0.12
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-chart-bars]").forEach((chart) => {
        const bars = chart.querySelectorAll("[data-bar]");
        if (!bars.length) return;
        tl.from(
          bars,
          {
            scaleY: 0,
            transformOrigin: "50% 100%",
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.06,
          },
          0.35
        );
      });
    });

    return () => mm.revert();
  });

  return null;
}
