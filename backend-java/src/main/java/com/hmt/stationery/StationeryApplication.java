package com.hmt.stationery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class StationeryApplication {

    public static void main(String[] args) {
        SpringApplication.run(StationeryApplication.class, args);
    }
}
