import React from "react";
import { Dropdown } from "primereact/dropdown";
import type { ProjectId } from "../types/";
import { PROJECTS } from "../data/constants";

interface HeaderProps {
    selectedProject: ProjectId;
    onProjectChange: (project: ProjectId) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedProject, onProjectChange }) => {
    return (
        <div className="app-header">
            <div className="header-content">
                <div className="header-title">
                    <i className="pi pi-car"></i>
                    <div>
                        <h1>Vehicle & Fuel Management</h1>
                        <p>Professional fleet tracking and fuel consumption monitoring</p>
                    </div>
                </div>
                <div className="header-project-selector">
                    <i className="pi pi-briefcase"></i>
                    <label>Project:</label>
                    <Dropdown
                        value={selectedProject}
                        options={PROJECTS.map((p) => ({
                            label: p,
                            value: p,
                        }))}
                        onChange={(e) => onProjectChange(e.value)}
                        className="project-dropdown"
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
