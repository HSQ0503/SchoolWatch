import type { Metadata } from "next";
import ScheduleView from "@/components/ScheduleView";
import config from "@/school.config";

export const metadata: Metadata = {
  title: "Full Schedule",
  description: `View the full weekly bell schedule for ${config.school.name} including Monday, odd day, and even day periods with lunch wave times.`,
};

export default function SchedulePage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-text dark:text-dark-text">
        Full Schedule
      </h1>
      <ScheduleView />
    </div>
  );
}
