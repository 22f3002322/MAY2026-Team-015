import { Eye, Ban } from "lucide-react";

import Table from "../../ui/Table";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

const getStatusVariant = (statusValue, status) => {
  const v = String(statusValue || status || "").toLowerCase();
  if (v === "expected") return "warning";
  if (v === "arrived") return "primary";
  if (v === "denied") return "danger";
  if (v === "departed") return "success";
  return "default";
};

const VisitorTable = ({ visitors, onView, onDeny }) => {
  const columns = [
    { key: "name", header: "Visitor" },
    { key: "phone", header: "Phone" },
    { key: "purpose", header: "Purpose" },
    { key: "date", header: "Date" },
    { key: "visitTime", header: "Time" },
    {
      key: "otp",
      header: "OTP",
      render: (row) =>
        row.otpSent || row.statusValue === "expected" ? (
          <span className="text-xs text-slate-500">OTP sent</span>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={getStatusVariant(row.statusValue, row.status)}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(row)}>
            <Eye size={16} />
          </Button>
          {typeof onDeny === "function" &&
            (row.statusValue === "expected" || row.status === "Expected") && (
              <Button size="sm" variant="danger" onClick={() => onDeny(row)}>
                <Ban size={16} />
              </Button>
            )}
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={visitors} />;
};

export default VisitorTable;
