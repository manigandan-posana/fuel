import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import BottomTabs from "./components/BottomTabs";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import VehicleManagement from "./pages/VehicleManagement";
import FuelManagement from "./pages/FuelManagement";
import TodayEntries from "./pages/TodayEntries";
import SupplierManagement from "./pages/SupplierManagement";
import type { Vehicle, FuelEntry, Supplier, ProjectId } from "./types";

import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";
import { INITIAL_VEHICLES, INITIAL_FUEL_ENTRIES, INITIAL_SUPPLIERS } from "./data/constants";

const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectId>("Project A");

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("vehicles");
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem("fuelEntries");
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, date: new Date(e.date) })) : INITIAL_FUEL_ENTRIES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem("suppliers");
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const handleAddVehicle = (vehicle: Omit<Vehicle, "id">) => {
    const newVehicle: Vehicle = {
      id: `v${Date.now()}`,
      ...vehicle,
    };
    setVehicles((prev) => [...prev, newVehicle]);
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, ...updates } : v));
  };

  const handleAddFuelEntry = (entry: Omit<FuelEntry, "id">) => {
    const newEntry: FuelEntry = {
      id: `f${Date.now()}`,
      ...entry,
    };
    setFuelEntries((prev) => [newEntry, ...prev]);
  };

  const handleDeleteFuelEntry = (id: string) => {
    setFuelEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddSupplier = (supplier: Omit<Supplier, "id">) => {
    const newSupplier: Supplier = {
      id: `s${Date.now()}`,
      ...supplier,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleProjectChange = (project: ProjectId) => {
    setSelectedProject(project);
  };

  // Persistence effects
  React.useEffect(() => {
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  React.useEffect(() => {
    localStorage.setItem("fuelEntries", JSON.stringify(fuelEntries));
  }, [fuelEntries]);

  React.useEffect(() => {
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  const renderPage = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <Dashboard
            selectedProject={selectedProject}
            vehicles={vehicles}
            fuelEntries={fuelEntries}
          />
        );
      case "vehicles":
        return (
          <VehicleManagement
            selectedProject={selectedProject}
            vehicles={vehicles}
            fuelEntries={fuelEntries}
            onAddVehicle={handleAddVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateVehicle={handleUpdateVehicle}
          />
        );
      case "fuel":
        return (
          <FuelManagement
            selectedProject={selectedProject}
            vehicles={vehicles}
            fuelEntries={fuelEntries}
            suppliers={suppliers}
            onAddFuelEntry={handleAddFuelEntry}
            onDeleteFuelEntry={handleDeleteFuelEntry}
          />
        );
      case "suppliers":
        return (
          <SupplierManagement
            selectedProject={selectedProject}
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        );
      case "today":
        return <TodayEntries selectedProject={selectedProject} fuelEntries={fuelEntries} />;
      default:
        return (
          <Dashboard
            selectedProject={selectedProject}
            vehicles={vehicles}
            fuelEntries={fuelEntries}
          />
        );
    }
  };

  const getPageTitle = (menu: string) => {
    switch (menu) {
      case "dashboard": return "Dashboard";
      case "vehicles": return "Vehicle Management";
      case "fuel": return "Fuel Management";
      case "suppliers": return "Fuel Suppliers";
      case "today": return "Daily Log Sheet";
      default: return "Dashboard";
    }
  };

  return (
    <div className="app-container">
      <Toaster position="top-right" />

      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((s) => !s)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <Header
          title={getPageTitle(activeMenu)}
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
          onToggleSidebar={() => setMobileSidebarOpen((s) => !s)}
        />
        <div className="page-content">{renderPage()}</div>
      </div>

      <BottomTabs activeMenu={activeMenu} onMenuChange={setActiveMenu} />
    </div>
  );
};

export default App;
