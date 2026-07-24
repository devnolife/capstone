import type { Metadata } from "next";
import { DashSidebar } from "@/components/caret/dashboard/DashSidebar";
import { DashTopbar } from "@/components/caret/dashboard/DashTopbar";
import { StatCards } from "@/components/caret/dashboard/StatCards";
import { ActivityChart } from "@/components/caret/dashboard/ActivityChart";
import { MeetingLists } from "@/components/caret/dashboard/MeetingLists";
import { SuggestionsFeed } from "@/components/caret/dashboard/SuggestionsFeed";

export const metadata: Metadata = {
  title: "Overview - Caret Dashboard",
  description: "Meeting analytics overview for the Caret clone demo.",
};

function LabelRow({ left, right }: { left: string; right: string }) {
  return (
    <div className="text-primary/50 flex h-10 items-center justify-between font-mono text-[10px] font-medium tracking-wider md:text-xs">
      <span data-label-left>{left}</span>
      <span data-label-right>{right}</span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <DashSidebar />
      <div className="lg:pl-60">
        <DashTopbar />
        <main className="mx-auto max-w-6xl px-4 pt-4 pb-16 md:px-6">
          <LabelRow left="[MON] OVERVIEW" right="/ THIS WEEK" />
          <StatCards />

          <LabelRow left="[TUE] ACTIVITY" right="/ MEETINGS" />
          <div
            data-reveal
            className="border-zinc-800 grid gap-px border bg-zinc-800 lg:grid-cols-[1.1fr_1fr]"
          >
            <ActivityChart />
            <MeetingLists />
          </div>

          <LabelRow left="[WED] LIVE SUGGESTIONS" right="/ MEMORY" />
          <SuggestionsFeed />
        </main>
      </div>
    </div>
  );
}
