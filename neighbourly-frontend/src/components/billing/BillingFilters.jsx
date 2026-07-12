import { Search, Plus } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const BillingFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  dueDate,
  setDueDate,
  onGenerateBill,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

        <Input
          label="Search"
          placeholder="Search bill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option value="">All Categories</option>
            <option>Maintenance</option>
            <option>Water</option>
            <option>Parking</option>
            <option>Electricity</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option value="">All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Due Date
          </label>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex h-full items-end">
          <Button
            className="h-14 w-full"
            onClick={onGenerateBill}
          >
            <Plus size={18} />
            Generate Bill
          </Button>
        </div>

      </div>
    </div>
  );
};

export default BillingFilters;