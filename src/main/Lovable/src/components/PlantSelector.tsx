interface PlantSelectorProps {
  selectedPlant: string | null;
  onSelectPlant: (plant: string) => void;
}

const plants = [
  { name: "Chili", emoji: "🌶️" },
  { name: "Mango", emoji: "🥭" },
  { name: "Paddy", emoji: "🌾" },
  { name: "Tomato", emoji: "🍅" },
  { name: "Banana", emoji: "🍌" },
  { name: "Durian", emoji: "🦔" },
  { name: "Rubber", emoji: "🌳" },
  { name: "Papaya", emoji: "🍈" },
  { name: "Corn", emoji: "🌽" },
  { name: "Other...", emoji: "✏️" },
];

const PlantSelector = ({ selectedPlant, onSelectPlant }: PlantSelectorProps) => {
  return (
    <div className="mx-4 mt-4 bg-card rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🌿</span>
        <div>
          <h3 className="font-bold text-base">① Select Plant Type</h3>
          <p className="text-sm text-muted-foreground">Determines soil thresholds</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {plants.map((plant) => (
          <button
            key={plant.name}
            onClick={() => onSelectPlant(plant.name)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              selectedPlant === plant.name
                ? "border-primary bg-soil-green-light"
                : "border-border bg-background hover:border-soil-olive"
            }`}
          >
            <span className="text-3xl">{plant.emoji}</span>
            <span className="text-xs font-medium">{plant.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlantSelector;
