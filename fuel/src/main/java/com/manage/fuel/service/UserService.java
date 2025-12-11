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
            System.out.println("⚠️ No JWT provided, using development user");
            return getOrCreateDevelopmentUser();
        }

        // Extract Azure ID - try 'oid' first (Azure AD object ID), then 'sub'
        String azureId = jwt.hasClaim("oid") ? jwt.getClaimAsString("oid") : jwt.getSubject();
        System.out.println("🔍 Syncing user with Azure ID: " + azureId);
        
        Optional<User> existingUser = userRepository.findByAzureId(azureId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            System.out.println("✅ Found existing user: " + user.getEmail() + " (Role: " + user.getRole() + ")");
            return user;
        }

        // Extract email from JWT
        String email;
        if (jwt.hasClaim("preferred_username")) {
            email = jwt.getClaimAsString("preferred_username");
        } else if (jwt.hasClaim("email")) {
            email = jwt.getClaimAsString("email");
        } else {
            email = "unknown@domain.com";
        }

        String name;
        if (jwt.hasClaim("name")) {
            name = jwt.getClaimAsString("name");
        } else {
            name = "Unknown User";
        }

        System.out.println("📧 Extracted from JWT - Email: " + email + ", Name: " + name);

        // Check if user was pre-created by admin
        User preCreatedUser = updateUserOnFirstLogin(email, azureId, name);
        if (preCreatedUser != null) {
            System.out.println("✅ Updated pre-created user: " + email + " with Azure ID: " + azureId);
            return preCreatedUser;
        }

        // Only allow auto-creation for admin email or if no users exist (first user)
        if ("gopinath.s@posanagroups.com".equalsIgnoreCase(email) || userRepository.count() == 0) {
            System.out.println("✨ Creating new admin user: " + email);
            User newUser = new User();
            newUser.setAzureId(azureId);
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setRole(UserRole.ADMIN);
            User savedUser = userRepository.save(newUser);
            System.out.println("✅ Admin user created successfully with ID: " + savedUser.getId());
            return savedUser;
        }

        // For all other users, they must be created by admin first
        System.err.println("❌ Access denied for user: " + email + " (Azure ID: " + azureId + ")");
        throw new SecurityException("Access denied for " + email + ". Please contact your administrator to create an account for you.");
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

    public User createUser(String email, String name, Long projectId) {
        // Check if user already exists
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setName(name);
        newUser.setRole(UserRole.USER);
        
        // Azure ID will be set when they first login
        newUser.setAzureId("pending-" + email);
        
        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
            newUser.setProject(project);
        }
        
        return userRepository.save(newUser);
    }

    public User updateUserOnFirstLogin(String email, String azureId, String name) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setAzureId(azureId);
            if (name != null && !name.isEmpty()) {
                user.setName(name);
            }
            return userRepository.save(user);
        }
        return null;
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
