import { useState } from "react";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import DiagnoseTab from "@/components/DiagnoseTab";
import HistoryTab from "@/components/HistoryTab";
import type { AnalysisResult } from "@/lib/soilAnalysis";

interface HistoryEntry {
  id: string;
  plant: string;
  emoji: string;
  date: string;
  summary: string;
  type: "analysis";
}

const plantEmojis: Record<string, string> = {
  Chili: "🌶️", Mango: "🥭", Paddy: "🌾", Tomato: "🍅", Banana: "🍌",
  Durian: "🦔", Rubber: "🌳", Papaya: "🍈", Corn: "🌽", "Other...": "✏️",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<"diagnose" | "history">("diagnose");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handleAddHistory = ({ plant, readings, analysis }: { plant: string; readings: Record<string, number>; analysis: AnalysisResult }) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      plant,
      emoji: plantEmojis[plant] || "🌱",
      date: new Date().toLocaleString("en-GB"),
      summary: `${plant} in Butterworth — Score: ${analysis.soilHealthScore}/100 | ${analysis.warnings.length} warning(s): ${analysis.warnings.join(", ") || "None"} | Weather: ${analysis.weather} | Status: ${analysis.overallStatus}`,
      type: "analysis",
    };
    setHistory((prev) => [entry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto shadow-xl">
      <Header />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="overflow-y-auto">
        {activeTab === "diagnose" ? (
          <DiagnoseTab onAddHistory={handleAddHistory} />
        ) : (
          <HistoryTab
            entries={history}
            onClearAll={() => setHistory([])}
            onRemove={(id) => setHistory((prev) => prev.filter((e) => e.id !== id))}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
