import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";

import BillStats from "../../components/residents/bills/BillStats";
import BillFilters from "../../components/residents/bills/Billfilters";
import BillTable from "../../components/residents/bills/BillTable";
import BillDetails from "../../components/residents/bills/BillDetails";
import PaymentModal from "../../components/residents/bills/PaymentModal";

import useBillingStore from "../../store/billingStore";

const Bills = () => {
  const myBills = useBillingStore((state) => state.myBills);
  const fetchMyBills = useBillingStore((state) => state.fetchMyBills);
  const createPayment = useBillingStore((state) => state.createPayment);

  useEffect(() => {
    fetchMyBills();
  }, [fetchMyBills]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [payingBill, setPayingBill] = useState(null);

  const mappedBills = useMemo(
    () =>
      myBills.map((b) => ({
        id: b.bill_id,
        billId: `BILL-${b.bill_id}`,
        category: "Maintenance",
        amount: Number(b.amount || 0),
        dueDate: b.due_date,
        status: String(b.status || "").toLowerCase() === "paid" ? "Paid" : "Pending",
        billing_month: b.billing_month,
        flat_id: b.flat_id,
        raw: b,
      })),
    [myBills]
  );

  const filteredBills = useMemo(() => {
    return mappedBills.filter((bill) => {
      const matchesSearch =
        String(bill.billId).toLowerCase().includes(search.toLowerCase()) ||
        String(bill.billing_month || "").includes(search);
      const matchesStatus =
        status === "" ||
        String(bill.status).toLowerCase() === String(status).toLowerCase();
      const matchesCategory = category === "" || bill.category === category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [mappedBills, search, status, category]);

  const handlePay = async (paymentMethod) => {
    const bill = payingBill?.raw || payingBill;
    if (!bill?.bill_id && !bill?.id) {
      toast.error("Invalid bill.");
      return;
    }
    const billId = bill.bill_id || bill.id;
    const amount = bill.amount ?? payingBill?.amount;
    const res = await createPayment({
      bill_id: billId,
      amount: String(amount),
      payment_method: String(paymentMethod || "upi").toLowerCase(),
      transaction_reference: `TXN-${Date.now()}`,
      status: "success",
    });
    if (res.success) {
      toast.success(res.message || "Payment recorded.");
      setPayingBill(null);
      fetchMyBills();
    } else {
      toast.error(res.message || "Payment failed.");
    }
  };

  return (
    <Layout title="My Bills" breadcrumb={["Home", "Billing"]}>
      <BillStats bills={mappedBills} />

      <Card className="mt-6">
        <BillFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          category={category}
          setCategory={setCategory}
        />

        <BillTable
          bills={filteredBills}
          onView={setSelectedBill}
          onPay={setPayingBill}
        />
      </Card>

      <BillDetails bill={selectedBill} onClose={() => setSelectedBill(null)} />

      <PaymentModal
        bill={payingBill}
        open={!!payingBill}
        onClose={() => setPayingBill(null)}
        onPay={handlePay}
      />
    </Layout>
  );
};

export default Bills;
