// Mock data for the Caret dashboard demo (no backend).

export interface Stat {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export interface DayActivity {
  day: string;
  meetings: number;
}

export interface Meeting {
  title: string;
  time: string;
  duration: string;
  platform: "zoom" | "google-meet" | "teams" | "slack" | "webex";
  status: "Recap ready" | "Transcribed" | "Live" | "Scheduled";
}

export interface Suggestion {
  question: string;
  sourceLabel: string;
  answer: string;
  citations: { image: string; title: string; subtitle: string }[];
}

export const STATS: Stat[] = [
  { label: "MEETINGS", value: "12", delta: "+3 vs last week", positive: true },
  { label: "TALK TIME", value: "8h 24m", delta: "-42m vs last week", positive: true },
  { label: "ANSWERS SURFACED", value: "47", delta: "+12 vs last week", positive: true },
  { label: "ANSWER ACCURACY", value: "92%", delta: "+1.4pt vs last week", positive: true },
];

export const WEEKLY_ACTIVITY: DayActivity[] = [
  { day: "MON", meetings: 3 },
  { day: "TUE", meetings: 1 },
  { day: "WED", meetings: 4 },
  { day: "THU", meetings: 2 },
  { day: "FRI", meetings: 2 },
  { day: "SAT", meetings: 0 },
  { day: "SUN", meetings: 0 },
];

export const UP_NEXT: Meeting = {
  title: "Supabase <> Ramp",
  time: "Today · 9:30 PM",
  duration: "45m",
  platform: "google-meet",
  status: "Scheduled",
};

export const UP_NEXT_BRIEF = {
  summary:
    "Second call with the Ramp platform team. Last time pricing objections came up — Jun's Acme playbook is attached as context.",
  facts: [
    ["Company", "Ramp"],
    ["Stage", "Series D"],
    ["Attendees", "Chanhee, John +2"],
    ["Focus", "Instant restore, security"],
  ] as const,
};

export const RECENT_MEETINGS: Meeting[] = [
  { title: "Jun <> Acme (Closed won)", time: "Yesterday · 4:00 PM", duration: "38m", platform: "zoom", status: "Recap ready" },
  { title: "Intro call between Chanhee and John", time: "Yesterday · 11:00 AM", duration: "26m", platform: "google-meet", status: "Recap ready" },
  { title: "Weekly pipeline review", time: "Mon · 9:00 AM", duration: "52m", platform: "teams", status: "Transcribed" },
  { title: "Supabase migration deep-dive", time: "Mon · 3:30 PM", duration: "41m", platform: "webex", status: "Transcribed" },
];

export const SUGGESTIONS: Suggestion[] = [
  {
    question: "Q. I'm using Neon. Do you support Instant restore?",
    sourceLabel: "Answer found from docs and Chanhee's call",
    answer: "Yes, we support it with PITR (Point-In-Time Recovery) and fast database branching.",
    citations: [
      {
        image: "/images/caret/minibar-citation-supabase.png",
        title: "Switch from Neon to Supabase",
        subtitle: "supabase.com",
      },
      {
        image: "/images/caret/minibar-citation-profile.png",
        title: "Intro call between Chanhee and John",
        subtitle: "Past call \u22C5 2w ago",
      },
    ],
  },
  {
    question: "Q. Price is too expensive.",
    sourceLabel: "Past answer from Jun <> Acme (Closed won)",
    answer:
      "I hear you, but most teams actually end up paying less with Supabase once infra + auth + backups are included.",
    citations: [
      {
        image: "/images/caret/minibar-citation-profile2.png",
        title: "Jun <> Acme",
        subtitle: "Past call \u22C5 2w ago",
      },
    ],
  },
];

export const PLATFORM_ICONS: Record<Meeting["platform"], string> = {
  zoom: "/images/caret/zoom.webp",
  "google-meet": "/images/caret/google-meet.webp",
  teams: "/images/caret/teams.webp",
  slack: "/images/caret/slack.webp",
  webex: "/images/caret/webex.webp",
};
