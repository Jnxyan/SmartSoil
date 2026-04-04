interface TreatmentBudgetProps {
  budget: number;
  onBudgetChange: (val: number) => void;
}

const TreatmentBudget = ({ budget, onBudgetChange }: TreatmentBudgetProps) => {
  return (
    <div className="mx-4 mt-4 bg-card rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">💰</span>
        <div>
          <h3 className="font-bold text-base">④ Treatment Budget</h3>
          <p className="text-sm text-muted-foreground">Backend filters & ranks only treatments within this limit</p>
        </div>
      </div>
      <div className="mt-4">
        <label className="font-semibold text-sm">Maximum Budget</label>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="range"
            min={10}
            max={500}
            step={5}
            value={budget}
            onChange={(e) => onBudgetChange(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, hsl(var(--soil-green)) 0%, hsl(var(--soil-green)) ${((budget - 10) / 490) * 100}%, hsl(var(--soil-olive)) ${((budget - 10) / 490) * 100}%, hsl(var(--soil-olive)) 100%)`,
            }}
          />
          <span className="text-sm font-bold min-w-[70px] text-right">RM {budget}</span>
        </div>
      </div>
    </div>
  );
};

export default TreatmentBudget;
