import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchFuelEntries, createFuelEntry } from '../store/slices/fuelSlice';
import { fetchVehicles } from '../store/slices/vehicleSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { FuelEntry } from '../types';

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

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchFuelEntries());
        }
        if (vehicleStatus === 'idle') {
            dispatch(fetchVehicles());
        }
    }, [dispatch, status, vehicleStatus]);

    const handleSave = () => {
        if (selectedVehicle) {
            dispatch(createFuelEntry({
                ...newEntry,
                vehicleId: selectedVehicle.id,
                date: new Date(newEntry.date!).toISOString() // Ensure ISO format
            }));
            setDisplayDialog(false);
            // Reset
            setNewEntry({
                date: new Date().toISOString(),
                amount: 0,
                cost: 0,
                odometerReading: 0
            });
            setSelectedVehicle(null);
        }
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h2 className="m-0">Fuel Entries</h2>
            <Button label="Add Entry" icon="pi pi-plus" onClick={() => setDisplayDialog(true)} />
        </div>
    );

    const dateBodyTemplate = (rowData: FuelEntry) => {
        return new Date(rowData.date).toLocaleDateString();
    };

    return (
        <div>
            <DataTable value={entries} header={header} paginator rows={10} loading={status === 'loading'}>
                <Column field="id" header="ID" sortable></Column>
                <Column field="date" header="Date" body={dateBodyTemplate} sortable></Column>
                <Column field="vehiclePlateNumber" header="Vehicle" sortable></Column>
                <Column field="driverName" header="Driver" sortable></Column>
                <Column field="amount" header="Amount (L)" sortable></Column>
                <Column field="cost" header="Cost" sortable></Column>
                <Column field="odometerReading" header="Odometer" sortable></Column>
            </DataTable>

            <Dialog header="Add Fuel Entry" visible={displayDialog} style={{ width: '30vw' }} onHide={() => setDisplayDialog(false)}>
                <div className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label>Vehicle</label>
                        <Dropdown value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.value)} options={vehicles} optionLabel="plateNumber" placeholder="Select a Vehicle" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label>Date</label>
                        <Calendar value={new Date(newEntry.date!)} onChange={(e) => setNewEntry({ ...newEntry, date: e.value!.toISOString() })} showTime />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label>Amount (L)</label>
                        <InputNumber value={newEntry.amount} onValueChange={(e) => setNewEntry({ ...newEntry, amount: e.value! })} mode="decimal" minFractionDigits={2} />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label>Cost</label>
                        <InputNumber value={newEntry.cost} onValueChange={(e) => setNewEntry({ ...newEntry, cost: e.value! })} mode="currency" currency="USD" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label>Odometer</label>
                        <InputNumber value={newEntry.odometerReading} onValueChange={(e) => setNewEntry({ ...newEntry, odometerReading: e.value! })} />
                    </div>
                    <Button label="Save" onClick={handleSave} disabled={!selectedVehicle} />
                </div>
            </Dialog>
        </div>
    );
};

export default Fuel;
