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
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [supplierFilter, setSupplierFilter] = useState<string | null>(null);

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
        () => projectVehicles.filter((v) => v.status === "Active" || !v.status),
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

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (e) =>
                    e.vehicleName.toLowerCase().includes(query) ||
                    e.supplierName.toLowerCase().includes(query)
            );
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter((e) => e.date >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((e) => e.date <= toDate);
        }

        if (statusFilter) {
            filtered = filtered.filter((e) => e.status === statusFilter);
        }

        if (supplierFilter) {
            filtered = filtered.filter((e) => e.supplierId === supplierFilter);
        }

        return filtered.slice().sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [
        fuelEntries,
        selectedProject,
        activeFuelType,
        selectedVehicleFilter,
        searchQuery,
        dateFrom,
        dateTo,
        statusFilter,
        supplierFilter,
    ]);

    const cumulativeDistance = useMemo(
        () => filteredFuelEntries.filter((e) => e.status === "closed").reduce((sum, e) => sum + e.distance, 0),
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
        setClosingKm("");
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
        if (file) setClosingKmPhoto(file.name);
    };

    const dateTemplate = (rowData: FuelEntry) => (
        <span className="fm-td-strong">{rowData.date.toLocaleDateString()}</span>
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
                    className="fm-icon-btn"
                />
            );
        }
        return <i className="pi pi-check-circle text-green-500" style={{ fontSize: "1.1rem" }} />;
    };

    const anyFilterActive =
        !!searchQuery ||
        !!selectedVehicleFilter ||
        !!supplierFilter ||
        !!statusFilter ||
        !!dateFrom ||
        !!dateTo;

    const projectSuppliers = suppliers.filter((s) => s.projectId === selectedProject);

    return (
        <div className="fm-page">
            {/* Top Bar (Title + Fuel Type segmented switch + summary) */}
            <div className="fm-topbar">
                <div className="fm-topbar-left">
                    <div className="fm-title">
                        <div className="fm-title-main">Fuel Management</div>
                        <div className="fm-title-sub">
                            Project: <span className="fm-mono">{String(selectedProject)}</span>
                        </div>
                    </div>

                    <div className="fm-seg">
                        <button
                            className={`fm-seg-btn ${activeFuelType === "Petrol" ? "active" : ""}`}
                            onClick={() => {
                                setActiveFuelType("Petrol");
                                setSelectedVehicleFilter(null);
                            }}
                            type="button"
                        >
                            <i className="pi pi-bolt" />
                            Petrol
                        </button>
                        <button
                            className={`fm-seg-btn ${activeFuelType === "Diesel" ? "active" : ""}`}
                            onClick={() => {
                                setActiveFuelType("Diesel");
                                setSelectedVehicleFilter(null);
                            }}
                            type="button"
                        >
                            <i className="pi pi-cog" />
                            Diesel
                        </button>
                        <button
                            className={`fm-seg-btn ${activeFuelType === "Electric" ? "active" : ""}`}
                            onClick={() => {
                                setActiveFuelType("Electric");
                                setSelectedVehicleFilter(null);
                            }}
                            type="button"
                        >
                            <i className="pi pi-flash" />
                            Electric
                        </button>
                    </div>
                </div>

                <div className="fm-summary">
                    <div className="fm-chip">
                        <div className="k">Showing</div>
                        <div className="v">{filteredFuelEntries.length}</div>
                    </div>
                    <div className="fm-chip">
                        <div className="k">Fuel Type</div>
                        <div className="v">{activeFuelType}</div>
                    </div>
                    {selectedVehicleFilter && (
                        <div className="fm-chip good">
                            <div className="k">Cumulative (Closed)</div>
                            <div className="v">{cumulativeDistance.toFixed(2)} km</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters (single line / compact) */}
            <Card className="fm-card fm-filters-card">
                <div className="fm-filters-row">
                    <span className="p-input-icon-left fm-ctl fm-ctl-search">
                        <i className="pi pi-search" />
                        <InputText
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search vehicle / supplier"
                            className="p-inputtext-sm fm-input"
                        />
                    </span>

                    <Dropdown
                        value={selectedVehicleFilter}
                        options={[
                            { label: "All Vehicles", value: null },
                            ...fuelTypeVehicles.map((v) => ({ label: v.vehicleName, value: v.id })),
                        ]}
                        onChange={(e) => setSelectedVehicleFilter(e.value)}
                        placeholder="Vehicle"
                        showClear
                        className="p-inputtext-sm fm-dd fm-ctl"
                    />

                    <Dropdown
                        value={supplierFilter}
                        options={[
                            { label: "All Suppliers", value: null },
                            ...projectSuppliers.map((s) => ({ label: s.supplierName, value: s.id })),
                        ]}
                        onChange={(e) => setSupplierFilter(e.value)}
                        placeholder="Supplier"
                        showClear
                        className="p-inputtext-sm fm-dd fm-ctl"
                    />

                    <Dropdown
                        value={statusFilter}
                        options={[
                            { label: "All Status", value: null },
                            { label: "Open", value: "open" },
                            { label: "Closed", value: "closed" },
                        ]}
                        onChange={(e) => setStatusFilter(e.value)}
                        placeholder="Status"
                        showClear
                        className="p-inputtext-sm fm-dd fm-ctl"
                    />

                    <Calendar
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.value as Date)}
                        placeholder="From"
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                        className="p-inputtext-sm fm-cal fm-ctl"
                    />

                    <Calendar
                        value={dateTo}
                        onChange={(e) => setDateTo(e.value as Date)}
                        placeholder="To"
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                        className="p-inputtext-sm fm-cal fm-ctl"
                    />

                    <Button
                        label="Clear"
                        icon="pi pi-filter-slash"
                        size="small"
                        outlined
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedVehicleFilter(null);
                            setSupplierFilter(null);
                            setStatusFilter(null);
                            setDateFrom(null);
                            setDateTo(null);
                        }}
                        disabled={!anyFilterActive}
                        className="fm-ctl fm-clear"
                    />
                </div>
            </Card>

            {/* Optional message (kept, but compact) */}
            {selectedVehicleFilter && (
                <div className="fm-msg">
                    <Message
                        severity="success"
                        text={`Cumulative Distance for selected vehicle: ${cumulativeDistance.toFixed(2)} km`}
                        icon="pi pi-chart-bar"
                    />
                </div>
            )}

            {/* Quick Add Entry (compact) */}
            <Card className="fm-card fm-add-card">
                <div className="fm-add-head">
                    <div className="fm-add-title">
                        <i className="pi pi-plus-circle" />
                        <span>Add New Entry</span>
                    </div>
                    <div className="fm-add-hint">Quick add (then close later)</div>
                </div>

                <div className="fm-add-row">
                    <FloatLabel className="fm-fl">
                        <Calendar
                            id="entryDate"
                            value={newEntry.date}
                            onChange={(e) => setNewEntry((prev) => ({ ...prev, date: (e.value as Date) || new Date() }))}
                            dateFormat="dd/mm/yy"
                            showIcon
                            iconPos="left"
                            className="p-inputtext-sm fm-cal"
                        />
                        <label htmlFor="entryDate">Date</label>
                    </FloatLabel>

                    <FloatLabel className="fm-fl fm-grow">
                        <Dropdown
                            id="entryVehicle"
                            value={newEntry.vehicleId}
                            options={fuelTypeVehicles.map((v) => ({
                                label: `${v.vehicleName} (${v.vehicleNumber})`,
                                value: v.id,
                            }))}
                            onChange={(e) => setNewEntry((prev) => ({ ...prev, vehicleId: e.value }))}
                            className="p-inputtext-sm fm-dd"
                        />
                        <label htmlFor="entryVehicle">Vehicle</label>
                    </FloatLabel>

                    <FloatLabel className="fm-fl fm-grow">
                        <Dropdown
                            id="entrySupplier"
                            value={newEntry.supplierId}
                            options={projectSuppliers.map((s) => ({ label: s.supplierName, value: s.id }))}
                            onChange={(e) => setNewEntry((prev) => ({ ...prev, supplierId: e.value }))}
                            className="p-inputtext-sm fm-dd"
                        />
                        <label htmlFor="entrySupplier">Supplier</label>
                    </FloatLabel>

                    <FloatLabel className="fm-fl fm-narrow">
                        <InputText
                            id="entryLitres"
                            value={newEntry.litres}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d*\.?\d*$/.test(value)) setNewEntry((prev) => ({ ...prev, litres: value }));
                            }}
                            className="p-inputtext-sm fm-input"
                            keyfilter="num"
                        />
                        <label htmlFor="entryLitres">Litres</label>
                    </FloatLabel>

                    <FloatLabel className="fm-fl fm-narrow">
                        <InputText
                            id="entryPrice"
                            value={newEntry.pricePerLitre}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d*\.?\d*$/.test(value))
                                    setNewEntry((prev) => ({ ...prev, pricePerLitre: value }));
                            }}
                            className="p-inputtext-sm fm-input"
                            keyfilter="num"
                        />
                        <label htmlFor="entryPrice">Price / L</label>
                    </FloatLabel>

                    <FloatLabel className="fm-fl fm-narrow">
                        <InputText
                            id="entryOpeningKm"
                            value={newEntry.openingKm}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d*\.?\d*$/.test(value))
                                    setNewEntry((prev) => ({ ...prev, openingKm: value }));
                            }}
                            className="p-inputtext-sm fm-input"
                            keyfilter="num"
                        />
                        <label htmlFor="entryOpeningKm">Opening Km</label>
                    </FloatLabel>

                    <Button
                        label="Add"
                        icon="pi pi-plus"
                        onClick={handleAddNewEntry}
                        severity="success"
                        size="small"
                        className="fm-add-btn"
                    />
                </div>
            </Card>

            {/* Table */}
            <Card className="fm-card fm-table-card">
                <DataTable
                    value={filteredFuelEntries}
                    paginator
                    rows={20}
                    dataKey="id"
                    emptyMessage={`No ${activeFuelType} fuel entries found`}
                    className="p-datatable-sm fm-table"
                    stripedRows
                    responsiveLayout="scroll"
                    size="small"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    rowsPerPageOptions={[20, 50, 100]}
                >
                    <Column field="date" header="Date" body={dateTemplate} sortable style={{ minWidth: "110px" }} />
                    <Column
                        field="vehicleName"
                        header="Vehicle"
                        sortable
                        body={(rowData: FuelEntry) => <span className="fm-td-strong">{rowData.vehicleName}</span>}
                        style={{ minWidth: "160px" }}
                    />
                    <Column
                        field="supplierName"
                        header="Supplier"
                        sortable
                        body={(rowData: FuelEntry) => <span className="fm-td-muted">{rowData.supplierName}</span>}
                        style={{ minWidth: "160px" }}
                    />
                    <Column
                        field="pricePerLitre"
                        header="Price/L"
                        body={(rowData: FuelEntry) =>
                            rowData.pricePerLitre ? `₹${numberTemplate(rowData.pricePerLitre, 2)}` : "—"
                        }
                        sortable
                        style={{ minWidth: "95px" }}
                    />
                    <Column
                        field="litres"
                        header="Litres"
                        body={(rowData: FuelEntry) => `${numberTemplate(rowData.litres, 2)} L`}
                        sortable
                        style={{ minWidth: "95px" }}
                    />
                    <Column
                        field="openingKm"
                        header="Op. Km"
                        body={(rowData: FuelEntry) => numberTemplate(rowData.openingKm, 1)}
                        sortable
                        style={{ minWidth: "95px" }}
                    />
                    <Column
                        field="closingKm"
                        header="Cl. Km"
                        body={(rowData: FuelEntry) => (rowData.status === "closed" ? numberTemplate(rowData.closingKm, 1) : "—")}
                        sortable
                        style={{ minWidth: "95px" }}
                    />
                    <Column
                        field="distance"
                        header="Dist."
                        body={(rowData: FuelEntry) => (rowData.status === "closed" ? `${numberTemplate(rowData.distance, 1)} km` : "—")}
                        sortable
                        style={{ minWidth: "105px" }}
                    />
                    <Column
                        field="mileage"
                        header="Mileage"
                        body={(rowData: FuelEntry) => (rowData.status === "closed" ? numberTemplate(rowData.mileage, 2) : "—")}
                        sortable
                        style={{ minWidth: "105px" }}
                    />
                    <Column header="Status" body={statusTemplate} style={{ width: "70px", textAlign: "center" }} />
                </DataTable>
            </Card>

            {/* Close Dialog */}
            <Dialog
                header={
                    <div className="fm-dialog-title">
                        <i className="pi pi-check-circle" />
                        <span>Close Fuel Entry</span>
                    </div>
                }
                visible={showClosingDialog}
                style={{ width: "520px", maxWidth: "92vw" }}
                onHide={() => setShowClosingDialog(false)}
                footer={
                    <div className="fm-dialog-footer">
                        <Button label="Cancel" icon="pi pi-times" onClick={() => setShowClosingDialog(false)} severity="secondary" outlined />
                        <Button label="Save" icon="pi pi-check" onClick={handleSaveClosing} severity="success" />
                    </div>
                }
            >
                {closingEntry && (
                    <div className="fm-dialog-body">
                        <div className="fm-dialog-info">
                            <div className="fm-dialog-veh">
                                <i className="pi pi-car" />
                                <div>
                                    <div className="fm-dialog-veh-name">{closingEntry.vehicleName}</div>
                                    <div className="fm-dialog-veh-sub">
                                        Opening: <b>{closingEntry.openingKm.toFixed(1)}</b> km • Litres: <b>{closingEntry.litres.toFixed(2)}</b> L
                                    </div>
                                </div>
                            </div>
                        </div>

                        <FloatLabel>
                            <InputText
                                id="closingKm"
                                value={closingKm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || /^\d*\.?\d*$/.test(value)) setClosingKm(value);
                                }}
                                className="w-full"
                                keyfilter="num"
                            />
                            <label htmlFor="closingKm">Closing Km *</label>
                        </FloatLabel>

                        <div className="fm-upload">
                            <div className="fm-upload-label">Closing Km Photo (Optional)</div>
                            <div className="fm-upload-row">
                                <Button
                                    label={closingKmPhoto ? "Change Photo" : "Upload Photo"}
                                    icon="pi pi-upload"
                                    severity="secondary"
                                    outlined
                                    size="small"
                                    onClick={() => document.getElementById("closingPhotoInput")?.click()}
                                    className="fm-upload-btn"
                                />
                                <input
                                    id="closingPhotoInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: "none" }}
                                />
                                {closingKmPhoto && <span className="fm-file-ok"><i className="pi pi-check" /> {closingKmPhoto}</span>}
                            </div>
                        </div>

                        {closingKm && parseFloat(closingKm) > closingEntry.openingKm && (
                            <div className="fm-preview">
                                <div className="fm-preview-item">
                                    <div className="k">Distance</div>
                                    <div className="v">{(parseFloat(closingKm) - closingEntry.openingKm).toFixed(1)} km</div>
                                </div>
                                <div className="fm-preview-item">
                                    <div className="k">Mileage</div>
                                    <div className="v">{((parseFloat(closingKm) - closingEntry.openingKm) / closingEntry.litres).toFixed(2)} km/l</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Scoped compact styles */}
            <style>{`
        .fm-page{display:flex;flex-direction:column;gap:10px}
        .fm-card{border-radius:12px}
        .fm-mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace}

        /* Topbar */
        .fm-topbar{
          display:flex;justify-content:space-between;align-items:flex-start;gap:10px;
          padding:10px;border-radius:12px;
          background: linear-gradient(135deg, var(--primary-50) 0%, var(--surface-0) 60%);
          border: 1px solid var(--surface-200);
        }
        .fm-topbar-left{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}
        .fm-title-main{font-weight:900;font-size:14px;line-height:1.1}
        .fm-title-sub{font-size:11px;color:var(--text-color-secondary);margin-top:2px}
        .fm-summary{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
        .fm-chip{
          border:1px solid var(--surface-200);background:var(--surface-0);
          border-radius:999px;padding:6px 10px;min-width:120px;
        }
        .fm-chip .k{font-size:10px;color:var(--text-color-secondary);line-height:1}
        .fm-chip .v{font-size:12px;font-weight:900;margin-top:2px;line-height:1.1}
        .fm-chip.good{border-color: rgba(16,185,129,.35)}

        /* Segmented fuel type */
        .fm-seg{
          display:flex;gap:6px;padding:6px;border-radius:999px;
          background: var(--surface-0);
          border:1px solid var(--surface-200);
        }
        .fm-seg-btn{
          border:1px solid transparent;background:transparent;
          border-radius:999px;padding:6px 10px;
          font-size:12px;font-weight:900;cursor:pointer;
          display:flex;align-items:center;gap:6px;
          color: var(--text-color);
        }
        .fm-seg-btn i{font-size:12px;opacity:.9}
        .fm-seg-btn.active{
          background: var(--primary-color);
          color: var(--primary-color-text);
          box-shadow: 0 6px 16px rgba(0,0,0,.08);
        }

        /* Filters: single line */
        .fm-filters-card{padding:8px}
        .fm-filters-row{
          display:flex;align-items:center;gap:8px;
          overflow-x:auto;overflow-y:hidden;
          padding-bottom:2px;
          scrollbar-width: thin;
        }
        .fm-ctl{flex:0 0 auto}
        .fm-ctl-search{min-width:240px}
        .fm-dd{min-width:170px}
        .fm-cal{min-width:150px}
        .fm-clear{min-width:110px}
        .fm-input{width:100%}
        .fm-filters-row .p-dropdown,
        .fm-filters-row .p-calendar,
        .fm-filters-row .p-inputtext{height:36px}

        /* Message */
        .fm-msg .p-message{padding:6px 10px}
        .fm-msg{margin-top:-4px}

        /* Add */
        .fm-add-card{padding:10px}
        .fm-add-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
        .fm-add-title{display:flex;align-items:center;gap:8px;font-weight:900;font-size:12px}
        .fm-add-title i{color:var(--primary-color)}
        .fm-add-hint{font-size:11px;color:var(--text-color-secondary)}
        .fm-add-row{
          display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;
        }
        .fm-fl{min-width:150px}
        .fm-grow{flex:1;min-width:220px}
        .fm-narrow{min-width:140px}
        .fm-add-btn{height:36px}
        .fm-add-row .p-dropdown,
        .fm-add-row .p-calendar,
        .fm-add-row .p-inputtext{height:36px}

        /* Table compact */
        .fm-table-card{padding:0;overflow:hidden}
        .fm-table .p-datatable-thead > tr > th{padding:8px 10px;font-size:12px;white-space:nowrap}
        .fm-table .p-datatable-tbody > tr > td{padding:7px 10px;font-size:12px}
        .fm-td-strong{font-weight:800}
        .fm-td-muted{color:var(--text-color-secondary);font-weight:600}
        .fm-icon-btn{width:2rem;height:2rem;padding:0}

        /* Dialog */
        .fm-dialog-title{display:flex;align-items:center;gap:8px;font-weight:900}
        .fm-dialog-title i{color: var(--primary-color)}
        .fm-dialog-footer{display:flex;justify-content:flex-end;gap:8px}
        .fm-dialog-body{display:flex;flex-direction:column;gap:12px}
        .fm-dialog-info{
          border:1px solid var(--surface-200);
          border-radius:12px;
          background: var(--surface-50);
          padding:10px;
        }
        .fm-dialog-veh{display:flex;gap:10px;align-items:flex-start}
        .fm-dialog-veh i{font-size:18px;color:var(--primary-color);margin-top:2px}
        .fm-dialog-veh-name{font-weight:900;font-size:13px}
        .fm-dialog-veh-sub{font-size:11px;color:var(--text-color-secondary);margin-top:2px}
        .fm-upload-label{font-size:11px;color:var(--text-color-secondary);font-weight:700;margin-bottom:6px}
        .fm-upload-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .fm-file-ok{font-size:11px;font-weight:800;display:flex;align-items:center;gap:6px;color: var(--green-600)}
        .fm-preview{
          display:grid;grid-template-columns: 1fr 1fr;gap:10px;
          padding:10px;border-radius:12px;
          border:1px solid rgba(59,130,246,.25);
          background: rgba(59,130,246,.06);
        }
        .fm-preview-item .k{font-size:10px;color:var(--text-color-secondary)}
        .fm-preview-item .v{font-size:12px;font-weight:900;margin-top:2px}

        @media (max-width: 900px){
          .fm-topbar{flex-direction:column}
          .fm-summary{justify-content:flex-start}
          .fm-ctl-search{min-width:210px}
        }
      `}</style>
        </div>
    );
};

export default FuelManagement;
