import { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import useStaffDashboardStore from "../../store/staffDashboardStore";
import useStaffStore from "../../store/staffStore";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Users,
  Shield,
  Wrench,
  Sparkles,
} from "lucide-react";

const StaffSchedules = () => {
  const { schedule, addSchedule, deleteSchedule } = useStaffDashboardStore();
  const { staff } = useStaffStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const pageSize = 8;

  // Form state
  const [title, setTitle] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [type, setType] = useState("patrol");
  const [assignedTo, setAssignedTo] = useState("");

  const activeStaff = staff.filter((s) => s.status === "Active");

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!title || !timeRange || !assignedTo) {
      toast.error("Please fill in all required fields.");
      return;
    }

    addSchedule({
      title,
      time: timeRange,
      type,
      assignedTo,
    });

    toast.success("Schedule item assigned successfully!");
    setIsAddModalOpen(false);
    setTitle("");
    setTimeRange("");
    setType("patrol");
    setAssignedTo("");
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteSchedule(deleteItem.id);
    toast.success("Schedule item removed.");
    setDeleteItem(null);
  };

  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      const matchesSearch =
        (item.title &&
          item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.assignedTo &&
          item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStaff =
        staffFilter === "All" || item.assignedTo === staffFilter;

      const matchesType = typeFilter === "All" || item.type === typeFilter;

      return matchesSearch && matchesStaff && matchesType;
    });
  }, [schedule, searchTerm, staffFilter, typeFilter]);

  const totalItems = filteredSchedule.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedSchedule = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSchedule.slice(start, start + pageSize);
  }, [filteredSchedule, currentPage]);

  // Get unique staff names from schedule for filter dropdown
  const uniqueStaffNames = useMemo(() => {
    const names = new Set(schedule.map((s) => s.assignedTo).filter(Boolean));
    return [...names];
  }, [schedule]);

  const getTypeBadgeVariant = (t) => {
    switch (t) {
      case "patrol":
        return "primary";
      case "gate":
        return "warning";
      case "verification":
        return "info";
      case "maintenance":
        return "danger";
      case "cleaning":
        return "success";
      default:
        return "default";
    }
  };

  const getTypeIcon = (t) => {
    switch (t) {
      case "patrol":
        return Shield;
      case "gate":
        return Users;
      case "maintenance":
        return Wrench;
      case "cleaning":
        return Sparkles;
      default:
        return Calendar;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active":
        return "primary";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Layout
      title="Staff Schedules"
      breadcrumb={["Home", "Staff Schedules"]}
    >
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 rounded-xl text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Total Schedules
              </p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {schedule.length}
              </h4>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Staff Assigned
              </p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {uniqueStaffNames.length}
              </h4>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 rounded-xl text-amber-600 bg-amber-50 dark:bg-amber-950/50">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Active Staff
              </p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {activeStaff.length}
              </h4>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search task or staff name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <select
                value={staffFilter}
                onChange={(e) => {
                  setStaffFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="All">All Staff</option>
                {uniqueStaffNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="All">All Types</option>
                <option value="patrol">Patrol</option>
                <option value="gate">Gate Duty</option>
                <option value="verification">Verification</option>
                <option value="maintenance">Maintenance</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus size={18} /> Assign Schedule
          </Button>
        </div>

        {/* Schedule Table */}
        {totalItems === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Schedules Found"
            description="Click 'Assign Schedule' to create a new schedule for staff members."
          />
        ) : (
          <Card className="overflow-hidden" padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Time Slot</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedSchedule.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              <TypeIcon size={18} />
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Clock size={14} />
                            {item.time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={getTypeBadgeVariant(item.type)}
                            className="capitalize"
                          >
                            {item.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                          {item.assignedTo || "Unassigned"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={getStatusBadgeVariant(
                              item.status
                            )}
                            className="capitalize"
                          >
                            {item.status || "upcoming"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                            title="Delete Schedule"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Add Schedule Modal */}
        <Modal
          open={isAddModalOpen}
          title="Assign Schedule to Staff"
          onClose={() => setIsAddModalOpen(false)}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSchedule}>
                Assign Schedule
              </Button>
            </div>
          }
        >
          <form
            className="space-y-4"
            onSubmit={handleAddSchedule}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Assign To Staff *
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="">Select Staff Member</option>
                {activeStaff.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} — {s.department}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Task Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Patrol - A Block"
              required
            />

            <Input
              label="Time Slot *"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              placeholder="e.g. 06:00 - 08:00"
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Task Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="patrol">Patrol</option>
                <option value="gate">Gate Duty</option>
                <option value="verification">
                  Verification
                </option>
                <option value="maintenance">
                  Maintenance
                </option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          </form>
        </Modal>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={!!deleteItem}
          title="Delete Schedule"
          message={`Remove "${deleteItem?.title}" from ${deleteItem?.assignedTo || "staff"}'s schedule?`}
          confirmText="Delete"
          onCancel={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      </div>
    </Layout>
  );
};

export default StaffSchedules;
