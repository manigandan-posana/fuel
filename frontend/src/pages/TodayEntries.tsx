import React, { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import type { FuelEntry } from "../types/";
import type { RootState, AppDispatch } from "../store/store";
import { fetchFuelEntries } from "../store/slices/fuelSlice";

const TodayEntries: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const authStatus = useSelector((state: RootState) => state.auth.status);
    const authToken = useSelector((state: RootState) => state.auth.token);
    const { list: fuelEntries } = useSelector((state: RootState) => state.fuel);

    useEffect(() => {
        // Only fetch data when authentication is complete
        if (authStatus === 'succeeded' && authToken) {
            dispatch(fetchFuelEntries());
        }
    }, [dispatch, authStatus, authToken]);

    const todayEntries = useMemo(() => {
        if (!fuelEntries || fuelEntries.length === 0) return [];
        const today = new Date().toDateString();
        return fuelEntries.filter((e) => {
            const entryDate = new Date(e.date).toDateString();
            return entryDate === today && (user?.role === 'ADMIN' || e.projectId === user?.projectId);
        });
    }, [fuelEntries, user]);

    const todayTotalDistance = useMemo(
        () => todayEntries.reduce((sum, e) => sum + e.distance, 0),
        [todayEntries]
    );

    const todayTotalLitres = useMemo(
        () => todayEntries.reduce((sum, e) => sum + e.litres, 0),
        [todayEntries]
    );

    const fuelTypeTemplate = (rowData: FuelEntry) => {
        const severity =
            rowData.fuelType === "Petrol"
                ? "success"
                : rowData.fuelType === "Diesel"
                    ? "warning"
                    : "info";
        const icon = rowData.fuelType === "Electric" ? "pi pi-bolt" : "pi pi-circle-fill";
        return (
            <Tag value={rowData.fuelType} severity={severity} icon={icon} style={{ fontSize: "11px" }} />
        );
    };

    const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);

    const photosTemplate = (rowData: FuelEntry) => {
        const hasOpening = !!rowData.openingKmPhoto;
        const hasClosing = !!rowData.closingKmPhoto;

        if (!hasOpening && !hasClosing) {
            return <span className="text-500">—</span>;
        }

        return (
            <div className="flex gap-1">
                {hasOpening && (
                    <Tag value="O" severity="info" icon="pi pi-camera" style={{ fontSize: "10px" }} />
                )}
                {hasClosing && (
                    <Tag value="C" severity="success" icon="pi pi-camera" style={{ fontSize: "10px" }} />
                )}
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Today's Entries</h2>
                    <p className="page-subtitle">Fuel entries recorded today</p>
                </div>
                <Chip
                    label={`${todayEntries.length} ${todayEntries.length === 1 ? "Entry" : "Entries"}`}
                    icon="pi pi-calendar"
                    className="today-chip"
                />
            </div>

            <div className="today-stats">
                <div className="today-stat-card">
                    <i className="pi pi-map-marker"></i>
                    <div>
                        <span className="stat-label">Total Distance</span>
                        <span className="stat-value">{todayTotalDistance.toFixed(1)} km</span>
                    </div>
                </div>
                <div className="today-stat-card">
                    <i className="pi pi-circle-fill"></i>
                    <div>
                        <span className="stat-label">Total Fuel</span>
                        <span className="stat-value">{todayTotalLitres.toFixed(1)} L</span>
                    </div>
                </div>
                <div className="today-stat-card">
                    <i className="pi pi-chart-line"></i>
                    <div>
                        <span className="stat-label">Avg Mileage</span>
                        <span className="stat-value">
                            {todayTotalLitres > 0 ? (todayTotalDistance / todayTotalLitres).toFixed(2) : "0.00"}{" "}
                            km/l
                        </span>
                    </div>
                </div>
            </div>

            <DataTable
                value={todayEntries}
                dataKey="id"
                emptyMessage="No fuel entries recorded today"
                className="custom-datatable"
                stripedRows
                responsiveLayout="scroll"
            >
                <Column
                    field="vehicleName"
                    header="Vehicle"
                    sortable
                    body={(rowData: FuelEntry) => (
                        <span className="vehicle-name">
                            <i className="pi pi-car"></i>
                            {rowData.vehicleName}
                        </span>
                    )}
                />
                <Column field="fuelType" header="Fuel Type" body={fuelTypeTemplate} sortable />
                <Column
                    field="litres"
                    header="Litres"
                    body={(rowData: FuelEntry) => (
                        <Chip label={`${numberTemplate(rowData.litres, 2)} L`} />
                    )}
                    sortable
                />
                <Column
                    field="openingKm"
                    header="Opening Km"
                    body={(rowData: FuelEntry) => numberTemplate(rowData.openingKm, 1)}
                    sortable
                />
                <Column
                    field="closingKm"
                    header="Closing Km"
                    body={(rowData: FuelEntry) => numberTemplate(rowData.closingKm, 1)}
                    sortable
                />
                <Column
                    field="distance"
                    header="Distance"
                    body={(rowData: FuelEntry) => (
                        <Tag
                            value={`${numberTemplate(rowData.distance, 1)} km`}
                            severity="info"
                            icon="pi pi-map-marker"
                            style={{ fontSize: "11px" }}
                        />
                    )}
                    sortable
                />
                <Column
                    field="mileage"
                    header="Mileage"
                    body={(rowData: FuelEntry) => (
                        <Tag
                            value={`${numberTemplate(rowData.mileage, 2)} km/l`}
                            severity="success"
                            icon="pi pi-chart-line"
                            style={{ fontSize: "11px" }}
                        />
                    )}
                    sortable
                />
                <Column header="Photos" body={photosTemplate} />
            </DataTable>
        </div>
    );
};

export default TodayEntries;
