import java.util.ArrayList;
import java.util.List;

public class CheckChiliSoilHealth {
    public static class ChiliSoil{
        double n, p, k, ph, ec, temp, humidity;

        public ChiliSoil(double n, double p, double k, double ph, double ec, double temp, double humidity) {
            this.n = n;
            this.p = p;
            this.k = k;
            this.ph = ph;
            this.ec = ec;
            this.temp = temp;
            this.humidity = humidity;
        }

        public static String getUpcomingWeather(){
            try{
                String apikey = "66b97819390a4bfbab465414260403";
                String location = "Butterworth";

                java.net.URL url = new java.net.URL("http://api.weatherapi.com/v1/forecast.json?key=" + apikey
                        + "&q=" + location + "&days=3");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.connect();

                if(conn.getResponseCode() != 200){
                    return "Unknown";
                }

                java.util.Scanner apiScanner = new java.util.Scanner(url.openStream());
                StringBuilder response = new StringBuilder();
                while (apiScanner.hasNext()){
                    response.append(apiScanner.nextLine());
                }
                apiScanner.close();

                String jsonString = response.toString().toLowerCase();

                if(jsonString.contains("rain") || jsonString.contains("storm") || jsonString.contains("drizzle")){
                    return "Rain";
                } else if (jsonString.contains("sunny") || jsonString.contains("clear")) {
                    return "Sunny";
                }
                return "Cloudy";
            }catch(Exception e){
                System.out.println("Weather API connection failed. Defaulting to Unknown.");
                return "Unknown";
            }
        }
        public static class AnalysisResult{
            String crop = "Chili";
            String overallStatus = "Healthy";
            List<String> warnings = new ArrayList<>();
            List<String> actionableAdvice = new ArrayList<>();
            String predictiveAlert = "";
            int soilHealthScore = 100;

            public void printResult(){
                System.out.println("Crop: " + crop);
                System.out.println("Overall Status: " + overallStatus);
                System.out.println("Warnings: " + warnings);
                System.out.println("Actionable Advice: ");
                if(actionableAdvice.isEmpty()){
                    System.out.println("Keep up the good work!");
                }else {
                    for(String advice: actionableAdvice){
                        System.out.println(advice);;
                    }
                }
                System.out.println("PredictiveAlert: " +  predictiveAlert);
                System.out.println("Soil health Score: " + soilHealthScore + "/100");
            }

