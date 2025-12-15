import React, { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { FuelEntry, ProjectId } from "../types";

interface TodayEntriesProps {
    selectedProject: ProjectId;
    fuelEntries: FuelEntry[];
}

const TodayEntries: React.FC<TodayEntriesProps> = ({ selectedProject, fuelEntries }) => {
    const todayEntries = useMemo(() => {
        const today = new Date().toDateString();
        return fuelEntries.filter(
            (e) => e.projectId === selectedProject && e.date.toDateString() === today && e.status === "closed"
        );
    }, [fuelEntries, selectedProject]);



    const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);

    return (
        <div className="page-container">


            <DataTable
                value={todayEntries}
                dataKey="id"
                emptyMessage="No fuel entries recorded today"
                className="custom-datatable"
                stripedRows
                responsiveLayout="scroll"
                paginator
                rows={10}
            >
                <Column
                    field="vehicleName"
                    header="Vehicle"
                    sortable
                    body={(rowData: FuelEntry) => (
                        <span className="font-medium">{rowData.vehicleName}</span>
                    )}
                    style={{ minWidth: '140px' }}
                />
                <Column
                    field="fuelType"
                    header="Fuel Type"
                    body={(rowData: FuelEntry) => {
                        const color =
                            rowData.fuelType === "Petrol"
                                ? "text-green-600"
                                : rowData.fuelType === "Diesel"
                                    ? "text-orange-600"
                                    : "text-blue-600";
                        return <span className={`font-medium ${color}`}>{rowData.fuelType}</span>;
                    }}
                    sortable
                    style={{ minWidth: '100px' }}
                />
                <Column
                    field="litres"
                    header="Litres"
                    body={(rowData: FuelEntry) => (
                        <span className="font-medium">{numberTemplate(rowData.litres, 2)} L</span>
                    )}
                    sortable
                    style={{ minWidth: '80px' }}
                />
                <Column
                    field="openingKm"
                    header="Opening Km"
                    body={(rowData: FuelEntry) => <span className="text-700">{numberTemplate(rowData.openingKm, 1)}</span>}
                    sortable
                    style={{ minWidth: '100px' }}
                />
                <Column
                    field="closingKm"
                    header="Closing Km"
                    body={(rowData: FuelEntry) => <span className="text-700">{numberTemplate(rowData.closingKm, 1)}</span>}
                    sortable
                    style={{ minWidth: '100px' }}
                />
                <Column
                    field="distance"
                    header="Distance"
                    body={(rowData: FuelEntry) => (
                        <span className="font-medium text-green-600">{numberTemplate(rowData.distance, 1)} km</span>
                    )}
                    sortable
                    style={{ minWidth: '90px' }}
                />
            </DataTable>
        </div>
    );
};

export default TodayEntries;
