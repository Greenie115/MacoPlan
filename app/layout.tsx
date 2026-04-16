import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AppLayoutWrapper } from "@/components/layout/app-layout-wrapper";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.vercel.app'),
  title: {
    default: 'Macro Plan - Smart Meal Planning & Macro Tracking',
    template: '%s | Macro Plan',
  },
  description: 'Stop wasting hours on meal prep. Macro Plan generates personalized meal plans that hit your exact macros instantly. Join 10,000+ users eating better with less effort.',
  keywords: ['meal planning', 'macro calculator', 'nutrition', 'diet', 'fitness', 'personalized meal plans', 'healthy eating', 'macro tracking'],
  openGraph: {
    type: 'website',
    siteName: 'Macro Plan',
    title: 'Macro Plan - Smart Meal Planning & Macro Tracking',
    description: 'Stop wasting hours on meal prep. Macro Plan generates personalized meal plans that hit your exact macros instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Macro Plan - Smart Meal Planning & Macro Tracking',
    description: 'Stop wasting hours on meal prep. Macro Plan generates personalized meal plans that hit your exact macros instantly.',
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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </ThemeProvider>
        <CookieConsent />
        <SpeedInsights />
      </body>
    </html>
  );
}
