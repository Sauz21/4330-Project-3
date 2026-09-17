import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import App from "../App.jsx";

function systemTheme(dark) {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: dark })));
}

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  vi.unstubAllGlobals();
});

it("starts in the device's dark theme when no preference is saved", () => {
  systemTheme(true);
  render(<App />);
  expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute("aria-pressed", "true");
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  expect(localStorage.getItem("escapeplan.theme")).toBeNull();
});

it("uses a saved light preference even on a dark device", () => {
  systemTheme(true);
  localStorage.setItem("escapeplan.theme", "light");
  render(<App />);
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
});

it("toggles with the keyboard and preserves the choice across navigation and remounts", async () => {
  systemTheme(false);
  const user = userEvent.setup();
  const view = render(<App />);
  const toggle = screen.getByRole("button", { name: "Dark mode" });
  toggle.focus();
  await user.keyboard("{Enter}");
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(localStorage.getItem("escapeplan.theme")).toBe("dark");
  await user.click(screen.getByRole("button", { name: "Plan a trip" }));
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  view.unmount();
  render(<App />);
  expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
  expect(localStorage.getItem("escapeplan.theme")).toBe("light");
});

it("ignores an invalid stored theme and falls back to the device preference", () => {
  systemTheme(false);
  localStorage.setItem("escapeplan.theme", "invalid");
  render(<App />);
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
});

it("still opens and toggles when browser storage is blocked", async () => {
  systemTheme(false);
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  expect(screen.getByRole("button", { name: "Plan a trip" })).toBeInTheDocument();
});
