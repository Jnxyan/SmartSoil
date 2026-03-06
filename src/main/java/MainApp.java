import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class MainApp {
    public static void main(String[] args) {

        List<Plant> plants = new ArrayList<>();
        // add all plants with ranges from your Excel
        plants.add(new Plant("Chili", 80,120,40,60,150,250,5.8,6.8,1200,2200,25,32,60,80));

        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter Nitrogen (N): ");
        double n = scanner.nextDouble();
        System.out.print("Enter Phosphorus (P): ");
        double p = scanner.nextDouble();
        System.out.print("Enter Potassium (K): ");
        double k = scanner.nextDouble();
        System.out.print("Enter pH: ");
        double ph = scanner.nextDouble();
        System.out.print("Enter EC (us/cm): ");
        double ec = scanner.nextDouble();
        System.out.print("Enter Temperature (°C): ");
        double temp = scanner.nextDouble();
        System.out.print("Enter Humidity (%): ");
        double humidity = scanner.nextDouble();

        System.out.println("Suitable plants:");

        boolean found = false;
        for (Plant plant : plants) {
            if (plant.isSuitable(n,p,k,ph,ec,temp,humidity)) {
                System.out.println(plant.getName());
                found = true;
            }
        }

        if (!found) {
            System.out.println("No suitable plants for these soil conditions.");
        }

        CheckChiliSoilHealth.ChiliSoil chiliData = new CheckChiliSoilHealth.ChiliSoil(n, p, k, ph, ec, temp, humidity);
        CheckChiliSoilHealth.ChiliSoil.AnalysisResult result = CheckChiliSoilHealth.ChiliSoil.AnalysisResult.analyszeChiliSoil(chiliData);
        System.out.println("CHILI HEALTH ANALYSIS");
        result.printResult();

        scanner.close();
    }
}
