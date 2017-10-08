package net.gregorkofler.spring.tutorial.fourth.aspects;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

import java.util.Arrays;

@Aspect
public class EmployeeAspectJointpoint {

    private final String className = "[" + getClass().getSimpleName() + "]";

    @Before("execution(public void net.gregorkofler.spring.tutorial.fourth.*.set*(*))")
    public void useOfJoinPoint(JoinPoint joinPoint) {
        System.out.println(className + " Before running loggingAdvice on method=" + joinPoint.toString());

        System.out.println(className + "Arguments Passed=" + Arrays.toString(joinPoint.getArgs()));

    }

    //Advice arguments, will be applied to bean methods with single String argument
    @Before("args(name)")
    public void logStringArguments(String name) {
        System.out.println(className + "String argument passed=" + name);
    }
}


