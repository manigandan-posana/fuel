import React from "react";
import { Dropdown } from "primereact/dropdown";
import type { ProjectId } from "../types";
import { PROJECTS } from "../data/constants";

interface HeaderProps {
    title: string;
    icon: string;
    selectedProject: ProjectId;
    onProjectChange: (project: ProjectId) => void;
    onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, icon, selectedProject, onProjectChange, onToggleSidebar }) => {
    return (
        <div className="app-header">
            <div className="header-content">
                <div className="header-left">
                    <button className="nav-toggle" aria-label="Toggle navigation" onClick={() => onToggleSidebar && onToggleSidebar()}>
                        <i className="pi pi-bars"></i>
                    </button>

                    <div className="header-title">
                        <i className={`pi ${icon}`}></i>
                        <div>
                            <h1>{title}</h1>
                        </div>
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
