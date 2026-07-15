import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import useComplaintStore from "../../store/complaintStore";
import useAuthStore from "../../store/authStore";
import { toast } from "sonner";
import { Search, Wrench, CheckCircle, Clock } from "lucide-react";

const AssignedComplaints = () => {
  const { complaints, updateComplaint } = useComplaintStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("In Progress");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const pageSize = 6;

  const handleAcceptJob = (id) => {
    updateComplaint(id, { status: "In Progress" });
    toast.success("Job accepted. Status changed to In Progress.");
  };

  const handleOpenUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setUpdateNotes("");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStatusSubmit = (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    updateComplaint(selectedComplaint.id, {
      status: updateStatus,
      resolutionNotes: updateNotes,
      resolvedAt: updateStatus === "Resolved" ? new Date().toISOString() : undefined
    });

    toast.success(`Complaint status updated to ${updateStatus}!`);
    setIsUpdateModalOpen(false);
    setSelectedComplaint(null);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Filter only complaints assigned to this staff or with match
      const isAssigned = c.assignedTo === user?.name || c.assignedTo?.toLowerCase() === "maintenance team";
      const isPendingOrActive = c.status === "Assigned" || c.status === "In Progress";
      if (!isAssigned || !isPendingOrActive) return false;

      const matchesSearch = 
        (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.resident && c.resident.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [complaints, searchTerm, priorityFilter, user]);

  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, currentPage]);

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "High": return "danger";
      case "Medium": return "warning";
      default: return "default";
    }
  };

  return (
    <Layout title="Assigned Complaints" breadcrumb={["Staff", "Assigned Complaints"]}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by title, resident, category..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-48 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {totalItems === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No Assigned Complaints"
            description="You currently have no complaints assigned to you."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedComplaints.map((complaint) => (
              <Card key={complaint.id} className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-white leading-snug">{complaint.title}</h3>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <Badge variant={getPriorityBadgeVariant(complaint.priority)}>{complaint.priority}</Badge>
                      <Badge variant={complaint.status === "In Progress" ? "primary" : "warning"}>{complaint.status}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-3">
                    {complaint.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-slate-400">Resident</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{complaint.resident}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Flat</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{complaint.flat}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Category</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">{complaint.category}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Logged Date</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {complaint.status === "Assigned" ? (
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-1 bg-indigo-600 text-white"
                      onClick={() => handleAcceptJob(complaint.id)}
                    >
                      <Clock size={15} /> Accept Job
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleOpenUpdateModal(complaint)}
                    >
                      <CheckCircle size={15} /> Update Status
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Update Status Modal */}
        <Modal
          open={isUpdateModalOpen}
          title="Update Complaint Status"
          onClose={() => setIsUpdateModalOpen(false)}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateStatusSubmit}>Save Changes</Button>
            </div>
          }
        >
          {selectedComplaint && (
            <form className="space-y-4" onSubmit={handleUpdateStatusSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Resolution Details / Actions Taken</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Explain how it was resolved..."
                  className="w-full min-h-[100px] rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                />
              </div>
            </form>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AssignedComplaints;
