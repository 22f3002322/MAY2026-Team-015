import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import useVisitorStore from "../../store/visitorStore";
import { Search, ShieldAlert, Calendar } from "lucide-react";

const VisitorHistory = () => {
  const { visitors } = useVisitorStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const matchesSearch = 
        (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.phone && v.phone.includes(searchTerm)) ||
        (v.flat && v.flat.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDate = !dateFilter || (v.date && v.date === dateFilter);
      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [visitors, searchTerm, dateFilter]);

  const totalItems = filteredVisitors.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedVisitors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVisitors.slice(start, start + pageSize);
  }, [filteredVisitors, currentPage]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "danger";
      case "Expected": return "warning";
      case "Checked In": return "primary";
      case "Checked Out": return "secondary";
      default: return "default";
    }
  };

  return (
    <Layout title="Visitor History" breadcrumb={["Staff", "Visitor History"]}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, flat..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0 flex items-center gap-1">
              <Calendar size={15} /> Date:
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-48 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
            />
          </div>
        </div>

        {totalItems === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Records Found"
            description="No visitors match the given search criteria or date."
          />
        ) : (
          <Card className="overflow-hidden" padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Visitor</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Flat Target</th>
                    <th className="px-6 py-4">Purpose</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{visitor.name}</td>
                      <td className="px-6 py-4">{visitor.phone}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{visitor.flat}</td>
                      <td className="px-6 py-4">{visitor.purpose}</td>
                      <td className="px-6 py-4">{visitor.date}</td>
                      <td className="px-6 py-4">{visitor.time || "N/A"}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant={getStatusBadgeVariant(visitor.status)}>{visitor.status}</Badge>
                      </td>
                    </tr>
                  ))}
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
      </div>
    </Layout>
  );
};

export default VisitorHistory;
