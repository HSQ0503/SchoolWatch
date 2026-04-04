import type { Metadata } from "next";
import { Montserrat, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

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

export const metadata: Metadata = {
  title: {
    default: "LakerWatch — Windermere Prep Schedule & Period Timer",
    template: "%s | LakerWatch",
  },
  description:
    "Free period countdown timer, daily schedule, and student dashboard for Windermere Preparatory School (WPS) in Windermere, Orlando, Florida. Track odd/even days, lunch waves, school events, and more.",
  keywords: [
    "LakerWatch",
    "Windermere Preparatory School",
    "Windermere Prep",
    "WPS",
    "school schedule",
    "period timer",
    "period countdown",
    "bell schedule",
    "odd even day",
    "student dashboard",
    "Windermere Florida",
    "Orlando Florida",
    "high school schedule",
    "lunch wave",
    "school events calendar",
  ],
  authors: [{ name: "LakerWatch" }],
  openGraph: {
    title: "LakerWatch — Windermere Prep Schedule & Period Timer",
    description:
      "Free period countdown timer and student dashboard for Windermere Preparatory School. Track your schedule, lunch waves, and school events.",
    siteName: "LakerWatch",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LakerWatch — Windermere Prep Schedule & Period Timer",
    description:
      "Free period countdown timer and student dashboard for Windermere Preparatory School.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "geo.region": "US-FL",
    "geo.placename": "Windermere, Florida",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("lakerwatch-theme")==="dark")document.documentElement.classList.add("dark")}catch{}`,
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
