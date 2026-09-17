import { useState } from "react";
export default function PackingPage({
  destination,
  items,
  onUpdate,
  tripLength,
  onBack,
  embedded = false,
}) {
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const completed = items.filter((item) => item.checked).length;
  function add(event) {
    event.preventDefault();
    const name = custom.trim();
    if (!name) {
      setError("Enter an item to add to your checklist.");
      return;
    }
    onUpdate([
      ...items,
      {
        id: `custom-${crypto.randomUUID()}`,
        name,
        checked: false,
        custom: true,
      },
    ]);
    setCustom("");
    setError("");
  }
  return (
    <section className={embedded ? "narrow" : "page narrow"}>
      {embedded ? (
        <h2>Packing checklist</h2>
      ) : (
        <>
          <button className="back" onClick={onBack}>
            ← Back
          </button>
          <p className="eyebrow">A LITTLE PREPARATION. A LIGHTER MIND.</p>
          <h1>
            Pack for <em>{destination.name}.</em>
          </h1>
          <p className="intro">
            Your essentials, all in one place.
            {tripLength &&
              ` Plan enough clothing and personal essentials for ${tripLength} days.`}
          </p>
        </>
      )}
      <div className="packing-panel">
        <div className="progress-copy">
          <h2>Ready, set, almost.</h2>
          <p role="status">
            {completed} of {items.length} items packed
          </p>
        </div>
        <progress
          aria-label="Packing progress"
          value={completed}
          max={items.length || 1}
        />
        <ul className="packing-list">
          {items.map((item) => (
            <li key={item.id} className={item.checked ? "completed" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() =>
                    onUpdate(
                      items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, checked: !entry.checked }
                          : entry,
                      ),
                    )
                  }
                />
                <span>{item.name}</span>
              </label>
              {item.custom && (
                <button
                  className="delete-button"
                  aria-label={`Delete ${item.name}`}
                  onClick={() =>
                    onUpdate(items.filter((entry) => entry.id !== item.id))
                  }
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={add} className="custom-form">
          <label htmlFor="custom-item">Something else coming along?</label>
          <div>
            <input
              id="custom-item"
              value={custom}
              maxLength={100}
              onChange={(event) => setCustom(event.target.value)}
              placeholder="e.g. My favorite book"
            />
            <button className="primary" type="submit">
              Add item
            </button>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </form>
      </div>
      <p className="quiet-note">
        Progress is saved on this device. A starting list, ready to make your
        own.
      </p>
    </section>
  );
}
