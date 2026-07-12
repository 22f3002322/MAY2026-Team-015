import {
  Eye,
  Pencil,
  Download,
  Trash2,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Table from "../ui/Table";

const DocumentTable = ({
  documents,
  onView,
  onEdit,
  onDelete,
}) => {
  const getTypeVariant = (type) => {
    switch (type) {
      case "PDF":
        return "danger";
      case "DOCX":
        return "primary";
      case "XLSX":
        return "success";
      case "JPG":
      case "PNG":
        return "warning";
      default:
        return "secondary";
    }
  };

  const handleDownload = (row) => {
    if (row.file) {
      const url = URL.createObjectURL(
        row.file
      );

      const link =
        window.document.createElement("a");

      link.href = url;
      link.download =
        row.file.name || row.fileName;

      link.click();

      URL.revokeObjectURL(url);
    } else {
      alert("No file available.");
    }
  };

  const columns = [
    {
      key: "title",
      header: "Document",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">
            {row.title}
          </p>

          <p className="text-xs text-slate-500">
            {row.documentId}
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
      key: "type",
      header: "Type",
      render: (row) => (
        <Badge
          variant={getTypeVariant(
            row.type
          )}
        >
          {row.type}
        </Badge>
      ),
    },

    {
      key: "size",
      header: "Size",
      render: (row) =>
        row.size || "--",
    },

    {
      key: "uploadedBy",
      header: "Uploaded By",
    },

    {
      key: "uploadedAt",
      header: "Upload Date",
      render: (row) =>
        row.uploadedAt ||
        row.uploadDate,
    },

    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
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
            onClick={() =>
              handleDownload(row)
            }
          >
            <Download size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onDelete(row)
            }
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
      data={documents}
      emptyMessage="No documents found."
    />
  );
};

export default DocumentTable;