package com.manage.fuel.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String plateNumber;

    @Column(nullable = false)
    private String model;

    @Column(name = "driver_name")
    private String driverName; // The name of the driver assigned to this vehicle

    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id")
    private Project project;

    public Vehicle() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
}
