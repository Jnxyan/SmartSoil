interface HistoryEntry {
  id: string;
  plant: string;
  emoji: string;
  date: string;
  summary: string;
  type: "analysis";
}

interface HistoryTabProps {
  entries: HistoryEntry[];
  onClearAll: () => void;
  onRemove: (id: string) => void;
}

const HistoryTab = ({ entries, onClearAll, onRemove }: HistoryTabProps) => {
  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold font-display mb-1">Analysis History</h2>
      <p className="text-sm text-muted-foreground mb-4">Your saved diagnoses and treatment plans.</p>

      {entries.length > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={onClearAll}
            className="text-sm text-muted-foreground flex items-center gap-1 hover:text-soil-danger transition-colors"
          >
            🗑️ Clear All
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No history yet</p>
          <p className="text-sm mt-1">Run a diagnosis to see results here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-card rounded-xl p-4 relative">
              <button
                onClick={() => onRemove(entry.id)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-soil-danger text-lg"
              >
                ×
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{entry.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{entry.plant}</span>
                    <span className="text-xs bg-primary/15 text-primary font-medium px-2 py-0.5 rounded-full">
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/80 mt-2">{entry.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
