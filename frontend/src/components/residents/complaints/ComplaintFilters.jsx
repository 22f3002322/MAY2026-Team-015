import { Search, Plus } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { COMPLAINT_STATUS } from "../../../utils/adminMaps";

const ComplaintFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
  categories = [],
  onRaiseComplaint,
}) => {
  return (
    <Card className="mb-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search complaint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 outline-none transition focus:border-indigo-600 dark:border-slate-700"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-12 rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600 dark:border-slate-700"
        >
          <option value="">All Status</option>
          {COMPLAINT_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600 dark:border-slate-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.category_id} value={String(c.category_id)}>
              {c.category_name}
            </option>
          ))}
        </select>

        <Button onClick={onRaiseComplaint} className="h-12 w-full">
          <Plus size={18} />
          Raise Complaint
        </Button>
      </div>
    </Card>
  );
};

export default ComplaintFilters;
