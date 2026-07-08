import Input from "../ui/Input";
import Button from "../ui/Button";
import { Search, Plus } from "lucide-react";

const ResidentFilters = ({
  search,
  setSearch,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">

      <div className="w-full md:max-w-md">
        <Input
          label="Search Residents"
          placeholder="Search by name, flat or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />
      </div>

      <Button>
        <Plus size={18} />
        Add Resident
      </Button>

    </div>
  );
};

export default ResidentFilters;