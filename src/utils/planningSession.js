import { activities, categories, destinations } from "../data/destinations.js";
import { readStorage, validChecklists } from "./storage.js";

export const PLANNING_SESSION_KEY = "escapeplan.planningSession.v1";
export const PLANNING_SESSION_VERSION = 1;

export const emptyPreferences = {
  category: "",
  budgetLevel: "",
  travelPreference: "",
  tripLength: "",
  activities: [],
};

const pages = [
  "home",
  "quiz",
  "recommendations",
  "details",
  "packing",
  "my-trip",
];
const budgets = ["", "Low", "Moderate", "Flexible"];
const travelPreferences = ["", "Relaxed", "Adventure", "Family"];
const tripLengths = ["", "2", "5", "7", "14"];
const destinationIds = new Set(
  destinations.map((destination) => destination.id),
);

function validPreferences(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    ["", ...categories].includes(value.category) &&
    budgets.includes(value.budgetLevel) &&
    travelPreferences.includes(value.travelPreference) &&
    tripLengths.includes(value.tripLength) &&
    Array.isArray(value.activities) &&
    new Set(value.activities).size === value.activities.length &&
    value.activities.every((activity) => activities.includes(activity)),
  );
}

function completePreferences(value) {
  return Boolean(
    value.category &&
    value.budgetLevel &&
    value.travelPreference &&
    value.tripLength,
  );
}

function validCurrentTrip(value) {
  return (
    value === null ||
    Boolean(
      value &&
      typeof value === "object" &&
      destinationIds.has(value.destinationId) &&
      tripLengths.includes(value.tripLength),
    )
  );
}

export function validPlanningSession(value) {
  if (
    !value ||
    typeof value !== "object" ||
    value.version !== PLANNING_SESSION_VERSION ||
    !pages.includes(value.page) ||
    (value.history !== undefined &&
      (!Array.isArray(value.history) ||
        !value.history.every((page) => pages.includes(page)))) ||
    !validPreferences(value.preferences) ||
    !validPreferences(value.draft) ||
    typeof value.hasResults !== "boolean" ||
    !(
      value.selectedDestinationId === null ||
      destinationIds.has(value.selectedDestinationId)
    ) ||
    typeof value.packingOverview !== "boolean" ||
    !validCurrentTrip(value.currentTrip) ||
    !validChecklists(value.checklists) ||
    Object.keys(value.checklists).some((id) => !destinationIds.has(id))
  )
    return false;

  if (
    (value.hasResults || value.page === "recommendations") &&
    !completePreferences(value.preferences)
  )
    return false;
  if (value.page === "details" && !value.selectedDestinationId) return false;
  if (value.page === "my-trip" && !value.currentTrip) return false;
  return true;
}

export function loadPlanningSession() {
  const session = readStorage(PLANNING_SESSION_KEY, null, validPlanningSession);
  if (!session) return null;
  return {
    ...session,
    // A valid Recommendations screen always regenerates its results.
    hasResults: session.hasResults || session.page === "recommendations",
    // Older snapshots may not contain a Back stack. Ignore entries that
    // cannot render with the restored session's destination/preferences.
    history: (session.history ?? []).filter(
      (page) =>
        (page !== "details" || session.selectedDestinationId !== null) &&
        (page !== "recommendations" ||
          completePreferences(session.preferences)),
    ),
  };
}
