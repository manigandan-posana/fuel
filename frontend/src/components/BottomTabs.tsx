import React from "react";

interface BottomTabsProps {
    activeMenu: string;
    onMenuChange: (menu: string) => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ activeMenu, onMenuChange }) => {
    const menuItems = [
        { id: "fuel", label: "Fuel", icon: "pi-chart-line" },
        { id: "vehicles", label: "Vehicles", icon: "pi-car" },
        { id: "today", label: "Today", icon: "pi-calendar" },
    ];

    return (
        <div className="bottom-tabs-mobile">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    className={`bottom-tab-item ${activeMenu === item.id ? "active" : ""}`}
                    onClick={() => onMenuChange(item.id)}
                >
                    <i className={`pi ${item.icon}`}></i>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default BottomTabs;
