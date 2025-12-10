package com.manage.fuel.controller;

import com.manage.fuel.dto.FuelEntryDTO;
import com.manage.fuel.model.User;
import com.manage.fuel.service.FuelEntryService;
import com.manage.fuel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
public class FuelController {

    @Autowired
    private FuelEntryService fuelEntryService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<FuelEntryDTO> getEntries(@AuthenticationPrincipal Jwt principal) {
        User user = userService.syncUser(principal);
        return fuelEntryService.getEntries(user);
    }

    @PostMapping
    public FuelEntryDTO createEntry(@RequestBody FuelEntryDTO dto, @AuthenticationPrincipal Jwt principal) {
        User user = userService.syncUser(principal);
        return fuelEntryService.createEntry(dto, user);
    }

    @PutMapping("/{id}")
    public FuelEntryDTO updateEntry(@PathVariable Long id, @RequestBody FuelEntryDTO dto, @AuthenticationPrincipal Jwt principal) {
        User user = userService.syncUser(principal);
        return fuelEntryService.updateEntry(id, dto, user);
    }

    @DeleteMapping("/{id}")
    public void deleteEntry(@PathVariable Long id, @AuthenticationPrincipal Jwt principal) {
        User user = userService.syncUser(principal);
        fuelEntryService.deleteEntry(id, user);
    }
}
