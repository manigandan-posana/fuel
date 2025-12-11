package com.manage.fuel.dto;

public class VehicleDTO {
    private Long id;
    private String vehicleName;
    private String vehicleNo;
    private String driverName;
    private String vehicleType;
    private String fuelType;
    private Double mileage;
    private Long projectId;
    private String projectName;
    
    // Backward compatibility
    private String plateNumber;
    private String model;

    public VehicleDTO() {}

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

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    // Backward compatibility
    public String getPlateNumber() { return plateNumber != null ? plateNumber : vehicleNo; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getModel() { return model != null ? model : vehicleName; }
    public void setModel(String model) { this.model = model; }
}
