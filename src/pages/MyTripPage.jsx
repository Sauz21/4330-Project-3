import PackingPage from "./PackingPage.jsx";

export default function MyTripPage({
  destination,
  tripLength,
  items,
  onUpdate,
  onClear,
  onBack,
}) {
  return (
    <section className="page">
      <button className="back" onClick={onBack}>
        ← Back
      </button>
      <h1>My Trip</h1>
      <p className="eyebrow">
        {destination.category} / {destination.location}
      </p>
      <h2>{destination.name}</h2>
      <p className="intro">{destination.description}</p>
      {tripLength && <p>Trip length: {tripLength} days</p>}
      <button className="secondary" onClick={onClear}>
        Clear My Trip
      </button>
      <div className="detail-sections">
        <section>
          <h2>Highlights</h2>
          <ul>
            {destination.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Activities</h2>
          <ul>
            {destination.activities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <PackingPage
        key={destination.id}
        embedded
        destination={destination}
        items={items}
        onUpdate={onUpdate}
      />
    </section>
  );
}
