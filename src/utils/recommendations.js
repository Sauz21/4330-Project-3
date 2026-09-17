export function scoreDestination(destination, preferences) {
  return (
    (destination.category === preferences.category ? 5 : 0) +
    (destination.budgetLevel === preferences.budgetLevel ? 3 : 0) +
    (destination.travelPreferences.includes(preferences.travelPreference)
      ? 2
      : 0) +
    [...new Set(preferences.activities ?? [])].filter((activity) =>
      destination.activities.includes(activity),
    ).length
  );
}
export function matchReasons(destination, preferences) {
  const reasons = [];
  if (destination.category === preferences.category)
    reasons.push(`${destination.category.toLowerCase()} escape`);
  if (destination.budgetLevel === preferences.budgetLevel)
    reasons.push(`${destination.budgetLevel.toLowerCase()} budget style`);
  if (destination.travelPreferences.includes(preferences.travelPreference))
    reasons.push(`${preferences.travelPreference.toLowerCase()} pace`);
  reasons.push(
    ...destination.activities
      .filter((activity) => preferences.activities.includes(activity))
      .map((activity) => activity.toLowerCase()),
  );
  return reasons.length
    ? `Matches your ${reasons.join(", ")}.`
    : "A different kind of escape to consider.";
}
export function getRecommendations(destinations, preferences) {
  return destinations
    .map((destination) => ({
      ...destination,
      score: scoreDestination(destination, preferences),
    }))
    .sort(
      (a, b) => b.score - a.score || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    )
    .slice(0, 3);
}
