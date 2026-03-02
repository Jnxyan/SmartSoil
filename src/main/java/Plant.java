public class Plant {
    //Data field
    String name;
    int minN, maxN;
    int minP, maxP;
    int minK, maxK;
    double minPH, maxPH;
    int minEC, maxEC;
    double minTemp, maxTemp;
    double minHumidity, maxHumidity;

    //Constructor
    public Plant(String name, int minN, int maxN, int minP, int maxP,
                 int minK, int maxK, double minPH, double maxPH,
                 int minEC, int maxEC, double minTemp, double maxTemp,
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

    public boolean isSuitable(int n, int p, int k, double ph,
                              int ec, double temp, double humidity) {
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
}