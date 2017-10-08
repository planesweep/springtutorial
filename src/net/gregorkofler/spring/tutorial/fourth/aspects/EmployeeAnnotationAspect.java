package net.gregorkofler.spring.tutorial.fourth.aspects;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

@Aspect
public class EmployeeAnnotationAspect {

    private final String className = "[" + getClass().getSimpleName() + "]";

    @Before("@annotation(net.gregorkofler.spring.tutorial.fourth.aspects.Loggable)")
    public void myAdvice() {
        System.out.println(className +"Executing myAdvice!!");
    }
}
