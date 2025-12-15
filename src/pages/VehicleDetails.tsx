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
        const closedEntries = vehicleFuelEntries.filter(e => e.status === 'closed');
        const totalKm = closedEntries.reduce((sum, e) => sum + (e.distance || 0), 0);
        const totalLitres = vehicleFuelEntries.reduce((sum, e) => sum + (e.litres || 0), 0);
        const totalCost = vehicleFuelEntries.reduce((sum, e) => sum + (e.totalCost || 0), 0);
        const avgMileage = totalLitres > 0 ? totalKm / totalLitres : 0;

        return { totalKm, totalLitres, totalCost, avgMileage, totalEntries: vehicleFuelEntries.length };
    }, [vehicleFuelEntries]);

    const dateTemplate = (rowData: FuelEntry) => rowData.date.toLocaleDateString();
    const numberTemplate = (value: number, decimals = 2) => value.toFixed(decimals);
    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

    return (
        <div className="page-container">
            {/* Header with Back Button */}
            <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: 'var(--spacing-5)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-5)',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
                    <Button
                        icon="pi pi-arrow-left"
                        rounded
                        text
                        onClick={onBack}
                        style={{ color: 'white' }}
                        tooltip="Back to Vehicles"
                    />
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: 'var(--font-3xl)', fontWeight: 700 }}>
                            {vehicle.vehicleName}
                        </h2>
                        <div style={{ fontSize: 'var(--font-sm)', opacity: 0.9, marginTop: 'var(--spacing-1)' }}>
                            {vehicle.vehicleNumber}
                        </div>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: 'var(--spacing-2) var(--spacing-4)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-sm)',
                        fontWeight: 600
                    }}>
                        {vehicle.status}
                    </div>
                </div>

                {/* Vehicle Info Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-3)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: 'var(--font-xs)', opacity: 0.8 }}>Type</div>
                        <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                            {vehicle.vehicleType}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: 'var(--font-xs)', opacity: 0.8 }}>Fuel Type</div>
                        <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                            {vehicle.fuelType}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: 'var(--font-xs)', opacity: 0.8 }}>Start Date</div>
                        <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                            {vehicle.startDate ? vehicle.startDate.toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    {vehicle.endDate && (
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: 'var(--font-xs)', opacity: 0.8 }}>End Date</div>
                            <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                                {vehicle.endDate.toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-4)',
                marginBottom: 'var(--spacing-5)'
            }}>
                <Card style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                                Total Distance
                            </div>
                            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {numberTemplate(vehicleStats.totalKm, 1)} km
                            </div>
                        </div>
                        <i className="pi pi-map-marker" style={{ fontSize: '24px', color: '#f59e0b' }}></i>
                    </div>
                </Card>

                <Card style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                                Total Fuel
                            </div>
                            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {numberTemplate(vehicleStats.totalLitres, 1)} L
                            </div>
                        </div>
                        <i className="pi pi-bolt" style={{ fontSize: '24px', color: '#3b82f6' }}></i>
                    </div>
                </Card>

                <Card style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                                Total Cost
                            </div>
                            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {formatCurrency(vehicleStats.totalCost)}
                            </div>
                        </div>
                        <i className="pi pi-indian-rupee" style={{ fontSize: '24px', color: '#10b981' }}></i>
                    </div>
                </Card>

                <Card style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                                Avg Mileage
                            </div>
                            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {numberTemplate(vehicleStats.avgMileage, 2)} km/l
                            </div>
                        </div>
                        <i className="pi pi-gauge" style={{ fontSize: '24px', color: '#8b5cf6' }}></i>
                    </div>
                </Card>
            </div>

            {/* Tabs Section */}
            <Card style={{
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: 0
            }}>
                <TabView>
                    <TabPanel header="Fuel Entries" leftIcon="pi pi-chart-line">
                        <div style={{ padding: 'var(--spacing-4)' }}>
                            <DataTable
                                value={vehicleFuelEntries}
                                paginator
                                rows={10}
                                dataKey="id"
                                emptyMessage="No fuel entries found for this vehicle"
                                className="custom-datatable"
                                stripedRows
                                responsiveLayout="scroll"
                            >
                                <Column
                                    field="date"
                                    header="Date"
                                    body={dateTemplate}
                                    sortable
                                    style={{ minWidth: '120px' }}
                                />
                                <Column
                                    field="supplierName"
                                    header="Supplier"
                                    body={(rowData: FuelEntry) => <span className="text-700">{rowData.supplierName}</span>}
                                    sortable
                                    style={{ minWidth: '150px' }}
                                />
                                <Column
                                    field="litres"
                                    header="Litres"
                                    body={(rowData: FuelEntry) => <span className="font-medium">{numberTemplate(rowData.litres, 2)} L</span>}
                                    sortable
                                    style={{ minWidth: '100px' }}
                                />
                                <Column
                                    field="pricePerLitre"
                                    header="Price/L"
                                    body={(rowData: FuelEntry) => <span>{rowData.pricePerLitre ? '₹' + numberTemplate(rowData.pricePerLitre, 2) : '-'}</span>}
                                    sortable
                                    style={{ minWidth: '100px' }}
                                />
                                <Column
                                    field="totalCost"
                                    header="Total Cost"
                                    body={(rowData: FuelEntry) => <span className="font-medium text-green-600">{formatCurrency(rowData.totalCost || 0)}</span>}
                                    sortable
                                    style={{ minWidth: '120px' }}
                                />
                                <Column
                                    field="openingKm"
                                    header="Opening Km"
                                    body={(rowData: FuelEntry) => <span className="text-700">{numberTemplate(rowData.openingKm, 1)}</span>}
                                    sortable
                                    style={{ minWidth: '110px' }}
                                />
                                <Column
                                    field="closingKm"
                                    header="Closing Km"
                                    body={(rowData: FuelEntry) => (
                                        rowData.status === "closed" ? (
                                            <span className="text-700">{numberTemplate(rowData.closingKm, 1)}</span>
                                        ) : (
                                            <span className="text-500">—</span>
                                        )
                                    )}
                                    sortable
                                    style={{ minWidth: '110px' }}
                                />
                                <Column
                                    field="distance"
                                    header="Distance"
                                    body={(rowData: FuelEntry) =>
                                        rowData.status === "closed" ? (
                                            <span className="font-medium text-green-600">{numberTemplate(rowData.distance, 1)} km</span>
                                        ) : (
                                            <span className="text-500">—</span>
                                        )
                                    }
                                    sortable
                                    style={{ minWidth: '110px' }}
                                />
                                <Column
                                    field="mileage"
                                    header="Mileage"
                                    body={(rowData: FuelEntry) =>
                                        rowData.status === "closed" ? (
                                            <span className="font-medium text-green-600">{numberTemplate(rowData.mileage, 2)} km/l</span>
                                        ) : (
                                            <span className="text-500">—</span>
                                        )
                                    }
                                    sortable
                                    style={{ minWidth: '110px' }}
                                />
                                <Column
                                    header="Status"
                                    body={(rowData: FuelEntry) => (
                                        <span className={`font-medium ${rowData.status === "closed" ? 'text-green-600' : 'text-orange-600'}`}>
                                            {rowData.status === "closed" ? "Closed" : "Open"}
                                        </span>
                                    )}
                                    style={{ minWidth: '100px' }}
                                />
                            </DataTable>
                        </div>
                    </TabPanel>

                    <TabPanel header="Vehicle History" leftIcon="pi pi-history">
                        <div style={{ padding: 'var(--spacing-5)' }}>
                            {vehicle.statusHistory && vehicle.statusHistory.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                                    {vehicle.statusHistory.map((history, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                padding: 'var(--spacing-5)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-color)',
                                                borderLeft: `4px solid ${history.status === 'Active' ? '#10b981' : '#ef4444'}`
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-3)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                                                    <i className={`pi ${history.status === 'Active' ? 'pi-check-circle' : 'pi-times-circle'}`}
                                                        style={{ color: history.status === 'Active' ? '#10b981' : '#ef4444', fontSize: 'var(--font-xl)' }}></i>
                                                    <span style={{ fontWeight: 700, fontSize: 'var(--font-lg)' }}>
                                                        {history.status}
                                                    </span>
                                                </div>
                                                <span style={{
                                                    fontSize: 'var(--font-xs)',
                                                    color: 'var(--text-secondary)',
                                                    background: 'white',
                                                    padding: 'var(--spacing-1) var(--spacing-3)',
                                                    borderRadius: 'var(--radius-md)'
                                                }}>
                                                    Period #{vehicle.statusHistory!.length - index}
                                                </span>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-3)' }}>
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                                                        Start Date
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-base)', fontWeight: 600 }}>
                                                        {history.startDate.toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                                                        End Date
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-base)', fontWeight: 600 }}>
                                                        {history.endDate ? history.endDate.toLocaleDateString() : (
                                                            <span style={{ color: '#10b981' }}>Ongoing</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {history.reason && (
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                                                        Reason
                                                    </div>
                                                    <div style={{
                                                        fontSize: 'var(--font-sm)',
                                                        background: 'white',
                                                        padding: 'var(--spacing-3)',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--border-color)'
                                                    }}>
                                                        {history.reason}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: 'var(--spacing-10)',
                                    color: 'var(--text-secondary)',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <i className="pi pi-info-circle" style={{ fontSize: '48px', marginBottom: 'var(--spacing-4)', opacity: 0.5 }}></i>
                                    <div style={{ fontSize: 'var(--font-base)', fontWeight: 600 }}>No history available for this vehicle</div>
                                </div>
                            )}
                        </div>
                    </TabPanel>
                </TabView>
            </Card>
        </div>
    );
};

export default VehicleDetails;
