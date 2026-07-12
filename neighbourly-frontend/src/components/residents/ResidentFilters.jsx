import { Search, Plus } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import { Download } from "lucide-react";

const ResidentFilters = ({
  search,
  setSearch,
  block,
  setBlock,
  occupancy,
  setOccupancy,
  onAddResident,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        <div>
  <label className="mb-2 block text-sm font-medium text-slate-700">
    Search
  </label>

  <div className="relative">
    <Search
      size={20}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
    />

    <input
      type="text"
      placeholder="Search resident..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="h-12 w-full rounded-xl border border-slate-300 pl-12 pr-4 outline-none transition focus:border-indigo-600"
    />
  </div>
</div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Block
          </label>

          <select
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
          >
            <option value="">All Blocks</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Occupancy
          </label>

          <select
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
          >
            <option value="">All</option>
            <option>Owner</option>
            <option>Tenant</option>
          </select>
        </div>

        <div className="flex gap-2 items-end pt-7">
            <Button
              variant="outline"
              className="flex-1">
              <Download size={18} />
            </Button>

            <Button
              className="flex-[2]"
              onClick={onAddResident}>
              <Plus size={18} />
              Add Resident
            </Button>
        </div>

      </div>

    </div>
  );
};

export default ResidentFilters;