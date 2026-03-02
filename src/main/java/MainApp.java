import java.awt.desktop.SystemEventListener;

public class MainApp {
    public static void main(String[] args){
        Plant chiliA = new Plant(80, 60, 100);

        chiliA.getN();
        System.out.println(chiliA.getN());
        chiliA.setN(10);
        chiliA.getN();
        System.out.println(chiliA.getN());


        //start
        //create 5 plant

        String plantName = "chili";
        //use switch case
        switch (plantName){
            case "chili":
                if(chiliA.getN()> 80 && chiliA.getN() <= 180){
                    System.out.println(chiliA.getN() + ", Soil for this plant is suitable");
                }
                else if (chiliA.getN() < 80){
                    System.out.println(chiliA.getN() + ", Soil for this plant is not suitable" +
                            "+ add suggestion");
                }
        }
    }
}
