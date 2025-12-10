import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useMsal } from '@azure/msal-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store/store';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { instance } = useMsal();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const items = [
        {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            command: () => navigate('/')
        },
        {
            label: 'Vehicles',
            icon: 'pi pi-fw pi-car',
            command: () => navigate('/vehicles')
        },
        {
            label: 'Fuel Entries',
            icon: 'pi pi-fw pi-dollar',
            command: () => navigate('/fuel')
        }
    ];

    if (user?.role === 'ADMIN') {
        items.push({
            label: 'Projects',
            icon: 'pi pi-fw pi-building',
            command: () => navigate('/projects')
        });
    }

    const start = <h2 className="m-0 mr-4 text-primary">FuelApp</h2>;

    const end = (
        <div className="flex align-items-center gap-2">
            {user && (
                <div className="flex flex-column align-items-end mr-2">
                    <span className="font-bold">{user.name}</span>
                    <span className="text-xs text-500">{user.role} {user.projectName ? `- ${user.projectName}` : ''}</span>
                </div>
            )}
            <Button label="Logout" icon="pi pi-power-off" severity="danger" text onClick={() => {
                dispatch(logout());
                instance.logoutRedirect();
            }} />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-column surface-ground">
            <Menubar model={items} start={start} end={end} className="border-none border-noround shadow-2" />
            <div className="p-4 flex-grow-1">
                <div className="surface-card p-4 shadow-2 border-round h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
