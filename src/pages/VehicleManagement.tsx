import React, { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import toast from "react-hot-toast";
import type { Vehicle, FuelEntry, ProjectId, VehicleType, FuelType } from "../types";
import { VEHICLE_TYPES, FUEL_TYPES } from "../data/constants";

interface VehicleManagementProps {
    selectedProject: ProjectId;
    vehicles: Vehicle[];
    fuelEntries?: FuelEntry[];
    onAddVehicle: (vehicle: Omit<Vehicle, "id">) => void;
    onDeleteVehicle: (id: string) => void;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({
    selectedProject,
    vehicles,
    fuelEntries = [],
    onAddVehicle,
    onDeleteVehicle,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    const [showFuelDialog, setShowFuelDialog] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleForm, setVehicleForm] = useState<{
        vehicleName: string;
        vehicleNumber: string;
        vehicleType: VehicleType;
        fuelType: FuelType;
        status: "Active" | "Inactive";
    }>({
        vehicleName: "",
        vehicleNumber: "",
        vehicleType: "Own Vehicle",
        fuelType: "Petrol",
        status: "Active",
    });

    const projectVehicles = useMemo(
        () => vehicles.filter((v) => v.projectId === selectedProject),
        [vehicles, selectedProject]
    );

    const vehicleFuelEntries = useMemo(() => {
        if (!selectedVehicle) return [];
        return fuelEntries
            .filter((e) => e.vehicleId === selectedVehicle.id)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [fuelEntries, selectedVehicle]);

    const handleAddVehicle = () => {
        if (!vehicleForm.vehicleName.trim() || !vehicleForm.vehicleNumber.trim()) {
            toast.error("Please fill all required fields");
            return;
        }

        onAddVehicle({
            projectId: selectedProject,
            ...vehicleForm,
            status: vehicleForm.status,
        });

        setShowDialog(false);
        setVehicleForm({
            vehicleName: "",
            vehicleNumber: "",
            vehicleType: "Own Vehicle",
            fuelType: "Petrol",
            status: "Active",
        });
        toast.success("✅ Vehicle added successfully!");
    };

    const handleRowClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setShowFuelDialog(true);
    };

    const vehicleActionsTemplate = (rowData: Vehicle) => (
        <Button
            icon="pi pi-trash"
            rounded
            text
            size="small"
            severity="danger"
            onClick={(e) => {
                e.stopPropagation();
                onDeleteVehicle(rowData.id);
                toast.success("🗑️ Vehicle deleted");
            }}
            tooltip="Delete"
            tooltipOptions={{ position: "left" }}
        />
    );

    const dateTemplate = (rowData: FuelEntry) => rowData.date.toLocaleDateString();
    const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);

    return (
        <div className="page-container">
            <div className="page-header">
                <div></div>
                <Button
                    label="Add Vehicle"
                    icon="pi pi-plus"
                    onClick={() => setShowDialog(true)}
                    severity="success"
                    raised
                />
            </div>

            <DataTable
                value={projectVehicles}
                paginator
                rows={10}
                dataKey="id"
                emptyMessage="No vehicles found. Click 'Add Vehicle' to get started."
                className="custom-datatable"
                stripedRows
                responsiveLayout="scroll"
                onRowClick={(e) => handleRowClick(e.data as Vehicle)}
                rowHover
                style={{ cursor: fuelEntries.length > 0 ? "pointer" : "default" }}
            >
                <Column
                    field="vehicleName"
                    header="Vehicle Name"
                    sortable
                    body={(rowData: Vehicle) => (
                        <span className="font-medium">{rowData.vehicleName}</span>
                    )}
                    style={{ minWidth: '180px' }}
                />
                <Column
                    field="vehicleNumber"
                    header="Vehicle Number"
                    sortable
                    body={(rowData: Vehicle) => <span className="text-700">{rowData.vehicleNumber}</span>}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    field="vehicleType"
                    header="Type"
                    body={(rowData: Vehicle) => <span className="text-700">{rowData.vehicleType}</span>}
                    sortable
                    style={{ minWidth: '140px' }}
                />
                <Column
                    field="fuelType"
                    header="Fuel Type"
                    body={(rowData: Vehicle) => {
                        const color = rowData.fuelType === "Petrol" ? "text-green-600" : rowData.fuelType === "Diesel" ? "text-orange-600" : "text-blue-600";
                        return <span className={`font-medium ${color}`}>{rowData.fuelType}</span>;
                    }}
                    sortable
                    style={{ minWidth: '120px' }}
                />
                <Column
                    field="status"
                    header="Status"
                    body={(rowData: Vehicle) => {
                        const isActive = rowData.status !== "Inactive";
                        return (
                            <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {isActive ? 'Active' : 'Inactive'}
                            </span>
                        );
                    }}
                    sortable
                    style={{ minWidth: '100px' }}
                />
                <Column
                    header="Total Km"
                    body={(rowData: Vehicle) => {
                        const vehicleEntries = fuelEntries.filter(e => e.vehicleId === rowData.id && e.status === 'closed');
                        const totalKm = vehicleEntries.reduce((sum, e) => sum + (e.distance || 0), 0);
                        return <span className="font-medium text-700">{totalKm.toFixed(1)} km</span>;
                    }}
                    sortable
                    style={{ minWidth: '110px' }}
                />
                <Column
                    header="Total Litres"
                    body={(rowData: Vehicle) => {
                        const vehicleEntries = fuelEntries.filter(e => e.vehicleId === rowData.id);
                        const totalLitres = vehicleEntries.reduce((sum, e) => sum + (e.litres || 0), 0);
                        return <span className="font-medium text-700">{totalLitres.toFixed(2)} L</span>;
                    }}
                    sortable
                    style={{ minWidth: '120px' }}
                />
                <Column
                    header="Avg Mileage"
                    body={(rowData: Vehicle) => {
                        const vehicleEntries = fuelEntries.filter(e => e.vehicleId === rowData.id && e.status === 'closed');
                        const totalKm = vehicleEntries.reduce((sum, e) => sum + (e.distance || 0), 0);
                        const totalLitres = fuelEntries.filter(e => e.vehicleId === rowData.id).reduce((sum, e) => sum + (e.litres || 0), 0);
                        const avgMileage = totalLitres > 0 ? totalKm / totalLitres : 0;
                        return <span className="font-medium text-green-600">{avgMileage.toFixed(2)} km/l</span>;
                    }}
                    sortable
                    style={{ minWidth: '130px' }}
                />
                <Column
                    body={vehicleActionsTemplate}
                    exportable={false}
                    style={{ width: "80px", textAlign: "center" }}
                />
            </DataTable>

            <Dialog
                header="Add New Vehicle"
                visible={showDialog}
                style={{ width: "450px" }}
                onHide={() => setShowDialog(false)}
                footer={
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <Button label="Cancel" icon="pi pi-times" onClick={() => setShowDialog(false)} outlined size="small" />
                        <Button label="Save" icon="pi pi-check" onClick={handleAddVehicle} severity="success" raised size="small" />
                    </div>
                }
            >
                <div className="dialog-form pt-4">
                    <FloatLabel>
                        <InputText
                            id="vehicleName"
                            value={vehicleForm.vehicleName}
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, vehicleName: e.target.value }))}
                            className="w-full"
                        />
                        <label htmlFor="vehicleName">Vehicle Name *</label>
                    </FloatLabel>

                    <FloatLabel>
                        <InputText
                            id="vehicleNumber"
                            value={vehicleForm.vehicleNumber}
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))}
                            className="w-full"
                        />
                        <label htmlFor="vehicleNumber">Vehicle Number *</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            id="vehicleType"
                            value={vehicleForm.vehicleType}
                            options={VEHICLE_TYPES.map((t) => ({ label: t, value: t }))}
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, vehicleType: e.value }))}
                            className="w-full"
                        />
                        <label htmlFor="vehicleType">Vehicle Type</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            id="fuelType"
                            value={vehicleForm.fuelType}
                            options={FUEL_TYPES.map((t) => ({ label: t, value: t }))}
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, fuelType: e.value }))}
                            className="w-full"
                        />
                        <label htmlFor="fuelType">Fuel Type</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            id="status"
                            value={vehicleForm.status}
                            options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]}
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, status: e.value }))}
                            className="w-full"
                        />
                        <label htmlFor="status">Status</label>
                    </FloatLabel>
                </div>
            </Dialog>

            <Dialog
                header={`Fuel Entries - ${selectedVehicle?.vehicleName || ""}`}
                visible={showFuelDialog}
                style={{ width: "850px", maxWidth: "95vw" }}
                onHide={() => {
                    setShowFuelDialog(false);
                    setSelectedVehicle(null);
                }}
            >
                {selectedVehicle && (
                    <div>
                        <DataTable
                            value={vehicleFuelEntries}
                            paginator
                            rows={5}
                            dataKey="id"
                            emptyMessage="No fuel entries found for this vehicle"
                            className="custom-datatable"
                            stripedRows
                        >
                            <Column field="date" header="Date" body={dateTemplate} sortable style={{ minWidth: '120px' }} />
                            <Column
                                field="supplierName"
                                header="Supplier"
                                body={(rowData: FuelEntry) => <span className="text-700">{rowData.supplierName}</span>}
                                sortable
                                style={{ minWidth: '150px' }}
                            />
                            <Column
                                field="litres"
                                header="Litres"
                                body={(rowData: FuelEntry) => <span className="font-medium">{numberTemplate(rowData.litres, 2)} L</span>}
                                sortable
                                style={{ minWidth: '100px' }}
                            />
                            <Column
                                field="distance"
                                header="Distance"
                                body={(rowData: FuelEntry) =>
                                    rowData.status === "closed" ? (
                                        <span className="font-medium text-green-600">{numberTemplate(rowData.distance, 1)} km</span>
                                    ) : (
                                        <span className="text-500">—</span>
                                    )
                                }
                                sortable
                                style={{ minWidth: '110px' }}
                            />
                            <Column
                                field="mileage"
                                header="Mileage"
                                body={(rowData: FuelEntry) =>
                                    rowData.status === "closed" ? (
                                        <span className="font-medium text-green-600">{numberTemplate(rowData.mileage, 2)} km/l</span>
                                    ) : (
                                        <span className="text-500">—</span>
                                    )
                                }
                                sortable
                                style={{ minWidth: '110px' }}
                            />
                            <Column
                                header="Status"
                                body={(rowData: FuelEntry) => (
                                    <span className={`font-medium ${rowData.status === "closed" ? 'text-green-600' : 'text-orange-600'}`}>
                                        {rowData.status === "closed" ? "Closed" : "Open"}
                                    </span>
                                )}
                                style={{ minWidth: '100px' }}
                            />
                        </DataTable>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default VehicleManagement;
