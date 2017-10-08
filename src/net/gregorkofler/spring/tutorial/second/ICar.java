package net.gregorkofler.spring.tutorial.second;

public interface ICar extends Searchable {
    public IDriver getDriver();

    public void setDriver(IDriver driver);
}
