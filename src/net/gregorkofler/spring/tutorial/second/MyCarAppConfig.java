package net.gregorkofler.spring.tutorial.second;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyCarAppConfig {


    @Bean
    public Golf createGolf(IDriver driver) {
        return new Golf("12345", createDriver());
    }

    @Bean
    public IDriver createDriver() {
        return new IDriver("Gregor", "Gregor");
    }


}
