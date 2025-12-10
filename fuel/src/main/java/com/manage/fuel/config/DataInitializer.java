package com.manage.fuel.config;

import com.manage.fuel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Initialization component that runs on application startup
 * Ensures the default admin user exists in the system
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("==============================================");
        System.out.println("Starting Data Initialization...");
        System.out.println("==============================================");
        
        // Ensure default admin user exists
        userService.ensureAdminExists();
        
        System.out.println("==============================================");
        System.out.println("Data Initialization Completed Successfully!");
        System.out.println("==============================================");
    }
}
