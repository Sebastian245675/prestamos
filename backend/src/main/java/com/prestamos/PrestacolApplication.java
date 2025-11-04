package com.prestamos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PrestacolApplication {
    public static void main(String[] args) {
        SpringApplication.run(PrestacolApplication.class, args);
    }
}

