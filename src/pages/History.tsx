import React, { useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import type { Vehicle, FuelEntry, ProjectId, DailyLogEntry } from "../types";

interface HistoryProps {
    selectedProject: ProjectId;
    vehicles: Vehicle[];
    fuelEntries: FuelEntry[];
    dailyLogs: DailyLogEntry[];
}

interface CombinedHistoryEntry {
    id: string;
    date: Date;
    type: "fuel" | "dailylog";
    vehicleName: string;
    vehicleId: string;
    // Fuel specific
    fuelType?: string;
    supplierName?: string;
    litres?: number;
    pricePerLitre?: number;
    // Common fields
    openingKm: number;
    closingKm?: number;
    distance?: number;
    mileage?: number;
    totalCost?: number;
    status: "open" | "closed";
    openingKmPhoto?: string;
    closingKmPhoto?: string;
}

const History: React.FC<HistoryProps> = ({
    selectedProject,
    vehicles,
    fuelEntries,
    dailyLogs,
}) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
    const [selectedEntry, setSelectedEntry] = useState<CombinedHistoryEntry | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    // Filter vehicles by project
    const projectVehicles = useMemo(() => {
        return vehicles.filter((v) => v.projectId === selectedProject);
    }, [vehicles, selectedProject]);

    // Combine fuel entries and daily logs into a unified history
    const combinedHistory = useMemo(() => {
        const combined: CombinedHistoryEntry[] = [];

        // Add fuel entries
        fuelEntries
            .filter((e) => e.projectId === selectedProject)
            .forEach((entry) => {
                combined.push({
                    id: `fuel-${entry.id}`,
                    date: entry.date,
                    type: "fuel",
                    vehicleName: entry.vehicleName,
                    vehicleId: entry.vehicleId,
                    fuelType: entry.fuelType,
                    supplierName: entry.supplierName,
                    litres: entry.litres,
                    pricePerLitre: entry.pricePerLitre,
                    openingKm: entry.openingKm,
                    closingKm: entry.closingKm,
                    distance: entry.distance,
                    mileage: entry.mileage,
                    totalCost: entry.totalCost,
                    status: entry.status,
                    openingKmPhoto: entry.openingKmPhoto,
                    closingKmPhoto: entry.closingKmPhoto,
                });
            });

        // Add daily logs
        dailyLogs
            .filter((log) => log.projectId === selectedProject)
            .forEach((log) => {
                combined.push({
                    id: `dailylog-${log.id}`,
                    date: log.date,
                    type: "dailylog",
                    vehicleName: log.vehicleName,
                    vehicleId: log.vehicleId,
                    openingKm: log.openingKm,
                    closingKm: log.closingKm,
                    distance: log.distance,
                    status: log.status,
                    openingKmPhoto: log.openingKmPhoto,
                    closingKmPhoto: log.closingKmPhoto,
                });
            });

        return combined;
    }, [fuelEntries, dailyLogs, selectedProject]);

    // Apply filters
    const filteredHistory = useMemo(() => {
        let filtered = [...combinedHistory];

        if (startDate) {
            filtered = filtered.filter((e) => e.date >= startDate);
        }
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            filtered = filtered.filter((e) => e.date <= endOfDay);
        }
        if (selectedVehicleId) {
            filtered = filtered.filter((e) => e.vehicleId === selectedVehicleId);
        }

        return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [combinedHistory, startDate, endDate, selectedVehicleId]);

    const handleClearFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectedVehicleId("");
    };

    const handleRowClick = (entry: CombinedHistoryEntry) => {
        setSelectedEntry(entry);
        setShowDetailsDialog(true);
    };

    const dateBodyTemplate = (rowData: CombinedHistoryEntry) => {
        return new Date(rowData.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const timeBodyTemplate = (rowData: CombinedHistoryEntry) => {
        return new Date(rowData.date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const typeBodyTemplate = (rowData: CombinedHistoryEntry) => {
        return (
            <Tag
                value={rowData.type === "fuel" ? "Fuel Entry" : "Daily Log"}
                severity={rowData.type === "fuel" ? "info" : "warning"}
                icon={rowData.type === "fuel" ? "pi pi-chart-line" : "pi pi-calendar"}
            />
        );
    };

    const numberTemplate = (value: number | undefined, decimals = 2, suffix = "") => {
        return value !== undefined ? `${value.toFixed(decimals)}${suffix ? " " + suffix : ""}` : "-";
    };

    const fuelDetailsTemplate = (rowData: CombinedHistoryEntry) => {
        if (rowData.type === "fuel") {
            return (
                <div>
                    <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                        {rowData.fuelType} - {numberTemplate(rowData.litres, 2, "L")}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                        {rowData.supplierName}
                    </div>
                </div>
            );
        }
        return <span style={{ color: "#6c757d" }}>-</span>;
    };

    const statusBodyTemplate = (rowData: CombinedHistoryEntry) => {
        return (
            <Tag
                value={rowData.status === "open" ? "Open" : "Closed"}
                severity={rowData.status === "open" ? "warning" : "success"}
            />
        );
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value !== undefined ? `₹${value.toFixed(2)}` : "-";
    };

    return (
        <div className="page-container">
            {/* Filters Section */}
            <div
                className="filter-section"
                style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    marginBottom: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#2c3e50" }}>
                    <i className="pi pi-filter" style={{ marginRight: "0.5rem" }}></i>
                    Select Date Range & Vehicle
                </h3>
                <div className="p-fluid grid">
                    <div className="col-12 md:col-3">
                        <label htmlFor="start-date" style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                            Start Date
                        </label>
                        <Calendar
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            placeholder="Select start date"
                        />
                    </div>
                    <div className="col-12 md:col-3">
                        <label htmlFor="end-date" style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                            End Date
                        </label>
                        <Calendar
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            placeholder="Select end date"
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="vehicle-filter" style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                            Vehicle
                        </label>
                        <Dropdown
                            id="vehicle-filter"
                            value={selectedVehicleId}
                            options={[
                                { label: "All Vehicles", value: "" },
                                ...projectVehicles.map((v) => ({
                                    label: `${v.vehicleName} (${v.vehicleNumber})`,
                                    value: v.id,
                                })),
                            ]}
                            onChange={(e) => setSelectedVehicleId(e.value)}
                            placeholder="Select a vehicle"
                        />
                    </div>
                    <div className="col-12 md:col-2" style={{ display: "flex", alignItems: "flex-end" }}>
                        <Button
                            label="Clear"
                            icon="pi pi-times"
                            onClick={handleClearFilters}
                            className="p-button-outlined p-button-secondary"
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </div>

            {/* Unified History Table */}
            <div
                style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#2c3e50" }}>
                    <i className="pi pi-history" style={{ marginRight: "0.5rem" }}></i>
                    All History ({filteredHistory.length} entries)
                </h3>
                <DataTable
                    value={filteredHistory}
                    dataKey="id"
                    emptyMessage="No history found for the selected filters"
                    className="custom-datatable"
                    stripedRows
                    responsiveLayout="scroll"
                    paginator
                    rows={20}
                    selectionMode="single"
                    onRowClick={(e) => handleRowClick(e.data as CombinedHistoryEntry)}
                    style={{ cursor: "pointer" }}
                >
                    <Column
                        field="date"
                        header="Date"
                        body={dateBodyTemplate}
                        sortable
                        style={{ minWidth: "120px" }}
                    />
                    <Column
                        field="date"
                        header="Time"
                        body={timeBodyTemplate}
                        sortable
                        style={{ minWidth: "90px" }}
                    />
                    <Column
                        field="type"
                        header="Type"
                        body={typeBodyTemplate}
                        sortable
                        style={{ minWidth: "130px" }}
                    />
                    <Column
                        field="vehicleName"
                        header="Vehicle"
                        sortable
                        style={{ minWidth: "140px" }}
                    />
                    <Column
                        header="Fuel Details"
                        body={fuelDetailsTemplate}
                        style={{ minWidth: "180px" }}
                    />
                    <Column
                        field="openingKm"
                        header="Opening Km"
                        body={(rowData: CombinedHistoryEntry) => numberTemplate(rowData.openingKm, 1)}
                        sortable
                        style={{ minWidth: "110px" }}
                    />
                    <Column
                        field="closingKm"
                        header="Closing Km"
                        body={(rowData: CombinedHistoryEntry) => numberTemplate(rowData.closingKm, 1)}
                        sortable
                        style={{ minWidth: "110px" }}
                    />
                    <Column
                        field="distance"
                        header="Distance"
                        body={(rowData: CombinedHistoryEntry) => numberTemplate(rowData.distance, 1, "km")}
                        sortable
                        style={{ minWidth: "100px" }}
                    />
                    <Column
                        field="mileage"
                        header="Mileage"
                        body={(rowData: CombinedHistoryEntry) => numberTemplate(rowData.mileage, 2, "km/L")}
                        sortable
                        style={{ minWidth: "100px" }}
                    />
                    <Column
                        field="totalCost"
                        header="Cost"
                        body={(rowData: CombinedHistoryEntry) => currencyBodyTemplate(rowData.totalCost)}
                        sortable
                        style={{ minWidth: "100px" }}
                    />
                    <Column
                        field="status"
                        header="Status"
                        body={statusBodyTemplate}
                        sortable
                        style={{ minWidth: "90px" }}
                    />
                </DataTable>
            </div>

            {/* Details Dialog */}
            <Dialog
                header={
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="pi pi-info-circle" style={{ fontSize: "1.5rem", color: "#3B82F6" }}></i>
                        <span>Entry Details</span>
                    </div>
                }
                visible={showDetailsDialog}
                style={{ width: "700px", maxWidth: "95vw" }}
                onHide={() => {
                    setShowDetailsDialog(false);
                    setSelectedEntry(null);
                }}
                footer={
                    <div>
                        <Button
                            label="Close"
                            icon="pi pi-times"
                            onClick={() => {
                                setShowDetailsDialog(false);
                                setSelectedEntry(null);
                            }}
                            className="p-button-text"
                        />
                    </div>
                }
            >
                {selectedEntry && (
                    <div style={{ padding: "1rem 0" }}>
                        {/* Entry Type Badge */}
                        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                            <Tag
                                value={selectedEntry.type === "fuel" ? "FUEL ENTRY" : "DAILY LOG"}
                                severity={selectedEntry.type === "fuel" ? "info" : "warning"}
                                icon={selectedEntry.type === "fuel" ? "pi pi-chart-line" : "pi pi-calendar"}
                                style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
                            />
                            <Tag
                                value={selectedEntry.status === "open" ? "OPEN" : "CLOSED"}
                                severity={selectedEntry.status === "open" ? "warning" : "success"}
                                style={{ fontSize: "1rem", padding: "0.5rem 1rem", marginLeft: "0.5rem" }}
                            />
                        </div>

                        {/* Basic Information */}
                        <div className="grid" style={{ marginBottom: "1.5rem" }}>
                            <div className="col-6">
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                        Date & Time
                                    </label>
                                    <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                                        {new Date(selectedEntry.date).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div style={{ fontSize: "0.95rem", color: "#6c757d" }}>
                                        {new Date(selectedEntry.date).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                        Vehicle
                                    </label>
                                    <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                                        {selectedEntry.vehicleName}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fuel Specific Details */}
                        {selectedEntry.type === "fuel" && (
                            <div style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
                                <h4 style={{ marginTop: 0, marginBottom: "1rem", color: "#2c3e50" }}>
                                    <i className="pi pi-chart-line" style={{ marginRight: "0.5rem" }}></i>
                                    Fuel Information
                                </h4>
                                <div className="grid">
                                    <div className="col-6">
                                        <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                            Fuel Type
                                        </label>
                                        <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                                            {selectedEntry.fuelType}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                            Supplier
                                        </label>
                                        <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                                            {selectedEntry.supplierName}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                            Litres
                                        </label>
                                        <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                                            {numberTemplate(selectedEntry.litres, 2, "L")}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                            Price per Litre
                                        </label>
                                        <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                                            {selectedEntry.pricePerLitre ? `₹${selectedEntry.pricePerLitre.toFixed(2)}` : "-"}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                            Total Cost
                                        </label>
                                        <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#10B981" }}>
                                            {currencyBodyTemplate(selectedEntry.totalCost)}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                            Mileage
                                        </label>
                                        <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                                            {numberTemplate(selectedEntry.mileage, 2, "km/L")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Odometer Readings */}
                        <div style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
                            <h4 style={{ marginTop: 0, marginBottom: "1rem", color: "#2c3e50" }}>
                                <i className="pi pi-gauge" style={{ marginRight: "0.5rem" }}></i>
                                Odometer Readings
                            </h4>
                            <div className="grid">
                                <div className="col-4">
                                    <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                        Opening Km
                                    </label>
                                    <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#3B82F6" }}>
                                        {numberTemplate(selectedEntry.openingKm, 1)}
                                    </div>
                                </div>
                                <div className="col-4">
                                    <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                        Closing Km
                                    </label>
                                    <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#F59E0B" }}>
                                        {numberTemplate(selectedEntry.closingKm, 1)}
                                    </div>
                                </div>
                                <div className="col-4">
                                    <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>
                                        Distance
                                    </label>
                                    <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#10B981" }}>
                                        {numberTemplate(selectedEntry.distance, 1, "km")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Photos */}
                        {(selectedEntry.openingKmPhoto || selectedEntry.closingKmPhoto) && (
                            <div style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "8px" }}>
                                <h4 style={{ marginTop: 0, marginBottom: "1rem", color: "#2c3e50" }}>
                                    <i className="pi pi-images" style={{ marginRight: "0.5rem" }}></i>
                                    Photos
                                </h4>
                                <div className="grid">
                                    {selectedEntry.openingKmPhoto && (
                                        <div className="col-6">
                                            <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>
                                                Opening Km Photo
                                            </label>
                                            <img
                                                src={selectedEntry.openingKmPhoto}
                                                alt="Opening km"
                                                style={{
                                                    width: "100%",
                                                    borderRadius: "8px",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => window.open(selectedEntry.openingKmPhoto, "_blank")}
                                            />
                                        </div>
                                    )}
                                    {selectedEntry.closingKmPhoto && (
                                        <div className="col-6">
                                            <label style={{ fontWeight: "600", color: "#6c757d", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>
                                                Closing Km Photo
                                            </label>
                                            <img
                                                src={selectedEntry.closingKmPhoto}
                                                alt="Closing km"
                                                style={{
                                                    width: "100%",
                                                    borderRadius: "8px",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => window.open(selectedEntry.closingKmPhoto, "_blank")}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default History;
