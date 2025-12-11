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
  vehicleName: string;
  vehicleNo: string;
  driverName: string;
  vehicleType: 'Own' | 'Monthly Rented' | 'Daily Rented' | 'Hourly Rented';
  fuelType: 'Petrol' | 'Diesel' | 'Electric';
  mileage?: number;
  projectId?: number;
  projectName?: string;
  // Backward compatibility
  plateNumber?: string;
  model?: string;
}

export interface FuelEntry {
  id: number;
  date: string;
  
  // New audit fields
  litres: number;
  openingKm: number;
  closingKm: number;
  fuelPrice: number;
  distance?: number;
  expectedLitres?: number;
  effectiveMileage?: number;
  driverBillAmount?: number;
  recommendedPayAmount?: number;
  isSuspicious?: boolean;
  
  // Vehicle info
  vehicleId: number;
  vehicleName?: string;
  vehicleNo?: string;
  vehiclePlateNumber: string;
  driverName: string;
  vehicleType?: string;
  fuelType?: string;
  vehicleMileage?: number;
  
  // Deprecated - backward compatibility
  amount?: number;
  cost?: number;
  odometerReading?: number;
  driverId?: number;
}
