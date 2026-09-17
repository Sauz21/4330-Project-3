export default function Landscape({ category = "Mountains" }) {
  return (
    <div
      className={`landscape scene-${category.toLowerCase().replace(" ", "-")}`}
      aria-hidden="true"
    >
      <div className="sun" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="ridge ridge-back" />
      <div className="ridge ridge-front" />
      <div className="water" />
      <div className="pine pine-one" />
      <div className="pine pine-two" />
      <div className="landscape-caption">TAKE THE SCENIC ROUTE</div>
    </div>
  );
}
