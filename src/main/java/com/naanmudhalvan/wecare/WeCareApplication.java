package com.naanmudhalvan.wecare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.naanmudhalvan.wecare.entity")
@EnableJpaRepositories(basePackages = "com.naanmudhalvan.wecare.repository")
public class WeCareApplication {

    public static void main(String[] args) {
        SpringApplication.run(WeCareApplication.class, args);
    }
}