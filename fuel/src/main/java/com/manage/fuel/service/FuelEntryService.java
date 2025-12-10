package com.manage.fuel.service;

import com.manage.fuel.dto.FuelEntryDTO;
import com.manage.fuel.model.FuelEntry;
import com.manage.fuel.model.User;
import com.manage.fuel.model.UserRole;
import com.manage.fuel.model.Vehicle;
import com.manage.fuel.repository.FuelEntryRepository;
import com.manage.fuel.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuelEntryService {

    @Autowired
    private FuelEntryRepository fuelEntryRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public FuelEntryDTO createEntry(FuelEntryDTO dto, User manager) {
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        // Validation: Manager can only add fuel for vehicles in their project
        if (manager.getRole() != UserRole.ADMIN) {
            if (manager.getProject() == null || !manager.getProject().getId().equals(vehicle.getProject().getId())) {
                 throw new RuntimeException("Access Denied: You cannot manage vehicles outside your project.");
            }
        }

        FuelEntry entry = new FuelEntry();
        entry.setDate(dto.getDate());
        entry.setAmount(dto.getAmount());
        entry.setCost(dto.getCost());
        entry.setOdometerReading(dto.getOdometerReading());
        entry.setVehicle(vehicle);
        entry.setCreatedBy(manager);

        return mapToDTO(fuelEntryRepository.save(entry));
    }

    public List<FuelEntryDTO> getEntries(User user) {
        if (user.getRole() == UserRole.ADMIN) {
             return fuelEntryRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
        } else {
             if (user.getProject() == null) return List.of();
             return fuelEntryRepository.findByVehicleProjectId(user.getProject().getId()).stream()
                     .map(this::mapToDTO).collect(Collectors.toList());
        }
    }

    private FuelEntryDTO mapToDTO(FuelEntry entry) {
        FuelEntryDTO dto = new FuelEntryDTO();
        dto.setId(entry.getId());
        dto.setDate(entry.getDate());
        dto.setAmount(entry.getAmount());
        dto.setCost(entry.getCost());
        dto.setOdometerReading(entry.getOdometerReading());
        dto.setVehicleId(entry.getVehicle().getId());
        dto.setVehiclePlateNumber(entry.getVehicle().getPlateNumber());
        dto.setDriverId(entry.getCreatedBy().getId()); // Manager ID
        dto.setDriverName(entry.getCreatedBy().getName()); // Manager Name
        return dto;
    }
}
