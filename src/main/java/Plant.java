public class Plant {
    //1. data field
    private int n;
    private int p;
    private int k;
    //seven data

    //2. constructor
    public Plant(int n, int p, int k){
        this.n = n; //this (n) = above de private int n
        this.p = p;
        this.k = k;
    }

    //3. getter and setter
    //getter
    public  int getN() {
        System.out.print(n);
        return n;
    }
    public void setN(int n) {
        this.n = n;
    }
}
