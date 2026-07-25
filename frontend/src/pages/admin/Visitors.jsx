import { useState } from "react";
import toast from "react-hot-toast";

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

import useVisitorStore from "../../store/visitorStore";

const Visitors = () => {
  // Zustand

  const visitors = useVisitorStore(
    (state) => state.visitors
  );

  const addVisitor = useVisitorStore(
    (state) => state.addVisitor
  );

  const updateVisitor = useVisitorStore(
    (state) => state.updateVisitor
  );

  const removeVisitor = useVisitorStore(
    (state) => state.deleteVisitor
  );

  // Filters

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  // Modals

  const [openModal, setOpenModal] = useState(false);

  // Selected

  const [selectedVisitor, setSelectedVisitor] =
    useState(null);

  const [editingVisitor, setEditingVisitor] =
    useState(null);

  const [deleteVisitor, setDeleteVisitor] =
    useState(null);

  const [checkVisitor, setCheckVisitor] =
    useState(null);

  const filteredVisitors = visitors.filter(
    (visitor) => {
      const matchesSearch =
        visitor.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        visitor.flat
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        visitor.phone.includes(search);

      const matchesStatus =
        status === "" ||
        visitor.status === status;

      const matchesDate =
        date === "" ||
        visitor.date ===
          new Date(date).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    }
  );

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
        onRegisterVisitor={() =>
          setOpenModal(true)
        }
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

      {/* Add / Edit */}

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
          onSubmit={(data) => {
            if (editingVisitor) {
              updateVisitor(
                editingVisitor.id,
                data
              );
              toast.success("Visitor updated successfully!");
            } else {
              addVisitor({
                ...data,
                id: Date.now(),
                createdAt:
                  new Date().toISOString(),
              });
              toast.success("Visitor added successfully!");
            }

            setOpenModal(false);
            setEditingVisitor(null);
          }}
          onClose={() => {
            setOpenModal(false);
            setEditingVisitor(null);
          }}
        />
      </Modal>

      {/* Details */}

      <VisitorDetails
        visitor={selectedVisitor}
        onClose={() =>
          setSelectedVisitor(null)
        }
      />

      {/* Delete */}

      <ConfirmDialog
        open={!!deleteVisitor}
        title="Delete Visitor"
        message={`Delete ${deleteVisitor?.name}?`}
        confirmText="Delete"
        onCancel={() =>
          setDeleteVisitor(null)
        }
        onConfirm={() => {
          removeVisitor(deleteVisitor.id);

          setDeleteVisitor(null);
        }}
      />

      {/* Check In / Out */}

      <CheckInOutModal
        visitor={checkVisitor}
        onClose={() =>
          setCheckVisitor(null)
        }
      />
    </Layout>
  );
};

export default Visitors;