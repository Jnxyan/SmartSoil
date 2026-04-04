import type { AnalysisResult } from "@/lib/soilAnalysis";

interface TreatmentResultsProps {
  plant: string;
  readings: Record<string, number>;
  budget: number;
  analysis: AnalysisResult;
}

const treatments = [
  { rank: 1, name: "GML (Ground Magnesium Limestone)", price: 8, effectiveness: "92%", tags: ["pH Fix", "Soil Health"], color: "bg-soil-warning" },
  { rank: 2, name: "NPK 15-15-15 Blue Fertiliser", price: 15, effectiveness: "88%", tags: ["NPK Boost", "Soil Fix"], color: "bg-soil-olive" },
  { rank: 3, name: "Potassium Sulfate (500g)", price: 12, effectiveness: "87%", tags: ["Potassium", "Fruit Quality"], color: "bg-soil-olive" },
  { rank: 4, name: "Chlorothalonil Fungicide (100ml)", price: 18, effectiveness: "71%", tags: ["Fungal", "High potency"], color: "bg-muted" },
  { rank: 5, name: "Premium Organic Compost (3kg)", price: 12, effectiveness: "69%", tags: ["Organic", "Soil Health"], color: "bg-muted" },
  { rank: 6, name: "Urea (46-0-0) Fertilizer (1kg)", price: 6, effectiveness: "85%", tags: ["Nitrogen", "Leaf Growth"], color: "bg-soil-warning" },
  { rank: 7, name: "Bone Meal (1kg)", price: 10, effectiveness: "78%", tags: ["Phosphorus", "Root Support"], color: "bg-soil-olive" },
  { rank: 8, name: "Cal-Mag Supplement (500ml)", price: 22, effectiveness: "75%", tags: ["Calcium", "Magnesium"], color: "bg-muted" },
];

