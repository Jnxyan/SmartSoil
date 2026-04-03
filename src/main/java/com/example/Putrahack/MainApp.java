package com.example.Putrahack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@SpringBootApplication
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class MainApp {

    public static void main(String[] args) {
        SpringApplication.run(MainApp.class, args);
    }

    // =========================================================================
    // POST /api/analyze-soil
    // Receives: n, p, k, ph, moisture, plantId, plantName, locationName,
    //           detectedDisease, diseaseConfidence, diseaseSeverity, budget
    // Returns:  { plantName, overallStatus, soilHealthScore, warnings[],
    //             actionableAdvice[], predictiveAlert, weatherAdvice{}, treatments[], summary }
    // =========================================================================
    @PostMapping("/analyze-soil")
    public Map<String, Object> analyzeSoil(@RequestBody Map<String, Object> payload) {

        // ── 1. Parse soil values ──────────────────────────────────────────────
        double n        = parseDouble(payload, "n",        100);
        double p        = parseDouble(payload, "p",        50);
        double k        = parseDouble(payload, "k",        200);
        double ph       = parseDouble(payload, "ph",       6.5);
        double moisture = parseDouble(payload, "moisture", 70);

        // ── 2. Parse context ──────────────────────────────────────────────────
        String plantName      = getString(payload, "plantName",      "Chili");
        String locationName   = getString(payload, "locationName",   "Unknown");
        String detectedDisease  = getString(payload, "detectedDisease",  null);
        Double diseaseConfidence= parseDoubleOrNull(payload, "diseaseConfidence");
        String diseaseSeverity  = getString(payload, "diseaseSeverity",  null);
        double budget         = parseDouble(payload, "budget",        50);

        // ── 3. Chili thresholds ───────────────────────────────────────────────
        double minN = 80,  maxN = 120;
        double minP = 40,  maxP = 60;
        double minK = 150, maxK = 250;
        double minPh = 5.8, maxPh = 6.8;
        double minMoisture = 60, maxMoisture = 80;

        // ── 4. Fetch live weather ─────────────────────────────────────────────
        String weather = getUpcomingWeather(locationName);

        // ── 5. Build dedicated weather advice block ───────────────────────────
        //    This is ALWAYS returned so the UI can show a weather card regardless
        //    of whether there are soil issues.
        Map<String, Object> weatherAdvice = buildWeatherAdvice(weather, moisture, plantName);

        // ── 6. Soil + disease analysis ────────────────────────────────────────
        List<String> warnings       = new ArrayList<>();
        List<String> actionableAdvice = new ArrayList<>();

        // Nitrogen
        if (n < minN) {
            warnings.add("Low Nitrogen (N = " + (int)n + ")");
            if ("Rain".equals(weather)) {
                actionableAdvice.add("🌧 DO NOT fertilise with Urea today — rain expected. Runoff will pollute waterways. Wait for dry weather.");
            } else if ("Sunny".equals(weather)) {
                actionableAdvice.add("☀️ Good day to apply Urea or chicken manure. Water it in lightly after application.");
            } else {
                actionableAdvice.add("Apply Urea or chicken manure to boost leaf growth. Water in after applying.");
            }
        } else if (n > maxN) {
            warnings.add("High Nitrogen (N = " + (int)n + ")");
            actionableAdvice.add("Stop all nitrogen fertilisers immediately to prevent delayed fruiting and excessive leafy growth.");
        }

        // Phosphorus
        if (p < minP) {
            warnings.add("Low Phosphorus (P = " + (int)p + ")");
            actionableAdvice.add("Apply bone meal or DAP fertiliser to support root and flower development.");
        } else if (p > maxP) {
            warnings.add("High Phosphorus (P = " + (int)p + ")");
            if ("Rain".equals(weather)) {
                actionableAdvice.add("🌧 Stop phosphorus fertilisers. Upcoming rain will naturally flush excess P. Apply Iron/Zinc if leaves yellow.");
            } else {
                actionableAdvice.add("Stop phosphorus fertilisers. Manually flush soil with clean water. Apply Iron/Zinc if leaves yellow.");
            }
        }

        // Potassium
        if (k < minK) {
            warnings.add("Low Potassium (K = " + (int)k + ")");
            actionableAdvice.add("Apply potassium sulfate to improve fruit quality and disease resistance.");
        } else if (k > maxK) {
            warnings.add("High Potassium (K = " + (int)k + ")");
            if ("Rain".equals(weather)) {
                actionableAdvice.add("🌧 Stop potassium fertilisers. Excess K blocks Calcium & Magnesium. Upcoming rain will help flush. Add Cal-Mag supplement.");
            } else {
                actionableAdvice.add("Stop potassium fertilisers. Flush soil with water. Apply Cal-Mag supplement.");
            }
        }

        // pH
        if (ph < minPh) {
            warnings.add("Acidic Soil (pH " + ph + ")");
            actionableAdvice.add("Apply GML (Ground Magnesium Limestone) at 500g per m² to raise soil pH.");
        } else if (ph > maxPh) {
            warnings.add("Alkaline Soil (pH " + ph + ")");
            actionableAdvice.add("Add elemental sulfur or organic compost to lower pH toward 6.0–6.5.");
        }

        // Moisture — full weather-aware watering guidance
        if (moisture < minMoisture) {
            warnings.add("Low Soil Moisture (" + (int)moisture + "%)");
            if ("Rain".equals(weather)) {
                actionableAdvice.add("🌧 Rain is on the way — skip irrigation today. The soil will absorb natural rainfall and save your water bill.");
            } else if ("Cloudy".equals(weather)) {
                actionableAdvice.add("☁️ Cloudy weather slows evaporation. Water lightly — about 2–3 litres per plant. Check again tomorrow.");
            } else if ("Sunny".equals(weather)) {
                actionableAdvice.add("☀️ Hot and sunny — water your " + plantName + " deeply now (4–5 litres per plant) and again at dusk to prevent wilting.");
                if (moisture < 50) {
                    actionableAdvice.add("🚨 Critically dry soil! Water immediately and add mulch around the base to retain moisture.");
                }
            } else {
                actionableAdvice.add("Soil is dry. Irrigate with 3–4 litres per plant. Water at the base, not the leaves.");
            }
        } else if (moisture > maxMoisture) {
            warnings.add("Waterlogged Soil (" + (int)moisture + "%)");
            if ("Rain".equals(weather)) {
                actionableAdvice.add("🌧 Rain expected and soil is already waterlogged! Dig drainage channels urgently to prevent root rot.");
            } else {
                actionableAdvice.add("Stop all watering immediately. Improve drainage by loosening soil around the plant base. Root rot risk is high.");
            }
        } else {
            // Moisture is fine — still give weather-specific advice
            if ("Rain".equals(weather)) {
                actionableAdvice.add("🌧 Moisture looks good and rain is coming — skip irrigation. Ensure drainage channels are clear.");
            } else if ("Sunny".equals(weather)) {
                actionableAdvice.add("☀️ Moisture is adequate but hot sun will increase evaporation. Check soil again by evening — water if surface feels dry.");
            } else if ("Cloudy".equals(weather)) {
                actionableAdvice.add("☁️ Moisture level is healthy. Cloudy weather reduces stress on plants — no immediate watering needed.");
            }
        }

        // Leaf disease
        if (detectedDisease != null && !detectedDisease.isEmpty()
                && !"No disease detected".equalsIgnoreCase(detectedDisease)) {
            warnings.add("Leaf Disease: " + detectedDisease
                    + (diseaseConfidence != null ? " (" + diseaseConfidence.intValue() + "% confidence)" : ""));
            if ("High".equalsIgnoreCase(diseaseSeverity)) {
                actionableAdvice.add("🚨 Severe " + detectedDisease + " detected. Apply Chlorothalonil fungicide immediately. Remove and bag infected leaves. Do not compost them.");
                if ("Rain".equals(weather)) {
                    actionableAdvice.add("🌧 Rain will spread fungal spores — apply a waterproof fungicide before rain arrives if possible.");
                }
            } else {
                actionableAdvice.add("⚠️ " + detectedDisease + " spotted. Apply copper-based spray and remove visibly infected leaves. Monitor daily.");
            }
        }

        // Hot + humid disease risk
        if (moisture > 80 && !"Healthy".equals(weather)) {
            warnings.add("High Fungal-Risk Environment");
            actionableAdvice.add("🌡 Hot and humid — ideal conditions for fungal outbreaks. Ensure good air circulation between plants and apply preventive fungicide.");
        }

        // ── 7. Score & predictive alert ───────────────────────────────────────
        int score = Math.max(0, 100 - warnings.size() * 10);
        String overallStatus = warnings.isEmpty() ? "Healthy" : "Attention Needed";

        String predictiveAlert;
        if (moisture > 80 && !warnings.isEmpty()) {
            predictiveAlert = "⚠️ High risk of fungal disease (e.g., Anthracnose) in the next 48 hours — wet soil + warm air. Prepare fungicide now.";
        } else if (!warnings.isEmpty()) {
            predictiveAlert = "📉 Yield may drop ~" + (warnings.size() * 10) + "% if " + warnings.size() + " issue(s) are left unresolved this week.";
        } else {
            predictiveAlert = "✅ Optimal conditions! Your " + plantName + " is on track for maximum yield.";
        }

        // ── 8. Treatments ─────────────────────────────────────────────────────
        List<Map<String, Object>> allTreatments = buildTreatmentCatalogue(
                n, p, k, ph, moisture, detectedDisease, diseaseSeverity, plantName, weather
        );
        List<Map<String, Object>> filtered = allTreatments.stream()
                .filter(t -> ((Number) t.get("cost")).doubleValue() <= budget)
                .sorted((a, b) -> {
                    double effB = ((Number) b.get("effectiveness")).doubleValue();
                    double effA = ((Number) a.get("effectiveness")).doubleValue();
                    return Double.compare(effB, effA);
                })
                .collect(Collectors.toList());

        // ── 9. Build response ─────────────────────────────────────────────────
        String summary = "For your " + plantName + " in " + locationName + ": "
                + (warnings.isEmpty()
                ? "Soil is healthy — keep up the good work!"
                : warnings.size() + " issue(s) found: " + String.join(", ", warnings) + ".")
                + " Weather: " + weather + "."
                + (detectedDisease != null ? " Leaf scan: " + detectedDisease + "." : "");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("plantName",       plantName);
        response.put("overallStatus",   overallStatus);
        response.put("soilHealthScore", score);
        response.put("weather",         weather);
        response.put("weatherAdvice",   weatherAdvice);   // ← new dedicated block
        response.put("warnings",        warnings);
        response.put("actionableAdvice",actionableAdvice);
        response.put("predictiveAlert", predictiveAlert);
        response.put("treatments",      filtered);
        response.put("summary",         summary);
        response.put("soilIssues",      warnings);        // legacy compat
        response.put("soilTips",        actionableAdvice);// legacy compat
        return response;
    }

    // =========================================================================
    // WEATHER ADVICE BLOCK
    // Builds a rich, standalone weather advisory object.
    // The frontend renders this as its own card — always visible.
    // =========================================================================
    private Map<String, Object> buildWeatherAdvice(String weather, double moisture, String plantName) {
        Map<String, Object> wa = new LinkedHashMap<>();
        wa.put("condition", weather);

        String icon, headline, wateringInstruction, generalTip, fertilisingTip, urgency;

        switch (weather) {
            case "Rain":
                icon = "🌧";
                headline = "Rain expected in the next 24–72 hours";
                urgency = "low";   // watering urgency is low — nature handles it

                // Watering: depends on current moisture level
                if (moisture > 75) {
                    wateringInstruction = "Do NOT water today or tomorrow. Soil is already moist and rain will push it into waterlogged territory. Ensure drainage channels are clear.";
                } else if (moisture >= 60) {
                    wateringInstruction = "Skip watering — incoming rain will top up moisture levels. Check again the day after rain passes.";
                } else {
                    wateringInstruction = "Soil is a bit dry but rain is coming — wait for it before irrigating. You'll save water and avoid double-drenching.";
                }

                fertilisingTip = "Do NOT apply granular fertiliser before rain — it will wash away and pollute waterways. Wait at least 24 hours after rain stops.";
                generalTip = "Trim dense foliage to improve airflow and reduce the risk of fungal spread in wet conditions. Prepare drainage trenches around plant beds.";
                break;

            case "Sunny":
                icon = "☀️";
                headline = "Hot and sunny — high evaporation expected";
                urgency = moisture < 55 ? "high" : "medium";

                if (moisture < 50) {
                    wateringInstruction = "🚨 Water immediately and deeply — 5–6 litres per " + plantName + " plant. Water again at dusk. Add mulch to retain moisture. Do not let roots dry out.";
                } else if (moisture < 65) {
                    wateringInstruction = "Water now with 4–5 litres per plant. Avoid watering between 10am–3pm as water evaporates quickly. Early morning or evening is best.";
                } else {
                    wateringInstruction = "Moisture is adequate for now, but check again at dusk — hot sun will raise evaporation. Water lightly if the top 2cm of soil feels dry.";
                }

                fertilisingTip = "Good day to apply fertiliser — sunny dry conditions improve absorption. Water in gently after applying granular types.";
                generalTip = "Add organic mulch (2–3cm layer) around the base to keep soil cool and reduce water loss. Avoid overhead watering to prevent leaf scorch.";
                break;

            case "Cloudy":
                icon = "☁️";
                headline = "Cloudy — cooler temperatures, lower evaporation";
                urgency = moisture < 60 ? "medium" : "low";

                if (moisture < 60) {
                    wateringInstruction = "Water moderately — 2–3 litres per plant. Cloudy weather reduces evaporation so roots have more time to absorb. No need to water deeply.";
                } else {
                    wateringInstruction = "Moisture level is fine. Cloudy weather slows evaporation, so watering is not needed today. Check tomorrow morning.";
                }

                fertilisingTip = "Suitable day for fertilising — mild temperature helps nutrient absorption without risk of burn. Ideal for liquid fertilisers.";
                generalTip = "Overcast skies reduce plant stress. Good time for pruning, transplanting or applying pest control sprays.";
                break;

            default: // Unknown
                icon = "🌤";
                headline = "Weather data unavailable (WeatherAPI offline or location not found)";
                urgency = "medium";

                if (moisture < 60) {
                    wateringInstruction = "Soil is dry — water with 3–4 litres per plant as a precaution. Adjust based on how conditions feel today.";
                } else if (moisture > 80) {
                    wateringInstruction = "Soil is already very moist — hold off on watering until it drops below 75%.";
                } else {
                    wateringInstruction = "Moisture looks adequate. Use your judgement based on local conditions today.";
                }

                fertilisingTip = "Check weather locally before applying fertiliser to avoid runoff risk.";
                generalTip = "Ensure your WeatherAPI key is active and the location name matches a recognised city (e.g., 'Butterworth' or 'Penang').";
        }

        wa.put("icon",                 icon);
        wa.put("headline",             headline);
        wa.put("urgency",              urgency);
        wa.put("wateringInstruction",  wateringInstruction);
        wa.put("fertilisingTip",       fertilisingTip);
        wa.put("generalTip",           generalTip);
        return wa;
    }

    // =========================================================================
    // 10-TREATMENT CATALOGUE — context-aware effectiveness scores
    // =========================================================================
    private List<Map<String, Object>> buildTreatmentCatalogue(
            double n, double p, double k, double ph, double moisture,
            String disease, String severity, String plantName, String weather
    ) {
        boolean rainComing  = "Rain".equals(weather);
        boolean sunnyComing = "Sunny".equals(weather);
        boolean fungalRisk  = moisture > 75 || (disease != null && !disease.isEmpty());
        boolean npkNeeded   = n < 80 || p < 40 || k < 150;

        List<Map<String, Object>> list = new ArrayList<>();

        // 1. GML
        list.add(makeTreatment("GML (Ground Magnesium Limestone)", 8,
                ph < 5.8 ? 93 : 58,
                "Raises soil pH for acidic laterite soils. Apply 500g per m². "
                        + (rainComing ? "🌧 Apply before rain for better integration into soil." : "Lightly water in after applying."),
                Arrays.asList("Soil pH", "Organic-friendly")));

        // 2. NPK 15-15-15
        list.add(makeTreatment("NPK 15-15-15 Blue Fertiliser", 15,
                npkNeeded ? 88 : 64,
                "Balanced formula correcting multiple deficiencies at once. "
                        + (rainComing ? "🌧 Wait until after rain — granules will wash away." : sunnyComing ? "☀️ Apply this morning and water in." : "Suitable for today's conditions."),
                Arrays.asList("NPK Boost", "Soil Fix")));

        // 3. Urea
        list.add(makeTreatment("Urea 46% Nitrogen (1kg)", 9,
                n < 80 ? 90 : 54,
                "Fast-acting nitrogen for leaf & stem growth. "
                        + (rainComing ? "🌧 Do NOT apply before rain — major runoff risk. Schedule for 2 days after rain." : "Water in lightly after applying."),
                Arrays.asList("Nitrogen", n < 80 ? "High potency" : "Preventive")));

        // 4. Potassium Sulfate
        list.add(makeTreatment("Potassium Sulfate (500g)", 12,
                k < 150 ? 87 : 57,
                "Improves fruit quality and disease resistance. Low chloride — safe for chili. "
                        + (rainComing ? "🌧 Can apply before light rain as K leaches slowly." : "Dissolve in water and apply at root zone."),
                Arrays.asList("Potassium", "Fruit Quality")));

        // 5. DAP
        list.add(makeTreatment("DAP Fertiliser (500g)", 11,
                p < 40 ? 85 : 53,
                "High-phosphorus formula for root development. Also provides some nitrogen. "
                        + (rainComing ? "🌧 Delay until after rain to prevent phosphorus runoff into waterways." : "Dissolve in water for best uptake."),
                Arrays.asList("Phosphorus", "Root Health")));

        // 6. Copper Fungicide
        list.add(makeTreatment("Copper Fungicide Spray (250ml)", 13,
                fungalRisk ? 87 : 64,
                "Broad-spectrum contact fungicide for blight, leaf spot, downy mildew. "
                        + (rainComing ? "🌧 Apply now — before rain arrives — for a protective coat. Rain may wash it off; reapply after." : "Spray on dry leaves for best adhesion."),
                Arrays.asList("Fungal", "Organic-friendly")));

        // 7. Chlorothalonil
        list.add(makeTreatment("Chlorothalonil Fungicide (100ml)", 18,
                "High".equalsIgnoreCase(severity) ? 95 : 71,
                "Strong systemic fungicide for severe " + (disease != null ? disease : "fungal") + " outbreaks. Wear gloves. "
                        + (rainComing ? "🌧 Apply at least 4 hours before rain for absorption. Do not apply within 7 days of harvest." : "Do not apply within 7 days of harvest."),
                Arrays.asList("Fungal", "High potency")));

        // 8. Neem Oil
        list.add(makeTreatment("Neem Oil 100% (500ml)", 10,
                64,
                "Organic option for mild fungal and insect pest control. Mix 5ml per litre of water. "
                        + (sunnyComing ? "☀️ Apply in the evening to prevent leaf burn under hot sun." : "Spray in the evening for best results."),
                Arrays.asList("Organic", "Preventive", "Organic-friendly")));

        // 9. Organic Compost
        list.add(makeTreatment("Premium Organic Compost (3kg)", 12,
                69,
                "Improves soil texture, water retention and microbial health. "
                        + (rainComing ? "🌧 Great time to apply — rain will work it into the topsoil naturally." : "Work into top 5cm of soil around plant base."),
                Arrays.asList("Organic", "Soil Fix", "Long-term")));

        // 10. Cal-Mag Supplement
        list.add(makeTreatment("Cal-Mag Liquid Supplement (500ml)", 16,
                k > 250 ? 83 : 59,
                "Fixes Calcium & Magnesium deficiencies (blocked by excess K). Prevents blossom-end rot in chili. "
                        + (rainComing ? "🌧 Liquid form is fine before rain — absorbed quickly through leaves." : "Dilute and apply as a foliar spray or root drench."),
                Arrays.asList("Minerals", "Deficiency Fix")));

        return list;
    }

    private Map<String, Object> makeTreatment(String name, int cost, int effectiveness, String desc, List<String> tags) {
        Map<String, Object> t = new LinkedHashMap<>();
        t.put("name",          name);
        t.put("cost",          cost);
        t.put("effectiveness", effectiveness);
        t.put("desc",          desc);
        t.put("tags",          tags);
        return t;
    }

    // =========================================================================
    // WEATHER API CALL (WeatherAPI.com)
    // =========================================================================
    // =========================================================================
    // WEATHER API CALL (WeatherAPI.com)
    // =========================================================================
    private String getUpcomingWeather(String location) {
        try {
            // 1. Replace this key if it has expired or reached limits!
            String apiKey = "66b97819390a4bfbab465414260403";

            String loc = (location == null || location.isBlank() || location.equals("Unknown")) ? "Butterworth" : location;

            // Clean the location string so it doesn't break URL structures (removes spaces, etc.)
            loc = java.net.URLEncoder.encode(loc, "UTF-8");

            String urlStr = "http://api.weatherapi.com/v1/forecast.json?key=" + apiKey + "&q=" + loc + "&days=3";

            java.net.URL url = new java.net.URL(urlStr);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);
            conn.connect();

            // LOGGING: Print this to your IntelliJ console so you can see why it fails
            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                System.out.println("[WeatherAPI] Error: Received HTTP " + responseCode + " for location: " + loc);
                return "Unknown";
            }

            java.util.Scanner sc = new java.util.Scanner(url.openStream());
            StringBuilder sb = new StringBuilder();
            while (sc.hasNext()) sb.append(sc.nextLine());
            sc.close();

            String json = sb.toString().toLowerCase();
            if (json.contains("rain") || json.contains("storm") || json.contains("drizzle") || json.contains("thunder")) return "Rain";
            if (json.contains("sunny") || json.contains("clear"))   return "Sunny";
            if (json.contains("cloud") || json.contains("overcast")) return "Cloudy";
            return "Unknown";
        } catch (Exception e) {
            System.out.println("[WeatherAPI] Failed to fetch for: " + location + " — " + e.getMessage());
            return "Unknown";
        }
    }

    // =========================================================================
    // GET /api/geo
    // =========================================================================
    @GetMapping("/geo")
    public Map<String, Object> getGeo(@RequestParam double lat, @RequestParam double lng) {
        Map<String, Object> geo = new LinkedHashMap<>();
        String region, soilType;

        if (lat > 4.5 && lat < 6.5 && lng > 100.0 && lng < 101.5) {
            region = "Penang, Malaysia"; soilType = "Laterite / Sandy loam";
        } else if (lat > 2.5 && lat < 4.5 && lng > 101.0 && lng < 103.5) {
            region = "Selangor, Malaysia"; soilType = "Alluvial / Clay loam";
        } else if (lat > 1.0 && lat < 2.5 && lng > 103.0 && lng < 104.5) {
            region = "Johor, Malaysia"; soilType = "Peat / Sandy loam";
        } else if (lat > 3.0 && lat < 7.0 && lng > 99.5 && lng < 104.0) {
            region = "Peninsular Malaysia"; soilType = "Tropical Laterite";
        } else {
            region = String.format("%.3f°N, %.3f°E", lat, lng); soilType = "Tropical Laterite";
        }

        geo.put("region",           region);
        geo.put("climate",          "Tropical Rainforest");
        geo.put("avg_temp",         "28°C");
        geo.put("humidity",         "78%");
        geo.put("soil_type",        soilType);
        geo.put("rainy_season",     "Oct – Jan");
        geo.put("common_diseases",  Arrays.asList("Leaf Blight", "Root Rot", "Powdery Mildew"));
        geo.put("advisories",       Arrays.asList(
                "High humidity increases fungal risk",
                "Iron & Zinc deficiency common in laterite soils"
        ));
        return geo;
    }

    // =========================================================================
    // PARSE HELPERS
    // =========================================================================
    private double parseDouble(Map<String, Object> m, String k, double d) {
        try { Object v = m.get(k); return v == null ? d : Double.parseDouble(v.toString()); }
        catch (Exception e) { return d; }
    }
    private Double parseDoubleOrNull(Map<String, Object> m, String k) {
        try { Object v = m.get(k); return v == null ? null : Double.parseDouble(v.toString()); }
        catch (Exception e) { return null; }
    }
    private String getString(Map<String, Object> m, String k, String d) {
        Object v = m.get(k);
        return (v == null || v.toString().isBlank()) ? d : v.toString();
    }
}