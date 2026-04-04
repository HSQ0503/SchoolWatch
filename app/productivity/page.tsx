"use client";

import Link from "next/link";

const TOOLS = [
  {
    name: "Pomodoro Timer",
    description: "Stay focused with timed work sessions and breaks",
    icon: "⏱",
    href: "/productivity/pomodoro",
    external: false,
    accent: "border-l-red dark:border-l-red-light",
  },
  {
    name: "Citations",
    description: "Create MLA, APA, and Chicago citations instantly",
    icon: "📚",
    href: "https://www.mybib.com/",
    external: true,
    accent: "border-l-red",
  },
  {
    name: "Group Randomizer",
    description: "Spin the wheel to pick names or create random groups",
    icon: "🎲",
    href: "/productivity/randomizer",
    external: false,
    accent: "border-l-red-light dark:border-l-red-light",
  },
  {
    name: "Wordle",
    description: "Guess the daily 5-letter word in 6 tries",
    icon: "🟩",
    href: "/productivity/wordle",
    external: false,
    accent: "border-l-[#6aaa64]",
  },
  {
    name: "To-Do List",
    description: "Track your assignments, projects, and tasks",
    icon: "✅",
    href: "/productivity/todos",
    external: false,
    accent: "border-l-red dark:border-l-red-light",
  },
];

export default function ProductivityPage() {
  return (
    <div>
      <h1 className="mb-2 font-display text-4xl font-extrabold text-text dark:text-dark-text md:text-5xl">
        Productivity
      </h1>
      <p className="mb-8 text-lg text-muted dark:text-dark-muted">
        Tools to help you stay on track
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => {
          const content = (
            <>
              <div className="mb-3 text-3xl">{tool.icon}</div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-bold text-text dark:text-dark-text">
                    {tool.name}
                  </p>
                  <p className="mt-1 text-sm text-muted dark:text-dark-muted">
                    {tool.description}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-red dark:text-red-light">
                {tool.external ? "External ↗" : "Open →"}
              </p>
            </>
          );

          if (tool.external) {
            return (
              <a
                key={tool.name}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-xl border border-border border-l-[3px] ${tool.accent} bg-white p-5 transition-colors hover:bg-bg dark:border-dark-border dark:bg-dark-surface dark:hover:bg-white/10`}
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={tool.name}
              href={tool.href}
              className={`rounded-xl border border-border border-l-[3px] ${tool.accent} bg-white p-5 transition-colors hover:bg-bg dark:border-dark-border dark:bg-dark-surface dark:hover:bg-white/10`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
