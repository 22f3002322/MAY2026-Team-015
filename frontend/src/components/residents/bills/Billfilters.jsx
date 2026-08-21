import { Search } from "lucide-react";
import Card from "../../ui/Card";

const BillFilters = ({ search, setSearch, status, setStatus }) => {
  return (
    <Card className="mb-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search Bill ID or billing month..."
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
          <option value="Pending">Pending (Unpaid)</option>
          <option value="Paid">Paid</option>
        </select>
      </div>
    </Card>
  );
};

export default BillFilters;
