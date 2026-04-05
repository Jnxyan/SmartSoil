function WeatherCard({ wa }) {
  if (!wa) return null;
  const cond = (wa.condition || "Unknown").toLowerCase();
  const headerClass =
    cond === "rain"   ? "rain"   :
    cond === "sunny"  ? "sunny"  :
    cond === "cloudy" ? "cloudy" : "unknown";
 
  const urgencyLabel =
    wa.urgency === "high"   ? "💧 Water Urgently" :
    wa.urgency === "medium" ? "💧 Water Today"    :
    wa.urgency === "low"    ? "💧 Skip Watering"  : "💧 Check Soil";
 
  return (
    <div className="weather-card">
      <div className={`weather-card-header ${headerClass}`}>
        <div className="weather-big-icon">{wa.icon || "🌤"}</div>
        <div style={{ flex: 1 }}>
          <div className="weather-headline">{wa.headline}</div>
          <div className="weather-condition">{wa.condition}</div>
        </div>
        <div className="weather-urgency-badge">{urgencyLabel}</div>
      </div>
      <div className="weather-card-body">
        <div className="weather-row water">
          <div className="weather-row-icon">💧</div>
          <div><strong>Watering:</strong> {wa.wateringInstruction}</div>
        </div>
        <div className="weather-row fert">
          <div className="weather-row-icon">🌿</div>
          <div><strong>Fertilising:</strong> {wa.fertilisingTip}</div>
        </div>
        <div className="weather-row tip">
          <div className="weather-row-icon">💡</div>
          <div><strong>Tip:</strong> {wa.generalTip}</div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;