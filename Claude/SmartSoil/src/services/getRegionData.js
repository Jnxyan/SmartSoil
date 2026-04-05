async function getRegionData(lat, lng) {
  try {
    // 1. Get Real City/Country Name
    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const geoData = await geoResponse.json();
    const city = geoData.address.city || geoData.address.town || geoData.address.village || "Remote Area";
    const country = geoData.address.country;

    // 2. Get Real-Time Environmental Data (Temperature, Humidity, Soil Moisture)
    const envResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure&hourly=soil_moisture_0_to_7cm`
    );
    const envData = await envResponse.json();

    const currentTemp = envData.current.temperature_2m;
    const currentHumidity = envData.current.relative_humidity_2m;
    const soilMoisture = envData.hourly.soil_moisture_0_to_7cm[0] * 100; // Convert to %

    // 3. Logic-based Soil Type (Heuristic based on location)
    // Real soil APIs are very complex, so we use a region-based logic:
    let soilType = "Loamy Soil";
    if (geoData.display_name.toLowerCase().includes("malaysia") || geoData.display_name.toLowerCase().includes("indonesia")) {
      soilType = "Laterite / Tropical Clay";
    } else if (soilMoisture < 15) {
      soilType = "Sandy / Arid";
    }

    return {
      region: `${city}, ${country}`,
      climate: currentTemp > 25 ? "Tropical / Hot" : "Temperate",
      avg_temp: `${currentTemp}°C`,
      humidity: `${currentHumidity}%`,
      soil_type: soilType,
      rainy_season: "Check local forecast",
      // These are still "likely" diseases based on the real humidity
      common_diseases: currentHumidity > 85 ? ["Fungal Blast", "Root Rot"] : ["Aphids", "Spider Mites"],
      advisories: [
        `Live data for ${city} active.`,
        currentHumidity > 80 ? "⚠️ High humidity detected: Increase airflow." : "✅ Humidity levels are stable.",
        `Current soil moisture at 0-7cm depth is ${Math.round(soilMoisture)}%.`
      ],
    };

  } catch (error) {
    console.error("Real-time data fetch failed:", error);
    return { region: "Fetch Error", advisories: ["Check your internet connection."] };
  }
}

export default getRegionData;