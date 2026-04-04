// Ported from CheckChiliSoilHealth.java + Plant.java

export interface SoilData {
  n: number;       // Nitrogen (mg/kg)
  p: number;       // Phosphorus (mg/kg)
  k: number;       // Potassium (mg/kg)
  ph: number;
  ec: number;      // EC (µs/cm)
  temp: number;    // Temperature (°C)
  humidity: number; // Humidity (%)
}

export interface PlantRange {
  name: string;
  minN: number; maxN: number;
  minP: number; maxP: number;
  minK: number; maxK: number;
  minPH: number; maxPH: number;
  minEC: number; maxEC: number;
  minTemp: number; maxTemp: number;
  minHumidity: number; maxHumidity: number;
}

export interface AnalysisResult {
  crop: string;
  overallStatus: "Healthy" | "Attention Needed";
  warnings: string[];
  actionableAdvice: string[];
  predictiveAlert: string;
  soilHealthScore: number;
  weather: string;
  suitablePlants: string[];
}

// Plant ranges from the Java code
export const plantRanges: PlantRange[] = [
  { name: "Chili", minN: 80, maxN: 120, minP: 40, maxP: 60, minK: 150, maxK: 250, minPH: 5.8, maxPH: 6.8, minEC: 1200, maxEC: 2200, minTemp: 25, maxTemp: 32, minHumidity: 60, maxHumidity: 80 },
  { name: "Tomato", minN: 100, maxN: 150, minP: 40, maxP: 70, minK: 150, maxK: 250, minPH: 6.0, maxPH: 6.8, minEC: 1500, maxEC: 2500, minTemp: 20, maxTemp: 30, minHumidity: 50, maxHumidity: 70 },
  { name: "Paddy", minN: 60, maxN: 120, minP: 20, maxP: 40, minK: 80, maxK: 150, minPH: 5.5, maxPH: 7.0, minEC: 800, maxEC: 1800, minTemp: 22, maxTemp: 35, minHumidity: 70, maxHumidity: 90 },
  { name: "Mango", minN: 50, maxN: 100, minP: 30, maxP: 60, minK: 100, maxK: 200, minPH: 5.5, maxPH: 7.5, minEC: 1000, maxEC: 2000, minTemp: 24, maxTemp: 35, minHumidity: 50, maxHumidity: 80 },
  { name: "Banana", minN: 80, maxN: 150, minP: 30, maxP: 50, minK: 200, maxK: 350, minPH: 5.5, maxPH: 7.0, minEC: 1000, maxEC: 2000, minTemp: 25, maxTemp: 35, minHumidity: 60, maxHumidity: 85 },
  { name: "Corn", minN: 100, maxN: 180, minP: 30, maxP: 60, minK: 100, maxK: 200, minPH: 5.8, maxPH: 7.0, minEC: 1000, maxEC: 2500, minTemp: 20, maxTemp: 32, minHumidity: 50, maxHumidity: 75 },
  { name: "Papaya", minN: 60, maxN: 120, minP: 30, maxP: 60, minK: 150, maxK: 300, minPH: 5.5, maxPH: 7.0, minEC: 1000, maxEC: 2000, minTemp: 22, maxTemp: 33, minHumidity: 60, maxHumidity: 85 },
  { name: "Rubber", minN: 40, maxN: 80, minP: 20, maxP: 40, minK: 60, maxK: 120, minPH: 4.5, maxPH: 6.0, minEC: 500, maxEC: 1500, minTemp: 24, maxTemp: 34, minHumidity: 70, maxHumidity: 90 },
  { name: "Durian", minN: 60, maxN: 120, minP: 30, maxP: 60, minK: 120, maxK: 250, minPH: 5.5, maxPH: 7.0, minEC: 1000, maxEC: 2000, minTemp: 24, maxTemp: 32, minHumidity: 75, maxHumidity: 90 },
];

function checkPlantSuitability(soil: SoilData): string[] {
  return plantRanges
    .filter(p =>
      soil.n >= p.minN && soil.n <= p.maxN &&
      soil.p >= p.minP && soil.p <= p.maxP &&
      soil.k >= p.minK && soil.k <= p.maxK &&
      soil.ph >= p.minPH && soil.ph <= p.maxPH &&
      soil.ec >= p.minEC && soil.ec <= p.maxEC &&
      soil.temp >= p.minTemp && soil.temp <= p.maxTemp &&
      soil.humidity >= p.minHumidity && soil.humidity <= p.maxHumidity
    )
    .map(p => p.name);
}

