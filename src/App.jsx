import { useState } from "react";
import AppLayout from "./components/AppLayout.jsx";
import { useEffect, useRef } from "react";
import HomePage from "./pages/HomePage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import PackingPage from "./pages/PackingPage.jsx";
import MyTripPage from "./pages/MyTripPage.jsx";
import DestinationCard from "./components/DestinationCard.jsx";
import Landscape from "./components/Landscape.jsx";
import { destinations } from "./data/destinations.js";
import { getRecommendations, matchReasons } from "./utils/recommendations.js";
import {
  readStorage,
  createChecklist,
  validChecklists,
} from "./utils/storage.js";
import {
  emptyPreferences,
  loadPlanningSession,
  PLANNING_SESSION_KEY,
  PLANNING_SESSION_VERSION,
} from "./utils/planningSession.js";
import "./App.css";
export default function App() {
  // Read once, before the persistence effect can write the initial screen.
  const [initialSession] = useState(loadPlanningSession);
  const [page, setPage] = useState(initialSession?.page ?? "home");
  const [history, setHistory] = useState(initialSession?.history ?? []);
  const [preferences, setPreferences] = useState(
    initialSession?.preferences ?? emptyPreferences,
  );
  const [draft, setDraft] = useState(initialSession?.draft ?? emptyPreferences);
  const [hasResults, setHasResults] = useState(
    initialSession?.hasResults ?? false,
  );
  const [selected, setSelected] = useState(
    () =>
      destinations.find(
        (destination) =>
          destination.id === initialSession?.selectedDestinationId,
      ) ?? null,
  );
  const [packingOverview, setPackingOverview] = useState(
    initialSession?.packingOverview ?? false,
  );
  const [currentTrip, setCurrentTrip] = useState(() =>
    initialSession
      ? initialSession.currentTrip
      : readStorage(
          "escapeplan.currentTrip",
          null,
          (value) =>
            value !== null &&
            typeof value === "object" &&
            destinations.some(
              (destination) => destination.id === value.destinationId,
            ) &&
            ["", "2", "5", "7", "14"].includes(value.tripLength),
        ),
  );
  const [checklists, setChecklists] = useState(
    () =>
      initialSession?.checklists ??
      readStorage("escapeplan.checklists", {}, validChecklists),
  );
  const [storageError, setStorageError] = useState("");
  const skipSessionPersist = useRef(false);
  function persist(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStorageError("");
    } catch {
      setStorageError(
        "Device storage is unavailable. Your changes will last for this session only.",
      );
    }
  }
  useEffect(() => {
    if (skipSessionPersist.current) {
      skipSessionPersist.current = false;
      return;
    }
    persist(PLANNING_SESSION_KEY, {
      version: PLANNING_SESSION_VERSION,
      page,
      history,
      preferences,
      draft,
      hasResults,
      selectedDestinationId: selected?.id ?? null,
      packingOverview,
      currentTrip,
      checklists,
    });
  }, [
    page,
    history,
    preferences,
    draft,
    hasResults,
    selected,
    packingOverview,
    currentTrip,
    checklists,
  ]);
  function navigate(target) {
    if (target !== page) {
      setHistory([...history, page]);
      setPage(target);
    }
  }
  function back() {
    setPage(history.at(-1) || "home");
    setHistory(history.slice(0, -1));
  }
  function startQuiz(category) {
    setDraft({ ...preferences, category: category || preferences.category });
    navigate("quiz");
  }
  function open(destination) {
    setSelected(destination);
    navigate("details");
  }
  function chooseTrip(destination) {
    if (currentTrip?.destinationId === destination.id) {
      navigate("my-trip");
      return;
    }
    if (
      currentTrip &&
      !window.confirm(
        `Replace ${tripDestination.name} with ${destination.name} as My Trip? Your packing lists will be kept.`,
      )
    )
      return;
    const next = {
      destinationId: destination.id,
      tripLength: preferences.tripLength,
    };
    setCurrentTrip(next);
    persist("escapeplan.currentTrip", next);
    if (!checklists[destination.id])
      updateChecklist(destination.id, createChecklist(destination));
    navigate("my-trip");
  }
  function clearTrip() {
    if (!window.confirm("Clear My Trip? Your packing lists will be kept."))
      return;
    setCurrentTrip(null);
    persist("escapeplan.currentTrip", null);
  }
  function resetPlan() {
    if (
      !window.confirm(
        "Reset your EscapePlan? This clears My Trip, preferences, and packing progress.",
      )
    )
      return;
    try {
      localStorage.removeItem(PLANNING_SESSION_KEY);
      localStorage.removeItem("escapeplan.currentTrip");
      localStorage.removeItem("escapeplan.checklists");
      setStorageError("");
    } catch {
      setStorageError(
        "Device storage is unavailable. Your plan was reset for this session only.",
      );
    }
    skipSessionPersist.current = true;
    setPage("home");
    setHistory([]);
    setPreferences(emptyPreferences);
    setDraft(emptyPreferences);
    setHasResults(false);
    setSelected(null);
    setPackingOverview(false);
    setCurrentTrip(null);
    setChecklists({});
  }
  function updateChecklist(id, items) {
    const next = { ...checklists, [id]: items };
    setChecklists(next);
    persist("escapeplan.checklists", next);
  }
  function pack(destination) {
    setSelected(destination);
    setPackingOverview(false);
    if (!checklists[destination.id])
      updateChecklist(destination.id, createChecklist(destination));
    navigate("packing");
  }
  const results = hasResults
    ? getRecommendations(destinations, preferences)
    : [];
  const activePacking = !packingOverview && selected && checklists[selected.id];
  const tripDestination = destinations.find(
    (destination) => destination.id === currentTrip?.destinationId,
  );
  return (
    <AppLayout
      page={page}
      navigate={navigate}
      canRecommend={hasResults}
      onReset={resetPlan}
    >
      {storageError && (
        <p className="error" role="alert">
          {storageError}
        </p>
      )}
      {page === "home" && (
        <HomePage startQuiz={startQuiz} navigate={navigate} />
      )}
      {page === "quiz" && (
        <QuizPage
          preferences={draft}
          onChange={setDraft}
          onBack={back}
          onSubmit={(value) => {
            setPreferences(value);
            setHasResults(true);
            navigate("recommendations");
          }}
        />
      )}
      {page === "recommendations" && (
        <section className="page">
          <button className="back" onClick={back}>
            ← Back
          </button>
          <p className="eyebrow">A FEW PLACES WITH YOUR NAME ON THEM</p>
          <h1>
            Your next escape <em>awaits.</em>
          </h1>
          <div className="section-heading">
            <p className="intro">
              Three ideas for your {preferences.tripLength}-day getaway.
            </p>
            <button className="secondary" onClick={() => startQuiz()}>
              Edit preferences
            </button>
          </div>
          <div className="destination-grid">
            {results.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onOpen={open}
              >
                <p className="match">
                  <strong>
                    0{index + 1} / {destination.score} match points
                  </strong>
                  {matchReasons(destination, preferences)}
                </p>
              </DestinationCard>
            ))}
          </div>
          <p className="quiet-note">
            Curated offline inspiration. Budget styles are illustrative; no live
            travel information is used.
          </p>
        </section>
      )}
      {page === "details" && selected && (
        <section className="page">
          <button className="back" onClick={back}>
            ← Back
          </button>
          <div className="detail-grid">
            <div>
              <p className="eyebrow">
                {selected.category} / {selected.location}
              </p>
              <h1>
                Say hello to <em>{selected.name}.</em>
              </h1>
              <p className="intro">{selected.description}</p>
              <div className="tags">
                <span className="tag">{selected.category}</span>
                <span className="tag">{selected.budgetLevel} budget style</span>
              </div>
              <div className="button-row">
                <button
                  className="secondary"
                  onClick={() => chooseTrip(selected)}
                >
                  {currentTrip?.destinationId === selected.id
                    ? "View My Trip"
                    : "Choose as My Trip"}
                </button>
                <button className="primary" onClick={() => pack(selected)}>
                  Create packing checklist ↗
                </button>
              </div>
            </div>
            <Landscape category={selected.category} />
          </div>
          <div className="detail-sections">
            <section>
              <h2>The little highlights</h2>
              <ul>
                {selected.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2>Make time for</h2>
              <ul>
                {selected.activities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2>Bring along</h2>
              <ul>
                {selected.packingSuggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
          <p className="quiet-note">
            Suggestions from our local collection. Adapt your plans and packing
            to your own needs.
          </p>
        </section>
      )}
      {page === "packing" &&
        (activePacking ? (
          <PackingPage
            key={selected.id}
            destination={selected}
            items={activePacking}
            tripLength={
              currentTrip?.destinationId === selected.id
                ? currentTrip.tripLength
                : preferences.tripLength
            }
            onUpdate={(items) => updateChecklist(selected.id, items)}
            onBack={back}
          />
        ) : (
          <section className="page">
            <button className="back" onClick={back}>
              ← Back
            </button>
            <p className="eyebrow">BRING THE GOOD STUFF</p>
            <h1>
              Your packing <em>corner.</em>
            </h1>
            {Object.keys(checklists).some((id) =>
              destinations.some((destination) => destination.id === id),
            ) ? (
              <div className="destination-grid">
                {destinations
                  .filter((destination) => checklists[destination.id])
                  .map((destination) => (
                    <article className="packing-summary" key={destination.id}>
                      <h2>{destination.name}</h2>
                      <p>
                        {
                          checklists[destination.id].filter(
                            (item) => item.checked,
                          ).length
                        }{" "}
                        of {checklists[destination.id].length} items packed
                      </p>
                      <button
                        className="primary"
                        onClick={() => pack(destination)}
                      >
                        Open checklist
                      </button>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <span aria-hidden="true">✓</span>
                <h2>A little planning goes a long way.</h2>
                <p>Find a destination and create a checklist to get started.</p>
                <button className="primary" onClick={() => startQuiz()}>
                  Plan a trip ↗
                </button>
              </div>
            )}
          </section>
        ))}
      {page === "packing" && activePacking && (
        <div className="packing-switch">
          <button
            className="secondary"
            onClick={() => setPackingOverview(true)}
          >
            View all packing lists
          </button>
        </div>
      )}
      {page === "my-trip" && tripDestination && (
        <MyTripPage
          destination={tripDestination}
          tripLength={currentTrip.tripLength}
          items={
            checklists[tripDestination.id] ?? createChecklist(tripDestination)
          }
          onUpdate={(items) => updateChecklist(tripDestination.id, items)}
          onClear={clearTrip}
          onBack={back}
        />
      )}
      {page === "my-trip" && !tripDestination && (
        <section className="page">
          <button className="back" onClick={back}>
            ← Back
          </button>
          <h1>My Trip</h1>
          <div className="empty-state">
            <span aria-hidden="true">♡</span>
            <h2>Your next adventure belongs here.</h2>
            <p>
              Choose a destination as My Trip to keep your plans and packing
              checklist together.
            </p>
            <button className="primary" onClick={() => startQuiz()}>
              Find my escape ↗
            </button>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
