package net.gregorkofler.spring.tutorial.second;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.test.context.ContextConfiguration;

@ContextConfiguration(classes = MyCarAppConfig.class)
public class MyCarApp {

    public static void main(String[] args) {

        ApplicationContext context = new AnnotationConfigApplicationContext(MyCarAppConfig.class);

        ICar car = context.getBean("createGolf",ICar.class);

        System.out.println(car);

    }
}
