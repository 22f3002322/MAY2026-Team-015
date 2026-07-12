import {
  RotateCcw,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";

import useReportStore from "../../store/reportStore";

const currentYear = new Date().getFullYear();

const ReportFilters = () => {
  const filters = useReportStore(
    (state) => state.filters
  );

  const updateFilters = useReportStore(
    (state) => state.updateFilters
  );

  const resetFilters = useReportStore(
    (state) => state.resetFilters
  );

  const exportPDF = useReportStore(
    (state) => state.exportPDF
  );

  const exportExcel = useReportStore(
    (state) => state.exportExcel
  );

  const handleChange = (field, value) => {
    updateFilters({
      [field]: value,
    });
  };

  return (
    <Card className="mb-6 p-6">
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {/* From Date */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            From
          </label>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              handleChange(
                "fromDate",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          />
        </div>

        {/* To Date */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            To
          </label>

          <input
            type="date"
            value={filters.toDate}
            min={filters.fromDate}
            onChange={(e) =>
              handleChange(
                "toDate",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          />
        </div>

        {/* Month */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Month
          </label>

          <select
            value={filters.month}
            onChange={(e) =>
              handleChange(
                "month",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option value="">All Months</option>

            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>
        </div>

        {/* Year */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Year
          </label>

          <select
            value={filters.year}
            onChange={(e) =>
              handleChange(
                "year",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}

        <div className="flex items-end">
          <Button
            variant="outline"
            className="h-14 w-full"
            onClick={resetFilters}
          >
            <RotateCcw size={18} />
            Reset
          </Button>
        </div>

        {/* Export */}

        <div className="flex items-end gap-3">
          <Button
            className="h-14 flex-1"
            onClick={exportPDF}
          >
            <FileText size={18} />
          </Button>

          <Button
            variant="outline"
            className="h-14 flex-1"
            onClick={exportExcel}
          >
            <FileSpreadsheet size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;