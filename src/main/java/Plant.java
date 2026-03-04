public class Plant {
    //Data field
    String name;
    double minN, maxN;
    double minP, maxP;
    double minK, maxK;
    double minPH, maxPH;
    double minEC, maxEC;
    double minTemp, maxTemp;
    double minHumidity, maxHumidity;

    //Constructor
    public Plant(String name, double minN, double maxN, double minP, double maxP,
                 double minK, double maxK, double minPH, double maxPH,
                 double minEC, double maxEC, double minTemp, double maxTemp,
                 double minHumidity, double maxHumidity) {

        this.name = name;
        this.minN = minN;
        this.maxN = maxN;
        this.minP = minP;
        this.maxP = maxP;
        this.minK = minK;
        this.maxK = maxK;
        this.minPH = minPH;
        this.maxPH = maxPH;
        this.minEC = minEC;
        this.maxEC = maxEC;
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
        this.minHumidity = minHumidity;
        this.maxHumidity = maxHumidity;
    }

    public boolean isSuitable(double n, double p, double k, double ph,
                              double ec, double temp, double humidity) {
        return n >= minN && n <= maxN
                && p >= minP && p <= maxP
                && k >= minK && k <= maxK
                && ph >= minPH && ph <= maxPH
                && ec >= minEC && ec <= maxEC
                && temp >= minTemp && temp <= maxTemp
                && humidity >= minHumidity && humidity <= maxHumidity;
    }

    //Getter
    public String getName() {
        return name;
    }
    public double getMinN() {return minN;}
    public double getMaxN() {return maxN;}
    public double getMinP() {return minP;}
    public double getMaxP() {return maxP;}
    public double getMinK() {return minK;}
    public double getMaxK() {return maxK;}
    public double getMinPH() {return minPH;}
    public double getMaxPH() {return maxPH;}
    public double getMinEC() {return minEC;}
    public double getMaxEC() {return maxEC;}
    public double getMinTemp() {return minTemp;}
    public double getMaxTemp() {return maxTemp;}
    public double getMinHumidity() {return minHumidity;}
    public double getMaxHumidity() {return maxHumidity;}
}