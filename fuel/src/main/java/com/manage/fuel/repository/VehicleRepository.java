package com.manage.fuel.repository;

import com.manage.fuel.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByProjectId(Long projectId);
}
