import {
  Search,
  RotateCcw,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

const FacilityFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  sort,
  setSort,
}) => {
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setSort("newest");
  };

  return (
    <Card className="mb-6 p-6">
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

        {/* Search */}

        <div className="relative lg:col-span-2">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search facility..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-11 pr-4 outline-none focus:border-indigo-600"
          />

        </div>

        {/* Status */}

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
        >
          <option value="">
            All Status
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Rejected">
            Rejected
          </option>

        </select>

        {/* Sort + Reset */}

        <div className="flex gap-3">

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="h-12 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
          >
            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

          </select>

          <Button
            variant="outline"
            onClick={resetFilters}
          >
            <RotateCcw size={18} />
          </Button>

        </div>

      </div>
    </Card>
  );
};

export default FacilityFilters;