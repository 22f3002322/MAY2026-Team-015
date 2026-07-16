import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Table from "../ui/Table";

const NoticeTable = ({
  notices,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: "title",
      header: "Notice",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {row.title}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {row.noticeId}
          </p>
        </div>
      ),
    },

    {
      key: "category",
      header: "Category",
      render: (row) => (
        <Badge variant="primary">
          {row.category}
        </Badge>
      ),
    },

    {
      key: "priority",
      header: "Priority",
      render: (row) => (
        <Badge
          variant={
            row.priority === "High"
              ? "danger"
              : row.priority === "Medium"
              ? "warning"
              : "success"
          }
        >
          {row.priority}
        </Badge>
      ),
    },

    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "Published"
              ? "success"
              : "secondary"
          }
        >
          {row.status}
        </Badge>
      ),
    },

    {
      key: "author",
      header: "Author",
    },

    {
      key: "publishDate",
      header: "Published",
    },

    {
      key: "expiryDate",
      header: "Expires",
    },

    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row)}
          >
            <Eye size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
          >
            <Pencil size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
          >
            <Trash2 size={16} />
          </Button>

        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={notices}
      emptyMessage="No notices found."
    />
  );
};

export default NoticeTable;