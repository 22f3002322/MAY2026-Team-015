import { Search, RotateCcw } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";

const PollFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  sort,
  setSort,
}) => {
  const resetFilters = () => {
    setSearch("");
    setStatus("Active");
    setSort("newest");
  };

  return (
    <Card className="mb-6 p-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-2">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 outline-none focus:border-indigo-600 dark:border-slate-700"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>

        <div className="flex gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-slate-200 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
          >
            <option value="newest">Newest</option>
            <option value="votes">Most Votes</option>
            <option value="expiry">Expiring Soon</option>
          </select>

          <Button variant="outline" onClick={resetFilters}>
            <RotateCcw size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PollFilters;
