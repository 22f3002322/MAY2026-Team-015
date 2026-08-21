import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

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
  const bills = useBillingStore((state) => state.bills);
  const fetchBills = useBillingStore((state) => state.fetchBills);
  const fetchBillingSummary = useBillingStore((state) => state.fetchBillingSummary);

  useEffect(() => {
    fetchBills();
    fetchBillingSummary();
  }, [fetchBills, fetchBillingSummary]);

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

  const mappedBills = useMemo(() => {
    return bills.map((b) => {
      const rawStatus = String(b.status || "unpaid").toLowerCase();
      return {
        id: b.bill_id || b.id,
        bill_id: b.bill_id || b.id,
        billId: `BILL-${b.bill_id || b.id}`,
        resident: b.resident_name || b.resident || `Flat #${b.flat_id}`,
        flat: b.flat_number
          ? `Flat ${b.flat_number}`
          : b.flat || `Flat #${b.flat_id}`,
        category: b.bill_type || b.category || "Maintenance",
        amount: Number(b.total_amount || b.amount || 0).toLocaleString(),
        dueDate: b.due_date || b.dueDate || "N/A",
        paidDate: b.paid_at
          ? new Date(b.paid_at).toLocaleDateString()
          : b.paidDate || "-",
        paymentMethod: b.payment_method || undefined,
        status: rawStatus === "paid" ? "Paid" : "Unpaid",
        statusValue: rawStatus === "paid" ? "paid" : "unpaid",
        flat_id: b.flat_id,
        billing_month: b.billing_month,
        due_date: b.due_date,
        amountRaw: Number(b.amount || 0),
        items: b.items || [],
      };
    });
  }, [bills]);

  const filteredBills = useMemo(() => {
    return mappedBills.filter((bill) => {
      const matchesSearch =
        (bill.resident || "").toLowerCase().includes(search.toLowerCase()) ||
        (bill.flat || "").toLowerCase().includes(search.toLowerCase()) ||
        (bill.billId || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "" || bill.category === category;

      const matchesStatus =
        status === "" ||
        String(bill.status).toLowerCase() === String(status).toLowerCase();

      const matchesDueDate =
        dueDate === "" ||
        (bill.dueDate && bill.dueDate.split("T")[0] === dueDate);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDueDate
      );
    });
  }, [mappedBills, search, category, status, dueDate]);

  return (
    <Layout
      title="Billing & Payments Management"
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
        title={editingBill ? "Edit Bill" : "Generate Bill"}
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
        title="Delete not available"
        message="Bill deletion is not supported by the API. Mark bills as paid instead."
        confirmText="OK"
        onCancel={() => setDeleteBill(null)}
        onConfirm={() => setDeleteBill(null)}
      />
    </Layout>
  );
};

export default Billing;