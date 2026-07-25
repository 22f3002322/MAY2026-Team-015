import { Search, Plus } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const BookingFilters = ({
  search,
  setSearch,
  facility,
  setFacility,
  status,
  setStatus,
  date,
  setDate,
  onAddBooking,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

        {/* Search */}

        <Input
          label="Search"
          placeholder="Search booking..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        {/* Facility */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-700">
            Facility
          </label>

          <select
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
          >
            <option value="">All Facilities</option>
            <option>Club House</option>
            <option>Swimming Pool</option>
            <option>Gym</option>
            <option>Party Hall</option>
            <option>Tennis Court</option>
          </select>
        </div>

        {/* Status */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-700">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
          >
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* Date */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-700">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
          />
        </div>

        {/* Button */}

        <div className="flex h-full items-end">
          <Button
            className="h-14 w-full"
            onClick={onAddBooking}
          >
            <Plus size={18} />
            New Booking
          </Button>
        </div>

      </div>
    </div>
  );
};

export default BookingFilters;