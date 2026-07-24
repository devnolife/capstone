import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/caret/SmoothScroll";
import { ScrollAnimations } from "@/components/caret/ScrollAnimations";

export const metadata: Metadata = {
  title: "Caret - AI meeting assistant that makes you smarter",
  description:
    "Get real-time answers during calls. Caret pulls context from your docs and past meetings in under a second.",
  metadataBase: new URL("https://caret.so"),
  openGraph: {
    title: "Caret - AI meeting assistant that makes you smarter",
    description:
      "Get real-time answers during calls. Caret pulls context from your docs and past meetings in under a second.",
    url: "https://caret.so/",
    siteName: "Caret",
    type: "website",
  },
  icons: {
    icon: "/seo/caret-icon.png",
    apple: "/seo/caret-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Self-hosted Caret webfonts (Figtree, DM Mono, satoshi, ppEditorialNew, …) */}
        <link rel="stylesheet" href="/fonts/caret/fonts.css" />
      </head>
      <body
        suppressHydrationWarning
        className="dark bg-background text-foreground min-h-screen font-sans antialiased"
      >
        <SmoothScroll />
        <ScrollAnimations />
        {children}
      </body>
    </html>
  );
}
