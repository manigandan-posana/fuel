import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { instance } = useMsal();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/', icon: 'pi-home', label: 'Dashboard' },
        { path: '/vehicles', icon: 'pi-car', label: 'Vehicles' },
        { path: '/fuel', icon: 'pi-chart-line', label: 'Fuel Entries' },
        { path: '/today', icon: 'pi-calendar', label: "Today's Entries" },
        ...(user?.role === 'ADMIN' ? [
            { path: '/projects', icon: 'pi-building', label: 'Projects' },
            { path: '/users', icon: 'pi-users', label: 'User Management' }
        ] : [])
    ];

    const handleLogout = () => {
        dispatch(logout());
        instance.logoutRedirect();
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="app-container">
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <i className="pi pi-bolt sidebar-logo-icon"></i>
                    <h2 className="sidebar-title">FuelTrack</h2>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <i className={`pi ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            <i className="pi pi-user"></i>
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.name || 'User'}</div>
                            <div className="user-role">{user?.role || 'Guest'}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="pi pi-sign-out"></i>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="bottom-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <i className={`pi ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Mobile Header */}
            <header className="mobile-header">
                <div className="mobile-header-content">
                    <div className="mobile-logo">
                        <i className="pi pi-bolt"></i>
                        <span>FuelTrack</span>
                    </div>
                    <button onClick={handleLogout} className="mobile-logout">
                        <i className="pi pi-sign-out"></i>
                    </button>
                </div>
            </header>
        </div>
    );
};

export default Layout;
