package net.gregorkofler.spring.tutorial.second;

public interface ICar extends Searchable {
    public void setDriver(IDriver driver);
    public IDriver getDriver();
}
