import { useState } from "react";

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

import { complaints } from "../../mock/complaints";

const Complaints = () => {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");
    const [status, setStatus] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [editingComplaint, setEditingComplaint] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [assignComplaint, setAssignComplaint] = useState(null);
    const [deleteComplaint, setDeleteComplaint] = useState(null);
    const [statusComplaint, setStatusComplaint] = useState(null);

    const filteredComplaints = complaints.filter((complaint) => {
        const matchesSearch =
            complaint.ticket.toLowerCase().includes(search.toLowerCase()) ||
            complaint.title.toLowerCase().includes(search.toLowerCase()) ||
            complaint.resident.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            category === "" || complaint.category === category;

        const matchesPriority =
            priority === "" || complaint.priority === priority;

        const matchesStatus =
            status === "" || complaint.status === status;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesPriority &&
            matchesStatus
        );
    });

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
                onRaiseComplaint={() => setOpenModal(true)}
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
            <Modal
                open={openModal}
                title="Raise Complaint"
                onClose={() => setOpenModal(false)}
            >
                <ComplaintForm
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
            <AssignStaffModal
                complaint={assignComplaint}
                onClose={() => setAssignComplaint(null)}
            />
            <ConfirmDialog
                open={!!deleteComplaint}
                title="Delete Complaint"
                message={`Delete ${deleteComplaint?.ticket}?`}
                confirmText="Delete"
                onCancel={() => setDeleteComplaint(null)}
                onConfirm={() => {
                    console.log(deleteComplaint);

                    setDeleteComplaint(null);
                }}
            />
            <StatusUpdateModal
                complaint={statusComplaint}
                onClose={() => setStatusComplaint(null)}
            />
        </Layout>
    );
};

export default Complaints;