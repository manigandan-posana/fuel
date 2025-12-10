package com.manage.fuel.service;

import com.manage.fuel.model.User;
import com.manage.fuel.model.UserRole;
import com.manage.fuel.model.Project;
import com.manage.fuel.repository.UserRepository;
import com.manage.fuel.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public User syncUser(Jwt jwt) {
        // Development mode: If no JWT, return a mock/development user
        if (jwt == null) {
            return getOrCreateDevelopmentUser();
        }

        String azureId = jwt.getSubject();
        Optional<User> existingUser = userRepository.findByAzureId(azureId);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        User newUser = new User();
        newUser.setAzureId(azureId);

        String email;
        if (jwt.hasClaim("preferred_username")) {
            email = jwt.getClaimAsString("preferred_username");
        } else if (jwt.hasClaim("email")) {
            email = jwt.getClaimAsString("email");
        } else {
            email = "unknown@domain.com";
        }
        newUser.setEmail(email);

        if (jwt.hasClaim("name")) {
            newUser.setName(jwt.getClaimAsString("name"));
        } else {
            newUser.setName("Unknown User");
        }

        // Check if this is the designated admin email or if no users exist
        if ("gopinath.s@posanagroups.com".equalsIgnoreCase(email) || userRepository.count() == 0) {
            newUser.setRole(UserRole.ADMIN);
        } else {
            newUser.setRole(UserRole.USER);
        }

        return userRepository.save(newUser);
    }

    // Get or create a development user for testing without Azure AD
    private User getOrCreateDevelopmentUser() {
        Optional<User> devUser = userRepository.findByEmail("dev@example.com");

        if (devUser.isPresent()) {
            return devUser.get();
        }

        // Create a new development user
        User newDevUser = new User();
        newDevUser.setAzureId("dev-user-id");
        newDevUser.setEmail("dev@example.com");
        newDevUser.setName("Development User");
        newDevUser.setRole(UserRole.ADMIN);

        return userRepository.save(newDevUser);
    }

    public User assignProject(Long userId, Long projectId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        user.setProject(project);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Ensure the designated admin exists in the system
     * This is called on application startup
     */
    public void ensureAdminExists() {
        String adminEmail = "gopinath.s@posanagroups.com";
        Optional<User> adminUser = userRepository.findByEmail(adminEmail);
        
        if (adminUser.isEmpty()) {
            User admin = new User();
            admin.setAzureId("admin-" + System.currentTimeMillis());
            admin.setEmail(adminEmail);
            admin.setName("Gopinath S");
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
            System.out.println("Default admin user created: " + adminEmail);
        } else {
            // Ensure the user has admin role
            User user = adminUser.get();
            if (user.getRole() != UserRole.ADMIN) {
                user.setRole(UserRole.ADMIN);
                userRepository.save(user);
                System.out.println("Admin role granted to: " + adminEmail);
            }
        }
    }
}
