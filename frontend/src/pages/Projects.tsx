import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchProjects, createProject } from '../store/slices/projectSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Project } from '../types';

const Projects = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list: projects, status } = useSelector((state: RootState) => state.projects);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [newProject, setNewProject] = useState<Partial<Project>>({ name: '', location: '' });

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProjects());
        }
    }, [dispatch, status]);

    const handleSave = () => {
        dispatch(createProject(newProject));
        setDisplayDialog(false);
        setNewProject({ name: '', location: '' });
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h2 className="m-0">Projects</h2>
            <Button label="Add Project" icon="pi pi-plus" onClick={() => setDisplayDialog(true)} />
        </div>
    );

    return (
        <div>
            <DataTable value={projects} header={header} paginator rows={10} loading={status === 'loading'}>
                <Column field="id" header="ID" sortable></Column>
                <Column field="name" header="Name" sortable></Column>
                <Column field="location" header="Location" sortable></Column>
            </DataTable>

            <Dialog header="Add Project" visible={displayDialog} style={{ width: '30vw' }} onHide={() => setDisplayDialog(false)}>
                <div className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="name">Name</label>
                        <InputText id="name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="location">Location</label>
                        <InputText id="location" value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} />
                    </div>
                    <Button label="Save" onClick={handleSave} />
                </div>
            </Dialog>
        </div>
    );
};

export default Projects;
