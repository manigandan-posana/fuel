import React, { useMemo, useState } from "react";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Chart } from "primereact/chart";
import type { Vehicle, FuelEntry, DailyLogEntry } from "../types";

interface VehicleDetailsProps {
  vehicle: Vehicle;
  fuelEntries: FuelEntry[];
  dailyLogs: DailyLogEntry[];
  onBack: () => void;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  fuelEntries,
  dailyLogs,
  onBack,
}) => {
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const vehicleFuelEntries = useMemo(() => {
    return fuelEntries
      .filter((e) => e.vehicleId === vehicle.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [fuelEntries, vehicle.id]);

  // Calculate stats from both fuel entries and daily logs
  const vehicleStats = useMemo(() => {
    // Fuel Entry Stats
    const closedFuelEntries = vehicleFuelEntries.filter((e) => e.status === "closed");
    const fuelTotalKm = closedFuelEntries.reduce((sum, e) => sum + (e.distance || 0), 0);
    const totalLitres = vehicleFuelEntries.reduce((sum, e) => sum + (e.litres || 0), 0);
    const totalCost = vehicleFuelEntries.reduce((sum, e) => sum + (e.totalCost || 0), 0);
    const fuelAvgMileage = totalLitres > 0 ? fuelTotalKm / totalLitres : 0;
    const avgCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;
    const avgCostPerKm = fuelTotalKm > 0 ? totalCost / fuelTotalKm : 0;

    // Daily Log Stats
    const vehicleDailyLogs = dailyLogs.filter(
      (log) => log.vehicleId === vehicle.id && log.status === "closed"
    );
    const dailyLogTotalKm = vehicleDailyLogs.reduce((sum, log) => sum + (log.distance || 0), 0);
    const dailyLogAvgMileage = totalLitres > 0 ? dailyLogTotalKm / totalLitres : 0;

    // Calculate differences
    const kmDifference = dailyLogTotalKm - fuelTotalKm;
    const mileageDifference = dailyLogAvgMileage - fuelAvgMileage;

    // Calculate Rent Cost
    let totalRentCost = 0;
    if (vehicle.rentPrice && vehicle.vehicleType.includes("Rent")) {
      const startDate = vehicle.startDate || new Date();
      const endDate = vehicle.endDate || new Date();
      const daysDiff =
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (vehicle.rentPeriod === "monthly") {
        const months = Math.ceil(daysDiff / 30);
        totalRentCost = vehicle.rentPrice * months;
      } else if (vehicle.rentPeriod === "daily") {
        totalRentCost = vehicle.rentPrice * daysDiff;
      } else if (vehicle.rentPeriod === "hourly") {
        const hours = daysDiff * 24;
        totalRentCost = vehicle.rentPrice * hours;
      }
    }

    return {
      // Fuel Entry Stats
      fuelTotalKm,
      totalLitres,
      totalCost,
      fuelAvgMileage,
      avgCostPerLitre,
      avgCostPerKm,
      // Daily Log Stats
      dailyLogTotalKm,
      dailyLogAvgMileage,
      // Differences
      kmDifference,
      mileageDifference,
      // Rent Cost
      totalRentCost,
      totalEntries: vehicleFuelEntries.length,
    };
  }, [vehicleFuelEntries, dailyLogs, vehicle]);

  // Filter for Daily Details tab
  const filteredDailyData = useMemo(() => {
    let filtered = vehicleFuelEntries.filter((e) => e.status === "closed");

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((e) => e.date >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => e.date <= to);
    }

    // Group by date
    const grouped = filtered.reduce((acc, entry) => {
      const dateKey = entry.date.toLocaleDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: entry.date,
          distance: 0,
          litres: 0,
          cost: 0,
          count: 0,
        };
      }
      acc[dateKey].distance += entry.distance || 0;
      acc[dateKey].litres += entry.litres || 0;
      acc[dateKey].cost += entry.totalCost || 0;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { date: Date; distance: number; litres: number; cost: number; count: number }>);

    return Object.values(grouped).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [vehicleFuelEntries, dateFrom, dateTo]);

  // Chart data for daily analysis
  const chartData = useMemo(() => {
    const sortedData = [...filteredDailyData].reverse();

    return {
      labels: sortedData.map((d) =>
        d.date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      ),
      datasets: [
        {
          label: "Distance (km)",
          data: sortedData.map((d) => d.distance),
          borderColor: "#1a73e8",
          backgroundColor: "rgba(26, 115, 232, 0.08)",
          tension: 0.35,
        },
      ],
    };
  }, [filteredDailyData]);

  const fuelChartData = useMemo(() => {
    const sortedData = [...filteredDailyData].reverse();

    return {
      labels: sortedData.map((d) =>
        d.date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      ),
      datasets: [
        {
          label: "Fuel (Quantity)",
          data: sortedData.map((d) => d.litres),
          borderColor: "#188038",
          backgroundColor: "rgba(24, 128, 56, 0.08)",
          tension: 0.35,
        },
      ],
    };
  }, [filteredDailyData]);

  const costChartData = useMemo(() => {
    const sortedData = [...filteredDailyData].reverse();

    return {
      labels: sortedData.map((d) =>
        d.date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      ),
      datasets: [
        {
          label: "Cost (₹)",
          data: sortedData.map((d) => d.cost),
          borderColor: "#ea8600",
          backgroundColor: "rgba(234, 134, 0, 0.08)",
          tension: 0.35,
        },
      ],
    };
  }, [filteredDailyData]);

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 11 } },
        grid: { color: "rgba(0,0,0,.06)" },
      },
      x: {
        ticks: { font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  const dailyStats = useMemo(() => {
    const totalDistance = filteredDailyData.reduce((sum, d) => sum + d.distance, 0);
    const totalFuel = filteredDailyData.reduce((sum, d) => sum + d.litres, 0);
    const totalCost = filteredDailyData.reduce((sum, d) => sum + d.cost, 0);

    return { totalDistance, totalFuel, totalCost };
  }, [filteredDailyData]);

  const dateTemplate = (rowData: FuelEntry) => rowData.date.toLocaleDateString();
  const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);
  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="vd-page">
      {/* Clean Header + Summary (no gradients) */}
      <div className="vd-hero">
        <div className="vd-hero-top">
          <Button icon="pi pi-arrow-left" rounded text onClick={onBack} className="vd-back" />

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
              <div className="v">
                {vehicle.startDate ? vehicle.startDate.toLocaleDateString() : "N/A"}
              </div>
            </div>
            <div className="vd-kv">
              <div className="k">End Date</div>
              <div className="v">{vehicle.endDate ? vehicle.endDate.toLocaleDateString() : "—"}</div>
            </div>
            {vehicle.rentPrice && vehicle.vehicleType.includes("Rent") && (
              <>
                <div className="vd-kv">
                  <div className="k">Rent Price</div>
                  <div className="v">₹{vehicle.rentPrice.toLocaleString("en-IN")}</div>
                </div>
                <div className="vd-kv">
                  <div className="k">Rent Period</div>
                  <div className="v">
                    {vehicle.rentPeriod === "monthly"
                      ? "Monthly"
                      : vehicle.rentPeriod === "daily"
                      ? "Daily"
                      : "Hourly"}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* KPI chips (clean + professional) */}
          <div className="vd-kpis">
            {/* Row 1: Fuel Entry Stats */}
            <div className="vd-kpi">
              <i className="pi pi-map-marker vd-ico" />
              <div className="vd-kpi-txt">
                <div className="k">Fuel Entry Km</div>
                <div className="v">{numberTemplate(vehicleStats.fuelTotalKm, 1)} km</div>
              </div>
            </div>

            <div className="vd-kpi">
              <i className="pi pi-gauge vd-ico" />
              <div className="vd-kpi-txt">
                <div className="k">Fuel Entry Mileage</div>
                <div className="v">{numberTemplate(vehicleStats.fuelAvgMileage, 2)} km/l</div>
              </div>
            </div>

            <div className="vd-kpi">
              <i className="pi pi-bolt vd-ico" />
              <div className="vd-kpi-txt">
                <div className="k">Total Quantity</div>
                <div className="v">{numberTemplate(vehicleStats.totalLitres, 1)} L</div>
              </div>
            </div>

            <div className="vd-kpi">
              <i className="pi pi-indian-rupee vd-ico" />
              <div className="vd-kpi-txt">
                <div className="k">Total Fuel Cost</div>
                <div className="v">{formatCurrency(vehicleStats.totalCost)}</div>
              </div>
            </div>

            {/* Row 2: Daily Log Stats */}
            <div className="vd-kpi">
              <i className="pi pi-calendar vd-ico" />
              <div className="vd-kpi-txt">
                <div className="k">Daily Log Km</div>
                <div className="v">{numberTemplate(vehicleStats.dailyLogTotalKm, 1)} km</div>
              </div>
            </div>

            <div className="vd-kpi">
              <i className="pi pi-chart-line vd-ico" />
              <div className="vd-kpi-txt">
                <div className="k">Daily Log Mileage</div>
                <div className="v">{numberTemplate(vehicleStats.dailyLogAvgMileage, 2)} km/l</div>
              </div>
            </div>

            <div className="vd-kpi">
              <i className="pi pi-dollar vd-ico" />
              <div className="vd-kpi-txt">
                <div className="k">Avg Cost/Unit</div>
                <div className="v">{formatCurrency(vehicleStats.avgCostPerLitre)}</div>
              </div>
            </div>

            <div className="vd-kpi">
              <i className="pi pi-calculator vd-ico" />
              <div className="vd-kpi-txt">
                <div className="k">Avg Cost/Km</div>
                <div className="v">{formatCurrency(vehicleStats.avgCostPerKm)}</div>
              </div>
            </div>

            {/* Row 3: Rent Cost & Comparisons */}
            {vehicleStats.totalRentCost > 0 && (
              <div
                className="vd-kpi"
                style={{
                  background: "var(--surface-50)",
                  border: "1px solid var(--surface-200)",
                }}
              >
                <i className="pi pi-money-bill vd-ico" />
                <div className="vd-kpi-txt">
                  <div className="k">Total Rent Cost</div>
                  <div className="v">{formatCurrency(vehicleStats.totalRentCost)}</div>
                </div>
              </div>
            )}

            {vehicleStats.totalRentCost > 0 && (
              <div
                className="vd-kpi"
                style={{
                  background: "var(--surface-50)",
                  border: "1px solid var(--surface-200)",
                }}
              >
                <i className="pi pi-chart-bar vd-ico" />
                <div className="vd-kpi-txt">
                  <div className="k">Total Cost (Rent+Fuel)</div>
                  <div className="v">{formatCurrency(vehicleStats.totalRentCost + vehicleStats.totalCost)}</div>
                </div>
              </div>
            )}

            <div className={`vd-kpi ${vehicleStats.kmDifference !== 0 ? "vd-kpi-alert" : ""}`}>
              <i className={`pi ${vehicleStats.kmDifference >= 0 ? "pi-arrow-up" : "pi-arrow-down"} vd-ico`} />
              <div className="vd-kpi-txt">
                <div className="k">Km Difference</div>
                <div className="v">
                  {vehicleStats.kmDifference >= 0 ? "+" : ""}
                  {numberTemplate(vehicleStats.kmDifference, 1)} km
                </div>
              </div>
            </div>

            <div className={`vd-kpi ${vehicleStats.mileageDifference !== 0 ? "vd-kpi-alert" : ""}`}>
              <i className={`pi ${vehicleStats.mileageDifference >= 0 ? "pi-arrow-up" : "pi-arrow-down"} vd-ico`} />
              <div className="vd-kpi-txt">
                <div className="k">Mileage Difference</div>
                <div className="v">
                  {vehicleStats.mileageDifference >= 0 ? "+" : ""}
                  {numberTemplate(vehicleStats.mileageDifference, 2)} km/l
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="vd-shell">
        <TabView className="vd-tabview">
          <TabPanel header="Fuel Entries">
            <div className="vd-panel">
              <DataTable
                value={vehicleFuelEntries}
                paginator
                rows={10}
                dataKey="id"
                emptyMessage="No fuel entries found for this vehicle"
                className="p-datatable-sm vd-table"
                stripedRows
                sortIcon={() => null}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]}
              >
                <Column field="date" header="Date" body={dateTemplate} style={{ width: "90px" }} />
                <Column
                  field="supplierName"
                  header="Supplier"
                  body={(rowData: FuelEntry) => (
                    <span className="vd-td-strong">{rowData.supplierName}</span>
                  )}
                  style={{ width: "120px" }}
                />
                <Column
                  field="litres"
                  header="Quantity"
                  body={(rowData: FuelEntry) => <span>{numberTemplate(rowData.litres, 2)} L</span>}
                  style={{ width: "80px" }}
                />
                <Column
                  field="pricePerLitre"
                  header="Unit Price"
                  body={(rowData: FuelEntry) => (
                    <span>{rowData.pricePerLitre ? "₹" + numberTemplate(rowData.pricePerLitre, 2) : "—"}</span>
                  )}
                  style={{ width: "80px" }}
                />
                <Column
                  field="totalCost"
                  header="Total Cost"
                  body={(rowData: FuelEntry) => (
                    <span className="vd-td-money">{formatCurrency(rowData.totalCost || 0)}</span>
                  )}
                  style={{ width: "100px" }}
                />
                <Column
                  field="openingKm"
                  header="Opening"
                  body={(rowData: FuelEntry) => <span>{numberTemplate(rowData.openingKm, 1)}</span>}
                  style={{ width: "75px" }}
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
                  style={{ width: "75px" }}
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
                  style={{ width: "80px" }}
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
                  style={{ width: "75px" }}
                />
                <Column
                  header="Status"
                  body={(rowData: FuelEntry) => (
                    <span className={`vd-pill ${rowData.status === "closed" ? "ok" : "warn"}`}>
                      {rowData.status === "closed" ? "Closed" : "Open"}
                    </span>
                  )}
                  style={{ width: "80px", textAlign: "center" }}
                />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Daily Details">
            <div className="vd-panel">
              {/* Date Filters */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  padding: "12px",
                  background: "var(--surface-0)",
                  borderRadius: "10px",
                  border: "1px solid var(--surface-200)",
                  boxShadow: "0 1px 2px rgba(0,0,0,.06)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color-secondary)" }}>
                    From Date
                  </label>
                  <Calendar
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.value as Date)}
                    dateFormat="dd/mm/yy"
                    showIcon
                    placeholder="Select start date"
                    style={{ width: "200px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color-secondary)" }}>
                    To Date
                  </label>
                  <Calendar
                    value={dateTo}
                    onChange={(e) => setDateTo(e.value as Date)}
                    dateFormat="dd/mm/yy"
                    showIcon
                    placeholder="Select end date"
                    style={{ width: "200px" }}
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    label="Clear"
                    icon="pi pi-times"
                    outlined
                    size="small"
                    onClick={() => {
                      setDateFrom(null);
                      setDateTo(null);
                    }}
                    style={{ marginTop: "auto", height: "40px" }}
                  />
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
                {/* Left: Daily Table */}
                <div>
                  <DataTable
                    value={filteredDailyData}
                    dataKey="date"
                    emptyMessage="No data found for the selected period"
                    className="p-datatable-sm vd-table"
                    stripedRows
                    paginator
                    rows={10}
                    sortIcon={() => null}
                  >
                    <Column
                      field="date"
                      header="Date"
                      body={(rowData) => rowData.date.toLocaleDateString()}
                      style={{ width: "100px" }}
                    />
                    <Column
                      field="distance"
                      header="Distance (km)"
                      body={(rowData) => (
                        <span className="vd-td-strong">{numberTemplate(rowData.distance, 1)}</span>
                      )}
                      style={{ width: "100px" }}
                    />
                  </DataTable>
                </div>

                {/* Right: Analysis Cards & Charts */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Summary Cards (no gradients) */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                    <div
                      style={{
                        padding: "12px",
                        background: "var(--surface-0)",
                        borderRadius: "10px",
                        border: "1px solid var(--surface-200)",
                        boxShadow: "0 1px 2px rgba(0,0,0,.06)",
                      }}
                    >
                      <div style={{ fontSize: "11px", color: "var(--text-color-secondary)" }}>Total Distance</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, marginTop: "4px" }}>
                        {numberTemplate(dailyStats.totalDistance, 1)} km
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px",
                        background: "var(--surface-0)",
                        borderRadius: "10px",
                        border: "1px solid var(--surface-200)",
                        boxShadow: "0 1px 2px rgba(0,0,0,.06)",
                      }}
                    >
                      <div style={{ fontSize: "11px", color: "var(--text-color-secondary)" }}>Total Fuel</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, marginTop: "4px" }}>
                        {numberTemplate(dailyStats.totalFuel, 1)} L
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px",
                        background: "var(--surface-0)",
                        borderRadius: "10px",
                        border: "1px solid var(--surface-200)",
                        boxShadow: "0 1px 2px rgba(0,0,0,.06)",
                      }}
                    >
                      <div style={{ fontSize: "11px", color: "var(--text-color-secondary)" }}>Total Cost</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, marginTop: "4px" }}>
                        {formatCurrency(dailyStats.totalCost)}
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="vd-chart-card">
                    <div className="vd-chart-title">
                      <i className="pi pi-chart-line" />
                      Daily Distance Travelled
                    </div>
                    <div style={{ height: "180px" }}>
                      <Chart type="line" data={chartData} options={chartOptions} style={{ height: "100%" }} />
                    </div>
                  </div>

                  <div className="vd-chart-card">
                    <div className="vd-chart-title">
                      <i className="pi pi-bolt" />
                      Daily Fuel Consumption
                    </div>
                    <div style={{ height: "180px" }}>
                      <Chart type="line" data={fuelChartData} options={chartOptions} style={{ height: "100%" }} />
                    </div>
                  </div>

                  <div className="vd-chart-card">
                    <div className="vd-chart-title">
                      <i className="pi pi-indian-rupee" />
                      Daily Cost Analysis
                    </div>
                    <div style={{ height: "180px" }}>
                      <Chart type="line" data={costChartData} options={chartOptions} style={{ height: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Daily Log Entries">
            <div className="vd-panel">
              <DataTable
                value={dailyLogs
                  .filter((log) => log.vehicleId === vehicle.id)
                  .sort((a, b) => b.date.getTime() - a.date.getTime())}
                paginator
                rows={10}
                dataKey="id"
                emptyMessage="No daily log entries found for this vehicle"
                className="p-datatable-sm vd-table"
                stripedRows
                sortIcon={() => null}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]}
              >
                <Column
                  field="date"
                  header="Date"
                  body={(rowData: DailyLogEntry) => rowData.date.toLocaleDateString()}
                  style={{ width: "100px" }}
                />
                <Column
                  field="openingKm"
                  header="Opening Km"
                  body={(rowData: DailyLogEntry) => <span>{numberTemplate(rowData.openingKm, 1)}</span>}
                  style={{ width: "100px" }}
                />
                <Column
                  field="closingKm"
                  header="Closing Km"
                  body={(rowData: DailyLogEntry) =>
                    rowData.status === "closed" && rowData.closingKm ? (
                      <span>{numberTemplate(rowData.closingKm, 1)}</span>
                    ) : (
                      <span className="vd-muted">—</span>
                    )
                  }
                  style={{ width: "100px" }}
                />
                <Column
                  field="distance"
                  header="Distance (km)"
                  body={(rowData: DailyLogEntry) =>
                    rowData.status === "closed" && rowData.distance ? (
                      <span className="vd-td-good">{numberTemplate(rowData.distance, 1)} km</span>
                    ) : (
                      <span className="vd-muted">—</span>
                    )
                  }
                  style={{ width: "120px" }}
                />
                <Column
                  header="Status"
                  body={(rowData: DailyLogEntry) => (
                    <span className={`vd-pill ${rowData.status === "closed" ? "ok" : "warn"}`}>
                      {rowData.status === "closed" ? "Closed" : "Open"}
                    </span>
                  )}
                  style={{ width: "100px", textAlign: "center" }}
                />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Vehicle History">
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
                    body={(rowData) => <span className="vd-mini">#{rowData.periodNumber}</span>}
                    style={{ width: "80px" }}
                  />
                  <Column
                    header="Status"
                    body={(rowData) => {
                      const statusConfig = {
                        Active: { icon: "pi-check-circle", color: "#188038" },
                        Inactive: { icon: "pi-times-circle", color: "#d93025" },
                        Planned: { icon: "pi-calendar", color: "#1a73e8" },
                      };
                      const config =
                        statusConfig[rowData.status as keyof typeof statusConfig] || statusConfig.Active;

                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <i className={`pi ${config.icon}`} style={{ color: config.color }} />
                          <span className="vd-td-strong">{rowData.status}</span>
                        </div>
                      );
                    }}
                    style={{ minWidth: "120px" }}
                  />
                  <Column
                    header="Start Date"
                    body={(rowData) => <span className="vd-td-num">{rowData.startDate.toLocaleDateString()}</span>}
                    sortable
                    style={{ minWidth: "120px" }}
                  />
                  <Column
                    header="End Date"
                    body={(rowData) =>
                      rowData.endDate ? (
                        <span className="vd-td-num">{rowData.endDate.toLocaleDateString()}</span>
                      ) : (
                        <span className="vd-ongoing">Ongoing</span>
                      )
                    }
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
                      return <span className="vd-td-num">{days} {days === 1 ? "day" : "days"}</span>;
                    }}
                    style={{ minWidth: "100px" }}
                  />
                  <Column
                    header="Reason"
                    body={(rowData) => <span style={{ fontSize: "12px" }}>{rowData.reason || "—"}</span>}
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

      {/* Scoped styles (Google-like, no gradients) */}
      <style>{`
        .vd-page{
          display:flex;
          flex-direction:column;
          gap:12px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header card (no gradients) */
        .vd-hero{
          background: var(--surface-0);
          border-radius: 12px;
          padding: 12px;
          border: 1px solid var(--surface-200);
          box-shadow: 0 1px 2px rgba(0,0,0,.06);
        }
        .vd-hero-top{display:flex;align-items:center;gap:10px}
        .vd-back{color: var(--text-color)}
        .vd-title{flex:1;min-width:0}
        .vd-name{
          font-size:14px;
          font-weight:800;
          line-height:1.15;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          color: var(--text-color);
        }
        .vd-sub{
          font-size:11px;
          color: var(--text-color-secondary);
          margin-top:2px
        }
        .vd-badge{
          font-size:11px;
          font-weight:700;
          padding:4px 10px;
          border-radius:999px;
          background: var(--surface-50);
          border: 1px solid var(--surface-200);
          color: var(--text-color);
        }

        .vd-summary{
          margin-top:12px;
          display:grid;
          grid-template-columns: 1.05fr 1.95fr;
          gap:12px;
        }
        @media (max-width: 900px){
          .vd-summary{grid-template-columns: 1fr; }
        }

        .vd-meta{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:10px;
          background: var(--surface-0);
          border: 1px solid var(--surface-200);
          border-radius: 10px;
          padding: 10px;
        }
        .vd-kv .k{font-size:10px;color: var(--text-color-secondary)}
        .vd-kv .v{font-size:12px;font-weight:800;margin-top:2px;color: var(--text-color)}

        .vd-kpis{
          display:grid;
          grid-template-columns: repeat(4, 1fr);
          gap:10px;
        }
        @media (max-width: 900px){
          .vd-kpis{grid-template-columns: repeat(2, 1fr);}
        }

        .vd-kpi{
          display:flex;
          align-items:center;
          gap:10px;
          background: var(--surface-0);
          border: 1px solid var(--surface-200);
          border-radius: 10px;
          padding: 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,.04);
        }
        .vd-kpi-alert{
          background: rgba(234, 134, 0, .06);
          border: 1px solid rgba(234, 134, 0, .22);
        }
        .vd-ico{font-size:16px;color:#1a73e8}
        .vd-kpi-txt .k{font-size:10px;color: var(--text-color-secondary)}
        .vd-kpi-txt .v{font-size:12px;font-weight:900;margin-top:2px;color: var(--text-color)}

        .vd-shell{border-radius:12px;overflow:hidden;box-shadow: 0 1px 2px rgba(0,0,0,.06)}
        .vd-tabview{border-radius:12px}

        /* Google-like tabs: simple + underline */
        .vd-tabview .p-tabview-nav{
          padding: 0 12px;
          gap: 0;
          border:0;
          background: var(--surface-0);
          border-bottom: 1px solid var(--surface-200);
        }
        .vd-tabview .p-tabview-nav li{margin:0}
        .vd-tabview .p-tabview-nav li .p-tabview-nav-link{
          border: 0;
          border-radius: 0;
          padding: 14px 12px 12px;
          font-size: 13px;
          font-weight: 700;
          background: transparent;
          color: var(--text-color-secondary);
          box-shadow: none;
        }
        .vd-tabview .p-tabview-nav li .p-tabview-nav-link:hover{
          background: rgba(26,115,232,.06);
          color: var(--text-color);
        }
        .vd-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link{
          color: #1a73e8;
          border-bottom: 2px solid #1a73e8;
        }
        .vd-tabview .p-tabview-panels{padding:0}
        .vd-panel{padding:12px}

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
          font-size:11px;font-weight:800;
          padding:3px 10px;border-radius:999px;
          border:1px solid var(--surface-200);
          background: var(--surface-0);
          color: var(--text-color);
        }
        .vd-pill.ok{border-color: rgba(24,128,56,.35)}
        .vd-pill.warn{border-color: rgba(234,134,0,.35)}

        .vd-chart-card{
          padding: 12px;
          background: var(--surface-0);
          border-radius: 10px;
          border: 1px solid var(--surface-200);
          box-shadow: 0 1px 2px rgba(0,0,0,.06);
        }
        .vd-chart-title{
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 8px;
          display:flex;
          align-items:center;
          gap:8px;
          color: var(--text-color);
        }
        .vd-chart-title i{color:#1a73e8}

        /* History compact */
        .vd-history{padding:12px}
        .vd-mini{
          font-size:10px;font-weight:800;
          padding:3px 8px;border-radius:999px;
          background: var(--surface-50);
          border: 1px solid var(--surface-200);
          color: var(--text-color-secondary);
        }
        .vd-ongoing{color:#188038;font-weight:900}

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
