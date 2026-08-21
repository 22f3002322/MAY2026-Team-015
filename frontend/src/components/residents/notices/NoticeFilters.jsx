import { Search, RotateCcw } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { NOTICE_PRIORITY } from "../../../utils/adminMaps";

const NoticeFilters = ({
  search,
  setSearch,
  priority,
  setPriority,
  sort,
  setSort,
}) => {
  const resetFilters = () => {
    setSearch("");
    setPriority("");
    setSort("newest");
  };

  return (
    <Card className="mb-6 p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 outline-none focus:border-indigo-600 dark:border-slate-700"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
        >
          <option value="">All Priorities</option>
          {NOTICE_PRIORITY.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <Button variant="outline" onClick={resetFilters}>
            <RotateCcw size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NoticeFilters;
