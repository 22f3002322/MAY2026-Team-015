import {
  FileText,
  FileSpreadsheet,
  File,
  Printer,
  Mail,
} from "lucide-react";

import { toast } from "sonner";

import Card from "../ui/Card";
import Button from "../ui/Button";

import useReportStore from "../../store/reportStore";

const ExportReports = () => {
  const exportPDF = useReportStore(
    (state) => state.exportPDF
  );

  const exportExcel = useReportStore(
    (state) => state.exportExcel
  );

  const exportCSV = useReportStore(
    (state) => state.exportCSV
  );

  const actions = [
    {
      title: "Export PDF",
      description:
        "Download the complete analytics report as a PDF document.",
      icon: FileText,
      action: exportPDF,
    },
    {
      title: "Export Excel",
      description:
        "Download report data in Excel format for further analysis.",
      icon: FileSpreadsheet,
      action: exportExcel,
    },
    {
      title: "Export CSV",
      description:
        "Download raw report data as a CSV file.",
      icon: File,
      action: exportCSV,
    },
    {
      title: "Print Report",
      description:
        "Print the current analytics dashboard.",
      icon: Printer,
      action: () => window.print(),
    },
    {
      title: "Email Report",
      description:
        "Send the latest report to committee members.",
      icon: Mail,
      action: () => {
        toast.info(
          "Email service will be connected to the backend."
        );
        console.log("Email Report");
      },
    },
  ];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Export & Share Reports
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Export reports in multiple formats or share them directly.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Icon size={22} />
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {item.description}
              </p>

              <Button
                className="mt-5 w-full"
                onClick={item.action}
              >
                {item.title}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ExportReports;