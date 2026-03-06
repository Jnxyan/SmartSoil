import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class MainApp {
    public static void main(String[] args) {

        List<Plant> plants = new ArrayList<>();
        // add all plants with ranges from your Excel
        plants.add(new Plant("Chili", 80,120,40,60,150,250,5.8,6.8,1200,2200,25,32,60,80));
        plants.add(new Plant("Durian", 60,100,30,50,200,400,5.5,6.5,800,1500,24,32,40,60));
        plants.add(new Plant("Paddy", 100,150,20,40,40,80,5.0,7.0,500,1200,25,35,80,100));
        plants.add(new Plant("Oil Palm",120,180,30,50,150,300,4.0,5.5,400,800,24,33,70,90));
        plants.add(new Plant("Leafy",150,200,40,70,100,180,6.0,7.0,1500,2500,20,30,50,70));

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

        System.out.println("Suitable crops:");

        boolean found = false;
        for (Plant plant : plants) {
            if (plant.isSuitable(n,p,k,ph,ec,temp,humidity)) {
                System.out.println(plant.getName());
                found = true;
            }
        }

        if (!found) {
            System.out.println("No suitable crops for these soil conditions.");
        }

        CheckChiliSoilHealth.ChiliSoil chiliData = new CheckChiliSoilHealth.ChiliSoil(n, p, k, ph, ec, temp, humidity);
        CheckChiliSoilHealth.ChiliSoil.AnalysisResult result = CheckChiliSoilHealth.ChiliSoil.AnalysisResult.analyszeChiliSoil(chiliData);
        System.out.println("CHILI HEALTH ANALYSIS");
        result.printResult();

        scanner.close();
    }
}
