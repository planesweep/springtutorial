package net.gregorkofler.spring.tutorial.fourth;

import org.springframework.context.support.ClassPathXmlApplicationContext;

public class EmployeeMain {

    public static void main(String[] args) {
        ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("net/gregorkofler/spring/tutorial/fourth/spring-bean.xml");
        EmployeeService employeeService = ctx.getBean("employeeService", EmployeeService.class);

        System.out.println("Get Employee...");

        Employee e = employeeService.getEmployee();

        System.out.println("GetName:" + e.getName());

        System.out.println("Set Name:");
        employeeService.getEmployee().setName("Pankaj");

//        employeeService.getEmployee().throwException();

        ctx.close();
    }
}
