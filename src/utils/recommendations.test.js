import { describe, it, expect } from "vitest";
import { destinations, categories } from "../data/destinations.js";
import { scoreDestination, getRecommendations } from "./recommendations.js";
const preferences = {
  category: "Beach",
  budgetLevel: "Low",
  travelPreference: "Relaxed",
  activities: ["Swimming", "Sightseeing"],
};
describe("offline recommendations", () => {
  it("contains exactly 15 complete destinations across five categories", () => {
    expect(destinations).toHaveLength(15);
    expect(new Set(destinations.map((d) => d.id)).size).toBe(15);
    categories.forEach((category) =>
      expect(destinations.filter((d) => d.category === category)).toHaveLength(
        3,
      ),
    );
    destinations.forEach((d) =>
      [
        "id",
        "name",
        "location",
        "category",
        "budgetLevel",
        "travelPreferences",
        "activities",
        "description",
        "highlights",
        "packingSuggestions",
      ].forEach((key) => expect(d[key]).toBeTruthy()),
    );
  });
  it("awards exactly 5, 3, 2 and one point per matching activity", () => {
    const d = destinations[0];
    const none = {
      category: "City",
      budgetLevel: "Flexible",
      travelPreference: "Adventure",
      activities: [],
    };
    expect(scoreDestination(d, none)).toBe(0);
    expect(scoreDestination(d, { ...none, category: "Beach" })).toBe(5);
    expect(scoreDestination(d, { ...none, budgetLevel: "Low" })).toBe(3);
    expect(scoreDestination(d, { ...none, travelPreference: "Relaxed" })).toBe(
      2,
    );
    expect(
      scoreDestination(d, {
        ...none,
        activities: ["Swimming", "Sightseeing", "Hiking"],
      }),
    ).toBe(2);
    expect(scoreDestination(d, preferences)).toBe(12);
    expect(
      scoreDestination(d, {
        ...preferences,
        activities: ["Swimming", "Swimming"],
      }),
    ).toBe(11);
  });
  it("returns the top three by descending score without mutating data", () => {
    const original = [...destinations];
    const result = getRecommendations(destinations, preferences);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("b01");
    expect(result.map((d) => d.score)).toEqual([12, 8, 8]);
    expect(destinations).toEqual(original);
    expect(destinations[0]).not.toHaveProperty("score");
  });
  it("breaks score ties by ascending ID regardless of input order", () => {
    const prefs = {
      category: "None",
      budgetLevel: "None",
      travelPreference: "None",
      activities: [],
    };
    expect(
      getRecommendations([...destinations].reverse(), prefs).map((d) => d.id),
    ).toEqual(["b01", "b02", "b03"]);
  });
});
