import {
  Eye,
  CreditCard,
} from "lucide-react";

import Table from "../../ui/Table";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

const BillTable = ({
  bills,
  onView,
  onPay,
}) => {
  const columns = [
    {
      key: "billId",
      header: "Bill ID",
    },

    {
      key: "category",
      header: "Category",
    },

    {
      key: "amount",
      header: "Amount",
      render: (row) =>
        `₹${Number(
          row.amount || 0
        ).toLocaleString()}`,
    },

    {
      key: "dueDate",
      header: "Due Date",
    },

    {
      key: "status",
      header: "Status",

      render: (row) => (
        <Badge
          variant={
            row.status === "Paid"
              ? "success"
              : "warning"
          }
        >
          {row.status}
        </Badge>
      ),
    },

    {
      key: "actions",
      header: "Actions",

      render: (row) => (
        <div className="flex items-center gap-2">

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onView(row)
            }
          >
            <Eye size={16} />
          </Button>

          {row.status ===
            "Pending" && (
            <Button
              size="sm"
              onClick={() =>
                onPay(row)
              }
            >
              <CreditCard
                size={16}
              />

              Pay
            </Button>
          )}

        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={bills}
    />
  );
};

export default BillTable;