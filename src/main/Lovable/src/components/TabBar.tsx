interface TabBarProps {
  activeTab: "diagnose" | "history";
  onTabChange: (tab: "diagnose" | "history") => void;
}

const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  return (
    <div className="flex border-b border-border bg-background">
      <button
        onClick={() => onTabChange("diagnose")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
          activeTab === "diagnose"
            ? "text-primary border-b-2 border-primary"
            : "text-muted-foreground"
        }`}
      >
        <span>🌿</span>
        Diagnose & Solve
      </button>
      <button
        onClick={() => onTabChange("history")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
          activeTab === "history"
            ? "text-primary border-b-2 border-primary"
            : "text-muted-foreground"
        }`}
      >
        <span>📋</span>
        History
      </button>
    </div>
  );
};

export default TabBar;
