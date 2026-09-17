import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import App from "../App.jsx";
import { destinations } from "../data/destinations.js";
async function recommend(user) {
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
  await user.click(screen.getByRole("button", { name: /Find my escapes/ }));
}
it("renders EscapePlan and the Plan a trip button on Home", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /EscapePlan/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Plan a trip" }),
  ).toBeInTheDocument();
});
it("validates required selections", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Plan a trip" }));
  await user.click(screen.getByRole("button", { name: /Find my escapes/ }));
  expect(screen.getByRole("alert")).toHaveTextContent("Choose a vacation type");
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
});
it("submitting preferences displays exactly three recommendations and match explanations", async () => {
  const user = userEvent.setup();
  render(<App />);
  await recommend(user);
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(
    screen.getByRole("heading", { name: "Gulf Shores" }),
  ).toBeInTheDocument();
  expect(screen.getAllByText(/Matches your/)).toHaveLength(3);
});
it("checks a packing item, updates progress, and persists after remounting", async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  await recommend(user);
  await user.click(screen.getByRole("button", { name: "Explore Gulf Shores" }));
  await user.click(
    screen.getByRole("button", { name: /Create packing checklist/ }),
  );
  await user.click(screen.getByRole("checkbox", { name: "Everyday outfits" }));
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).toBeChecked();
  expect(screen.getByRole("status")).toHaveTextContent("1 of 8 items packed");
  view.unmount();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Packing" }));
  await user.click(screen.getByRole("button", { name: "Open checklist" }));
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).toBeChecked();
  await user.click(screen.getByRole("checkbox", { name: "Everyday outfits" }));
  expect(screen.getByRole("status")).toHaveTextContent("0 of 8 items packed");
  await user.type(
    screen.getByLabelText("Something else coming along?"),
    "My book",
  );
  await user.click(screen.getByRole("button", { name: "Add item" }));
  expect(screen.getByRole("checkbox", { name: "My book" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Delete My book" }));
  expect(
    screen.queryByRole("checkbox", { name: "My book" }),
  ).not.toBeInTheDocument();
});
async function chooseMyTrip(user) {
  await recommend(user);
  await user.click(screen.getByRole("button", { name: "Explore Gulf Shores" }));
  await user.click(screen.getByRole("button", { name: "Choose as My Trip" }));
}
async function openMyTrip(user) {
  await user.click(
    within(screen.getByRole("navigation")).getByRole("button", {
      name: "My Trip",
    }),
  );
}
it("chooses one My Trip with destination details, trip length and persistent packing progress", async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  const confirm = vi.spyOn(window, "confirm");
  await chooseMyTrip(user);
  expect(confirm).not.toHaveBeenCalled();
  expect(screen.getByRole("heading", { name: "My Trip" })).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Gulf Shores" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Beach / Alabama, USA")).toBeInTheDocument();
  const destination = destinations.find((item) => item.id === "b01");
  expect(screen.getByText(destination.description)).toBeInTheDocument();
  [...destination.highlights, ...destination.activities].forEach((item) =>
    expect(screen.getByText(item)).toBeInTheDocument(),
  );
  expect(screen.getByText("Trip length: 5 days")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Packing checklist" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "Everyday outfits" }));
  expect(screen.getByRole("status")).toHaveTextContent("1 of 8 items packed");
  expect(screen.getByRole("progressbar")).toHaveAttribute("value", "1");
  view.unmount();
  render(<App />);
  await openMyTrip(user);
  expect(
    screen.getByRole("heading", { name: "Gulf Shores" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Trip length: 5 days")).toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).toBeChecked();
  await user.click(screen.getByRole("checkbox", { name: "Everyday outfits" }));
  expect(screen.getByRole("status")).toHaveTextContent("0 of 8 items packed");
});
it("replaces My Trip only after confirmation and persists the replacement", async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  await chooseMyTrip(user);
  await user.click(screen.getByRole("checkbox", { name: "Everyday outfits" }));
  await user.click(screen.getByRole("button", { name: "Recommendations" }));
  await user.click(screen.getByRole("button", { name: "Explore Maui" }));
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  await user.click(screen.getByRole("button", { name: "Choose as My Trip" }));
  expect(confirm).toHaveBeenCalledWith(
    expect.stringContaining("Replace Gulf Shores with Maui"),
  );
  expect(
    JSON.parse(localStorage.getItem("escapeplan.currentTrip")).destinationId,
  ).toBe("b01");
  await openMyTrip(user);
  expect(
    screen.getByRole("heading", { name: "Gulf Shores" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Recommendations" }));
  await user.click(screen.getByRole("button", { name: "Explore Maui" }));
  confirm.mockReturnValue(true);
  await user.click(screen.getByRole("button", { name: "Choose as My Trip" }));
  expect(screen.getByRole("heading", { name: "Maui" })).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Gulf Shores" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).not.toBeChecked();
  expect(
    JSON.parse(localStorage.getItem("escapeplan.checklists")).b01[0].checked,
  ).toBe(true);
  view.unmount();
  render(<App />);
  await openMyTrip(user);
  expect(screen.getByRole("heading", { name: "Maui" })).toBeInTheDocument();
});
it("clears My Trip only after confirmation and keeps packing progress", async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  await chooseMyTrip(user);
  await user.click(screen.getByRole("checkbox", { name: "Everyday outfits" }));
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  await user.click(screen.getByRole("button", { name: "Clear My Trip" }));
  expect(confirm).toHaveBeenCalledWith(
    expect.stringContaining("Clear My Trip?"),
  );
  expect(
    screen.getByRole("heading", { name: "Gulf Shores" }),
  ).toBeInTheDocument();
  expect(
    JSON.parse(localStorage.getItem("escapeplan.currentTrip")).destinationId,
  ).toBe("b01");
  confirm.mockReturnValue(true);
  await user.click(screen.getByRole("button", { name: "Clear My Trip" }));
  expect(
    screen.getByText("Your next adventure belongs here."),
  ).toBeInTheDocument();
  expect(localStorage.getItem("escapeplan.currentTrip")).toBe("null");
  view.unmount();
  render(<App />);
  await openMyTrip(user);
  expect(
    screen.getByText("Your next adventure belongs here."),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Packing" }));
  await user.click(screen.getByRole("button", { name: "Open checklist" }));
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).toBeChecked();
});
it("reuses an existing checklist when choosing My Trip and preserves its selected length", async () => {
  const user = userEvent.setup();
  render(<App />);
  await recommend(user);
  await user.click(screen.getByRole("button", { name: "Explore Gulf Shores" }));
  await user.click(
    screen.getByRole("button", { name: /Create packing checklist/ }),
  );
  await user.click(screen.getByRole("checkbox", { name: "Everyday outfits" }));
  await user.click(screen.getByRole("button", { name: "← Back" }));
  await user.click(screen.getByRole("button", { name: "Choose as My Trip" }));
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Recommendations" }));
  await user.click(screen.getByRole("button", { name: "Edit preferences" }));
  await user.selectOptions(
    screen.getByLabelText(/How long is your escape/),
    "14",
  );
  await user.click(screen.getByRole("button", { name: /Find my escapes/ }));
  await user.click(screen.getByRole("button", { name: "Explore Gulf Shores" }));
  const confirm = vi.spyOn(window, "confirm");
  await user.click(screen.getByRole("button", { name: "View My Trip" }));
  expect(confirm).not.toHaveBeenCalled();
  expect(screen.getByText("Trip length: 5 days")).toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Everyday outfits" }),
  ).toBeChecked();
});
it("recovers from malformed local storage", () => {
  localStorage.setItem("escapeplan.currentTrip", "{broken");
  localStorage.setItem("escapeplan.checklists", '{"b01":[null]}');
  render(<App />);
  expect(
    screen.getByRole("button", { name: "Plan a trip" }),
  ).toBeInTheDocument();
});
