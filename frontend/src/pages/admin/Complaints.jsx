import { useState, useEffect } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";

import ComplaintStats from "../../components/complaints/ComplaintStats";
import ComplaintFilters from "../../components/complaints/ComplaintFilters";
import ComplaintTable from "../../components/complaints/ComplaintTable";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
import AssignStaffModal from "../../components/complaints/AssignStaffModal";
import StatusUpdateModal from "../../components/complaints/StatusUpdateModal";
import ComplaintCategoryChart from "../../components/complaints/ComplaintsCategoryCharts";
import ComplaintTrendChart from "../../components/complaints/ComplaintTrendChart";

import useComplaintStore from "../../store/complaintStore";

const Complaints = () => {
  const complaints = useComplaintStore((state) => state.complaints);
  const fetchComplaints = useComplaintStore((state) => state.fetchComplaints);
  const updateComplaint = useComplaintStore((state) => state.updateComplaint);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignComplaint, setAssignComplaint] = useState(null);
  const [statusComplaint, setStatusComplaint] = useState(null);

  const filteredComplaints = complaints.filter((complaint) => {
    const q = search.toLowerCase();
    const matchesSearch =
      String(complaint.ticket || "").toLowerCase().includes(q) ||
      String(complaint.title || "").toLowerCase().includes(q) ||
      String(complaint.resident || "").toLowerCase().includes(q);

    const matchesCategory = category === "" || complaint.category === category;
    const matchesPriority = priority === "" || complaint.priority === priority;
    const matchesStatus = status === "" || complaint.status === status;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <Layout title="Complaints" breadcrumb={["Home", "Complaints"]}>
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
      />

      <ComplaintTable
        complaints={filteredComplaints}
        onView={setSelectedComplaint}
        onAssign={setAssignComplaint}
        onStatus={setStatusComplaint}
      />

      <ComplaintDetails
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />

      <AssignStaffModal
        complaint={assignComplaint}
        onClose={() => setAssignComplaint(null)}
      />

      <StatusUpdateModal
        complaint={statusComplaint}
        onClose={() => setStatusComplaint(null)}
        onUpdate={async (statusData) => {
          const res = await updateComplaint(statusComplaint.id, {
            status: statusData.status,
          });
          if (res.success) {
            toast.success("Complaint status updated.");
            setStatusComplaint(null);
          } else {
            toast.error(res.message || "Status update failed.");
          }
        }}
      />
    </Layout>
  );
};

export default Complaints;
