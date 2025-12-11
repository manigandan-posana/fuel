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
        entry.setLitres(dto.getLitres());
        entry.setOpeningKm(dto.getOpeningKm());
        entry.setClosingKm(dto.getClosingKm());
        entry.setFuelPrice(dto.getFuelPrice());
        entry.setVehicle(vehicle);
        entry.setCreatedBy(manager);

        // Calculate audit statistics
        calculateAuditStats(entry, vehicle);

        // Update vehicle fuel level
        updateVehicleFuelLevel(vehicle, entry.getLitres(), entry.getExpectedLitres());

        return mapToDTO(fuelEntryRepository.save(entry));
    }

    private void calculateAuditStats(FuelEntry entry, Vehicle vehicle) {
        // Calculate distance
        double distance = entry.getClosingKm() - entry.getOpeningKm();
        entry.setDistance(distance);

        // Calculate expected litres based on vehicle mileage
        double expectedLitres = 0;
        if (vehicle.getMileage() != null && vehicle.getMileage() > 0) {
            expectedLitres = distance / vehicle.getMileage();
        }
        entry.setExpectedLitres(expectedLitres);

        // Calculate effective mileage
        double effectiveMileage = 0;
        if (entry.getLitres() > 0) {
            effectiveMileage = distance / entry.getLitres();
        }
        entry.setEffectiveMileage(effectiveMileage);

        // Calculate driver bill amount
        double driverBillAmount = entry.getLitres() * entry.getFuelPrice();
        entry.setDriverBillAmount(driverBillAmount);

        // Calculate recommended pay amount
        double recommendedPayAmount = expectedLitres * entry.getFuelPrice();
        entry.setRecommendedPayAmount(recommendedPayAmount);

        // Check if usage is suspicious (effective mileage < 70% of rated mileage)
        boolean isSuspicious = false;
        if (vehicle.getMileage() != null && vehicle.getMileage() > 0) {
            if (effectiveMileage > 0 && effectiveMileage < vehicle.getMileage() * 0.7) {
                isSuspicious = true;
            }
        }
        entry.setIsSuspicious(isSuspicious);
    }

    private void updateVehicleFuelLevel(Vehicle vehicle, double litresFilled, double litresConsumed) {
        // Calculate remaining fuel: filled - consumed
        double remainingFuel = litresFilled - litresConsumed;
        
        // Update vehicle's fuel level
        Double currentFuelLevel = vehicle.getFuelLevel() != null ? vehicle.getFuelLevel() : 0.0;
        vehicle.setFuelLevel(currentFuelLevel + remainingFuel);
        
        vehicleRepository.save(vehicle);
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

    public FuelEntryDTO updateEntry(Long id, FuelEntryDTO dto, User user) {
        FuelEntry entry = fuelEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fuel entry not found"));
        
        // Check permissions
        if (user.getRole() != UserRole.ADMIN) {
            if (user.getProject() == null || 
                !user.getProject().getId().equals(entry.getVehicle().getProject().getId())) {
                throw new RuntimeException("Access Denied: You cannot modify entries outside your project.");
            }
        }
        
        // Store old values to reverse the fuel level change
        Vehicle oldVehicle = entry.getVehicle();
        double oldLitres = entry.getLitres();
        double oldExpectedLitres = entry.getExpectedLitres() != null ? entry.getExpectedLitres() : 0.0;
        
        entry.setDate(dto.getDate());
        entry.setLitres(dto.getLitres());
        entry.setOpeningKm(dto.getOpeningKm());
        entry.setClosingKm(dto.getClosingKm());
        entry.setFuelPrice(dto.getFuelPrice());
        
        // Allow changing vehicle if admin
        Vehicle vehicle = entry.getVehicle();
        if (user.getRole() == UserRole.ADMIN && dto.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            entry.setVehicle(vehicle);
        }
        
        // Recalculate audit statistics
        calculateAuditStats(entry, vehicle);
        
        // Reverse old fuel level change from old vehicle
        updateVehicleFuelLevel(oldVehicle, -oldLitres, -oldExpectedLitres);
        
        // Apply new fuel level change to new vehicle
        updateVehicleFuelLevel(vehicle, entry.getLitres(), entry.getExpectedLitres());
        
        return mapToDTO(fuelEntryRepository.save(entry));
    }

    public void deleteEntry(Long id, User user) {
        FuelEntry entry = fuelEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fuel entry not found"));
        
        // Check permissions
        if (user.getRole() != UserRole.ADMIN) {
            if (user.getProject() == null || 
                !user.getProject().getId().equals(entry.getVehicle().getProject().getId())) {
                throw new RuntimeException("Access Denied: You cannot delete entries outside your project.");
            }
        }
        
        // Reverse the fuel level change
        Vehicle vehicle = entry.getVehicle();
        double litres = entry.getLitres();
        double expectedLitres = entry.getExpectedLitres() != null ? entry.getExpectedLitres() : 0.0;
        updateVehicleFuelLevel(vehicle, -litres, -expectedLitres);
        
        fuelEntryRepository.delete(entry);
    }

    private FuelEntryDTO mapToDTO(FuelEntry entry) {
        FuelEntryDTO dto = new FuelEntryDTO();
        dto.setId(entry.getId());
        dto.setDate(entry.getDate());
        
        // New audit fields
        dto.setLitres(entry.getLitres());
        dto.setOpeningKm(entry.getOpeningKm());
        dto.setClosingKm(entry.getClosingKm());
        dto.setFuelPrice(entry.getFuelPrice());
        dto.setDistance(entry.getDistance());
        dto.setExpectedLitres(entry.getExpectedLitres());
        dto.setEffectiveMileage(entry.getEffectiveMileage());
        dto.setDriverBillAmount(entry.getDriverBillAmount());
        dto.setRecommendedPayAmount(entry.getRecommendedPayAmount());
        dto.setIsSuspicious(entry.getIsSuspicious());
        
        // Vehicle info
        dto.setVehicleId(entry.getVehicle().getId());
        dto.setVehicleName(entry.getVehicle().getVehicleName());
        dto.setVehicleNo(entry.getVehicle().getVehicleNo());
        dto.setVehiclePlateNumber(entry.getVehicle().getPlateNumber());
        dto.setDriverName(entry.getVehicle().getDriverName());
        dto.setVehicleType(entry.getVehicle().getVehicleType());
        dto.setFuelType(entry.getVehicle().getFuelType());
        dto.setVehicleMileage(entry.getVehicle().getMileage());
        
        // Created by info
        dto.setDriverId(entry.getCreatedBy().getId());
        
        return dto;
    }
}
