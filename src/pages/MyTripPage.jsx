import PackingPage from "./PackingPage.jsx";

export default function MyTripPage({
  destination,
  tripLength,
  items,
  onUpdate,
  onClear,
  onBack,
  previousTrips,
  onSelectPreviousTrip,
}) {
  function shareTrip() {
    const tripText = `My EscapePlan trip: ${destination.name}
${destination.category} / ${destination.location}
${tripLength ? `Trip length: ${tripLength} days` : ""}

Highlights:
${destination.highlights.map((item) => `- ${item}`).join("\n")}

Packing progress:
${items.filter((item) => item.checked).length} of ${items.length} items packed`;

    if (navigator.share) {
      navigator.share({
        title: `My EscapePlan Trip - ${destination.name}`,
        text: tripText,
      });
    } else {
      navigator.clipboard.writeText(tripText);
      alert("Trip details copied to your clipboard.");
    }
  }

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

      <div className="button-row">
        <button className="secondary" onClick={onClear}>
          Clear My Trip
        </button>

        <button className="primary" onClick={shareTrip}>
          Share Trip
        </button>
      </div>

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

      {previousTrips.length > 0 && (
        <section className="previous-trips">
          <h2>Previous Trips</h2>

          <div className="destination-grid">
            {previousTrips.map((trip) => (
              <article className="packing-summary" key={trip.destinationId}>
                <h3>{trip.name}</h3>

                <p>
                  {trip.category} / {trip.location}
                </p>

                {trip.tripLength && (
                  <p>Trip length: {trip.tripLength} days</p>
                )}

                <button
                  className="primary"
                  onClick={() => onSelectPreviousTrip(trip)}
                >
                  Use This Trip
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}