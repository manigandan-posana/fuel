import React from "react";

interface SidebarProps {
    activeMenu: string;
    onMenuChange: (menu: string) => void;
    collapsed?: boolean;
    onToggleCollapsed?: () => void;
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeMenu,
    onMenuChange,
    collapsed = false,
    onToggleCollapsed,
    mobileOpen = false,
    onCloseMobile,
}) => {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "pi-chart-bar" },
        { id: "vehicles", label: "Vehicle", icon: "pi-car" },
        { id: "fuel", label: "Fuel", icon: "pi-chart-line" },
        { id: "today", label: "Daily Log", icon: "pi-calendar" },
        { id: "history", label: "History", icon: "pi-history" },
        { id: "suppliers", label: "Suppliers", icon: "pi-building" },
    ];

    return (
        <>
            <div
                className={`sidebar-desktop ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
                aria-expanded={!collapsed}
            >
                <div className="sidebar-header">
                    <i className="pi pi-car" aria-hidden="true"></i>
                    {!collapsed && <h2>PGC</h2>}
                    <button
                        className="sidebar-toggle"
                        aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
                        onClick={() => onToggleCollapsed && onToggleCollapsed()}
                    >
                        <i className={`pi ${collapsed ? "pi-angle-right" : "pi-angle-left"}`}></i>
                    </button>
                    {mobileOpen && (
                        <button className="sidebar-close-mobile" aria-label="Close sidebar" onClick={() => onCloseMobile && onCloseMobile()}>
                            <i className="pi pi-times"></i>
                        </button>
                    )}
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item ${activeMenu === item.id ? "active" : ""}`}
                            onClick={() => onMenuChange(item.id)}
                            title={item.label}
                        >
                            <i className={`pi ${item.icon}`} aria-hidden="true"></i>
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            {/* overlay only when mobile open */}
            {mobileOpen && <div className="sidebar-overlay" onClick={() => onCloseMobile && onCloseMobile()} />}
        </>
    );
};

export default Sidebar;
