import { StrictMode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App.jsx";
import { PLANNING_SESSION_KEY } from "../utils/planningSession.js";

function mountApp() {
  return render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

async function fillQuiz(user) {
  await user.click(screen.getByRole("button", { name: "Plan a trip" }));
  await user.click(screen.getByRole("radio", { name: "Beach" }));
  await user.selectOptions(screen.getByLabelText(/Your budget style/), "Low");
  await user.selectOptions(
    screen.getByLabelText(/Your travel preference/),
    "Relaxed",
  );
  await user.selectOptions(
    screen.getByLabelText(/How long is your escape/),
    "5",
  );
  await user.click(screen.getByRole("checkbox", { name: "Swimming" }));
}

async function showRecommendations(user) {
  await fillQuiz(user);
  await user.click(screen.getByRole("button", { name: /Find my escapes/ }));
}

function remount(view, expectedPage) {
  expect(JSON.parse(localStorage.getItem(PLANNING_SESSION_KEY)).page).toBe(
    expectedPage,
  );
  view.unmount();
  // Observe startup writes so a transient Home write cannot hide a regression.
  const writes = vi.spyOn(Storage.prototype, "setItem");
  const next = mountApp();
  const pagesWritten = writes.mock.calls
    .filter(([key]) => key === PLANNING_SESSION_KEY)
    .map(([, value]) => JSON.parse(value).page);
  expect(pagesWritten.length).toBeGreaterThan(0);
  expect(pagesWritten.every((page) => page === expectedPage)).toBe(true);
  writes.mockRestore();
  return next;
}

it("restores the quiz and unsubmitted choices immediately after unmount/remount", async () => {
  const user = userEvent.setup();
  const view = mountApp();
  await fillQuiz(user);
  remount(view, "quiz");
  expect(
    screen.getByRole("heading", { name: /Let’s find your somewhere/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole("radio", { name: "Beach" })).toBeChecked();
  expect(screen.getByLabelText(/Your budget style/)).toHaveValue("Low");
  expect(screen.getByLabelText(/Your travel preference/)).toHaveValue(
    "Relaxed",
  );
  expect(screen.getByLabelText(/How long is your escape/)).toHaveValue("5");
  expect(screen.getByRole("checkbox", { name: "Swimming" })).toBeChecked();
});

it("restores Recommendations and regenerates the same ranked matches from preferences", async () => {
  const user = userEvent.setup();
  const view = mountApp();
  await showRecommendations(user);
  const before = screen.getAllByRole("article").map((card) => card.textContent);
  const session = JSON.parse(localStorage.getItem(PLANNING_SESSION_KEY));
  expect(session).not.toHaveProperty("recommendations");
  // Results come from the saved preferences, even if the redundant flag is false.
  localStorage.setItem(
    PLANNING_SESSION_KEY,
    JSON.stringify({ ...session, hasResults: false }),
  );
  remount(view, "recommendations");
  expect(
    screen.getByRole("heading", { name: "Your next escape awaits." }),
  ).toBeInTheDocument();
  expect(
    screen.getAllByRole("article").map((card) => card.textContent),
  ).toEqual(before);
  expect(screen.getAllByRole("article")).toHaveLength(3);
});

it("restores destination details by ID and retains Back navigation history", async () => {
  const user = userEvent.setup();
  const view = mountApp();
  await showRecommendations(user);
  await user.click(screen.getByRole("button", { name: "Explore Gulf Shores" }));
  expect(
    JSON.parse(localStorage.getItem(PLANNING_SESSION_KEY))
      .selectedDestinationId,
  ).toBe("b01");
  remount(view, "details");
  expect(
    screen.getByRole("heading", { name: "Say hello to Gulf Shores." }),
  ).toBeInTheDocument();
  expect(screen.getByText("Beach / Alabama, USA")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "← Back" }));
  expect(
    screen.getByRole("heading", { name: "Your next escape awaits." }),
  ).toBeInTheDocument();
});

it("restores My Trip and its packing progress without navigating after remount", async () => {
  const user = userEvent.setup();
  const view = mountApp();
  await showRecommendations(user);
  await user.click(screen.getByRole("button", { name: "Explore Gulf Shores" }));
  await user.click(screen.getByRole("button", { name: "Choose as My Trip" }));
  await user.click(screen.getByRole("checkbox", { name: "Everyday outfits" }));
  remount(view, "my-trip");
  expect(screen.getByRole("heading", { name: "My Trip" })).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Gulf Shores" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Trip length: 5 days")).toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).toBeChecked();
  expect(screen.getByRole("status")).toHaveTextContent("1 of 8 items packed");
});

