import type { Metadata } from "next";
import { Montserrat, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";
import config from "@/school.config";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin"],
});

const { school, location } = config;

export const metadata: Metadata = {
  title: {
    default: `${school.appName} — ${school.shortName} Schedule & Period Timer`,
    template: `%s | ${school.appName}`,
  },
  description: `Free period countdown timer, daily schedule, and student dashboard for ${school.name} (${school.acronym}) in ${location.city}, Orlando, ${location.state}. Track odd/even days, lunch waves, school events, and more.`,
  keywords: [
    school.appName,
    school.name,
    school.shortName,
    school.acronym,
    "school schedule",
    "period timer",
    "period countdown",
    "bell schedule",
    "odd even day",
    "student dashboard",
    `${location.city} ${location.state}`,
    `Orlando ${location.state}`,
    "high school schedule",
    "lunch wave",
    "school events calendar",
  ],
  authors: [{ name: school.appName }],
  openGraph: {
    title: `${school.appName} — ${school.shortName} Schedule & Period Timer`,
    description: `Free period countdown timer and student dashboard for ${school.name}. Track your schedule, lunch waves, and school events.`,
    siteName: school.appName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${school.appName} — ${school.shortName} Schedule & Period Timer`,
    description: `Free period countdown timer and student dashboard for ${school.name}.`,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: school.logoPath,
    apple: school.logoPath,
  },
  other: {
    "geo.region": `${location.country}-${location.stateCode}`,
    "geo.placename": `${location.city}, ${location.state}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{
        "--school-light-navbar": config.colors.light.navbar,
        "--school-light-nav-text": config.colors.light.navText,
        "--school-light-background": config.colors.light.background,
        "--school-light-heading": config.colors.light.heading,
        "--school-light-ring": config.colors.light.ring,
        "--school-light-surface": config.colors.light.surface,
        "--school-light-card-accent": config.colors.light.cardAccent,
        "--school-light-badge": config.colors.light.badge,
        "--school-dark-navbar": config.colors.dark.navbar,
        "--school-dark-nav-text": config.colors.dark.navText,
        "--school-dark-background": config.colors.dark.background,
        "--school-dark-heading": config.colors.dark.heading,
        "--school-dark-ring": config.colors.dark.ring,
        "--school-dark-surface": config.colors.dark.surface,
        "--school-dark-card-accent": config.colors.dark.cardAccent,
        "--school-dark-badge": config.colors.dark.badge,
      } as React.CSSProperties}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("${config.storagePrefix}-theme")==="dark")document.documentElement.classList.add("dark")}catch{}`,
          }}
        />
      </head>
      <body
        className={`${montserrat.variable} ${dmSans.variable} ${jetbrainsMono.variable} min-h-screen font-body antialiased`}
      >
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-12 pt-20">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
