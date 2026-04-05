async function generateSolution({ plant, location, soil, scanResult, budget }) {
  try {
    const response = await fetch('http://localhost:8080/api/analyze-soil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        n: soil.nitrogen,
        p: soil.phosphorus,
        k: soil.potassium,
        ph: soil.ph,
        locationName: location?.region || "Unknown"
      }),
    });

    if (!response.ok) throw new Error("Backend Offline");
    return await response.json();

  } catch (error) {
    console.error("Connection to Java Backend failed:", error);
    
    // RETURN THIS FALLBACK SO THE UI DOESN'T CRASH
    return {
      crop: "Chili",
      overallStatus: "Offline Mode",
      warnings: ["Backend Connection Failed"],
      actionableAdvice: ["Please start your IntelliJ server to see real analysis."],
      soilHealthScore: 0,
      treatments: [] // Empty list so .length doesn't crash
    };
  }
}

export default generateSolution;