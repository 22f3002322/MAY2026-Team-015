import {
  Search,
  Plus,
} from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const StaffFilters = ({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  onAddStaff,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">

      <div className="grid flex-1 gap-4 md:grid-cols-3">

        <Input
          placeholder="Search staff..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          icon={Search}
        />

        <select
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        >
          <option value="">
            All Departments
          </option>

          <option value="Security">
            Security
          </option>

          <option value="Housekeeping">
            Housekeeping
          </option>

          <option value="Maintenance">
            Maintenance
          </option>

          <option value="Gardening">
            Gardening
          </option>

          <option value="Office">
            Office
          </option>
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        >
          <option value="">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="On Leave">
            On Leave
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>

      </div>

      <Button onClick={onAddStaff}>
        <Plus
          size={18}
          className="mr-2"
        />
        Add Staff
      </Button>

    </div>
  );
};

export default StaffFilters;