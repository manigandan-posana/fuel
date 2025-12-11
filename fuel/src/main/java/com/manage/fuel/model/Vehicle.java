package com.manage.fuel.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_name", nullable = false)
    private String vehicleName;

    @Column(name = "vehicle_no", unique = true, nullable = false)
    private String vehicleNo;

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType; // Own, Monthly Rented, Daily Rented, Hourly Rented

    @Column(name = "fuel_type", nullable = false)
    private String fuelType; // Petrol, Diesel, Electric

    @Column(name = "mileage")
    private Double mileage; // Vehicle mileage in km/l or km/charge

    // Keep for backward compatibility, will be removed later
    @Column(unique = true)
    private String plateNumber;

    @Column
    private String model;

    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id")
    private Project project;

    public Vehicle() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getVehicleNo() { return vehicleNo; }
    public void setVehicleNo(String vehicleNo) { this.vehicleNo = vehicleNo; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public Double getMileage() { return mileage; }
    public void setMileage(Double mileage) { this.mileage = mileage; }

    // Backward compatibility
    public String getPlateNumber() { return plateNumber != null ? plateNumber : vehicleNo; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getModel() { return model != null ? model : vehicleName; }
    public void setModel(String model) { this.model = model; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
}
