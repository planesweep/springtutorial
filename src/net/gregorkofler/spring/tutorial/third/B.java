package net.gregorkofler.spring.tutorial.third;

import org.springframework.beans.factory.annotation.Required;

public class B {

    private A a;

    @Required
    public void setA(A a) {
        this.a = a;
    }

    public String toString() {
        return "This is B." + a;
    }
}
