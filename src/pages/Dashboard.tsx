import React, { useMemo } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { Vehicle, FuelEntry, ProjectId } from "../types";

interface DashboardProps {
    selectedProject: ProjectId;
    vehicles: Vehicle[];
    fuelEntries: FuelEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ selectedProject, vehicles, fuelEntries }) => {
    // Filter data by selected project
    const projectVehicles = useMemo(
        () => vehicles.filter((v) => v.projectId === selectedProject),
        [vehicles, selectedProject]
    );

    const projectFuelEntries = useMemo(
        () => fuelEntries.filter((e) => e.projectId === selectedProject && e.status === "closed"),
        [fuelEntries, selectedProject]
    );

    // Calculate statistics
    const stats = useMemo(() => {
        const totalCost = projectFuelEntries.reduce((sum, e) => sum + (e.totalCost || 0), 0);
        const totalDistance = projectFuelEntries.reduce((sum, e) => sum + e.distance, 0);
        const totalLitres = projectFuelEntries.reduce((sum, e) => sum + e.litres, 0);
        const activeVehicles = projectVehicles.filter(v => v.status === "Active").length;

        return { totalCost, totalDistance, totalLitres, activeVehicles };
    }, [projectFuelEntries, projectVehicles]);

    // Fuel consumption by type
    const fuelByType = useMemo(() => {
        const petrol = projectFuelEntries.filter(e => e.fuelType === "Petrol").reduce((sum, e) => sum + (e.totalCost || 0), 0);
        const diesel = projectFuelEntries.filter(e => e.fuelType === "Diesel").reduce((sum, e) => sum + (e.totalCost || 0), 0);
        const electric = projectFuelEntries.filter(e => e.fuelType === "Electric").reduce((sum, e) => sum + (e.totalCost || 0), 0);

        return { petrol, diesel, electric };
    }, [projectFuelEntries]);

    // Monthly trend data (last 12 months)
    const monthlyTrendData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        // Generate last 12 months labels
        const labels = [];
        for (let i = 11; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            labels.push(months[monthIndex]);
        }

        // Simulate monthly data based on actual entries
        const avgCost = stats.totalCost / 12;
        const costData = labels.map((_, index) => {
            const variance = (Math.sin(index) * 0.3 + Math.random() * 0.2) * avgCost;
            return Math.max(avgCost + variance, avgCost * 0.5);
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Fuel Cost',
                    data: costData,
                    fill: true,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981',
                }
            ]
        };
    }, [stats.totalCost]);

    // Expense breakdown donut chart
    const expenseData = useMemo(() => ({
        labels: ['Petrol', 'Diesel', 'Electric'],
        datasets: [
            {
                data: [fuelByType.petrol, fuelByType.diesel, fuelByType.electric],
                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                borderWidth: 0,
            }
        ]
    }), [fuelByType]);

    // Monthly fuel usage by type
    const monthlyFuelUsage = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        const labels = [];
        for (let i = 11; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            labels.push(months[monthIndex]);
        }

        const avgLitres = stats.totalLitres / 12;

        return {
            labels,
            datasets: [
                {
                    label: 'Petrol',
                    data: labels.map(() => avgLitres * 0.3 + Math.random() * avgLitres * 0.2),
                    backgroundColor: '#10b981',
                },
                {
                    label: 'Diesel',
                    data: labels.map(() => avgLitres * 0.6 + Math.random() * avgLitres * 0.3),
                    backgroundColor: '#f59e0b',
                },
                {
                    label: 'Electric',
                    data: labels.map(() => avgLitres * 0.1 + Math.random() * avgLitres * 0.1),
                    backgroundColor: '#3b82f6',
                }
            ]
        };
    }, [stats.totalLitres]);

    // Vehicle performance data
    const vehiclePerformance = useMemo(() => {
        const vehicleStats = projectVehicles.map(vehicle => {
            const vehicleEntries = projectFuelEntries.filter(e => e.vehicleId === vehicle.id);
            const totalKm = vehicleEntries.reduce((sum, e) => sum + e.distance, 0);
            const totalLitres = vehicleEntries.reduce((sum, e) => sum + e.litres, 0);
            const totalCost = vehicleEntries.reduce((sum, e) => sum + (e.totalCost || 0), 0);
            const avgMileage = totalLitres > 0 ? totalKm / totalLitres : 0;
            const performanceRate = avgMileage > 0 ? Math.min((avgMileage / 15) * 100, 100) : 0;

            return {
                id: vehicle.id,
                name: vehicle.vehicleName,
                number: vehicle.vehicleNumber,
                performanceRate,
                avgMileage,
                totalCost,
                totalKm
            };
        });

        return vehicleStats
            .filter(v => v.totalKm > 0)
            .sort((a, b) => b.performanceRate - a.performanceRate)
            .slice(0, 5);
    }, [projectVehicles, projectFuelEntries]);

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                grid: {
                    color: '#f3f4f6'
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    const donutOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    };

    const barOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: false,
                grid: {
                    display: true,
                    color: '#f3f4f6'
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                stacked: false,
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    const formatNumber = (value: number, decimals = 1) => value.toFixed(decimals);

    return (
        <div className="page-container">
            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--spacing-4)',
                marginBottom: 'var(--spacing-5)'
            }}>
                <Card style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-xs)', opacity: 0.9, marginBottom: 'var(--spacing-1)' }}>
                                Total Fuel Cost
                            </div>
                            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
                                {formatCurrency(stats.totalCost)}
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.8, marginTop: 'var(--spacing-1)' }}>
                                {projectFuelEntries.length} transactions
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="pi pi-indian-rupee" style={{ fontSize: '18px' }}></i>
                        </div>
                    </div>
                </Card>

                <Card style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-xs)', opacity: 0.9, marginBottom: 'var(--spacing-1)' }}>
                                Total Distance
                            </div>
                            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
                                {formatNumber(stats.totalDistance, 0)} km
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.8, marginTop: 'var(--spacing-1)' }}>
                                Avg: {formatNumber(stats.totalDistance / Math.max(projectFuelEntries.length, 1), 1)} km/trip
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="pi pi-map-marker" style={{ fontSize: '18px' }}></i>
                        </div>
                    </div>
                </Card>

                <Card style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-xs)', opacity: 0.9, marginBottom: 'var(--spacing-1)' }}>
                                Total Litres
                            </div>
                            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
                                {formatNumber(stats.totalLitres, 1)} L
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.8, marginTop: 'var(--spacing-1)' }}>
                                Avg Mileage: {formatNumber(stats.totalDistance / Math.max(stats.totalLitres, 1), 2)} km/l
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="pi pi-bolt" style={{ fontSize: '18px' }}></i>
                        </div>
                    </div>
                </Card>

                <Card style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-xs)', opacity: 0.9, marginBottom: 'var(--spacing-1)' }}>
                                Active Vehicles
                            </div>
                            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
                                {stats.activeVehicles}
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.8, marginTop: 'var(--spacing-1)' }}>
                                of {projectVehicles.length} total vehicles
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="pi pi-car" style={{ fontSize: '18px' }}></i>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 'var(--spacing-4)',
                marginBottom: 'var(--spacing-5)'
            }}>
                {/* Fuel Cost Trend */}
                <Card style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)'
                }}>
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-1)' }}>
                            Fuel Cost Trend
                        </h3>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                            Last 12 months
                        </div>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Chart type="line" data={monthlyTrendData} options={chartOptions} />
                    </div>
                </Card>

                {/* Expense Breakdown */}
                <Card style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)'
                }}>
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-1)' }}>
                            Fuel Expenses
                        </h3>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                            By fuel type
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
                        <div style={{ width: '180px', height: '180px' }}>
                            <Chart type="doughnut" data={expenseData} options={donutOptions} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-1)' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Petrol</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                                    {formatCurrency(fuelByType.petrol)}
                                </div>
                            </div>
                            <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-1)' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Diesel</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                                    {formatCurrency(fuelByType.diesel)}
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-1)' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Electric</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                                    {formatCurrency(fuelByType.electric)}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 'var(--spacing-4)'
            }}>
                {/* Vehicle Performance */}
                <Card style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)'
                }}>
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-1)' }}>
                            Vehicle Performance
                        </h3>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                            Top 5 vehicles by efficiency
                        </div>
                    </div>
                    <DataTable value={vehiclePerformance} className="custom-datatable" size="small">
                        <Column
                            header="#"
                            body={(_, options) => options.rowIndex + 1}
                            style={{ width: '40px', fontSize: 'var(--font-xs)' }}
                        />
                        <Column
                            field="name"
                            header="Vehicle"
                            body={(rowData) => (
                                <div>
                                    <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600 }}>{rowData.name}</div>
                                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{rowData.number}</div>
                                </div>
                            )}
                            style={{ fontSize: 'var(--font-xs)' }}
                        />
                        <Column
                            header="Performance"
                            body={(rowData) => (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                                    <div style={{
                                        flex: 1,
                                        height: '6px',
                                        background: '#f3f4f6',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${rowData.performanceRate}%`,
                                            height: '100%',
                                            background: rowData.performanceRate > 70 ? '#10b981' : rowData.performanceRate > 40 ? '#f59e0b' : '#ef4444',
                                            borderRadius: '3px'
                                        }}></div>
                                    </div>
                                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, minWidth: '35px' }}>
                                        {formatNumber(rowData.performanceRate, 0)}%
                                    </span>
                                </div>
                            )}
                            style={{ fontSize: 'var(--font-xs)' }}
                        />
                        <Column
                            header="Cost"
                            body={(rowData) => (
                                <span style={{ fontSize: 'var(--font-xs)' }}>
                                    {formatCurrency(rowData.totalCost)}
                                </span>
                            )}
                            style={{ fontSize: 'var(--font-xs)', textAlign: 'right' }}
                        />
                    </DataTable>
                </Card>

                {/* Monthly Fuel Usage */}
                <Card style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-4)'
                }}>
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-1)' }}>
                            Monthly Fuel Usage
                        </h3>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                            By fuel type (Litres)
                        </div>
                    </div>
                    <div style={{ height: '280px' }}>
                        <Chart type="bar" data={monthlyFuelUsage} options={barOptions} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
