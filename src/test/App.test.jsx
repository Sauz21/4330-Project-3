import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";
import App from "../App.jsx";
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
it("saves, persists and removes a trip", async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  await recommend(user);
  await user.click(screen.getByRole("button", { name: "Explore Gulf Shores" }));
  await user.click(screen.getByRole("button", { name: /Save trip/ }));
  view.unmount();
  render(<App />);
  await user.click(
    within(screen.getByRole("navigation")).getByRole("button", {
      name: "Saved Trips",
    }),
  );
  expect(
    screen.getByRole("heading", { name: "Gulf Shores" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Remove Gulf Shores" }));
  expect(
    screen.getByText("Your next adventure belongs here."),
  ).toBeInTheDocument();
});
it("recovers from malformed local storage", () => {
  localStorage.setItem("escapeplan.saved", "{broken");
  localStorage.setItem("escapeplan.checklists", '{"b01":[null]}');
  render(<App />);
  expect(
    screen.getByRole("button", { name: "Plan a trip" }),
  ).toBeInTheDocument();
});
