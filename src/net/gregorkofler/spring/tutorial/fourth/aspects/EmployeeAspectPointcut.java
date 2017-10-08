package net.gregorkofler.spring.tutorial.fourth.aspects;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;

@Aspect
public class EmployeeAspectPointcut {

    private final String className = "[" + getClass().getSimpleName() + "]";

    @Before("getNamePointcut()")
    public void loggingAdvice() {
        System.out.println(className +"Executing loggingAdvice on getName()");
    }

    @Before("getNamePointcut()")
    public void secondAdvice() {
        System.out.println(className +"Executing secondAdvice on getName()");
    }

    @Pointcut("execution(public String getName())")
    public void getNamePointcut() {
    }

    @Before("allMethodsPointcut()")
    public void allServiceMethodsAdvice() {
        System.out.println(className +"Before executing service method");
    }

    //Pointcut to execute on all the methods of classes in a package
    @Pointcut("within(net.gregorkofler.spring.tutorial.fourth.*)")
    public void allMethodsPointcut() {
    }

}
