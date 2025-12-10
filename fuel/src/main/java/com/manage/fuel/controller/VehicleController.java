package com.manage.fuel.controller;

import com.manage.fuel.dto.VehicleDTO;
import com.manage.fuel.model.User;
import com.manage.fuel.service.UserService;
import com.manage.fuel.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<VehicleDTO> getAllVehicles(@AuthenticationPrincipal Jwt principal) {
        User user = userService.syncUser(principal);
        return vehicleService.getVehicles(user);
    }

    @PostMapping
    public VehicleDTO createVehicle(@RequestBody VehicleDTO vehicleDTO, @AuthenticationPrincipal Jwt principal) {
        User user = userService.syncUser(principal);
        return vehicleService.createVehicle(vehicleDTO, user);
    }

    @PutMapping("/{id}")
    public VehicleDTO updateVehicle(@PathVariable Long id, @RequestBody VehicleDTO vehicleDTO, @AuthenticationPrincipal Jwt principal) {
        User user = userService.syncUser(principal);
        return vehicleService.updateVehicle(id, vehicleDTO, user);
    }

    @DeleteMapping("/{id}")
    public void deleteVehicle(@PathVariable Long id, @AuthenticationPrincipal Jwt principal) {
        User user = userService.syncUser(principal);
        vehicleService.deleteVehicle(id, user);
    }
}
