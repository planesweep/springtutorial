package net.gregorkofler.spring.tutorial.third;

import org.springframework.context.ApplicationListener;

public class CustomEventHandler implements ApplicationListener<CustomEvent> {
    @Override
    public void onApplicationEvent(CustomEvent customEvent) {
        System.out.println("Fired:" +customEvent.toString());
    }
}
