import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchVehicles, createVehicle, deleteVehicle } from '../store/slices/vehicleSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import type { Vehicle } from '../types/';

const Vehicles = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list: vehicles, status } = useSelector((state: RootState) => state.vehicles);
    const { list: projects, status: projectStatus } = useSelector((state: RootState) => state.projects);
    const user = useSelector((state: RootState) => state.auth.user);

    const [displayDialog, setDisplayDialog] = useState(false);
    const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
        id: 0,
        vehicleName: '', 
        vehicleNo: '', 
        driverName: '', 
        vehicleType: 'Own', 
        fuelType: 'Petrol',
        mileage: undefined
    });
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const vehicleTypeOptions = [
        { label: 'Own', value: 'Own' },
        { label: 'Monthly Rented', value: 'Monthly Rented' },
        { label: 'Daily Rented', value: 'Daily Rented' },
        { label: 'Hourly Rented', value: 'Hourly Rented' }
    ];

    const fuelTypeOptions = [
        { label: 'Petrol', value: 'Petrol' },
        { label: 'Diesel', value: 'Diesel' },
        { label: 'Electric', value: 'Electric' }
    ];

    const authStatus = useSelector((state: RootState) => state.auth.status);
    const authToken = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        // Only fetch data when authentication is complete
        if (authStatus === 'succeeded' && authToken) {
            if (status === 'idle') {
                dispatch(fetchVehicles());
            }
            if (user?.role === 'ADMIN' && projectStatus === 'idle') {
                dispatch(fetchProjects());
            }
        }

        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch, status, projectStatus, user, authStatus, authToken]);

    const handleSave = () => {
        const vehicleToSave = { ...newVehicle };
        if (user?.role === 'ADMIN') {
            if (selectedProject) {
                vehicleToSave.projectId = selectedProject.id;
            } else {
                alert('Please select a project');
                return;
            }
        }
        dispatch(createVehicle(vehicleToSave));
        setDisplayDialog(false);
        setNewVehicle({
            id: 0,
            vehicleName: '', 
            vehicleNo: '', 
            driverName: '', 
            vehicleType: 'Own', 
            fuelType: 'Petrol', 
            mileage: undefined
        });
        setSelectedProject(null);
    };

    const handleDelete = (vehicle: Vehicle) => {
        confirmDialog({
            message: `Are you sure you want to delete vehicle ${vehicle.vehicleNo || vehicle.plateNumber}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                dispatch(deleteVehicle(vehicle.id));
            },
        });
    };

    const renderMobileCard = (vehicle: Vehicle) => (
        <div key={vehicle.id} className="data-card">
            <div className="data-card-header">
                <div className="data-card-title">{vehicle.vehicleName || vehicle.model}</div>
                <div className="data-card-badge">{vehicle.vehicleNo || vehicle.plateNumber}</div>
            </div>
            <div className="data-card-body">
                <div className="data-card-row">
                    <span className="data-card-label">Driver</span>
                    <span className="data-card-value">{vehicle.driverName}</span>
                </div>
                <div className="data-card-row">
                    <span className="data-card-label">Vehicle Type</span>
                    <span className="data-card-value">{vehicle.vehicleType}</span>
                </div>
                <div className="data-card-row">
                    <span className="data-card-label">Fuel Type</span>
                    <span className="data-card-value">{vehicle.fuelType}</span>
                </div>
                <div className="data-card-row">
                    <span className="data-card-label">Mileage</span>
                    <span className="data-card-value">{vehicle.mileage ? `${vehicle.mileage} km/l` : 'N/A'}</span>
                </div>
                {user?.role === 'ADMIN' && vehicle.projectName && (
                    <div className="data-card-row">
                        <span className="data-card-label">Project</span>
                        <span className="data-card-value">{vehicle.projectName}</span>
                    </div>
                )}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        icon="pi pi-trash"
                        className="p-button-danger p-button-sm"
                        onClick={() => handleDelete(vehicle)}
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
                        <h1 className="page-title">Vehicles {user?.projectName ? `(${user.projectName})` : ''}</h1>
                        <p className="page-subtitle">Manage your fleet of vehicles</p>
                    </div>
                    <button className="action-btn" onClick={() => setDisplayDialog(true)}>
                        <i className="pi pi-plus"></i>
                        Add Vehicle
                    </button>
                </div>
            </div>

            {isMobile ? (
                <div>
                    {status === 'loading' && <p>Loading...</p>}
                    {vehicles.map(renderMobileCard)}
                </div>
            ) : (
                <DataTable value={vehicles} paginator rows={10} loading={status === 'loading'} emptyMessage="No vehicles found">
                    <Column field="id" header="ID" sortable style={{ width: '80px' }}></Column>
                    <Column field="vehicleName" header="Vehicle Name" sortable body={(vehicle: Vehicle) => vehicle.vehicleName || vehicle.model}></Column>
                    <Column field="vehicleNo" header="Vehicle No" sortable body={(vehicle: Vehicle) => vehicle.vehicleNo || vehicle.plateNumber}></Column>
                    <Column field="driverName" header="Driver Name" sortable></Column>
                    <Column field="vehicleType" header="Vehicle Type" sortable></Column>
                    <Column field="fuelType" header="Fuel Type" sortable></Column>
                    <Column field="mileage" header="Mileage" sortable body={(vehicle: Vehicle) => vehicle.mileage ? `${vehicle.mileage} km/l` : 'N/A'}></Column>
                    {user?.role === 'ADMIN' && <Column field="projectName" header="Project" sortable></Column>}
                    <Column
                        body={(vehicle: Vehicle) => (
                            <Button
                                icon="pi pi-trash"
                                className="p-button-danger p-button-sm"
                                onClick={() => handleDelete(vehicle)}
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
                header="Add New Vehicle"
                visible={displayDialog}
                style={{ width: isMobile ? '95vw' : '500px' }}
                onHide={() => setDisplayDialog(false)}
                draggable={false}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="vehicleName" style={{ fontWeight: 600, fontSize: '14px' }}>Vehicle Name *</label>
                        <InputText
                            id="vehicleName"
                            value={newVehicle.vehicleName}
                            onChange={(e) => setNewVehicle({ ...newVehicle, vehicleName: e.target.value })}
                            placeholder="Enter vehicle name (e.g., Honda Civic)"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="vehicleNo" style={{ fontWeight: 600, fontSize: '14px' }}>Vehicle No *</label>
                        <InputText
                            id="vehicleNo"
                            value={newVehicle.vehicleNo}
                            onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNo: e.target.value })}
                            placeholder="Enter vehicle number (e.g., TN01AB1234)"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="driver" style={{ fontWeight: 600, fontSize: '14px' }}>Driver Name</label>
                        <InputText
                            id="driver"
                            value={newVehicle.driverName}
                            onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                            placeholder="Enter driver name"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Vehicle Type *</label>
                        <Dropdown
                            value={newVehicle.vehicleType}
                            options={vehicleTypeOptions}
                            onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.value })}
                            placeholder="Select Vehicle Type"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Fuel Type *</label>
                        <Dropdown
                            value={newVehicle.fuelType}
                            options={fuelTypeOptions}
                            onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.value })}
                            placeholder="Select Fuel Type"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="mileage" style={{ fontWeight: 600, fontSize: '14px' }}>Vehicle Mileage (km/l)</label>
                        <InputText
                            id="mileage"
                            type="number"
                            value={newVehicle.mileage?.toString() || ''}
                            onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value ? parseFloat(e.target.value) : undefined })}
                            placeholder="Enter mileage (e.g., 15.5)"
                        />
                    </div>
                    {user?.role === 'ADMIN' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, fontSize: '14px' }}>Project *</label>
                            <Dropdown
                                value={selectedProject}
                                options={projects}
                                onChange={(e) => setSelectedProject(e.value)}
                                optionLabel="name"
                                placeholder="Select Project"
                            />
                        </div>
                    )}
                    <Button
                        label="Save Vehicle"
                        onClick={handleSave}
                        className="p-button-success"
                        style={{ marginTop: '8px' }}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default Vehicles;
