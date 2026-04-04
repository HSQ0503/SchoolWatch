import type { Metadata } from "next";
import config from "@/school.config";

export const metadata: Metadata = {
  title: "Productivity Tools",
  description: `Student productivity tools for ${config.school.shortName} — Pomodoro timer, Wordle, group randomizer, and citation generator.`,
};

export default function ProductivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
