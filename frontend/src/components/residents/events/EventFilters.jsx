import {
  Search,
  RotateCcw,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

const EventFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  type,
  setType,
  sort,
  setSort,
}) => {
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setType("all");
    setSort("upcoming");
  };

  return (
    <Card className="mb-6 p-6">
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">

        {/* Search */}

        <div className="relative xl:col-span-2">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search events..."
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

          <option value="Festival">
            Festival
          </option>

          <option value="Health">
            Health
          </option>

          <option value="Sports">
            Sports
          </option>

          <option value="Social">
            Social
          </option>

          <option value="Workshop">
            Workshop
          </option>

        </select>

        {/* Event Type */}

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
        >
          <option value="all">
            All Events
          </option>

          <option value="upcoming">
            Upcoming
          </option>

          <option value="past">
            Past
          </option>

        </select>

        {/* Sort + Reset */}

        <div className="flex gap-3">

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="h-12 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-4 outline-none focus:border-indigo-600"
          >
            <option value="upcoming">
              Nearest First
            </option>

            <option value="latest">
              Latest First
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

export default EventFilters;