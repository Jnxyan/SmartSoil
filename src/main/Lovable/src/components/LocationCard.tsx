const LocationCard = () => {
  return (
    <div className="mx-4 mt-4 rounded-xl bg-primary p-4 text-primary-foreground">
      <div className="flex items-start gap-3">
        <span className="text-3xl">🗺️</span>
        <div className="flex-1">
          <h3 className="font-bold text-base">
            George Town, Malaysia · Tropical / Hot
          </h3>
          <p className="text-sm opacity-90 mt-1">
            29.1°C avg · 77% humidity · Rainy season: Check local forecast
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="inline-flex items-center gap-1 bg-primary-foreground/20 rounded-full px-3 py-1 text-xs font-medium">
          🌱 Laterite / Tropical Clay
        </span>
        <span className="inline-flex items-center gap-1 bg-soil-warning/30 rounded-full px-3 py-1 text-xs font-medium">
          ⚠️ Aphids
        </span>
        <span className="inline-flex items-center gap-1 bg-soil-warning/30 rounded-full px-3 py-1 text-xs font-medium">
          ⚠️ Spider Mites
        </span>
      </div>
      <p className="text-xs mt-3 opacity-75 italic flex items-center gap-1">
        <span>ℹ️</span> Live data for George Town active.
      </p>
    </div>
  );
};

export default LocationCard;
