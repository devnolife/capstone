"use client";

import { useEffect, useState } from "react";

function getGreeting(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/**
 * Greeting row for role dashboards — display-font greeting on the left,
 * mono date + week chip on the right (mirrors the /demo topbar date chip).
 */
export function DashboardGreeting({
  userName,
  subtitle = "Ini ringkasan progres capstone-mu hari ini.",
}: {
  userName: string;
  subtitle?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  // Ambil kata pertama; kalau itu gelar (berakhiran titik, mis. "Dr."),
  // sertakan kata berikutnya: "Dr. Andi"
  const parts = userName.trim().split(/\s+/);
  const firstName =
    parts[0]?.endsWith('.') && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0] || userName;

  return (
    <div data-reveal className="mb-2 pt-1">
      <h1 className="font-display text-2xl leading-none font-[450] tracking-tight md:text-3xl">
        {now ? getGreeting(now.getHours()) : "Halo"}, {firstName}
      </h1>
      <p className="text-app-secondary-invert mt-1.5 text-sm">{subtitle}</p>
    </div>
  );
}
