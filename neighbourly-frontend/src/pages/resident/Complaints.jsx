import { useMemo, useState } from "react";

import Layout from "../../components/layout/Layout";

import ComplaintStats from "../../components/residents/complaints/ComplaintStats";
import ComplaintFilters from "../../components/residents/complaints/ComplaintFilters";
import ComplaintTable from "../../components/residents/complaints/ComplaintTable";
import ComplaintForm from "../../components/residents/complaints/ComplaintForm";
import ComplaintDetails from "../../components/residents/complaints/ComplaintDetails";

import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useComplaintStore from "../../store/complaintStore";

const Complaints = () => {
  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  const addComplaint = useComplaintStore(
    (state) => state.addComplaint
  );

  const updateComplaint = useComplaintStore(
    (state) => state.updateComplaint
  );

  const deleteComplaint = useComplaintStore(
    (state) => state.deleteComplaint
  );

  // Filters

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [category, setCategory] =
    useState("");

  // View

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  // Add

  const [openModal, setOpenModal] =
    useState(false);

  // Edit

  const [editingComplaint, setEditingComplaint] =
    useState(null);

  const [editModal, setEditModal] =
    useState(false);

  // Delete

  const [deleteItem, setDeleteItem] =
    useState(null);

  // Filtering

  const filteredComplaints =
    useMemo(() => {
      return complaints.filter(
        (complaint) => {
          const matchesSearch =
            complaint.title
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            complaint.description
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            status === "" ||
            complaint.status === status;

          const matchesCategory =
            category === "" ||
            complaint.category ===
              category;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );
        }
      );
    }, [
      complaints,
      search,
      status,
      category,
    ]);

  return (
    <Layout
      title="My Complaints"
      breadcrumb={[
        "Resident",
        "Complaints",
      ]}
    >
      <ComplaintStats />

      <ComplaintFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        onRaiseComplaint={() =>
          setOpenModal(true)
        }
      />

      <Card>
        <ComplaintTable
          complaints={
            filteredComplaints
          }
          onView={
            setSelectedComplaint
          }
          onEdit={(complaint) => {
            setEditingComplaint(
              complaint
            );
            setEditModal(true);
          }}
          onDelete={
            setDeleteItem
          }
        />
      </Card>

      {/* Add */}

      <Modal
        open={openModal}
        title="Raise Complaint"
        onClose={() =>
          setOpenModal(false)
        }
      >
        <ComplaintForm
          onSubmit={(data) => {
            addComplaint({
              ...data,
              resident:
                "Current Resident",
            });

            setOpenModal(false);
          }}
          onClose={() =>
            setOpenModal(false)
          }
        />
      </Modal>

      {/* Edit */}

      <Modal
        open={editModal}
        title="Edit Complaint"
        onClose={() => {
          setEditModal(false);
          setEditingComplaint(
            null
          );
        }}
      >
        <ComplaintForm
          initialData={
            editingComplaint
          }
          onSubmit={(data) => {
            updateComplaint(
              editingComplaint.id,
              data
            );

            setEditModal(false);
            setEditingComplaint(
              null
            );
          }}
          onClose={() => {
            setEditModal(false);
            setEditingComplaint(
              null
            );
          }}
        />
      </Modal>

      {/* Details */}

      <ComplaintDetails
        complaint={
          selectedComplaint
        }
        onClose={() =>
          setSelectedComplaint(
            null
          )
        }
      />

      {/* Delete */}

      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Complaint"
        message={`Are you sure you want to delete "${deleteItem?.title}"?`}
        confirmText="Delete"
        onCancel={() =>
          setDeleteItem(null)
        }
        onConfirm={() => {
          deleteComplaint(
            deleteItem.id
          );

          setDeleteItem(null);
        }}
      />
    </Layout>
  );
};

export default Complaints;