import { CaretHeader } from "@/components/caret/CaretHeader";
import { HeroSection } from "@/components/caret/HeroSection";
import { LiveSuggestionSection } from "@/components/caret/LiveSuggestionSection";
import { BeforeCallSection } from "@/components/caret/BeforeCallSection";
import { AfterCallSection } from "@/components/caret/AfterCallSection";
import { PrivacySection } from "@/components/caret/PrivacySection";
import { CtaSection } from "@/components/caret/CtaSection";
import { CaretFooter } from "@/components/caret/CaretFooter";

export default function Home() {
  return (
    <>
      <CaretHeader />
      <main className="pt-14">
        <HeroSection />
        <LiveSuggestionSection />
        <BeforeCallSection />
        <AfterCallSection />
        <PrivacySection />
        <CtaSection />
      </main>
      <CaretFooter />
    </>
  );
}
