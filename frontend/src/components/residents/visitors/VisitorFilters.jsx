import { Search, Plus } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

const VisitorFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  purpose,
  setPurpose,
  onAddVisitor,
}) => {
  return (
    <Card className="mb-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search visitor..."
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
          <option value="expected">Expected</option>
          <option value="arrived">Arrived</option>
          <option value="denied">Denied</option>
        </select>

        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="h-12 rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600 dark:border-slate-700"
        >
          <option value="">All Purposes</option>
          <option value="Family">Family</option>
          <option value="Friends">Friends</option>
          <option value="Delivery">Delivery</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Guest">Guest</option>
          <option value="Other">Other</option>
        </select>

        <Button className="h-12 w-full" onClick={onAddVisitor}>
          <Plus size={18} />
          Add Visitor
        </Button>
      </div>
    </Card>
  );
};

export default VisitorFilters;
