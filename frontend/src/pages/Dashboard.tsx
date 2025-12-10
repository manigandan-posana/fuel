import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const Dashboard = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    const stats = [
        {
            title: 'Total Vehicles',
            value: '0',
            icon: 'pi-car',
            color: '#10b981',
            bgColor: '#d1fae5'
        },
        {
            title: 'Fuel Entries',
            value: '0',
            icon: 'pi-chart-line',
            color: '#3b82f6',
            bgColor: '#dbeafe'
        },
        {
            title: 'Total Cost',
            value: '$0.00',
            icon: 'pi-dollar',
            color: '#f59e0b',
            bgColor: '#fef3c7'
        },
        {
            title: 'Active Projects',
            value: '0',
            icon: 'pi-building',
            color: '#8b5cf6',
            bgColor: '#ede9fe'
        }
    ];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Welcome back, {user?.name || 'User'}! 👋</h1>
                <p className="page-subtitle">Here's what's happening with your fuel management today</p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'var(--surface)',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: stat.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <i className={`pi ${stat.icon}`} style={{ fontSize: '24px', color: stat.color }}></i>
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>
                            {stat.title}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Info Card */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px'
                    }}>
                        <i className="pi pi-user"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                            {user?.name || 'User'}
                        </h2>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', opacity: 0.9 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="pi pi-shield"></i>
                                <span>{user?.role || 'Guest'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="pi pi-envelope"></i>
                                <span>{user?.email || 'N/A'}</span>
                            </div>
                            {user?.projectName && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="pi pi-building"></i>
                                    <span>{user.projectName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Quick Actions
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    {[
                        { label: 'Add Vehicle', icon: 'pi-car', path: '/vehicles' },
                        { label: 'Add Fuel Entry', icon: 'pi-chart-line', path: '/fuel' },
                        ...(user?.role === 'ADMIN' ? [{ label: 'Add Project', icon: 'pi-building', path: '/projects' }] : [])
                    ].map((action, index) => (
                        <button
                            key={index}
                            onClick={() => window.location.href = action.path}
                            style={{
                                background: 'var(--surface)',
                                border: '2px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: 'var(--text-primary)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                                e.currentTarget.style.background = '#f0fdf4';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.background = 'var(--surface)';
                            }}
                        >
                            <i className={`pi ${action.icon}`} style={{ fontSize: '20px', color: 'var(--primary-color)' }}></i>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
