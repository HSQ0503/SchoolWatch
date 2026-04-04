import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lunch Menu",
  description:
    "Daily lunch menu for Windermere Preparatory School high school students.",
};

export default function LunchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
