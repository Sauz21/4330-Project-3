import { useState } from "react";
import { categories, activities, categoryIcons } from "../data/destinations.js";
export default function QuizPage({ preferences, onChange, onSubmit, onBack }) {
  const [form, setForm] = useState(preferences);
  const [error, setError] = useState("");
  function updateForm(next) {
    setForm(next);
    onChange(next);
  }
  function submit(event) {
    event.preventDefault();
    if (
      !form.category ||
      !form.budgetLevel ||
      !form.travelPreference ||
      !form.tripLength
    ) {
      setError(
        "Choose a vacation type, budget, travel preference, and trip length to continue.",
      );
      return;
    }
    onSubmit(form);
  }
  return (
    <section className="page narrow">
      <button className="back" onClick={onBack}>
        ← Back
      </button>
      <p className="eyebrow">YOUR ESCAPE STARTS HERE</p>
      <h1>
        Let’s find your <em>somewhere.</em>
      </h1>
      <p className="intro">A few little details. Three ideas made for you.</p>
      <form onSubmit={submit} noValidate>
        <fieldset>
          <legend>01 / What kind of escape?</legend>
          <p className="field-hint">Choose one vacation type. Required.</p>
          <div className="choice-grid">
            {categories.map((category) => (
              <label className="choice" key={category}>
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={form.category === category}
                  onChange={() => updateForm({ ...form, category })}
                />
                <span aria-hidden="true">{categoryIcons[category]}</span>
                {category}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="form-grid">
          {[
            [
              "budgetLevel",
              "02 / Your budget style",
              [
                ["Low", "Low · Keeping it simple"],
                ["Moderate", "Moderate · Room to explore"],
                ["Flexible", "Flexible · Something special"],
              ],
            ],
            [
              "travelPreference",
              "03 / Your travel preference",
              [
                ["Relaxed", "Relaxed"],
                ["Adventure", "Adventure"],
                ["Family", "Family"],
              ],
            ],
            [
              "tripLength",
              "04 / How long is your escape?",
              [
                ["2", "2 days · A quick reset"],
                ["5", "5 days · A little longer"],
                ["7", "7 days · A proper break"],
                ["14", "14 days · Take your time"],
              ],
            ],
          ].map(([key, label, options]) => (
            <label className="select-label" key={key}>
              {label}
              <span className="field-hint">Required</span>
              <select
                value={form[key]}
                onChange={(event) =>
                  updateForm({ ...form, [key]: event.target.value })
                }
                required
              >
                <option value="">Choose an option</option>
                {options.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <p className="field-hint">
          Budget levels are illustrative travel styles, not price estimates.
          Trip length helps you plan your packing.
        </p>
        <fieldset>
          <legend>05 / Make time for what you love</legend>
          <p className="field-hint">
            Choose any activities you enjoy. Optional.
          </p>
          <div className="activity-options">
            {activities.map((activity) => (
              <label className="choice" key={activity}>
                <input
                  type="checkbox"
                  checked={form.activities.includes(activity)}
                  onChange={(event) =>
                    updateForm({
                      ...form,
                      activities: event.target.checked
                        ? [...form.activities, activity]
                        : form.activities.filter((item) => item !== activity),
                    })
                  }
                />
                {activity}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" type="submit">
          Find my escapes <span aria-hidden="true">↗</span>
        </button>
      </form>
    </section>
  );
}
