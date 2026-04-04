import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WPS-Media",
  description:
    "Weekly PrepTalk videos from Windermere Preparatory School.",
};

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