it.each(["not-a-page", "saved", "", null, 17])(
  "falls back to Home for invalid stored page %s",
  (page) => {
    const view = mountApp();
    const session = JSON.parse(localStorage.getItem(PLANNING_SESSION_KEY));
    view.unmount();
    localStorage.setItem(
      PLANNING_SESSION_KEY,
      JSON.stringify({ ...session, page }),
    );
    mountApp();
    expect(
      screen.getByRole("button", { name: "Plan a trip" }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(PLANNING_SESSION_KEY)).page).toBe(
      "home",
    );
  },
);

it.each([
  { page: "details", selectedDestinationId: "missing-destination" },
  { page: "details", selectedDestinationId: null },
  { page: "recommendations" },
  { page: "my-trip", currentTrip: null },
  {
    page: "my-trip",
    currentTrip: { destinationId: "missing-destination", tripLength: "5" },
  },
])(
  "falls back to Home when $page is missing valid supporting data",
  (invalid) => {
    const view = mountApp();
    const session = JSON.parse(localStorage.getItem(PLANNING_SESSION_KEY));
    view.unmount();
    localStorage.setItem(
      PLANNING_SESSION_KEY,
      JSON.stringify({ ...session, ...invalid }),
    );
    mountApp();
    expect(
      screen.getByRole("button", { name: "Plan a trip" }),
    ).toBeInTheDocument();
  },
);

it("restores the packing overview even when no destination is selected", async () => {
  const user = userEvent.setup();
  const view = mountApp();
  await user.click(screen.getByRole("button", { name: "Packing" }));
  remount(view, "packing");
  expect(
    screen.getByRole("heading", { name: "Your packing corner." }),
  ).toBeInTheDocument();
});

it("keeps Reset Plan confirmation, cleared state and the separate theme preference", async () => {
  localStorage.setItem("escapeplan.theme", "dark");
  const user = userEvent.setup();
  const view = mountApp();
  await showRecommendations(user);
  await user.click(screen.getByRole("button", { name: "Explore Gulf Shores" }));
  await user.click(screen.getByRole("button", { name: "Choose as My Trip" }));
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  await user.click(screen.getByRole("button", { name: "Reset Plan" }));
  expect(confirm).toHaveBeenCalled();
  expect(screen.getByRole("heading", { name: "My Trip" })).toBeInTheDocument();
  confirm.mockReturnValue(true);
  await user.click(screen.getByRole("button", { name: "Reset Plan" }));
  expect(
    screen.getByRole("button", { name: "Plan a trip" }),
  ).toBeInTheDocument();
  for (const key of [
    PLANNING_SESSION_KEY,
    "escapeplan.currentTrip",
    "escapeplan.checklists",
  ]) {
    expect(localStorage.getItem(key)).toBeNull();
  }
  expect(localStorage.getItem("escapeplan.theme")).toBe("dark");
  view.unmount();
  mountApp();
  expect(
    screen.getByRole("button", { name: "Plan a trip" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await user.click(
    within(screen.getByRole("navigation")).getByRole("button", {
      name: "My Trip",
    }),
  );
  expect(
    screen.getByText("Your next adventure belongs here."),
  ).toBeInTheDocument();
});
