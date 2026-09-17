import { useLayoutEffect, useState } from "react";

const storageKey = "escapeplan.theme";

function initialTheme() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // A blocked storage API should not prevent the app from opening.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(initialTheme);
  const dark = theme === "dark";

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggle() {
    const next = dark ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // The toggle still works for this session when storage is unavailable.
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Dark mode"
      aria-pressed={dark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />
        )}
      </svg>
      <span className="theme-toggle-label">Dark mode</span>
    </button>
  );
}
