import { Search, RotateCcw } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

const NoticeFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
  sort,
  setSort,
}) => {
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setPriority("");
    setSort("newest");
  };

  return (
    <Card className="mb-6 p-6">
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

        {/* Search */}

        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-11 pr-4 outline-none focus:border-indigo-600"
          />
        </div>

        {/* Category */}

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
        >
          <option value="">
            All Categories
          </option>

          <option value="Maintenance">
            Maintenance
          </option>

          <option value="Meeting">
            Meeting
          </option>

          <option value="Parking">
            Parking
          </option>

          <option value="Events">
            Events
          </option>

          <option value="Security">
            Security
          </option>

          <option value="General">
            General
          </option>
        </select>

        {/* Priority */}

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
        >
          <option value="">
            All Priorities
          </option>

          <option value="High">
            High
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Low">
            Low
          </option>
        </select>

        {/* Sort */}

        <div className="flex gap-3">
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="h-12 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
          >
            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>
          </select>

          <Button
            variant="outline"
            onClick={resetFilters}
          >
            <RotateCcw size={18} />
          </Button>
        </div>

      </div>
    </Card>
  );
};

export default NoticeFilters;