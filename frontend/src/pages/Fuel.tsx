import { useEffect, useState } from 'react';
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
import type { FuelEntry } from '../types';

const Fuel = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list: entries, status } = useSelector((state: RootState) => state.fuel);
    const { list: vehicles, status: vehicleStatus } = useSelector((state: RootState) => state.vehicles);

    const [displayDialog, setDisplayDialog] = useState(false);
    const [newEntry, setNewEntry] = useState<Partial<FuelEntry>>({
        date: new Date().toISOString(),
        amount: 0,
        cost: 0,
        odometerReading: 0
    });
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchFuelEntries());
        }
        if (vehicleStatus === 'idle') {
            dispatch(fetchVehicles());
        }

        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch, status, vehicleStatus]);

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
                amount: 0,
                cost: 0,
                odometerReading: 0
            });
            setSelectedVehicle(null);
        }
    };

    const handleDelete = (entry: FuelEntry) => {
        confirmDialog({
            message: `Are you sure you want to delete fuel entry for ${entry.vehiclePlateNumber}?`,
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

    const renderMobileCard = (entry: FuelEntry) => (
        <div key={entry.id} className="data-card">
            <div className="data-card-header">
                <div className="data-card-title">{entry.vehiclePlateNumber}</div>
                <div className="data-card-badge">{new Date(entry.date).toLocaleDateString()}</div>
            </div>
            <div className="data-card-body">
                <div className="data-card-row">
                    <span className="data-card-label">Driver</span>
                    <span className="data-card-value">{entry.driverName}</span>
                </div>
                <div className="data-card-row">
                    <span className="data-card-label">Amount</span>
                    <span className="data-card-value">{entry.amount} L</span>
                </div>
                <div className="data-card-row">
                    <span className="data-card-label">Cost</span>
                    <span className="data-card-value">${entry.cost.toFixed(2)}</span>
                </div>
                <div className="data-card-row">
                    <span className="data-card-label">Odometer</span>
                    <span className="data-card-value">{entry.odometerReading} km</span>
                </div>
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

    return (
        <div>
            <ConfirmDialog />
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="page-title">Fuel Entries</h1>
                        <p className="page-subtitle">Track and manage fuel consumption</p>
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
                    <Column field="id" header="ID" sortable style={{ width: '80px' }}></Column>
                    <Column field="date" header="Date" body={dateBodyTemplate} sortable></Column>
                    <Column field="vehiclePlateNumber" header="Vehicle" sortable></Column>
                    <Column field="driverName" header="Driver" sortable></Column>
                    <Column field="amount" header="Amount (L)" sortable></Column>
                    <Column field="cost" header="Cost" sortable body={(row) => `$${row.cost.toFixed(2)}`}></Column>
                    <Column field="odometerReading" header="Odometer" sortable></Column>
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
                header="Add Fuel Entry"
                visible={displayDialog}
                style={{ width: isMobile ? '95vw' : '450px' }}
                onHide={() => setDisplayDialog(false)}
                draggable={false}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Vehicle</label>
                        <Dropdown
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.value)}
                            options={vehicles}
                            optionLabel="plateNumber"
                            placeholder="Select a Vehicle"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Date</label>
                        <Calendar
                            value={new Date(newEntry.date!)}
                            onChange={(e) => setNewEntry({ ...newEntry, date: e.value!.toISOString() })}
                            showTime
                            showIcon
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Amount (Liters)</label>
                        <InputNumber
                            value={newEntry.amount}
                            onValueChange={(e) => setNewEntry({ ...newEntry, amount: e.value! })}
                            mode="decimal"
                            minFractionDigits={2}
                            placeholder="0.00"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Cost</label>
                        <InputNumber
                            value={newEntry.cost}
                            onValueChange={(e) => setNewEntry({ ...newEntry, cost: e.value! })}
                            mode="currency"
                            currency="USD"
                            placeholder="$0.00"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Odometer Reading</label>
                        <InputNumber
                            value={newEntry.odometerReading}
                            onValueChange={(e) => setNewEntry({ ...newEntry, odometerReading: e.value! })}
                            placeholder="0"
                        />
                    </div>
                    <Button
                        label="Save Entry"
                        onClick={handleSave}
                        disabled={!selectedVehicle}
                        className="p-button-success"
                        style={{ marginTop: '8px' }}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default Fuel;
