import { Search, Plus } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const VisitorFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  date,
  setDate,
  onRegisterVisitor,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* Search */}

        <Input
          label="Search"
          placeholder="Search visitor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        {/* Date */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600"
          />
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
            <option>Checked In</option>
            <option>Checked Out</option>
          </select>
        </div>

        {/* Button */}

        <div className="flex h-full items-end">
          <Button
            className="h-14 w-full"
            onClick={onRegisterVisitor}
          >
            <Plus size={18} />
            Register Visitor
          </Button>
        </div>

      </div>

    </div>
  );
};

export default VisitorFilters;