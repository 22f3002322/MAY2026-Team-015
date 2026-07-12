import { Search, Upload } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const DocumentFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  type,
  setType,
  onUpload,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

        {/* Search */}

        <Input
          label="Search"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        {/* Category */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600"
          >
            <option value="">All Categories</option>
            <option>Legal</option>
            <option>Finance</option>
            <option>General</option>
            <option>Parking</option>
            <option>Safety</option>
            <option>Maintenance</option>
          </select>

        </div>

        {/* File Type */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            File Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600"
          >
            <option value="">All Types</option>
            <option>PDF</option>
            <option>DOCX</option>
            <option>XLSX</option>
            <option>JPG</option>
            <option>PNG</option>
          </select>

        </div>

        {/* Empty Column */}

        <div />

        {/* Upload Button */}

        <div className="flex items-end">

          <Button
            className="h-14 w-full"
            onClick={onUpload}
          >
            <Upload size={18} />

            Upload Document
          </Button>

        </div>

      </div>

    </div>
  );
};

export default DocumentFilters;