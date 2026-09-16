import { categories, categoryIcons } from "../data/destinations.js";
import Landscape from "../components/Landscape.jsx";
export default function HomePage({ startQuiz, navigate }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">● A LITTLE PLANNING. A LOT OF POSSIBILITY.</p>
          <h1>
            EscapePlan
            <small>
              Your next chapter
              <br />
              starts <em>somewhere new.</em>
            </small>
          </h1>
          <p className="intro">
            Find a getaway that feels like you. Discover your next destination,
            pack the essentials, and make room for adventure.
          </p>
          <button className="primary" onClick={() => startQuiz()}>
            Plan a trip <span aria-hidden="true">↗</span>
          </button>
          <p className="quiet-note">
            No accounts. No connection. Just possibilities.
          </p>
        </div>
        <div className="hero-art">
          <Landscape />
          <div className="postcard-label">
            <span>YOUR OUT-OF-OFFICE ERA</span>
            <strong>
              A change of scenery
              <br />
              looks good on you.
            </strong>
            <span>EST. FOR YOUR NEXT ADVENTURE ↗</span>
          </div>
          <span className="art-stamp">
            GO
            <br />
            SOMEWHERE
            <br />
            GOOD
          </span>
        </div>
      </section>
      <section className="explore-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR KIND OF AWAY</p>
            <h2>What’s calling you?</h2>
          </div>
          <span className="subtle">Five ways to escape the everyday</span>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <button
              className={`category-card category-${index}`}
              key={category}
              onClick={() => startQuiz(category)}
            >
              <span className="category-icon" aria-hidden="true">
                {categoryIcons[category]}
              </span>
              <strong>{category}</strong>
              <span>
                {
                  [
                    "Salt air & slow days",
                    "Fresh air & new heights",
                    "New streets & stories",
                    "Big thrills & little joys",
                    "Under a sky of stars",
                  ][index]
                }
              </span>
              <span className="category-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="how-section">
        <div>
          <p className="eyebrow">LESS OVERTHINKING. MORE EXPLORING.</p>
          <h2>
            A great escape,{" "}
            <br />
            in three little steps.
          </h2>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "Make it yours",
              "Tell us your travel style and what you love.",
            ],
            [
              "02",
              "Find your somewhere",
              "Explore three ideas picked for your preferences.",
            ],
            [
              "03",
              "Pack & look forward",
              "Save your favorites and tick off the essentials.",
            ],
          ].map(([number, title, description]) => (
            <div className="step" key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="saved-banner">
        <span className="banner-icon" aria-hidden="true">
          ♡
        </span>
        <div>
          <h2>Keep a little adventure in your pocket.</h2>
          <p>Your saved places and packing lists, right here on this device.</p>
        </div>
        <button className="secondary" onClick={() => navigate("saved")}>
          View saved trips ↗
        </button>
      </section>
    </>
  );
}
