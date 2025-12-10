// Type definitions for the application

export type ProjectId = "Project A" | "Project B";
export type FuelType = "Petrol" | "Diesel" | "Electric";
export type VehicleType =
  | "Own Vehicle"
  | "Rent – Monthly"
  | "Rent – Daily"
  | "Rent – Hourly";

export interface Vehicle {
  id: string;
  projectId: ProjectId;
  vehicleName: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
}

export interface FuelEntry {
  id: string;
  date: Date;
  projectId: ProjectId;
  vehicleId: string;
  vehicleName: string;
  fuelType: FuelType;
  litres: number;
  openingKm: number;
  closingKm: number;
  distance: number;
  mileage: number;
  openingKmPhoto?: string;
  closingKmPhoto?: string;
}
