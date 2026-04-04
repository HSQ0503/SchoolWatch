import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productivity Tools",
  description:
    "Student productivity tools for Windermere Prep — Pomodoro timer, Wordle, group randomizer, and citation generator.",
};

export default function ProductivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
