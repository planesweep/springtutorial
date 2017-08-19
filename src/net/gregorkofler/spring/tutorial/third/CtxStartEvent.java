package net.gregorkofler.spring.tutorial.third;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextStartedEvent;

public class CtxStartEvent implements ApplicationListener<ContextStartedEvent> {
    @Override
    public void onApplicationEvent(ContextStartedEvent contextStartedEvent) {
        System.out.println("start: "+contextStartedEvent.getSource());
    }
}
