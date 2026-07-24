import { CaretHeader } from '@/components/caret/CaretHeader';
import { HeroSection } from '@/components/caret/HeroSection';
import { LiveSuggestionSection } from '@/components/caret/LiveSuggestionSection';
import { BeforeCallSection } from '@/components/caret/BeforeCallSection';
import { AfterCallSection } from '@/components/caret/AfterCallSection';
import { StatsSection } from '@/components/caret/StatsSection';
import { PrivacySection } from '@/components/caret/PrivacySection';
import { CtaSection } from '@/components/caret/CtaSection';
import { CaretFooter } from '@/components/caret/CaretFooter';
import { SmoothScroll } from '@/components/caret/SmoothScroll';
import { ScrollAnimations } from '@/components/caret/ScrollAnimations';

export default function Home() {
  return (
    // Dark island: landing tetap memakai palette zinc gelap Caret
    <div className="dark bg-background text-foreground">
      <SmoothScroll />
      <ScrollAnimations />
      <CaretHeader />
      <main id="main-content" className="pt-14">
        <HeroSection />
        <LiveSuggestionSection />
        <BeforeCallSection />
        <AfterCallSection />
        <StatsSection />
        <PrivacySection />
        <CtaSection />
      </main>
      <CaretFooter />
    </div>
  );
}
