import {
  Search,
  Plus,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

const ComplaintFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
  onRaiseComplaint,
}) => {
  return (
    <Card className="mb-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Search */}

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search complaint..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-11 pr-4 outline-none transition focus:border-indigo-600"
          />
        </div>

        {/* Status */}

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none transition focus:border-indigo-600"
        >
          <option value="">
            All Status
          </option>

          <option value="Open">
            Open
          </option>

          <option value="Assigned">
            Assigned
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Resolved">
            Resolved
          </option>
        </select>

        {/* Category */}

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none transition focus:border-indigo-600"
        >
          <option value="">
            All Categories
          </option>

          <option value="Electrical">
            Electrical
          </option>

          <option value="Plumbing">
            Plumbing
          </option>

          <option value="Security">
            Security
          </option>

          <option value="Cleaning">
            Cleaning
          </option>

          <option value="Parking">
            Parking
          </option>

          <option value="Other">
            Other
          </option>
        </select>

        {/* Raise Complaint */}

        <Button
          onClick={onRaiseComplaint}
          className="h-12 w-full"
        >
          <Plus size={18} />

          Raise Complaint
        </Button>
      </div>
    </Card>
  );
};

export default ComplaintFilters;