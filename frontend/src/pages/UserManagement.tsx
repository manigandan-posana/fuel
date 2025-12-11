import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { api } from '../services/api';
import type { User, Project } from '../types/';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [displayCreateDialog, setDisplayCreateDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [newUser, setNewUser] = useState({ email: '', name: '', projectId: null as number | null });

    useEffect(() => {
        loadUsers();
        loadProjects();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get<User[]>('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to load users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const response = await api.get<Project[]>('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    };

    const handleAssignProject = async () => {
        if (selectedUser && selectedProject) {
            try {
                await api.post(`/auth/users/${selectedUser.id}/assign-project/${selectedProject.id}`);
                toast.success('Project assigned successfully');
                setDisplayDialog(false);
                loadUsers();
            } catch (error) {
                console.error('Failed to assign project:', error);
                toast.error('Failed to assign project');
            }
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.name) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            await api.post('/auth/users', newUser);
            toast.success('User created successfully. They can now login with their Microsoft account.');
            setDisplayCreateDialog(false);
            setNewUser({ email: '', name: '', projectId: null });
            loadUsers();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const roleBodyTemplate = (rowData: User) => {
        return <Tag value={rowData.role} severity={rowData.role === 'ADMIN' ? 'danger' : 'success'} style={{ fontSize: '11px' }} />;
    };

    const projectBodyTemplate = (rowData: User) => {
        return rowData.projectName || <span className="text-500">Not Assigned</span>;
    };

    const actionBodyTemplate = (rowData: User) => {
        return (
            <Button
                label="Assign Project"
                icon="pi pi-building"
                size="small"
                onClick={() => {
                    setSelectedUser(rowData);
                    setSelectedProject(projects.find(p => p.id === rowData.projectId) || null);
                    setDisplayDialog(true);
                }}
                disabled={rowData.role === 'ADMIN'}
                style={{ fontSize: '11px' }}
            />
        );
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <div>
                <h2 className="text-3xl font-bold text-900 m-0 flex align-items-center gap-2">
                    <i className="pi pi-users text-primary" style={{ fontSize: '1.8rem' }}></i>
                    User Management
                </h2>
                <p className="text-600 mt-2 mb-0" style={{ fontSize: '12px' }}>
                    Manage users and project assignments
                </p>
            </div>
            <div className="flex gap-2">
                <Button label="Create User" icon="pi pi-user-plus" onClick={() => setDisplayCreateDialog(true)} severity="success" style={{ fontSize: '12px' }} />
                <Button label="Refresh" icon="pi pi-refresh" onClick={loadUsers} style={{ fontSize: '12px' }} />
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-4">{header}</div>

            <DataTable value={users} loading={loading} paginator rows={10} className="p-datatable-sm" stripedRows style={{ fontSize: '12px' }}>
                <Column field="id" header="ID" sortable style={{ width: '5rem', fontSize: '12px' }}></Column>
                <Column field="name" header="Name" sortable style={{ fontSize: '12px' }}></Column>
                <Column field="email" header="Email" sortable style={{ fontSize: '12px' }}></Column>
                <Column field="role" header="Role" body={roleBodyTemplate} sortable></Column>
                <Column field="projectName" header="Project" body={projectBodyTemplate} sortable style={{ fontSize: '12px' }}></Column>
                <Column body={actionBodyTemplate} header="Actions" style={{ width: '12rem' }}></Column>
            </DataTable>

            <Dialog
                header="Assign Project to User"
                visible={displayDialog}
                style={{ width: '30vw' }}
                onHide={() => setDisplayDialog(false)}
            >
                <div className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label style={{ fontSize: '12px', fontWeight: '600' }}>User</label>
                        <p className="font-bold" style={{ fontSize: '14px' }}>{selectedUser?.name} ({selectedUser?.email})</p>
                    </div>
                    <div className="flex flex-column gap-2">
                        <label style={{ fontSize: '12px', fontWeight: '600' }}>Select Project</label>
                        <Dropdown
                            value={selectedProject}
                            options={projects}
                            onChange={(e) => setSelectedProject(e.value)}
                            optionLabel="name"
                            placeholder="Select a Project"
                            style={{ fontSize: '12px' }}
                        />
                    </div>
                    <Button
                        label="Assign"
                        icon="pi pi-check"
                        onClick={handleAssignProject}
                        disabled={!selectedProject}
                        style={{ fontSize: '12px' }}
                    />
                </div>
            </Dialog>

            <Dialog
                header="Create New User"
                visible={displayCreateDialog}
                style={{ width: '30vw' }}
                onHide={() => setDisplayCreateDialog(false)}
            >
                <div className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label style={{ fontSize: '12px', fontWeight: '600' }}>Email (Microsoft Account) *</label>
                        <InputText
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="user@example.com"
                            style={{ fontSize: '12px' }}
                        />
                        <small className="text-500" style={{ fontSize: '11px' }}>User must have a valid Microsoft account with this email</small>
                    </div>
                    <div className="flex flex-column gap-2">
                        <label style={{ fontSize: '12px', fontWeight: '600' }}>Full Name *</label>
                        <InputText
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="John Doe"
                            style={{ fontSize: '12px' }}
                        />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label style={{ fontSize: '12px', fontWeight: '600' }}>Assign to Project (Optional)</label>
                        <Dropdown
                            value={projects.find(p => p.id === newUser.projectId) || null}
                            options={projects}
                            onChange={(e) => setNewUser({ ...newUser, projectId: e.value?.id || null })}
                            optionLabel="name"
                            placeholder="Select a Project"
                            style={{ fontSize: '12px' }}
                            showClear
                        />
                    </div>
                    <Button
                        label="Create User"
                        icon="pi pi-check"
                        onClick={handleCreateUser}
                        disabled={!newUser.email || !newUser.name}
                        style={{ fontSize: '12px' }}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default UserManagement;
