import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchFuelEntries, createFuelEntry, deleteFuelEntry } from '../store/slices/fuelSlice';
import { fetchVehicles } from '../store/slices/vehicleSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import type { FuelEntry, Vehicle } from '../types/';

const Fuel = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list: entries, status } = useSelector((state: RootState) => state.fuel);
    const { list: vehicles, status: vehicleStatus } = useSelector((state: RootState) => state.vehicles);
    const authStatus = useSelector((state: RootState) => state.auth.status);
    const authToken = useSelector((state: RootState) => state.auth.token);

    const [displayDialog, setDisplayDialog] = useState(false);
    const [newEntry, setNewEntry] = useState<Partial<FuelEntry>>({
        date: new Date().toISOString(),
        litres: 10,
        openingKm: 0,
        closingKm: 0,
        fuelPrice: 100
    });
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        // Only fetch data when authentication is complete
        if (authStatus === 'succeeded' && authToken) {
            if (status === 'idle') {
                dispatch(fetchFuelEntries());
            }
            if (vehicleStatus === 'idle') {
                dispatch(fetchVehicles());
            }
        }

        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch, status, vehicleStatus, authStatus, authToken]);

    // Calculate audit stats in real-time as user enters data
    const auditStats = useMemo(() => {
        if (!selectedVehicle || !newEntry.openingKm || !newEntry.closingKm || !newEntry.litres || !newEntry.fuelPrice) {
            return null;
        }

        const distance = newEntry.closingKm - newEntry.openingKm;
        const expectedLitres = selectedVehicle.mileage && selectedVehicle.mileage > 0 
            ? distance / selectedVehicle.mileage 
            : 0;
        const effectiveMileage = newEntry.litres > 0 ? distance / newEntry.litres : 0;
        const isSuspicious = selectedVehicle.mileage && selectedVehicle.mileage > 0 
            ? effectiveMileage > 0 && effectiveMileage < selectedVehicle.mileage * 0.7
            : false;
        const driverBillAmount = newEntry.litres * newEntry.fuelPrice;
        const recommendedPayAmount = expectedLitres * newEntry.fuelPrice;

        return {
            distance,
            expectedLitres,
            effectiveMileage,
            isSuspicious,
            driverBillAmount,
            recommendedPayAmount,
        };
    }, [newEntry, selectedVehicle]);

    const handleSave = () => {
        if (selectedVehicle) {
            dispatch(createFuelEntry({
                ...newEntry,
                vehicleId: selectedVehicle.id,
                date: new Date(newEntry.date!).toISOString()
            }));
            setDisplayDialog(false);
            setNewEntry({
                date: new Date().toISOString(),
                litres: 10,
                openingKm: 0,
                closingKm: 0,
                fuelPrice: 100
            });
            setSelectedVehicle(null);
        }
    };

    const handleDelete = (entry: FuelEntry) => {
        confirmDialog({
            message: `Are you sure you want to delete fuel entry for ${entry.vehicleNo || entry.vehiclePlateNumber}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                dispatch(deleteFuelEntry(entry.id));
            },
        });
    };

    const dateBodyTemplate = (rowData: FuelEntry) => {
        return new Date(rowData.date).toLocaleDateString();
    };

    const getUnitLabel = (fuelType?: string) => {
        return fuelType === 'Electric' ? 'Units' : 'Litres';
    };

    const getMileageLabel = (fuelType?: string) => {
        return fuelType === 'Electric' ? 'km/unit' : 'km/L';
    };

    const renderMobileCard = (entry: FuelEntry) => {
        const unitLabel = getUnitLabel(entry.fuelType);
        
        return (
            <div key={entry.id} className="data-card">
                <div className="data-card-header">
                    <div className="data-card-title">{entry.vehicleName || entry.vehiclePlateNumber}</div>
                    <div className="data-card-badge">{new Date(entry.date).toLocaleDateString()}</div>
                </div>
                <div className="data-card-body">
                    <div className="data-card-row">
                        <span className="data-card-label">Driver</span>
                        <span className="data-card-value">{entry.driverName}</span>
                    </div>
                    <div className="data-card-row">
                        <span className="data-card-label">Distance</span>
                        <span className="data-card-value">{entry.distance?.toFixed(2)} km</span>
                    </div>
                    <div className="data-card-row">
                        <span className="data-card-label">{unitLabel} Used</span>
                        <span className="data-card-value">{entry.litres?.toFixed(2)}</span>
                    </div>
                    <div className="data-card-row">
                        <span className="data-card-label">Driver Bill</span>
                        <span className="data-card-value">₹{entry.driverBillAmount?.toFixed(2)}</span>
                    </div>
                    <div className="data-card-row">
                        <span className="data-card-label">Should Pay</span>
                        <span className="data-card-value" style={{ color: '#10b981', fontWeight: 600 }}>
                            ₹{entry.recommendedPayAmount?.toFixed(2)}
                        </span>
                    </div>
                    {entry.isSuspicious && (
                        <div style={{ marginTop: '8px' }}>
                            <Tag severity="warning" value="⚠ Suspicious Usage" style={{ fontSize: '11px' }} />
                        </div>
                    )}
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            icon="pi pi-trash"
                            className="p-button-danger p-button-sm"
                            onClick={() => handleDelete(entry)}
                            tooltip="Delete"
                            tooltipOptions={{ position: 'top' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <ConfirmDialog />
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="page-title">Fuel Audit & Management</h1>
                        <p className="page-subtitle">Track fuel consumption and detect suspicious usage</p>
                    </div>
                    <button className="action-btn" onClick={() => setDisplayDialog(true)}>
                        <i className="pi pi-plus"></i>
                        Add Entry
                    </button>
                </div>
            </div>

            {isMobile ? (
                <div>
                    {status === 'loading' && <p>Loading...</p>}
                    {entries.map(renderMobileCard)}
                    {entries.length === 0 && status !== 'loading' && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <i className="pi pi-chart-line" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
                            <p>No fuel entries found. Add your first entry!</p>
                        </div>
                    )}
                </div>
            ) : (
                <DataTable value={entries} paginator rows={10} loading={status === 'loading'} emptyMessage="No fuel entries found">
                    <Column field="date" header="Date" body={dateBodyTemplate} sortable style={{ width: '120px' }}></Column>
                    <Column field="vehicleName" header="Vehicle" sortable body={(row) => row.vehicleName || row.vehiclePlateNumber}></Column>
                    <Column field="driverName" header="Driver" sortable></Column>
                    <Column field="distance" header="Distance" sortable body={(row) => `${row.distance?.toFixed(1) || 0} km`} style={{ width: '100px' }}></Column>
                    <Column 
                        field="litres" 
                        header="Fuel/Units" 
                        sortable 
                        body={(row) => `${row.litres?.toFixed(2) || 0} ${getUnitLabel(row.fuelType)}`}
                        style={{ width: '120px' }}
                    ></Column>
                    <Column 
                        field="effectiveMileage" 
                        header="Mileage" 
                        sortable 
                        body={(row) => `${row.effectiveMileage?.toFixed(2) || 0} ${getMileageLabel(row.fuelType)}`}
                        style={{ width: '120px' }}
                    ></Column>
                    <Column 
                        field="driverBillAmount" 
                        header="Driver Bill" 
                        sortable 
                        body={(row) => `₹${row.driverBillAmount?.toFixed(2) || 0}`}
                        style={{ width: '120px' }}
                    ></Column>
                    <Column 
                        field="recommendedPayAmount" 
                        header="Should Pay" 
                        sortable 
                        body={(row) => <span style={{ color: '#10b981', fontWeight: 600 }}>₹{row.recommendedPayAmount?.toFixed(2) || 0}</span>}
                        style={{ width: '120px' }}
                    ></Column>
                    <Column
                        field="isSuspicious"
                        header="Status"
                        body={(row) => row.isSuspicious ? <Tag severity="warning" value="⚠ Suspicious" /> : <Tag severity="success" value="✓ OK" />}
                        style={{ width: '100px', textAlign: 'center' }}
                    ></Column>
                    <Column
                        body={(entry: FuelEntry) => (
                            <Button
                                icon="pi pi-trash"
                                className="p-button-danger p-button-sm"
                                onClick={() => handleDelete(entry)}
                                tooltip="Delete"
                                tooltipOptions={{ position: 'top' }}
                            />
                        )}
                        header="Actions"
                        style={{ width: '100px', textAlign: 'center' }}
                    ></Column>
                </DataTable>
            )}

            <Dialog
                header="Add Fuel Entry with Audit"
                visible={displayDialog}
                style={{ width: isMobile ? '95vw' : '700px', maxHeight: '90vh' }}
                onHide={() => setDisplayDialog(false)}
                draggable={false}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Vehicle Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Vehicle *</label>
                        <Dropdown
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.value)}
                            options={vehicles}
                            optionLabel="vehicleName"
                            placeholder="Select a Vehicle"
                            itemTemplate={(option: Vehicle) => (
                                <div>
                                    <div style={{ fontWeight: 600 }}>{option.vehicleName}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {option.vehicleNo} • {option.mileage} {getMileageLabel(option.fuelType)} • {option.fuelType}
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    {selectedVehicle && (
                        <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '13px' }}>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Vehicle Info</div>
                            <div>Driver: {selectedVehicle.driverName} • Type: {selectedVehicle.vehicleType}</div>
                            <div>Rated Mileage: {selectedVehicle.mileage} {getMileageLabel(selectedVehicle.fuelType)}</div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                        {/* Date */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, fontSize: '14px' }}>Date *</label>
                            <Calendar
                                value={new Date(newEntry.date!)}
                                onChange={(e) => setNewEntry({ ...newEntry, date: e.value!.toISOString() })}
                                showIcon
                            />
                        </div>

                        {/* Fuel Price */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, fontSize: '14px' }}>
                                {selectedVehicle?.fuelType === 'Electric' ? 'Energy Price (₹/unit)' : 'Fuel Price (₹/L)'} *
                            </label>
                            <InputNumber
                                value={newEntry.fuelPrice}
                                onValueChange={(e) => setNewEntry({ ...newEntry, fuelPrice: e.value! })}
                                mode="decimal"
                                minFractionDigits={2}
                                prefix="₹"
                                placeholder="100.00"
                            />
                        </div>

                        {/* Opening KM */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, fontSize: '14px' }}>Opening KM *</label>
                            <InputNumber
                                value={newEntry.openingKm}
                                onValueChange={(e) => setNewEntry({ ...newEntry, openingKm: e.value! })}
                                placeholder="10000"
                            />
                        </div>

                        {/* Closing KM */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, fontSize: '14px' }}>Closing KM *</label>
                            <InputNumber
                                value={newEntry.closingKm}
                                onValueChange={(e) => setNewEntry({ ...newEntry, closingKm: e.value! })}
                                placeholder="10073"
                            />
                        </div>

                        {/* Litres/Units Used */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: isMobile ? 'auto' : 'span 2' }}>
                            <label style={{ fontWeight: 600, fontSize: '14px' }}>
                                {getUnitLabel(selectedVehicle?.fuelType)} Used *
                            </label>
                            <InputNumber
                                value={newEntry.litres}
                                onValueChange={(e) => setNewEntry({ ...newEntry, litres: e.value! })}
                                mode="decimal"
                                minFractionDigits={2}
                                placeholder="10.00"
                            />
                            <small style={{ color: '#666', fontSize: '11px' }}>
                                {selectedVehicle?.fuelType === 'Electric' 
                                    ? 'Enter electricity units consumed for this trip'
                                    : 'Enter fuel litres consumed for this trip'}
                            </small>
                        </div>
                    </div>

                    {/* Audit Stats Preview */}
                    {auditStats && (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                            {/* Trip Summary */}
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#334155' }}>Trip Summary</h3>
                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Distance:</span>
                                        <span style={{ fontWeight: 600 }}>{auditStats.distance.toFixed(2)} km</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Expected {getUnitLabel(selectedVehicle?.fuelType)}:</span>
                                        <span style={{ fontWeight: 600 }}>{auditStats.expectedLitres.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Actual {getUnitLabel(selectedVehicle?.fuelType)}:</span>
                                        <span style={{ fontWeight: 600 }}>{newEntry.litres?.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Effective Mileage:</span>
                                        <span style={{ fontWeight: 600 }}>{auditStats.effectiveMileage.toFixed(2)} {getMileageLabel(selectedVehicle?.fuelType)}</span>
                                    </div>
                                </div>
                                {auditStats.isSuspicious ? (
                                    <div style={{ marginTop: '12px', padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '11px', color: '#991b1b' }}>
                                        <strong>⚠ Suspicious:</strong> Effective mileage is much lower than rated. Extra fuel may have been used for personal trips.
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '12px', padding: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '11px', color: '#166534' }}>
                                        <strong>✓ Normal:</strong> Usage looks reasonable for this trip.
                                    </div>
                                )}
                            </div>

                            {/* Cost Comparison */}
                            <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#1e40af' }}>Cost Comparison</h3>
                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Price per {getUnitLabel(selectedVehicle?.fuelType).toLowerCase()}:</span>
                                        <span style={{ fontWeight: 600 }}>₹{newEntry.fuelPrice?.toFixed(2)}</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid #dbeafe', margin: '6px 0' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Driver Bill Amount:</span>
                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>₹{auditStats.driverBillAmount.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#16a34a', fontWeight: 600 }}>You Should Pay:</span>
                                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#16a34a' }}>₹{auditStats.recommendedPayAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '12px', padding: '8px', background: '#fff', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>
                                    <strong>Tip:</strong> Pay for expected {getUnitLabel(selectedVehicle?.fuelType).toLowerCase()} (optionally add 10-15% buffer). Extra fuel can be considered for next trip.
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        label="Save Fuel Entry"
                        onClick={handleSave}
                        disabled={!selectedVehicle || !newEntry.litres || !newEntry.openingKm || !newEntry.closingKm || !newEntry.fuelPrice}
                        className="p-button-success"
                        style={{ marginTop: '8px' }}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default Fuel;
