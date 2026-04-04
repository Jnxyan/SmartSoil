import { useState } from "react";
import LocationCard from "./LocationCard";
import PlantSelector from "./PlantSelector";
import LeafScan from "./LeafScan";
import SoilReadings from "./SoilReadings";
import TreatmentBudget from "./TreatmentBudget";
import TreatmentResults from "./TreatmentResults";
import { analyzeChiliSoil, getUpcomingWeather, type SoilData, type AnalysisResult } from "@/lib/soilAnalysis";

interface DiagnoseTabProps {
  onAddHistory: (entry: { plant: string; readings: Record<string, number>; analysis: AnalysisResult }) => void;
}

const DiagnoseTab = ({ onAddHistory }: DiagnoseTabProps) => {
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [leafImage, setLeafImage] = useState<string | null>(null);
  const [readings, setReadings] = useState<Record<string, number>>({
    ph: 6.2,
    humidity: 70,
    n: 100,
    p: 50,
    k: 180,
    ec: 1600,
    temp: 28,
  });
  const [budget, setBudget] = useState(65);
  const [showResults, setShowResults] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleReadingChange = (key: string, value: number) => {
    setReadings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const weather = await getUpcomingWeather();
      const soilData: SoilData = {
        n: readings.n,
        p: readings.p,
        k: readings.k,
        ph: readings.ph,
        ec: readings.ec,
        temp: readings.temp,
        humidity: readings.humidity,
      };
      const result = analyzeChiliSoil(soilData, weather);
      result.crop = selectedPlant!;
      setAnalysisResult(result);
      setShowResults(true);
      onAddHistory({ plant: selectedPlant!, readings, analysis: result });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pb-8">
      <LocationCard />

      {!showResults && (
        <>
          <div className="mx-4 mt-4">
            <h2 className="text-xl font-bold font-display">Diagnose & Solve</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pick your plant, scan a leaf (optional), enter soil readings and budget. Then let our AI-powered backend analyse and recommend personalised treatments.
            </p>
          </div>

          <PlantSelector selectedPlant={selectedPlant} onSelectPlant={setSelectedPlant} />
          <LeafScan leafImage={leafImage} onImageUpload={setLeafImage} />
          <SoilReadings readings={readings} onReadingChange={handleReadingChange} />
          <TreatmentBudget budget={budget} onBudgetChange={setBudget} />

          <div className="mx-4 mt-6">
            <button
              onClick={handleGenerate}
              disabled={!selectedPlant || generating}
              className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {generating ? (
                <>⏳ Generating...</>
              ) : (
                <>🌱 Generate Treatment Plan</>
              )}
            </button>
          </div>
        </>
      )}

      {showResults && analysisResult && (
        <>
          <TreatmentResults plant={selectedPlant!} readings={readings} budget={budget} analysis={analysisResult} />
          <div className="mx-4 mt-2 mb-8">
            <button
              onClick={() => {
                setShowResults(false);
                setSelectedPlant(null);
                setLeafImage(null);
                setReadings({ ph: 6.2, humidity: 70, n: 100, p: 50, k: 180, ec: 1600, temp: 28 });
                setBudget(65);
                setAnalysisResult(null);
              }}
              className="w-full border-2 border-primary text-primary rounded-xl py-3 font-semibold hover:bg-soil-green-light transition-colors"
            >
              🔄 New Diagnosis
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DiagnoseTab;
