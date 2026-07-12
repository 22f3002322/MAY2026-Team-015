import { Search, Plus } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const PollFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  onCreate,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="grid gap-4 lg:grid-cols-5">

        {/* Search */}

        <Input
          label="Search"
          placeholder="Search polls..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        {/* Category */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600"
          >
            <option value="">All Categories</option>
            <option>Community</option>
            <option>Parking</option>
            <option>Finance</option>
            <option>Events</option>
          </select>

        </div>

        {/* Status */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600"
          >
            <option value="">All Status</option>
            <option>Active</option>
            <option>Closed</option>
            <option>Draft</option>
          </select>

        </div>

        {/* Empty Column */}

        <div />

        {/* Create Button */}

        <div className="flex items-end">

          <Button
            className="h-14 w-full"
            onClick={onCreate}
          >
            <Plus size={18} />

            Create Poll
          </Button>

        </div>

      </div>

    </div>
  );
};

export default PollFilters;