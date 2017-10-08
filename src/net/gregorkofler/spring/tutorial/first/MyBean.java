package net.gregorkofler.spring.tutorial.first;

public class MyBean {

    private String turd;

    private String toilette;

    public String getTurd() {
        return turd;
    }

    public void setTurd(String turd) {
        this.turd = turd;
    }

    public String getToilette() {
        return toilette;
    }

    public void setToilette(String toilette) {
        this.toilette = toilette;
    }

    public String toString() {
        return getTurd() + " " + getToilette();
    }
}
