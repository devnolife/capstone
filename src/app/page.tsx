import { Inter, IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';

import { DayNav } from '@/components/daytona/DayNav';
import { DayHero } from '@/components/daytona/DayHero';
import { DayLogoGrid } from '@/components/daytona/DayLogoGrid';
import { DayInfraCards } from '@/components/daytona/DayInfraCards';
import { DayProgrammaticControl } from '@/components/daytona/DayProgrammaticControl';
import { DayStatusFlow } from '@/components/daytona/DayStatusFlow';
import { DayAiFirst } from '@/components/daytona/DayAiFirst';
import { DayMoreThanSandbox } from '@/components/daytona/DayMoreThanSandbox';
import { DayGettingStarted } from '@/components/daytona/DayGettingStarted';
import { DayHumanInLoop } from '@/components/daytona/DayHumanInLoop';
import { DayTrust } from '@/components/daytona/DayTrust';
import { DayPricing } from '@/components/daytona/DayPricing';
import { DayTestimonials } from '@/components/daytona/DayTestimonials';
import { DayDocker } from '@/components/daytona/DayDocker';
import { DayCta } from '@/components/daytona/DayCta';
import { DayFaq } from '@/components/daytona/DayFaq';
import { DayNewsletter } from '@/components/daytona/DayNewsletter';
import { DayFooter } from '@/components/daytona/DayFooter';
import { DayReveal } from '@/components/daytona/DayReveal';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

const berkeleyMono = localFont({
  src: '../../public/fonts/daytona/YVcQbJFyhl2tYYkDhFd2nL1KlxY.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-berkeley',
  display: 'swap',
});

export default function Home() {
  return (
    <div
      className={`day-root min-h-screen ${inter.variable} ${ibmPlexMono.variable} ${berkeleyMono.variable}`}
    >
      <DayNav />
      <main id="main-content" className="min-h-screen">
        <DayHero />
        <DayReveal>
          <DayLogoGrid />
        </DayReveal>
        <DayReveal>
          <DayInfraCards />
        </DayReveal>
        <DayReveal>
          <DayProgrammaticControl />
        </DayReveal>
        <DayReveal>
          <DayStatusFlow />
        </DayReveal>
        <DayReveal>
          <DayAiFirst />
        </DayReveal>
        <DayReveal>
          <DayMoreThanSandbox />
        </DayReveal>
        <DayReveal>
          <DayGettingStarted />
        </DayReveal>
        <DayReveal>
          <DayHumanInLoop />
        </DayReveal>
        <DayReveal>
          <DayTrust />
        </DayReveal>
        <DayReveal>
          <DayPricing />
        </DayReveal>
        <DayReveal>
          <DayTestimonials />
        </DayReveal>
        <DayReveal>
          <DayDocker />
        </DayReveal>
        <DayReveal>
          <DayCta />
        </DayReveal>
        <DayReveal>
          <DayFaq />
        </DayReveal>
        <DayReveal>
          <DayNewsletter />
        </DayReveal>
      </main>
      <DayFooter />
    </div>
  );
}
