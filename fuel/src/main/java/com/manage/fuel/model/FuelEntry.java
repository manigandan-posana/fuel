package com.manage.fuel.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_entries")
public class FuelEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(name = "litres", nullable = false)
    private Double litres; // Fuel consumed in litres (or units for electric)

    @Column(name = "opening_km", nullable = false)
    private Double openingKm;

    @Column(name = "closing_km", nullable = false)
    private Double closingKm;

    @Column(name = "fuel_price", nullable = false)
    private Double fuelPrice; // Price per litre or per unit

    @Column(name = "distance")
    private Double distance; // Calculated: closingKm - openingKm

    @Column(name = "expected_litres")
    private Double expectedLitres; // Based on vehicle mileage

    @Column(name = "effective_mileage")
    private Double effectiveMileage; // distance / litres

    @Column(name = "driver_bill_amount")
    private Double driverBillAmount; // litres * fuelPrice

    @Column(name = "recommended_pay_amount")
    private Double recommendedPayAmount; // expectedLitres * fuelPrice

    @Column(name = "is_suspicious")
    private Boolean isSuspicious; // Flag for suspicious usage

    // Deprecated fields - keep for backward compatibility
    @Column
    private Double amount; // Deprecated: use litres instead

    @Column
    private Double cost; // Deprecated: use driverBillAmount instead

    @Column
    private Double odometerReading; // Deprecated: use closingKm instead

    @ManyToOne(optional = false)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy; // The manager who entered this

    public FuelEntry() {}

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

    // Deprecated - backward compatibility
    public Double getAmount() { return amount != null ? amount : litres; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Double getCost() { return cost != null ? cost : driverBillAmount; }
    public void setCost(Double cost) { this.cost = cost; }

    public Double getOdometerReading() { return odometerReading != null ? odometerReading : closingKm; }
    public void setOdometerReading(Double odometerReading) { this.odometerReading = odometerReading; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
}
