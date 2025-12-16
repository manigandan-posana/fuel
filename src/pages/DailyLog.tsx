import React, { useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";
import { Tag } from "primereact/tag";
import { FloatLabel } from "primereact/floatlabel";
import toast from "react-hot-toast";
import type { Vehicle, ProjectId } from "../types";

export interface DailyLogEntry {
    id: string;
    date: Date;
    projectId: ProjectId;
    vehicleId: string;
    vehicleName: string;
    openingKm: number;
    closingKm?: number;
    distance?: number;
    status: "open" | "closed";
    openingKmPhoto?: string;
    closingKmPhoto?: string;
}

interface DailyLogProps {
    selectedProject: ProjectId;
    vehicles: Vehicle[];
    dailyLogs: DailyLogEntry[];
    onAddDailyLog: (log: Omit<DailyLogEntry, "id">) => void;
    onCloseDailyLog: (id: string, closingKm: number, closingKmPhoto?: string) => void;
}

const DailyLog: React.FC<DailyLogProps> = ({
    selectedProject,
    vehicles,
    dailyLogs,
    onAddDailyLog,
    onCloseDailyLog,
}) => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [selectedLog, setSelectedLog] = useState<DailyLogEntry | null>(null);

    // Create form state
    const [createDate, setCreateDate] = useState<Date>(new Date());
    const [createVehicleId, setCreateVehicleId] = useState<string>("");
    const [createOpeningKm, setCreateOpeningKm] = useState<number | null>(null);
    const [createOpeningPhoto, setCreateOpeningPhoto] = useState<string>("");

    // Close form state
    const [closeClosingKm, setCloseClosingKm] = useState<number | null>(null);
    const [closeClosingPhoto, setCloseClosingPhoto] = useState<string>("");

    // Filter logs for the current project and current date
    const projectLogs = useMemo(() => {
        const today = new Date().toDateString();
        return dailyLogs.filter(
            (log) =>
                log.projectId === selectedProject &&
                new Date(log.date).toDateString() === today
        );
    }, [dailyLogs, selectedProject]);

    // Get vehicles that don't have an active (open) log currently
    const availableVehicles = useMemo(() => {
        const activeProjectVehicles = vehicles.filter(
            (v) => v.projectId === selectedProject && v.status === "Active"
        );

        // Find vehicle IDs that already have an OPEN log (global check, not just today)
        const vehiclesWithOpenLog = new Set(
            dailyLogs
                .filter(log => log.status === "open" && log.projectId === selectedProject)
                .map(log => log.vehicleId)
        );

        return activeProjectVehicles.filter(v => !vehiclesWithOpenLog.has(v.id));
    }, [vehicles, dailyLogs, selectedProject]);

    const handleCreateLog = () => {
        if (!createVehicleId || createOpeningKm === null) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Check if vehicle already has an open log
        const existingOpenLog = dailyLogs.find(
            (log) => log.vehicleId === createVehicleId && log.status === "open"
        );

        if (existingOpenLog) {
            toast.error("This vehicle already has an open daily log. Please close it first.");
            return;
        }

        const vehicle = vehicles.find((v) => v.id === createVehicleId);
        if (!vehicle) {
            toast.error("Vehicle not found");
            return;
        }

        const newLog: Omit<DailyLogEntry, "id"> = {
            date: createDate,
            projectId: selectedProject,
            vehicleId: createVehicleId,
            vehicleName: vehicle.vehicleName,
            openingKm: createOpeningKm,
            status: "open",
            openingKmPhoto: createOpeningPhoto || undefined,
        };

        onAddDailyLog(newLog);
        toast.success("Daily log created successfully");
        resetCreateForm();
        setShowCreateDialog(false);
    };

    const handleCloseLog = () => {
        if (!selectedLog || closeClosingKm === null) {
            toast.error("Please enter closing km");
            return;
        }

        if (closeClosingKm < selectedLog.openingKm) {
            toast.error("Closing km cannot be less than opening km");
            return;
        }

        onCloseDailyLog(selectedLog.id, closeClosingKm, closeClosingPhoto || undefined);
        toast.success("Daily log closed successfully");
        resetCloseForm();
        setShowCloseDialog(false);
        setSelectedLog(null);
    };

    const resetCreateForm = () => {
        setCreateDate(new Date());
        setCreateVehicleId("");
        setCreateOpeningKm(null);
        setCreateOpeningPhoto("");
    };

    const resetCloseForm = () => {
        setCloseClosingKm(null);
        setCloseClosingPhoto("");
    };

    const handleImageUpload = (event: any, isOpening: boolean) => {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (isOpening) {
                    setCreateOpeningPhoto(base64String);
                } else {
                    setCloseClosingPhoto(base64String);
                }
                toast.success("Photo uploaded successfully");
            };
            reader.readAsDataURL(file);
        }
    };

    const statusBodyTemplate = (rowData: DailyLogEntry) => {
        return (
            <Tag
                value={rowData.status === "open" ? "Open" : "Closed"}
                severity={rowData.status === "open" ? "warning" : "success"}
            />
        );
    };

    const dateBodyTemplate = (rowData: DailyLogEntry) => {
        return new Date(rowData.date).toLocaleDateString();
    };

    const kmBodyTemplate = (value: number | undefined) => {
        return value !== undefined ? `${value.toFixed(1)} km` : "-";
    };

    const actionsBodyTemplate = (rowData: DailyLogEntry) => {
        if (rowData.status === "open") {
            return (
                <Button
                    label="Close Log"
                    
                    className="p-button-sm p-button-success"
                    onClick={() => {
                        setSelectedLog(rowData);
                        setShowCloseDialog(true);
                    }}
                />
            );
        }
        return null;
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: "1.5rem" }}>
                <Button
                    label="Create Daily Log"
                    className="p-button-success"
                    onClick={() => {
                        resetCreateForm();
                        setShowCreateDialog(true);
                    }}
                />
            </div>

            <DataTable
                value={projectLogs}
                dataKey="id"
                emptyMessage="No daily logs found"
                className="custom-datatable"
                stripedRows
                responsiveLayout="scroll"
                paginator
                rows={10}
                sortField="date"
                sortOrder={-1}
            >
                <Column
                    field="date"
                    header="Date"
                    body={dateBodyTemplate}
                    sortable
                    style={{ minWidth: "120px" }}
                />
                <Column
                    field="vehicleName"
                    header="Vehicle"
                    sortable
                    style={{ minWidth: "140px" }}
                />
                <Column
                    field="openingKm"
                    header="Opening Km"
                    body={(rowData) => kmBodyTemplate(rowData.openingKm)}
                    sortable
                    style={{ minWidth: "120px" }}
                />
                <Column
                    field="closingKm"
                    header="Closing Km"
                    body={(rowData) => kmBodyTemplate(rowData.closingKm)}
                    sortable
                    style={{ minWidth: "120px" }}
                />
                <Column
                    field="distance"
                    header="Distance"
                    body={(rowData) => kmBodyTemplate(rowData.distance)}
                    sortable
                    style={{ minWidth: "100px" }}
                />
                <Column
                    field="status"
                    header="Status"
                    body={statusBodyTemplate}
                    sortable
                    style={{ minWidth: "100px" }}
                />
                <Column
                    header="Actions"
                    body={actionsBodyTemplate}
                    style={{ minWidth: "140px" }}
                />
            </DataTable>

            {/* Create Daily Log Dialog */}
            <Dialog
                header="Create Daily Log with Opening Km"
                visible={showCreateDialog}
                style={{ width: "500px" }}
                onHide={() => {
                    setShowCreateDialog(false);
                    resetCreateForm();
                }}
                footer={
                    <div style={{ 
                        display: "flex", 
                        gap: "12px", 
                        justifyContent: "flex-end",
                        padding: "16px 24px",
                        marginTop: "8px"
                    }}>
                        <Button
                            label="Cancel"
                            onClick={() => {
                                setShowCreateDialog(false);
                                resetCreateForm();
                            }}
                            outlined
                            className="p-button-secondary"
                        />
                        <Button
                            label="Create"
                            icon="pi pi-check"
                            onClick={handleCreateLog}
                            severity="success"
                            raised
                        />
                    </div>
                }
            >
                <div className="p-fluid dl-dialog-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="field" style={{ marginBottom: "1rem" }}>
                        <label htmlFor="create-date">Date *</label>
                        <Calendar
                            id="create-date"
                            value={createDate}
                            disabled
                            dateFormat="dd/mm/yy"
                            className="w-full"
                        />
                    </div>

                    <FloatLabel>
                        <Dropdown
                            inputId="create-vehicle"
                            value={createVehicleId}
                            options={availableVehicles.map((v) => ({
                                label: `${v.vehicleName} (${v.vehicleNumber})`,
                                value: v.id,
                            }))}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => setCreateVehicleId(e.value)}
                            placeholder=" "
                            className="w-full"
                            emptyMessage="No available vehicles (all have open logs)"
                        />
                        <label htmlFor="create-vehicle">Vehicle *</label>
                    </FloatLabel>

                    <div className="field" style={{ marginBottom: "1rem" }}>
                        <label htmlFor="create-opening-km">Opening Km *</label>
                        <InputNumber
                            id="create-opening-km"
                            value={createOpeningKm}
                            onValueChange={(e) => setCreateOpeningKm(e.value ?? null)}
                            mode="decimal"
                            minFractionDigits={1}
                            maxFractionDigits={1}
                            placeholder="Enter opening km"
                        />
                    </div>


                </div>
            </Dialog>

            {/* Close Daily Log Dialog */}
            <Dialog
                header="Close Daily Log with Closing Km"
                visible={showCloseDialog}
                style={{ width: "500px" }}
                onHide={() => {
                    setShowCloseDialog(false);
                    setSelectedLog(null);
                    resetCloseForm();
                }}
                footer={
                    <div style={{ 
                        display: "flex", 
                        gap: "12px", 
                        justifyContent: "flex-end",
                        padding: "16px 24px",
                        marginTop: "8px"
                    }}>
                        <Button
                            label="Cancel"
                            onClick={() => {
                                setShowCloseDialog(false);
                                setSelectedLog(null);
                                resetCloseForm();
                            }}
                            outlined
                            className="p-button-secondary"
                        />
                        <Button
                            label="Close Log"
                            icon="pi pi-check"
                            onClick={handleCloseLog}
                            severity="success"
                            raised
                        />
                    </div>
                }
            >
                {selectedLog && (
                    <div className="p-fluid" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="field" style={{ marginBottom: "1rem" }}>
                            <label>Vehicle</label>
                            <p style={{ fontWeight: "600", margin: "0.5rem 0" }}>
                                {selectedLog.vehicleName}
                            </p>
                        </div>

                        <div className="field" style={{ marginBottom: "1rem" }}>
                            <label>Opening Km</label>
                            <p style={{ fontWeight: "600", margin: "0.5rem 0" }}>
                                {selectedLog.openingKm.toFixed(1)} km
                            </p>
                        </div>

                        <div className="field" style={{ marginBottom: "1rem" }}>
                            <label htmlFor="close-closing-km">Closing Km *</label>
                            <InputNumber
                                id="close-closing-km"
                                value={closeClosingKm}
                                onValueChange={(e) => setCloseClosingKm(e.value ?? null)}
                                mode="decimal"
                                minFractionDigits={1}
                                maxFractionDigits={1}
                                placeholder="Enter closing km"
                            />
                        </div>

                        <div className="field" style={{ marginBottom: "1rem" }}>
                            <label htmlFor="close-closing-photo">Closing Km Photo (Optional)</label>
                            <FileUpload
                                id="close-closing-photo"
                                mode="basic"
                                accept="image/*"
                                maxFileSize={5000000}
                                onSelect={(e) => handleImageUpload(e, false)}
                                auto
                                chooseLabel="Upload Photo"
                                chooseOptions={{ icon: "", iconOnly: false }}
                            />
                            {closeClosingPhoto && (
                                <div style={{ marginTop: "0.5rem" }}>
                                    <img
                                        src={closeClosingPhoto}
                                        alt="Closing km"
                                        style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default DailyLog;
