package com.manage.fuel.repository;

import com.manage.fuel.model.FuelEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FuelEntryRepository extends JpaRepository<FuelEntry, Long> {
    List<FuelEntry> findByVehicleId(Long vehicleId);
    List<FuelEntry> findByCreatedById(Long userId);
    List<FuelEntry> findByVehicleProjectId(Long projectId); // To find entries by project
}
