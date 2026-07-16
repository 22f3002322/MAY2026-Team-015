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
import { toast } from "sonner";
import { Search, Plus, AlertTriangle, ShieldAlert, Check } from "lucide-react";

const IncidentReports = () => {
  const { incidents, addIncident, updateIncident } = useStaffDashboardStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const pageSize = 6;

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [reportedBy, setReportedBy] = useState("");

  const handleAddIncident = (e) => {
    e.preventDefault();
    if (!title || !description || !location || !reportedBy) {
      toast.error("Please fill in all required fields.");
      return;
    }

    addIncident({
      title,
      description,
      location,
      severity,
      reportedBy,
      status: "Open"
    });

    toast.success("Incident reported successfully!");
    setIsAddModalOpen(false);

    // Reset Form
    setTitle("");
    setDescription("");
    setLocation("");
    setSeverity("Low");
    setReportedBy("");
  };

  const handleResolveIncident = (id) => {
    updateIncident(id, { status: "Resolved" });
    toast.success("Incident marked as Resolved.");
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((i) => {
      const matchesSearch = 
        (i.title && i.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.location && i.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "All" || i.status === statusFilter;
      const matchesSeverity = severityFilter === "All" || i.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [incidents, searchTerm, statusFilter, severityFilter]);

  const totalItems = filteredIncidents.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIncidents.slice(start, start + pageSize);
  }, [filteredIncidents, currentPage]);

  const getSeverityBadgeVariant = (sev) => {
    switch (sev) {
      case "High": return "danger";
      case "Medium": return "warning";
      default: return "default";
    }
  };

  return (
    <Layout title="Incident Reports" breadcrumb={["Staff", "Incident Reports"]}>
      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search location, details..."
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
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="All">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 w-full md:w-auto justify-center">
            <Plus size={18} /> File Report
          </Button>
        </div>

        {/* Card Grid */}
        {totalItems === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Incidents Reported"
            description="All secure. Use 'File Report' to log a new incident."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedIncidents.map((incident) => (
              <Card key={incident.id} className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-white leading-snug">{incident.title}</h3>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <Badge variant={getSeverityBadgeVariant(incident.severity)}>{incident.severity}</Badge>
                      <Badge variant={incident.status === "Resolved" ? "success" : "warning"}>{incident.status}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-3">
                    {incident.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-slate-400">Location</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{incident.location}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Reported By</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{incident.reportedBy}</span>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="block text-slate-400">Date Logged</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">{new Date(incident.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {incident.status === "Open" && (
                  <Button
                    size="sm"
                    className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleResolveIncident(incident.id)}
                  >
                    <Check size={15} /> Resolve Incident
                  </Button>
                )}
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
          title="File Incident Report"
          onClose={() => setIsAddModalOpen(false)}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddIncident}>File Report</Button>
            </div>
          }
        >
          <form className="space-y-4" onSubmit={handleAddIncident}>
            <Input
              label="Incident Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken lock on rear gate, water leakage"
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description / Details *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide accurate details..."
                className="w-full min-h-[100px] rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                required
              />
            </div>
            <Input
              label="Location *"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. C-Block Lobby, Parking Lot 3"
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <Input
              label="Reported By *"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              placeholder="e.g. Guard Rajesh, Security Room"
              required
            />
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default IncidentReports;
