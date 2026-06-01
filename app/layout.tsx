import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AppLayoutWrapper } from "@/components/layout/app-layout-wrapper";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics } from "@/components/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.app'),
  title: {
    default: 'MacroPlan - Smart Meal Planning & Macro Tracking',
    template: '%s | MacroPlan',
  },
  description: 'Stop wasting hours on meal prep. MacroPlan generates batch-cook meal plans that hit your exact macros in seconds. Built for lifters who actually meal prep.',
  keywords: ['meal planning', 'macro calculator', 'nutrition', 'diet', 'fitness', 'personalized meal plans', 'healthy eating', 'macro tracking', 'meal prep', 'batch cooking'],
  openGraph: {
    type: 'website',
    siteName: 'MacroPlan',
    title: 'MacroPlan - Smart Meal Planning & Macro Tracking',
    description: 'Stop wasting hours on meal prep. MacroPlan generates batch-cook meal plans that hit your exact macros in seconds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MacroPlan - Smart Meal Planning & Macro Tracking',
    description: 'Stop wasting hours on meal prep. MacroPlan generates batch-cook meal plans that hit your exact macros in seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </ThemeProvider>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
