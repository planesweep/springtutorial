package net.gregorkofler.java8.lambda;

public interface InterfaceWithDefaultMethod {

    default void say() {
        System.out.println(getClass().getName());
    }
}
