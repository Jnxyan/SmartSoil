import java.awt.desktop.SystemEventListener;

public class MainApp {
    public static void main(String[] args){
        Plant chili = new Plant(80, 60, 100);

        chili.getN();
        System.out.println(chili.getN());
        chili.setN(10);
        chili.getN();
        System.out.println(chili.getN());
    }
}
