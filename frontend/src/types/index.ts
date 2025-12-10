// Type definitions matching backend DTOs

export type UserRole = "ADMIN" | "USER";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  projectId?: number;
  projectName?: string;
}

export interface Project {
  id: number;
  name: string;
  location: string;
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  model: string;
  driverName: string;
  projectId?: number;
  projectName?: string;
}

export interface FuelEntry {
  id: number;
  date: string;
  amount: number;
  cost: number;
  odometerReading: number;
  vehicleId: number;
  vehiclePlateNumber: string;
  driverId: number;
  driverName: string;
}
