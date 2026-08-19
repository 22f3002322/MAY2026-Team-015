import { Search, Plus } from "lucide-react";

import Button from "../ui/Button";
import { useBlockOptions } from "../../utils/useBlockOptions";
import { OCCUPANCY_UI_OPTIONS } from "../../utils/adminMaps";

const ResidentFilters = ({
  search,
  setSearch,
  block,
  setBlock,
  occupancy,
  setOccupancy,
  onAddResident,
}) => {
  const blocks = useBlockOptions();

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-12 pr-4 outline-none transition focus:border-indigo-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Block
          </label>
          <select
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 outline-none focus:border-indigo-600"
          >
            <option value="">All Blocks</option>
            {blocks.map((b) => (
              <option key={b.block_id} value={b.block_name}>
                {b.block_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Occupancy
          </label>
          <select
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 outline-none focus:border-indigo-600"
          >
            <option value="">All</option>
            {OCCUPANCY_UI_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-end pt-7">
          {typeof onAddResident === "function" && (
            <Button className="w-full" onClick={onAddResident}>
              <Plus size={18} />
              Add Resident
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentFilters;
