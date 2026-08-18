import { Search } from "lucide-react";
import { useEffect } from "react";

import Input from "../ui/Input";
import useComplaintStore from "../../store/complaintStore";
import { COMPLAINT_PRIORITY, COMPLAINT_STATUS } from "../../utils/adminMaps";

const ComplaintFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
  status,
  setStatus,
}) => {
  const categories = useComplaintStore((s) => s.categories);
  const fetchCategories = useComplaintStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

        <div className="col-span-12 md:col-span-4 xl:col-span-3">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_name}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-4 xl:col-span-3">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4"
          >
            <option value="">All</option>
            {COMPLAINT_PRIORITY.map((o) => (
              <option key={o.value} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-4 xl:col-span-3">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4"
          >
            <option value="">All</option>
            {COMPLAINT_STATUS.map((o) => (
              <option key={o.value} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ComplaintFilters;
