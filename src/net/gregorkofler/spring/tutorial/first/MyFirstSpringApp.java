package net.gregorkofler.spring.tutorial.first;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyFirstSpringApp {

    public static void main(String[] args) {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("net/gregorkofler/spring/tutorial/first/spring-bean.xml");

        MyBean myBean = applicationContext.getBean("myBean", MyBean.class);

        System.out.println(myBean);
    }

}
