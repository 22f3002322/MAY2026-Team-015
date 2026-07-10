import { useState } from "react";

import Layout from "../../components/layout/Layout";

import VisitorStats from "../../components/visitors/VisitorStats";
import VisitorFilters from "../../components/visitors/VisitorFilters";
import VisitorTable from "../../components/visitors/VisitorTable";
import VisitorForm from "../../components/visitors/VisitorForm";
import VisitorDetails from "../../components/visitors/VisitorDetails";
import CheckInOutModal from "../../components/visitors/CheckInOutModal";
import VisitorPurposeChart from "../../components/visitors/VisitorPurposeChart";
import VisitorTrendChart from "../../components/visitors/VisitorTrendChart";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import { visitors } from "../../mock/visitors";

const Visitors = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] =
    useState(null);
  const [editingVisitor, setEditingVisitor] =
    useState(null);
  const [deleteVisitor, setDeleteVisitor] =
    useState(null);
  const [checkVisitor, setCheckVisitor] =
    useState(null);

  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch =
      visitor.name.toLowerCase().includes(search.toLowerCase()) ||
      visitor.flat.toLowerCase().includes(search.toLowerCase()) ||
      visitor.phone.includes(search);

    const matchesStatus =
      status === "" || visitor.status === status;

    const matchesDate =
      date === "" ||
      visitor.date ===
      new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDate
    );
  });

  return (
    <Layout
      title="Visitor Management"
      breadcrumb={["Home", "Visitors"]}
    >
      <VisitorStats />
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <VisitorPurposeChart />
        <VisitorTrendChart />
      </div>

      <VisitorFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        date={date}
        setDate={setDate}
        onRegisterVisitor={() => setOpenModal(true)}
      />

      <VisitorTable
        visitors={filteredVisitors}
        onView={setSelectedVisitor}
        onEdit={(visitor) => {
          setEditingVisitor(visitor);
          setOpenModal(true);
        }}
        onCheck={setCheckVisitor}
        onDelete={setDeleteVisitor}
      />
      <Modal
        open={openModal}
        title={
          editingVisitor
            ? "Edit Visitor"
            : "Register Visitor"
        }
        onClose={() => {
          setOpenModal(false);
          setEditingVisitor(null);
        }}
      >
        <VisitorForm
          initialData={editingVisitor}
          onClose={() => {
            setOpenModal(false);
            setEditingVisitor(null);
          }}
        />
      </Modal>
      <VisitorDetails
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
      />
      <ConfirmDialog
        open={!!deleteVisitor}
        title="Delete Visitor"
        message={`Delete ${deleteVisitor?.name}?`}
        confirmText="Delete"
        onCancel={() => setDeleteVisitor(null)}
        onConfirm={() => {
          console.log(deleteVisitor);

          setDeleteVisitor(null);
        }}
      />
      <CheckInOutModal
        visitor={checkVisitor}
        onClose={() => setCheckVisitor(null)}
      />
    </Layout>
  );
};

export default Visitors;