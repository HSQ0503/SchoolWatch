"use client";

import { useState, useEffect } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { storageKey } from "@/lib/storage";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const CATEGORIES = [
  { value: "general", label: "General", color: "bg-gray-400" },
  { value: "homework", label: "Homework", color: "bg-badge" },
  { value: "project", label: "Project", color: "bg-badge/70" },
  { value: "test", label: "Test/Quiz", color: "bg-badge" },
  { value: "personal", label: "Personal", color: "bg-green-500" },
];

function getCategoryColor(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.color ?? "bg-gray-400";
}

function readTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(storageKey("todos"));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function TodoList() {
  const mounted = useHasMounted();
  const [todos, setTodos] = useState<Todo[]>(readTodos);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("general");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(storageKey("todos"), JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const addTodo = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: trimmed,
        completed: false,
        category,
        createdAt: Date.now(),
      },
    ]);
    setText("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((t) => !t.completed));
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-border" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-border" />
        ))}
      </div>
    );
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6">
      {/* Add todo form */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task..."
          className="flex-1 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-2.5 text-text dark:text-dark-text placeholder:text-muted/60 dark:placeholder:text-dark-muted/60 focus:border-card-accent/40 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="appearance-none rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23636e7b%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat py-2.5 pl-3 pr-8 text-text dark:text-dark-text focus:border-card-accent/40 focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          onClick={addTodo}
          className="rounded-xl bg-badge px-4 py-2.5 font-medium text-white transition-colors hover:bg-badge/70"
        >
          Add
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-1">
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-badge text-white"
                : "text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="space-y-2">
        {filtered.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-3"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                todo.completed
                  ? "border-badge bg-badge text-white"
                  : "border-border dark:border-dark-border hover:border-badge"
              }`}
            >
              {todo.completed && (
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <div
              className={`h-2 w-2 rounded-full ${getCategoryColor(todo.category)}`}
            />
            <span
              className={`flex-1 ${todo.completed ? "text-muted dark:text-dark-muted line-through" : "text-text dark:text-dark-text"}`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-muted/40 transition-colors hover:text-card-accent"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="py-8 text-center text-muted dark:text-dark-muted">
          {filter === "completed"
            ? "No completed tasks yet"
            : filter === "active"
              ? "All tasks completed!"
              : "No tasks yet — add one above!"}
        </p>
      )}

      {/* Footer */}
      {todos.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted dark:text-dark-muted">
          <span>
            {activeCount} task{activeCount === 1 ? "" : "s"} remaining
          </span>
          {todos.some((t) => t.completed) && (
            <button
              onClick={clearCompleted}
              className="transition-colors hover:text-card-accent dark:hover:text-dark-text"
            >
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
