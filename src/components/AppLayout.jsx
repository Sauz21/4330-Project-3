import { useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
export default function AppLayout({
  children,
  page,
  navigate,
  canRecommend,
  onReset,
}) {
  const main = useRef(null);
  useEffect(() => {
    main.current?.focus();
    window.scrollTo(0, 0);
  }, [page]);
  const links = [
    ["home", "⌂", "Home"],
    ...(canRecommend ? [["recommendations", "✧", "Recommendations"]] : []),
    ["packing", "✓", "Packing"],
    ["my-trip", "♡", "My Trip"],
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header">
        <button
          className="brand"
          onClick={() => navigate("home")}
          aria-label="EscapePlan home"
        >
          <span className="brand-mark">↗</span> EscapePlan
          <span className="brand-dot">.</span>
        </button>
        <div className="header-actions">
          <ThemeToggle />
          <button className="text-button reset-plan" onClick={onReset}>
            Reset Plan
          </button>
          <button
            className="saved-link"
            onClick={() => navigate("my-trip")}
          >
            <span aria-hidden="true">♡</span> <span>My Trip</span>
          </button>
        </div>
      </header>
      <main id="main-content" ref={main} tabIndex={-1}>
        {children}
      </main>
      <footer className="app-footer">
        <span>Small plans. Big possibilities.</span>
        <span>● Made for offline adventures</span>
      </footer>
      <nav className="bottom-nav" aria-label="Main navigation">
        {links.map(([target, icon, label]) => (
          <button
            key={target}
            aria-current={page === target ? "page" : undefined}
            onClick={() => navigate(target)}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
