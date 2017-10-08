package net.gregorkofler.spring.tutorial.third;

import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyEventApp {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = new ClassPathXmlApplicationContext("net/gregorkofler/spring/tutorial/third/spring-bean.xml");

        ctx.start();

        B b = ctx.getBean("b", B.class);

        System.out.println(b);

        ctx.stop();

        CustomEventPublisher publisher = ctx.getBean("customEventPublisher", CustomEventPublisher.class);
        publisher.publish();
    }
}
