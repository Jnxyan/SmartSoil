import { PLANTS } from "../data/PLANTS";

async function generateSolution({ plant, location, soil, scanResult, budget }) {
  // Replace with: POST /api/solution with JSON body
  await new Promise(r => setTimeout(r, 2000));

  const plantName =
  PLANTS.find(p => p.id === plant?.id)?.label || plant?.customName || "Plant";

  const soilIssues = [];
  const soilTips = [];
  if (soil.ph < 5.5) { soilIssues.push("Acidic soil"); soilTips.push("Apply agricultural lime to raise pH"); }
  else if (soil.ph > 7.5) { soilIssues.push("Alkaline soil"); soilTips.push("Add sulfur or acidifying fertiliser"); }
  if (soil.moisture < 30) { soilIssues.push("Low moisture"); soilTips.push("Increase irrigation frequency"); }
  if (soil.nitrogen < 20) { soilIssues.push("N deficiency"); soilTips.push("Apply urea or compost"); }
  if (soil.phosphorus < 15) { soilIssues.push("P deficiency"); soilTips.push("Use DAP or bone meal"); }
  if (soil.potassium < 20) { soilIssues.push("K deficiency"); soilTips.push("Apply MOP (muriate of potash)"); }

  const allTreatments = [
    { name: "Chlorothalonil Fungicide", cost: 18, effectiveness: 92, tags: ["Fungal", "High potency"], desc: `Strong contact fungicide; ideal for ${plantName} blight in ${location?.region || "tropical"} conditions.` },
    { name: "Copper-based Spray", cost: 12, effectiveness: 78, tags: ["Fungal", "Organic-friendly"], desc: "Broad-spectrum, reapply after rain. Good preventive option." },
    { name: "Neem Oil 500ml", cost: 8, effectiveness: 65, tags: ["Organic", "Preventive"], desc: `Safe for edible crops like ${plantName}. Effective early-stage deterrent.` },
    { name: "NPK Balanced Fertiliser 1kg", cost: 9, effectiveness: 80, tags: ["Soil", "Nutrients"], desc: `Addresses N/P/K gaps in ${location?.soil_type || "local"} soil, boosting plant immunity.` },
    { name: "Systemic Pesticide", cost: 22, effectiveness: 88, tags: ["Pest", "Broad-spectrum"], desc: "Controls sucking/chewing insects through plant tissue. Best for severe infestations." },
    { name: "Sulfur Dust 500g", cost: 6, effectiveness: 60, tags: ["Organic", "Powdery Mildew"], desc: "Low-cost mildew treatment. Avoid applying in temperatures above 32°C." },
    { name: "Compost + Biochar Mix 3kg", cost: 15, effectiveness: 72, tags: ["Soil", "Organic", "Long-term"], desc: `Improves ${location?.soil_type || "soil"} structure and microbial health. Reduces irrigation needs.` },
    { name: "Agricultural Lime 2kg", cost: 7, effectiveness: 68, tags: ["Soil pH", "Acidic fix"], desc: "Raises soil pH from acidic range; especially relevant for laterite soils." },
    { name: "Drip Irrigation Kit", cost: 35, effectiveness: 75, tags: ["Infrastructure", "Water-saving"], desc: "Prevents fungal spread by keeping foliage dry. High setup cost, long-term gain." },
  ];

  const withinBudget = allTreatments
    .filter(t => t.cost <= budget)
    .sort((a, b) => b.effectiveness - a.effectiveness);

  return {
    plantName,
    scanResult,
    soilIssues,
    soilTips,
    location,
    treatments: withinBudget,
    summary: `For your ${plantName} in ${location?.region || "your region"}: ${scanResult ? `${scanResult.disease} detected at ${Math.round(scanResult.confidence * 100)}% confidence.` : "No leaf scan provided."} ${soilIssues.length > 0 ? `Soil shows ${soilIssues.join(", ")}.` : "Soil is in good condition."}`,
  };
}

export default generateSolution;