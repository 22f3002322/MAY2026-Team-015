import {
  Search,
  Plus,
  Download,
} from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const ComplaintFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
  status,
  setStatus,
  onRaiseComplaint,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

      <div className="grid grid-cols-12 gap-5 items-end">

        <div className="col-span-12 xl:col-span-3">
          <Input
            label="Search"
            placeholder="Ticket / Resident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="col-span-12 md:col-span-4 xl:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All</option>
            <option>Electrical</option>
            <option>Plumbing</option>
            <option>Maintenance</option>
            <option>Cleaning</option>
            <option>Security</option>
          </select>
        </div>

        <div className="col-span-12 md:col-span-4 xl:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        <div className="col-span-12 md:col-span-4 xl:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All</option>
            <option>Open</option>
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
        </div>

        <div className="col-span-12 xl:col-span-3">
          <label className="mb-2 block opacity-0">
            Actions
          </label>

          <div className="flex gap-3">

            <Button
              variant="outline"
              className="h-14 w-14 p-0"
            >
              <Download size={18} />
            </Button>

            <Button
              className="h-14 flex-1"
              onClick={onRaiseComplaint}
            >
              <Plus size={18} />
              Raise Complaint
            </Button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ComplaintFilters;