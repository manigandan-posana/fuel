import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Dashboard = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.name}!</p>
            <div className="grid mt-4">
                <div className="col-12 md:col-6 lg:col-3">
                    <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Role</span>
                                <div className="text-900 font-medium text-xl">{user?.role}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-user text-blue-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
