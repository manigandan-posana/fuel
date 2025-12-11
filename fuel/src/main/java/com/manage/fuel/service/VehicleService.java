package com.manage.fuel.service;

import com.manage.fuel.dto.VehicleDTO;
import com.manage.fuel.model.Project;
import com.manage.fuel.model.User;
import com.manage.fuel.model.UserRole;
import com.manage.fuel.model.Vehicle;
import com.manage.fuel.repository.ProjectRepository;
import com.manage.fuel.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public VehicleDTO createVehicle(VehicleDTO dto, User currentUser) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleName(dto.getVehicleName());
        vehicle.setVehicleNo(dto.getVehicleNo());
        vehicle.setDriverName(dto.getDriverName());
        vehicle.setVehicleType(dto.getVehicleType());
        vehicle.setFuelType(dto.getFuelType());
        vehicle.setMileage(dto.getMileage());

        // Assign Project
        if (currentUser.getRole() == UserRole.ADMIN) {
            // Admin must specify project in DTO or it might be null (error?)
            // Let's assume Admin specifies it.
            if (dto.getProjectId() != null) {
                Project p = projectRepository.findById(dto.getProjectId())
                        .orElseThrow(() -> new RuntimeException("Project not found"));
                vehicle.setProject(p);
            } else {
                 throw new RuntimeException("Admin must specify project ID");
            }
        } else {
            // Manager: Assign to Manager's project
            if (currentUser.getProject() == null) {
                throw new RuntimeException("Manager is not assigned to any project.");
            }
            vehicle.setProject(currentUser.getProject());
        }

        return mapToDTO(vehicleRepository.save(vehicle));
    }

    public List<VehicleDTO> getVehicles(User user) {
        if (user.getRole() == UserRole.ADMIN) {
            return vehicleRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
        } else {
             if (user.getProject() == null) {
                return List.of();
            }
            return vehicleRepository.findByProjectId(user.getProject().getId()).stream()
                    .map(this::mapToDTO).collect(Collectors.toList());
        }
    }

    public VehicleDTO updateVehicle(Long id, VehicleDTO dto, User currentUser) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        // Check permissions
        if (currentUser.getRole() != UserRole.ADMIN) {
            if (currentUser.getProject() == null || 
                !currentUser.getProject().getId().equals(vehicle.getProject().getId())) {
                throw new RuntimeException("Access Denied: You cannot modify vehicles outside your project.");
            }
        }
        
        vehicle.setVehicleName(dto.getVehicleName());
        vehicle.setVehicleNo(dto.getVehicleNo());
        vehicle.setDriverName(dto.getDriverName());
        vehicle.setVehicleType(dto.getVehicleType());
        vehicle.setFuelType(dto.getFuelType());
        vehicle.setMileage(dto.getMileage());
        
        // Only admin can change project
        if (currentUser.getRole() == UserRole.ADMIN && dto.getProjectId() != null) {
            Project project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            vehicle.setProject(project);
        }
        
        return mapToDTO(vehicleRepository.save(vehicle));
    }

    public void deleteVehicle(Long id, User currentUser) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        // Check permissions
        if (currentUser.getRole() != UserRole.ADMIN) {
            if (currentUser.getProject() == null || 
                !currentUser.getProject().getId().equals(vehicle.getProject().getId())) {
                throw new RuntimeException("Access Denied: You cannot delete vehicles outside your project.");
            }
        }
        
        vehicleRepository.delete(vehicle);
    }
        
    private VehicleDTO mapToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(vehicle.getId());
        dto.setVehicleName(vehicle.getVehicleName());
        dto.setVehicleNo(vehicle.getVehicleNo());
        dto.setDriverName(vehicle.getDriverName());
        dto.setVehicleType(vehicle.getVehicleType());
        dto.setFuelType(vehicle.getFuelType());
        dto.setMileage(vehicle.getMileage());
        dto.setFuelLevel(vehicle.getFuelLevel() != null ? vehicle.getFuelLevel() : 0.0);
        if (vehicle.getProject() != null) {
            dto.setProjectId(vehicle.getProject().getId());
            dto.setProjectName(vehicle.getProject().getName());
        }
        return dto;
    }
}
