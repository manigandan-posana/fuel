import React, { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import toast from "react-hot-toast";
import type { Vehicle, FuelEntry, ProjectId, FuelType } from "../types/";

interface FuelManagementProps {
    selectedProject: ProjectId;
    vehicles: Vehicle[];
    fuelEntries: FuelEntry[];
    onAddFuelEntry: (entry: Omit<FuelEntry, "id">) => void;
    onDeleteFuelEntry: (id: string) => void;
}

const FuelManagement: React.FC<FuelManagementProps> = ({
    selectedProject,
    vehicles,
    fuelEntries,
    onAddFuelEntry,
    onDeleteFuelEntry,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    const [activeFuelType, setActiveFuelType] = useState<FuelType>("Petrol");
    const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string | null>(null);
    const [fuelForm, setFuelForm] = useState<{
        date: Date;
        vehicleId: string;
        litres: number;
        openingKm: number;
        closingKm: number;
        openingKmPhoto: string;
        closingKmPhoto: string;
    }>({
        date: new Date(),
        vehicleId: "",
        litres: 0,
        openingKm: 0,
        closingKm: 0,
        openingKmPhoto: "",
        closingKmPhoto: "",
    });

    const projectVehicles = useMemo(
        () => vehicles.filter((v) => v.projectId === selectedProject),
        [vehicles, selectedProject]
    );

    const fuelTypeVehicles = useMemo(
        () => projectVehicles.filter((v) => v.fuelType === activeFuelType),
        [projectVehicles, activeFuelType]
    );

    const filteredFuelEntries = useMemo(() => {
        let filtered = fuelEntries.filter(
            (e) => e.projectId === selectedProject && e.fuelType === activeFuelType
        );
        if (selectedVehicleFilter) {
            filtered = filtered.filter((e) => e.vehicleId === selectedVehicleFilter);
        }
        return filtered.slice().sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [fuelEntries, selectedProject, activeFuelType, selectedVehicleFilter]);

    const cumulativeDistance = useMemo(
        () => filteredFuelEntries.reduce((sum, e) => sum + e.distance, 0),
        [filteredFuelEntries]
    );

    const handleAddFuelEntry = () => {
        if (!fuelForm.vehicleId) {
            toast.error("Please select a vehicle");
            return;
        }
        if (fuelForm.litres <= 0) {
            toast.error("Litres must be greater than 0");
            return;
        }
        if (fuelForm.closingKm < fuelForm.openingKm) {
            toast.error("Closing km must be ≥ opening km");
            return;
        }

        const vehicle = vehicles.find((v) => v.id === fuelForm.vehicleId);
        if (!vehicle) {
            toast.error("Vehicle not found");
            return;
        }

        const distance = fuelForm.closingKm - fuelForm.openingKm;
        const mileage = distance / fuelForm.litres;

        onAddFuelEntry({
            date: fuelForm.date,
            projectId: selectedProject,
            vehicleId: vehicle.id,
            vehicleName: vehicle.vehicleName,
            fuelType: vehicle.fuelType,
            litres: fuelForm.litres,
            openingKm: fuelForm.openingKm,
            closingKm: fuelForm.closingKm,
            distance,
            mileage,
            openingKmPhoto: fuelForm.openingKmPhoto || undefined,
            closingKmPhoto: fuelForm.closingKmPhoto || undefined,
        });

        setShowDialog(false);
        setFuelForm({
            date: new Date(),
            vehicleId: "",
            litres: 0,
            openingKm: 0,
            closingKm: 0,
            openingKmPhoto: "",
            closingKmPhoto: "",
        });
        toast.success("⛽ Fuel entry added successfully!");
    };

    const handleFileUpload = (
        field: "openingKmPhoto" | "closingKmPhoto",
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFuelForm((prev) => ({
                ...prev,
                [field]: file.name,
            }));
        }
    };

    const dateTemplate = (rowData: FuelEntry) => rowData.date.toLocaleDateString();

    const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);

    const fuelTypeTemplate = (rowData: FuelEntry) => {
        const severity =
            rowData.fuelType === "Petrol"
                ? "success"
                : rowData.fuelType === "Diesel"
                    ? "warning"
                    : "info";
        const icon = rowData.fuelType === "Electric" ? "pi pi-bolt" : "pi pi-circle-fill";
        return (
            <Tag value={rowData.fuelType} severity={severity} icon={icon} style={{ fontSize: "11px" }} />
        );
    };

    const photosTemplate = (rowData: FuelEntry) => {
        const hasOpening = !!rowData.openingKmPhoto;
        const hasClosing = !!rowData.closingKmPhoto;

        if (!hasOpening && !hasClosing) {
            return <span className="text-500">—</span>;
        }

        return (
            <div className="flex gap-1">
                {hasOpening && (
                    <Tag value="O" severity="info" icon="pi pi-camera" style={{ fontSize: "10px" }} />
                )}
                {hasClosing && (
                    <Tag value="C" severity="success" icon="pi pi-camera" style={{ fontSize: "10px" }} />
                )}
            </div>
        );
    };

    const fuelActionsTemplate = (rowData: FuelEntry) => (
        <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            onClick={() => {
                onDeleteFuelEntry(rowData.id);
                toast.success("🗑️ Fuel entry deleted");
            }}
            tooltip="Delete"
            tooltipOptions={{ position: "left" }}
        />
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Fuel Management</h2>
                    <p className="page-subtitle">Track fuel consumption for {selectedProject}</p>
                </div>
                <Button
                    label="Add Fuel Entry"
                    icon="pi pi-plus"
                    onClick={() => setShowDialog(true)}
                    className="add-button"
                />
            </div>

            <div className="fuel-filters">
                <div className="fuel-type-buttons">
                    <Button
                        label="Petrol"
                        icon="pi pi-bolt"
                        severity={activeFuelType === "Petrol" ? "success" : "secondary"}
                        onClick={() => {
                            setActiveFuelType("Petrol");
                            setSelectedVehicleFilter(null);
                        }}
                        className="fuel-type-btn"
                    />
                    <Button
                        label="Diesel"
                        icon="pi pi-cog"
                        severity={activeFuelType === "Diesel" ? "success" : "secondary"}
                        onClick={() => {
                            setActiveFuelType("Diesel");
                            setSelectedVehicleFilter(null);
                        }}
                        className="fuel-type-btn"
                    />
                    <Button
                        label="Electric"
                        icon="pi pi-flash"
                        severity={activeFuelType === "Electric" ? "success" : "secondary"}
                        onClick={() => {
                            setActiveFuelType("Electric");
                            setSelectedVehicleFilter(null);
                        }}
                        className="fuel-type-btn"
                    />
                </div>

                <div className="vehicle-filter">
                    <label>
                        <i className="pi pi-filter"></i>
                        Filter by Vehicle:
                    </label>
                    <Dropdown
                        value={selectedVehicleFilter}
                        options={[
                            { label: "All Vehicles", value: null },
                            ...fuelTypeVehicles.map((v) => ({
                                label: v.vehicleName,
                                value: v.id,
                            })),
                        ]}
                        onChange={(e) => setSelectedVehicleFilter(e.value)}
                        placeholder="Select a vehicle"
                        className="vehicle-filter-dropdown"
                    />
                </div>

                <div className="fuel-stats">
                    <Chip label={`${filteredFuelEntries.length} entries`} icon="pi pi-database" />
                    <Chip label={`${cumulativeDistance.toFixed(1)} km`} icon="pi pi-road" />
                </div>
            </div>

            {selectedVehicleFilter && (
                <Message
                    severity="success"
                    text={`Cumulative Distance for selected vehicle: ${cumulativeDistance.toFixed(2)} km`}
                    icon="pi pi-chart-bar"
                    className="mb-3"
                />
            )}

            <DataTable
                value={filteredFuelEntries}
                paginator
                rows={10}
                dataKey="id"
                emptyMessage={`No ${activeFuelType} fuel entries found`}
                className="custom-datatable"
                stripedRows
                responsiveLayout="scroll"
            >
                <Column field="date" header="Date" body={dateTemplate} sortable />
                <Column
                    field="vehicleName"
                    header="Vehicle"
                    sortable
                    body={(rowData: FuelEntry) => (
                        <span className="vehicle-name">
                            <i className="pi pi-car"></i>
                            {rowData.vehicleName}
                        </span>
                    )}
                />
                <Column
                    field="litres"
                    header="Litres"
                    body={(rowData: FuelEntry) => (
                        <Chip label={`${numberTemplate(rowData.litres, 2)} L`} icon="pi pi-circle-fill" />
                    )}
                    sortable
                />
                <Column
                    field="openingKm"
                    header="Opening Km"
                    body={(rowData: FuelEntry) => numberTemplate(rowData.openingKm, 1)}
                    sortable
                />
                <Column
                    field="closingKm"
                    header="Closing Km"
                    body={(rowData: FuelEntry) => numberTemplate(rowData.closingKm, 1)}
                    sortable
                />
                <Column
                    field="distance"
                    header="Distance"
                    body={(rowData: FuelEntry) => (
                        <Tag
                            value={`${numberTemplate(rowData.distance, 1)} km`}
                            severity="info"
                            icon="pi pi-map-marker"
                            style={{ fontSize: "11px" }}
                        />
                    )}
                    sortable
                />
                <Column
                    field="mileage"
                    header="Mileage"
                    body={(rowData: FuelEntry) => (
                        <Tag
                            value={`${numberTemplate(rowData.mileage, 2)} km/l`}
                            severity="success"
                            icon="pi pi-chart-line"
                            style={{ fontSize: "11px" }}
                        />
                    )}
                    sortable
                />
                <Column header="Photos" body={photosTemplate} />
                <Column body={fuelActionsTemplate} exportable={false} style={{ width: "3rem" }} />
            </DataTable>

            <Dialog
                header={
                    <>
                        <i className="pi pi-chart-line mr-2"></i>
                        Add Fuel Entry
                    </>
                }
                visible={showDialog}
                style={{ width: "600px" }}
                onHide={() => setShowDialog(false)}
                footer={
                    <>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            onClick={() => setShowDialog(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={handleAddFuelEntry}
                            className="save-button"
                            autoFocus
                        />
                    </>
                }
            >
                <div className="dialog-form">
                    <div className="form-field">
                        <label htmlFor="date">
                            <i className="pi pi-calendar"></i>
                            Date
                        </label>
                        <Calendar
                            id="date"
                            value={fuelForm.date}
                            onChange={(e) =>
                                setFuelForm((prev) => ({
                                    ...prev,
                                    date: (e.value as Date) || new Date(),
                                }))
                            }
                            dateFormat="dd/mm/yy"
                            className="w-full"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="vehicle">
                            <i className="pi pi-car"></i>
                            Vehicle *
                        </label>
                        <Dropdown
                            id="vehicle"
                            value={fuelForm.vehicleId}
                            options={fuelTypeVehicles.map((v) => ({
                                label: `${v.vehicleName} (${v.vehicleNumber})`,
                                value: v.id,
                            }))}
                            onChange={(e) =>
                                setFuelForm((prev) => ({
                                    ...prev,
                                    vehicleId: e.value,
                                }))
                            }
                            placeholder={`Select ${activeFuelType} vehicle`}
                            className="w-full"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="litres">
                                <i className="pi pi-circle-fill"></i>
                                Litres *
                            </label>
                            <InputNumber
                                id="litres"
                                value={fuelForm.litres}
                                onValueChange={(e) =>
                                    setFuelForm((prev) => ({
                                        ...prev,
                                        litres: e.value || 0,
                                    }))
                                }
                                minFractionDigits={2}
                                maxFractionDigits={2}
                                min={0}
                                className="w-full"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="openingKm">
                                <i className="pi pi-sign-in"></i>
                                Opening Km *
                            </label>
                            <InputNumber
                                id="openingKm"
                                value={fuelForm.openingKm}
                                onValueChange={(e) =>
                                    setFuelForm((prev) => ({
                                        ...prev,
                                        openingKm: e.value || 0,
                                    }))
                                }
                                minFractionDigits={1}
                                maxFractionDigits={1}
                                min={0}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="closingKm">
                            <i className="pi pi-sign-out"></i>
                            Closing Km *
                        </label>
                        <InputNumber
                            id="closingKm"
                            value={fuelForm.closingKm}
                            onValueChange={(e) =>
                                setFuelForm((prev) => ({
                                    ...prev,
                                    closingKm: e.value || 0,
                                }))
                            }
                            minFractionDigits={1}
                            maxFractionDigits={1}
                            min={0}
                            className="w-full"
                        />
                    </div>

                    <Divider />

                    <div className="form-field">
                        <label htmlFor="openingPhoto">
                            <i className="pi pi-camera"></i>
                            Opening Km Photo
                        </label>
                        <input
                            id="openingPhoto"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload("openingKmPhoto", e)}
                            className="w-full"
                        />
                        {fuelForm.openingKmPhoto && <small className="text-600">{fuelForm.openingKmPhoto}</small>}
                    </div>

                    <div className="form-field">
                        <label htmlFor="closingPhoto">
                            <i className="pi pi-camera"></i>
                            Closing Km Photo
                        </label>
                        <input
                            id="closingPhoto"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload("closingKmPhoto", e)}
                            className="w-full"
                        />
                        {fuelForm.closingKmPhoto && <small className="text-600">{fuelForm.closingKmPhoto}</small>}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default FuelManagement;
