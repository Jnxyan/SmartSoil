
async function getRegionData(lat, lng) {
  await new Promise(r => setTimeout(r, 700));
  return {
    region: "Penang, Malaysia",
    climate: "Tropical Rainforest",
    avg_temp: "28°C",
    humidity: "80%",
    soil_type: "Laterite / Sandy loam",
    rainy_season: "Oct – Jan",
    common_diseases: ["Leaf Blight", "Root Rot", "Powdery Mildew"],
    advisories: ["High humidity increases fungal risk", "Iron & Zinc deficiency common in laterite soils"],
  };
}

export default getRegionData;