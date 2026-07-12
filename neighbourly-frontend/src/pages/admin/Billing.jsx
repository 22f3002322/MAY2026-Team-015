import { useState } from "react";

import Layout from "../../components/layout/Layout";

import BillingStats from "../../components/billing/BillingStats";
import BillingFilters from "../../components/billing/BillingFilters";
import BillingTable from "../../components/billing/BillingTable";
import BillingStatusChart from "../../components/billing/BillingStatusChart";
import BillingRevenueChart from "../../components/billing/BillingRevenueChart";
import BillForm from "../../components/billing/BillForm";
import BillDetails from "../../components/billing/BillDetails";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useBillingStore from "../../store/billingStore";

const Billing = () => {
    const bills = useBillingStore(
        (state) => state.bills
    );

    const deleteBillById = useBillingStore(
        (state) => state.deleteBill
    );

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [dueDate, setDueDate] = useState("");

    // CRUD
    const [openModal, setOpenModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [editingBill, setEditingBill] = useState(null);
    const [deleteBill, setDeleteBill] = useState(null);

    const filteredBills = bills.filter((bill) => {
        const matchesSearch =
            bill.resident
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            bill.flat
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            bill.billId
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "" ||
            bill.category === category;

        const matchesStatus =
            status === "" ||
            bill.status === status;

        const matchesDueDate =
            dueDate === "" ||
            bill.dueDate?.split("T")[0] === dueDate;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus &&
            matchesDueDate
        );
    });

    return (
        <Layout
            title="Billing & Payments"
            breadcrumb={["Home", "Billing"]}
        >
            <BillingStats />

            <div className="mb-6 grid gap-6 xl:grid-cols-2">
                <BillingRevenueChart />
                <BillingStatusChart />
            </div>

            <BillingFilters
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                status={status}
                setStatus={setStatus}
                dueDate={dueDate}
                setDueDate={setDueDate}
                onGenerateBill={() => {
                    setEditingBill(null);
                    setOpenModal(true);
                }}
            />

            <BillingTable
                bills={filteredBills}
                onView={setSelectedBill}
                onEdit={(bill) => {
                    setEditingBill(bill);
                    setOpenModal(true);
                }}
                onDelete={setDeleteBill}
            />

            <Modal
                open={openModal}
                title={
                    editingBill
                        ? "Edit Bill"
                        : "Generate Bill"
                }
                onClose={() => {
                    setOpenModal(false);
                    setEditingBill(null);
                }}
            >
                <BillForm
                    initialData={editingBill}
                    onClose={() => {
                        setOpenModal(false);
                        setEditingBill(null);
                    }}
                />
            </Modal>

            <BillDetails
                bill={selectedBill}
                onClose={() => setSelectedBill(null)}
            />

            <ConfirmDialog
                open={!!deleteBill}
                title="Delete Bill"
                message={`Delete ${deleteBill?.billId}?`}
                confirmText="Delete"
                onCancel={() => setDeleteBill(null)}
                onConfirm={() => {
                    deleteBillById(deleteBill.id);
                    setDeleteBill(null);
                }}
            />
        </Layout>
    );
};

export default Billing;