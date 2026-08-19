import { Search } from "lucide-react";
import { useEffect } from "react";

import Input from "../ui/Input";
import useBookingStore from "../../store/bookingStore";
import { BOOKING_STATUS } from "../../utils/adminMaps";

const BookingFilters = ({
  search,
  setSearch,
  facility,
  setFacility,
  status,
  setStatus,
  date,
  setDate,
}) => {
  const facilities = useBookingStore((s) => s.facilities);
  const fetchFacilities = useBookingStore((s) => s.fetchFacilities);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          placeholder="Search booking..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Facility
          </label>
          <select
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4"
          >
            <option value="">All Facilities</option>
            {facilities.map((f) => (
              <option key={f.facility_id} value={f.facility_name}>
                {f.facility_name}
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
            {BOOKING_STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;
