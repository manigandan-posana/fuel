import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchProjects, createProject } from '../store/slices/projectSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import type { Project } from '../types';

const Projects = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list: projects, status } = useSelector((state: RootState) => state.projects);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [newProject, setNewProject] = useState<Partial<Project>>({ name: '', location: '' });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProjects());
        }

        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch, status]);

    const handleSave = () => {
        dispatch(createProject(newProject));
        setDisplayDialog(false);
        setNewProject({ name: '', location: '' });
    };

    const renderMobileCard = (project: Project) => (
        <div key={project.id} className="data-card">
            <div className="data-card-header">
                <div className="data-card-title">{project.name}</div>
                <div className="data-card-badge">ID: {project.id}</div>
            </div>
            <div className="data-card-body">
                <div className="data-card-row">
                    <span className="data-card-label">Location</span>
                    <span className="data-card-value">{project.location}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="page-title">Projects</h1>
                        <p className="page-subtitle">Manage construction projects</p>
                    </div>
                    <button className="action-btn" onClick={() => setDisplayDialog(true)}>
                        <i className="pi pi-plus"></i>
                        Add Project
                    </button>
                </div>
            </div>

            {isMobile ? (
                <div>
                    {status === 'loading' && <p>Loading...</p>}
                    {projects.map(renderMobileCard)}
                    {projects.length === 0 && status !== 'loading' && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <i className="pi pi-building" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
                            <p>No projects found. Add your first project!</p>
                        </div>
                    )}
                </div>
            ) : (
                <DataTable value={projects} paginator rows={10} loading={status === 'loading'} emptyMessage="No projects found">
                    <Column field="id" header="ID" sortable style={{ width: '80px' }}></Column>
                    <Column field="name" header="Name" sortable></Column>
                    <Column field="location" header="Location" sortable></Column>
                </DataTable>
            )}

            <Dialog
                header="Add New Project"
                visible={displayDialog}
                style={{ width: isMobile ? '95vw' : '450px' }}
                onHide={() => setDisplayDialog(false)}
                draggable={false}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="name" style={{ fontWeight: 600, fontSize: '14px' }}>Project Name</label>
                        <InputText
                            id="name"
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            placeholder="Enter project name"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="location" style={{ fontWeight: 600, fontSize: '14px' }}>Location</label>
                        <InputText
                            id="location"
                            value={newProject.location}
                            onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                            placeholder="Enter project location"
                        />
                    </div>
                    <Button
                        label="Save Project"
                        onClick={handleSave}
                        className="p-button-success"
                        style={{ marginTop: '8px' }}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default Projects;