            public static AnalysisResult analyszeChiliSoil(ChiliSoil chiliData){
                AnalysisResult result = new AnalysisResult();

                String futureWeather = getUpcomingWeather();

                //check nitrogen (N)
                if(chiliData.n < 80){
                    result.warnings.add("Low Nitrogen (N)");
                    if(futureWeather.equals("Rain")){
                        result.actionableAdvice.add("DO NOT fertilize today! " +
                                "\nRain is expected, which will wash away the chemicals into rivers.\n" +
                                "Wait until it clears.");
                    }else {
                        result.actionableAdvice.add("Apply Urea or chicken manure to boost leaf growth.");
                    }
                }else if(chiliData.n > 120){
                    result.warnings.add("High Nitrogen (N)");
                    result.actionableAdvice.add("Stop nitrogen fertilizers to prevent delayed fruiting.");
                }

                //phosphorus (P)
                if(chiliData.p < 40){
                    result.warnings.add("Low Phosphorus (P)");
                    result.actionableAdvice.add("Add bone meal or phosphate fertilizer to support roots.");
                }else if(chiliData.p > 60){
                    result.warnings.add("High Phosphorus (P)");
                    if(futureWeather.equals("Rain")){
                        result.actionableAdvice.add("Stop using Phosphorus rich fertilisers." +
                                "\nRain is expected soon, let nature naturally flush the excess P from the soil!" +
                                "\nApply Iron/Zinc if leaves turn yellow");
                    }else {
                        result.actionableAdvice.add("Stop using Phosphorus rich fertilisers." +
                                "\nWeather is dry, so please manually flush soil with fresh water." +
                                "\nApply Iron/Zinc if leaves turn yellow");
                    }
                }

                //Potassium (K)
                if(chiliData.k < 150){
                    result.warnings.add("Low Potassium (K)");
                    result.actionableAdvice.add("Apply potassium sulfate to improve fruit quality.");
                } else if (chiliData.k > 250) {
                    result.warnings.add("High Potassium (K)");
                    if(futureWeather.equals("Rain")){
                        result.actionableAdvice.add("Stop Potassium fertilizers. Excess K blocks Calcium and Magnesium." +
                                "Let upcoming rain flush the soil naturally." +
                                "Apply Cal-Mag supplements.");
                    }else{
                        result.actionableAdvice.add("stop Potassium fertilizers. Excess K blocks Calcium and Magnesium." +
                                "Manually flush soil with fresh water. Apply Cal-Mag supplements.");
                    }
                }

                //pH
                if (chiliData.ph < 5.8) {
                    result.warnings.add("Acidic Soil (pH " + chiliData.ph + ")");
                    result.actionableAdvice.add("Apply agricultural lime to neutralize acidity.");
                } else if (chiliData.ph > 6.8) {
                    result.warnings.add("Alkaline Soil (pH " + chiliData.ph + ")");
                    result.actionableAdvice.add("Add organic compost to lower pH.");
                }

                //ec
                if (chiliData.ec < 1200) {
                    result.warnings.add("Low EC (Poor Nutrient Availability)");
                    result.actionableAdvice.add("Nutrients are washed out. Apply a balanced NPK fertilizer.");
                } else if (chiliData.ec > 2200) {
                    result.warnings.add("High EC (Salt Toxicity Risk)");
                    if(futureWeather.equals("Rain")){
                        result.actionableAdvice.add("Fertilizer overload! High salt toxicity risk." +
                                "\nRain is expected, which will help flush the salts. drainage.");
                    }else{
                        result.actionableAdvice.add("Fertilizer overload! High salt toxicity risk." +
                                "Manually flush soil with fresh water immediately to remove excess salts.");
                    }
                    result.actionableAdvice.add("Fertilizer overload! Flush the soil with fresh water immediately.");
                }

                //humidity
                if (chiliData.humidity < 60) {
                    result.warnings.add("Low Soil Moisture");
                    if(futureWeather.equals("Rain")){
                        result.actionableAdvice.add("DO NOT WATER TODAY. " +
                                "\nSave water & electricity! Heavy rain is expected in Butterworth soon." +
                                "\nLet nature irrigate it.");
                    }else{
                        result.actionableAdvice.add("Turn on irrigation system. Soil is too dry for Chili.");
                    }

                    //Smart irrigation recommendation
                    if(chiliData.humidity < 50 && futureWeather.equals("Sunny")){
                        result.actionableAdvice.add("Increase irrigation frequency because hot weather will dry the soil faster.");
                    }
                } else if (chiliData.humidity > 80) {
                    result.warnings.add("Waterlogged Soil");
                    result.actionableAdvice.add("Stop watering and improve drainage to prevent root rot.");
                }

                //temperature
                if (chiliData.temp > 32) {
                    result.warnings.add("High Soil Temperature");
                    result.actionableAdvice.add("Apply organic mulch to the soil surface to cool the roots.");
                }else if(chiliData.temp < 23) {
                    result.warnings.add("Low Soil Temperature");
                    result.actionableAdvice.add("Apply black plastic mulch to retain soil heat." +
                            "Reduce watering as cold soil stays wet longer.");
                }

                if(!result.warnings.isEmpty()){
                    result.overallStatus = "Attention Needed";

                    //Disease risk detection
                    if(chiliData.humidity > 85 && chiliData.temp > 31){
                        result.warnings.add("High Disease risk Environment");
                        result.actionableAdvice.add("Hot and humid conditions detected. Monitor plants closely for fungal infection.");
                    }

                    // Predictive feature based on humidity and temp
                    if (chiliData.humidity > 80 && chiliData.temp > 30) {
                        result.predictiveAlert = "High risk of fungal disease (e.g., Anthracnose) in the next 48 hours due to hot and wet conditions. Prepare fungicide.";
                    } else {
                        result.predictiveAlert = "Yield may drop by " + (result.warnings.size() * 10) + "% if these " + result.warnings.size() + " issues are not resolved.";
                    }
                } else {
                    result.predictiveAlert = "Optimal conditions! Expected harvest is on track for maximum yield.";
                }

                result.soilHealthScore = 100 - (result.warnings.size() * 10);

                if(result.soilHealthScore < 0){
                    result.soilHealthScore = 0;
                }

                return result;
            }
        }
    }
}

