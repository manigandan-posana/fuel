package com.manage.fuel.dto;

import java.time.LocalDateTime;

public class FuelEntryDTO {
    private Long id;
    private LocalDateTime date;
    
    // New audit fields
    private Double litres;
    private Double openingKm;
    private Double closingKm;
    private Double fuelPrice;
    private Double distance;
    private Double expectedLitres;
    private Double effectiveMileage;
    private Double driverBillAmount;
    private Double recommendedPayAmount;
    private Boolean isSuspicious;
    
    // Vehicle info
    private Long vehicleId;
    private String vehicleName;
    private String vehicleNo;
    private String vehiclePlateNumber;
    private String driverName;
    private String vehicleType;
    private String fuelType;
    private Double vehicleMileage;
    
    // Deprecated - backward compatibility
    private Double amount;
    private Double cost;
    private Double odometerReading;
    private Long driverId;

    public FuelEntryDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Double getLitres() { return litres; }
    public void setLitres(Double litres) { this.litres = litres; }

    public Double getOpeningKm() { return openingKm; }
    public void setOpeningKm(Double openingKm) { this.openingKm = openingKm; }

    public Double getClosingKm() { return closingKm; }
    public void setClosingKm(Double closingKm) { this.closingKm = closingKm; }

    public Double getFuelPrice() { return fuelPrice; }
    public void setFuelPrice(Double fuelPrice) { this.fuelPrice = fuelPrice; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public Double getExpectedLitres() { return expectedLitres; }
    public void setExpectedLitres(Double expectedLitres) { this.expectedLitres = expectedLitres; }

    public Double getEffectiveMileage() { return effectiveMileage; }
    public void setEffectiveMileage(Double effectiveMileage) { this.effectiveMileage = effectiveMileage; }

    public Double getDriverBillAmount() { return driverBillAmount; }
    public void setDriverBillAmount(Double driverBillAmount) { this.driverBillAmount = driverBillAmount; }

    public Double getRecommendedPayAmount() { return recommendedPayAmount; }
    public void setRecommendedPayAmount(Double recommendedPayAmount) { this.recommendedPayAmount = recommendedPayAmount; }

    public Boolean getIsSuspicious() { return isSuspicious; }
    public void setIsSuspicious(Boolean isSuspicious) { this.isSuspicious = isSuspicious; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getVehicleNo() { return vehicleNo; }
    public void setVehicleNo(String vehicleNo) { this.vehicleNo = vehicleNo; }

    public String getVehiclePlateNumber() { return vehiclePlateNumber; }
    public void setVehiclePlateNumber(String vehiclePlateNumber) { this.vehiclePlateNumber = vehiclePlateNumber; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public Double getVehicleMileage() { return vehicleMileage; }
    public void setVehicleMileage(Double vehicleMileage) { this.vehicleMileage = vehicleMileage; }

    // Deprecated - backward compatibility
    public Double getAmount() { return amount != null ? amount : litres; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Double getCost() { return cost != null ? cost : driverBillAmount; }
    public void setCost(Double cost) { this.cost = cost; }

    public Double getOdometerReading() { return odometerReading != null ? odometerReading : closingKm; }
    public void setOdometerReading(Double odometerReading) { this.odometerReading = odometerReading; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
}
