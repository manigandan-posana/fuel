import React, { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { Calendar } from "primereact/calendar";
import { TabView, TabPanel } from "primereact/tabview";
import { InputTextarea } from "primereact/inputtextarea";
import toast from "react-hot-toast";
import type { Vehicle, FuelEntry, ProjectId, VehicleType, FuelType } from "../types";
import { VEHICLE_TYPES, FUEL_TYPES } from "../data/constants";

interface VehicleManagementProps {
    selectedProject: ProjectId;
    vehicles: Vehicle[];
    fuelEntries?: FuelEntry[];
    onAddVehicle: (vehicle: Omit<Vehicle, "id">) => void;
    onDeleteVehicle: (id: string) => void;
    onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
    onViewVehicle: (vehicle: Vehicle) => void;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({
    selectedProject,
    vehicles,
    fuelEntries = [],
    onAddVehicle,
    onDeleteVehicle,
    onUpdateVehicle,
    onViewVehicle,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [statusChangeReason, setStatusChangeReason] = useState("");
    const [statusChangeDate, setStatusChangeDate] = useState<Date>(new Date());

    const [vehicleForm, setVehicleForm] = useState<{
        vehicleName: string;
        vehicleNumber: string;
        vehicleType: VehicleType;
        fuelType: FuelType;
        status: "Active" | "Inactive";
        startDate: Date | null;
    }>({
        vehicleName: "",
        vehicleNumber: "",
        vehicleType: "Own Vehicle",
        fuelType: "Petrol",
        status: "Active",
        startDate: new Date(),
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

        if (!vehicleForm.startDate) {
            toast.error("Please select a start date");
            return;
        }

        onAddVehicle({
            projectId: selectedProject,
            ...vehicleForm,
            startDate: vehicleForm.startDate,
            statusHistory: [{
                status: vehicleForm.status,
                startDate: vehicleForm.startDate,
                reason: "Initial vehicle registration"
            }]
        });

        setShowDialog(false);
        setVehicleForm({
            vehicleName: "",
            vehicleNumber: "",
            vehicleType: "Own Vehicle",
            fuelType: "Petrol",
            status: "Active",
            startDate: new Date(),
        });
        toast.success("✅ Vehicle added successfully!");
    };

    const handleEditVehicle = () => {
        if (!selectedVehicle) return;

        if (!vehicleForm.vehicleName.trim() || !vehicleForm.vehicleNumber.trim()) {
            toast.error("Please fill all required fields");
            return;
        }

        onUpdateVehicle(selectedVehicle.id, {
            vehicleName: vehicleForm.vehicleName,
            vehicleNumber: vehicleForm.vehicleNumber,
            vehicleType: vehicleForm.vehicleType,
            fuelType: vehicleForm.fuelType,
        });

        setShowEditDialog(false);
        setSelectedVehicle(null);
        toast.success("✅ Vehicle updated successfully!");
    };

    const handleOpenEditDialog = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setVehicleForm({
            vehicleName: vehicle.vehicleName,
            vehicleNumber: vehicle.vehicleNumber,
            vehicleType: vehicle.vehicleType,
            fuelType: vehicle.fuelType,
            status: vehicle.status,
            startDate: vehicle.startDate || new Date(),
        });
        setShowEditDialog(true);
    };

    const handleOpenStatusDialog = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setStatusChangeDate(new Date());
        setStatusChangeReason("");
        setShowStatusDialog(true);
    };

    const handleStatusChange = () => {
        if (!selectedVehicle) return;

        if (!statusChangeReason.trim()) {
            toast.error("Please provide a reason for status change");
            return;
        }

        const newStatus = selectedVehicle.status === "Active" ? "Inactive" : "Active";
        const currentHistory = selectedVehicle.statusHistory || [];

        // Close the current period
        const updatedHistory = currentHistory.map((h, index) => {
            if (index === currentHistory.length - 1 && !h.endDate) {
                return { ...h, endDate: statusChangeDate };
            }
            return h;
        });

        // Add new status period
        updatedHistory.push({
            status: newStatus,
            startDate: statusChangeDate,
            reason: statusChangeReason
        });

        onUpdateVehicle(selectedVehicle.id, {
            status: newStatus,
            startDate: newStatus === "Active" ? statusChangeDate : selectedVehicle.startDate,
            endDate: newStatus === "Inactive" ? statusChangeDate : undefined,
            statusHistory: updatedHistory
        });

        setShowStatusDialog(false);
        setSelectedVehicle(null);
        setStatusChangeReason("");
        toast.success(`Vehicle ${newStatus === "Active" ? "activated" : "deactivated"} successfully!`);
    };

    const handleRowClick = (vehicle: Vehicle) => {
        onViewVehicle(vehicle);
    };

    const vehicleActionsTemplate = (rowData: Vehicle) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button
                icon="pi pi-pencil"
                rounded
                text
                size="small"
                severity="info"
                onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditDialog(rowData);
                }}
                tooltip="Edit"
                tooltipOptions={{ position: "left" }}
            />
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
        </div>
    );

    const dateTemplate = (rowData: FuelEntry) => rowData.date.toLocaleDateString();
    const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);

    return (
        <div className="page-container">
            <div className="page-header">
                <div></div>
                <Button
                    label="Add Vehicle"
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
                            <Button
                                label={isActive ? 'Active' : 'Inactive'}
                                icon={isActive ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                                severity={isActive ? 'success' : 'danger'}
                                size="small"
                                outlined
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStatusDialog(rowData);
                                }}
                                style={{ fontSize: 'var(--font-xs)', padding: 'var(--spacing-1) var(--spacing-2)' }}
                            />
                        );
                    }}
                    sortable
                    style={{ minWidth: '120px' }}
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
                    header="Total Fuel Cost"
                    body={(rowData: Vehicle) => {
                        const vehicleEntries = fuelEntries.filter(e => e.vehicleId === rowData.id);
                        const totalCost = vehicleEntries.reduce((sum, e) => sum + (e.totalCost || 0), 0);
                        return <span className="font-medium text-green-600">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>;
                    }}
                    sortable
                    style={{ minWidth: '130px' }}
                />
                <Column
                    header="Avg Mileage"
                    body={(rowData: Vehicle) => {
                        const vehicleEntries = fuelEntries.filter(e => e.vehicleId === rowData.id && e.status === 'closed');
                        const totalKm = vehicleEntries.reduce((sum, e) => sum + (e.distance || 0), 0);
                        const totalLitres = fuelEntries.filter(e => e.vehicleId === rowData.id).reduce((sum, e) => sum + (e.litres || 0), 0);
                        const avgMileage = totalLitres > 0 ? totalKm / totalLitres : 0;
                        return <span className="font-medium text-700">{avgMileage.toFixed(2)} km/l</span>;
                    }}
                    sortable
                    style={{ minWidth: '120px' }}
                />
                <Column
                    body={vehicleActionsTemplate}
                    exportable={false}
                    style={{ width: "100px", textAlign: "center" }}
                />
            </DataTable>

            {/* Add Vehicle Dialog */}
            <Dialog
                header="Add New Vehicle"
                visible={showDialog}
                style={{ width: "500px" }}
                onHide={() => setShowDialog(false)}
                footer={
                    <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "flex-end" }}>
                        <Button label="Cancel" onClick={() => setShowDialog(false)} outlined severity="success" size="small" />
                        <Button label="Save" onClick={handleAddVehicle} severity="success" raised size="small" />
                    </div>
                }
            >
                <div className="dialog-form vm-dialog-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
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
                            inputId="vehicleType"
                            value={vehicleForm.vehicleType}
                            options={VEHICLE_TYPES.map((t) => ({ label: t, value: t }))}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, vehicleType: e.value }))}
                            placeholder=" "
                            className="w-full"
                        />
                        <label htmlFor="vehicleType">Vehicle Type</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            inputId="fuelType"
                            value={vehicleForm.fuelType}
                            options={FUEL_TYPES.map((t) => ({ label: t, value: t }))}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, fuelType: e.value }))}
                            placeholder=" "
                            className="w-full"
                        />
                        <label htmlFor="fuelType">Fuel Type</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Calendar
                            id="startDate"
                            value={vehicleForm.startDate}
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, startDate: e.value as Date }))}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                        <label htmlFor="startDate">Start Date *</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            inputId="status"
                            value={vehicleForm.status}
                            options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, status: e.value }))}
                            placeholder=" "
                            className="w-full"
                        />
                        <label htmlFor="status">Status</label>
                    </FloatLabel>
                </div>
            </Dialog>

            {/* Edit Vehicle Dialog */}
            <Dialog
                header="Edit Vehicle"
                visible={showEditDialog}
                style={{ width: "500px" }}
                onHide={() => {
                    setShowEditDialog(false);
                    setSelectedVehicle(null);
                }}
                footer={
                    <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "flex-end" }}>
                        <Button label="Cancel" onClick={() => setShowEditDialog(false)} outlined severity="success" size="small" />
                        <Button label="Update" onClick={handleEditVehicle} severity="success" raised size="small" />
                    </div>
                }
            >
                <div className="dialog-form vm-dialog-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
                    <FloatLabel>
                        <InputText
                            id="editVehicleName"
                            value={vehicleForm.vehicleName}
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, vehicleName: e.target.value }))}
                            className="w-full"
                        />
                        <label htmlFor="editVehicleName">Vehicle Name *</label>
                    </FloatLabel>

                    <FloatLabel>
                        <InputText
                            id="editVehicleNumber"
                            value={vehicleForm.vehicleNumber}
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))}
                            className="w-full"
                        />
                        <label htmlFor="editVehicleNumber">Vehicle Number *</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            inputId="editVehicleType"
                            value={vehicleForm.vehicleType}
                            options={VEHICLE_TYPES.map((t) => ({ label: t, value: t }))}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, vehicleType: e.value }))}
                            placeholder=" "
                            className="w-full"
                        />
                        <label htmlFor="editVehicleType">Vehicle Type</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            inputId="editFuelType"
                            value={vehicleForm.fuelType}
                            options={FUEL_TYPES.map((t) => ({ label: t, value: t }))}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => setVehicleForm((prev) => ({ ...prev, fuelType: e.value }))}
                            placeholder=" "
                            className="w-full"
                        />
                        <label htmlFor="editFuelType">Fuel Type</label>
                    </FloatLabel>
                </div>
            </Dialog>

            {/* Status Change Dialog */}
            <Dialog
                header={selectedVehicle?.status === "Active" ? "Deactivate Vehicle" : "Activate Vehicle"}
                visible={showStatusDialog}
                style={{ width: "450px" }}
                onHide={() => {
                    setShowStatusDialog(false);
                    setSelectedVehicle(null);
                }}
                footer={
                    <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "flex-end" }}>
                        <Button label="Cancel" onClick={() => setShowStatusDialog(false)} outlined severity="success" size="small" />
                        <Button
                            label={selectedVehicle?.status === "Active" ? "Deactivate" : "Activate"}
                            icon="pi pi-check"
                            onClick={handleStatusChange}
                            severity={selectedVehicle?.status === "Active" ? "danger" : "success"}
                            raised
                            size="small"
                        />
                    </div>
                }
            >
                {selectedVehicle && (
                    <div className="dialog-form vm-dialog-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: 'var(--spacing-4)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                                {selectedVehicle.vehicleName}
                            </div>
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                                {selectedVehicle.vehicleNumber}
                            </div>
                        </div>

                        <FloatLabel>
                            <Calendar
                                id="statusChangeDate"
                                value={statusChangeDate}
                                onChange={(e) => setStatusChangeDate(e.value as Date)}
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="w-full"
                            />
                            <label htmlFor="statusChangeDate">
                                {selectedVehicle.status === "Active" ? "End Date *" : "Start Date *"}
                            </label>
                        </FloatLabel>

                        <FloatLabel>
                            <InputTextarea
                                id="statusChangeReason"
                                value={statusChangeReason}
                                onChange={(e) => setStatusChangeReason(e.target.value)}
                                rows={3}
                                className="w-full"
                            />
                            <label htmlFor="statusChangeReason">Reason *</label>
                        </FloatLabel>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default VehicleManagement;
