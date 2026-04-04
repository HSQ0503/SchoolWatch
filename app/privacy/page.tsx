import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "LakerWatch privacy policy — learn how we handle your data. No personal information is collected.",
};

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-muted dark:text-dark-muted">
      <h1 className="font-display text-2xl font-bold text-text dark:text-dark-text">
        Privacy Policy
      </h1>
      <p className="text-xs text-muted dark:text-dark-muted">
        Last updated: February 20, 2026
      </p>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          Overview
        </h2>
        <p>
          LakerWatch is a school utility dashboard and Chrome extension built for
          Windermere Preparatory School students. We are committed to protecting
          your privacy. This policy explains what data we collect (very little)
          and how it is used.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          Data We Collect
        </h2>
        <p>
          <strong className="text-text dark:text-dark-text">We do not collect any personal information.</strong>{" "}
          LakerWatch does not require you to create an account, log in, or
          provide any personal details.
        </p>
        <p>All user preferences are stored locally on your device:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Lunch wave selection (Grades 9/10 or 11/12)</li>
          <li>Theme preference (light or dark mode)</li>
          <li>To-do list items</li>
          <li>Pomodoro session counts</li>
          <li>Wordle game state</li>
        </ul>
        <p>
          This data is saved using your browser&apos;s local storage (or Chrome
          extension storage) and never leaves your device.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          Analytics
        </h2>
        <p>
          The LakerWatch website uses Vercel Analytics to collect anonymous,
          aggregated usage data such as page views and visit counts. No
          personally identifiable information is collected. The Chrome extension
          does not use any analytics.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          Third-Party Services
        </h2>
        <p>
          LakerWatch does not share any data with third parties. We do not use
          cookies, tracking pixels, or advertising networks.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          Chrome Extension
        </h2>
        <p>
          The LakerWatch Chrome extension stores only your lunch wave preference
          using Chrome&apos;s local storage API. No data is transmitted to any
          server. The extension does not access your browsing history, tabs, or
          any other browser data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          Children&apos;s Privacy
        </h2>
        <p>
          LakerWatch is designed for high school students. We do not knowingly
          collect personal information from anyone. Since all data is stored
          locally on the user&apos;s device, no personal data is ever transmitted
          or stored on our servers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          Changes to This Policy
        </h2>
        <p>
          We may update this privacy policy from time to time. Any changes will
          be posted on this page with an updated date.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          Contact
        </h2>
        <p>
          If you have any questions about this privacy policy, please reach out
          via the LakerWatch GitHub repository.
        </p>
      </section>
    </div>
  );
}
