package com.terragrid.config;

import com.terragrid.model.*;
import com.terragrid.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@terragrid.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);

            User manager = User.builder()
                    .name("Manager User")
                    .email("manager@terragrid.com")
                    .password(passwordEncoder.encode("Manager@123"))
                    .role(Role.MANAGER)
                    .isActive(true)
                    .build();
            userRepository.save(manager);
            
            System.out.println("✅ Seeded initial users.");
        }
    }
}
