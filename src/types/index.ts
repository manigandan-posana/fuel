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
  status: "Active" | "Inactive";
  startDate?: Date;
  endDate?: Date;
  statusHistory?: Array<{
    status: "Active" | "Inactive";
    startDate: Date;
    endDate?: Date;
    reason?: string;
  }>;
}

export interface Supplier {
  id: string;
  projectId: ProjectId;
  supplierName: string;
  contactPerson?: string;
  phoneNumber?: string;
  address?: string;
}

export interface FuelEntry {
  id: string;
  date: Date;
  projectId: ProjectId;
  vehicleId: string;
  vehicleName: string;
  fuelType: FuelType;
  supplierId: string;
  supplierName: string;
  litres: number;
  openingKm: number;
  closingKm: number;
  distance: number;
  mileage: number;
  status: "open" | "closed";
  openingKmPhoto?: string;
  closingKmPhoto?: string;
  pricePerLitre?: number;
  totalCost?: number;
}
