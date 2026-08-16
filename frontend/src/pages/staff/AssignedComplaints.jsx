import React, { useState, useMemo, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/empty/EmptyState";
import useMaintenanceStore from "../../store/maintenanceStore";
import { toast } from "sonner";
import {
  Search,
  Wrench,
  CheckCircle,
  PlayCircle,
  Clock,
  RefreshCw,
  Calendar,
} from "lucide-react";

// Normalize backend task status
const normalizeTaskStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "accepted") return "Accepted";
  if (s === "scheduled") return "Scheduled";
  if (s === "in_progress" || s === "in progress") return "In Progress";
  if (s === "completed") return "Completed";
  return status || "Pending";
};

const getStatusVariant = (status) => {
  const s = normalizeTaskStatus(status);
  if (s === "Completed") return "success";
  if (s === "In Progress") return "primary";
  if (s === "Scheduled") return "warning";
  return "default";
};

const getPriorityVariant = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p === "high") return "danger";
  if (p === "medium") return "warning";
  return "default";
};

const AssignedComplaints = () => {
  const { tasks, fetchMyTasks, startTask, completeTask, scheduleTask, loading } =
    useMaintenanceStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const pageSize = 6;

  useEffect(() => {
    fetchMyTasks();
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const norm = normalizeTaskStatus(t.status);
        // Active tasks only (not completed)
        const matchesStatus =
          statusFilter === "All" || norm === statusFilter;

        const matchesSearch =
          !searchTerm ||
          String(t.task_id || "").includes(searchTerm) ||
          String(t.complaint_id || "").includes(searchTerm) ||
          (t.description || "").toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        // Put in_progress first, then accepted, then scheduled, then completed
        const order = { in_progress: 0, accepted: 1, scheduled: 2, completed: 3 };
        return (order[String(a.status).toLowerCase()] ?? 4) -
          (order[String(b.status).toLowerCase()] ?? 4);
      });
  }, [tasks, searchTerm, statusFilter]);

  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage]);

  // Start task (accepted → in_progress)
  const handleStart = async (task) => {
    setActionLoading(task.task_id);
    const res = await startTask(task.task_id);
    setActionLoading(null);
    if (res.success) {
      toast.success(`Task #${task.task_id} started!`);
    } else {
      toast.error(res.message || "Failed to start task.");
    }
  };

  // Complete task (in_progress → completed)
  const handleComplete = async (task) => {
    setActionLoading(task.task_id);
    const res = await completeTask(task.task_id);
    setActionLoading(null);
    if (res.success) {
      toast.success(`Task #${task.task_id} completed! Complaint resolved.`);
    } else {
      toast.error(res.message || "Failed to complete task.");
    }
  };

  // Open schedule modal (accepted → scheduled)
  const handleOpenSchedule = (task) => {
    setScheduleTarget(task);
    setScheduledAt("");
    setScheduleModal(true);
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleTarget || !scheduledAt) {
      toast.error("Please select a date and time.");
      return;
    }
    setActionLoading(scheduleTarget.task_id);
    const res = await scheduleTask(scheduleTarget.task_id, scheduledAt);
    setActionLoading(null);
    if (res.success) {
      toast.success(`Task #${scheduleTarget.task_id} scheduled for ${new Date(scheduledAt).toLocaleString()}`);
      setScheduleModal(false);
      setScheduleTarget(null);
    } else {
      toast.error(res.message || "Failed to schedule task.");
    }
  };

  return (
    <Layout
      title="Assigned Complaints"
      breadcrumb={["Staff", "Assigned Complaints"]}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by task ID, complaint ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-44 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
            >
              <option value="All">All</option>
              <option value="Accepted">Accepted</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchMyTasks()}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Task Cards */}
        {loading && tasks.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-10">
            Loading tasks...
          </p>
        ) : totalItems === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No Assigned Tasks"
            description="You have no maintenance tasks assigned to you at the moment."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTasks.map((task) => {
              const normStatus = normalizeTaskStatus(task.status);
              const isActing = actionLoading === task.task_id;

              return (
                <Card
                  key={task.task_id}
                  className="flex flex-col justify-between h-full space-y-4"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">
                          Task #{task.task_id}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Complaint #{task.complaint_id}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={getStatusVariant(task.status)}>
                          {normStatus}
                        </Badge>
                        {task.priority && (
                          <Badge variant={getPriorityVariant(task.priority)} className="capitalize">
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-3">
                        {task.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {task.scheduled_at && (
                        <div className="col-span-2">
                          <span className="block text-slate-400">Scheduled At</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {new Date(task.scheduled_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                      {task.assigned_at && (
                        <div>
                          <span className="block text-slate-400">Assigned</span>
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {new Date(task.assigned_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {task.completed_at && (
                        <div>
                          <span className="block text-slate-400">Completed</span>
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {new Date(task.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                    {/* accepted → can schedule or start directly */}
                    {normStatus === "Accepted" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-1"
                          onClick={() => handleOpenSchedule(task)}
                          loading={isActing}
                        >
                          <Calendar size={14} /> Schedule
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => handleStart(task)}
                          loading={isActing}
                        >
                          <PlayCircle size={14} /> Start Now
                        </Button>
                      </>
                    )}

                    {/* scheduled → start */}
                    {normStatus === "Scheduled" && (
                      <Button
                        size="sm"
                        className="w-full flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => handleStart(task)}
                        loading={isActing}
                      >
                        <PlayCircle size={14} /> Start Work
                      </Button>
                    )}

                    {/* in_progress → complete */}
                    {normStatus === "In Progress" && (
                      <Button
                        size="sm"
                        className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleComplete(task)}
                        loading={isActing}
                      >
                        <CheckCircle size={14} /> Mark Complete
                      </Button>
                    )}

                    {normStatus === "Completed" && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 w-full text-center py-1 font-semibold">
                        ✓ Task completed
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages} ({totalItems} tasks)
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal
        open={scheduleModal}
        title="Schedule Task"
        onClose={() => {
          setScheduleModal(false);
          setScheduleTarget(null);
        }}
      >
        {scheduleTarget && (
          <div className="space-y-5">
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Task</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  #{scheduleTarget.task_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Complaint</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  #{scheduleTarget.complaint_id}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setScheduleModal(false);
                  setScheduleTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button
                loading={actionLoading === scheduleTarget.task_id}
                onClick={handleScheduleSubmit}
              >
                Confirm Schedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default AssignedComplaints;
