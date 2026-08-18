import { Search, Plus } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const PollFilters = ({ search, setSearch, status, setStatus, onCreate }) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Search"
          placeholder="Search polls..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

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
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button className="h-14 w-full" onClick={onCreate}>
            <Plus size={18} />
            Create Poll
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PollFilters;
