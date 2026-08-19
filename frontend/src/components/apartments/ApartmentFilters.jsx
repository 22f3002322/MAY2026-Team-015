import {
  Search,
  Plus,
} from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import { useBlockOptions } from "../../utils/useBlockOptions";

const ApartmentFilters = ({
  search,
  setSearch,
  block,
  setBlock,
  occupancy,
  setOccupancy,
  onAddApartment,
}) => {
  const blocks = useBlockOptions();

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="grid grid-cols-12 gap-5 items-end">
        <div className="col-span-12 lg:col-span-3">
          <Input
            label="Search"
            placeholder="Search flat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Block
          </label>
          <select
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All Blocks</option>
            {blocks.map((b) => (
              <option key={b.block_id} value={b.block_name}>
                {b.block_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Occupancy
          </label>
          <select
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All</option>
            <option value="Occupied">Occupied</option>
            <option value="Vacant">Vacant</option>
          </select>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <label className="mb-2 block opacity-0">Action</label>
          {typeof onAddApartment === "function" && (
            <Button className="h-14 w-full" onClick={onAddApartment}>
              <Plus size={18} />
              Add Flat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApartmentFilters;
