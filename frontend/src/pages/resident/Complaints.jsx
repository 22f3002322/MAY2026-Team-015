import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

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
import useAuthStore from "../../store/authStore";

const Complaints = () => {
  // Zustand Store
  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  const fetchComplaints = useComplaintStore(
    (state) => state.fetchComplaints
  );
  
  const { user, isVerified } = useAuthStore();

  const addComplaint = useComplaintStore(
    (state) => state.addComplaint
  );

  const updateComplaint = useComplaintStore(
    (state) => state.updateComplaint
  );

  const deleteComplaint = useComplaintStore(
    (state) => state.deleteComplaint
  );

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

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
      return complaints
        .filter(
          (complaint) =>
            complaint.flat === user?.flat
        )
        .filter(
        (complaint) => {
          const matchesSearch =
            (complaint.title || "")
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            (complaint.description || "")
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
      user,
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
        onRaiseComplaint={() => {
          const userIsVerified = isVerified !== false && user?.isVerified !== false;
          if (!userIsVerified) {
            toast.error("Your account must be verified by the Committee to raise complaints.");
            return;
          }
          setOpenModal(true);
        }}
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
            const userIsVerified = isVerified !== false && user?.isVerified !== false;
            if (!userIsVerified) {
              toast.error("Your account must be verified by the Committee to edit complaints.");
              return;
            }
            setEditingComplaint(
              complaint
            );
            setEditModal(true);
          }}
          onDelete={(complaint) => {
            const userIsVerified = isVerified !== false && user?.isVerified !== false;
            if (!userIsVerified) {
              toast.error("Your account must be verified by the Committee to delete complaints.");
              return;
            }
            setDeleteItem(complaint);
          }}
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
          onSubmit={async (data) => {
            const res = await addComplaint(data);
            if (res?.success) {
              toast.success(res.message || "Complaint submitted successfully!");
              setOpenModal(false);
            } else {
              toast.error(res?.message || "Failed to submit complaint.");
            }
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
            toast.success("Complaint updated successfully!");

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