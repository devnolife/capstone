import { SectionLabelBar } from "@/components/caret/SectionLabelBar";
import { ShimmerText } from "@/components/caret/ShimmerText";
import { InstantAnswersCard } from "@/components/caret/InstantAnswersCard";
import { LearnFromPastCard } from "@/components/caret/LearnFromPastCard";
import { RightQuestionCard } from "@/components/caret/RightQuestionCard";

/**
 * "[01] LIVE SUGGESTION / FEATURES" section — serif-italic shimmer heading
 * plus the three-card bento grid.
 */
export function LiveSuggestionSection() {
  return (
    <section id="fitur" className="md:px-8 -my-px md:border-y md:border-zinc-800">
      <SectionLabelBar left="[01] PANTAUAN LANGSUNG" right="/ FITUR" />
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 bg-repeat bg-[url(/images/caret/bg-pattern-slash.svg)]">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <div data-reveal className="-my-px border border-zinc-800">
            <h3 className="font-display mx-auto max-w-2xl px-6 py-12 text-center text-2xl leading-tight font-medium text-balance md:text-3xl md:leading-9">
              Capstone memberi <ShimmerText>pantauan langsung</ShimmerText> atas project timmu.
              Repo, persyaratan, dan review tak pernah lagi tercecer.
            </h3>
          </div>
          <div
            data-reveal-group
            className="-my-px border border-zinc-800 grid gap-px bg-zinc-800 md:grid-cols-2"
          >
            <InstantAnswersCard />
            <LearnFromPastCard />
            <RightQuestionCard />
          </div>
        </div>
      </div>
    </section>
  );
}
