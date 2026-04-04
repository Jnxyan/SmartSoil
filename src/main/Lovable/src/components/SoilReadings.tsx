interface SoilReading {
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  value: number;
}

interface SoilReadingsProps {
  readings: Record<string, number>;
  onReadingChange: (key: string, value: number) => void;
}

const soilParams: SoilReading[] = [
  { label: "pH Level", key: "ph", min: 0, max: 14, step: 0.1, unit: "", value: 6.2 },
  { label: "Moisture / Humidity", key: "humidity", min: 0, max: 100, step: 1, unit: "%", value: 70 },
  { label: "Nitrogen (N)", key: "n", min: 0, max: 300, step: 1, unit: "mg/kg", value: 100 },
  { label: "Phosphorus (P)", key: "p", min: 0, max: 200, step: 1, unit: "mg/kg", value: 50 },
  { label: "Potassium (K)", key: "k", min: 0, max: 400, step: 1, unit: "mg/kg", value: 180 },
  { label: "EC (Conductivity)", key: "ec", min: 0, max: 4000, step: 10, unit: "µs/cm", value: 1600 },
  { label: "Soil Temperature", key: "temp", min: 10, max: 50, step: 0.5, unit: "°C", value: 28 },
];

const getValueColor = (key: string, value: number): string => {
  // Chili optimal ranges from Java
  if (key === "ph") {
    if (value < 5.8 || value > 6.8) return "bg-soil-danger/20 text-soil-danger";
    return "bg-soil-cream text-foreground";
  }
  if (key === "n") {
    if (value < 80 || value > 120) return "bg-soil-danger/20 text-soil-danger";
    return "bg-soil-cream text-foreground";
  }
  if (key === "p") {
    if (value < 40 || value > 60) return "bg-soil-danger/20 text-soil-danger";
    return "bg-soil-cream text-foreground";
  }
  if (key === "k") {
    if (value < 150 || value > 250) return "bg-soil-danger/20 text-soil-danger";
    return "bg-soil-cream text-foreground";
  }
  if (key === "ec") {
    if (value < 1200 || value > 2200) return "bg-soil-danger/20 text-soil-danger";
    return "bg-soil-cream text-foreground";
  }
  if (key === "temp") {
    if (value < 25 || value > 32) return "bg-soil-danger/20 text-soil-danger";
    return "bg-soil-cream text-foreground";
  }
  if (key === "humidity") {
    if (value < 60 || value > 80) return "bg-soil-danger/20 text-soil-danger";
    return "bg-soil-cream text-foreground";
  }
  return "bg-soil-cream text-foreground";
};

const SoilReadings = ({ readings, onReadingChange }: SoilReadingsProps) => {
  return (
    <div className="mx-4 mt-4 bg-card rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">💉</span>
        <div>
          <h3 className="font-bold text-base">③ Soil Readings</h3>
          <p className="text-sm text-muted-foreground">Adjust the sliders to match your soil test results.</p>
        </div>
      </div>

      <div className="space-y-5">
        {soilParams.map((param) => {
          const val = readings[param.key] ?? param.value;
          const displayVal = param.key === "ph" || param.key === "temp" ? val.toFixed(1) : Math.round(val);
          return (
            <div key={param.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-sm">{param.label}</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={val}
                  onChange={(e) => onReadingChange(param.key, parseFloat(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-primary"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--soil-green)) 0%, hsl(var(--soil-green)) ${((val - param.min) / (param.max - param.min)) * 100}%, hsl(var(--soil-olive)) ${((val - param.min) / (param.max - param.min)) * 100}%, hsl(var(--soil-olive)) 100%)`,
                  }}
                />
                <span className={`text-sm font-bold px-3 py-1 rounded-full min-w-[70px] text-center ${getValueColor(param.key, val)}`}>
                  {displayVal}{param.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SoilReadings;
