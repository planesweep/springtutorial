package net.gregorkofler.spring.tutorial.fourth.aspects;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

@Aspect
public class EmployeeAspect {

    private final String className = "[" + getClass().getSimpleName() + "]";

    @Before("execution(public String getName())")
    public void getNameAdvice() {
        System.out.println(className + "Executing Advice on getName()");
    }

    @Before("execution(* net.gregorkofler.spring.tutorial.fourth.*.get*())")
    public void getAllAdvice() {
        System.out.println(className + "Service method getter called");
    }
}
