import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import BottomTabs from "./components/BottomTabs";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import VehicleManagement from "./pages/VehicleManagement";
import VehicleDetails from "./pages/VehicleDetails";
import FuelManagement from "./pages/FuelManagement";
import DailyLog from "./pages/DailyLog";
import SupplierManagement from "./pages/SupplierManagement";
import type { Vehicle, FuelEntry, Supplier, ProjectId, DailyLogEntry } from "./types";

import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";
import { INITIAL_VEHICLES, INITIAL_FUEL_ENTRIES, INITIAL_SUPPLIERS, INITIAL_DAILY_LOGS } from "./data/constants";

const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectId>("Project A");

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("vehicles");
    if (saved) {
      return JSON.parse(saved).map((v: any) => ({
        ...v,
        startDate: v.startDate ? new Date(v.startDate) : undefined,
        endDate: v.endDate ? new Date(v.endDate) : undefined,
        statusHistory: v.statusHistory?.map((h: any) => ({
          ...h,
          startDate: new Date(h.startDate),
          endDate: h.endDate ? new Date(h.endDate) : undefined
        }))
      }));
    }
    return INITIAL_VEHICLES;
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem("fuelEntries");
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, date: new Date(e.date) })) : INITIAL_FUEL_ENTRIES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem("suppliers");
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>(() => {
    const saved = localStorage.getItem("dailyLogs");
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, date: new Date(e.date) })) : INITIAL_DAILY_LOGS;
  });
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
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

  const handleAddDailyLog = (log: Omit<DailyLogEntry, "id">) => {
    const newLog: DailyLogEntry = {
      id: `dl${Date.now()}`,
      ...log,
    };
    setDailyLogs((prev) => [newLog, ...prev]);
  };

  const handleCloseDailyLog = (id: string, closingKm: number, closingKmPhoto?: string) => {
    setDailyLogs((prev) =>
      prev.map((log) =>
        log.id === id
          ? {
            ...log,
            closingKm,
            distance: closingKm - log.openingKm,
            status: "closed" as const,
            closingKmPhoto,
          }
          : log
      )
    );
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

  React.useEffect(() => {
    localStorage.setItem("dailyLogs", JSON.stringify(dailyLogs));
  }, [dailyLogs]);

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
        if (selectedVehicle) {
          return (
            <VehicleDetails
              vehicle={selectedVehicle}
              fuelEntries={fuelEntries}
              onBack={() => setSelectedVehicle(null)}
            />
          );
        }
        return (
          <VehicleManagement
            selectedProject={selectedProject}
            vehicles={vehicles}
            fuelEntries={fuelEntries}
            onAddVehicle={handleAddVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onViewVehicle={(vehicle) => setSelectedVehicle(vehicle)}
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
        return (
          <DailyLog
            selectedProject={selectedProject}
            vehicles={vehicles}
            dailyLogs={dailyLogs}
            onAddDailyLog={handleAddDailyLog}
            onCloseDailyLog={handleCloseDailyLog}
          />
        );
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

  const getPageIcon = (menu: string) => {
    switch (menu) {
      case "dashboard": return "pi-chart-bar";
      case "vehicles": return "pi-car";
      case "fuel": return "pi-chart-line";
      case "suppliers": return "pi-building";
      case "today": return "pi-calendar";
      default: return "pi-chart-bar";
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
          icon={getPageIcon(activeMenu)}
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
