export function readStorage(key, fallback, validate) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function createChecklist(destination) {
  return [
    ...new Set([
      "Everyday outfits",
      "Toiletries",
      "Phone charger",
      "Reusable water bottle",
      "Personal essentials",
      ...destination.packingSuggestions,
    ]),
  ].map((name, index) => ({
    id: `base-${index}`,
    name,
    checked: false,
    custom: false,
  }));
}
export function validChecklists(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (items) =>
        Array.isArray(items) &&
        items.every(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.checked === "boolean" &&
            typeof item.custom === "boolean",
        ),
    )
  );
}
