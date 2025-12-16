import React, { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import toast from "react-hot-toast";
import type { Supplier, ProjectId } from "../types";

interface SupplierManagementProps {
    selectedProject: ProjectId;
    suppliers: Supplier[];
    onAddSupplier: (supplier: Omit<Supplier, "id">) => void;
    onDeleteSupplier: (id: string) => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({
    selectedProject,
    suppliers,
    onAddSupplier,
    onDeleteSupplier,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    const [supplierForm, setSupplierForm] = useState<{
        supplierName: string;
        contactPerson: string;
        phoneNumber: string;
        address: string;
    }>({
        supplierName: "",
        contactPerson: "",
        phoneNumber: "",
        address: "",
    });

    const projectSuppliers = useMemo(
        () => suppliers.filter((s) => s.projectId === selectedProject),
        [suppliers, selectedProject]
    );

    const handleAddSupplier = () => {
        if (!supplierForm.supplierName.trim()) {
            toast.error("Please enter supplier name");
            return;
        }

        onAddSupplier({
            projectId: selectedProject,
            supplierName: supplierForm.supplierName,
            contactPerson: supplierForm.contactPerson || undefined,
            phoneNumber: supplierForm.phoneNumber || undefined,
            address: supplierForm.address || undefined,
        });

        setShowDialog(false);
        setSupplierForm({
            supplierName: "",
            contactPerson: "",
            phoneNumber: "",
            address: "",
        });
        toast.success("✅ Supplier added successfully!");
    };

    const supplierActionsTemplate = (rowData: Supplier) => (
        <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            onClick={() => {
                onDeleteSupplier(rowData.id);
                toast.success("🗑️ Supplier deleted");
            }}
            tooltip="Delete"
            tooltipOptions={{ position: "left" }}
        />
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div></div>
                <Button
                    label="Add Supplier"
                    onClick={() => setShowDialog(true)}
                    severity="success"
                    raised
                />
            </div>

            <DataTable
                value={projectSuppliers}
                paginator
                rows={10}
                dataKey="id"
                emptyMessage="No suppliers found"
                className="custom-datatable"
                stripedRows
                responsiveLayout="scroll"
            >
                <Column
                    field="supplierName"
                    header="Supplier Name"
                    sortable
                    body={(rowData: Supplier) => (
                        <span className="font-medium">{rowData.supplierName}</span>
                    )}
                    style={{ minWidth: '200px' }}
                />
                <Column
                    field="contactPerson"
                    header="Contact Person"
                    sortable
                    body={(rowData: Supplier) => (
                        <span className="text-700">{rowData.contactPerson || "—"}</span>
                    )}
                    style={{ minWidth: '180px' }}
                />
                <Column
                    field="phoneNumber"
                    header="Phone Number"
                    sortable
                    body={(rowData: Supplier) =>
                        rowData.phoneNumber ? (
                            <span className="text-700">{rowData.phoneNumber}</span>
                        ) : (
                            <span className="text-500">—</span>
                        )
                    }
                    style={{ minWidth: '150px' }}
                />
                <Column
                    field="address"
                    header="Address"
                    body={(rowData: Supplier) => (
                        <span className="text-700">{rowData.address || "—"}</span>
                    )}
                    style={{ minWidth: '200px' }}
                />
                <Column
                    body={supplierActionsTemplate}
                    exportable={false}
                    style={{ width: "80px", textAlign: "center" }}
                />
            </DataTable>

            <Dialog
                header={
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <i className="pi pi-building" style={{ color: "var(--primary-green)" }}></i>
                        <span>Add New Supplier</span>
                    </div>
                }
                visible={showDialog}
                style={{ width: "500px" }}
                onHide={() => setShowDialog(false)}
                footer={
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <Button
                            label="Cancel"
                            onClick={() => setShowDialog(false)}
                            outlined
                            severity="success"
                        />
                        <Button
                            label="Save"
                            onClick={handleAddSupplier}
                            severity="success"
                            raised
                        />
                    </div>
                }
            >
                <div className="dialog-form pt-4">
                    <FloatLabel>
                        <InputText
                            id="supplierName"
                            value={supplierForm.supplierName}
                            onChange={(e) =>
                                setSupplierForm((prev) => ({
                                    ...prev,
                                    supplierName: e.target.value,
                                }))
                            }
                            className="w-full"
                        />
                        <label htmlFor="supplierName">Supplier Name *</label>
                    </FloatLabel>

                    <FloatLabel>
                        <InputText
                            id="contactPerson"
                            value={supplierForm.contactPerson}
                            onChange={(e) =>
                                setSupplierForm((prev) => ({
                                    ...prev,
                                    contactPerson: e.target.value,
                                }))
                            }
                            className="w-full"
                        />
                        <label htmlFor="contactPerson">Contact Person</label>
                    </FloatLabel>

                    <FloatLabel>
                        <InputText
                            id="phoneNumber"
                            value={supplierForm.phoneNumber}
                            onChange={(e) =>
                                setSupplierForm((prev) => ({
                                    ...prev,
                                    phoneNumber: e.target.value,
                                }))
                            }
                            className="w-full"
                        />
                        <label htmlFor="phoneNumber">Phone Number</label>
                    </FloatLabel>

                    <FloatLabel>
                        <InputText
                            id="address"
                            value={supplierForm.address}
                            onChange={(e) =>
                                setSupplierForm((prev) => ({
                                    ...prev,
                                    address: e.target.value,
                                }))
                            }
                            className="w-full"
                        />
                        <label htmlFor="address">Address</label>
                    </FloatLabel>
                </div>
            </Dialog>
        </div>
    );
};

export default SupplierManagement;
