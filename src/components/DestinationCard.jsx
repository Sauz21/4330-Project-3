import Landscape from "./Landscape.jsx";
export default function DestinationCard({ destination, onOpen, children }) {
  return (
    <article className="destination-card">
      <Landscape category={destination.category} />
      <div className="card-copy">
        <span className="tag">{destination.category}</span>
        <p className="location">{destination.location}</p>
        <h2>{destination.name}</h2>
        {children}
        <button className="text-button" onClick={() => onOpen(destination)}>
          Explore {destination.name} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}
