"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * Page-wide GSAP orchestrator. Sections stay server components and opt in
 * via data attributes:
 *
 * - `data-hero-header`   fixed header, fades down on load
 * - `data-hero-title`    hero h1, SplitText word stagger on load
 * - `data-hero-item`     hero sub/badge/CTA, sequential fade-up on load
 * - `data-hero-mockup`   hero mockup, rise on load + scroll parallax
 * - `data-reveal`        fade-up once when scrolled into view
 * - `data-reveal-group`  stagger direct children once in view
 * - `data-parallax="8"`  scrubbed yPercent parallax on card visuals
 * - `data-label-left` / `data-label-right`  label-bar text slide-in
 *
 * Everything runs only for `prefers-reduced-motion: no-preference`.
 */
export function ScrollAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ---------- Hero entrance timeline (on load) ----------
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        const header = document.querySelector("[data-hero-header]");
        if (header) {
          tl.from(header, { y: -14, opacity: 0, duration: 0.55, ease: "power2.out" }, 0);
        }

        const title = document.querySelector("[data-hero-title]");
        if (title) {
          const split = SplitText.create(title, { type: "words", wordsClass: "hero-word" });
          gsap.set(title, { opacity: 1 });
          tl.from(
            split.words,
            {
              y: 38,
              opacity: 0,
              filter: "blur(8px)",
              duration: 0.85,
              stagger: 0.06,
            },
            0.1
          );
        }

        const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero-item]");
        if (heroItems.length) {
          tl.from(
            heroItems,
            { y: 22, opacity: 0, duration: 0.6, stagger: 0.09, ease: "power2.out" },
            0.55
          );
        }

        const mockup = document.querySelector("[data-hero-mockup]");
        if (mockup) {
          tl.from(mockup, { y: 48, opacity: 0, duration: 0.9, ease: "power2.out" }, 0.75);
          // gentle parallax while scrolling past the hero
          gsap.to(mockup, {
            y: -20,
            ease: "none",
            scrollTrigger: {
              trigger: mockup,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }

        // ---------- Scroll reveals ----------
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 32,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
          const items = Array.from(group.children);
          if (!items.length) return;
          gsap.from(items, {
            y: 32,
            opacity: 0,
            duration: 0.75,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: { trigger: group, start: "top 80%", once: true },
          });
        });

        // ---------- Label bars ----------
        gsap.utils.toArray<HTMLElement>("[data-label-left]").forEach((el) => {
          gsap.from(el, {
            x: -24,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>("[data-label-right]").forEach((el) => {
          gsap.from(el, {
            x: 24,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        // ---------- Chart bars grow from the baseline ----------
        gsap.utils.toArray<HTMLElement>("[data-chart-bars]").forEach((chart) => {
          const bars = chart.querySelectorAll("[data-bar]");
          if (!bars.length) return;
          gsap.from(bars, {
            scaleY: 0,
            transformOrigin: "50% 100%",
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.06,
            scrollTrigger: { trigger: chart, start: "top 85%", once: true },
          });
        });

        // ---------- Scrubbed parallax on card visuals ----------
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = parseFloat(el.dataset.parallax || "8");
          gsap.fromTo(
            el,
            { yPercent: amount },
            {
              yPercent: -amount,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            }
          );
        });

        // ---------- Watermark signature moment ----------
        const watermark = document.querySelector("[data-watermark]");
        if (watermark) {
          gsap.fromTo(
            watermark,
            { yPercent: 40, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: watermark,
                start: "top bottom",
                end: "top 55%",
                scrub: 0.5,
              },
            }
          );
        }
      });

    return () => mm.revert();
  });

  return null;
}
