import {
  Search,
  Plus,
  Download,
} from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const ApartmentFilters = ({
  search,
  setSearch,
  block,
  setBlock,
  occupancy,
  setOccupancy,
  onAddApartment,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

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
          <label className="mb-2 block text-sm font-medium">
            Block
          </label>

          <select
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option value="">All Blocks</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <label className="mb-2 block text-sm font-medium">
            Occupancy
          </label>

          <select
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option value="">All</option>
            <option>Occupied</option>
            <option>Vacant</option>
          </select>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <label className="mb-2 block opacity-0">
            Action
          </label>

          <div className="flex gap-3">

            <Button
              variant="outline"
              className="h-14 w-14 p-0"
            >
              <Download size={20} />
            </Button>

            <Button
              className="h-14 flex-1"
              onClick={onAddApartment}
            >
              <Plus size={18} />
              Add Flat
            </Button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ApartmentFilters;