export async function getUpcomingWeather(): Promise<string> {
  try {
    const apikey = "66b97819390a4bfbab465414260403";
    const location = "Butterworth";
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apikey}&q=${location}&days=3`
    );
    if (!res.ok) return "Unknown";
    const text = (await res.text()).toLowerCase();
    if (text.includes("rain") || text.includes("storm") || text.includes("drizzle")) return "Rain";
    if (text.includes("sunny") || text.includes("clear")) return "Sunny";
    return "Cloudy";
  } catch {
    return "Unknown";
  }
}

export function analyzeChiliSoil(soil: SoilData, weather: string): AnalysisResult {
  const result: AnalysisResult = {
    crop: "Chili",
    overallStatus: "Healthy",
    warnings: [],
    actionableAdvice: [],
    predictiveAlert: "",
    soilHealthScore: 100,
    weather,
    suitablePlants: checkPlantSuitability(soil),
  };

  // Nitrogen (N)
  if (soil.n < 80) {
    result.warnings.push("Low Nitrogen (N)");
    if (weather === "Rain") {
      result.actionableAdvice.push("DO NOT fertilize today! Rain is expected, which will wash away the chemicals into rivers. Wait until it clears.");
    } else {
      result.actionableAdvice.push("Apply Urea or chicken manure to boost leaf growth.");
    }
  } else if (soil.n > 120) {
    result.warnings.push("High Nitrogen (N)");
    result.actionableAdvice.push("Stop nitrogen fertilizers to prevent delayed fruiting.");
  }

  // Phosphorus (P)
  if (soil.p < 40) {
    result.warnings.push("Low Phosphorus (P)");
    result.actionableAdvice.push("Add bone meal or phosphate fertilizer to support roots.");
  } else if (soil.p > 60) {
    result.warnings.push("High Phosphorus (P)");
    if (weather === "Rain") {
      result.actionableAdvice.push("Stop using Phosphorus rich fertilisers. Rain is expected soon, let nature naturally flush the excess P from the soil! Apply Iron/Zinc if leaves turn yellow.");
    } else {
      result.actionableAdvice.push("Stop using Phosphorus rich fertilisers. Weather is dry, so please manually flush soil with fresh water. Apply Iron/Zinc if leaves turn yellow.");
    }
  }

  // Potassium (K)
  if (soil.k < 150) {
    result.warnings.push("Low Potassium (K)");
    result.actionableAdvice.push("Apply potassium sulfate to improve fruit quality.");
  } else if (soil.k > 250) {
    result.warnings.push("High Potassium (K)");
    if (weather === "Rain") {
      result.actionableAdvice.push("Stop Potassium fertilizers. Excess K blocks Calcium and Magnesium. Let upcoming rain flush the soil naturally. Apply Cal-Mag supplements.");
    } else {
      result.actionableAdvice.push("Stop Potassium fertilizers. Excess K blocks Calcium and Magnesium. Manually flush soil with fresh water. Apply Cal-Mag supplements.");
    }
  }

  // pH
  if (soil.ph < 5.8) {
    result.warnings.push(`Acidic Soil (pH ${soil.ph.toFixed(1)})`);
    result.actionableAdvice.push("Apply agricultural lime to neutralize acidity.");
  } else if (soil.ph > 6.8) {
    result.warnings.push(`Alkaline Soil (pH ${soil.ph.toFixed(1)})`);
    result.actionableAdvice.push("Add organic compost to lower pH.");
  }

  // EC
  if (soil.ec < 1200) {
    result.warnings.push("Low EC (Poor Nutrient Availability)");
    result.actionableAdvice.push("Nutrients are washed out. Apply a balanced NPK fertilizer.");
  } else if (soil.ec > 2200) {
    result.warnings.push("High EC (Salt Toxicity Risk)");
    if (weather === "Rain") {
      result.actionableAdvice.push("Fertilizer overload! High salt toxicity risk. Rain is expected, which will help flush the salts.");
    } else {
      result.actionableAdvice.push("Fertilizer overload! High salt toxicity risk. Manually flush soil with fresh water immediately to remove excess salts.");
    }
  }

  // Humidity
  if (soil.humidity < 60) {
    result.warnings.push("Low Soil Moisture");
    if (weather === "Rain") {
      result.actionableAdvice.push("DO NOT WATER TODAY. Save water & electricity! Heavy rain is expected in Butterworth soon. Let nature irrigate it.");
    } else {
      result.actionableAdvice.push("Turn on irrigation system. Soil is too dry for Chili.");
    }
    if (soil.humidity < 50 && weather === "Sunny") {
      result.actionableAdvice.push("Increase irrigation frequency because hot weather will dry the soil faster.");
    }
  } else if (soil.humidity > 80) {
    result.warnings.push("Waterlogged Soil");
    result.actionableAdvice.push("Stop watering and improve drainage to prevent root rot.");
  }

  // Temperature
  if (soil.temp > 32) {
    result.warnings.push("High Soil Temperature");
    result.actionableAdvice.push("Apply organic mulch to the soil surface to cool the roots.");
  } else if (soil.temp < 23) {
    result.warnings.push("Low Soil Temperature");
    result.actionableAdvice.push("Apply black plastic mulch to retain soil heat. Reduce watering as cold soil stays wet longer.");
  }

  // Overall status & predictive alerts
  if (result.warnings.length > 0) {
    result.overallStatus = "Attention Needed";

    if (soil.humidity > 85 && soil.temp > 31) {
      result.warnings.push("High Disease Risk Environment");
      result.actionableAdvice.push("Hot and humid conditions detected. Monitor plants closely for fungal infection.");
    }

    if (soil.humidity > 80 && soil.temp > 30) {
      result.predictiveAlert = "High risk of fungal disease (e.g., Anthracnose) in the next 48 hours due to hot and wet conditions. Prepare fungicide.";
    } else {
      result.predictiveAlert = `Yield may drop by ${result.warnings.length * 10}% if these ${result.warnings.length} issues are not resolved.`;
    }
  } else {
    result.predictiveAlert = "Optimal conditions! Expected harvest is on track for maximum yield.";
  }

  result.soilHealthScore = Math.max(0, 100 - result.warnings.length * 10);

  return result;
}
