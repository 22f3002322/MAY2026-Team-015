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

import useComplaintStore from "../../store/complaintStore";
import useAuthStore from "../../store/authStore";
import { COMPLAINT_STATUS, labelFor } from "../../utils/adminMaps";

const Complaints = () => {
  const complaints = useComplaintStore((state) => state.complaints);
  const categories = useComplaintStore((state) => state.categories);
  const fetchComplaints = useComplaintStore((state) => state.fetchComplaints);
  const fetchCategories = useComplaintStore((state) => state.fetchCategories);
  const addComplaint = useComplaintStore((state) => state.addComplaint);
  const updateComplaint = useComplaintStore((state) => state.updateComplaint);
  const { user, isVerified } = useAuthStore();

  useEffect(() => {
    fetchComplaints();
    fetchCategories();
  }, [fetchComplaints, fetchCategories]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [editModal, setEditModal] = useState(false);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesSearch =
        (complaint.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (complaint.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "" ||
        complaint.statusValue === status ||
        complaint.status === labelFor(COMPLAINT_STATUS, status);

      const matchesCategory =
        category === "" ||
        String(complaint.category_id) === String(category) ||
        complaint.category === category;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, search, status, category]);

  const userIsVerified = isVerified === true && user?.isVerified !== false;

  return (
    <Layout title="My Complaints" breadcrumb={["Resident", "Complaints"]}>
      <ComplaintStats complaints={complaints} />

      <ComplaintFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        categories={categories}
        onRaiseComplaint={() => {
          if (!userIsVerified) {
            toast.error(
              "Your account must be verified by the Committee to raise complaints."
            );
            return;
          }
          setOpenModal(true);
        }}
      />

      <Card>
        <ComplaintTable
          complaints={filteredComplaints}
          onView={setSelectedComplaint}
          onEdit={(complaint) => {
            if (!userIsVerified) {
              toast.error(
                "Your account must be verified by the Committee to edit complaints."
              );
              return;
            }
            setEditingComplaint(complaint);
            setEditModal(true);
          }}
        />
      </Card>

      <Modal
        open={openModal}
        title="Raise Complaint"
        onClose={() => setOpenModal(false)}
      >
        <ComplaintForm
          onSubmit={async (data) => {
            const res = await addComplaint(data);
            if (res?.success) {
              toast.success(res.message || "Complaint submitted successfully!");
              if (res.imageUploadFailed) {
                toast.warning(
                  "Complaint created, but image upload failed. You can try again later."
                );
              }
              setOpenModal(false);
            } else {
              toast.error(res?.message || "Failed to submit complaint.");
            }
          }}
          onClose={() => setOpenModal(false)}
        />
      </Modal>

      <Modal
        open={editModal}
        title="Edit Complaint"
        onClose={() => {
          setEditModal(false);
          setEditingComplaint(null);
        }}
      >
        <ComplaintForm
          initialData={editingComplaint}
          isEdit
          onSubmit={async (data) => {
            const res = await updateComplaint(editingComplaint.id, {
              description: data.description,
              priority: data.priority,
            });
            if (res?.success) {
              toast.success(res.message || "Complaint updated successfully!");
              setEditModal(false);
              setEditingComplaint(null);
            } else {
              toast.error(res?.message || "Failed to update complaint.");
            }
          }}
          onClose={() => {
            setEditModal(false);
            setEditingComplaint(null);
          }}
        />
      </Modal>

      <ComplaintDetails
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </Layout>
  );
};

export default Complaints;
