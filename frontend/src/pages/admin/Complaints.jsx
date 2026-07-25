import { useState } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";

import ComplaintStats from "../../components/complaints/ComplaintStats";
import ComplaintFilters from "../../components/complaints/ComplaintFilters";
import ComplaintTable from "../../components/complaints/ComplaintTable";
import ComplaintForm from "../../components/complaints/ComplaintForm";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
import AssignStaffModal from "../../components/complaints/AssignStaffModal";
import StatusUpdateModal from "../../components/complaints/StatusUpdateModal";
import ComplaintCategoryChart from "../../components/complaints/ComplaintsCategoryCharts";
import ComplaintTrendChart from "../../components/complaints/ComplaintTrendChart";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useComplaintStore from "../../store/complaintStore";

const Complaints = () => {
    // Zustand Store

    const complaints = useComplaintStore(
        (state) => state.complaints
    );

    const addComplaint = useComplaintStore(
        (state) => state.addComplaint
    );

    const updateComplaint = useComplaintStore(
        (state) => state.updateComplaint
    );

    const removeComplaint = useComplaintStore(
        (state) => state.deleteComplaint
    );

    // Filters

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");
    const [status, setStatus] = useState("");

    // Modals

    const [openModal, setOpenModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    // Selected Data

    const [selectedComplaint, setSelectedComplaint] =
        useState(null);

    const [editingComplaint, setEditingComplaint] =
        useState(null);

    const [assignComplaint, setAssignComplaint] =
        useState(null);

    const [statusComplaint, setStatusComplaint] =
        useState(null);

    const [deleteComplaint, setDeleteComplaint] =
        useState(null);

    // Filters

    const filteredComplaints = complaints.filter(
        (complaint) => {
            const matchesSearch =
                (complaint.ticket || "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                (complaint.title || "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                (complaint.resident || "")
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                category === "" ||
                complaint.category === category;

            const matchesPriority =
                priority === "" ||
                complaint.priority === priority;

            const matchesStatus =
                status === "" ||
                complaint.status === status;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesPriority &&
                matchesStatus
            );
        }
    );

    return (
        <Layout
            title="Complaints"
            breadcrumb={["Home", "Complaints"]}
        >
            <ComplaintStats />

            <div className="mb-6 grid gap-6 xl:grid-cols-2">
                <ComplaintCategoryChart />
                <ComplaintTrendChart />
            </div>

            <ComplaintFilters
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                priority={priority}
                setPriority={setPriority}
                status={status}
                setStatus={setStatus}
                onRaiseComplaint={() =>
                    setOpenModal(true)
                }
            />

            <ComplaintTable
                complaints={filteredComplaints}
                onView={setSelectedComplaint}
                onEdit={(item) => {
                    setEditingComplaint(item);
                    setEditModal(true);
                }}
                onAssign={setAssignComplaint}
                onStatus={setStatusComplaint}
                onDelete={setDeleteComplaint}
            />

            {/* Add Complaint */}

            <Modal
                open={openModal}
                title="Raise Complaint"
                onClose={() => setOpenModal(false)}
            >
                <ComplaintForm
                    onSubmit={(data) => {
                        addComplaint({
                            ...data,
                            id: Date.now(),
                            ticket: `CMP-${Date.now()
                                .toString()
                                .slice(-5)}`,
                            status: "Open",
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });

                        setOpenModal(false);
                    }}
                    onClose={() => setOpenModal(false)}
                />
            </Modal>

            {/* Edit Complaint */}

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
                    onSubmit={(data) => {
                        updateComplaint(
                            editingComplaint.id,
                            {
                                ...editingComplaint,
                                ...data,
                                updatedAt: new Date().toISOString(),
                            }
                        );

                        setEditModal(false);
                        setEditingComplaint(null);
                    }}
                    onClose={() => {
                        setEditModal(false);
                        setEditingComplaint(null);
                    }}
                />
            </Modal>

            {/* Details */}

            <ComplaintDetails
                complaint={selectedComplaint}
                onClose={() =>
                    setSelectedComplaint(null)
                }
            />

            {/* Assign Staff */}

            <AssignStaffModal
                complaint={assignComplaint}
                onClose={() =>
                    setAssignComplaint(null)
                }
            />

            {/* Delete */}

            <ConfirmDialog
                open={!!deleteComplaint}
                title="Delete Complaint"
                message={`Delete ${deleteComplaint?.ticket}?`}
                confirmText="Delete"
                onCancel={() =>
                    setDeleteComplaint(null)
                }
                onConfirm={() => {
                    removeComplaint(deleteComplaint.id);

                    setDeleteComplaint(null);
                }}
            />

            {/* Status Update */}

            <StatusUpdateModal
                complaint={statusComplaint}
                onUpdate={(statusData) => {
                    updateComplaint(statusComplaint.id, {
                        status: statusData.status,
                        remarks: statusData.remarks
                    });
                    toast.success("Complaint status updated successfully!");
                    setStatusComplaint(null);
                }}
                onClose={() =>
                    setStatusComplaint(null)
                }
            />
        </Layout>
    );
};

export default Complaints;