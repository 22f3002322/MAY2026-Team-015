import { useMemo, useState } from "react";

import Layout from "../../components/layout/Layout";

import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import VisitorStats from "../../components/residents/visitors/VisitorStats";
import VisitorFilters from "../../components/residents/visitors/VisitorFilters";
import VisitorTable from "../../components/residents/visitors/VisitorTable";
import VisitorForm from "../../components/residents/visitors/VisitorForm";
import VisitorDetails from "../../components/residents/visitors/VisitorDetails";

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

  const deleteVisitor = useVisitorStore(
    (state) => state.deleteVisitor
  );

  // Filters

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [purpose, setPurpose] =
    useState("");

  // Modals

  const [openModal, setOpenModal] =
    useState(false);

  const [
    selectedVisitor,
    setSelectedVisitor,
  ] = useState(null);

  const [
    editingVisitor,
    setEditingVisitor,
  ] = useState(null);

  const [
    editModal,
    setEditModal,
  ] = useState(false);

  const [
    deleteItem,
    setDeleteItem,
  ] = useState(null);

  // Filtering

  const filteredVisitors =
    useMemo(() => {
      return visitors.filter(
        (visitor) => {
          const matchesSearch =
            visitor.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            visitor.phone?.includes(
              search
            );

          const matchesStatus =
            status === "" ||
            visitor.status === status;

          const matchesPurpose =
            purpose === "" ||
            visitor.purpose ===
              purpose;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPurpose
          );
        }
      );
    }, [
      visitors,
      search,
      status,
      purpose,
    ]);

  return (
    <Layout
      title="Visitors"
      breadcrumb={[
        "Resident",
        "Visitors",
      ]}
    >
      <VisitorStats />

      <VisitorFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        purpose={purpose}
        setPurpose={setPurpose}
        onAddVisitor={() =>
          setOpenModal(true)
        }
      />

      <Card
        title="My Visitors"
        subtitle="Manage your visitor requests"
      >
        <VisitorTable
          visitors={filteredVisitors}
          onView={
            setSelectedVisitor
          }
          onEdit={(visitor) => {
            setEditingVisitor(
              visitor
            );
            setEditModal(true);
          }}
          onDelete={setDeleteItem}
        />
      </Card>
            {/* Add Visitor */}

      <Modal
        open={openModal}
        title="Add Visitor"
        onClose={() =>
          setOpenModal(false)
        }
      >
        <VisitorForm
          onSubmit={(data) => {
            addVisitor(data);

            setOpenModal(false);
          }}
          onClose={() =>
            setOpenModal(false)
          }
        />
      </Modal>

      {/* Edit Visitor */}

      <Modal
        open={editModal}
        title="Edit Visitor"
        onClose={() => {
          setEditModal(false);
          setEditingVisitor(null);
        }}
      >
        <VisitorForm
          initialData={editingVisitor}
          onSubmit={(data) => {
            updateVisitor(
              editingVisitor.id,
              data
            );

            setEditModal(false);
            setEditingVisitor(null);
          }}
          onClose={() => {
            setEditModal(false);
            setEditingVisitor(null);
          }}
        />
      </Modal>

      {/* Visitor Details */}

      <VisitorDetails
        visitor={selectedVisitor}
        onClose={() =>
          setSelectedVisitor(null)
        }
      />

      {/* Delete Visitor */}

      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Visitor"
        message={`Are you sure you want to delete ${deleteItem?.name}?`}
        confirmText="Delete"
        onCancel={() =>
          setDeleteItem(null)
        }
        onConfirm={() => {
          deleteVisitor(deleteItem.id);

          setDeleteItem(null);
        }}
      />
    </Layout>
  );
};

export default Visitors;