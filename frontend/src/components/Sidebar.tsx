import React from "react";

interface SidebarProps {
    activeMenu: string;
    onMenuChange: (menu: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange }) => {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "pi-th-large" },
        { id: "vehicles", label: "Vehicle Management", icon: "pi-car" },
        { id: "fuel", label: "Fuel Management", icon: "pi-chart-line" },
        { id: "today", label: "Today's Entries", icon: "pi-calendar" },
    ];

    return (
        <div className="sidebar-desktop">
            <div className="sidebar-header">
                <i className="pi pi-car"></i>
                <h2>Fleet Manager</h2>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${activeMenu === item.id ? "active" : ""}`}
                        onClick={() => onMenuChange(item.id)}
                    >
                        <i className={`pi ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