const TreatmentResults = ({ plant, readings, budget, analysis }: TreatmentResultsProps) => {
  const filteredTreatments = treatments.filter(t => t.price <= budget);
  const plantEmojis: Record<string, string> = {
    Chili: "🌶️", Mango: "🥭", Paddy: "🌾", Tomato: "🍅", Banana: "🍌",
    Durian: "🦔", Rubber: "🌳", Papaya: "🍈", Corn: "🌽",
  };

  return (
    <div className="mx-4 mt-4 space-y-4 pb-8">
      {/* Result header */}
      <div className="bg-header text-header-foreground rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{plantEmojis[plant] || "🌱"}</span>
          <h3 className="font-bold">{plant} · George Town, Malaysia</h3>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🌤️ Weather: {analysis.weather}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${analysis.overallStatus === "Healthy" ? "bg-green-500/30" : "bg-yellow-500/30"}`}>
            {analysis.overallStatus === "Healthy" ? "✅" : "⚠️"} {analysis.overallStatus}
          </span>
        </div>
      </div>

      {/* Soil Health Score */}
      <div className="bg-card rounded-xl p-4 text-center">
        <h4 className="font-bold text-base mb-2">🏥 Soil Health Score</h4>
        <div className="relative w-24 h-24 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle
              cx="50" cy="50" r="42" fill="none" strokeWidth="8"
              strokeDasharray={`${(analysis.soilHealthScore / 100) * 264} 264`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className={analysis.soilHealthScore >= 70 ? "stroke-soil-success" : analysis.soilHealthScore >= 40 ? "stroke-soil-warning" : "stroke-soil-danger"}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{analysis.soilHealthScore}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{analysis.warnings.length} issue(s) detected</p>
      </div>

      {/* AI Analysis - from Java backend logic */}
      <div className="bg-soil-cream border-2 border-soil-olive/50 rounded-xl p-4 space-y-3">
        <h4 className="font-bold text-base">🤖 AI Analysis (Backend)</h4>

        {analysis.warnings.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-soil-danger">⚠️ Warnings:</p>
            {analysis.warnings.map((w, i) => (
              <div key={i} className="bg-soil-danger/10 border border-soil-danger/30 rounded-lg p-2 text-sm text-soil-danger">
                {w}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">💡 Actionable Advice:</p>
          {analysis.actionableAdvice.length === 0 ? (
            <div className="bg-soil-green-light border border-primary/20 rounded-lg p-3 text-sm">
              ✅ Keep up the good work! All soil parameters are within optimal range.
            </div>
          ) : (
            analysis.actionableAdvice.map((a, i) => (
              <div key={i} className="bg-soil-green-light border border-primary/20 rounded-lg p-3 text-sm">
                🌿 {a}
              </div>
            ))
          )}
        </div>

        {analysis.predictiveAlert && (
          <div className={`rounded-lg p-3 text-sm font-medium ${
            analysis.predictiveAlert.includes("Optimal") 
              ? "bg-soil-green-light text-primary border border-primary/20" 
              : "bg-soil-danger/15 text-soil-danger border border-soil-danger/30"
          }`}>
            📉 {analysis.predictiveAlert}
          </div>
        )}
      </div>

      {/* Suitable Plants */}
      {analysis.suitablePlants.length > 0 && (
        <div className="bg-card rounded-xl p-4">
          <h4 className="font-bold text-base flex items-center gap-2 mb-3">🌱 Suitable Plants for These Conditions</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.suitablePlants.map(p => (
              <span key={p} className="text-sm bg-soil-green-light text-primary font-medium px-3 py-1 rounded-full">
                {plantEmojis[p] || "🌱"} {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Soil Readings Summary */}
      <div className="bg-card rounded-xl p-4">
        <h4 className="font-bold text-base flex items-center gap-2 mb-3">🧪 Soil Readings Summary</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "PH LEVEL", value: readings.ph.toFixed(1), danger: readings.ph < 5.8 || readings.ph > 6.8 },
            { label: "HUMIDITY", value: `${Math.round(readings.humidity)}%`, danger: readings.humidity < 60 || readings.humidity > 80 },
            { label: "NITROGEN (N)", value: `${Math.round(readings.n)}`, danger: readings.n < 80 || readings.n > 120 },
            { label: "PHOSPHORUS (P)", value: `${Math.round(readings.p)}`, danger: readings.p < 40 || readings.p > 60 },
            { label: "POTASSIUM (K)", value: `${Math.round(readings.k)}`, danger: readings.k < 150 || readings.k > 250 },
            { label: "EC (µs/cm)", value: `${Math.round(readings.ec)}`, danger: readings.ec < 1200 || readings.ec > 2200 },
            { label: "TEMP (°C)", value: `${readings.temp.toFixed(1)}`, danger: readings.temp < 25 || readings.temp > 32 },
          ].map((item) => (
            <div key={item.label} className="text-center p-2">
              <div className={`h-1 w-full rounded-full mb-2 ${item.danger ? 'bg-soil-danger' : 'bg-soil-success'}`} />
              <p className={`text-lg font-bold ${item.danger ? 'text-soil-danger' : 'text-foreground'}`}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">{item.label}</p>
              <span className={`inline-block w-2 h-2 rounded-full mt-1 ${item.danger ? 'bg-soil-danger' : 'bg-soil-success'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Budget-Ranked Treatments */}
      <div className="bg-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-base flex items-center gap-2">🏷️ Budget-Ranked Treatments</h4>
          <span className="text-xs bg-soil-cream text-foreground font-semibold px-2 py-1 rounded-full">Within RM {budget}</span>
        </div>
        <span className="inline-block text-xs bg-soil-warning/30 text-soil-brown font-medium px-2 py-0.5 rounded-full mb-3">
          Includes disease fixes
        </span>
        <div className="space-y-3">
          {filteredTreatments.map((t) => (
            <div key={t.rank} className="border border-border rounded-xl p-3 bg-background">
              <div className="flex items-start gap-3">
                <span className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0`}>
                  {t.rank}
                </span>
                <div className="flex-1">
                  <h5 className="font-bold text-sm">{t.name}</h5>
                  <p className="text-xs text-muted-foreground mt-0.5">RM {t.price} · {t.effectiveness} effectiveness</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.tags.map((tag) => (
                      <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        tag === "High potency" ? "bg-soil-danger/15 text-soil-danger" : "bg-soil-cream text-foreground"
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TreatmentResults;
