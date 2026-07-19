import { Search } from "lucide-react";

import Card from "../../ui/Card";

const BillFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
}) => {
  return (
    <Card className="mb-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Search */}

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search Bill ID, Category or Flat..."
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

          <option value="Pending">
            Pending
          </option>

          <option value="Paid">
            Paid
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

          <option value="Maintenance">
            Maintenance
          </option>

          <option value="Water">
            Water
          </option>

          <option value="Electricity">
            Electricity
          </option>

          <option value="Parking">
            Parking
          </option>

          <option value="Club House">
            Club House
          </option>

          <option value="Other">
            Other
          </option>
        </select>

      </div>
    </Card>
  );
};

export default BillFilters;