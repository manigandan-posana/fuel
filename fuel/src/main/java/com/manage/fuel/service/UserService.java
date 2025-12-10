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
        String azureId = jwt.getSubject();
        Optional<User> existingUser = userRepository.findByAzureId(azureId);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        User newUser = new User();
        newUser.setAzureId(azureId);
        
        if (jwt.hasClaim("preferred_username")) {
            newUser.setEmail(jwt.getClaimAsString("preferred_username"));
        } else if (jwt.hasClaim("email")) {
            newUser.setEmail(jwt.getClaimAsString("email"));
        } else {
            newUser.setEmail("unknown@domain.com");
        }

        if (jwt.hasClaim("name")) {
            newUser.setName(jwt.getClaimAsString("name"));
        } else {
            newUser.setName("Unknown User");
        }

        if (userRepository.count() == 0) {
            newUser.setRole(UserRole.ADMIN);
        } else {
            newUser.setRole(UserRole.USER);
        }

        return userRepository.save(newUser);
    }
    
    public User assignProject(Long userId, Long projectId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        user.setProject(project);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
