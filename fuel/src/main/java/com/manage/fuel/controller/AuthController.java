package com.manage.fuel.controller;

import com.manage.fuel.dto.UserDTO;
import com.manage.fuel.model.User;
import com.manage.fuel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public UserDTO getCurrentUser(@AuthenticationPrincipal Jwt principal) {
        // UserService handles null JWT for development mode
        User user = userService.syncUser(principal);
        return mapToDTO(user);
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')") // Only admin can list users
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @PostMapping("/users/{userId}/assign-project/{projectId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UserDTO assignProject(@PathVariable Long userId, @PathVariable Long projectId) {
        return mapToDTO(userService.assignProject(userId, projectId));
    }

    @PostMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UserDTO createUser(@RequestBody UserDTO userDTO) {
        User user = userService.createUser(userDTO.getEmail(), userDTO.getName(), userDTO.getProjectId());
        return mapToDTO(user);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        if (user.getProject() != null) {
            dto.setProjectId(user.getProject().getId());
            dto.setProjectName(user.getProject().getName());
        }
        return dto;
    }
}
