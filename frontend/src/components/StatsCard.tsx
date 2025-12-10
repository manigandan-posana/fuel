import React from "react";
import { Card } from "primereact/card";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: string;
    iconColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, iconColor = "#22c55e" }) => {
    return (
        <Card className="stats-card">
            <div className="stats-card-content">
                <div className="stats-info">
                    <span className="stats-title">{title}</span>
                    <h3 className="stats-value">{value}</h3>
                </div>
                <i className={`pi ${icon} stats-icon`} style={{ color: iconColor }}></i>
            </div>
        </Card>
    );
};

export default StatsCard;
