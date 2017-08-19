package net.gregorkofler.spring.tutorial.second;

import org.springframework.beans.factory.annotation.Required;

public class Golf implements ICar {

    private String id;
    private IDriver driver;

    public Golf(){
    }

    public Golf(String id, IDriver driver) {
        this.id = id;
        this.driver = driver;
    }

    @Override
    public String getId() {
        return id;
    }

    @Required
    public void setId(String id) {
        this.id = id;
    }

    @Override
    public IDriver getDriver() {
        return driver;
    }

    @Required
    @Override
    public void setDriver(IDriver driver) {
        this.driver=driver;
    }

    public String toString(){
        return new StringBuffer().append("ID:").append(getId()).append(" Driver:").append(getDriver().getName()).toString();
    }
}
