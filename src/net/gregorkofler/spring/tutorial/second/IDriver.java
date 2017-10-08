package net.gregorkofler.spring.tutorial.second;

public class IDriver implements Person {

    private String name;
    private String id;

    public IDriver() {
    }

    public IDriver(String name, String id) {
        setName(name);
        setId(id);
    }

    @Override
    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
