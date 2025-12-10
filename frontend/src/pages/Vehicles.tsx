import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchVehicles, createVehicle } from '../store/slices/vehicleSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Vehicle } from '../types';

const Vehicles = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list: vehicles, status } = useSelector((state: RootState) => state.vehicles);
    const { list: projects, status: projectStatus } = useSelector((state: RootState) => state.projects);
    const user = useSelector((state: RootState) => state.auth.user);

    const [displayDialog, setDisplayDialog] = useState(false);
    const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({ plateNumber: '', model: '', driverName: '' });
    const [selectedProject, setSelectedProject] = useState<any>(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchVehicles());
        }
        if (user?.role === 'ADMIN' && projectStatus === 'idle') {
            dispatch(fetchProjects());
        }
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

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h2 className="m-0">Vehicles {user?.projectName ? `(${user.projectName})` : ''}</h2>
            <Button label="Add Vehicle" icon="pi pi-plus" onClick={() => setDisplayDialog(true)} />
        </div>
    );

    return (
        <div>
            <DataTable value={vehicles} header={header} paginator rows={10} loading={status === 'loading'}>
                <Column field="id" header="ID" sortable></Column>
                <Column field="plateNumber" header="Plate Number" sortable></Column>
                <Column field="model" header="Model" sortable></Column>
                <Column field="driverName" header="Driver Name" sortable></Column>
                {user?.role === 'ADMIN' && <Column field="projectName" header="Project" sortable></Column>}
            </DataTable>

            <Dialog header="Add Vehicle" visible={displayDialog} style={{ width: '30vw' }} onHide={() => setDisplayDialog(false)}>
                <div className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="plate">Plate Number</label>
                        <InputText id="plate" value={newVehicle.plateNumber} onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })} />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="model">Model</label>
                        <InputText id="model" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="driver">Driver Name</label>
                        <InputText id="driver" value={newVehicle.driverName} onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })} />
                    </div>
                    {user?.role === 'ADMIN' && (
                        <div className="flex flex-column gap-2">
                            <label>Project</label>
                            <Dropdown value={selectedProject} options={projects} onChange={(e) => setSelectedProject(e.value)} optionLabel="name" placeholder="Select Project" />
                        </div>
                    )}
                    <Button label="Save" onClick={handleSave} />
                </div>
            </Dialog>
        </div>
    );
};

export default Vehicles;
