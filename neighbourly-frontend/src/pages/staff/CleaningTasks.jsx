import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import useStaffDashboardStore from "../../store/staffDashboardStore";
import useAuthStore from "../../store/authStore";
import { toast } from "sonner";
import { Search, Plus, Sparkles, Check, Play, Calendar } from "lucide-react";

const CleaningTasks = () => {
  const { cleaningTasks, addCleaningTask, startCleaningTask, completeCleaningTask } = useStaffDashboardStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const pageSize = 6;

  // Form State
  const [area, setArea] = useState("");
  const [floor, setFloor] = useState("");
  const [type, setType] = useState("Regular");
  const [assignedTo, setAssignedTo] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!area || !floor || !assignedTo || !scheduledDate || !scheduledTime) {
      toast.error("Please fill in all required fields.");
      return;
    }

    addCleaningTask({
      area,
      floor,
      type,
      assignedTo,
      scheduledDate,
      scheduledTime,
      notes,
      status: "Pending"
    });

    toast.success("Cleaning task scheduled successfully!");
    setIsAddModalOpen(false);

    // Reset Form
    setArea("");
    setFloor("");
    setType("Regular");
    setAssignedTo("");
    setScheduledDate("");
    setScheduledTime("");
    setNotes("");
  };

  const handleStartTask = (id) => {
    startCleaningTask(id);
    toast.success("Cleaning task set to In Progress.");
  };

  const handleCompleteTask = (id) => {
    completeCleaningTask(id);
    toast.success("Cleaning task completed successfully!");
  };

  const filteredTasks = useMemo(() => {
    return cleaningTasks.filter((t) => {
      // Filter tasks assigned to this user or housekeeping general staff
      const matchesUser = t.assignedTo === user?.name || t.assignedTo?.toLowerCase() === "geeta" || t.assignedTo?.toLowerCase() === "ramu" || t.assignedTo?.toLowerCase() === "sita" || t.assignedTo?.toLowerCase() === "geeta devi";
      if (!matchesUser) return false;

      const matchesSearch = 
        (t.area && t.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.floor && t.floor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesType = typeFilter === "All" || t.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime));
  }, [cleaningTasks, searchTerm, statusFilter, typeFilter, user]);

  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage]);

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case "Deep Clean": return "warning";
      case "Sanitization": return "danger";
      default: return "default";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "primary";
      default: return "warning";
    }
  };

  return (
    <Layout title="Cleaning Tasks" breadcrumb={["Staff", "Cleaning Tasks"]}>
      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search area, floor..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="All">All Types</option>
                <option value="Regular">Regular</option>
                <option value="Deep Clean">Deep Clean</option>
                <option value="Sanitization">Sanitization</option>
              </select>
            </div>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 w-full md:w-auto justify-center">
            <Plus size={18} /> Add Task
          </Button>
        </div>

        {/* Task Cards */}
        {totalItems === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Cleaning Tasks"
            description="All areas are clean and tidy. Click 'Add Task' to assign new areas."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTasks.map((task) => (
              <Card key={task.id} className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white leading-snug">{task.area}</h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">{task.floor}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <Badge variant={getTypeBadgeVariant(task.type)}>{task.type}</Badge>
                      <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg text-slate-500 italic mt-3">
                      Note: {task.notes}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-slate-400">Scheduled Date</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{task.scheduledDate}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Scheduled Time</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{task.scheduledTime}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Assigned To</span>
                      <span className="font-medium text-slate-600 dark:text-slate-450 capitalize">{task.assignedTo}</span>
                    </div>
                    {task.completedAt && (
                      <div>
                        <span className="block text-slate-400">Completed At</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-450">{new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {task.status === "Pending" && (
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-1 bg-indigo-600 text-white"
                      onClick={() => handleStartTask(task.id)}
                    >
                      <Play size={15} /> Start Task
                    </Button>
                  )}
                  {task.status === "In Progress" && (
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      <Check size={15} /> Complete Task
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

        {/* Modal */}
        <Modal
          open={isAddModalOpen}
          title="Schedule Cleaning Task"
          onClose={() => setIsAddModalOpen(false)}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTask}>Schedule Task</Button>
            </div>
          }
        >
          <form className="space-y-4" onSubmit={handleAddTask}>
            <Input
              label="Area / Room Name *"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Lobby, Elevators, Gym"
              required
            />
            <Input
              label="Floor / Level *"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. Ground Floor, 3rd Floor"
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cleaning Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="Regular">Regular Clean</option>
                <option value="Deep Clean">Deep Clean</option>
                <option value="Sanitization">Sanitization</option>
              </select>
            </div>
            <Input
              label="Assign To *"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Geeta, Ramu, Sita"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date *"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
              <Input
                label="Time *"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
            <Input
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Use organic floor cleaner"
            />
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CleaningTasks;
