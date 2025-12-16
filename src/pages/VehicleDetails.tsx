import React, { useMemo } from "react";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import type { Vehicle, FuelEntry } from "../types";

interface VehicleDetailsProps {
    vehicle: Vehicle;
    fuelEntries: FuelEntry[];
    onBack: () => void;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle, fuelEntries, onBack }) => {
    const vehicleFuelEntries = useMemo(() => {
        return fuelEntries
            .filter((e) => e.vehicleId === vehicle.id)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [fuelEntries, vehicle.id]);

    const vehicleStats = useMemo(() => {
        const closedEntries = vehicleFuelEntries.filter((e) => e.status === "closed");
        const totalKm = closedEntries.reduce((sum, e) => sum + (e.distance || 0), 0);
        const totalLitres = vehicleFuelEntries.reduce((sum, e) => sum + (e.litres || 0), 0);
        const totalCost = vehicleFuelEntries.reduce((sum, e) => sum + (e.totalCost || 0), 0);
        const avgMileage = totalLitres > 0 ? totalKm / totalLitres : 0;

        return { totalKm, totalLitres, totalCost, avgMileage, totalEntries: vehicleFuelEntries.length };
    }, [vehicleFuelEntries]);

    const dateTemplate = (rowData: FuelEntry) => rowData.date.toLocaleDateString();
    const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);
    const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    return (
        <div className="vd-page">
            {/* Compact Header + Summary */}
            <div className="vd-hero">
                <div className="vd-hero-top">
                    <Button
                        icon="pi pi-arrow-left"
                        rounded
                        text
                        onClick={onBack}
                        tooltip="Back to Vehicles"
                        className="vd-back"
                    />
                    <div className="vd-title">
                        <div className="vd-name">{vehicle.vehicleName}</div>
                        <div className="vd-sub">{vehicle.vehicleNumber}</div>
                    </div>

                    <span className="vd-badge">{vehicle.status}</span>
                </div>

                <div className="vd-summary">
                    {/* Vehicle meta (compact key-values) */}
                    <div className="vd-meta">
                        <div className="vd-kv">
                            <div className="k">Type</div>
                            <div className="v">{vehicle.vehicleType}</div>
                        </div>
                        <div className="vd-kv">
                            <div className="k">Fuel Type</div>
                            <div className="v">{vehicle.fuelType}</div>
                        </div>
                        <div className="vd-kv">
                            <div className="k">Start Date</div>
                            <div className="v">{vehicle.startDate ? vehicle.startDate.toLocaleDateString() : "N/A"}</div>
                        </div>
                        <div className="vd-kv">
                            <div className="k">End Date</div>
                            <div className="v">{vehicle.endDate ? vehicle.endDate.toLocaleDateString() : "—"}</div>
                        </div>
                    </div>

                    {/* KPI chips (tight + attractive) */}
                    <div className="vd-kpis">
                        <div className="vd-kpi">
                            <i className="pi pi-map-marker vd-ico" />
                            <div className="vd-kpi-txt">
                                <div className="k">Total Distance</div>
                                <div className="v">{numberTemplate(vehicleStats.totalKm, 1)} km</div>
                            </div>
                        </div>

                        <div className="vd-kpi">
                            <i className="pi pi-bolt vd-ico" />
                            <div className="vd-kpi-txt">
                                <div className="k">Total Fuel</div>
                                <div className="v">{numberTemplate(vehicleStats.totalLitres, 1)} L</div>
                            </div>
                        </div>

                        <div className="vd-kpi">
                            <i className="pi pi-indian-rupee vd-ico" />
                            <div className="vd-kpi-txt">
                                <div className="k">Total Cost</div>
                                <div className="v">{formatCurrency(vehicleStats.totalCost)}</div>
                            </div>
                        </div>

                        <div className="vd-kpi">
                            <i className="pi pi-gauge vd-ico" />
                            <div className="vd-kpi-txt">
                                <div className="k">Avg Mileage</div>
                                <div className="v">{numberTemplate(vehicleStats.avgMileage, 2)} km/l</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Card className="vd-shell">
                <TabView className="vd-tabview">
                    <TabPanel header="Fuel Entries" leftIcon="pi pi-chart-line">
                        <div className="vd-panel">
                            <DataTable
                                value={vehicleFuelEntries}
                                paginator
                                rows={10}
                                dataKey="id"
                                emptyMessage="No fuel entries found for this vehicle"
                                className="p-datatable-sm vd-table"
                                stripedRows
                                responsiveLayout="scroll"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                rowsPerPageOptions={[10, 25, 50]}
                            >
                                <Column field="date" header="Date" body={dateTemplate} sortable style={{ minWidth: "110px" }} />
                                <Column
                                    field="supplierName"
                                    header="Supplier"
                                    body={(rowData: FuelEntry) => <span className="vd-td-strong">{rowData.supplierName}</span>}
                                    sortable
                                    style={{ minWidth: "150px" }}
                                />
                                <Column
                                    field="litres"
                                    header="Litres"
                                    body={(rowData: FuelEntry) => <span className="vd-td-num">{numberTemplate(rowData.litres, 2)} L</span>}
                                    sortable
                                    style={{ minWidth: "95px" }}
                                />
                                <Column
                                    field="pricePerLitre"
                                    header="Price/L"
                                    body={(rowData: FuelEntry) =>
                                        <span>{rowData.pricePerLitre ? "₹" + numberTemplate(rowData.pricePerLitre, 2) : "—"}</span>
                                    }
                                    sortable
                                    style={{ minWidth: "95px" }}
                                />
                                <Column
                                    field="totalCost"
                                    header="Total Cost"
                                    body={(rowData: FuelEntry) => (
                                        <span className="vd-td-money">{formatCurrency(rowData.totalCost || 0)}</span>
                                    )}
                                    sortable
                                    style={{ minWidth: "120px" }}
                                />
                                <Column
                                    field="openingKm"
                                    header="Opening"
                                    body={(rowData: FuelEntry) => <span>{numberTemplate(rowData.openingKm, 1)}</span>}
                                    sortable
                                    style={{ minWidth: "95px" }}
                                />
                                <Column
                                    field="closingKm"
                                    header="Closing"
                                    body={(rowData: FuelEntry) =>
                                        rowData.status === "closed" ? (
                                            <span>{numberTemplate(rowData.closingKm, 1)}</span>
                                        ) : (
                                            <span className="vd-muted">—</span>
                                        )
                                    }
                                    sortable
                                    style={{ minWidth: "95px" }}
                                />
                                <Column
                                    field="distance"
                                    header="Distance"
                                    body={(rowData: FuelEntry) =>
                                        rowData.status === "closed" ? (
                                            <span className="vd-td-good">{numberTemplate(rowData.distance, 1)} km</span>
                                        ) : (
                                            <span className="vd-muted">—</span>
                                        )
                                    }
                                    sortable
                                    style={{ minWidth: "105px" }}
                                />
                                <Column
                                    field="mileage"
                                    header="Mileage"
                                    body={(rowData: FuelEntry) =>
                                        rowData.status === "closed" ? (
                                            <span className="vd-td-good">{numberTemplate(rowData.mileage, 2)} km/l</span>
                                        ) : (
                                            <span className="vd-muted">—</span>
                                        )
                                    }
                                    sortable
                                    style={{ minWidth: "105px" }}
                                />
                                <Column
                                    header="Status"
                                    body={(rowData: FuelEntry) => (
                                        <span className={`vd-pill ${rowData.status === "closed" ? "ok" : "warn"}`}>
                                            {rowData.status === "closed" ? "Closed" : "Open"}
                                        </span>
                                    )}
                                    style={{ minWidth: "95px" }}
                                />
                            </DataTable>
                        </div>
                    </TabPanel>

                    <TabPanel header="Vehicle History" leftIcon="pi pi-history">
                        <div className="vd-panel vd-history">
                            {vehicle.statusHistory && vehicle.statusHistory.length > 0 ? (
                                <DataTable
                                    value={vehicle.statusHistory.map((h, idx) => ({
                                        ...h,
                                        periodNumber: vehicle.statusHistory!.length - idx,
                                    }))}
                                    dataKey="periodNumber"
                                    className="p-datatable-sm vd-table"
                                    stripedRows
                                    responsiveLayout="scroll"
                                >
                                    <Column
                                        header="Period"
                                        body={(rowData) => (
                                            <span className="vd-mini">#{rowData.periodNumber}</span>
                                        )}
                                        style={{ width: "80px" }}
                                    />
                                    <Column
                                        header="Status"
                                        body={(rowData) => (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <i
                                                    className={`pi ${rowData.status === "Active" ? "pi-check-circle" : "pi-times-circle"}`}
                                                    style={{ color: rowData.status === "Active" ? "#10b981" : "#ef4444" }}
                                                />
                                                <span className="vd-td-strong">{rowData.status}</span>
                                            </div>
                                        )}
                                        style={{ minWidth: "120px" }}
                                    />
                                    <Column
                                        header="Start Date"
                                        body={(rowData) => (
                                            <span className="vd-td-num">{rowData.startDate.toLocaleDateString()}</span>
                                        )}
                                        sortable
                                        style={{ minWidth: "120px" }}
                                    />
                                    <Column
                                        header="End Date"
                                        body={(rowData) => (
                                            rowData.endDate ? (
                                                <span className="vd-td-num">{rowData.endDate.toLocaleDateString()}</span>
                                            ) : (
                                                <span className="vd-ongoing">Ongoing</span>
                                            )
                                        )}
                                        sortable
                                        style={{ minWidth: "120px" }}
                                    />
                                    <Column
                                        header="Duration"
                                        body={(rowData) => {
                                            const start = new Date(rowData.startDate);
                                            start.setHours(0, 0, 0, 0);

                                            const end = rowData.endDate ? new Date(rowData.endDate) : new Date();
                                            end.setHours(0, 0, 0, 0);

                                            const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                            return <span className="vd-td-num">{days} {days === 1 ? 'day' : 'days'}</span>;
                                        }}
                                        style={{ minWidth: "100px" }}
                                    />
                                    <Column
                                        header="Reason"
                                        body={(rowData) => (
                                            <span style={{ fontSize: "12px" }}>{rowData.reason || "—"}</span>
                                        )}
                                        style={{ minWidth: "200px" }}
                                    />
                                </DataTable>
                            ) : (
                                <div className="vd-empty">
                                    <i className="pi pi-info-circle" />
                                    <div className="t">No history available for this vehicle</div>
                                </div>
                            )}
                        </div>
                    </TabPanel>
                </TabView>
            </Card>

            {/* Scoped styles */}
            <style>{`
        .vd-page{display:flex;flex-direction:column;gap:10px}
        .vd-hero{
          background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
          border-radius: 12px;
          padding: 10px;
          color: #fff;
          border: 1px solid rgba(255,255,255,.22);
        }
        .vd-hero-top{display:flex;align-items:center;gap:8px}
        .vd-back{color:#fff}
        .vd-title{flex:1;min-width:0}
        .vd-name{font-size:14px;font-weight:800;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .vd-sub{font-size:11px;opacity:.9;margin-top:2px}
        .vd-badge{
          font-size:11px;font-weight:700;
          padding:4px 10px;border-radius:999px;
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.22);
          backdrop-filter: blur(6px);
        }

        .vd-summary{
          margin-top:10px;
          display:grid;
          grid-template-columns: 1.05fr 1.95fr;
          gap:10px;
        }
        @media (max-width: 900px){
          .vd-summary{grid-template-columns: 1fr; }
        }

        .vd-meta{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:8px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 10px;
          padding: 8px;
        }
        .vd-kv .k{font-size:10px;opacity:.85}
        .vd-kv .v{font-size:12px;font-weight:800;margin-top:2px}

        .vd-kpis{
          display:grid;
          grid-template-columns: repeat(4, 1fr);
          gap:8px;
        }
        @media (max-width: 900px){
          .vd-kpis{grid-template-columns: repeat(2, 1fr);}
        }
        .vd-kpi{
          display:flex;align-items:center;gap:8px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 10px;
          padding: 8px;
        }
        .vd-ico{font-size:16px;opacity:.95}
        .vd-kpi-txt .k{font-size:10px;opacity:.85}
        .vd-kpi-txt .v{font-size:12px;font-weight:900;margin-top:2px}

        .vd-shell{border-radius:12px;overflow:hidden}
        .vd-tabview{border-radius:12px}
        /* Pro Tab look */
        .vd-tabview .p-tabview-nav{
          padding:8px;
          gap:8px;
          border:0;
          background: var(--surface-0);
        }
        .vd-tabview .p-tabview-nav li .p-tabview-nav-link{
          border:1px solid var(--surface-200);
          border-radius:999px;
          padding:6px 10px;
          font-size:12px;
          font-weight:800;
          background: var(--surface-0);
          transition: all .15s ease;
          box-shadow: 0 1px 0 rgba(0,0,0,.03);
        }
        .vd-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link{
          border-color: var(--primary-color);
          box-shadow: 0 4px 14px rgba(0,0,0,.08);
        }
        .vd-tabview .p-tabview-panels{padding:0}
        .vd-panel{padding:10px}

        /* Compact table */
        .vd-table .p-datatable-header{padding:8px 10px}
        .vd-table .p-datatable-thead > tr > th{padding:8px 10px;font-size:12px;white-space:nowrap}
        .vd-table .p-datatable-tbody > tr > td{padding:7px 10px;font-size:12px}
        .vd-td-strong{font-weight:700}
        .vd-td-num{font-weight:800}
        .vd-td-money{font-weight:900}
        .vd-td-good{font-weight:900}
        .vd-muted{opacity:.65}

        .vd-pill{
          display:inline-flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:900;
          padding:3px 10px;border-radius:999px;
          border:1px solid var(--surface-200);
          background: var(--surface-0);
        }
        .vd-pill.ok{border-color: rgba(16,185,129,.35)}
        .vd-pill.warn{border-color: rgba(245,158,11,.35)}

        /* History compact */
        .vd-history{padding:10px}
        .vd-mini{
          font-size:10px;font-weight:800;
          padding:3px 8px;border-radius:999px;
          background: var(--surface-50);
          border: 1px solid var(--surface-200);
          color: var(--text-color-secondary);
        }
        .vd-ongoing{color:#10b981;font-weight:900}

        .vd-empty{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:8px;
          padding:18px;
          border-radius:12px;
          background: var(--surface-50);
          border: 1px dashed var(--surface-200);
          color: var(--text-color-secondary);
        }
        .vd-empty i{font-size:28px;opacity:.7}
        .vd-empty .t{font-size:12px;font-weight:800}
      `}</style>
        </div>
    );
};

export default VehicleDetails;
