// Initial data for the application
import type { ProjectId, VehicleType, FuelType, Vehicle, FuelEntry } from "../types/";

export const PROJECTS: ProjectId[] = ["Project A", "Project B"];

export const VEHICLE_TYPES: VehicleType[] = [
    "Own Vehicle",
    "Rent – Monthly",
    "Rent – Daily",
    "Rent – Hourly",
];

export const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Electric"];

export const INITIAL_VEHICLES: Vehicle[] = [
    {
        id: "v1",
        projectId: "Project A",
        vehicleName: "Tipper Lorry 1",
        vehicleNumber: "TN 01 AB 1234",
        vehicleType: "Own Vehicle",
        fuelType: "Diesel",
    },
    {
        id: "v2",
        projectId: "Project A",
        vehicleName: "Site Car",
        vehicleNumber: "TN 02 CD 5678",
        vehicleType: "Rent – Daily",
        fuelType: "Petrol",
    },
    {
        id: "v3",
        projectId: "Project B",
        vehicleName: "Pickup Van",
        vehicleNumber: "TN 03 EF 9012",
        vehicleType: "Rent – Monthly",
        fuelType: "Diesel",
    },
    {
        id: "v4",
        projectId: "Project A",
        vehicleName: "Excavator Transport",
        vehicleNumber: "TN 04 GH 3456",
        vehicleType: "Rent – Hourly",
        fuelType: "Diesel",
    },
    {
        id: "v5",
        projectId: "Project B",
        vehicleName: "Staff Car",
        vehicleNumber: "TN 05 IJ 7890",
        vehicleType: "Own Vehicle",
        fuelType: "Petrol",
    },
];

export const INITIAL_FUEL_ENTRIES: FuelEntry[] = [
    {
        id: "f1",
        date: new Date(),
        projectId: "Project A",
        vehicleId: "v1",
        vehicleName: "Tipper Lorry 1",
        fuelType: "Diesel",
        litres: 50.5,
        openingKm: 1200.0,
        closingKm: 1350.5,
        distance: 150.5,
        mileage: 2.98,
    },
    {
        id: "f2",
        date: new Date(Date.now() - 86400000),
        projectId: "Project A",
        vehicleId: "v1",
        vehicleName: "Tipper Lorry 1",
        fuelType: "Diesel",
        litres: 45.0,
        openingKm: 1050.0,
        closingKm: 1200.0,
        distance: 150.0,
        mileage: 3.33,
    },
    {
        id: "f3",
        date: new Date(),
        projectId: "Project A",
        vehicleId: "v2",
        vehicleName: "Site Car",
        fuelType: "Petrol",
        litres: 30.0,
        openingKm: 5500.0,
        closingKm: 5920.0,
        distance: 420.0,
        mileage: 14.0,
    },
    {
        id: "f4",
        date: new Date(Date.now() - 172800000),
        projectId: "Project A",
        vehicleId: "v2",
        vehicleName: "Site Car",
        fuelType: "Petrol",
        litres: 28.5,
        openingKm: 5150.0,
        closingKm: 5500.0,
        distance: 350.0,
        mileage: 12.28,
    },
    {
        id: "f5",
        date: new Date(Date.now() - 86400000),
        projectId: "Project B",
        vehicleId: "v3",
        vehicleName: "Pickup Van",
        fuelType: "Diesel",
        litres: 40.0,
        openingKm: 8500.0,
        closingKm: 8680.0,
        distance: 180.0,
        mileage: 4.5,
    },
];
