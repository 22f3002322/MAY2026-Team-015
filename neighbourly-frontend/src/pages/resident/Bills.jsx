import { useMemo, useState } from "react";

import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";

import BillStats from "../../components/residents/bills/BillStats";
import BillFilters from "../../components/residents/bills/BillFilters";
import BillTable from "../../components/residents/bills/BillTable";
import BillDetails from "../../components/residents/bills/BillDetails";
import PaymentModal from "../../components/residents/bills/PaymentModal";

import useBillingStore from "../../store/billingStore";

const Bills = () => {
  // Zustand

  const bills = useBillingStore(
    (state) => state.bills
  );

  const markPaid = useBillingStore(
    (state) => state.markPaid
  );

  // Filters

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [category, setCategory] =
    useState("");

  // Details

  const [selectedBill, setSelectedBill] =
    useState(null);

  // Payment

  const [paymentOpen, setPaymentOpen] =
    useState(false);

  const [paymentBill, setPaymentBill] =
    useState(null);

  // Filter Bills

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.billId
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        bill.category
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        bill.flat
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "" ||
        bill.status === status;

      const matchesCategory =
        category === "" ||
        bill.category === category;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    bills,
    search,
    status,
    category,
  ]);

  return (
    <Layout
      title="My Bills"
      breadcrumb={[
        "Resident",
        "Bills",
      ]}
    >
      <BillStats />

      <BillFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
      />

      <Card
        title="Billing History"
        subtitle="View and pay your maintenance bills"
      >
        <BillTable
          bills={filteredBills}
          onView={setSelectedBill}
          onPay={(bill) => {
            setPaymentBill(bill);
            setPaymentOpen(true);
          }}
        />
      </Card>
            {/* Bill Details */}

      <BillDetails
        bill={selectedBill}
        onClose={() =>
          setSelectedBill(null)
        }
      />

      {/* Payment Modal */}

      <PaymentModal
        open={paymentOpen}
        bill={paymentBill}
        onClose={() => {
          setPaymentOpen(false);
          setPaymentBill(null);
        }}
        onPay={(paymentMethod) => {
          markPaid(
            paymentBill.id,
            paymentMethod
          );

          setPaymentOpen(false);
          setPaymentBill(null);
        }}
      />
    </Layout>
  );
};

export default Bills;