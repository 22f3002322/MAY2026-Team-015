import {
  Search,
  RotateCcw,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

const DocumentFilters = ({
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
    setType("");
    setSort("newest");
  };

  return (
    <Card className="mb-6 p-6">
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-6">

        {/* Search */}

        <div className="relative xl:col-span-2">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-11 pr-4 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

        </div>

        {/* Category */}

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
        >
          <option value="">
            All Categories
          </option>

          <option value="Rules">
            Rules
          </option>

          <option value="Finance">
            Finance
          </option>

          <option value="Parking">
            Parking
          </option>

          <option value="Meetings">
            Meetings
          </option>

        </select>

        {/* File Type */}

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
          className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
        >
          <option value="">
            All Types
          </option>

          <option value="PDF">
            PDF
          </option>

          <option value="DOCX">
            DOCX
          </option>

          <option value="XLSX">
            XLSX
          </option>

          <option value="PPTX">
            PPTX
          </option>

        </select>

        {/* Sort + Reset */}

        <div className="flex gap-3 xl:col-span-2">

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="h-12 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
          >
            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

            <option value="downloads">
              Most Downloaded
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

export default DocumentFilters;