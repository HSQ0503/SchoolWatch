import type { Metadata } from "next";
import TodoList from "@/components/TodoList";
import Link from "next/link";
import config from "@/school.config";

export const metadata: Metadata = {
  title: "To-Do List",
  description: `Manage your school tasks and assignments with the ${config.school.appName} to-do list.`,
};

export default function ProductivityTodosPage() {
  return (
    <div>
      <Link
        href="/productivity"
        className="mb-8 inline-block text-sm text-muted transition-colors hover:text-card-accent dark:text-dark-muted dark:hover:text-dark-text"
      >
        ← Back to Productivity
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-text dark:text-dark-text">
        To-Do List
      </h1>
      <TodoList />
    </div>
  );
}
