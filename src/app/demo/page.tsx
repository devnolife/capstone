import type { Metadata } from "next";
import { DashSidebar } from "@/components/caret/dashboard/DashSidebar";
import { DashTopbar } from "@/components/caret/dashboard/DashTopbar";
import { StatCards } from "@/components/caret/dashboard/StatCards";
import { ActivityChart } from "@/components/caret/dashboard/ActivityChart";
import { MeetingLists } from "@/components/caret/dashboard/MeetingLists";
import { SuggestionsFeed } from "@/components/caret/dashboard/SuggestionsFeed";
import { ScrollAnimations } from "@/components/caret/ScrollAnimations";

export const metadata: Metadata = {
  title: "Demo Dashboard - Capstone",
  description: "Demo dashboard pemantauan capstone Prodi Informatika Unismuh Makassar.",
};

function LabelRow({ left, right }: { left: string; right: string }) {
  return (
    <div className="text-primary/50 flex h-10 items-center justify-between font-mono text-[10px] font-medium tracking-wider md:text-xs">
      <span data-label-left>{left}</span>
      <span data-label-right>{right}</span>
    </div>
  );
}

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen">
      <ScrollAnimations />
      <DashSidebar />
      <div className="lg:pl-60">
        <DashTopbar />
        <main className="mx-auto max-w-6xl px-4 pt-4 pb-16 md:px-6">
          <LabelRow left="[SEN] RINGKASAN" right="/ PEKAN INI" />
          <StatCards />

          <LabelRow left="[SEL] AKTIVITAS" right="/ REVIEW" />
          <div
            data-reveal
            className="border-zinc-800 grid gap-px border bg-zinc-800 lg:grid-cols-[1.1fr_1fr]"
          >
            <ActivityChart />
            <MeetingLists />
          </div>

          <LabelRow left="[RAB] PANTAUAN LANGSUNG" right="/ RIWAYAT" />
          <SuggestionsFeed />
        </main>
      </div>
    </div>
  );
}
