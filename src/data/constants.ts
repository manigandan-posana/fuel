// Initial data for the application
import type { ProjectId, VehicleType, FuelType, Vehicle, FuelEntry, Supplier, DailyLogEntry } from "../types";

export const PROJECTS: ProjectId[] = ["Project A", "Project B"];

export const VEHICLE_TYPES: VehicleType[] = [
    "Own Vehicle",
    "Rent – Monthly",
    "Rent – Daily",
    "Rent – Hourly",
];

export const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Electric"];

// Empty initial data - users will add their own
export const INITIAL_VEHICLES: Vehicle[] = [];

export const INITIAL_FUEL_ENTRIES: FuelEntry[] = [];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_DAILY_LOGS: DailyLogEntry[] = [];
