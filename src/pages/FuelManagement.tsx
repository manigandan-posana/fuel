import React, { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import toast from "react-hot-toast";
import type { Vehicle, FuelEntry, Supplier, ProjectId, FuelType } from "../types";

interface FuelManagementProps {
    selectedProject: ProjectId;
    vehicles: Vehicle[];
    fuelEntries: FuelEntry[];
    suppliers: Supplier[];
    onAddFuelEntry: (entry: Omit<FuelEntry, "id">) => void;
    onDeleteFuelEntry: (id: string) => void;
}

interface NewEntryRow {
    date: Date | null;
    vehicleId: string;
    supplierId: string;
    litres: string;
    openingKm: string;
    pricePerLitre: string;
}

const FuelManagement: React.FC<FuelManagementProps> = ({
    selectedProject,
    vehicles,
    fuelEntries,
    suppliers,
    onAddFuelEntry,
    onDeleteFuelEntry,
}) => {
    const [activeFuelType, setActiveFuelType] = useState<FuelType>("Petrol");
    const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string | null>(null);
    const [newEntry, setNewEntry] = useState<NewEntryRow>({
        date: new Date(),
        vehicleId: "",
        supplierId: "",
        litres: "",
        openingKm: "",
        pricePerLitre: "",
    });
    const [showClosingDialog, setShowClosingDialog] = useState(false);
    const [closingEntry, setClosingEntry] = useState<FuelEntry | null>(null);
    const [closingKm, setClosingKm] = useState<string>("");
    const [closingKmPhoto, setClosingKmPhoto] = useState("");

    const projectVehicles = useMemo(
        () => vehicles.filter((v) => v.projectId === selectedProject),
        [vehicles, selectedProject]
    );

    const activeVehicles = useMemo(
        () => projectVehicles.filter(v => v.status === "Active" || !v.status),
        [projectVehicles]
    );

    const fuelTypeVehicles = useMemo(
        () => activeVehicles.filter((v) => v.fuelType === activeFuelType),
        [activeVehicles, activeFuelType]
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
        () => filteredFuelEntries.filter(e => e.status === "closed").reduce((sum, e) => sum + e.distance, 0),
        [filteredFuelEntries]
    );

    const handleAddNewEntry = () => {
        if (!newEntry.vehicleId) {
            toast.error("Please select a vehicle");
            return;
        }
        if (!newEntry.supplierId) {
            toast.error("Please select a supplier");
            return;
        }
        if (!newEntry.date) {
            toast.error("Please select a date");
            return;
        }

        const litres = parseFloat(newEntry.litres);
        const openingKm = parseFloat(newEntry.openingKm);
        const pricePerLitre = parseFloat(newEntry.pricePerLitre || "0");

        if (!newEntry.litres || isNaN(litres) || litres <= 0) {
            toast.error("Please enter valid litres");
            return;
        }
        if (!newEntry.openingKm || isNaN(openingKm) || openingKm < 0) {
            toast.error("Please enter valid opening km");
            return;
        }

        const vehicle = vehicles.find((v) => v.id === newEntry.vehicleId);
        if (!vehicle) {
            toast.error("Vehicle not found");
            return;
        }

        const supplier = suppliers.find((s) => s.id === newEntry.supplierId);
        if (!supplier) {
            toast.error("Supplier not found");
            return;
        }

        const totalCost = pricePerLitre > 0 ? pricePerLitre * litres : 0;

        onAddFuelEntry({
            date: newEntry.date,
            projectId: selectedProject,
            vehicleId: vehicle.id,
            vehicleName: vehicle.vehicleName,
            fuelType: vehicle.fuelType,
            supplierId: supplier.id,
            supplierName: supplier.supplierName,
            litres: litres,
            openingKm: openingKm,
            closingKm: 0,
            distance: 0,
            mileage: 0,
            status: "open",
            pricePerLitre: pricePerLitre,
            totalCost: totalCost,
        });

        setNewEntry({
            date: new Date(),
            vehicleId: "",
            supplierId: "",
            litres: "",
            openingKm: "",
            pricePerLitre: "",
        });
        toast.success("⛽ Fuel entry added! Click 'Closing' to complete.");
    };

    const handleOpenClosingDialog = (entry: FuelEntry) => {
        setClosingEntry(entry);
        setClosingKm(""); // Leave blank for user to fill
        setClosingKmPhoto("");
        setShowClosingDialog(true);
    };

    const handleSaveClosing = () => {
        if (!closingEntry) return;

        const closingKmValue = parseFloat(closingKm);

        if (!closingKm || isNaN(closingKmValue)) {
            toast.error("Please enter closing km");
            return;
        }

        if (closingKmValue < closingEntry.openingKm) {
            toast.error("Closing km must be ≥ opening km");
            return;
        }

        const distance = closingKmValue - closingEntry.openingKm;
        const mileage = distance / closingEntry.litres;

        // Delete the old entry and add updated one
        onDeleteFuelEntry(closingEntry.id);
        onAddFuelEntry({
            date: closingEntry.date,
            projectId: closingEntry.projectId,
            vehicleId: closingEntry.vehicleId,
            vehicleName: closingEntry.vehicleName,
            fuelType: closingEntry.fuelType,
            supplierId: closingEntry.supplierId,
            supplierName: closingEntry.supplierName,
            litres: closingEntry.litres,
            openingKm: closingEntry.openingKm,
            closingKm: closingKmValue,
            distance,
            mileage,
            status: "closed",
            openingKmPhoto: closingEntry.openingKmPhoto,
            closingKmPhoto: closingKmPhoto || undefined,
            pricePerLitre: closingEntry.pricePerLitre,
            totalCost: closingEntry.totalCost,
        });

        setShowClosingDialog(false);
        setClosingEntry(null);
        toast.success("✅ Entry closed successfully!");
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setClosingKmPhoto(file.name);
        }
    };

    const dateTemplate = (rowData: FuelEntry) => (
        <span style={{ fontWeight: 500 }}>{rowData.date.toLocaleDateString()}</span>
    );

    const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);

    const statusTemplate = (rowData: FuelEntry) => {
        if (rowData.status === "open") {
            return (
                <Button
                    icon="pi pi-check"
                    rounded
                    text
                    severity="success"
                    onClick={() => handleOpenClosingDialog(rowData)}
                    tooltip="Mark as Closed"
                    tooltipOptions={{ position: "left" }}
                    className="w-2rem h-2rem p-0"
                />
            );
        }
        return (
            <i className="pi pi-check-circle text-green-500" style={{ fontSize: '1.2rem' }}></i>
        );
    };



    return (
        <div className="page-container">
            <Card className="fuel-filters" style={{
                background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)',
                border: '1px solid var(--primary-200)'
            }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
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

                    <div className="fuel-stats flex gap-4 text-sm font-medium" style={{
                        marginLeft: 'auto',
                        padding: '8px 16px',
                        background: 'var(--bg-gradient-green)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'white',
                        boxShadow: 'var(--shadow-green)'
                    }}>
                        <span><i className="pi pi-database"></i> {filteredFuelEntries.length} entries</span>
                        <span><i className="pi pi-map-marker"></i> {cumulativeDistance.toFixed(1)} km</span>
                    </div>
                </div>
            </Card>

            {selectedVehicleFilter && (
                <Message
                    severity="success"
                    text={`Cumulative Distance for selected vehicle: ${cumulativeDistance.toFixed(2)} km`}
                    icon="pi pi-chart-bar"
                />
            )}

            {/* Add Entry Form - Fixed Box */}
            <div className="fuel-add-form-container" style={{
                background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)',
                border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-4)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: 'var(--spacing-4)'
            }}>
                <h3 style={{
                    margin: '0 0 var(--spacing-3) 0',
                    fontSize: 'var(--font-base)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-2)'
                }}>
                    <i className="pi pi-plus-circle" style={{ color: 'var(--primary-500)', fontSize: 'var(--font-lg)' }}></i>
                    Add New Entry
                </h3>
                <div className="table-entry-form" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-2)',
                    alignItems: 'flex-end'
                }}>
                    <FloatLabel style={{ minWidth: '140px' }}>
                        <Calendar
                            id="entryDate"
                            value={newEntry.date}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, date: (e.value as Date) || new Date() }))}
                            dateFormat="dd/mm/yy"
                            showIcon
                            iconPos="left"
                            className="p-inputtext-sm"
                            style={{ width: '140px' }}
                        />
                        <label htmlFor="entryDate">Date</label>
                    </FloatLabel>

                    <FloatLabel style={{ minWidth: '180px', flex: '1' }}>
                        <Dropdown
                            id="entryVehicle"
                            value={newEntry.vehicleId}
                            options={fuelTypeVehicles.map(v => ({ label: `${v.vehicleName} (${v.vehicleNumber})`, value: v.id }))}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, vehicleId: e.value }))}
                            className="compact-dd"
                        />
                        <label htmlFor="entryVehicle">Vehicle</label>
                    </FloatLabel>

                    <FloatLabel style={{ minWidth: '150px', flex: '1' }}>
                        <Dropdown
                            id="entrySupplier"
                            value={newEntry.supplierId}
                            options={suppliers.filter(s => s.projectId === selectedProject).map(s => ({ label: s.supplierName, value: s.id }))}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, supplierId: e.value }))}
                            className="compact-dd"
                        />
                        <label htmlFor="entrySupplier">Supplier</label>
                    </FloatLabel>

                    <FloatLabel style={{ minWidth: '100px' }}>
                        <InputText
                            id="entryLitres"
                            value={newEntry.litres}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setNewEntry(prev => ({ ...prev, litres: value }));
                                }
                            }}
                            className="p-inputtext-sm"
                            keyfilter="num"
                            style={{ width: '100px' }}
                        />
                        <label htmlFor="entryLitres">Litres</label>
                    </FloatLabel>

                    <FloatLabel style={{ minWidth: '110px' }}>
                        <InputText
                            id="entryPrice"
                            value={newEntry.pricePerLitre}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setNewEntry(prev => ({ ...prev, pricePerLitre: value }));
                                }
                            }}
                            className="p-inputtext-sm"
                            keyfilter="num"
                            style={{ width: '110px' }}
                        />
                        <label htmlFor="entryPrice">Price / L</label>
                    </FloatLabel>

                    <FloatLabel style={{ minWidth: '120px' }}>
                        <InputText
                            id="entryOpeningKm"
                            value={newEntry.openingKm}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setNewEntry(prev => ({ ...prev, openingKm: value }));
                                }
                            }}
                            className="p-inputtext-sm"
                            keyfilter="num"
                            style={{ width: '120px' }}
                        />
                        <label htmlFor="entryOpeningKm">Opening Km</label>
                    </FloatLabel>

                    <Button
                        label="Add"
                        icon="pi pi-plus"
                        onClick={handleAddNewEntry}
                        severity="success"
                        size="small"
                        style={{ height: '36px' }}
                    />
                </div>
            </div>

            <DataTable
                value={filteredFuelEntries}
                paginator
                rows={20}
                dataKey="id"
                emptyMessage={`No ${activeFuelType} fuel entries found`}
                className="custom-datatable p-datatable-sm text-sm"
                stripedRows
                responsiveLayout="scroll"
                size="small"
            >
                <Column field="date" header="Date" body={dateTemplate} sortable style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} />
                <Column
                    field="vehicleName"
                    header="Vehicle"
                    sortable
                    body={(rowData: FuelEntry) => (
                        <span className="font-medium">{rowData.vehicleName}</span>
                    )}
                    style={{ padding: '0.5rem' }}
                />
                <Column
                    field="supplierName"
                    header="Supplier"
                    sortable
                    body={(rowData: FuelEntry) => <span className="text-700">{rowData.supplierName}</span>}
                    style={{ padding: '0.35rem 0.25rem' }}
                />

                <Column
                    field="pricePerLitre"
                    header="Price/L"
                    body={(rowData: FuelEntry) => <span style={{ fontSize: '0.75rem' }}>{rowData.pricePerLitre ? '₹' + numberTemplate(rowData.pricePerLitre, 2) : '-'}</span>}
                    sortable
                    style={{ padding: '0.25rem 0.5rem' }}
                />
                <Column
                    field="litres"
                    header="Litres"
                    body={(rowData: FuelEntry) => <span style={{ fontSize: '0.75rem' }}>{numberTemplate(rowData.litres, 2) + ' L'}</span>}
                    sortable
                    style={{ padding: '0.25rem 0.5rem' }}
                />
                <Column
                    field="openingKm"
                    header="Op. Km"
                    body={(rowData: FuelEntry) => <span style={{ fontSize: '0.75rem' }}>{numberTemplate(rowData.openingKm, 1)}</span>}
                    sortable
                    style={{ padding: '0.25rem 0.5rem' }}
                />
                <Column
                    field="closingKm"
                    header="Cl. Km"
                    body={(rowData: FuelEntry) => <span style={{ fontSize: '0.75rem' }}>{rowData.status === "closed" ? numberTemplate(rowData.closingKm, 1) : "—"}</span>}
                    sortable
                    style={{ padding: '0.25rem 0.5rem' }}
                />
                <Column
                    field="distance"
                    header="Dist."
                    body={(rowData: FuelEntry) => <span style={{ fontSize: '0.75rem' }}>{rowData.status === "closed" ? numberTemplate(rowData.distance, 1) + ' km' : "—"}</span>}
                    sortable
                    style={{ padding: '0.25rem 0.5rem' }}
                />
                <Column
                    field="mileage"
                    header="Mileage"
                    body={(rowData: FuelEntry) => <span style={{ fontSize: '0.75rem' }}>{rowData.status === "closed" ? numberTemplate(rowData.mileage, 2) : "—"}</span>}
                    sortable
                    style={{ padding: '0.25rem 0.5rem' }}
                />
                <Column header="Status" body={statusTemplate} style={{ width: "50px", textAlign: "center", padding: '0.35rem 0.25rem' }} />

            </DataTable>

            <Dialog
                header={
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <i className="pi pi-check-circle" style={{ color: "var(--primary-green)" }}></i>
                        <span>Close Fuel Entry</span>
                    </div>
                }
                visible={showClosingDialog}
                style={{ width: "500px" }}
                onHide={() => setShowClosingDialog(false)}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            onClick={() => setShowClosingDialog(false)}
                            severity="danger"
                            raised
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={handleSaveClosing}
                            severity="success"
                            raised
                            autoFocus
                        />
                    </div>
                }
            >
                {closingEntry && (
                    <div className="dialog-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: 'var(--spacing-4)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>
                                <i className="pi pi-car" style={{ color: 'var(--primary-500)', fontSize: 'var(--font-lg)' }}></i>
                                <span style={{ fontWeight: 600, fontSize: 'var(--font-base)' }}>{closingEntry.vehicleName}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)', fontSize: 'var(--font-sm)' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Opening Km:</span>
                                    <span style={{ fontWeight: 600, marginLeft: 'var(--spacing-2)' }}>{closingEntry.openingKm.toFixed(1)} km</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Litres:</span>
                                    <span style={{ fontWeight: 600, marginLeft: 'var(--spacing-2)' }}>{closingEntry.litres.toFixed(2)} L</span>
                                </div>
                            </div>
                        </div>

                        <FloatLabel>
                            <InputText
                                id="closingKm"
                                value={closingKm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        setClosingKm(value);
                                    }
                                }}
                                className="w-full"
                                keyfilter="num"
                            />
                            <label htmlFor="closingKm">Closing Km *</label>
                        </FloatLabel>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-2)',
                                fontSize: 'var(--font-sm)',
                                color: 'var(--text-secondary)',
                                fontWeight: 500
                            }}>
                                Closing Km Photo (Optional)
                            </label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                                <Button
                                    label={closingKmPhoto ? "Change Photo" : "Upload Photo"}
                                    icon="pi pi-upload"
                                    severity="secondary"
                                    outlined
                                    size="small"
                                    onClick={() => document.getElementById('closingPhotoInput')?.click()}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    id="closingPhotoInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                {closingKmPhoto && <i className="pi pi-check" style={{ fontSize: 'var(--font-xl)', color: 'var(--primary-500)' }}></i>}
                            </div>
                        </div>

                        {closingKm && parseFloat(closingKm) > closingEntry.openingKm && (
                            <div style={{
                                background: 'var(--primary-50)',
                                padding: 'var(--spacing-4)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--primary-200)'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)', fontSize: 'var(--font-sm)' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>Distance:</span>
                                        <span style={{ fontWeight: 600, marginLeft: 'var(--spacing-2)', color: 'var(--primary-600)' }}>
                                            {(parseFloat(closingKm) - closingEntry.openingKm).toFixed(1)} km
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>Mileage:</span>
                                        <span style={{ fontWeight: 600, marginLeft: 'var(--spacing-2)', color: 'var(--primary-600)' }}>
                                            {((parseFloat(closingKm) - closingEntry.openingKm) / closingEntry.litres).toFixed(2)} km/l
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default FuelManagement;
