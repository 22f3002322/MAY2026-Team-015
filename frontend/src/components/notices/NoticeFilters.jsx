import { Search, Plus } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import { NOTICE_PRIORITY } from "../../utils/adminMaps";

const NoticeFilters = ({
  search,
  setSearch,
  priority,
  setPriority,
  status,
  setStatus,
  onAddNotice,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          placeholder="Search notice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4"
          >
            <option value="">All Priorities</option>
            {NOTICE_PRIORITY.map((o) => (
              <option key={o.value} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4"
          >
            <option value="">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="flex h-full items-end">
          <Button className="h-14 w-full" onClick={onAddNotice}>
            <Plus size={18} />
            Publish Notice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoticeFilters;
