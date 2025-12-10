import React, { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import toast from "react-hot-toast";
import type { Vehicle, ProjectId, VehicleType, FuelType } from "../types";
import { VEHICLE_TYPES, FUEL_TYPES } from "../data/constants";

interface VehicleManagementProps {
    selectedProject: ProjectId;
    vehicles: Vehicle[];
    onAddVehicle: (vehicle: Omit<Vehicle, "id">) => void;
    onDeleteVehicle: (id: string) => void;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({
    selectedProject,
    vehicles,
    onAddVehicle,
    onDeleteVehicle,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    const [vehicleForm, setVehicleForm] = useState<{
        vehicleName: string;
        vehicleNumber: string;
        vehicleType: VehicleType;
        fuelType: FuelType;
    }>({
        vehicleName: "",
        vehicleNumber: "",
        vehicleType: "Own Vehicle",
        fuelType: "Petrol",
    });

    const projectVehicles = useMemo(
        () => vehicles.filter((v) => v.projectId === selectedProject),
        [vehicles, selectedProject]
    );

    const handleAddVehicle = () => {
        if (!vehicleForm.vehicleName.trim() || !vehicleForm.vehicleNumber.trim()) {
            toast.error("Please fill all required fields");
            return;
        }

        onAddVehicle({
            projectId: selectedProject,
            ...vehicleForm,
        });

        setShowDialog(false);
        setVehicleForm({
            vehicleName: "",
            vehicleNumber: "",
            vehicleType: "Own Vehicle",
            fuelType: "Petrol",
        });
        toast.success("✅ Vehicle added successfully!");
    };

    const vehicleTypeTemplate = (rowData: Vehicle) => (
        <Tag
            value={rowData.vehicleType}
            severity="info"
            icon="pi pi-car"
            style={{ fontSize: "11px" }}
        />
    );

    const fuelTypeTemplate = (rowData: Vehicle) => {
        const severity =
            rowData.fuelType === "Petrol"
                ? "success"
                : rowData.fuelType === "Diesel"
                    ? "warning"
                    : "info";
        const icon = rowData.fuelType === "Electric" ? "pi pi-bolt" : "pi pi-circle-fill";
        return (
            <Tag
                value={rowData.fuelType}
                severity={severity}
                icon={icon}
                style={{ fontSize: "11px" }}
            />
        );
    };

    const vehicleActionsTemplate = (rowData: Vehicle) => (
        <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            onClick={() => {
                onDeleteVehicle(rowData.id);
                toast.success("🗑️ Vehicle deleted");
            }}
            tooltip="Delete"
            tooltipOptions={{ position: "left" }}
        />
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Vehicle Management</h2>
                    <p className="page-subtitle">Manage your fleet for {selectedProject}</p>
                </div>
                <Button
                    label="Add Vehicle"
                    icon="pi pi-plus"
                    onClick={() => setShowDialog(true)}
                    className="add-button"
                />
            </div>

            <DataTable
                value={projectVehicles}
                paginator
                rows={10}
                dataKey="id"
                emptyMessage="No vehicles found"
                className="custom-datatable"
                stripedRows
                responsiveLayout="scroll"
            >
                <Column
                    field="vehicleName"
                    header="Vehicle Name"
                    sortable
                    body={(rowData: Vehicle) => (
                        <span className="vehicle-name">
                            <i className="pi pi-car"></i>
                            {rowData.vehicleName}
                        </span>
                    )}
                />
                <Column
                    field="vehicleNumber"
                    header="Vehicle Number"
                    sortable
                    body={(rowData: Vehicle) => (
                        <Chip label={rowData.vehicleNumber} icon="pi pi-tag" />
                    )}
                />
                <Column field="vehicleType" header="Type" body={vehicleTypeTemplate} sortable />
                <Column field="fuelType" header="Fuel Type" body={fuelTypeTemplate} sortable />
                <Column body={vehicleActionsTemplate} exportable={false} style={{ width: "3rem" }} />
            </DataTable>

            <Dialog
                header={
                    <>
                        <i className="pi pi-car mr-2"></i>
                        Add New Vehicle
                    </>
                }
                visible={showDialog}
                style={{ width: "500px" }}
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
                            onClick={handleAddVehicle}
                            className="save-button"
                            autoFocus
                        />
                    </>
                }
            >
                <div className="dialog-form">
                    <div className="form-field">
                        <label htmlFor="vehicleName">
                            <i className="pi pi-car"></i>
                            Vehicle Name *
                        </label>
                        <InputText
                            id="vehicleName"
                            value={vehicleForm.vehicleName}
                            onChange={(e) =>
                                setVehicleForm((prev) => ({
                                    ...prev,
                                    vehicleName: e.target.value,
                                }))
                            }
                            placeholder="e.g., Tipper Lorry 1"
                            className="w-full"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="vehicleNumber">
                            <i className="pi pi-tag"></i>
                            Vehicle Number *
                        </label>
                        <InputText
                            id="vehicleNumber"
                            value={vehicleForm.vehicleNumber}
                            onChange={(e) =>
                                setVehicleForm((prev) => ({
                                    ...prev,
                                    vehicleNumber: e.target.value,
                                }))
                            }
                            placeholder="e.g., TN 01 AB 1234"
                            className="w-full"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="vehicleType">
                            <i className="pi pi-list"></i>
                            Vehicle Type
                        </label>
                        <Dropdown
                            id="vehicleType"
                            value={vehicleForm.vehicleType}
                            options={VEHICLE_TYPES.map((t) => ({
                                label: t,
                                value: t,
                            }))}
                            onChange={(e) =>
                                setVehicleForm((prev) => ({
                                    ...prev,
                                    vehicleType: e.value,
                                }))
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="fuelType">
                            <i className="pi pi-bolt"></i>
                            Fuel Type
                        </label>
                        <Dropdown
                            id="fuelType"
                            value={vehicleForm.fuelType}
                            options={FUEL_TYPES.map((t) => ({
                                label: t,
                                value: t,
                            }))}
                            onChange={(e) =>
                                setVehicleForm((prev) => ({
                                    ...prev,
                                    fuelType: e.value,
                                }))
                            }
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default VehicleManagement;
