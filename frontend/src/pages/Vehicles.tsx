import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchVehicles, createVehicle } from '../store/slices/vehicleSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import type { Vehicle } from '../types';

const Vehicles = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list: vehicles, status } = useSelector((state: RootState) => state.vehicles);
    const { list: projects, status: projectStatus } = useSelector((state: RootState) => state.projects);
    const user = useSelector((state: RootState) => state.auth.user);

    const [displayDialog, setDisplayDialog] = useState(false);
    const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({ plateNumber: '', model: '', driverName: '' });
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchVehicles());
        }
        if (user?.role === 'ADMIN' && projectStatus === 'idle') {
            dispatch(fetchProjects());
        }

        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch, status, projectStatus, user]);

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
        setNewVehicle({ plateNumber: '', model: '', driverName: '' });
        setSelectedProject(null);
    };

    const renderMobileCard = (vehicle: Vehicle) => (
        <div key={vehicle.id} className="data-card">
            <div className="data-card-header">
                <div className="data-card-title">{vehicle.plateNumber}</div>
                <div className="data-card-badge">ID: {vehicle.id}</div>
            </div>
            <div className="data-card-body">
                <div className="data-card-row">
                    <span className="data-card-label">Model</span>
                    <span className="data-card-value">{vehicle.model}</span>
                </div>
                <div className="data-card-row">
                    <span className="data-card-label">Driver</span>
                    <span className="data-card-value">{vehicle.driverName}</span>
                </div>
                {user?.role === 'ADMIN' && vehicle.projectName && (
                    <div className="data-card-row">
                        <span className="data-card-label">Project</span>
                        <span className="data-card-value">{vehicle.projectName}</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div>
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
                    {vehicles.length === 0 && status !== 'loading' && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <i className="pi pi-car" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
                            <p>No vehicles found. Add your first vehicle!</p>
                        </div>
                    )}
                </div>
            ) : (
                <DataTable value={vehicles} paginator rows={10} loading={status === 'loading'} emptyMessage="No vehicles found">
                    <Column field="id" header="ID" sortable style={{ width: '80px' }}></Column>
                    <Column field="plateNumber" header="Plate Number" sortable></Column>
                    <Column field="model" header="Model" sortable></Column>
                    <Column field="driverName" header="Driver Name" sortable></Column>
                    {user?.role === 'ADMIN' && <Column field="projectName" header="Project" sortable></Column>}
                </DataTable>
            )}

            <Dialog
                header="Add New Vehicle"
                visible={displayDialog}
                style={{ width: isMobile ? '95vw' : '450px' }}
                onHide={() => setDisplayDialog(false)}
                draggable={false}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="plate" style={{ fontWeight: 600, fontSize: '14px' }}>Plate Number</label>
                        <InputText
                            id="plate"
                            value={newVehicle.plateNumber}
                            onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                            placeholder="Enter plate number"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="model" style={{ fontWeight: 600, fontSize: '14px' }}>Model</label>
                        <InputText
                            id="model"
                            value={newVehicle.model}
                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                            placeholder="Enter vehicle model"
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
                    {user?.role === 'ADMIN' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, fontSize: '14px' }}>Project</label>
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
