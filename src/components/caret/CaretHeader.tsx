"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CaretLogo, ChevronDownIcon, GlobeIcon } from "@/components/icons";
import { DownloadButton } from "@/components/caret/DownloadButton";
import { MenuRadioItem, MenuSurface, useDropdown } from "@/components/caret/DropdownLite";
import { cn } from "@/lib/utils";

const LANGUAGES = ["Indonesia", "English"] as const;

function LanguageMenu() {
  const { open, setOpen, rootRef } = useDropdown();
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("Indonesia");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-primary/5 hover:text-accent-foreground dark:hover:bg-accent/50 h-8 has-[>svg]:px-2.5 gap-1.5 rounded-full px-2.5"
      >
        <GlobeIcon className="caret-icon caret-icon-globe-solid-icon size-4" />
        <span className="text-sm">{language}</span>
        <ChevronDownIcon
          className={cn(
            "caret-icon caret-icon-chevron-down-icon size-4 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <MenuSurface open={open} align="end">
        {LANGUAGES.map((lang) => (
          <MenuRadioItem
            key={lang}
            checked={language === lang}
            onSelect={() => {
              setLanguage(lang);
              setOpen(false);
            }}
          >
            {lang}
          </MenuRadioItem>
        ))}
      </MenuSurface>
    </div>
  );
}

const navPillClass =
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center gap-2 border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-primary/5 hover:text-accent-foreground dark:hover:bg-accent/50 h-9 px-4 py-2 has-[>svg]:px-3 text-app-secondary-invert rounded-full";

export function CaretHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  const dashboardUrl = (() => {
    switch (session?.user?.role) {
      case "ADMIN":
        return "/admin/dashboard";
      case "DOSEN_PENGUJI":
        return "/dosen/dashboard";
      case "MAHASISWA":
        return "/mahasiswa/dashboard";
      default:
        return "/login";
    }
  })();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-hero-header
      className={cn(
        "bg-background fixed top-0 left-0 z-50 w-full border-b px-6 transition-colors duration-300",
        scrolled ? "border-zinc-800" : "border-transparent"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-(--breakpoint-xl) grid-cols-2 items-center justify-between gap-2">
        <Link href="/">
          <CaretLogo className="-mt-0.5 h-6 w-auto md:h-7 [&_path]:transition-all" />
        </Link>
        <div className="flex grow gap-1 max-md:hidden md:px-7">
          <Link className={cn(navPillClass, "text-primary!")} href="/">
            Beranda
          </Link>
          <a className={navPillClass} href="#fitur">
            Fitur
          </a>
          <a className={navPillClass} href="#alur">
            Alur
          </a>
          {!session && (
            <a className={navPillClass} href="/login">
              Masuk
            </a>
          )}
        </div>
        <div className="flex items-center justify-end gap-1">
          <LanguageMenu />
          {session ? (
            <Link
              href={dashboardUrl}
              className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none"
            >
              Dashboard
              <span aria-hidden>&rarr;</span>
            </Link>
          ) : (
            <DownloadButton size="sm" />
          )}
        </div>
      </nav>
    </div>
  );
}
